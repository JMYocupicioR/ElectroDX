import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type {
  BrochureCorte,
  BrochureCourse,
  BrochureModule,
  BrochureTopicNode,
  SyllabusBrochureModel,
} from './buildSyllabusBrochureModel';
import { FooterBar, HeaderBar, PageBackdrop, StrokeIcon, Wordmark } from './graphics';
import { ink, PAGE } from './theme';

const styles = StyleSheet.create({
  cover: {
    fontFamily: 'Inter',
    backgroundColor: ink.bg,
    color: ink.text,
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: PAGE.padX,
  },
  page: {
    fontFamily: 'Inter',
    backgroundColor: ink.bg,
    color: ink.text,
    paddingTop: PAGE.padTop,
    paddingBottom: PAGE.padBottom,
    paddingHorizontal: PAGE.padX,
  },
  kicker: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.3,
    color: ink.accent,
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 26,
    fontWeight: 800,
    color: ink.white,
    lineHeight: 1.15,
  },
  h2: {
    fontSize: 16,
    fontWeight: 800,
    color: ink.white,
    marginBottom: 6,
  },
  body: {
    fontSize: 9,
    color: ink.muted,
    lineHeight: 1.45,
  },
  card: {
    backgroundColor: ink.card,
    borderColor: ink.line,
    borderWidth: 0.8,
    borderRadius: 10,
    padding: 12,
  },
});

function clip(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function Pill({ children, color = ink.accent }: { children: string; color?: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 999,
        borderWidth: 0.8,
        borderColor: color,
        backgroundColor: '#0b1d3a',
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color, letterSpacing: 0.6 }}>
        {children}
      </Text>
    </View>
  );
}

function CoverPage({ model }: { model: SyllabusBrochureModel }) {
  const stats: { label: string; value: string; icon: 'book' | 'layers' | 'award' | 'lock' }[] = [
    { label: 'Módulos clínicos', value: String(model.stats.modules), icon: 'book' },
    { label: 'Temas detallados', value: `${model.stats.topics}+`, icon: 'layers' },
    { label: 'Niveles formativos', value: String(model.stats.courses), icon: 'award' },
    { label: 'Acceso', value: 'Suscripción', icon: 'lock' },
  ];

  return (
    <Page size="A4" style={styles.cover} wrap={false}>
      <PageBackdrop variant="cover" />
      <Wordmark brand={model.brand} size="lg" />
      <View style={{ marginTop: 14 }}>
        <Pill>{model.brand.accreditationLine}</Pill>
      </View>

      <View style={{ marginTop: 36, maxWidth: 460 }}>
        <Text style={styles.kicker}>Programa académico oficial</Text>
        <Text style={[styles.h1, { marginTop: 8 }]}>Temario completo del diplomado</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: ink.accentSoft, marginTop: 10 }}>
          {model.brand.academicTitle}
        </Text>
        <Text style={[styles.body, { marginTop: 12, maxWidth: 440 }]}>
          Formación especializada de alto nivel en electrodiagnóstico, conducción nerviosa y electromiografía clínica.
          Este documento presenta el mapa curricular real del programa: cursos, módulos, temas y subtemas. El material
          didáctico interactivo, simuladores y evaluaciones permanecen detrás de suscripción.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 28, gap: 8 }}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.card, { flex: 1, paddingVertical: 12 }]}>
            <StrokeIcon name={stat.icon} size={13} />
            <Text style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 800, color: ink.white, marginTop: 8 }}>
              {stat.value}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted, marginTop: 3 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16, gap: 8 }}>
        {model.courses.map((course) => (
          <View
            key={course.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: ink.cardAlt,
              borderRadius: 8,
              borderWidth: 0.7,
              borderColor: ink.line,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: course.accent, marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: ink.white }}>{course.title}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, marginTop: 2 }}>
                {clip(course.description, 148)}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: course.accent }}>
              {course.moduleCount} módulos · {course.topicCount} temas
            </Text>
          </View>
        ))}
      </View>

      {model.corteRangeLabel ? (
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#102a56',
            borderRadius: 8,
            borderWidth: 0.7,
            borderColor: ink.accent,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          <StrokeIcon name="calendar" size={12} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: ink.accent, letterSpacing: 0.8 }}>
              CORTES ACADÉMICOS
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 600, color: ink.white, marginTop: 2 }}>
              {model.corteRangeLabel} · {model.cortes.length} cortes calendarizados
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#0c1a38',
          borderRadius: 12,
          borderWidth: 0.8,
          borderColor: ink.line,
          padding: 14,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 800, color: ink.white }}>
            Documento de orientación para médicos interesados
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
            Escanea el código para inscribirte o consulta el temario interactivo en {model.temarioUrl}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted2, marginTop: 8 }}>
            Actualizado el {model.generatedAt}
          </Text>
        </View>
        {model.qrDataUrl ? (
          <View
            style={{
              width: 86,
              height: 86,
              backgroundColor: ink.white,
              borderRadius: 8,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image src={model.qrDataUrl} style={{ width: 74, height: 74 }} />
          </View>
        ) : null}
      </View>
      <FooterBar brand={model.brand} />
    </Page>
  );
}

