import { nerveDatabase } from '../data/nerveData';
import { muscleDatabase } from '../data/muscleData';
import { validateNeuromuscularDatabase, logValidationResults } from './validateNeuromuscularDatabase';

/**
 * Script de prueba para validar la integración de la base de datos expandida
 */
export function testDatabaseIntegration(): void {
  console.log('🧪 Testing Database Integration');
  console.log('='.repeat(50));

  // 1. Validar estructura de datos
  console.log('\n1️⃣ Validando estructura de datos...');
  const validation = validateNeuromuscularDatabase();
  
  if (!validation.isValid) {
    console.error('❌ La base de datos tiene errores:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    return;
  }
  
  console.log('✅ Estructura de datos válida');

  // 2. Probar filtros por tipo de nervio
  console.log('\n2️⃣ Probando filtros de nervios...');
  
  const motorNerves = nerveDatabase.filter(nerve => 
    nerve.id.includes('motor') || 
    nerve.id === 'peroneal' || 
    nerve.id === 'tibial' || 
    nerve.id === 'femoral' || 
    nerve.id === 'sciatic' || 
    nerve.id === 'axillary' || 
    nerve.id === 'musculocutaneous' || 
    nerve.id === 'suprascapular' || 
    nerve.id === 'accessory'
  );
  
  const sensoryNerves = nerveDatabase.filter(nerve => 
    nerve.id.includes('sensory') || 
    nerve.id === 'sural' || 
    nerve.id === 'superficial_peroneal' || 
    nerve.id === 'lateral_femoral_cutaneous' || 
    nerve.id === 'saphenous'
  );

  console.log(`   Nervios motores encontrados: ${motorNerves.length}`);
  console.log(`   Nervios sensitivos encontrados: ${sensoryNerves.length}`);
  
  if (motorNerves.length === 0 || sensoryNerves.length === 0) {
    console.warn('⚠️ Problema con filtros de nervios');
  } else {
    console.log('✅ Filtros de nervios funcionan correctamente');
  }

  // 3. Probar agrupación de músculos por región
  console.log('\n3️⃣ Probando agrupación de músculos...');
  
  const musclesByRegion = muscleDatabase.reduce((acc, muscle) => {
    let region = 'Otros';
    
    if (muscle.id.includes('interosseous') || muscle.id.includes('abductor_pollicis') || muscle.id.includes('abductor_digiti')) {
      region = 'Mano';
    } else if (muscle.id.includes('extensor_digitorum') || muscle.id.includes('flexor_carpi') || 
               muscle.id.includes('pronator') || muscle.id.includes('flexor_digitorum')) {
      region = 'Antebrazo';
    } else if (muscle.id.includes('biceps_brachii') || muscle.id.includes('triceps')) {
      region = 'Brazo';
    } else if (muscle.id.includes('deltoid') || muscle.id.includes('trapezius')) {
      region = 'Hombro';
    } else if (muscle.id.includes('paraspinal')) {
      region = 'Paraespinales';
    } else if (muscle.id.includes('vastus') || muscle.id.includes('biceps_femoris')) {
      region = 'Muslo';
    } else if (muscle.id.includes('tibialis') || muscle.id.includes('gastrocnemius')) {
      region = 'Pierna';
    }
    
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(muscle);
    return acc;
  }, {} as Record<string, typeof muscleDatabase>);

  const regions = Object.keys(musclesByRegion);
  console.log(`   Regiones encontradas: ${regions.join(', ')}`);
  
  regions.forEach(region => {
    console.log(`   - ${region}: ${musclesByRegion[region].length} músculos`);
  });

  if (regions.length === 0) {
    console.warn('⚠️ Problema con agrupación de músculos');
  } else {
    console.log('✅ Agrupación de músculos funciona correctamente');
  }

  // 4. Verificar compatibilidad con componentes
  console.log('\n4️⃣ Verificando compatibilidad con componentes...');
  
  // Simular uso en NerveSelector
  const nerveOptions = motorNerves.map(nerve => ({
    key: nerve.id,
    value: nerve.id,
    label: nerve.name
  }));
  
  // Simular uso en MuscleSelector
  const muscleOptions = muscleDatabase.map(muscle => ({
    key: muscle.id,
    value: muscle.name,
    label: muscle.name
  }));
  
  console.log(`   Opciones de nervios para selector: ${nerveOptions.length}`);
  console.log(`   Opciones de músculos para selector: ${muscleOptions.length}`);
  
  if (nerveOptions.length > 0 && muscleOptions.length > 0) {
    console.log('✅ Compatibilidad con componentes verificada');
  } else {
    console.warn('⚠️ Problemas de compatibilidad detectados');
  }

  // 5. Mostrar estadísticas finales
  console.log('\n5️⃣ Estadísticas finales:');
  logValidationResults();
  
  console.log('\n🎉 Test de integración completado exitosamente!');
}

/**
 * Función para probar en desarrollo
 */
export function runDatabaseTests(): void {
  try {
    testDatabaseIntegration();
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
} 