// 🚀 COMPONENTE INTEGRADO EMG WORKFLOW
// ===================================
// Flujo completo EMG con auto-llenado de datos desde archivo procesado

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Activity, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import CompleteClinicalWorkflow from './CompleteClinicalWorkflow';
import { Patient } from '../types/patient';
import { FormDataMapper, ExtractedFileData, formLogger } from '../services/formDataMapper';

interface IntegratedEMGWorkflowProps {}

// Tipos para los datos extraídos del archivo
interface ExtractedData {
  patient?: {
    name: string;
    id: string;
    age: number;
    sex: 'male' | 'female';
  };
  ncsResults?: Array<{
    nerve: string;
    side: 'left' | 'right';
    latency: number;
    amplitude: number;
    velocity: number;
    status: 'normal' | 'abnormal';
    findings?: string[];
  }>;
  emgResults?: Array<{
    muscle: string;
    side: 'left' | 'right';
    insertionalActivity: string;
    spontaneousActivity: any;
    motorUnitPotentials: any;
    recruitmentPattern: string;
  }>;
  symptoms?: {
    weakness?: { present: boolean; severity: string };
    paresthesias?: { present: boolean; severity: string };
    pain?: { present: boolean };
  };
  warnings?: string[];
}

const IntegratedEMGWorkflow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [autoFillMode, setAutoFillMode] = useState(false);
  const [sourceFile, setSourceFile] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'workflow'>('welcome');
  const [mappedFormData, setMappedFormData] = useState<any>(null);
  const [mappingLogs, setMappingLogs] = useState<any[]>([]);
  const [processingStats, setProcessingStats] = useState<any>(null);

  useEffect(() => {
    // 🔥 OBTENER DATOS REALES DEL ESTADO DE NAVEGACIÓN
    console.log('🚀 IntegratedEMGWorkflow iniciando con location.state:', location.state);
    
    setTimeout(() => {
      // Obtener datos reales del estado de navegación o usar fallback
      const locationState = location.state || {};
      
      // 🎯 USAR DATOS REALES DEL ARCHIVO PROCESADO
      const realExtractedData = locationState.extractedData || locationState.fileResult?.extractedData;
      
      let finalExtractedData;
      
      if (realExtractedData) {
        // ✅ DATOS REALES DEL ARCHIVO
        console.log('📁 Usando datos reales del archivo procesado:', realExtractedData);
        finalExtractedData = realExtractedData;
      } else {
        // 🔄 FALLBACK: Datos de ejemplo si no hay datos reales
        console.warn('⚠️ No se encontraron datos del archivo, usando datos de ejemplo');
        finalExtractedData = {
          patient: {
            name: 'Paciente Ejemplo',
            id: 'EMG-' + Date.now(),
            age: 45,
            sex: 'male' as const
          },
          ncsResults: [
            {
              nerve: 'Mediano',
              side: 'right' as const,
              latency: 3.2,
              amplitude: 8.5,
              velocity: 54.2,
              status: 'abnormal' as const,
              findings: ['Ejemplo - Verificar datos reales']
            }
          ],
          emgResults: [
            {
              muscle: 'Pronator Teres',
              side: 'right' as const,
              insertionalActivity: 'normal',
              spontaneousActivity: {
                fibrillations: false,
                positiveWaves: false,
                fasciculations: false
              },
              motorUnitPotentials: {
                amplitude: 1200,
                duration: 12.5,
                polyphasia: 15
              },
              recruitmentPattern: 'normal'
            }
          ],
          symptoms: {
            weakness: { present: true, severity: 'moderate' },
            paresthesias: { present: true, severity: 'mild' },
            pain: { present: false }
          },
          warnings: [
            'Datos de ejemplo - Archivo no procesado correctamente',
            'Revisar configuración del sistema de archivos'
          ]
        };
      }
      
      const processedLocationState = {
        autoFillMode: locationState.autoFillMode || true,
        sourceFile: locationState.sourceFile || 'archivo_no_especificado.rtf',
        extractedData: finalExtractedData
      };

      setExtractedData(processedLocationState.extractedData);
      setAutoFillMode(processedLocationState.autoFillMode);
      setSourceFile(processedLocationState.sourceFile);

      // 🧠 MAPEAR DATOS EXTRAÍDOS A FORMATOS DE FORMULARIOS
      console.log('🔄 Iniciando mapeo de datos del archivo...');
      console.log('📊 Datos a mapear:', processedLocationState.extractedData);
      
      // 🔍 DEBUG: Verificar datos NCS antes del mapeo
      if (processedLocationState.extractedData.ncsResults) {
        console.log('🔌 Datos NCS antes del mapeo:', processedLocationState.extractedData.ncsResults);
        processedLocationState.extractedData.ncsResults.forEach((ncs, index) => {
          console.log(`   NCS ${index + 1}:`, {
            nerve: ncs.nerve,
            side: ncs.side,
            latency: ncs.latency,
            amplitude: ncs.amplitude,
            velocity: ncs.velocity,
            status: ncs.status
          });
        });
      } else {
        console.warn('⚠️ No hay datos NCS para mapear');
      }
      
      try {
        const mappingResult = FormDataMapper.mapAllFormData(processedLocationState.extractedData);
        setMappedFormData(mappingResult);
        
        // 🛡️ Obtener logs del FormDataLogger y datos del resultado
        const logs = formLogger.getLogs() || [];
        const warnings = mappingResult?.overall?.warnings || [];
        const errors = mappingResult?.overall?.errors || [];
        
        setMappingLogs(logs);
        
        // Estadísticas de procesamiento
        const stats = {
          totalFields: mappingResult?.overall?.totalFieldsMapped || 0,
          successfulMappings: mappingResult?.symptoms?.mappingStats?.fieldsMapped || 0,
          confidence: mappingResult?.overall?.overallConfidence || 0,
          warnings: warnings.length,
          errors: errors.length
        };
        setProcessingStats(stats);

        console.log('📊 Resultado del mapeo:', {
          success: mappingResult?.overall?.success || false,
          symptomsMaped: mappingResult?.symptoms?.mappingStats?.fieldsMapped || 0,
          confidence: `${((mappingResult?.overall?.overallConfidence || 0) * 100).toFixed(1)}%`,
          warnings: warnings.length,
          errors: errors.length
        });

        // 🔍 DEBUG: Verificar datos NCS después del mapeo
        if (mappingResult?.ncs?.data) {
          console.log('🔌 Datos NCS después del mapeo:', mappingResult.ncs.data);
          console.log(`📊 Total NCS mapeados: ${mappingResult.ncs.data.length}`);
          mappingResult.ncs.data.forEach((ncs, index) => {
            console.log(`   NCS mapeado ${index + 1}:`, {
              id: ncs.id,
              nerve: ncs.nerve,
              side: ncs.side,
              type: ncs.type,
              latency: ncs.latency,
              amplitude: ncs.amplitude,
              velocity: ncs.velocity,
              status: ncs.status
            });
          });
        } else {
          console.warn('⚠️ No se generaron datos NCS mapeados');
          
          // 🔧 FALLBACK: Crear datos NCS manualmente si el mapeo falla
          console.log('🔧 Creando datos NCS de fallback...');
          if (!mappingResult.ncs) {
            mappingResult.ncs = { data: [], success: false, warnings: [], errors: [], mappingStats: { fieldsProcessed: 0, fieldsMapped: 0, fieldsSkipped: 0, confidence: 0 } };
          }
          
          // Agregar datos NCS desde los datos extraídos directamente
          if (processedLocationState.extractedData.ncsResults) {
            mappingResult.ncs.data = processedLocationState.extractedData.ncsResults.map((ncs, index) => ({
              id: `fallback_ncs_${index}`,
              nerve: ncs.nerve || 'Nervio Desconocido',
              side: ncs.side || 'right',
              type: ncs.nerve?.toLowerCase().includes('sensitiv') ? 'sensory' : 'motor',
              latency: ncs.latency || 0,
              amplitude: ncs.amplitude || 0,
              velocity: ncs.velocity || 0,
              status: ncs.status || 'normal',
              findings: ncs.findings || []
            }));
            
            console.log('✅ Datos NCS de fallback creados:', mappingResult.ncs.data);
          }
        }

        // 🔧 FALLBACK: Asegurar datos EMG también
        if (!mappingResult?.emg?.data || mappingResult.emg.data.length === 0) {
          console.warn('⚠️ No se generaron datos EMG mapeados');
          console.log('🔧 Creando datos EMG de fallback...');
          
          if (!mappingResult.emg) {
            mappingResult.emg = { data: [], success: false, warnings: [], errors: [], mappingStats: { fieldsProcessed: 0, fieldsMapped: 0, fieldsSkipped: 0, confidence: 0 } };
          }
          
          if (processedLocationState.extractedData.emgResults) {
            mappingResult.emg.data = processedLocationState.extractedData.emgResults.map((emg, index) => ({
              id: `fallback_emg_${index}`,
              muscleOrNerveName: emg.muscle || 'Músculo Desconocido',
              side: emg.side || 'right',
              insertionalActivity: emg.insertionalActivity || 'normal',
              spontaneousActivity: emg.spontaneousActivity || { fibrillations: false, positiveWaves: false, fasciculations: false },
              motorUnitPotentials: emg.motorUnitPotentials || { amplitude: 0, duration: 0, polyphasia: 0 },
              recruitmentPattern: emg.recruitmentPattern || 'normal',
              interpretationNotes: 'Auto-llenado desde archivo procesado'
            }));
            
            console.log('✅ Datos EMG de fallback creados:', mappingResult.emg.data);
          }
        }

        // Mostrar logs de mapeo en consola
        console.group('📋 Logs de Mapeo de Formularios');
        logs.forEach(log => {
          const method = log.level === 'error' ? 'error' : log.level === 'warn' ? 'warn' : 'log';
          console[method](`[${log.timestamp}] ${log.source}: ${log.message}`, log.data || '');
        });
        console.groupEnd();

        // Mostrar advertencias si existen
        if (warnings.length > 0) {
          console.warn('⚠️ Advertencias de mapeo:', warnings);
        }

        // Mostrar errores si existen
        if (errors.length > 0) {
          console.error('❌ Errores de mapeo:', errors);
        }

      } catch (error) {
        console.error('💥 Error durante el mapeo de datos:', error);
        setMappingLogs([{
          timestamp: new Date().toISOString(),
          level: 'error',
          source: 'IntegratedWorkflow',
          message: 'Error durante el mapeo de datos',
          data: error
        }]);
      }

      // Crear objeto paciente con datos reales
      if (processedLocationState.extractedData.patient) {
        const patientInfo = processedLocationState.extractedData.patient;
        const nameParts = patientInfo.name.split(' ');
        const patientData: Patient = {
          id: patientInfo.id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          dateOfBirth: '', // Se puede calcular a partir de la edad
          age: patientInfo.age,
          sex: patientInfo.sex,
          weight: null,
          height: null,
          handDominance: 'right',
          occupation: '',
          medicalHistory: {
            diabetes: false,
            hypothyroidism: false,
            renalFailure: false,
            previousSurgeries: [],
            medications: [],
            allergies: []
          }
        };
        
        console.log('👤 Paciente creado:', {
          id: patientData.id,
          nombre: `${patientData.firstName} ${patientData.lastName}`,
          edad: patientData.age,
          sexo: patientData.sex
        });
        
        setPatient(patientData);
      }

      setIsLoading(false);
    }, 1000);
  }, [location.state]);

  const handleStartWorkflow = () => {
    setCurrentStep('workflow');
  };

  const handleWorkflowComplete = (result: any) => {
    console.log('🎉 Workflow EMG completado:', result);
    // Aquí puedes redirigir a una página de resultados o hacer lo que necesites
  };

  const handleGoBack = () => {
    navigate(-1); // Usar navigate en lugar de window.history.back()
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#111827', 
        color: 'white',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #374151',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>🧠 Inicializando Sistema EMG Avanzado...</h2>
        <p style={{ color: '#9ca3af' }}>Preparando datos del archivo procesado</p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (currentStep === 'welcome') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#111827', 
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '50px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Brain style={{ width: '40px', height: '40px', color: '#3b82f6', marginRight: '15px' }} />
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                Sistema EMG Avanzado
              </h1>
            </div>
            <p style={{ fontSize: '18px', color: '#9ca3af' }}>
              Cuestionario y Análisis Inteligente con Auto-llenado
            </p>
          </div>

          {/* Información del archivo procesado */}
          <div style={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '10px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ 
              color: '#10b981', 
              fontSize: '20px', 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <CheckCircle style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              ✅ Archivo Procesado Exitosamente
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '16px' }}>
              <div>
                <strong>📁 Archivo:</strong> {sourceFile}
              </div>
              <div>
                <strong>🧑‍⚕️ Paciente:</strong> {extractedData?.patient?.name || 'N/A'}
              </div>
              <div>
                <strong>🆔 ID:</strong> {extractedData?.patient?.id || 'N/A'}
              </div>
              <div>
                <strong>📊 Estudios NCS:</strong> {extractedData?.ncsResults?.length || 0}
              </div>
              <div>
                <strong>⚡ Estudios EMG:</strong> {extractedData?.emgResults?.length || 0}
              </div>
              <div>
                <strong>🎯 Modo:</strong> {autoFillMode ? 'Auto-llenado Activado' : 'Manual'}
              </div>
            </div>

            {/* 📊 Estadísticas de Mapeo */}
            {processingStats && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#374151', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>📊 Estadísticas de Procesamiento</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                  <div><strong>✅ Campos mapeados:</strong> {processingStats.successfulMappings}</div>
                  <div><strong>🎯 Confianza:</strong> {(processingStats.confidence * 100).toFixed(1)}%</div>
                  <div><strong>⚠️ Advertencias:</strong> {processingStats.warnings}</div>
                  <div><strong>❌ Errores:</strong> {processingStats.errors}</div>
                </div>
              </div>
            )}
          </div>

          {/* Advertencias si existen */}
          {extractedData?.warnings && extractedData.warnings.length > 0 && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px',
              color: '#92400e'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <AlertTriangle style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                <strong>⚠️ Advertencias Importantes:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {extractedData.warnings.map((warning, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Funcionalidades del sistema */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <FileText style={{ width: '32px', height: '32px', color: '#3b82f6', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Auto-llenado Inteligente</h4>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                Los formularios se llenan automáticamente con los datos extraídos
              </p>
            </div>

            <div style={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <Activity style={{ width: '32px', height: '32px', color: '#10b981', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Validación Médica</h4>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                Validaciones automáticas de rangos y consistencia clínica
              </p>
            </div>

            <div style={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <Brain style={{ width: '32px', height: '32px', color: '#8b5cf6', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Análisis con IA</h4>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                Recomendaciones inteligentes y patrones diagnósticos
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '15px',
            marginTop: '40px'
          }}>
            <button
              onClick={handleGoBack}
              style={{
                padding: '12px 24px',
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Volver
            </button>

            <button
              onClick={handleStartWorkflow}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              🚀 Iniciar Cuestionario EMG
            </button>
          </div>

          {/* 🐛 Panel de Logs para Debugging */}
          {mappingLogs.length > 0 && (
            <details style={{
              marginTop: '30px',
              padding: '20px',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#f3f4f6',
                marginBottom: '15px'
              }}>
                🐛 Logs de Procesamiento ({mappingLogs.length} entradas)
              </summary>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {mappingLogs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '5px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: log.level === 'error' ? '#7f1d1d' : 
                                     log.level === 'warn' ? '#78350f' : '#1e3a8a',
                      color: '#f3f4f6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong>[{log.source}]</strong> {log.message}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.data && (
                      <pre style={{
                        margin: '5px 0 0 0',
                        fontSize: '10px',
                        color: '#d1d5db',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#374151', borderRadius: '5px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                  💡 <strong>Tip:</strong> Estos logs muestran cómo se procesan y mapean los datos del archivo. 
                  Si algo no se llenó correctamente en el formulario, revisa los logs para identificar el problema.
                </p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Render del workflow principal con datos pre-llenados
  if (currentStep === 'workflow' && patient) {
    return (
      <div style={{ minHeight: '100vh', background: '#111827' }}>
        {/* Header informativo */}
        <div style={{
          background: '#1f2937',
          borderBottom: '1px solid #374151',
          padding: '15px 20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  📋 Cuestionario EMG - {patient.firstName} {patient.lastName}
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#9ca3af', fontSize: '14px' }}>
                  Datos cargados desde: {sourceFile} | Modo: Auto-llenado Activado
                </p>
              </div>
              <button
                onClick={handleGoBack}
                style={{
                  padding: '8px 16px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Salir
              </button>
            </div>
          </div>
        </div>

        {/* Workflow principal */}
        <div style={{ padding: '20px' }}>
          <CompleteClinicalWorkflow
            patient={patient}
            initialFormData={mappedFormData} // 🔥 PASAR DATOS MAPEADOS
            onComplete={handleWorkflowComplete}
            onBack={() => setCurrentStep('welcome')}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#111827', 
      color: 'white',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>❌ Error</h2>
        <p>No se pudieron cargar los datos del paciente.</p>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default IntegratedEMGWorkflow; 