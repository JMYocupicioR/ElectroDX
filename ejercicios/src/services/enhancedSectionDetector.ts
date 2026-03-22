/**
 * DETECTOR DE SECCIONES MEJORADO CON VERIFICACIÓN EXPLÍCITA
 * =========================================================
 * 
 * Sistema avanzado para detección precisa de secciones médicas
 * que elimina falsos positivos mediante verificación explícita.
 * 
 * Implementa lógica binaria: si se encuentra un encabezado válido, procede;
 * si no, ignora completamente esa sección.
 */

import { MEDICAL_TERMINOLOGY, TerminologyMatcher } from '../data/medicalTerminology';
import { DetailedLogger, MedicalLogger } from './detailedLogger';

// ========== INTERFACES ==========

export interface SectionDetectionResult {
  sectionType: 'ncs' | 'emg' | 'patient' | 'conclusions' | 'special_studies' | 'unknown';
  found: boolean;
  confidence: number;
  startPosition: number;
  endPosition: number;
  headerText: string;
  content: string;
  metadata: {
    detectionMethod: 'explicit_header' | 'terminology_match' | 'pattern_recognition' | 'fallback';
    matchedTerms: string[];
    warnings: string[];
    processingNotes: string[];
  };
}

export interface DocumentAnalysis {
  documentType: 'emg_report' | 'ncs_report' | 'combined_report' | 'unknown';
  sections: SectionDetectionResult[];
  summary: {
    totalSections: number;
    validSections: number;
    averageConfidence: number;
    completeness: number;
  };
  warnings: string[];
  errors: string[];
}

export interface DetectionRule {
  name: string;
  priority: number;
  patterns: RegExp[];
  requiredTerms: string[];
  excludeTerms: string[];
  contextValidation: (text: string, position: number) => boolean;
  minimumConfidence: number;
}

// ========== CLASE PRINCIPAL ==========

export class EnhancedSectionDetector {
  private logger: MedicalLogger;
  private detectionRules: Map<string, DetectionRule[]>;

  constructor() {
    this.logger = new MedicalLogger('SectionDetector');
    this.detectionRules = new Map();
    this.initializeDetectionRules();
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Análisis completo del documento
   */
  public analyzeDocument(documentText: string): DocumentAnalysis {
    const operationId = this.logger.startOperation('Análisis completo de documento');
    
    try {
      // PASO 1: Análisis preliminar del documento
      const documentType = this.determineDocumentType(documentText);
      this.logger.medical('Tipo de documento determinado', { studyType: documentType });

      // PASO 2: Detección explícita de secciones
      const sections = this.detectAllSections(documentText);
      
      // PASO 3: Validación y refinamiento
      const validatedSections = this.validateDetectedSections(sections, documentText);
      
      // PASO 4: Cálculo de métricas
      const summary = this.calculateSummary(validatedSections);
      
      // PASO 5: Análisis de completitud
      const warnings = this.generateCompletenessWarnings(validatedSections, documentType);
      
      const analysis: DocumentAnalysis = {
        documentType,
        sections: validatedSections,
        summary,
        warnings,
        errors: []
      };

      this.logger.endOperation('Análisis completo de documento', operationId, {
        documentType,
        sectionsFound: validatedSections.length,
        averageConfidence: summary.averageConfidence
      });

      return analysis;

    } catch (error) {
      this.logger.failOperation('Análisis completo de documento', operationId, error);
      throw error;
    }
  }

  /**
   * 🔍 DETECCIÓN EXPLÍCITA DE SECCIÓN ESPECÍFICA
   */
  public detectSpecificSection(
    documentText: string, 
    sectionType: 'ncs' | 'emg' | 'patient' | 'conclusions' | 'special_studies'
  ): SectionDetectionResult {
    
    this.logger.step(1, `Detectando sección ${sectionType}`, 'start');
    
    const rules = this.detectionRules.get(sectionType) || [];
    let bestResult: SectionDetectionResult | null = null;
    
    // Aplicar reglas de detección en orden de prioridad
    for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
      const result = this.applyDetectionRule(documentText, sectionType, rule);
      
      if (result.found && result.confidence >= rule.minimumConfidence) {
        bestResult = result;
        this.logger.step(1, `Detectando sección ${sectionType}`, 'complete', {
          rule: rule.name,
          confidence: result.confidence,
          method: result.metadata.detectionMethod
        });
        break;
      }
    }
    
    // Si no se encontró con reglas específicas, usar fallback
    if (!bestResult) {
      bestResult = this.fallbackDetection(documentText, sectionType);
      this.logger.step(1, `Detectando sección ${sectionType}`, 
        bestResult.found ? 'complete' : 'error', {
          usedFallback: true,
          confidence: bestResult.confidence
        });
    }
    
    return bestResult;
  }