function MapPage({ model }: { model: SyllabusBrochureModel }) {
  const rows = [
    ...model.courses.flatMap((course) =>
      course.modules.map((mod) => ({
        course: course.title,
        accent: course.accent,
        number: mod.numberLabel,
        title: mod.title,
        topics: mod.topicCount,
      }))
    ),
    ...model.complementary.map((mod) => ({
      course: 'Complementario',
      accent: ink.accent,
      number: mod.numberLabel,
      title: mod.title,
      topics: mod.topicCount,
    })),
  ];

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageBackdrop />
      <HeaderBar brand={model.brand} label="Mapa del programa" />
      <FooterBar brand={model.brand} />

      <Text style={styles.h2}>Mapa del programa</Text>
      <Text style={[styles.body, { marginBottom: 12 }]}>
        El diplomado se organiza en {model.stats.courses} cursos independientes. La referencia rápida y la bibliografía
        se listan como material complementario cuando no están asignadas a un nivel.
      </Text>

      {model.courses.map((course) => (
        <View key={course.id} wrap={false} style={[styles.card, { marginBottom: 8 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 800, color: ink.white }}>{course.title}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: course.accent }}>
              {course.moduleCount} módulos · {course.topicCount} temas
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
            {course.description}
          </Text>
        </View>
      ))}

      <View style={[styles.card, { marginTop: 6, padding: 0 }]}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#152448',
            paddingVertical: 7,
            paddingHorizontal: 10,
          }}
        >
          {['Nivel', 'Módulo', 'Título', 'Temas'].map((label, i) => (
            <Text
              key={label}
              style={{
                fontFamily: 'Inter',
                fontSize: 7,
                fontWeight: 700,
                color: ink.accentSoft,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                width: i === 0 ? 90 : i === 1 ? 48 : i === 3 ? 40 : 285,
              }}
            >
              {label}
            </Text>
          ))}
        </View>
        {rows.map((row, index) => (
          <View
            key={`${row.course}-${row.number}-${row.title}`}
            wrap={false}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 5.5,
              paddingHorizontal: 10,
              backgroundColor: index % 2 === 0 ? ink.card : '#0d1833',
            }}
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 7, color: row.accent, fontWeight: 600, width: 90 }}>
              {row.course}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted, width: 48 }}>
              {row.number}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.white, width: 285 }}>{row.title}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, width: 40, textAlign: 'right' }}>
              {row.topics}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

function CortesPage({ model }: { model: SyllabusBrochureModel }) {
  if (!model.cortes.length) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <PageBackdrop />
      <HeaderBar brand={model.brand} label="Cortes académicos" />
      <FooterBar brand={model.brand} />
      <Text style={styles.h2}>Cortes académicos y fechas de límite</Text>
      <Text style={[styles.body, { marginBottom: 12 }]}>
        Cronograma vigente definido por el comité académico. Cada corte tiene fecha de inicio, fecha límite y un
        checklist de temas obligatorios. Las fechas se actualizan cuando los administradores modifican el calendario.
        {model.corteRangeLabel ? ` Periodo cubierto: ${model.corteRangeLabel}.` : ''}
      </Text>

      {model.cortes.map((corte, index) => (
        <CorteCard key={corte.id} corte={corte} isLast={index === model.cortes.length - 1} />
      ))}
    </Page>
  );
}

