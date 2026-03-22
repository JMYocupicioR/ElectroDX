/**
 * PARSER DE TABLAS BASADO EN REGEX - SISTEMA AVANZADO v2.0
 * =========================================================
 * 
 * Sistema especializado para análisis de tablas de neuroconducción
 * con manejo inteligente de datos bilaterales (L/R) y estructuras complejas.
 * 
 * Implementa el plan estratégico de mejoras para robustez y precisión.
 */

import { MEDICAL_TERMINOLOGY, TerminologyMatcher } from '../data/medicalTerminology';
import { DetailedLogger } from './detailedLogger';

// ========== INTERFACES ==========

export interface BilateralTableData {
  nerve: string;
  studyType: 'motor' | 'sensory' | 'mixed' | 'unknown';
  parameters: {
    [parameterName: string]: {
      left?: number;
      right?: number;
      unit?: string;
      status?: 'normal' | 'abnormal' | 'borderline';
    };
  };
  metadata: {
    confidence: number;
    sourceText: string;
    processingNotes: string[];
    warnings: string[];
  };
}

export interface TableParsingResult {
  success: boolean;
  data: BilateralTableData[];
  summary: {
    totalRows: number;
    successfulRows: number;
    confidence: number;
    processingTime: number;
  };
  errors: string[];
  warnings: string[];
}

export interface RegexPattern {
  name: string;
  pattern: RegExp;
  description: string;
  captureGroups: string[];
}

// ========== CLASE PRINCIPAL ==========

export class RegexTableParser {
  private logger: DetailedLogger;
  private patterns: Map<string, RegexPattern[]>;

