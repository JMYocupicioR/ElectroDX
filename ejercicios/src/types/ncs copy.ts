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

export interface NCSTestResult {
  nerve: string;
  type: 'motor' | 'sensory';
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  velocity: number;
  status: 'normal' | 'abnormal';
  findings?: string[];
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
    persistence: number;
  };
  hReflex?: {
    latency: number;
    amplitude: number;
  };
} 