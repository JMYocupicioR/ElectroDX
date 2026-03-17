// src/content/modules/module-09-pathologies.ts
import { Module } from '../../types/content';
import { peripheralNeuropathies } from './module-09-pathologies-part1';
import { inflammatoryNeuropathies, mononeuropathies } from './module-09-pathologies-part2';
import { radiculopathies, plexopathies } from './module-09-pathologies-part3';
import { motorNeuronDiseases, nmjDisorders, myopathies } from './module-09-pathologies-part4';

export const module09: Module = {
  id: 'pathologies',
  number: 9,
  title: 'Patologías Neuromusculares y Patrones Electrodiagnósticos',
  titleEn: 'Neuromuscular Pathologies and Electrodiagnostic Patterns',
  emoji: '🩺',
  description: 'Neuropatías, miopatías, enfermedades de motoneurona, trastornos de UNM y más',
  descriptionEn: 'Neuropathies, myopathies, motor neuron diseases, NMJ disorders and more',
  color: 'from-red-500 to-red-800',
  icon: 'Stethoscope',
  topics: [
    peripheralNeuropathies,
    inflammatoryNeuropathies,
    mononeuropathies,
    radiculopathies,
    plexopathies,
    motorNeuronDiseases,
    nmjDisorders,
    myopathies,
  ]
};
