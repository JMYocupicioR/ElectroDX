export interface NCSMeasurement {
  selected: boolean;
  latency: number;
  amplitude: number;
  velocity: number;
}

export interface NCSNerveData {
  left?: NCSMeasurement;
  right?: NCSMeasurement;
}

export interface NCSData {
  motor: {
    [nerveId: string]: NCSNerveData;
  };
  sensory: {
    [nerveId: string]: NCSNerveData;
  };
}

export interface ReferenceValueRange { min: number; max: number; }

export interface NCSTestReferenceValues {
  latency?: ReferenceValueRange;
  amplitude?: ReferenceValueRange;
  velocity?: ReferenceValueRange;
  // Add other parameters if needed, e.g., for H-Reflex
}

export interface NCSTestResult {
  id: string; // Added for better keying if these results are listed
  nerve: string;
  type: 'motor' | 'sensory';
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  amplitudeUnit?: 'mV' | 'µV';
  velocity: number;
  // fWavePersistence?: number; // Optional: add if you capture this
  status: 'normal' | 'abnormal' | 'undetermined'; // Added undetermined
  findings?: string[];
  abnormalParameters?: ('latency' | 'amplitude' | 'velocity')[];
  referenceValues?: NCSTestReferenceValues;
}

// This NCSResults seems more detailed and might be a good target structure in the future,
// but for now, we focus on enriching NCSTestResult as it's used in the current flow.
export interface NCSResults {
  id: string;
  nerve: string;
  type: 'motor' | 'sensory';
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  velocity: number;
  status?: 'normal' | 'abnormal';
  findings?: string[];
  fWave?: {
    latency: number;
    persistence?: number; // Made optional
  };
  hReflex?: {
    latency: number;
    amplitude: number;
  };
  // We could merge attributes from NCSTestResult like amplitudeUnit, referenceValues, abnormalParameters here too.
}

export interface NerveData {
  left?: {
    selected: boolean;
    latency: number;
    amplitude: number;
    velocity: number;
  };
  right?: {
    selected: boolean;
    latency: number;
    amplitude: number;
    velocity: number;
  };
}

// Types for Special Studies (Late Responses)
export interface SpecialStudyTest {
  id: string;
  name: string;
  type: 'h_reflex' | 'blink_reflex' | 'f_wave' | 'rns' | 'other';
  side: 'left' | 'right' | 'bilateral';
  values: Record<string, number>;
  unit?: string;
  status: 'normal' | 'abnormal' | 'undetermined';
  findings?: string[];
  abnormalParameters?: string[];
  referenceValues?: Record<string, ReferenceValueRange>;
}

export interface SpecialStudyData {
  notPerformed: boolean;
  tests: SpecialStudyTest[];
}

// Specific types for different special studies
export interface HReflexData {
  latency: number;
  amplitude?: number;
  bilateralDelay?: number;
}

export interface BlinkReflexData {
  r1Latency?: number;
  r2IpsilateralLatency?: number;
  r2ContralateralLatency?: number;
}

export interface RNSData {
  preExerciseAmplitude: number;
  postExerciseAmplitude: number;
  decrementPercentage: number;
} 