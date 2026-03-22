// 🧪 TEST DEL FORM DATA MAPPER MEJORADO
// =====================================
// Pruebas para verificar que el mapeo de nervios y estudios especiales funciona

import type { ExtractedFileData } from '../types/enhancedSystem';
import { FormDataMapper } from './formDataMapper';

// Datos de prueba que simulan lo que vendría del archivo RTF
const testExtractedData: ExtractedFileData = {
  patient: {
    name: 'Juan Pérez',
    id: 'TEST-001',
    age: 45,
    sex: 'male'
  },
  ncsResults: [
    {
      nerve: 'Mediano',
      side: 'right',
      latency: 4.2,
      amplitude: 8.5,
      velocity: 52.3,
      status: 'abnormal',
      findings: ['Latencia prolongada', 'Velocidad reducida']
    },
    {
      nerve: 'Ulnar',
      side: 'right',
      latency: 3.1,
      amplitude: 12.0,
      velocity: 58.7,
      status: 'normal'
    },
    {
      nerve: 'Tibial',
      side: 'left',
      latency: 5.8,
      amplitude: 15.2,
      velocity: 42.1,
      status: 'abnormal',
      findings: ['Velocidad de conducción lenta']
    }
  ],
  emgResults: [
    {
      muscle: 'Pronator Teres',
      side: 'right',
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
    },
    {
      muscle: 'First Dorsal Interosseous',
      side: 'right',
      insertionalActivity: 'increased',
      spontaneousActivity: {
        fibrillations: true,
        positiveWaves: true,
        fasciculations: false
      },
      motorUnitPotentials: {
        amplitude: 2800,
        duration: 18.2,
        polyphasia: 25
      },
      recruitmentPattern: 'reduced'
    }
  ],
  symptoms: {
    weakness: { present: true, severity: 'moderate' },
    paresthesias: { present: true, severity: 'mild' },
    pain: { present: false }
  },
  warnings: []
};

export function testFormDataMapper() {
  console.log('🧪 === INICIANDO PRUEBAS DEL FORM DATA MAPPER ===');
  console.log('📊 Datos de entrada:', testExtractedData);
  
  try {
    // Ejecutar el mapeo
    const mappingResult = FormDataMapper.mapAllFormData(testExtractedData);
    
    console.log('\n✅ === RESULTADOS DEL MAPEO ===');
    console.log('🔍 Mapeo general exitoso:', mappingResult.overall.success);
    console.log('📊 Total campos mapeados:', mappingResult.overall.totalFieldsMapped);
    console.log('🎯 Confianza general:', `${(mappingResult.overall.overallConfidence * 100).toFixed(1)}%`);
    
    // Verificar síntomas
    console.log('\n📋 === SÍNTOMAS MAPEADOS ===');
    console.log('Éxito:', mappingResult.symptoms.success);
    console.log('Debilidad presente:', mappingResult.symptoms.data.motor.weakness.present);
    console.log('Parestesias presentes:', mappingResult.symptoms.data.sensory.tingling.present);
    
    // Verificar NCS
    console.log('\n🔌 === NERVIOS NCS MAPEADOS ===');
    console.log('Éxito:', mappingResult.ncs.success);
    console.log('Cantidad de nervios:', mappingResult.ncs.data.length);
    mappingResult.ncs.data.forEach((ncs, index) => {
      console.log(`  Nervio ${index + 1}:`, {
        nerve: ncs.nerve,
        side: ncs.side,
        type: ncs.type,
        latency: ncs.latency,
        amplitude: ncs.amplitude,
        velocity: ncs.velocity,
        status: ncs.status
      });
    });
    
    // Verificar EMG
    console.log('\n🔬 === MÚSCULOS EMG MAPEADOS ===');
    console.log('Éxito:', mappingResult.emg.success);
    console.log('Cantidad de músculos:', mappingResult.emg.data.length);
    mappingResult.emg.data.forEach((emg, index) => {
      console.log(`  Músculo ${index + 1}:`, {
        muscle: emg.muscleOrNerveName,
        side: emg.side,
        insertionalActivity: emg.insertionalActivity,
        recruitmentPattern: emg.recruitmentPattern
      });
    });
    
    // Verificar Estudios Especiales
    console.log('\n⚡ === ESTUDIOS ESPECIALES MAPEADOS ===');
    console.log('Éxito:', mappingResult.specialStudies.success);
    console.log('No realizados:', mappingResult.specialStudies.data.notPerformed);
    console.log('Cantidad de estudios:', mappingResult.specialStudies.data.tests.length);
    mappingResult.specialStudies.data.tests.forEach((study: any, index: number) => {
      console.log(`  Estudio ${index + 1}:`, {
        name: study.name,
        type: study.type,
        side: study.side,
        status: study.status,
        notes: study.notes
      });
    });
    
    // Verificar paciente
    console.log('\n👤 === DATOS DEL PACIENTE ===');
    console.log('Nombre:', `${mappingResult.patient.firstName} ${mappingResult.patient.lastName}`);
    console.log('ID:', mappingResult.patient.id);
    console.log('Sexo:', mappingResult.patient.sex);
    
    // Mostrar advertencias y errores
    if (mappingResult.overall.warnings.length > 0) {
      console.log('\n⚠️ === ADVERTENCIAS ===');
      mappingResult.overall.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    if (mappingResult.overall.errors.length > 0) {
      console.log('\n❌ === ERRORES ===');
      mappingResult.overall.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎉 === PRUEBAS COMPLETADAS EXITOSAMENTE ===');
    return mappingResult;
    
  } catch (error) {
    console.error('💥 Error durante las pruebas:', error);
    throw error;
  }
}

export default testFormDataMapper; 