function CorteCard({ corte, isLast }: { corte: BrochureCorte; isLast: boolean }) {
  return (
    <View style={{ marginBottom: isLast ? 0 : 10 }}>
      <View
        wrap={false}
        minPresenceAhead={90}
        style={{
          backgroundColor: ink.card,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: corte.topics.length ? 0 : 10,
          borderBottomRightRadius: corte.topics.length ? 0 : 10,
          borderWidth: 0.8,
          borderBottomWidth: corte.topics.length ? 0 : 0.8,
          borderColor: ink.line,
          borderLeftWidth: 4,
          borderLeftColor: ink.accent,
          padding: 11,
          paddingBottom: corte.topics.length ? 8 : 11,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: ink.accent, letterSpacing: 0.8 }}>
            {corte.periodLabel.toUpperCase()}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted }}>
            Mínimo {corte.passingGrade}% · {corte.topicCount} temas
          </Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 800, color: ink.white, marginTop: 4 }}>
          {corte.title}
        </Text>
        {corte.description ? (
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
            {corte.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#0d1833',
              borderRadius: 7,
              paddingVertical: 7,
              paddingHorizontal: 9,
            }}
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 6.5, fontWeight: 700, color: ink.muted2, letterSpacing: 0.6 }}>
              INICIO DEL PERIODO
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: ink.accentSoft, marginTop: 2 }}>
              {corte.startLabel}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#0d1833',
              borderRadius: 7,
              paddingVertical: 7,
              paddingHorizontal: 9,
            }}
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 6.5, fontWeight: 700, color: ink.muted2, letterSpacing: 0.6 }}>
              FECHA LÍMITE DE CORTE
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: ink.amber, marginTop: 2 }}>
              {corte.dueLabel}
            </Text>
          </View>
        </View>

        {corte.topics.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: ink.accentSoft, marginBottom: 4 }}>
              Temas requeridos para este corte
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {corte.topics.map((topic) => (
                <View
                  key={`${corte.id}-${topic.moduleTitle}-${topic.title}`}
                  style={{ width: '50%', paddingRight: 6, paddingBottom: 3 }}
                >
                  <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.white }}>• {topic.title}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 6, color: ink.muted2, marginLeft: 7 }}>
                    {topic.moduleTitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PillarsPage({ model }: { model: SyllabusBrochureModel }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <PageBackdrop />
      <HeaderBar brand={model.brand} label="Visión ejecutiva" />
      <FooterBar brand={model.brand} />
      <Text style={styles.h2}>Visión ejecutiva del programa</Text>
      <Text style={[styles.body, { marginBottom: 12 }]}>
        Seis ejes temáticos para comprender qué protocolos, criterios y habilidades diagnósticas se adquieren a lo largo
        del diplomado.
      </Text>
      {model.pillars.map((pillar) => (
        <View
          key={pillar.id}
          wrap={false}
          minPresenceAhead={120}
          style={[styles.card, { marginBottom: 8, borderLeftWidth: 3, borderLeftColor: pillar.accent }]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: pillar.accent, letterSpacing: 0.8 }}>
              EJE {pillar.number} · {pillar.modules}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted }}>{pillar.badge}</Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 800, color: ink.white, marginTop: 4 }}>
            {pillar.title}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
            {pillar.summary}
          </Text>
          <View style={{ marginTop: 6 }}>
            {pillar.keyPoints.map((point) => (
              <View key={point} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.emerald, width: 10 }}>•</Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, flex: 1, lineHeight: 1.35 }}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.accentSoft, marginTop: 6 }}>
            Competencia adquirida: {pillar.outcome}
          </Text>
        </View>
      ))}
    </Page>
  );
}

function TopicTree({ nodes, depth }: { nodes: BrochureTopicNode[]; depth: number }) {
  if (depth >= 1) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginLeft: 4 }}>
        {nodes.map((node) => (
          <View
            key={node.code}
            wrap={false}
            style={{
              width: '48%',
              flexDirection: 'row',
              paddingVertical: 2,
              paddingRight: 6,
            }}
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 6.5, color: ink.accent, width: 36, fontWeight: 700 }}>
              {node.code}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 7, color: ink.muted }}>{node.title}</Text>
              {node.children.length > 0 ? <TopicTree nodes={node.children} depth={depth + 1} /> : null}
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {nodes.map((node) => (
        <View key={node.code} style={{ marginTop: 6 }}>
          <View wrap={false} minPresenceAhead={42} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: ink.accent, width: 36 }}>
              {node.code}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: ink.white }}>{node.title}</Text>
              {node.description ? (
                <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, marginTop: 1.5, lineHeight: 1.35 }}>
                  {node.description}
                </Text>
              ) : null}
            </View>
          </View>
          {node.children.length > 0 ? <TopicTree nodes={node.children} depth={depth + 1} /> : null}
        </View>
      ))}
    </View>
  );
}

function ModuleBlock({ mod }: { mod: BrochureModule }) {
  return (
    <View wrap minPresenceAhead={70} style={{ marginBottom: 12 }}>
      <View
        wrap={false}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: ink.card,
          borderRadius: 8,
          borderWidth: 0.7,
          borderColor: ink.line,
          padding: 8,
          marginBottom: 4,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            backgroundColor: mod.colorFrom,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: ink.white }}>{mod.numberLabel}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: ink.accent, letterSpacing: 0.7 }}>
            MÓDULO {mod.numberLabel} · {mod.topicCount} temas
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 800, color: ink.white }}>{mod.title}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted }}>{mod.description}</Text>
        </View>
      </View>
      <View style={{ paddingLeft: 6, paddingRight: 4 }}>
        <TopicTree nodes={mod.topics} depth={0} />
      </View>
    </View>
  );
}

