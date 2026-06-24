// Valores alineados con src/content/modules/module-02-nerve-conduction.ts
import { NerveData } from '../types/emg';

export const nerveDatabase: NerveData[] = [
  // Upper Extremity - Motor
  {
    id: 'median_motor',
    name: 'Nervio Mediano - Motor (Muñeca-APB)',
    referenceValues: {
      latency: { min: 3.4, max: 4.4 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'median_motor_elbow',
    name: 'Nervio Mediano - Motor (Codo-APB)',
    referenceValues: {
      latency: { min: 6.0, max: 8.5 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'ulnar_motor',
    name: 'Nervio Cubital - Motor (Muñeca-ADM)',
    referenceValues: {
      latency: { min: 2.5, max: 3.4 },
      amplitude: { min: 5.0, max: 25.0 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'ulnar_motor_elbow',
    name: 'Nervio Cubital - Motor (Codo-ADM)',
    referenceValues: {
      latency: { min: 6.5, max: 9.0 },
      amplitude: { min: 5.0, max: 25.0 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'radial_motor',
    name: 'Nervio Radial - Motor (Antebrazo-EIP)',
    referenceValues: {
      latency: { min: 2.5, max: 3.5 },
      amplitude: { min: 4.0, max: 15.0 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'axillary',
    name: 'Nervio Axilar - Motor',
    referenceValues: {
      latency: { min: 3.8, max: 5.5 },
      amplitude: { min: 3.5, max: 15.0 },
      velocity: { min: 50, max: 65 },
    },
  },
  {
    id: 'musculocutaneous',
    name: 'Nervio Musculocutáneo - Motor',
    referenceValues: {
      latency: { min: 3.4, max: 4.9 },
      amplitude: { min: 3.5, max: 21.0 },
      velocity: { min: 50, max: 65 },
    },
  },
  {
    id: 'suprascapular',
    name: 'Nervio Supraescapular - Motor',
    referenceValues: {
      latency: { min: 3.4, max: 4.9 },
      amplitude: { min: 4.0, max: 15.0 },
      velocity: { min: 60, max: 75 },
    },
  },
  {
    id: 'accessory',
    name: 'Nervio Accesorio Espinal - Motor',
    referenceValues: {
      latency: { min: 2.0, max: 4.0 },
      amplitude: { min: 3.0, max: 8.0 },
      velocity: { min: 60, max: 70 },
    },
  },

  // Upper Extremity - Sensory
  {
    id: 'median_sensory',
    name: 'Nervio Mediano - Sensitivo (Dedo II-Muñeca)',
    referenceValues: {
      latency: { min: 2.8, max: 3.6 },
      amplitude: { min: 15, max: 60 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'median_sensory_palm',
    name: 'Nervio Mediano - Sensitivo (Palma-Muñeca)',
    referenceValues: {
      latency: { min: 1.5, max: 2.2 },
      amplitude: { min: 20, max: 80 },
      velocity: { min: 45, max: 65 },
    },
  },
  {
    id: 'ulnar_sensory',
    name: 'Nervio Cubital - Sensitivo (Dedo V-Muñeca)',
    referenceValues: {
      latency: { min: 2.8, max: 3.5 },
      amplitude: { min: 10, max: 50 },
      velocity: { min: 50, max: 70 },
    },
  },
  {
    id: 'radial_sensory',
    name: 'Nervio Radial - Sensitivo (Tabaquera-Antebrazo)',
    referenceValues: {
      latency: { min: 2.1, max: 2.8 },
      amplitude: { min: 15, max: 60 },
      velocity: { min: 50, max: 70 },
    },
  },

  // Lower Extremity - Motor
  {
    id: 'peroneal_motor',
    name: 'Nervio Peroneo Común - Motor (Tobillo-EDB)',
    referenceValues: {
      latency: { min: 4.0, max: 6.3 },
      amplitude: { min: 2.0, max: 15.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'peroneal_motor_knee',
    name: 'Nervio Peroneo Común - Motor (Rodilla-EDB)',
    referenceValues: {
      latency: { min: 9.0, max: 14.0 },
      amplitude: { min: 2.0, max: 15.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'tibial_motor',
    name: 'Nervio Tibial - Motor (Tobillo-Abductor Hallucis)',
    referenceValues: {
      latency: { min: 3.8, max: 5.8 },
      amplitude: { min: 4.0, max: 25.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'tibial_motor_knee',
    name: 'Nervio Tibial - Motor (Rodilla-Abductor Hallucis)',
    referenceValues: {
      latency: { min: 13.0, max: 18.0 },
      amplitude: { min: 4.0, max: 25.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'femoral',
    name: 'Nervio Femoral - Motor',
    referenceValues: {
      latency: { min: 5.0, max: 7.0 },
      amplitude: { min: 3.0, max: 15.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'sciatic',
    name: 'Nervio Ciático - Motor',
    referenceValues: {
      latency: { min: 4.5, max: 7.0 },
      amplitude: { min: 2.5, max: 12.0 },
      velocity: { min: 40, max: 55 },
    },
  },

  // Lower Extremity - Sensory
  {
    id: 'sural_sensory',
    name: 'Nervio Sural - Sensitivo (Pantorrilla-Tobillo)',
    referenceValues: {
      latency: { min: 3.2, max: 4.3 },
      amplitude: { min: 5, max: 25 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'peroneal_superficial_sensory',
    name: 'Nervio Peroneo Superficial - Sensitivo',
    referenceValues: {
      latency: { min: 2.6, max: 3.5 },
      amplitude: { min: 8, max: 26 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'saphenous_sensory',
    name: 'Nervio Safeno - Sensitivo',
    referenceValues: {
      latency: { min: 3.2, max: 4.3 },
      amplitude: { min: 3, max: 12 },
      velocity: { min: 40, max: 55 },
    },
  },
  {
    id: 'lateral_femoral_cutaneous',
    name: 'Nervio Femorocutáneo Lateral - Sensitivo',
    referenceValues: {
      latency: { min: 2.4, max: 2.9 },
      amplitude: { min: 5.0, max: 25.0 },
      velocity: { min: 43, max: 60 },
    },
  },

  // Alias IDs (backward compatibility — mismos rangos que entradas canónicas)
  {
    id: 'peroneal',
    name: 'Peroneo',
    referenceValues: {
      latency: { min: 4.0, max: 6.3 },
      amplitude: { min: 2.0, max: 15.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'tibial',
    name: 'Tibial',
    referenceValues: {
      latency: { min: 3.8, max: 5.8 },
      amplitude: { min: 4.0, max: 25.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'sural',
    name: 'Sural',
    referenceValues: {
      latency: { min: 3.2, max: 4.3 },
      amplitude: { min: 5.0, max: 25.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'superficial_peroneal',
    name: 'Peroneo Superficial',
    referenceValues: {
      latency: { min: 2.6, max: 3.5 },
      amplitude: { min: 8.0, max: 26.0 },
      velocity: { min: 40, max: 60 },
    },
  },
  {
    id: 'saphenous',
    name: 'Safeno',
    referenceValues: {
      latency: { min: 3.2, max: 4.3 },
      amplitude: { min: 3.0, max: 12.0 },
      velocity: { min: 40, max: 55 },
    },
  },
];
