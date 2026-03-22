export interface EMGMuscleData {
  selected: boolean;
  strength: number;
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: 'absent' | 'present' | 'increased';
    positiveWaves: 'absent' | 'present' | 'increased';
    fasciculations: 'absent' | 'present' | 'increased';
  };
  motorUnitPotentials: {
    duration: number;
    amplitude: number;
    polyphasia: number;
    recruitment: 'normal' | 'reduced' | 'early';
  };
  interference: 'normal' | 'reduced' | 'full';
  status?: 'normal' | 'abnormal';
  findings?: string[];
}

export interface EMGResults {
  muscle: string;
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: string;
  motorUnitActionPotentials: {
    amplitude: number;
    duration: number;
    polyphasia: number;
  };
  recruitment: 'normal' | 'reduced' | 'early';
  interferencePattern: 'normal' | 'reduced' | 'full';
  status?: 'normal' | 'abnormal';
  findings?: string[];
}

export interface EMGResultsBase {
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: boolean;
    positiveWaves: boolean;
    fasciculations: boolean;
  };
  motorUnitPotentials: {
    duration: number;
    amplitude: number;
    polyphasia: number;
  };
  recruitmentPattern: 'normal' | 'reduced' | 'early';
  status?: 'normal' | 'abnormal';
  findings?: string[];
}

export interface EMGMuscleEvaluation {
  left?: {
    selected: boolean;
    insertionalActivity: 'normal' | 'increased' | 'decreased';
    spontaneousActivity: {
      fibrillations: 'absent' | 'present' | 'increased';
      positiveWaves: 'absent' | 'present' | 'increased';
      fasciculations: 'absent' | 'present' | 'increased';
    };
    motorUnitAnalysis: {
      duration: number;
      amplitude: number;
      polyphasia: 'normal' | 'increased';
      recruitment: 'normal' | 'reduced' | 'early';
    };
  };
  right?: {
    selected: boolean;
    insertionalActivity: 'normal' | 'increased' | 'decreased';
    spontaneousActivity: {
      fibrillations: 'absent' | 'present' | 'increased';
      positiveWaves: 'absent' | 'present' | 'increased';
      fasciculations: 'absent' | 'present' | 'increased';
    };
    motorUnitAnalysis: {
      duration: number;
      amplitude: number;
      polyphasia: 'normal' | 'increased';
      recruitment: 'normal' | 'reduced' | 'early';
    };
  };
}

export interface UnifiedEMGResults {
  muscle: string;
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: string;
  motorUnitActionPotentials: {
    amplitude: number;
    duration: number;
    polyphasia: number;
  };
  recruitment: 'normal' | 'reduced' | 'early';
  interferencePattern: 'normal' | 'reduced' | 'full';
  status?: 'normal' | 'abnormal';
  findings?: string[];
}

export interface EMGDisplayData {
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: boolean;
    positiveWaves: boolean;
    fasciculations: boolean;
  };
  motorUnitPotentials: {
    duration: number;
    amplitude: number;
    polyphasia: number;
  };
  recruitmentPattern: 'normal' | 'reduced' | 'early';
  status?: 'normal' | 'abnormal';
  findings?: string[];
}

export interface NerveData {
  id: string;
  name: string;
  referenceValues: {
    latency: {
      min: number;
      max: number;
    };
    amplitude: {
      min: number;
      max: number;
    };
    velocity: {
      min: number;
      max: number;
    };
  };
}

export interface FWaveData {
  latency: number;
  persistence: number;
  chronodispersion: number;
}

export interface NCSResults {
  motorNerves: {
    [key: string]: {
      right: NerveData;
      left: NerveData;
    };
  };
  sensoryNerves: {
    [key: string]: {
      right: NerveData;
      left: NerveData;
    };
  };
  fWaves: {
    [key: string]: {
      right: FWaveData;
      left: FWaveData;
    };
  };
}

// Type guards
export function isEMGResultsBase(data: unknown): data is EMGResultsBase {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as EMGResultsBase;
  return (
    typeof d.insertionalActivity === 'string' &&
    typeof d.spontaneousActivity === 'object' &&
    d.spontaneousActivity !== null &&
    typeof d.motorUnitPotentials === 'object' &&
    d.motorUnitPotentials !== null &&
    typeof d.motorUnitPotentials.duration === 'number' &&
    typeof d.motorUnitPotentials.amplitude === 'number' &&
    typeof d.motorUnitPotentials.polyphasia === 'number' &&
    typeof d.recruitmentPattern === 'string'
  );
}

export function isEMGDisplayData(data: unknown): data is EMGDisplayData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as EMGDisplayData;
  return (
    typeof d.insertionalActivity === 'string' &&
    typeof d.spontaneousActivity === 'object' &&
    d.spontaneousActivity !== null &&
    typeof d.motorUnitPotentials === 'object' &&
    d.motorUnitPotentials !== null &&
    typeof d.motorUnitPotentials.duration === 'number' &&
    typeof d.motorUnitPotentials.amplitude === 'number' &&
    typeof d.motorUnitPotentials.polyphasia === 'number' &&
    typeof d.recruitmentPattern === 'string'
  );
}

// Helper function to safely convert EMGResultsBase to UnifiedEMGResults
export function convertToUnifiedEMGResults(emgData: EMGResultsBase): UnifiedEMGResults {
  if (!isEMGResultsBase(emgData)) {
    throw new Error('Invalid EMG data format');
  }

  return {
    muscle: 'default',
    side: 'right',
    insertionalActivity: emgData.insertionalActivity,
    spontaneousActivity: `${emgData.spontaneousActivity.fibrillations ? 'Fibrillations, ' : ''}${emgData.spontaneousActivity.positiveWaves ? 'Positive Waves, ' : ''}${emgData.spontaneousActivity.fasciculations ? 'Fasciculations' : ''}`.trim(),
    motorUnitActionPotentials: {
      amplitude: emgData.motorUnitPotentials.amplitude,
      duration: emgData.motorUnitPotentials.duration,
      polyphasia: emgData.motorUnitPotentials.polyphasia
    },
    recruitment: emgData.recruitmentPattern,
    interferencePattern: 'normal',
    status: emgData.status,
    findings: emgData.findings || []
  };
} 