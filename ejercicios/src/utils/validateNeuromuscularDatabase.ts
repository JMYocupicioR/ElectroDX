import { nerveDatabase } from '../data/nerveData';
import { muscleDatabase } from '../data/muscleData';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalNerves: number;
    totalMuscles: number;
    nervesByType: {
      motor: number;
      sensory: number;
    };
    musclesByRegion: {
      hand: number;
      forearm: number;
      arm: number;
      shoulder: number;
      paraspinal: number;
      thigh: number;
      leg: number;
    };
  };
}

export function validateNeuromuscularDatabase(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar nervios
  const nerveIds = new Set<string>();
  let motorNerves = 0;
  let sensoryNerves = 0;

  nerveDatabase.forEach((nerve, index) => {
    // Verificar IDs únicos
    if (nerveIds.has(nerve.id)) {
      errors.push(`Nerve ID duplicado: ${nerve.id}`);
    }
    nerveIds.add(nerve.id);

    // Verificar estructura
    if (!nerve.name) {
      errors.push(`Nervio en índice ${index} sin nombre`);
    }

    if (!nerve.referenceValues) {
      errors.push(`Nervio ${nerve.id} sin valores de referencia`);
    } else {
      const { latency, amplitude, velocity } = nerve.referenceValues;
      
      if (!latency || latency.min >= latency.max) {
        errors.push(`Nervio ${nerve.id}: valores de latencia inválidos`);
      }
      
      if (!amplitude || amplitude.min >= amplitude.max) {
        errors.push(`Nervio ${nerve.id}: valores de amplitud inválidos`);
      }
      
      if (!velocity || velocity.min >= velocity.max) {
        errors.push(`Nervio ${nerve.id}: valores de velocidad inválidos`);
      }
    }

    // Contar tipos
    if (nerve.id.includes('motor') || nerve.id.includes('axillary') || nerve.id.includes('musculocutaneous') || 
        nerve.id.includes('suprascapular') || nerve.id.includes('accessory') || nerve.id.includes('femoral') ||
        nerve.id.includes('sciatic') || nerve.id.includes('peroneal') || nerve.id.includes('tibial') ||
        nerve.id === 'radial_motor') {
      motorNerves++;
    } else if (nerve.id.includes('sensory') || nerve.id.includes('sural') || nerve.id.includes('superficial') ||
               nerve.id.includes('cutaneous') || nerve.id.includes('saphenous')) {
      sensoryNerves++;
    }
  });

  // Validar músculos
  const muscleIds = new Set<string>();
  const musclesByRegion = {
    hand: 0,
    forearm: 0,
    arm: 0,
    shoulder: 0,
    paraspinal: 0,
    thigh: 0,
    leg: 0
  };

  muscleDatabase.forEach((muscle, index) => {
    // Verificar IDs únicos
    if (muscleIds.has(muscle.id)) {
      errors.push(`Muscle ID duplicado: ${muscle.id}`);
    }
    muscleIds.add(muscle.id);

    // Verificar estructura
    if (!muscle.name) {
      errors.push(`Músculo en índice ${index} sin nombre`);
    }

    if (!muscle.innervation) {
      errors.push(`Músculo ${muscle.id} sin información de inervación`);
    } else {
      if (!muscle.innervation.nerve) {
        errors.push(`Músculo ${muscle.id} sin nervio de inervación`);
      }
      if (!muscle.innervation.root) {
        errors.push(`Músculo ${muscle.id} sin raíces nerviosas`);
      }
    }

    if (!muscle.referenceValues) {
      errors.push(`Músculo ${muscle.id} sin valores de referencia`);
    } else {
      const { motorUnitPotentials } = muscle.referenceValues;
      
      if (!motorUnitPotentials) {
        errors.push(`Músculo ${muscle.id} sin valores de potenciales de unidad motora`);
      } else {
        if (!motorUnitPotentials.duration || motorUnitPotentials.duration.min >= motorUnitPotentials.duration.max) {
          errors.push(`Músculo ${muscle.id}: valores de duración inválidos`);
        }
        
        if (!motorUnitPotentials.amplitude || motorUnitPotentials.amplitude.min >= motorUnitPotentials.amplitude.max) {
          errors.push(`Músculo ${muscle.id}: valores de amplitud inválidos`);
        }
        
        if (!motorUnitPotentials.polyphasia || motorUnitPotentials.polyphasia.min >= motorUnitPotentials.polyphasia.max) {
          errors.push(`Músculo ${muscle.id}: valores de polifasia inválidos`);
        }
      }
    }

    // Categorizar por región
    if (muscle.id.includes('interosseous') || muscle.id.includes('abductor_pollicis') || muscle.id.includes('abductor_digiti')) {
      musclesByRegion.hand++;
    } else if (muscle.id.includes('extensor_digitorum') || muscle.id.includes('flexor_carpi') || 
               muscle.id.includes('pronator') || muscle.id.includes('flexor_digitorum')) {
      musclesByRegion.forearm++;
    } else if (muscle.id.includes('biceps_brachii') || muscle.id.includes('triceps')) {
      musclesByRegion.arm++;
    } else if (muscle.id.includes('deltoid') || muscle.id.includes('trapezius')) {
      musclesByRegion.shoulder++;
    } else if (muscle.id.includes('paraspinal')) {
      musclesByRegion.paraspinal++;
    } else if (muscle.id.includes('vastus') || muscle.id.includes('biceps_femoris')) {
      musclesByRegion.thigh++;
    } else if (muscle.id.includes('tibialis') || muscle.id.includes('gastrocnemius')) {
      musclesByRegion.leg++;
    }
  });

  // Verificar referencias entre nervios y músculos
  const specialNerves = ['cervical_roots', 'lumbar_roots'];
  muscleDatabase.forEach((muscle) => {
    const referencedNerve = muscle.innervation.nerve;
    const nerveExists = nerveDatabase.some(nerve => nerve.id === referencedNerve) || 
                       specialNerves.indexOf(referencedNerve) !== -1;
    
    if (!nerveExists) {
      warnings.push(`Músculo ${muscle.id} referencia nervio inexistente: ${referencedNerve}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalNerves: nerveDatabase.length,
      totalMuscles: muscleDatabase.length,
      nervesByType: {
        motor: motorNerves,
        sensory: sensoryNerves
      },
      musclesByRegion
    }
  };
}

export function logValidationResults(): void {
  const result = validateNeuromuscularDatabase();
  
  console.log('🔍 Validación de Base de Datos Neuromuscular');
  console.log('='.repeat(50));
  
  console.log('\n📊 Resumen:');
  console.log(`- Total de nervios: ${result.summary.totalNerves}`);
  console.log(`  • Motores: ${result.summary.nervesByType.motor}`);
  console.log(`  • Sensitivos: ${result.summary.nervesByType.sensory}`);
  console.log(`- Total de músculos: ${result.summary.totalMuscles}`);
  console.log(`  • Mano: ${result.summary.musclesByRegion.hand}`);
  console.log(`  • Antebrazo: ${result.summary.musclesByRegion.forearm}`);
  console.log(`  • Brazo: ${result.summary.musclesByRegion.arm}`);
  console.log(`  • Hombro: ${result.summary.musclesByRegion.shoulder}`);
  console.log(`  • Paraespinales: ${result.summary.musclesByRegion.paraspinal}`);
  console.log(`  • Muslo: ${result.summary.musclesByRegion.thigh}`);
  console.log(`  • Pierna: ${result.summary.musclesByRegion.leg}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errores encontrados:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Advertencias:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (result.isValid) {
    console.log('\n✅ Base de datos válida y lista para usar!');
  } else {
    console.log('\n❌ Se encontraron errores que deben corregirse.');
  }
} 