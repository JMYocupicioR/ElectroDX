/**
 * PrintableExamReport.tsx
 * Professional printable exam report for teaching evidence.
 * Hidden on screen, visible when printing via @media print.
 */
import { CheckCircle, XCircle } from 'lucide-react';

interface StudentProfile {
    full_name: string;
    email: string;
    residency_year: string;
    institution: string;
}

interface BreakdownScore {
    name: string;
    score: number;
    count?: number;
}

interface PrintableExamReportProps {
    student: StudentProfile | null;
    session: any;
    answers: any[];
    islandScores: BreakdownScore[];
    topicScores: BreakdownScore[];
}

export const PrintableExamReport = ({ student, session, answers, islandScores, topicScores }: PrintableExamReportProps) => {
    if (!session) return null;

    const examDate = session.completed_at || session.started_at;
    const formattedDate = examDate
        ? new Date(examDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Sin fecha';
    const formattedTime = examDate
        ? new Date(examDate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '';
    const printDate = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    const scorePercent = typeof session.score_percentage === 'number'
        ? Number(session.score_percentage).toFixed(1)
        : session.score_percentage;

    const scoreColor = Number(scorePercent) >= 80 ? '#16a34a' : Number(scorePercent) >= 60 ? '#ca8a04' : '#dc2626';

    const modeName = session.mode === 'FULL_SIMULATION' ? 'Simulacro Completo'
        : session.mode === 'ISLAND_SPECIFIC' ? 'Práctica por Isla'
        : session.mode === 'CUSTOM' ? 'Examen Personalizado'
        : session.mode === 'CUSTOM_SIMULATION' ? 'Examen Personalizado'
        : session.mode;

    const durationMin = session.duration_seconds
        ? `${Math.floor(session.duration_seconds / 60)} min ${session.duration_seconds % 60} seg`
        : 'N/A';

    return (
        <div className="print-only" id="printable-exam-report">
            {/* ── Page 1: Summary ──────────────────────────────── */}
            <div style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#111827', fontSize: '11px', lineHeight: 1.5 }}>

                {/* Header Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: 'white',
                    padding: '20px 28px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                            RehabiQuiz
                        </h1>
                        <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0', fontWeight: 500 }}>
                            Reporte Individual de Examen
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px', opacity: 0.85 }}>
                        <p style={{ margin: 0 }}>DeepLux MED</p>
                        <p style={{ margin: '2px 0 0 0' }}>Plataforma de Evaluación Médica</p>
                    </div>
                </div>

                {/* Student Info Section */}
                <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    backgroundColor: '#f8fafc',
                }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Datos del Alumno
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                        <div>
                            <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alumno</span>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600, fontSize: '13px' }}>{student?.full_name || 'Sin nombre'}</p>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>{student?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institución</span>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 500 }}>{student?.institution || 'Sin institución'}</p>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Año de Residencia</span>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 500 }}>{student?.residency_year || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Exam Info + Score */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Exam Details */}
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Datos del Examen
                        </h3>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280' }}>Tipo:</span>
                                <span style={{ fontWeight: 600 }}>{modeName}</span>
                            </div>
                            {session.island?.name && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Isla:</span>
                                    <span style={{ fontWeight: 600 }}>{session.island.name}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280' }}>Fecha:</span>
                                <span style={{ fontWeight: 500 }}>{formattedDate}</span>
                            </div>
                            {formattedTime && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280' }}>Hora:</span>
                                    <span style={{ fontWeight: 500 }}>{formattedTime}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280' }}>Duración:</span>
                                <span style={{ fontWeight: 500 }}>{durationMin}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6b7280' }}>Total de preguntas:</span>
                                <span style={{ fontWeight: 600 }}>{session.total_questions}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Summary */}
                    <div style={{ border: '2px solid ' + scoreColor, borderRadius: '8px', padding: '16px 20px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Calificación Final
                        </h3>
                        <div style={{ fontSize: '42px', fontWeight: 800, color: scoreColor, lineHeight: 1.1 }}>
                            {scorePercent}%
                        </div>
                        <p style={{ color: '#6b7280', margin: '6px 0 0 0', fontSize: '12px' }}>
                            <span style={{ fontWeight: 700, color: '#111827' }}>{session.correct_answers}</span> de{' '}
                            <span style={{ fontWeight: 700, color: '#111827' }}>{session.total_questions}</span> respuestas correctas
                        </p>
                        <div style={{
                            marginTop: '10px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'white',
                            backgroundColor: scoreColor,
                        }}>
                            {Number(scorePercent) >= 80 ? 'APROBADO' : Number(scorePercent) >= 60 ? 'REGULAR' : 'NO APROBADO'}
                        </div>
                    </div>
                </div>

                {/* Performance by Area (Island) */}
                {islandScores.length > 0 && (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Desempeño por Área
                        </h3>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            {islandScores.map((island, idx) => {
                                const barColor = island.score >= 80 ? '#16a34a' : island.score >= 60 ? '#ca8a04' : '#dc2626';
                                return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '120px', fontSize: '10px', fontWeight: 500, color: '#374151', textAlign: 'right', flexShrink: 0 }}>
                                            {island.name}
                                        </span>
                                        <div style={{ flex: 1, height: '14px', backgroundColor: '#f3f4f6', borderRadius: '7px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${island.score}%`,
                                                height: '100%',
                                                backgroundColor: barColor,
                                                borderRadius: '7px',
                                                minWidth: island.score > 0 ? '8px' : '0',
                                            }} />
                                        </div>
                                        <span style={{ width: '36px', fontSize: '11px', fontWeight: 700, color: barColor, textAlign: 'right', flexShrink: 0 }}>
                                            {island.score}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Weakest Topics */}
                {topicScores.length > 0 && (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Áreas de Oportunidad (Temas)
                        </h3>
                        <p style={{ fontSize: '9px', color: '#9ca3af', margin: '0 0 10px 0' }}>Temas con menor puntaje en este examen</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Tema</th>
                                    <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', width: '80px' }}>Preguntas</th>
                                    <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151', width: '80px' }}>Puntaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topicScores.slice(0, 8).map((topic, idx) => {
                                    const tc = topic.score >= 80 ? '#16a34a' : topic.score >= 60 ? '#ca8a04' : '#dc2626';
                                    return (
                                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                                            <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6' }}>{topic.name}</td>
                                            <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'center', color: '#6b7280' }}>{topic.count || '-'}</td>
                                            <td style={{ padding: '5px 8px', borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontWeight: 700, color: tc }}>{topic.score}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Answer Detail Table ──────────────────────── */}
                <div style={{ pageBreakBefore: answers.length > 5 ? 'always' : 'auto' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Detalle de Respuestas
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                                <th style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, width: '28px' }}>#</th>
                                <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 600 }}>Pregunta</th>
                                <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 600, width: '100px' }}>Tema</th>
                                <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 600, width: '140px' }}>Respuesta del Alumno</th>
                                <th style={{ padding: '6px 6px', textAlign: 'left', fontWeight: 600, width: '140px' }}>Respuesta Correcta</th>
                                <th style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, width: '36px' }}>✓/✗</th>
                            </tr>
                        </thead>
                        <tbody>
                            {answers.map((ans, idx) => {
                                const options = ans.question?.content?.options || [];
                                const selectedOption = options[ans.selected_option_index] || { text: '-' };
                                const correctOption = options.find((o: any) => o.is_correct) || { text: '-' };
                                const stem = ans.question?.content?.stem || 'Pregunta no disponible';
                                const truncatedStem = stem.length > 80 ? stem.substring(0, 80) + '...' : stem;
                                const topicName = ans.topic?.name || 'General';

                                return (
                                    <tr key={idx} style={{
                                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                                        borderBottom: '1px solid #f3f4f6',
                                    }}>
                                        <td style={{ padding: '5px 6px', textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>{idx + 1}</td>
                                        <td style={{ padding: '5px 6px', lineHeight: 1.3 }}>{truncatedStem}</td>
                                        <td style={{ padding: '5px 6px', color: '#6b7280', fontSize: '8px' }}>{topicName}</td>
                                        <td style={{
                                            padding: '5px 6px',
                                            color: ans.is_correct ? '#16a34a' : '#dc2626',
                                            fontWeight: 500,
                                            fontSize: '8.5px',
                                        }}>
                                            {selectedOption.text?.length > 50 ? selectedOption.text.substring(0, 50) + '...' : selectedOption.text}
                                        </td>
                                        <td style={{ padding: '5px 6px', color: '#16a34a', fontSize: '8.5px' }}>
                                            {ans.is_correct ? '—' : (correctOption.text?.length > 50 ? correctOption.text.substring(0, 50) + '...' : correctOption.text)}
                                        </td>
                                        <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                                            {ans.is_correct
                                                ? <CheckCircle size={14} color="#16a34a" />
                                                : <XCircle size={14} color="#dc2626" />
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '24px',
                    paddingTop: '12px',
                    borderTop: '2px solid #1e40af',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '9px',
                    color: '#9ca3af',
                }}>
                    <span>Documento generado automáticamente por <strong style={{ color: '#1e40af' }}>RehabiQuiz</strong> | DeepLux MED</span>
                    <span>Fecha de impresión: {printDate}</span>
                </div>
            </div>
        </div>
    );
};
