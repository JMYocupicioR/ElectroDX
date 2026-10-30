import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  FileQuestion,
  Layers,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import { sb } from '../../lib/supabase';
import { getTopicPublicUrl } from '../../utils/adminUtils';
import { getSyllabusTopicOverrides, getWorkshops } from '../../services/courseService';
import {
  DEFAULT_ACADEMIC_MILESTONES,
  getAcademicMilestones,
} from '../../services/academicScheduleService';
import {
  listTopicTeachingCommitments,
  proposeTopicCommitments,
  withdrawTopicCommitment,
} from '../../services/topicTeachingService';
import { CreateLiveClassModal } from './CreateLiveClassModal';
import type { Topic } from '../../types/content';
import type { AcademicMilestone } from '../../types/academicGradebook';
import type { SyllabusTopicOverride, TopicTeachingCommitment, LiveWorkshop } from '../../types/database';
import {
  ADOPT_SCOPE_CONFIRM_AT,
  assignedCoverageNodes,
  buildTopicCoverage,
  collectAdoptTopicIds,
  nodesWithoutTeacher,
  type TopicCoverageNode,
} from '../../utils/topicCoverage';
import { isTopicVisible } from '../../utils/syllabusTree';

export interface TopicAdoptionSummary {
  myTopicsCount: number;
  myConfirmedCount: number;
  myProposedCount: number;
  freeCount: number;
  proposalsCount: number;
  assignedCount: number;
}

function indexVisibleBlocks(overrides: SyllabusTopicOverride[]): Map<string, Map<string, string[]>> {
  const map = new Map<string, Map<string, string[]>>();
  const walk = (moduleId: string, topics: Topic[], into: Map<string, string[]>, roots: Topic[]) => {
    for (const topic of topics) {
      if (!isTopicVisible(overrides, moduleId, topic.id)) continue;
      into.set(topic.id, collectAdoptTopicIds(roots, topic.id, moduleId, overrides, true));
      if (topic.children?.length) walk(moduleId, topic.children, into, roots);
    }
  };
  for (const mod of allModules) {
    const into = new Map<string, string[]>();
    walk(mod.id, mod.topics, into, mod.topics);
    map.set(mod.id, into);
  }
  return map;
}

type ScopePrompt = {
  kind: 'adopt' | 'withdraw';
  moduleId: string;
  heading: string;
  detail: string;
  items: string[];
  confirmLabel: string;
  previewIds: string[];
  busyKey: string;
  topicIds: string[];
  commitmentIds: string[];
};




function formatWorkshopDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function teacherLabel(row: TopicTeachingCommitment): string {
  return row.teacher_name?.trim() || 'Profesor';
}

