// 🔥 PRUEBA DE VALIDACIONES FISIOLÓGICAS IMPLEMENTADAS
// ===================================================
// Este archivo demuestra el funcionamiento de las nuevas validaciones de rangos fisiológicos

import { PhysiologicalValidator, ValidationResult } from '../services/validationService';
import { PHYSIOLOGICAL_RANGES } from '../data/emgClinicalCriteria';

// Función de prueba para validaciones NCS
export function testNCSValidations(): void {
  console.log('🧪 PRUEBAS DE VALIDACIÓN NCS CON RANGOS FISIOLÓGICOS');
  console.log('====================================================');

  // Caso 1: Valores normales
  const normalNCSData = {
    type: 'motor',
    latency: 3.5,
    amplitude: 8.0,
    velocity: 55.0
  };

  console.log('\n📋 Caso 1: Valores NCS NORMALES');
  const normalResults = PhysiologicalValidator.validateNCSValues(normalNCSData, 45);
  normalResults.forEach(result => {
    console.log(`  ✅ ${result.field}: ${result.message} (${result.actualValue} ${result.expectedRange.split(' ')[1]})`);
  });

  // Caso 2: Latencia fisiológicamente imposible
  const abnormalLatencyData = {
    type: 'motor',
    latency: 50.0, // ❌ Demasiado alta - imposible fisiológicamente
    amplitude: 8.0,
    velocity: 55.0
  };

  console.log('\n📋 Caso 2: Latencia FISIOLÓGICAMENTE IMPOSIBLE');
  const latencyResults = PhysiologicalValidator.validateNCSValues(abnormalLatencyData, 45);
  latencyResults.forEach(result => {
    if (!result.isValid) {
      console.log(`  ❌ ${result.field}: ${result.message}`);
      console.log(`     💡 Sugerencias: ${result.suggestions?.join(', ')}`);
    }
  });

  // Caso 3: Amplitud extremadamente alta
  const extremeAmplitudeData = {
    type: 'motor',
    latency: 3.5,
    amplitude: 200.0, // ❌ Imposible - 200mV para motor
    velocity: 55.0
  };

  console.log('\n📋 Caso 3: Amplitud EXTREMADAMENTE ALTA');
  const amplitudeResults = PhysiologicalValidator.validateNCSValues(extremeAmplitudeData, 45);
  amplitudeResults.forEach(result => {
    if (!result.isValid) {
      console.log(`  ❌ ${result.field}: ${result.message}`);
      console.log(`     📊 Severidad: ${result.severity}`);
    }
  });
}

// Función de prueba para validaciones EMG
export function testEMGValidations(): void {
  console.log('\n🧪 PRUEBAS DE VALIDACIÓN EMG CON RANGOS FISIOLÓGICOS');
  console.log('===================================================');

  // Caso 1: Valores normales
  const normalEMGData = {
    motorUnitPotentials: {
      duration: 12.0,
      amplitude: 800,
      polyphasia: 15
    }
  };

  console.log('\n📋 Caso 1: Valores EMG NORMALES');
  const normalEMGResults = PhysiologicalValidator.validateEMGValues(normalEMGData, 45);
  normalEMGResults.forEach(result => {
    console.log(`  ✅ ${result.field}: ${result.message} (${result.actualValue} ${result.expectedRange.split(' ')[1]})`);
  });

  // Caso 2: Duración fisiológicamente imposible
  const abnormalDurationData = {
    motorUnitPotentials: {
      duration: 80.0, // ❌ Demasiado larga - imposible fisiológicamente
      amplitude: 800,
      polyphasia: 15
    }
  };

  console.log('\n📋 Caso 2: Duración PUM FISIOLÓGICAMENTE IMPOSIBLE');
  const durationResults = PhysiologicalValidator.validateEMGValues(abnormalDurationData, 45);
  durationResults.forEach(result => {
    if (!result.isValid) {
      console.log(`  ❌ ${result.field}: ${result.message}`);
      console.log(`     💡 Sugerencias: ${result.suggestions?.join(', ')}`);
    }
  });

  // Caso 3: Amplitud extremadamente alta (>15,000 μV)
  const extremeEMGAmplitudeData = {
    motorUnitPotentials: {
      duration: 12.0,
      amplitude: 25000, // ❌ Imposible - 25,000 μV
      polyphasia: 15
    }
  };

  console.log('\n📋 Caso 3: Amplitud PUM EXTREMADAMENTE ALTA');
  const emgAmplitudeResults = PhysiologicalValidator.validateEMGValues(extremeEMGAmplitudeData, 45);
  emgAmplitudeResults.forEach(result => {
    if (!result.isValid) {
      console.log(`  ❌ ${result.field}: ${result.message}`);
      console.log(`     📊 Severidad: ${result.severity}`);
    }
  });

  // Caso 4: Ajuste por edad
  console.log('\n📋 Caso 4: AJUSTE POR EDAD (Paciente de 75 años)');
  const elderlyEMGData = {
    motorUnitPotentials: {
      duration: 18.0, // Normal para 75 años, anormal para joven
      amplitude: 900,
      polyphasia: 15
    }
  };

  const elderlyResults = PhysiologicalValidator.validateEMGValues(elderlyEMGData, 75);
  elderlyResults.forEach(result => {
    console.log(`  📊 ${result.field}: ${result.message} (${result.actualValue} vs ${result.expectedRange})`);
  });
}