  /**
   * 🔎 VERIFICACIÓN EXPLÍCITA DE PRESENCIA DE SECCIÓN
   */
  public hasSectionExplicit(documentText: string, sectionType: string): {
    present: boolean;
    confidence: number;
    evidence: string[];
    reasoning: string;
  } {
    
    this.logger.debug(`🔎 Verificación explícita de sección: ${sectionType}`);
    
    const evidence: string[] = [];
    let confidence = 0;
    let reasoning = '';
    
    // CRITERIO 1: Presencia de encabezado explícito
    const headerResult = this.findExplicitHeader(documentText, sectionType);
    if (headerResult.found) {
      evidence.push(`Encabezado explícito encontrado: "${headerResult.text}"`);
      confidence += 40;
    }
    
    // CRITERIO 2: Términos de terminología médica específica
    const terminologyResult = this.findSpecificTerminology(documentText, sectionType);
    if (terminologyResult.count > 0) {
      evidence.push(`${terminologyResult.count} términos específicos encontrados`);
      confidence += terminologyResult.count * 10;
    }
    
    // CRITERIO 3: Estructura de datos esperada
    const structureResult = this.validateExpectedStructure(documentText, sectionType);
    if (structureResult.valid) {
      evidence.push(`Estructura de datos válida detectada`);
      confidence += 30;
    }
    
    // CRITERIO 4: Contexto circundante
    const contextResult = this.validateSurroundingContext(documentText, sectionType);
    if (contextResult.valid) {
      evidence.push(`Contexto circundante apropiado`);
      confidence += 20;
    }
    
    confidence = Math.min(100, confidence);
    const present = confidence >= 60; // Umbral de confianza
    
    reasoning = present 
      ? `Sección ${sectionType} confirmada con ${confidence}% de confianza basada en: ${evidence.join(', ')}`
      : `Sección ${sectionType} no detectada. Confianza insuficiente: ${confidence}%`;
    
    this.logger.medical(`Verificación explícita - ${sectionType}`, {
      confidence,
      findings: evidence
    }, { present, reasoning });
    
    return { present, confidence, evidence, reasoning };
  }

  // ========== MÉTODOS DE DETECCIÓN POR REGLAS ==========

  private applyDetectionRule(
    documentText: string, 
    sectionType: string, 
    rule: DetectionRule
  ): SectionDetectionResult {
    
    this.logger.debug(`Aplicando regla: ${rule.name} para sección ${sectionType}`);
    
    const matchedTerms: string[] = [];
    let bestMatch: { position: number; text: string; confidence: number } | null = null;
    
    // Buscar patrones definidos en la regla
    for (const pattern of rule.patterns) {
      const matches = Array.from(documentText.matchAll(pattern));
      
      for (const match of matches) {
        if (typeof match.index !== 'undefined') {
          const position = match.index;
          const text = match[0];
          
          // Validar términos requeridos
          const hasRequiredTerms = rule.requiredTerms.every(term =>
            new RegExp(`\\b${term}\\b`, 'i').test(text)
          );
          
          // Verificar exclusión de términos
          const hasExcludedTerms = rule.excludeTerms.some(term =>
            new RegExp(`\\b${term}\\b`, 'i').test(text)
          );
          
          // Validar contexto
          const contextValid = rule.contextValidation(documentText, position);
          
          if (hasRequiredTerms && !hasExcludedTerms && contextValid) {
            const confidence = this.calculateRuleConfidence(rule, text, documentText, position);
            
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = { position, text, confidence };
              matchedTerms.push(...rule.requiredTerms.filter(term => 
                new RegExp(`\\b${term}\\b`, 'i').test(text)
              ));
            }
          }
        }
      }
    }
    
    if (bestMatch) {
      const content = this.extractSectionContent(documentText, bestMatch.position, sectionType);
      
      return {
        sectionType: sectionType as any,
        found: true,
        confidence: bestMatch.confidence,
        startPosition: bestMatch.position,
        endPosition: bestMatch.position + content.length,
        headerText: bestMatch.text,
        content,
        metadata: {
          detectionMethod: 'explicit_header',
          matchedTerms: matchedTerms,
          warnings: [],
          processingNotes: [`Regla aplicada: ${rule.name}`]
        }
      };
    }
    