  constructor() {
    this.logger = new DetailedLogger('RegexTableParser');
    this.patterns = new Map();
    this.initializePatterns();
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Parsea tabla bilateral con regex avanzado
   */
  public parseBilateralTable(tableText: string, expectedType?: 'motor' | 'sensory'): TableParsingResult {
    const startTime = Date.now();
    this.logger.info('🚀 Iniciando análisis de tabla bilateral con regex avanzado');
    this.logger.debug('📄 Texto de entrada:', { length: tableText.length, preview: tableText.substring(0, 200) + '...' });

    const result: TableParsingResult = {
      success: false,
      data: [],
      summary: {
        totalRows: 0,
        successfulRows: 0,
        confidence: 0,
        processingTime: 0
      },
      errors: [],
      warnings: []
    };

    try {
      // PASO 1: Identificar el bloque de la tabla
      const tableBlock = this.identifyTableBlock(tableText);
      if (!tableBlock.success) {
        result.errors.push('No se pudo identificar el bloque de tabla');
        this.logger.error('❌ Falló identificación de bloque de tabla', tableBlock.errors);
        return result;
      }

      this.logger.info('✅ Bloque de tabla identificado', {
        startLine: tableBlock.startLine,
        endLine: tableBlock.endLine,
        detectedType: tableBlock.detectedType
      });

      // PASO 2: Extraer encabezados con estructura bilateral
      const headerAnalysis = this.extractBilateralHeaders(tableBlock.content);
      if (!headerAnalysis.success) {
        result.errors.push('No se pudieron extraer encabezados bilaterales');
        this.logger.error('❌ Falló extracción de encabezados', headerAnalysis.errors);
        return result;
      }

      this.logger.info('✅ Encabezados bilaterales extraídos', {
        parameters: headerAnalysis.parameters.map(p => p.name),
        structure: headerAnalysis.structure
      });

      // PASO 3: Procesar filas de datos con regex especializado
      const rowsAnalysis = this.processDataRows(tableBlock.content, headerAnalysis);
      
      result.data = rowsAnalysis.data;
      result.summary = {
        totalRows: rowsAnalysis.totalRows,
        successfulRows: rowsAnalysis.successfulRows,
        confidence: this.calculateOverallConfidence(rowsAnalysis.data),
        processingTime: Date.now() - startTime
      };

      result.success = result.summary.successfulRows > 0;
      result.warnings = [...tableBlock.warnings, ...headerAnalysis.warnings, ...rowsAnalysis.warnings];

      this.logger.info('🎯 Análisis completado', {
        success: result.success,
        totalRows: result.summary.totalRows,
        successfulRows: result.summary.successfulRows,
        confidence: `${result.summary.confidence.toFixed(1)}%`,
        processingTime: `${result.summary.processingTime}ms`
      });

    } catch (error) {
      const errorMessage = `Error crítico en parsing: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      result.errors.push(errorMessage);
      this.logger.error('💥 Error crítico', { error, stack: error instanceof Error ? error.stack : undefined });
    }

    return result;
  }

  /**
   * 🔍 PASO 1: Identificar el bloque de la tabla
   */
  private identifyTableBlock(text: string): {
    success: boolean;
    content: string;
    startLine: number;
    endLine: number;
    detectedType: 'motor' | 'sensory' | 'mixed' | 'unknown';
    errors: string[];
    warnings: string[];
  } {
    this.logger.debug('🔍 Iniciando identificación de bloque de tabla');
    
    const lines = text.split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Buscar línea de inicio de tabla
    let startLine = -1;
    let detectedType: 'motor' | 'sensory' | 'mixed' | 'unknown' = 'unknown';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Buscar indicadores de tabla con terminología médica
      if (TerminologyMatcher.isTableSection(line) && 
          (TerminologyMatcher.isNCSSection(line) || this.containsNCSParameters(line))) {
        startLine = i;
        detectedType = TerminologyMatcher.detectStudyType(line);
        this.logger.debug(`✅ Inicio de tabla detectado en línea ${i + 1}`, { line: line.trim(), type: detectedType });
        break;
      }
    }

    if (startLine === -1) {
      // Fallback: buscar líneas con patrones de cabecera bilateral
      for (let i = 0; i < lines.length; i++) {
        if (this.isBilateralHeaderLine(lines[i])) {
          startLine = i;
          warnings.push('Tabla detectada por patrón bilateral, no por encabezado estándar');
          this.logger.warn(`⚠️ Tabla detectada por fallback en línea ${i + 1}`);
          break;
        }
      }
    }

    if (startLine === -1) {
      errors.push('No se encontró inicio de tabla');
      return { success: false, content: '', startLine: -1, endLine: -1, detectedType: 'unknown', errors, warnings };
    }

    // Buscar línea de fin de tabla
    let endLine = lines.length - 1;
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Fin de tabla si encontramos nueva sección o líneas vacías consecutivas
      if (TerminologyMatcher.isEMGSection(line) || 
          TerminologyMatcher.findInCategory(line, 'sectionConclusions') ||
          (line.trim() === '' && lines[i + 1]?.trim() === '')) {
        endLine = i - 1;
        this.logger.debug(`🔚 Fin de tabla detectado en línea ${i}`);
        break;
      }
    }

    const content = lines.slice(startLine, endLine + 1).join('\n');
    
    return {
      success: true,
      content,
      startLine,
      endLine,
      detectedType,
      errors,
      warnings
    };
  }

  /**
   * 📋 PASO 2: Extraer encabezados con estructura bilateral
   */
  private extractBilateralHeaders(tableContent: string): {
    success: boolean;
    parameters: Array<{
      name: string;
      type: 'latency' | 'amplitude' | 'velocity' | 'distance' | 'other';
      unit?: string;
      leftColumn: number;
      rightColumn: number;
    }>;
    structure: 'bilateral' | 'interleaved' | 'grouped';
    errors: string[];
    warnings: string[];
  } {
    this.logger.debug('📋 Extrayendo encabezados bilaterales');
    
    const lines = tableContent.split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    const parameters: any[] = [];
    
    // Buscar líneas de cabecera (primeras 3 líneas típicamente)
    const headerLines = lines.slice(0, Math.min(3, lines.length));
    
    for (let lineIndex = 0; lineIndex < headerLines.length; lineIndex++) {
      const line = headerLines[lineIndex];
      
      // Buscar parámetros con estructura bilateral
      const bilateralMatch = this.extractBilateralParameters(line);
      if (bilateralMatch.length > 0) {
        parameters.push(...bilateralMatch);
        this.logger.debug(`✅ Parámetros bilaterales encontrados en línea ${lineIndex + 1}`, bilateralMatch);
        break;
      }
    }

    if (parameters.length === 0) {
      errors.push('No se encontraron parámetros bilaterales en encabezados');
      return { success: false, parameters: [], structure: 'bilateral', errors, warnings };
    }

    // Determinar estructura de la tabla
    const structure = this.determineTableStructure(headerLines);
    
    return {
      success: true,
      parameters,
      structure,
      errors,
      warnings
    };
  }

  /**
   * 📊 PASO 3: Procesar filas de datos
   */
  private processDataRows(tableContent: string, headerAnalysis: any): {
    data: BilateralTableData[];
    totalRows: number;
    successfulRows: number;
    warnings: string[];
  } {
    this.logger.debug('📊 Procesando filas de datos');
    
    const lines = tableContent.split('\n');
    const data: BilateralTableData[] = [];
    const warnings: string[] = [];
    
    // Saltar líneas de cabecera y procesar datos
    const dataLines = lines.slice(2).filter(line => line.trim() !== '' && !this.isHeaderLine(line));
    
    let successfulRows = 0;
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      
      try {
        const rowData = this.parseDataRow(line, headerAnalysis.parameters);
        if (rowData) {
          data.push(rowData);
          successfulRows++;
          this.logger.debug(`✅ Fila ${i + 1} procesada exitosamente`, { nerve: rowData.nerve });
        } else {
          warnings.push(`Fila ${i + 1} no se pudo procesar: datos insuficientes`);
        }
      } catch (error) {
        const errorMsg = `Error procesando fila ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        warnings.push(errorMsg);
        this.logger.warn('⚠️ Error procesando fila', { line: i + 1, error });
      }
    }
    
    return {
      data,
      totalRows: dataLines.length,
      successfulRows,
      warnings
    };
  }

