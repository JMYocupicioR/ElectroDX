// src/types/aiAnalysis.ts

export type AIAnalysisType = 'emg' | 'nerve_conduction' | 'general';

export interface AIAnalysis {
  id: string;
  studyId: string;
  type: AIAnalysisType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIModelConfiguration {
  apiKey?: string;
  model: string;
  version?: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  additionalParams?: Record<string, any>;
}

export interface AIAnalysisRequest {
  emgData: any;
  patientData: any;
  type: AIAnalysisType;
}

export interface AIAnalysisResult {
  id: string;
  studyId: string;
  type: AIAnalysisType;
  content: string;
  timestamp: string;
  modelVersion: string;
}