    return this.createEmptyResult(sectionType as any);
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  private findExplicitHeader(documentText: string, sectionType: string): {
    found: boolean;
    text: string;
    position: number;
  } {
    const categoryMap: Record<string, keyof typeof MEDICAL_TERMINOLOGY> = {
      'ncs': 'sectionNCS',
      'emg': 'sectionEMG',
      'patient': 'sectionPatient',
      'conclusions': 'sectionConclusions',
      'special_studies': 'sectionSpecialStudies'
    };
    
    const category = categoryMap[sectionType];
    if (!category) {
      return { found: false, text: '', position: -1 };
    }
    
    const result = TerminologyMatcher.findPositionInCategory(documentText, category);
    if (result) {
      return {
        found: true,
        text: result.term,
        position: result.position
      };
    }
    
    return { found: false, text: '', position: -1 };
  }

  private findSpecificTerminology(documentText: string, sectionType: string): {
    count: number;
    terms: string[];
  } {
    const terminologyMap: Record<string, Array<keyof typeof MEDICAL_TERMINOLOGY>> = {
      'ncs': ['parameterLatency', 'parameterAmplitude', 'parameterVelocity', 'nerveNames'],
      'emg': ['insertionalActivity', 'spontaneousActivity', 'recruitmentPattern', 'muscleNames'],
      'patient': ['sectionPatient'],
      'conclusions': ['sectionConclusions'],
      'special_studies': ['fWave', 'hReflex', 'blinkReflex', 'rns']
    };
    
    const categories = terminologyMap[sectionType] || [];
    let totalCount = 0;
    const foundTerms: string[] = [];
    
    for (const category of categories) {
      const terms = TerminologyMatcher.findAllInCategory(documentText, category);
      totalCount += terms.length;
      foundTerms.push(...terms);
    }
    
    return { count: totalCount, terms: foundTerms };
  }

  private validateExpectedStructure(documentText: string, sectionType: string): {
    valid: boolean;
    score: number;
    elements: string[];
  } {
    const structureValidators: Record<string, (text: string) => { valid: boolean; score: number; elements: string[] }> = {
      'ncs': this.validateNCSStructure.bind(this),
      'emg': this.validateEMGStructure.bind(this),
      'patient': this.validatePatientStructure.bind(this),
      'conclusions': this.validateConclusionStructure.bind(this),
      'special_studies': this.validateSpecialStudiesStructure.bind(this)
    };
    
    const validator = structureValidators[sectionType];
    return validator ? validator(documentText) : { valid: false, score: 0, elements: [] };
  }

  private validateSurroundingContext(documentText: string, sectionType: string): {
    valid: boolean;
    contextScore: number;
    notes: string[];
  } {
    // Implementar validación de contexto circundante
    // Por ejemplo, verificar que las secciones aparezcan en orden lógico
    return { valid: true, contextScore: 50, notes: [] };
  }

  // ========== VALIDADORES DE ESTRUCTURA ESPECÍFICOS ==========

  private validateNCSStructure(text: string): { valid: boolean; score: number; elements: string[] } {
    let score = 0;
    const elements: string[] = [];
    
    // Buscar indicadores de tabla bilateral
    if (/\|\s*L\s*\|\s*R\s*\|/i.test(text)) {
      score += 30;
      elements.push('Estructura bilateral detectada');
    }
    
    // Buscar parámetros de NCS
    const parameterCount = ['latency', 'amplitude', 'velocity'].filter(param =>
      TerminologyMatcher.findInCategory(text, `parameter${param.charAt(0).toUpperCase() + param.slice(1)}` as any)
    ).length;
    
    score += parameterCount * 15;
    elements.push(`${parameterCount} parámetros NCS encontrados`);
    
    // Buscar nervios
    const nerveCount = TerminologyMatcher.extractNerveNames(text).length;
    score += Math.min(nerveCount * 10, 40);
    elements.push(`${nerveCount} nervios identificados`);
    
    return { valid: score >= 50, score, elements };
  }