  /**
   * 🧮 Parsear una fila de datos individual
   */
  private parseDataRow(line: string, parameters: any[]): BilateralTableData | null {
    // Dividir la línea en columnas (tabs o espacios múltiples)
    const columns = this.splitIntoColumns(line);
    
    if (columns.length < 3) {
      return null; // Fila insuficiente
    }
    
    // Extraer nombre del nervio (primera columna típicamente)
    const nerve = this.extractNerveName(columns[0]);
    if (!nerve) {
      return null;
    }
    
    // Determinar tipo de estudio
    const studyType = TerminologyMatcher.detectStudyType(line);
    
    // Procesar parámetros bilaterales
    const processedParameters: any = {};
    const processingNotes: string[] = [];
    const warnings: string[] = [];
    
    parameters.forEach(param => {
      const leftValue = this.extractNumericValue(columns[param.leftColumn]);
      const rightValue = this.extractNumericValue(columns[param.rightColumn]);
      
      if (leftValue !== null || rightValue !== null) {
        processedParameters[param.name] = {
          left: leftValue,
          right: rightValue,
          unit: param.unit,
          status: this.determineParameterStatus(param.type, leftValue, rightValue)
        };
        
        if (leftValue === null) processingNotes.push(`Valor izquierdo faltante para ${param.name}`);
        if (rightValue === null) processingNotes.push(`Valor derecho faltante para ${param.name}`);
      }
    });
    
    // Calcular confianza de la fila
    const confidence = this.calculateRowConfidence(processedParameters, columns);
    
    return {
      nerve,
      studyType,
      parameters: processedParameters,
      metadata: {
        confidence,
        sourceText: line.trim(),
        processingNotes,
        warnings
      }
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Inicializar patrones regex especializados
   */
  private initializePatterns(): void {
    // Patrones para detectar cabeceras bilaterales
    this.patterns.set('bilateralHeaders', [
      {
        name: 'standardBilateral',
        pattern: /\|\s*(.*?)\s*\|\s*L\s*\|\s*R\s*\|/gi,
        description: 'Cabecera estándar con columnas L/R',
        captureGroups: ['parameter']
      },
      {
        name: 'spacedBilateral',
        pattern: /(LatOn|Amplitude|Velocity|B-PAmp|Veloc)\s*\(.*?\)\s*L\s*R/gi,
        description: 'Parámetros con espacios y L/R',
        captureGroups: ['parameter', 'unit']
      }
    ]);

    // Patrones para extraer valores numéricos
    this.patterns.set('numericValues', [
      {
        name: 'standardNumber',
        pattern: /(\d+\.?\d*)/g,
        description: 'Números decimales estándar',
        captureGroups: ['value']
      },
      {
        name: 'scientificNotation',
        pattern: /(\d+\.?\d*[eE][+-]?\d+)/g,
        description: 'Notación científica',
        captureGroups: ['value']
      }
    ]);

    this.logger.debug('✅ Patrones regex inicializados', { 
      categoriesCount: this.patterns.size,
      totalPatterns: Array.from(this.patterns.values()).reduce((sum, patterns) => sum + patterns.length, 0)
    });
  }

  /**
   * Verificar si una línea contiene parámetros de NCS
   */
  private containsNCSParameters(line: string): boolean {
    return TerminologyMatcher.findInCategory(line, 'parameterLatency') ||
           TerminologyMatcher.findInCategory(line, 'parameterAmplitude') ||
           TerminologyMatcher.findInCategory(line, 'parameterVelocity');
  }

  /**
   * Verificar si es línea de cabecera bilateral
   */
  private isBilateralHeaderLine(line: string): boolean {
    // Buscar patrones típicos de cabeceras bilaterales
    const bilateralPatterns = [
      /\|\s*L\s*\|\s*R\s*\|/i,
      /L\s+R\s/,
      /(Left|Right|Izq|Der)/i
    ];
    
    return bilateralPatterns.some(pattern => pattern.test(line)) &&
           this.containsNCSParameters(line);
  }

  /**
   * Extraer parámetros bilaterales de una línea
   */
  private extractBilateralParameters(line: string): any[] {
    const parameters: any[] = [];
    
    // Patrón para detectar estructura: Parámetro | L | R |
    const bilateralRegex = /\|\s*(.*?)\s*\|\s*L\s*\|\s*R\s*\|/gi;
    let match;
    
    while ((match = bilateralRegex.exec(line)) !== null) {
      const paramText = match[1].trim();
      
      // Determinar tipo de parámetro
      let paramType: 'latency' | 'amplitude' | 'velocity' | 'distance' | 'other' = 'other';
      let unit: string | undefined;
      
      if (TerminologyMatcher.findInCategory(paramText, 'parameterLatency')) {
        paramType = 'latency';
        unit = 'ms';
      } else if (TerminologyMatcher.findInCategory(paramText, 'parameterAmplitude')) {
        paramType = 'amplitude';
        unit = paramText.includes('mV') ? 'mV' : 'µV';
      } else if (TerminologyMatcher.findInCategory(paramText, 'parameterVelocity')) {
        paramType = 'velocity';
        unit = 'm/s';
      }
      
      parameters.push({
        name: paramText,
        type: paramType,
        unit,
        leftColumn: this.findColumnIndex(line, match.index, 'L'),
        rightColumn: this.findColumnIndex(line, match.index, 'R')
      });
    }
    
    return parameters;
  }

  /**
   * Determinar estructura de tabla
   */
  private determineTableStructure(headerLines: string[]): 'bilateral' | 'interleaved' | 'grouped' {
    // Analizar patrón de las cabeceras para determinar estructura
    const combinedHeaders = headerLines.join(' ').toLowerCase();
    
    if (combinedHeaders.includes('l') && combinedHeaders.includes('r') && 
        combinedHeaders.includes('|')) {
      return 'bilateral';
    } else if (combinedHeaders.match(/left.*right|izq.*der/i)) {
      return 'grouped';
    } else {
      return 'interleaved';
    }
  }

  /**
   * Verificar si es línea de cabecera
   */
  private isHeaderLine(line: string): boolean {
    return line.includes('|') && (line.toLowerCase().includes('l') || line.toLowerCase().includes('r')) ||
           TerminologyMatcher.isTableSection(line);
  }

  /**
   * Dividir línea en columnas
   */
  private splitIntoColumns(line: string): string[] {
    // Primero intentar con separadores de pipe
    if (line.includes('|')) {
      return line.split('|').map(col => col.trim()).filter(col => col !== '');
    }
    
    // Luego con tabs
    if (line.includes('\t')) {
      return line.split('\t').map(col => col.trim()).filter(col => col !== '');
    }
    
    // Finalmente con espacios múltiples
    return line.split(/\s{2,}/).map(col => col.trim()).filter(col => col !== '');
  }

  /**
   * Extraer nombre de nervio
   */
  private extractNerveName(text: string): string | null {
    const nerves = TerminologyMatcher.extractNerveNames(text);
    return nerves.length > 0 ? nerves[0] : null;
  }

  /**
   * Extraer valor numérico
   */
  private extractNumericValue(text: string): number | null {
    if (!text || text.trim() === '' || text.toLowerCase().includes('n/a')) {
      return null;
    }
    
    const numMatch = text.match(/\d+\.?\d*/);
    return numMatch ? parseFloat(numMatch[0]) : null;
  }

  /**
   * Determinar estado del parámetro
   */
  private determineParameterStatus(type: string, leftValue: number | null, rightValue: number | null): 'normal' | 'abnormal' | 'borderline' {
    // Lógica simplificada - en producción usar rangos normativos reales
    if (leftValue === null && rightValue === null) return 'abnormal';
    
    const normalRanges = {
      latency: { min: 2, max: 6 },
      amplitude: { min: 5, max: 50 },
      velocity: { min: 45, max: 70 }
    };
    
    const range = normalRanges[type as keyof typeof normalRanges];
    if (!range) return 'normal';
    
    const values = [leftValue, rightValue].filter(v => v !== null) as number[];
    const allNormal = values.every(v => v >= range.min && v <= range.max);
    
    return allNormal ? 'normal' : 'abnormal';
  }

  /**
   * Calcular confianza de fila
   */
  private calculateRowConfidence(parameters: any, columns: string[]): number {
    let confidence = 50; // Base
    
    // Bonus por tener datos completos
    const paramCount = Object.keys(parameters).length;
    confidence += paramCount * 15;
    
    // Bonus por valores bilaterales
    const bilateralCount = Object.values(parameters).filter((p: any) => 
      p.left !== null && p.right !== null
    ).length;
    confidence += bilateralCount * 10;
    
    // Penalty por columnas faltantes
    if (columns.length < 5) confidence -= 10;
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Calcular confianza general
   */
  private calculateOverallConfidence(data: BilateralTableData[]): number {
    if (data.length === 0) return 0;
    
    const avgConfidence = data.reduce((sum, row) => sum + row.metadata.confidence, 0) / data.length;
    return Math.round(avgConfidence);
  }

  /**
   * Encontrar índice de columna
   */
  private findColumnIndex(line: string, startPos: number, target: string): number {
    // Buscar la posición de L o R después de la posición actual
    const restOfLine = line.substring(startPos);
    const targetIndex = restOfLine.indexOf(target);
    
    if (targetIndex === -1) return -1;
    
    // Contar columnas hasta esa posición
    const beforeTarget = line.substring(0, startPos + targetIndex);
    return (beforeTarget.match(/\|/g) || []).length;
  }
}

export default RegexTableParser; 