export function TopicAdoptionInbox({
  onChanged,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onSummaryChange,
  onOpenQuizEditor,
}: {
  onChanged?: () => void | Promise<void>;
  isOpen?: boolean;
  onToggle?: () => void;
  onSummaryChange?: (summary: TopicAdoptionSummary) => void;
  onOpenQuizEditor?: (topicId: string, moduleId?: string) => void;
}) {
  const { user, isAdmin, isEditor } = useAuth();
  const canAdopt = isAdmin || isEditor;
  const userId = user?.id ?? null;

  const [overrides, setOverrides] = useState<SyllabusTopicOverride[]>([]);
  const [commitments, setCommitments] = useState<TopicTeachingCommitment[]>([]);
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [, setMilestones] = useState<AcademicMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [hoverPreview, setHoverPreview] = useState<{ moduleId: string; ids: string[] } | null>(null);
  const [scopePrompt, setScopePrompt] = useState<ScopePrompt | null>(null);

  // Outer collapsible state: collapsed by default
  const [internalOpen, setInternalOpen] = useState(false);
  const isOuterOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const toggleOuter = controlledOnToggle ?? (() => setInternalOpen((prev) => !prev));

  // Inner subsections: all collapsed by default
  const [subsectionsOpen, setSubsectionsOpen] = useState<{
    mine: boolean;
    free: boolean;
    assigned: boolean;
  }>({
    mine: false,
    free: false,
    assigned: false,
  });
  const [planningTopic, setPlanningTopic] = useState<{
    moduleId: string;
    topicId: string;
    title: string;
  } | null>(null);
  const [planningMultiTopics, setPlanningMultiTopics] = useState<{
    moduleId: string;
    topicIds: string[];
  } | null>(null);
  const [isClassDrawerOpen, setIsClassDrawerOpen] = useState(false);
  const [freeTopicSearch, setFreeTopicSearch] = useState('');
  const [selectedPedagogicalModuleId, setSelectedPedagogicalModuleId] = useState<string>(
    allModules[0]?.id || 'fundamentals'
  );
  const [isPedagogicalSelectorOpen, setIsPedagogicalSelectorOpen] = useState(true);
  const [pedagogicalFilter, setPedagogicalFilter] = useState<'all' | 'pending' | 'mine' | 'collab'>('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overrideRows, commitmentRows, milestoneRows, workshopRows] = await Promise.all([
        getSyllabusTopicOverrides().catch(() => []),
        listTopicTeachingCommitments(),
        getAcademicMilestones().catch(() => []),
        getWorkshops().catch(() => [] as LiveWorkshop[]),
      ]);
      setOverrides(overrideRows);
      setCommitments(commitmentRows);
      setMilestones(milestoneRows.length ? milestoneRows : DEFAULT_ACADEMIC_MILESTONES);
      setWorkshops(workshopRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los temas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const coverage = useMemo(
    () => buildTopicCoverage(allModules, overrides, commitments),
    [overrides, commitments]
  );
  const blocksByModule = useMemo(() => indexVisibleBlocks(overrides), [overrides]);
  const coverageByKey = useMemo(() => {
    const map = new Map<string, TopicCoverageNode<TopicTeachingCommitment>>();
    for (const node of coverage) map.set(`${node.moduleId}:${node.topicId}`, node);
    return map;
  }, [coverage]);
  const withoutTeacher = useMemo(() => nodesWithoutTeacher(coverage), [coverage]);
  const assigned = useMemo(() => assignedCoverageNodes(coverage), [coverage]);
  const proposals = useMemo(
    () => commitments.filter((row) => row.status === 'proposed'),
    [commitments]
  );
  const mine = useMemo(
    () => commitments.filter((row) => row.teacher_id === userId),
    [commitments, userId]
  );

  useEffect(() => {
    if (loading) return;
    onSummaryChange?.({
      myTopicsCount: mine.length,
      myConfirmedCount: mine.filter((r) => r.status === 'confirmed').length,
      myProposedCount: mine.filter((r) => r.status === 'proposed').length,
      freeCount: withoutTeacher.length,
      proposalsCount: proposals.length,
      assignedCount: assigned.length,
    });
  }, [loading, mine, withoutTeacher, proposals, assigned, onSummaryChange]);

  const unassignedByModule = useMemo(() => {
    const groups = new Map<string, TopicCoverageNode<TopicTeachingCommitment>[]>();
    for (const node of withoutTeacher) {
      const list = groups.get(node.moduleId) ?? [];
      list.push(node);
      groups.set(node.moduleId, list);
    }
    return allModules
      .map((mod) => ({
        moduleId: mod.id,
        moduleTitle: mod.title,
        nodes: groups.get(mod.id) ?? [],
      }))
      .filter((group) => group.nodes.length > 0);
  }, [withoutTeacher]);

  const titleForTopic = (topicId: string, moduleId: string) =>
    coverageByKey.get(`${moduleId}:${topicId}`)?.topicTitle || topicId;

  const pathForTopic = (topicId: string, moduleId: string) => {
    const node = coverageByKey.get(`${moduleId}:${topicId}`);
    if (!node) return topicId;
    return node.pathTitles.slice(1).join(' / ');
  };

  const holdsTopic = (topicId: string) =>
    commitments.some(
      (row) => row.topic_id === topicId && row.teacher_id === userId && row.status !== 'withdrawn'
    );

  const isClosedTopic = (moduleId: string, topicId: string) => {
    const node = coverageByKey.get(`${moduleId}:${topicId}`);
    return !node || node.coverage === 'assigned' || node.coverage === 'shared';
  };

  const blockIdsFor = (moduleId: string, topicId: string) =>
    blocksByModule.get(moduleId)?.get(topicId) ?? [];

  const pendingIdsFor = (moduleId: string, topicId: string) =>
    blockIdsFor(moduleId, topicId).filter((id) => !isClosedTopic(moduleId, id) && !holdsTopic(id));

  const activePreview = scopePrompt
    ? { moduleId: scopePrompt.moduleId, ids: scopePrompt.previewIds }
    : hoverPreview;

  const showPreview = (moduleId: string, ids: string[]) => setHoverPreview({ moduleId, ids });
  const clearPreview = () => setHoverPreview(null);
  const endPreview = (event: { pointerType: string }) => {
    if (event.pointerType === 'touch') return;
    setHoverPreview(null);
  };

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusyKey(key);
    setError(null);
    try {
      await action();
      await load();
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    } finally {
      setBusyKey(null);
    }
  };

  const proposeIds = (moduleId: string, topicIds: string[], key: string) => {
    if (!topicIds.length) {
      setError('Ese tema no está visible en el temario.');
      return;
    }
    void runAction(key, async () => {
      const rows = await proposeTopicCommitments(topicIds, moduleId);
      if (!rows.length) throw new Error('Ya tienes esos temas confirmados.');
      setScopePrompt(null);
    });
  };

  const withdrawIds = (commitmentIds: string[], key: string) => {
    if (!commitmentIds.length) return;
    void runAction(key, async () => {
      for (const id of commitmentIds) await withdrawTopicCommitment(id);
      setScopePrompt(null);
    });
  };

  const askScope = (prompt: ScopePrompt, force: boolean) => {
    const count = prompt.kind === 'adopt' ? prompt.topicIds.length : prompt.commitmentIds.length;
    if (force || count >= ADOPT_SCOPE_CONFIRM_AT) {
      setError(null);
      setHoverPreview(null);
      setScopePrompt(prompt);
      return;
    }
    if (prompt.kind === 'adopt') proposeIds(prompt.moduleId, prompt.topicIds, prompt.busyKey);
    else withdrawIds(prompt.commitmentIds, prompt.busyKey);
  };

  const handleAdopt = (node: TopicCoverageNode<TopicTeachingCommitment>) => {
    proposeIds(node.moduleId, [node.topicId], `adopt-${node.topicId}`);
  };

  const handleAdoptBlock = (node: TopicCoverageNode<TopicTeachingCommitment>, topicIds: string[]) => {
    const subtopics = topicIds.filter((id) => id !== node.topicId).length;
    askScope(
      {
        kind: 'adopt',
        moduleId: node.moduleId,
        heading: holdsTopic(node.topicId)
          ? `Completar «${node.topicTitle}»`
          : `Adoptar «${node.topicTitle}» con sus subtemas`,
        detail:
          'Se proponen estos temas. Si alguno ya era tuyo, se queda igual. No entran los ocultos ni los que ya tienen profesor confirmado.',
        items: topicIds.map((id) => pathForTopic(id, node.moduleId)),
        confirmLabel: `Proponer ${topicIds.length} ${topicIds.length === 1 ? 'tema' : 'temas'}`,
        previewIds: topicIds,
        busyKey: `adopt-block-${node.topicId}`,
        topicIds,
        commitmentIds: [],
      },
      subtopics >= ADOPT_SCOPE_CONFIRM_AT
    );
  };

  const handleJoin = (node: TopicCoverageNode<TopicTeachingCommitment>) => {
    void runAction(`join-${node.topicId}`, async () => {
      const rows = await proposeTopicCommitments([node.topicId], node.moduleId);
      if (!rows.length) throw new Error('Ya formas parte de ese tema.');
    });
  };


  const handleOpenFreeTopics = () => {
    setSubsectionsOpen((prev) => ({ ...prev, free: true }));
    const autoOpen: Record<string, boolean> = {};
    unassignedByModule.slice(0, 4).forEach((g) => {
      autoOpen[g.moduleId] = true;
    });
    setOpenModules((prev) => ({ ...prev, ...autoOpen }));
  };


  const searchResultsFreeTopics = useMemo(() => {
    const q = freeTopicSearch.trim().toLowerCase();
    if (!q) return [];
    return withoutTeacher
      .filter((n) => {
        const s = `${n.topicTitle} ${n.topicId} ${n.pathTitles.join(' ')}`.toLowerCase();
        return s.includes(q);
      })
      .slice(0, 25);
  }, [withoutTeacher, freeTopicSearch]);

  // ── Secuencia Pedagógica Curricular para Selección Docente en Bandeja ──
  const currentPedagogicalModule = useMemo(() => {
    return allModules.find((m) => m.id === selectedPedagogicalModuleId) || allModules[0];
  }, [selectedPedagogicalModuleId]);

  const currentPedagogicalModIndex = useMemo(() => {
    return allModules.findIndex((m) => m.id === currentPedagogicalModule.id);
  }, [currentPedagogicalModule]);

  const nextPedagogicalModule = useMemo(() => {
    return currentPedagogicalModIndex >= 0 && currentPedagogicalModIndex < allModules.length - 1
      ? allModules[currentPedagogicalModIndex + 1]
      : null;
  }, [currentPedagogicalModIndex]);


  const currentPedagogicalSections = useMemo(() => {
    const extractSubs = (
      top: Topic,
      secTitle: string,
      secId: string
    ): {
      id: string;
      title: string;
      sectionTitle: string;
      sectionId: string;
      description?: string;
      isAdoptedByMe: boolean;
      otherTeachers: { id: string; name: string; status: string }[];
      allTeachers: { id: string; name: string; isMe: boolean; status: string }[];
      linkedWorkshop: LiveWorkshop | null;
      isCollabOpen: boolean;
      isSharedWithMe: boolean;
      isFree: boolean;
      isClosed: boolean;
    }[] => {
      const myCommitment = commitments.find(
        (c) => c.topic_id === top.id && c.teacher_id === userId && c.status !== 'withdrawn'
      );
      const isAdoptedByMe = Boolean(myCommitment);
      const subCommitments = commitments.filter(
        (c) => c.topic_id === top.id && c.status !== 'withdrawn'
      );
      const otherTeachers = subCommitments
        .filter((c) => c.teacher_id !== userId)
        .map((c) => ({
          id: c.teacher_id,
          name: c.teacher_name?.trim() || 'Colega docente',
          status: c.status,
        }));
      const allTeachers = subCommitments.map((c) => {
        const isMe = c.teacher_id === userId;
        const name = isMe
          ? (user?.user_metadata?.full_name || c.teacher_name?.trim() || 'Tú')
          : (c.teacher_name?.trim() || 'Profesor');
        return { id: c.teacher_id, name, isMe, status: c.status };
      });
      const subWorkshop = workshops.find((w) => {
        if (w.status === 'cancelled') return false;
        const hasCommitmentWs = subCommitments.some((c) => c.workshop_id === w.id);
        if (hasCommitmentWs) return true;
        return w.topic_id === top.id;
      }) || null;

      const isCollabOpen = !isAdoptedByMe && otherTeachers.length > 0;
      const isSharedWithMe = isAdoptedByMe && otherTeachers.length > 0;
      const isFree = !isAdoptedByMe && otherTeachers.length === 0;

      if (!top.children || top.children.length === 0) {
        return [
          {
            id: top.id,
            title: top.title,
            sectionTitle: secTitle,
            sectionId: secId,
            description: top.description,
            isAdoptedByMe,
            otherTeachers,
            allTeachers,
            linkedWorkshop: subWorkshop,
            isCollabOpen,
            isSharedWithMe,
            isFree,
            isClosed: isClosedTopic(currentPedagogicalModule.id, top.id),
          },
        ];
      }
      const list: {
        id: string;
        title: string;
        sectionTitle: string;
        sectionId: string;
        description?: string;
        isAdoptedByMe: boolean;
        otherTeachers: { id: string; name: string; status: string }[];
        allTeachers: { id: string; name: string; isMe: boolean; status: string }[];
        linkedWorkshop: LiveWorkshop | null;
        isCollabOpen: boolean;
        isSharedWithMe: boolean;
        isFree: boolean;
        isClosed: boolean;
      }[] = [];
      for (const ch of top.children) {
        list.push(...extractSubs(ch, secTitle, secId));
      }
      return list;
    };

    return currentPedagogicalModule.topics.map((sec, secIdx) => {
      const subtopics = extractSubs(sec, sec.title, sec.id);
      const allSubtopicIds = subtopics.map((s) => s.id);
      const allSectionTopicIds = [sec.id, ...allSubtopicIds];
      const adoptedCount = subtopics.filter((s) => s.isAdoptedByMe).length;
      const freeCount = subtopics.filter((s) => s.isFree).length;
      const collabCount = subtopics.filter((s) => s.isCollabOpen).length;
      const isSectionComplete = allSubtopicIds.length > 0 && adoptedCount === allSubtopicIds.length;
      const isSectionAdoptedByMe = holdsTopic(sec.id) || (allSubtopicIds.length > 0 && adoptedCount === allSubtopicIds.length);

      // Compromisos para este Tema (padre o cualquiera de sus subtemas)
      const secCommitments = commitments.filter(
        (c) => allSectionTopicIds.includes(c.topic_id) && c.status !== 'withdrawn'
      );

      // Profesores únicos del Tema completo
      const sectionTeachers = Array.from(
        new Map(
          secCommitments.map((c) => {
            const isMe = c.teacher_id === userId;
            const name = isMe
              ? (user?.user_metadata?.full_name || c.teacher_name?.trim() || 'Tú')
              : (c.teacher_name?.trim() || 'Profesor');
            return [c.teacher_id, { id: c.teacher_id, name, isMe, status: c.status }];
          })
        ).values()
      );

      // Taller / Clase en vivo asociada al Tema o sus subtemas
      const linkedWorkshop = workshops.find((w) => {
        if (w.status === 'cancelled') return false;
        const hasCommitmentWs = secCommitments.some((c) => c.workshop_id === w.id);
        if (hasCommitmentWs) return true;
        if (w.topic_id === sec.id || allSubtopicIds.includes(w.topic_id || '')) return true;
        return false;
      }) || null;

      return {
        sectionIndex: secIdx,
        sectionId: sec.id,
        sectionTitle: sec.title,
        description: sec.description,
        subtopics,
        allSubtopicIds,
        allSectionTopicIds,
        adoptedCount,
        freeCount,
        collabCount,
        isSectionComplete,
        isSectionAdoptedByMe,
        sectionTeachers,
        linkedWorkshop,
      };
    });
  }, [currentPedagogicalModule, commitments, workshops, userId, user]);

  const currentModuleAllSubtopicIds = useMemo(() => {
    return currentPedagogicalSections.flatMap((s) => s.allSubtopicIds);
  }, [currentPedagogicalSections]);

  const currentModuleAdoptedCount = useMemo(() => {
    return currentModuleAllSubtopicIds.filter((id) => holdsTopic(id)).length;
  }, [currentModuleAllSubtopicIds, commitments, userId]);

  const currentModuleFreeCount = useMemo(() => {
    return currentPedagogicalSections.reduce((acc, s) => acc + s.freeCount, 0);
  }, [currentPedagogicalSections]);

  const currentModuleCollabCount = useMemo(() => {
    return currentPedagogicalSections.reduce((acc, s) => acc + s.collabCount, 0);
  }, [currentPedagogicalSections]);

  const isCurrentModuleComplete =
    currentModuleAllSubtopicIds.length > 0 &&
    currentModuleAdoptedCount === currentModuleAllSubtopicIds.length;

  const pedagogicalModuleProgressionStats = useMemo(() => {
    return allModules.map((m, idx) => {
      const subtopicIds: string[] = [];
      const extractLeafIds = (t: Topic) => {
        if (t.children && t.children.length > 0) {
          for (const c of t.children) extractLeafIds(c);
        } else {
          subtopicIds.push(t.id);
        }
      };
      for (const t of m.topics) {
        extractLeafIds(t);
      }
      const adopted = subtopicIds.filter((id) => holdsTopic(id)).length;
      const total = subtopicIds.length;
      const isComplete = total > 0 && adopted === total;
      return {
        module: m,
        index: idx,
        total,
        adopted,
        isComplete,
        hasSome: adopted > 0 && !isComplete,
        isActive: m.id === currentPedagogicalModule.id,
      };
    });
  }, [commitments, userId, currentPedagogicalModule.id]);

  const handleTogglePedagogicalSubtopic = (
    topicId: string,
    moduleId: string,
    existingWorkshopId?: string | null
  ) => {
    if (holdsTopic(topicId)) {
      const myCommitment = commitments.find(
        (c) => c.topic_id === topicId && c.teacher_id === userId && c.status !== 'withdrawn'
      );
      if (myCommitment) {
        withdrawIds([myCommitment.id], `withdraw-${topicId}`);
      }
    } else {
      void runAction(`adopt-${topicId}`, async () => {
        await proposeTopicCommitments([topicId], moduleId);
        if (existingWorkshopId && userId) {
          try {
            await sb
              .from('topic_teaching_commitments')
              .update({ workshop_id: existingWorkshopId, status: 'confirmed' })
              .eq('teacher_id', userId)
              .eq('topic_id', topicId);
            await sb
              .from('workshop_instructors')
              .upsert(
                { workshop_id: existingWorkshopId, teacher_id: userId },
                { onConflict: 'workshop_id,teacher_id' }
              );
          } catch (e) {
            console.warn('[TopicAdoptionInbox] No se pudo vincular instructor al workshop:', e);
          }
        }
      });
    }
  };

  const handleAdoptAllCurrentModule = () => {
    const unadopted = currentModuleAllSubtopicIds.filter(
      (id) => !holdsTopic(id) && !isClosedTopic(currentPedagogicalModule.id, id)
    );
    if (unadopted.length > 0) {
      proposeIds(currentPedagogicalModule.id, unadopted, `adopt-module-${currentPedagogicalModule.id}`);
    }
  };

  const handleWithdrawAllCurrentModule = () => {
    const myCommitmentIds = commitments
      .filter(
        (c) =>
          c.module_id === currentPedagogicalModule.id &&
          currentModuleAllSubtopicIds.includes(c.topic_id) &&
          c.teacher_id === userId &&
          c.status !== 'withdrawn'
      )
      .map((c) => c.id);
    if (myCommitmentIds.length > 0) {
      withdrawIds(myCommitmentIds, `withdraw-module-${currentPedagogicalModule.id}`);
    }
  };

  const handleTogglePedagogicalSection = (
    sectionId: string,
    sectionSubtopicIds: string[],
    existingWorkshopId?: string | null
  ) => {
    const allIds = [sectionId, ...sectionSubtopicIds];
    const allAdopted = allIds.every((id) => holdsTopic(id));
    if (allAdopted) {
      const myCommitmentIds = commitments
        .filter(
          (c) =>
            c.module_id === currentPedagogicalModule.id &&
            allIds.includes(c.topic_id) &&
            c.teacher_id === userId &&
            c.status !== 'withdrawn'
        )
        .map((c) => c.id);
      if (myCommitmentIds.length > 0) {
        withdrawIds(myCommitmentIds, `withdraw-sec-${currentPedagogicalModule.id}-${sectionId}`);
      }
    } else {
      const toAdopt = allIds.filter(
        (id) => !holdsTopic(id) && !isClosedTopic(currentPedagogicalModule.id, id)
      );
      if (toAdopt.length > 0) {
        void runAction(`adopt-sec-${sectionId}`, async () => {
          await proposeTopicCommitments(toAdopt, currentPedagogicalModule.id);
          if (existingWorkshopId && userId) {
            try {
              await sb
                .from('topic_teaching_commitments')
                .update({ workshop_id: existingWorkshopId, status: 'confirmed' })
                .eq('teacher_id', userId)
                .in('topic_id', toAdopt);
              await sb
                .from('workshop_instructors')
                .upsert(
                  { workshop_id: existingWorkshopId, teacher_id: userId },
                  { onConflict: 'workshop_id,teacher_id' }
                );
            } catch (e) {
              console.warn('[TopicAdoptionInbox] No se pudo vincular instructor al workshop:', e);
            }
          }
        });
      }
    }
  };

  const handleAdvanceToNextPedagogicalModule = () => {
    if (nextPedagogicalModule) {
      setSelectedPedagogicalModuleId(nextPedagogicalModule.id);
    }
  };

  const renderPedagogicalModuleSelector = () => (
    <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/20 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* ── Cabecera del Selector Pedagógico ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                📋 Temas Pendientes por Seleccionar para tus Clases
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  currentModuleAdoptedCount > 0
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {currentModuleAdoptedCount > 0
                  ? `• ${currentModuleAdoptedCount} de este módulo en Mis Temas`
                  : `0 de este módulo adoptados`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentModuleAdoptedCount === 0
                ? 'Aún no tienes temas adoptados. Elige con 1 clic los temas que deseas impartir en tus clases:'
                : 'Elige con 1 clic los temas que deseas impartir en tus clases siguiendo el orden pedagógico curricular:'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const myIdsInMod = currentModuleAllSubtopicIds.filter((id) => holdsTopic(id));
              setPlanningMultiTopics({
                moduleId: currentPedagogicalModule.id,
                topicIds: myIdsInMod.length > 0 ? myIdsInMod : currentModuleAllSubtopicIds.slice(0, 4),
              });
              setIsClassDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            title="Abrir el panel para crear la clase en vivo con los temas de este módulo"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Planear clase con este módulo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPedagogicalSelectorOpen((prev) => !prev)}
            className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label={isPedagogicalSelectorOpen ? 'Ocultar selector' : 'Mostrar selector'}
            title={isPedagogicalSelectorOpen ? 'Ocultar selector' : 'Mostrar selector'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isPedagogicalSelectorOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {isPedagogicalSelectorOpen && (
        <div className="space-y-4 pt-1">
          {/* ── Stepper Secuencial de Módulos (En Orden Curricular) ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                🧭 Orden Pedagógico por Módulos:
              </span>
              <span className="text-slate-400 font-semibold">
                Módulo {currentPedagogicalModule.number} de {allModules.length} ({currentPedagogicalModule.title.split(':')[0]})
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {pedagogicalModuleProgressionStats.map((stat) => (
                <button
                  key={stat.module.id}
                  type="button"
                  onClick={() => setSelectedPedagogicalModuleId(stat.module.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    stat.isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                      : stat.isComplete
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400'
                      : stat.hasSome
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{stat.module.emoji || '📘'}</span>
                  <span>
                    M{stat.module.number}: {stat.module.title.split(':')[0].replace(/Fundamentos.*/, 'Fundamentos').replace(/Conducción.*/, 'Neuroconducción').replace(/Electromiografía.*/, 'EMG Aguja').slice(0, 16)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      stat.isActive
                        ? 'bg-white/20 text-white'
                        : stat.isComplete
                        ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                        : stat.hasSome
                        ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stat.isComplete ? `✓ ${stat.total}` : `${stat.adopted}/${stat.total}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Tarjeta del Módulo Activo ── */}
          <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-white/90 dark:bg-slate-900/90 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl shrink-0">{currentPedagogicalModule.emoji || '📘'}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    MÓDULO {currentPedagogicalModule.number}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentPedagogicalModule.title}
                  </h4>
                </div>
                {currentPedagogicalModule.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {currentPedagogicalModule.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {isCurrentModuleComplete ? (
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={handleWithdrawAllCurrentModule}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Desmarcar módulo completo ({currentModuleAllSubtopicIds.length})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={handleAdoptAllCurrentModule}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transform hover:scale-[1.01]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Seleccionar todos los subtemas de este módulo ({currentModuleAllSubtopicIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Progreso del Módulo */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">Progreso en este módulo:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentModuleAdoptedCount} de {currentModuleAllSubtopicIds.length} subtemas (
                  {Math.round((currentModuleAdoptedCount / Math.max(1, currentModuleAllSubtopicIds.length)) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isCurrentModuleComplete
                      ? 'bg-emerald-500'
                      : currentModuleAdoptedCount > 0
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                      : 'bg-transparent'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((currentModuleAdoptedCount / Math.max(1, currentModuleAllSubtopicIds.length)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* ── Barra de Guía Visual & Filtros Rápidos para el Médico ── */}
            <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
              {/* Leyenda Visual Interactiva */}
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                <span className="font-bold text-slate-500 dark:text-slate-400">Guía visual:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs">
                  <Check className="w-3 h-3 text-emerald-500" />
                  En tus clases (minimizado)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold shadow-2xs">
                  <Plus className="w-3 h-3 text-indigo-500" />
                  Pendiente / Libre (para elegir)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold shadow-2xs">
                  <Users className="w-3 h-3 text-amber-500" />
                  Con colega (clic para co-docencia)
                </span>
              </div>

              {/* Filtro Rápido de Vista */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPedagogicalFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    pedagogicalFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos ({currentModuleAllSubtopicIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPedagogicalFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    pedagogicalFilter === 'pending'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Pendientes ({currentModuleFreeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPedagogicalFilter('mine')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    pedagogicalFilter === 'mine'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Míos ({currentModuleAdoptedCount})
                </button>
                {currentModuleCollabCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPedagogicalFilter('collab')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      pedagogicalFilter === 'collab'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Colaborables ({currentModuleCollabCount})
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Temas y Subtemas Curriculares */}
            <div className="space-y-4 pt-1">
              {currentPedagogicalSections.map((sec) => {
                const filteredPendingAndCollab = sec.subtopics.filter((sub) => {
                  if (sub.isAdoptedByMe) return false;
                  if (pedagogicalFilter === 'pending') return sub.isFree;
                  if (pedagogicalFilter === 'collab') return sub.isCollabOpen;
                  if (pedagogicalFilter === 'mine') return false;
                  return true;
                });

                const filteredMyAdopted = sec.subtopics.filter((sub) => {
                  if (!sub.isAdoptedByMe) return false;
                  if (pedagogicalFilter === 'pending') return false;
                  if (pedagogicalFilter === 'collab') return sub.isSharedWithMe;
                  return true;
                });

                const hasVisibleItems = filteredPendingAndCollab.length > 0 || filteredMyAdopted.length > 0;
                if (!hasVisibleItems && pedagogicalFilter !== 'all') return null;

                const isTemaAdoptedByMe = sec.isSectionAdoptedByMe;
                const hasColleaguesOnTema = sec.sectionTeachers.some((t) => !t.isMe);

                return (
                  <div
                    key={sec.sectionId}
                    className="p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-3.5 shadow-xs transition-all"
                  >
                    {/* ── Encabezado Principal del TEMA con Selector y Ficha de Clase ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            TEMA {sec.sectionIndex + 1}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {sec.sectionTitle}
                          </h5>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              sec.isSectionComplete
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : sec.adoptedCount > 0
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {sec.isSectionComplete
                              ? `✓ Tema completo (${sec.adoptedCount}/${sec.allSubtopicIds.length} subtemas)`
                              : `${sec.adoptedCount}/${sec.allSubtopicIds.length} elegidos • ${sec.allSubtopicIds.length - sec.adoptedCount} pendientes`}
                          </span>
                        </div>

                        {sec.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {sec.description}
                          </p>
                        )}

                        {/* Ficha de Profesores Asignados y Fecha de la Clase */}
                        <div className="flex items-center gap-3 flex-wrap pt-0.5 text-xs">
                          {/* Lista de Profesores del Tema */}
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              Profesor(es):
                            </span>
                            {sec.sectionTeachers.length === 0 ? (
                              <span className="text-[11px] italic text-slate-400 dark:text-slate-500">
                                Sin profesor aún (¡Sé el primero en impartirlo!)
                              </span>
                            ) : (
                              sec.sectionTeachers.map((teach) => (
                                <span
                                  key={teach.id}
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 border ${
                                    teach.isMe
                                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                                      : 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                                  }`}
                                >
                                  {teach.isMe ? (
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  )}
                                  <span>{teach.name}</span>
                                  {teach.isMe && (
                                    <span className="text-[9px] uppercase tracking-wider font-black px-1 rounded bg-emerald-200/60 dark:bg-emerald-800/60">
                                      Tú
                                    </span>
                                  )}
                                </span>
                              ))
                            )}
                          </div>

                          {/* Fecha de la Clase para este Tema */}
                          <div className="inline-flex items-center gap-1.5">
                            {sec.linkedWorkshop ? (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1 shadow-2xs">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Clase: {formatWorkshopDate(sec.linkedWorkshop.scheduled_at)}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Fecha de clase: Por agendar</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Botón Selector del TEMA COMPLETO ── */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isTemaAdoptedByMe ? (
                          <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() => handleTogglePedagogicalSection(sec.sectionId, sec.allSubtopicIds, sec.linkedWorkshop?.id)}
                            title="Ya estás asignado a este tema. Clic para desmarcar."
                            className="group/btn px-3 py-1.5 rounded-xl text-xs font-bold border transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border-emerald-300 hover:border-rose-300 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:text-emerald-300 dark:hover:text-rose-300 dark:border-emerald-600/50 dark:hover:border-rose-500/50"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-500 group-hover/btn:hidden" />
                            <X className="w-3.5 h-3.5 text-rose-500 hidden group-hover/btn:inline-block" />
                            <span>✓ Tema en tus clases (Desmarcar)</span>
                          </button>
                        ) : hasColleaguesOnTema ? (
                          <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() => handleTogglePedagogicalSection(sec.sectionId, sec.allSubtopicIds, sec.linkedWorkshop?.id)}
                            title="Sumarme a este tema como co-docente con los demás profesores"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transform hover:scale-[1.01]"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>+ Participar en este Tema (Co-docencia)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busyKey !== null}
                            onClick={() => handleTogglePedagogicalSection(sec.sectionId, sec.allSubtopicIds, sec.linkedWorkshop?.id)}
                            title="Adoptar este tema completo para tus clases"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs bg-indigo-600 hover:bg-indigo-500 text-white transform hover:scale-[1.01]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Seleccionar Tema Completo ({sec.allSubtopicIds.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── 1. Bloque de Subtemas Pendientes por Seleccionar y Colaborables (PROMINENTES) ── */}
                    {filteredPendingAndCollab.length > 0 && (
                      <div className="space-y-1.5">
                        {sec.adoptedCount > 0 && filteredMyAdopted.length > 0 && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Subtemas pendientes por elegir:
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {filteredPendingAndCollab.map((sub) => {
                            if (sub.isCollabOpen) {
                              const otherNames = sub.otherTeachers.map((t) => t.name).join(', ');
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  disabled={busyKey !== null}
                                  onClick={() => handleTogglePedagogicalSubtopic(sub.id, currentPedagogicalModule.id, sub.linkedWorkshop?.id || sec.linkedWorkshop?.id)}
                                  title={`Asignado a Dr(a). ${otherNames}. Clic para sumarte en co-docencia y aparecer en la clase.`}
                                  className="group/collab px-3 py-1.5 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 hover:border-amber-400 transform hover:scale-[1.01]"
                                >
                                  <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>{sub.title}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold ml-0.5">
                                    + Colaborar ({sub.otherTeachers[0]?.name.split(' ')[0]})
                                  </span>
                                  {sub.linkedWorkshop && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                      📅 {formatWorkshopDate(sub.linkedWorkshop.scheduled_at)}
                                    </span>
                                  )}
                                </button>
                              );
                            }

                            return (
                              <button
                                key={sub.id}
                                type="button"
                                disabled={busyKey !== null}
                                onClick={() => handleTogglePedagogicalSubtopic(sub.id, currentPedagogicalModule.id, sec.linkedWorkshop?.id)}
                                title="Subtema libre. Clic para seleccionarlo e impartirlo en tus clases."
                                className="group/free px-3 py-1.5 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600/90 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-white dark:hover:bg-indigo-950/50 transform hover:scale-[1.01] ring-1 ring-black/5 dark:ring-white/5"
                              >
                                <Plus className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 group-hover/free:scale-110 transition-transform" />
                                <span>{sub.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── 2. Bloque de Subtemas YA Seleccionados por ti (MINIMIZADOS y en color ESMERALDA) ── */}
                    {filteredMyAdopted.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" />
                            Mis subtemas seleccionados en este tema ({sec.adoptedCount}):
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Clic en cualquiera para desmarcar)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {filteredMyAdopted.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              disabled={busyKey !== null}
                              onClick={() => handleTogglePedagogicalSubtopic(sub.id, currentPedagogicalModule.id, sub.linkedWorkshop?.id || sec.linkedWorkshop?.id)}
                              title="Seleccionado para tus clases. Haz clic si deseas desmarcarlo."
                              className="group/adopted px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border-emerald-300 hover:border-rose-300 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:text-emerald-300 dark:hover:text-rose-300 dark:border-emerald-600/50 dark:hover:border-rose-500/50"
                            >
                              <Check className="w-3 h-3 text-emerald-500 shrink-0 group-hover/adopted:hidden" />
                              <X className="w-3 h-3 text-rose-500 shrink-0 hidden group-hover/adopted:inline-block" />
                              <span className="truncate max-w-[240px] sm:max-w-none">{sub.title}</span>
                              {sub.isSharedWithMe && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold inline-flex items-center gap-0.5">
                                  <Users className="w-2.5 h-2.5" />
                                  Co-docencia
                                </span>
                              )}
                              {sub.linkedWorkshop && (
                                <span className="text-[9px] px-1 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                                  📅 {formatWorkshopDate(sub.linkedWorkshop.scheduled_at)}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón de Siguiente Módulo */}
            {nextPedagogicalModule && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAdvanceToNextPedagogicalModule}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Avanzar al Módulo {nextPedagogicalModule.number}: {nextPedagogicalModule.title.split(':')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const hasNoTopics = mine.length === 0;

  return (
    <section
      className={`rounded-2xl border transition-colors bg-white dark:bg-slate-900 overflow-hidden ${
        hasNoTopics && !loading
          ? 'border-rose-300 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-700'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div
        onClick={toggleOuter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOuter();
          }
        }}
        aria-expanded={isOuterOpen}
        className="w-full px-3 py-2 flex items-start gap-2.5 text-left cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition select-none"
      >
        <div
          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            hasNoTopics && !loading
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-5 text-slate-900 dark:text-white">
              Mis Temas y Asignación Docente
            </h2>
            <button
              type="button"
              className="shrink-0 p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
              aria-label={isOuterOpen ? 'Colapsar sección' : 'Expandir sección'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOuterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
            {loading ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Cargando…
              </span>
            ) : hasNoTopics ? (
              <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Sin temas
              </span>
            ) : (
              <>
                <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {mine.length} {mine.length === 1 ? 'tema' : 'temas'}
                </span>
                {withoutTeacher.length > 0 && (
                  <span className="px-1.5 py-px rounded-full text-[10px] leading-4 font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {withoutTeacher.length} libres
                  </span>
                )}
              </>
            )}
            <p className="min-w-0 flex-1 truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
              Clases en vivo y presenciales
            </p>
          </div>
        </div>
      </div>

      {isOuterOpen && (
        <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/25 space-y-2">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Banner de Recordatorio al Doctor para Clases en vivo / presenciales */}
          {hasNoTopics && !loading ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/95 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-rose-900 dark:text-rose-100 text-sm flex items-center gap-2 flex-wrap">
                      <span>¡Atención, Dr(a)! Agenda tus temas para las clases</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        Alarma de Pendiente
                      </span>
                    </h3>
                    <p className="text-rose-800 dark:text-rose-200 text-xs mt-1 leading-relaxed">
                      Aún no tienes temas asignados ni propuestos para las clases en vivo y/o presenciales de la cohorte.
                      Es fundamental que te agendes los temas que impartirás para coordinar el calendario académico con la administración y los alumnos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsClassDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    title="Abrir el panel para crear una clase en vivo"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Crear clase en vivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenFreeTopics}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Ver temas libres ({withoutTeacher.length})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !loading && mine.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Tienes <strong className="text-slate-900 dark:text-white">{mine.length} temas</strong> agendados para impartir en las clases ({mine.filter(r => r.status === 'confirmed').length} confirmados, {mine.filter(r => r.status === 'proposed').length} en propuesta).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                {withoutTeacher.length} temas libres aún disponibles en el temario
              </span>
            </div>
          ) : null}

          {/* 🧭 Selector Curricular Pedagógico en Bandeja */}
          {!loading && renderPedagogicalModuleSelector()}

          {loading ? (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
              Cargando cobertura del temario…
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* ── Subsección 1: Mis Temas (AL INICIO, colapsable, colapsada por defecto) ── */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSubsectionsOpen((prev) => ({ ...prev, mine: !prev.mine }))}
                  className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition select-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Mis temas ({mine.length})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        mine.length === 0
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {mine.length === 0 ? 'Sin temas adoptados' : `${mine.length} asignados`}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      subsectionsOpen.mine ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {subsectionsOpen.mine && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                    {mine.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 text-center">
                        Aún no adoptaste ningún tema. Por favor despliega la sección de «Temas libres» abajo para elegir los temas que impartirás.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPlanningMultiTopics({
                                moduleId: mine[0]?.module_id || allModules[0]?.id || 'module-01',
                                topicIds: mine.map((r) => r.topic_id),
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                            title="Abrir el panel para crear una clase con tus temas adoptados"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Crear clase con mis temas</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              askScope(
                                {
                                  kind: 'withdraw',
                                  moduleId: 'all',
                                  heading: 'Retirar todos mis temas',
                                  detail: 'Se cancelará tu asignación a todos tus temas actuales.',
                                  items: mine.map((row) => pathForTopic(row.topic_id, row.module_id)),
                                  confirmLabel: `Retirar ${mine.length} temas`,
                                  previewIds: mine.map((row) => row.topic_id),
                                  busyKey: 'withdraw-all',
                                  topicIds: [],
                                  commitmentIds: mine.map((row) => row.id),
                                },
                                true
                              )
                            }
                            disabled={busyKey === 'withdraw-all'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-60 cursor-pointer"
                            title="Retirar todos mis temas"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Retirar todos mis temas</span>
                          </button>
                        </div>
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                          {mine.map((row) => {
                          const otherTeachers = commitments.filter(
                            (c) =>
                              c.topic_id === row.topic_id &&
                              c.teacher_id !== userId &&
                              c.status !== 'withdrawn'
                          );
                          const isShared = otherTeachers.length > 0;
                          const topicTitle = titleForTopic(row.topic_id, row.module_id);
                          const topicPath = pathForTopic(row.topic_id, row.module_id);
                          const topicUrl =
                            getTopicPublicUrl(row.module_id, row.topic_id) ||
                            `/modulo/${row.module_id}/${row.topic_id}`;

                          return (
                            <div
                              key={row.id}
                              className="px-3 py-2.5 flex flex-col gap-2 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                      to={topicUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Abrir lección de «${topicTitle}» en nueva pestaña`}
                                      className="group/topic font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1.5 max-w-full cursor-pointer transition-colors"
                                    >
                                      <span className="truncate">{topicTitle}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/topic:text-indigo-600 dark:group-hover/topic:text-indigo-400 opacity-60 group-hover/topic:opacity-100 transition shrink-0" />
                                    </Link>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Confirmado
                                    </span>
                                    {isShared && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                                        <Users className="w-3 h-3 text-amber-600" />
                                        Co-docencia ({otherTeachers.length + 1} médicos)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    {topicPath}
                                  </p>
                                </div>
                              </div>

                              {/* Alerta de Co-docencia y recordatorio de acuerdo mutuo */}
                              {isShared && (
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                                  <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
                                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                      <p className="font-bold flex items-center gap-1.5 flex-wrap">
                                        <span>Tema compartido en co-docencia con:</span>
                                        <span className="text-amber-800 dark:text-amber-300 font-black">
                                          {otherTeachers.map((c) => teacherLabel(c)).join(', ')}
                                        </span>
                                      </p>
                                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                                        Hay más de un médico asociado a este tema. Recuerden ponerse de acuerdo para coordinar fechas de impartición, modalidad (clase virtual en vivo vs. taller presencial con equipo) o división de contenidos.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Barra de herramientas para planear la clase */}
                              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlanningTopic({
                                      moduleId: row.module_id,
                                      topicId: row.topic_id,
                                      title: topicTitle,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                                  title="Agendar fecha, enlace de Meet/Zoom o taller presencial"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Planear Clase (En vivo / Presencial)</span>
                                </button>

                                {onOpenQuizEditor ? (
                                  <button
                                    type="button"
                                    onClick={() => onOpenQuizEditor(row.topic_id, row.module_id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs transition cursor-pointer"
                                    title="Validar o editar preguntas de evaluación para este tema en el modal editor"
                                  >
                                    <FileQuestion className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Quiz del Tema</span>
                                  </button>
                                ) : (
                                  <Link
                                    to={`/admin/quizzes/${row.topic_id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs transition"
                                    title="Validar o editar preguntas de evaluación para este tema"
                                  >
                                    <FileQuestion className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Quiz del Tema</span>
                                  </Link>
                                )}

                                <Link
                                  to="/admin/ejercicios"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs transition"
                                  title="Asignar o explorar casos clínicos interactivos de EMG"
                                >
                                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Casos EMG</span>
                                </Link>

                                <button
                                  type="button"
                                  disabled={busyKey === `withdraw-${row.id}`}
                                  onClick={() =>
                                    void runAction(`withdraw-${row.id}`, async () => {
                                      await withdrawTopicCommitment(row.id);
                                    })
                                  }
                                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-60 cursor-pointer"
                                  title="Cancelar tu asignación a este tema"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Retirar tema</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* ── Subsección 2: Temas libres (Temas sin profesor) ── */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSubsectionsOpen((prev) => ({ ...prev, free: !prev.free }))}
                  className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition select-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Temas sin profesor
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        withoutTeacher.length > 0
                          ? 'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {withoutTeacher.length} libres
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      subsectionsOpen.free ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {subsectionsOpen.free && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* Buscador de temas libres */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={freeTopicSearch}
                          onChange={(e) => setFreeTopicSearch(e.target.value)}
                          placeholder="Buscar entre los temas libres por palabra clave (ej. mediano, ulnar, carpiano, aguja, tibial)..."
                          className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                        {freeTopicSearch && (
                          <button
                            type="button"
                            onClick={() => setFreeTopicSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Botones de expandir/colapsar todos */}
                      {!freeTopicSearch.trim() && unassignedByModule.length > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                          <span>Catálogo organizado por módulos ({unassignedByModule.length}):</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allOpen: Record<string, boolean> = {};
                                unassignedByModule.forEach((g) => {
                                  allOpen[g.moduleId] = true;
                                });
                                setOpenModules((prev) => ({ ...prev, ...allOpen }));
                              }}
                              className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                            >
                              Expandir todos
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => {
                                const allClosed: Record<string, boolean> = {};
                                unassignedByModule.forEach((g) => {
                                  allClosed[g.moduleId] = false;
                                });
                                setOpenModules((prev) => ({ ...prev, ...allClosed }));
                              }}
                              className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                            >
                              Colapsar todos
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {canAdopt && !freeTopicSearch.trim() && (
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Con subtemas</span> adopta esa fila y los subtemas visibles que aún están libres.{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Solo este</span> adopta una sola fila.
                        Al señalar el botón se marcan las filas que entran. Un bloque grande pide confirmación.
                      </p>
                    )}

                    {/* Vista si el usuario está buscando temas libres */}
                    {freeTopicSearch.trim() ? (
                      searchResultsFreeTopics.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                          No se encontraron temas libres con «{freeTopicSearch}».
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {searchResultsFreeTopics.map((node) => (
                            <div
                              key={node.topicId}
                              className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">
                                  {node.topicTitle}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {node.pathTitles.join(' / ')}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {canAdopt && (
                                  <button
                                    type="button"
                                    disabled={busyKey === `adopt-${node.topicId}`}
                                    onClick={() => handleAdopt(node)}
                                    className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Adoptar</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlanningTopic({
                                      moduleId: node.moduleId,
                                      topicId: node.topicId,
                                      title: node.topicTitle,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Video className="w-3 h-3 text-indigo-500" />
                                  <span>Planear Clase</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : unassignedByModule.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs text-slate-500">
                        Todos los temas visibles tienen profesor confirmado.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
                        {unassignedByModule.map((group) => {
                          const open = openModules[group.moduleId] ?? false;
                          const freeForMe = group.nodes.filter((node) => !holdsTopic(node.topicId));
                          const myProposed = commitments.filter(
                            (row) =>
                              row.module_id === group.moduleId &&
                              row.teacher_id === userId &&
                              row.status === 'proposed'
                          );
                          const freeIds = freeForMe.map((node) => node.topicId);
                          return (
                            <div key={group.moduleId} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenModules((current) => ({ ...current, [group.moduleId]: !open }))
                                }
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                              >
                                <span className="truncate">
                                  {group.moduleTitle}{' '}
                                  <span className="font-semibold text-slate-400">· {group.nodes.length}</span>
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                              </button>
                              {open && canAdopt ? (
                                <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                    {freeForMe.length === 0
                                      ? 'Ya propusiste los temas libres de este módulo.'
                                      : freeForMe.length === group.nodes.length
                                        ? `${freeForMe.length} ${freeForMe.length === 1 ? 'tema libre' : 'temas libres'} en este módulo, con sus subtemas.`
                                        : `${freeForMe.length} de ${group.nodes.length} aún sin tu propuesta.`}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {freeForMe.length > 0 ? (
                                      <button
                                        type="button"
                                        disabled={busyKey === `adopt-module-${group.moduleId}`}
                                        onPointerEnter={() => showPreview(group.moduleId, freeIds)}
                                        onPointerLeave={endPreview}
                                        onFocus={() => showPreview(group.moduleId, freeIds)}
                                        onBlur={clearPreview}
                                        onClick={() =>
                                          askScope(
                                            {
                                              kind: 'adopt',
                                              moduleId: group.moduleId,
                                              heading: `Adoptar «${group.moduleTitle}»`,
                                              detail:
                                                'Se proponen los temas libres de este módulo. Si alguno ya era tuyo, se queda igual.',
                                              items: freeForMe.map((node) => node.pathTitles.slice(1).join(' / ')),
                                              confirmLabel: `Proponer ${freeForMe.length} ${freeForMe.length === 1 ? 'tema' : 'temas'}`,
                                              previewIds: freeIds,
                                              busyKey: `adopt-module-${group.moduleId}`,
                                              topicIds: freeIds,
                                              commitmentIds: [],
                                            },
                                            true
                                          )
                                        }
                                        title="Proponer todos los temas libres de este módulo"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold disabled:opacity-60 cursor-pointer"
                                      >
                                        <Layers className="w-3.5 h-3.5" />
                                        Adoptar módulo · {freeForMe.length}
                                      </button>
                                    ) : null}
                                    {myProposed.length > 1 ? (
                                      <button
                                        type="button"
                                        disabled={busyKey === `withdraw-module-${group.moduleId}`}
                                        onPointerEnter={() =>
                                          showPreview(
                                            group.moduleId,
                                            myProposed.map((row) => row.topic_id)
                                          )
                                        }
                                        onPointerLeave={endPreview}
                                        onFocus={() =>
                                          showPreview(
                                            group.moduleId,
                                            myProposed.map((row) => row.topic_id)
                                          )
                                        }
                                        onBlur={clearPreview}
                                        onClick={() =>
                                          askScope(
                                            {
                                              kind: 'withdraw',
                                              moduleId: group.moduleId,
                                              heading: `Retirar tus propuestas en «${group.moduleTitle}»`,
                                              detail: 'Se retiran solo tus propuestas. Las clases ya confirmadas se quedan.',
                                              items: myProposed.map((row) => pathForTopic(row.topic_id, group.moduleId)),
                                              confirmLabel: `Retirar ${myProposed.length} propuestas`,
                                              previewIds: myProposed.map((row) => row.topic_id),
                                              busyKey: `withdraw-module-${group.moduleId}`,
                                              topicIds: [],
                                              commitmentIds: myProposed.map((row) => row.id),
                                            },
                                            true
                                          )
                                        }
                                        title="Retirar todas tus propuestas de este módulo"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-60 cursor-pointer"
                                      >
                                        Retirar propuestas · {myProposed.length}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}
                              {open ? (
                                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                  {group.nodes.map((node, nodeIndex) => {
                                    const myCommitment = commitments.find(
                                      (row) =>
                                        row.topic_id === node.topicId &&
                                        row.teacher_id === userId &&
                                        row.status !== 'withdrawn'
                                    );
                                    const isMine = Boolean(myCommitment);
                                    const hasOtherProposed = node.proposed.some((row) => row.teacher_id !== userId);
                                    const blockIds = blockIdsFor(node.moduleId, node.topicId);
                                    const openDescendants = blockIds.filter(
                                      (id) => id !== node.topicId && !isClosedTopic(node.moduleId, id)
                                    );
                                    const pendingIds = pendingIdsFor(node.moduleId, node.topicId);
                                    const pendingDescendants = pendingIds.filter((id) => id !== node.topicId);
                                    const blockTopicIds = isMine ? pendingDescendants : pendingIds;
                                    const showBlock = pendingDescendants.length > 0;
                                    const mineProposedInBlock = commitments.filter(
                                      (row) =>
                                        row.teacher_id === userId &&
                                        row.module_id === node.moduleId &&
                                        row.status === 'proposed' &&
                                        blockIds.includes(row.topic_id)
                                    );
                                    const previewOn =
                                      activePreview?.moduleId === node.moduleId &&
                                      activePreview.ids.includes(node.topicId);
                                    const topicUrl =
                                      getTopicPublicUrl(node.moduleId, node.topicId) ||
                                      `/modulo/${node.moduleId}/${node.topicId}`;

                                    return (
                                      <div
                                        key={`${node.moduleId}:${node.pathTitles.join('/')}:${node.topicId}:${nodeIndex}`}
                                        className={`${node.depth > 0 ? 'pl-8 pr-4' : 'px-4'} py-2.5 flex items-start justify-between gap-3 text-xs transition-colors ${
                                          previewOn
                                            ? 'bg-sky-100 dark:bg-sky-950/70 ring-1 ring-inset ring-sky-300 dark:ring-sky-700'
                                            : ''
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <Link
                                            to={topicUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Abrir lección de «${node.topicTitle}» en nueva pestaña`}
                                            className="group/topic font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1.5 max-w-full cursor-pointer transition-colors"
                                          >
                                            <span className="truncate">
                                              {node.depth > 0 ? `${'· '.repeat(node.depth)}` : ''}
                                              {node.topicTitle}
                                            </span>
                                            <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover/topic:text-indigo-600 dark:group-hover/topic:text-indigo-400 opacity-60 group-hover/topic:opacity-100 transition shrink-0" />
                                          </Link>
                                          {openDescendants.length > 0 ? (
                                            <p className="text-[11px] text-sky-700 dark:text-sky-300">
                                              {pendingDescendants.length === openDescendants.length
                                                ? `${openDescendants.length} ${openDescendants.length === 1 ? 'subtema visible' : 'subtemas visibles'}`
                                                : `${pendingDescendants.length} de ${openDescendants.length} subtemas aún libres`}
                                            </p>
                                          ) : null}
                                          {node.proposed.length > 0 ? (
                                            <p className="text-[11px] text-amber-600 dark:text-amber-300 truncate">
                                              Propuesto: {node.proposed.map(teacherLabel).join(', ')}
                                            </p>
                                          ) : null}
                                        </div>
                                        <div className="shrink-0 flex flex-col items-stretch gap-1 min-w-[7.75rem]">
                                          {canAdopt && showBlock ? (
                                            <button
                                              type="button"
                                              disabled={busyKey === `adopt-block-${node.topicId}`}
                                              onPointerEnter={() => showPreview(node.moduleId, blockTopicIds)}
                                              onPointerLeave={endPreview}
                                              onFocus={() => showPreview(node.moduleId, blockTopicIds)}
                                              onBlur={clearPreview}
                                              onClick={() => handleAdoptBlock(node, blockTopicIds)}
                                              title={
                                                isMine
                                                  ? `Proponer los ${pendingDescendants.length} subtemas que aún no son tuyos`
                                                  : `Proponer este tema y ${pendingDescendants.length} ${pendingDescendants.length === 1 ? 'subtema visible' : 'subtemas visibles'}`
                                              }
                                              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold disabled:opacity-60 cursor-pointer"
                                            >
                                              <Layers className="w-3.5 h-3.5" />
                                              {isMine
                                                ? `Completar · ${pendingDescendants.length}`
                                                : `Con subtemas · ${pendingDescendants.length}`}
                                            </button>
                                          ) : null}
                                          {canAdopt && !isMine ? (
                                            <button
                                              type="button"
                                              disabled={busyKey === `adopt-${node.topicId}`}
                                              onClick={() => handleAdopt(node)}
                                              title={
                                                showBlock
                                                  ? 'Adoptar únicamente esta fila'
                                                  : hasOtherProposed
                                                    ? 'Sumarme a la propuesta de este tema junto a otros profesores'
                                                    : 'Adoptar este tema para impartirlo'
                                              }
                                              className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold disabled:opacity-60 cursor-pointer ${
                                                showBlock
                                                  ? 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                  : 'bg-sky-600 hover:bg-sky-500 text-white'
                                              }`}
                                            >
                                              <UserPlus className="w-3.5 h-3.5" />
                                              {showBlock ? 'Solo este' : hasOtherProposed ? 'Sumarme' : 'Adoptar'}
                                            </button>
                                          ) : null}
                                          {isMine && myCommitment ? (
                                            <>
                                              <span className="text-center text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                Propuesto
                                              </span>
                                              {mineProposedInBlock.length > 1 ? (
                                                <button
                                                  type="button"
                                                  disabled={busyKey === `withdraw-block-${node.topicId}`}
                                                  onPointerEnter={() =>
                                                    showPreview(
                                                      node.moduleId,
                                                      mineProposedInBlock.map((row) => row.topic_id)
                                                    )
                                                  }
                                                  onPointerLeave={endPreview}
                                                  onFocus={() =>
                                                    showPreview(
                                                      node.moduleId,
                                                      mineProposedInBlock.map((row) => row.topic_id)
                                                    )
                                                  }
                                                  onBlur={clearPreview}
                                                  onClick={() =>
                                                    askScope(
                                                      {
                                                        kind: 'withdraw',
                                                        moduleId: node.moduleId,
                                                        heading: `Retirar «${node.topicTitle}» y sus subtemas`,
                                                        detail:
                                                          'Se retiran tus propuestas de este bloque. Las clases ya confirmadas se quedan.',
                                                        items: mineProposedInBlock.map((row) =>
                                                          pathForTopic(row.topic_id, node.moduleId)
                                                        ),
                                                        confirmLabel: `Retirar ${mineProposedInBlock.length} propuestas`,
                                                        previewIds: mineProposedInBlock.map((row) => row.topic_id),
                                                        busyKey: `withdraw-block-${node.topicId}`,
                                                        topicIds: [],
                                                        commitmentIds: mineProposedInBlock.map((row) => row.id),
                                                      },
                                                      false
                                                    )
                                                  }
                                                  title="Retirar tu propuesta de este tema y de los subtemas que propusiste"
                                                  className="px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-60 cursor-pointer"
                                                >
                                                  Retirar tema
                                                </button>
                                              ) : (
                                                <button
                                                  type="button"
                                                  disabled={busyKey === `withdraw-${myCommitment.id}`}
                                                  onClick={() =>
                                                    void runAction(`withdraw-${myCommitment.id}`, async () => {
                                                      await withdrawTopicCommitment(myCommitment.id);
                                                    })
                                                  }
                                                  title="Cambiar de opinión y retirar mi propuesta de este tema"
                                                  className="px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-60 cursor-pointer"
                                                >
                                                  Retirar
                                                </button>
                                              )}
                                            </>
                                          ) : null}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Subsección 3: Temas con profesor ── */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSubsectionsOpen((prev) => ({ ...prev, assigned: !prev.assigned }))}
                  className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition select-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Con profesor ({assigned.length})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {assigned.length} asignados
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      subsectionsOpen.assigned ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {subsectionsOpen.assigned && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                      {assigned.map((node, nodeIndex) => {
                        const myCommitment = commitments.find(
                          (row) => row.topic_id === node.topicId && row.teacher_id === userId
                        );
                        const isMine = Boolean(myCommitment);
                        const topicUrl =
                          getTopicPublicUrl(node.moduleId, node.topicId) ||
                          `/modulo/${node.moduleId}/${node.topicId}`;

                        return (
                          <div
                            key={`${node.moduleId}:${node.pathTitles.join('/')}:${node.topicId}:${nodeIndex}`}
                            className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <Link
                                to={topicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Abrir lección de «${node.topicTitle}» en nueva pestaña`}
                                className="group/topic font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1.5 max-w-full cursor-pointer transition-colors"
                              >
                                <span className="truncate">{node.topicTitle}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover/topic:text-indigo-600 dark:group-hover/topic:text-indigo-400 opacity-60 group-hover/topic:opacity-100 transition shrink-0" />
                              </Link>
                              <p className="text-[11px] text-slate-400 truncate">
                                {node.confirmed.map(teacherLabel).join(', ')}
                                {node.coverage === 'shared' ? ' · compartido' : ''}
                              </p>
                            </div>
                            {canAdopt && !isMine ? (
                              <button
                                type="button"
                                disabled={busyKey === `join-${node.topicId}`}
                                onClick={() => handleJoin(node)}
                                title="Integrarme como co-profesor en este tema"
                                className="shrink-0 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-60 transition cursor-pointer"
                              >
                                Integrarme
                              </button>
                            ) : isMine ? (
                              <div className="shrink-0 flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                  {myCommitment?.status === 'confirmed' ? 'Confirmado' : 'Propuesto'}
                                </span>
                                {myCommitment ? (
                                  <button
                                    type="button"
                                    disabled={busyKey === `withdraw-${myCommitment.id}`}
                                    onClick={() =>
                                      void runAction(`withdraw-${myCommitment.id}`, async () => {
                                        await withdrawTopicCommitment(myCommitment.id);
                                      })
                                    }
                                    title="Retirar mi participación en este tema"
                                    className="px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition disabled:opacity-60 cursor-pointer"
                                  >
                                    Retirar
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {scopePrompt ? (
        <ScopeConfirmDialog
          prompt={scopePrompt}
          busy={busyKey === scopePrompt.busyKey}
          error={error}
          onClose={() => {
            if (busyKey === scopePrompt.busyKey) return;
            setScopePrompt(null);
          }}
          onConfirm={() => {
            if (scopePrompt.kind === 'adopt') {
              proposeIds(scopePrompt.moduleId, scopePrompt.topicIds, scopePrompt.busyKey);
            } else {
              withdrawIds(scopePrompt.commitmentIds, scopePrompt.busyKey);
            }
          }}
        />
      ) : null}

      {(planningTopic || planningMultiTopics || isClassDrawerOpen) && (
        <CreateLiveClassModal
          isOpen={Boolean(planningTopic || planningMultiTopics || isClassDrawerOpen)}
          onClose={() => {
            setPlanningTopic(null);
            setPlanningMultiTopics(null);
            setIsClassDrawerOpen(false);
          }}
          initialModuleId={planningTopic?.moduleId || planningMultiTopics?.moduleId}
          initialTopicId={planningTopic?.topicId || null}
          initialSelectedTopicIds={
            planningMultiTopics?.topicIds || (planningTopic ? [planningTopic.topicId] : undefined)
          }
          onSuccess={async () => {
            await load();
            await onChanged?.();
            setPlanningTopic(null);
            setPlanningMultiTopics(null);
            setIsClassDrawerOpen(false);
            return true;
          }}
        />
      )}
    </section>
  );
}

function ScopeConfirmDialog({
  prompt,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  prompt: ScopePrompt;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const adopt = prompt.kind === 'adopt';
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-slate-950/40" aria-label="Cerrar" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scope-confirm-title"
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 max-w-md mx-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {adopt ? 'Revisar antes de proponer' : 'Revisar antes de retirar'}
            </p>
            <h3 id="scope-confirm-title" className="text-sm font-black text-slate-900 dark:text-white">
              {prompt.heading}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">{prompt.detail}</p>
        <ul className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {prompt.items.map((item, index) => (
            <li key={`${item}:${index}`} className="px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-200">
              {item}
            </li>
          ))}
        </ul>
        {error ? <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
        <button
          type="button"
          disabled={busy || prompt.items.length === 0}
          onClick={onConfirm}
          className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-60 ${
            adopt ? 'bg-sky-600 hover:bg-sky-500' : 'bg-rose-600 hover:bg-rose-500'
          }`}
        >
          {busy ? 'Guardando…' : prompt.confirmLabel}
        </button>
      </section>
    </div>
  );
}