  private validateEMGStructure(text: string): { valid: boolean; score: number; elements: string[] } {
    let score = 0;
    const elements: string[] = [];
    
    // Buscar músculos
    const muscleCount = TerminologyMatcher.extractMuscleNames(text).length;
    score += Math.min(muscleCount * 15, 45);
    elements.push(`${muscleCount} músculos identificados`);
    
    // Buscar términos de EMG
    const emgTerms = ['insertionalActivity', 'spontaneousActivity', 'recruitmentPattern'];
    const foundEMGTerms = emgTerms.filter(term =>
      TerminologyMatcher.findInCategory(text, term as any)
    ).length;
    
    score += foundEMGTerms * 20;
    elements.push(`${foundEMGTerms} términos EMG encontrados`);
    
    return { valid: score >= 40, score, elements };
  }

  private validatePatientStructure(text: string): { valid: boolean; score: number; elements: string[] } {
    let score = 0;
    const elements: string[] = [];
    
    // Buscar campos típicos de paciente
    const patientFields = [
      { pattern: /\b(nombre|name)\s*[:\-]\s*\w+/i, points: 25, desc: 'Nombre' },
      { pattern: /\b(edad|age)\s*[:\-]\s*\d+/i, points: 20, desc: 'Edad' },
      { pattern: /\b(sexo|gender|sex)\s*[:\-]\s*\w+/i, points: 15, desc: 'Sexo' },
      { pattern: /\b(id|expediente|historia)\s*[:\-]\s*\w+/i, points: 20, desc: 'ID' }
    ];
    
    patientFields.forEach(field => {
      if (field.pattern.test(text)) {
        score += field.points;
        elements.push(field.desc);
      }
    });
    
    return { valid: score >= 40, score, elements };
  }

  private validateConclusionStructure(text: string): { valid: boolean; score: number; elements: string[] } {
    let score = 0;
    const elements: string[] = [];
    
    // Buscar términos diagnósticos
    if (TerminologyMatcher.findInCategory(text, 'abnormalResults') ||
        TerminologyMatcher.findInCategory(text, 'normalResults')) {
      score += 40;
      elements.push('Términos diagnósticos encontrados');
    }
    
    // Buscar estructura de conclusión
    if (/\b(conclusión|impression|diagnosis)/i.test(text)) {
      score += 30;
      elements.push('Estructura de conclusión detectada');
    }
    
    return { valid: score >= 50, score, elements };
  }

  private validateSpecialStudiesStructure(text: string): { valid: boolean; score: number; elements: string[] } {
    let score = 0;
    const elements: string[] = [];
    
    const specialStudyTypes = ['fWave', 'hReflex', 'blinkReflex', 'rns'];
    const foundTypes = specialStudyTypes.filter(type =>
      TerminologyMatcher.findInCategory(text, type as any)
    );
    
    score += foundTypes.length * 25;
    elements.push(`${foundTypes.length} tipos de estudios especiales encontrados`);
    
    return { valid: score >= 25, score, elements };
  }

  // ========== MÉTODOS AUXILIARES ==========

  private initializeDetectionRules(): void {
    // Reglas para NCS
    this.detectionRules.set('ncs', [
      {
        name: 'Encabezado NCS Estándar',
        priority: 100,
        patterns: [
          /^.*(?:Motor|Sensory).*(?:Side-To-Side|Comparison).*$/gmi,
          /^.*(?:Nerve Conduction|NCS|VCN).*(?:Studies|Table).*$/gmi
        ],
        requiredTerms: ['motor', 'sensory', 'nerve', 'conduction'],
        excludeTerms: ['emg', 'needle'],
        contextValidation: (text: string, pos: number) => {
          const context = text.substring(Math.max(0, pos - 100), pos + 100);
          return TerminologyMatcher.findInCategory(context, 'parameterLatency') ||
                 TerminologyMatcher.findInCategory(context, 'parameterAmplitude');
        },
        minimumConfidence: 70
      }
    ]);

    // Reglas para EMG
    this.detectionRules.set('emg', [
      {
        name: 'Encabezado EMG Estándar',
        priority: 100,
        patterns: [
          /^.*(?:Needle EMG|Electromiografía).*(?:Summary|Exam).*$/gmi,
          /^.*EMG.*(?:Analysis|Results).*$/gmi
        ],
        requiredTerms: ['emg', 'needle'],
        excludeTerms: ['conduction', 'ncs'],
        contextValidation: (text: string, pos: number) => {
          const context = text.substring(Math.max(0, pos - 100), pos + 100);
          return TerminologyMatcher.findInCategory(context, 'muscleNames');
        },
        minimumConfidence: 70
      }
    ]);

    this.logger.debug('✅ Reglas de detección inicializadas', {
      totalCategories: this.detectionRules.size,
      totalRules: Array.from(this.detectionRules.values()).reduce((sum, rules) => sum + rules.length, 0)
    });
  }

