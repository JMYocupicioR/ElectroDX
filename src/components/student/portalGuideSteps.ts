import type { LucideIcon } from 'lucide-react';
import { Sparkles, BookOpen, GraduationCap, FileCheck, Video } from 'lucide-react';

export type PortalGuideCourseState = 'active' | 'pending' | 'none';

export type PortalGuideMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; alt: string }
  | { kind: 'link'; href: string; label: string };

export interface PortalGuideStep {
  id: string;
  kicker: string;
  title: string;
  body: string;
  detail?: string[];
  icon?: LucideIcon;
  media?: PortalGuideMedia[];
}

export function getPortalGuideSteps(courseState: PortalGuideCourseState): PortalGuideStep[] {
  let step3Title = 'Tu curso ya está activo';
  let step3Body =
    'En Resumen, la tarjeta del curso dice Activo / Cursando. Empezar clases abre la pestaña Clases. La primera lección pendiente es el inicio del curso.';

  if (courseState === 'pending') {
    step3Title = 'Tu solicitud de curso está en revisión';
    step3Body =
      'La tarjeta del curso en Resumen dice En lista de espera. Cuando la dirección la apruebe, el botón pasa a Empezar clases. Mientras tanto puedes revisar el estado en esa misma tarjeta.';
  } else if (courseState === 'none') {
    step3Title = 'Primero solicita el curso';
    step3Body =
      'En Resumen, cada programa tiene Solicitar admisión. Sin esa admisión la pestaña Clases no abre el temario de ese curso.';
  }

  return [
    {
      id: 'mapa',
      kicker: 'Tu portal',
      title: 'Cuatro lugares, y ya puedes estudiar',
      body: 'Este portal concentra tu curso. Lo demás (quizzes, tareas, avisos, constancia y estudio) está en las pestañas de arriba cuando lo necesites.',
      detail: [
        'Cursos, en Resumen: el programa en el que estás inscrito.',
        'Clases: las lecciones, en orden.',
        'Desempeño: cómo se calcula tu avance.',
        'Talleres en vivo: aquí aparecerán las sesiones cuando se publiquen.',
      ],
      icon: Sparkles,
    },
    {
      id: 'clases',
      kicker: 'Clases',
      title: 'Las lecciones están en la pestaña Clases',
      body: 'Ahí está el temario. En Resumen, cada módulo tiene Empezar, Continuar o Repasar, y abre la lección que sigue.',
      detail: [
        'Pestaña Clases.',
        'En Resumen, el botón del módulo abre la siguiente lección.',
        'Puedes volver al mismo punto: el portal recuerda la última lección visitada.',
      ],
      icon: BookOpen,
    },
    {
      id: 'curso',
      kicker: 'Tu curso',
      title: step3Title,
      body: step3Body,
      detail: [
        'Resumen muestra tu tarjeta de curso.',
        'Clases contiene el temario del programa admitido.',
        'Consulta el estado de tu acceso en cualquier momento.',
      ],
      icon: GraduationCap,
    },
    {
      id: 'evaluacion',
      kicker: 'Evaluación',
      title: 'Tu avance se ve en Desempeño',
      body: 'La pestaña Desempeño muestra el promedio de Capa A. El promedio junta exámenes y quizzes teóricos (30), tareas y casos prácticos (30), asistencia a clases y talleres (20) y avance curricular en la plataforma (20). Para acreditar hacen falta 80 de 100.',
      detail: [
        'Pestaña Desempeño: desglose y ponderación actual.',
        'Pestaña Quizzes: registro de cada intento formativo.',
        'Pestaña Constancia: disponible al acreditar los requisitos.',
      ],
      icon: FileCheck,
    },
    {
      id: 'talleres',
      kicker: 'Talleres',
      title: 'Los talleres aparecen en Resumen',
      body: 'A la derecha de Resumen está Talleres en vivo. Si hoy dice que no hay sesión, es normal: la convocatoria se publica en ese panel y en Talleres.',
      detail: [
        'Panel Talleres en vivo, en Resumen.',
        'Catálogo y grabaciones en la página Talleres.',
        'Cada sesión abierta muestra fecha y enlace al detalle.',
      ],
      icon: Video,
    },
  ];
}