function CourseSection({ course, breakBefore }: { course: BrochureCourse; breakBefore: boolean }) {
  return (
    <View break={breakBefore}>
      <View
        wrap={false}
        minPresenceAhead={90}
        style={{
          backgroundColor: '#102044',
          borderRadius: 10,
          borderWidth: 0.8,
          borderColor: ink.line,
          borderLeftWidth: 4,
          borderLeftColor: course.accent,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: course.accent, letterSpacing: 1 }}>
          NIVEL FORMATIVO
        </Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 800, color: ink.white, marginTop: 3 }}>
          {course.title}
        </Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
          {course.description}
        </Text>
      </View>
      {course.modules.map((mod) => (
        <ModuleBlock key={mod.id} mod={mod} />
      ))}
    </View>
  );
}

function CatalogPage({ model }: { model: SyllabusBrochureModel }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <PageBackdrop />
      <HeaderBar brand={model.brand} label="Temario analítico" />
      <FooterBar brand={model.brand} />
      <Text style={styles.h2}>Temario analítico</Text>
      <Text style={[styles.body, { marginBottom: 10 }]}>
        Índice jerárquico de módulos, temas y subtemas del catálogo vigente. No incluye lecciones, perlas clínicas ni
        evaluaciones: ese material es exclusivo para alumnos inscritos.
      </Text>
      {model.courses.map((course, index) => (
        <CourseSection key={course.id} course={course} breakBefore={index > 0} />
      ))}
      {model.complementary.length > 0 ? (
        <View break>
          <View
            wrap={false}
            style={{
              backgroundColor: '#102044',
              borderRadius: 10,
              borderLeftWidth: 4,
              borderLeftColor: ink.accent,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700, color: ink.accent, letterSpacing: 1 }}>
              MATERIAL COMPLEMENTARIO
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 800, color: ink.white, marginTop: 3 }}>
              Referencia y bibliografía
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 4 }}>
              Recursos transversales de consulta rápida y evidencia, disponibles como apoyo al itinerario de cada nivel.
            </Text>
          </View>
          {model.complementary.map((mod) => (
            <ModuleBlock key={mod.id} mod={mod} />
          ))}
        </View>
      ) : null}
    </Page>
  );
}

function ClosingPage({ model }: { model: SyllabusBrochureModel }) {
  const benefitIcons: Array<'shield' | 'file' | 'users'> = ['shield', 'file', 'users'];
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <PageBackdrop />
      <HeaderBar brand={model.brand} label="Inscripción" />
      <FooterBar brand={model.brand} />

      <Text style={styles.h2}>Cómo inscribirte al diplomado</Text>
      <Text style={[styles.body, { marginBottom: 14 }]}>{model.brand.accreditationLine}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {model.benefits.map((benefit, index) => (
          <View key={benefit.title} style={[styles.card, { flex: 1 }]}>
            <StrokeIcon name={benefitIcons[index] ?? 'shield'} size={14} />
            <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: ink.white, marginTop: 8 }}>
              {benefit.title}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
              {benefit.desc}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { marginBottom: 14 }]}>
        <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 800, color: ink.white, marginBottom: 10 }}>
          Tres pasos para acceder
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {model.steps.map((step) => (
            <View key={step.step} style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 800, color: ink.accent }}>
                PASO {step.step}
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: ink.white, marginTop: 4 }}>
                {step.title}
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 7.5, color: ink.muted, marginTop: 4, lineHeight: 1.4 }}>
                {step.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          marginTop: 'auto',
          backgroundColor: '#102a56',
          borderRadius: 14,
          borderWidth: 0.8,
          borderColor: ink.accent,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 800, color: ink.white }}>
            Inscríbete como alumno del diplomado
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: ink.muted, marginTop: 6, lineHeight: 1.4 }}>
            El temario es público. Las lecciones, simuladores, casos clínicos y evaluaciones se desbloquean con
            suscripción verificada.
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: ink.accent, marginTop: 8 }}>
            {model.registerUrl}
          </Text>
        </View>
        {model.qrDataUrl ? (
          <View
            style={{
              width: 92,
              height: 92,
              backgroundColor: ink.white,
              borderRadius: 10,
              padding: 7,
            }}
          >
            <Image src={model.qrDataUrl} style={{ width: 78, height: 78 }} />
          </View>
        ) : null}
      </View>
    </Page>
  );
}

export function SyllabusBrochureDocument({ model }: { model: SyllabusBrochureModel }) {
  return (
    <Document
      title={`Temario oficial — ${model.brand.name}`}
      author={model.brand.name}
      subject={model.brand.academicTitle}
      creator={model.brand.name}
      language="es"
    >
      <CoverPage model={model} />
      <MapPage model={model} />
      <CortesPage model={model} />
      <PillarsPage model={model} />
      <CatalogPage model={model} />
      <ClosingPage model={model} />
    </Document>
  );
}