  private determineDocumentType(text: string): 'emg_report' | 'ncs_report' | 'combined_report' | 'unknown' {
    const hasNCS = TerminologyMatcher.isNCSSection(text);
    const hasEMG = TerminologyMatcher.isEMGSection(text);
    
    if (hasNCS && hasEMG) return 'combined_report';
    if (hasNCS) return 'ncs_report';
    if (hasEMG) return 'emg_report';
    return 'unknown';
  }

  private detectAllSections(documentText: string): SectionDetectionResult[] {
    const sectionTypes: Array<'ncs' | 'emg' | 'patient' | 'conclusions' | 'special_studies'> = 
      ['ncs', 'emg', 'patient', 'conclusions', 'special_studies'];
    
    return sectionTypes.map(type => this.detectSpecificSection(documentText, type));
  }

  private validateDetectedSections(sections: SectionDetectionResult[], documentText: string): SectionDetectionResult[] {
    return sections.filter(section => {
      if (!section.found) return false;
      
      // Validación adicional de contenido
      const hasValidContent = section.content.length > 20;
      const hasRelevantTerms = section.metadata.matchedTerms.length > 0;
      
      return hasValidContent && hasRelevantTerms;
    });
  }

  private calculateSummary(sections: SectionDetectionResult[]): {
    totalSections: number;
    validSections: number;
    averageConfidence: number;
    completeness: number;
  } {
    const validSections = sections.filter(s => s.found).length;
    const averageConfidence = sections.length > 0 
      ? sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length 
      : 0;
    
    return {
      totalSections: sections.length,
      validSections,
      averageConfidence,
      completeness: (validSections / sections.length) * 100
    };
  }

  private generateCompletenessWarnings(sections: SectionDetectionResult[], documentType: string): string[] {
    const warnings: string[] = [];
    
    const foundSections = sections.filter(s => s.found).map(s => s.sectionType);
    
    if (documentType.includes('ncs') && !foundSections.includes('ncs')) {
      warnings.push('Documento de tipo NCS pero no se detectó sección de neuroconducción');
    }
    
    if (documentType.includes('emg') && !foundSections.includes('emg')) {
      warnings.push('Documento de tipo EMG pero no se detectó sección de electromiografía');
    }
    
    if (!foundSections.includes('patient')) {
      warnings.push('No se detectaron datos del paciente');
    }
    
    return warnings;
  }

  private fallbackDetection(documentText: string, sectionType: string): SectionDetectionResult {
    // Implementar detección de fallback básica
    return this.createEmptyResult(sectionType as any);
  }

  private createEmptyResult(sectionType: 'ncs' | 'emg' | 'patient' | 'conclusions' | 'special_studies' | 'unknown'): SectionDetectionResult {
    return {
      sectionType,
      found: false,
      confidence: 0,
      startPosition: -1,
      endPosition: -1,
      headerText: '',
      content: '',
      metadata: {
        detectionMethod: 'fallback',
        matchedTerms: [],
        warnings: ['Sección no detectada'],
        processingNotes: []
      }
    };
  }

  private extractSectionContent(documentText: string, startPosition: number, sectionType: string): string {
    // Implementar extracción inteligente de contenido de sección
    const lines = documentText.split('\n');
    const startLine = documentText.substring(0, startPosition).split('\n').length - 1;
    
    // Buscar fin de sección (próxima sección o final del documento)
    let endLine = lines.length;
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (this.isNewSectionStart(line)) {
        endLine = i;
        break;
      }
    }
    
    return lines.slice(startLine, endLine).join('\n');
  }

  private isNewSectionStart(line: string): boolean {
    return TerminologyMatcher.isNCSSection(line) ||
           TerminologyMatcher.isEMGSection(line) ||
           TerminologyMatcher.findInCategory(line, 'sectionConclusions');
  }

  private calculateRuleConfidence(rule: DetectionRule, matchText: string, fullText: string, position: number): number {
    let confidence = 50; // Base
    
    // Bonus por longitud del match
    confidence += Math.min(matchText.length / 10, 20);
    
    // Bonus por términos requeridos encontrados
    const foundRequiredTerms = rule.requiredTerms.filter(term =>
      new RegExp(`\\b${term}\\b`, 'i').test(matchText)
    ).length;
    confidence += (foundRequiredTerms / rule.requiredTerms.length) * 30;
    
    return Math.min(100, confidence);
  }
}

export default EnhancedSectionDetector; 