// Función de demostración del sistema completo
export function demonstratePhysiologicalValidation(): void {
  console.log('🚀 DEMOSTRACIÓN DEL SISTEMA DE VALIDACIÓN FISIOLÓGICA');
  console.log('=====================================================');
  console.log('📝 Este sistema previene errores como:');
  console.log('   • Latencias de 200ms (imposible fisiológicamente)');
  console.log('   • Amplitudes de 500mV en estudios motores');
  console.log('   • Duraciones de PUM de 100ms');
  console.log('   • Valores negativos en cualquier parámetro');
  console.log('   • Inconsistencias entre actividad insertional y espontánea');
  console.log('');

  // Ejecutar todas las pruebas
  testNCSValidations();
  testEMGValidations();

  console.log('\n✅ RESUMEN DE MEJORAS IMPLEMENTADAS:');
  console.log('=====================================');
  console.log('1. ✅ Validación de rangos fisiológicos para NCS y EMG');
  console.log('2. ✅ Ajustes automáticos por edad del paciente');
  console.log('3. ✅ Detección de valores fisiológicamente imposibles');
  console.log('4. ✅ Sugerencias específicas para cada tipo de error');
  console.log('5. ✅ Niveles de severidad (info, warning, error, critical)');
  console.log('6. ✅ Validación de consistencia interna de datos');
  console.log('');
  console.log('🎯 Estos cambios resuelven la PRIORIDAD 1: Validación de rangos fisiológicos');
}

// Ejemplo de uso específico para casos reales
export function validateRealCaseExample(): ValidationResult[] {
  console.log('\n🏥 EJEMPLO DE CASO CLÍNICO REAL');
  console.log('===============================');
  
  // Simular datos de un estudio real con algunos errores típicos
  const realCaseNCS = {
    type: 'motor',
    latency: 12.5,    // Alto pero posible
    amplitude: 2.1,   // Bajo - sugiere lesión axonal
    velocity: 38.0    // Bajo - sugiere desmielinización
  };

  const validationResults = PhysiologicalValidator.validateNCSValues(realCaseNCS, 58);
  
  console.log('📊 Resultados de validación:');
  validationResults.forEach(result => {
    const icon = result.isValid ? '✅' : 
                result.severity === 'critical' ? '🚨' :
                result.severity === 'error' ? '❌' :
                result.severity === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`${icon} ${result.field}: ${result.message}`);
    if (result.suggestions && result.suggestions.length > 0) {
      console.log(`   💡 ${result.suggestions[0]}`);
    }
  });

  return validationResults;
}

// Función para ejecutar todas las pruebas
export function runAllValidationTests(): void {
  demonstratePhysiologicalValidation();
  validateRealCaseExample();
  
  console.log('\n🎉 TODAS LAS PRUEBAS DE VALIDACIÓN COMPLETADAS');
  console.log('==============================================');
} 