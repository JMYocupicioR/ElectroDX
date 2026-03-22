/**
 * TableParser.ts - Especialista en Análisis de Tablas Médicas MEJORADO v2.0
 * 
 * Mejoras implementadas:
 * - Manejo de cabeceras multi-línea
 * - Detección de celdas combinadas
 * - Análisis de estructura de tabla más robusto
 * - Múltiples estrategias de parsing con fallbacks
 * - Validación avanzada de datos extraídos
 */

/**
 * Define la estructura del mapa de cabeceras que el parser utiliza.
 */
interface HeaderMap {
  columns: {
    index: number;
    property: string;
    side: 'left' | 'right' | null;
  }[];
}

/**
 * Define el objeto de resultado normalizado para una sola prueba.
 */
interface ParsedRowData {
  [key: string]: any;
}

/**
 * Configuración para diferentes tipos de tablas médicas
 */
interface TableConfig {
  type: 'ncs' | 'emg' | 'fwave' | 'hreflex' | 'blink' | 'rns';
  expectedHeaders: string[];
  bilateralData: boolean;
}

/**
 * Estrategias de parsing disponibles
 */
type ParsingStrategy = 'standard' | 'multiline_headers' | 'merged_cells' | 'free_form' | 'fallback';

/**
 * Resultado del análisis de estructura de tabla
 */
interface TableStructureAnalysis {
  strategy: ParsingStrategy;
  confidence: number;
  headerRows: number;
  dataRows: number;
  columnCount: number;
  hasMultilineHeaders: boolean;
  hasMergedCells: boolean;
  separatorType: 'tabs' | 'spaces' | 'mixed';
  issues: string[];
  recommendations: string[];
}

export class TableParser {
  /**
   * Mapea las posibles variaciones de cabeceras a una propiedad estándar.
   * MEJORADO: Incluye más variaciones y contextos médicos específicos.
   */
  private static readonly ENHANCED_HEADER_MAP: { [key: string]: string[] } = {
    // Identificadores de nervio/músculo
    nerve: ['nerve', 'nervio', 'nerv', 'n.', 'neural pathway', 'nerve tested'],
    muscle: ['muscle', 'músculo', 'musc', 'm.', 'muscle tested', 'muscle group'],
    
    // Sitios de estimulación y registro
    stimulusSite: ['stimulus', 'estímulo', 'stim', 'site', 'sitio', 'stim site', 'stimulation site'],
    recordingSite: ['recording', 'registro', 'rec', 'record', 'recording site', 'electrode'],
    
    // Mediciones de distancia
    distance: ['dist', 'distancia', 'distance', '(mm)', 'mm', 'distance (mm)', 'segment length'],
    
    // Latencias (múltiples tipos)
    latency: ['laton', 'lat', 'latencia', 'latency', '(ms)', 'ms', 'onset lat', 'distal lat'],
    peakLatency: ['latnpk', 'peak', 'pico', 'lat-pk', 'peak latency', 'latencia pico'],
    onsetLatency: ['onset', 'inicio', 'onset lat', 'latencia inicio'],
    
    // Amplitudes (múltiples tipos y unidades)
    amplitude: ['b-pamp', 'amp', 'amplitud', 'amplitude', '(mv)', '(µv)', 'mv', 'µv', 'ampl'],
    peakAmplitude: ['peak amp', 'amplitud pico', 'p-p amp', 'peak-to-peak'],
    baselineAmplitude: ['baseline', 'línea base', 'baseline amp'],
    
    // Velocidades de conducción
    velocity: ['cv', 'vel', 'vcn', 'vcm', 'velocity', 'velocidad', '(m/s)', 'm/s', 'ncv', 'conduction velocity'],
    
    // Lados del cuerpo
    side: ['side', 'lado', 'l/r', 'left/right', 'izq/der', 'lateral'],
    
    // Estudios especiales
    fLatency: ['f-lat', 'f-latency', 'f-latencia', 'f wave lat', 'onda f'],
    fAmplitude: ['f-amp', 'f-amplitude', 'f-amplitud', 'f wave amp'],
    hLatency: ['h-lat', 'h-latency', 'h-latencia', 'h reflex lat', 'reflejo h'],
    hAmplitude: ['h-amp', 'h-amplitude', 'h-amplitud', 'h reflex amp'],
    
    // Reflejos de parpadeo
    r1Latency: ['r1', 'r1-lat', 'r1-latency', 'r1 latency', 'blink r1'],
    r2Latency: ['r2', 'r2-lat', 'r2-latency', 'r2 latency', 'blink r2'],
    
    // Estimulación repetitiva
    decrement: ['decrement', 'decremento', '%', 'percent', 'dec %', '% decrement'],
    frequency: ['freq', 'frecuencia', 'hz', 'frequency (hz)', 'stim freq'],
    
    // Parámetros temporales
    duration: ['dur', 'duración', 'duration', 'width', 'ancho'],
    area: ['area', 'área', 'área bajo curva', 'auc'],
    
    // EMG específico
    insertionalActivity: ['insertional', 'actividad insertiva', 'insert act', 'ia'],
    spontaneousActivity: ['spontaneous', 'actividad espontánea', 'spont act', 'sa'],
    recruitmentPattern: ['recruitment', 'reclutamiento', 'recruit', 'pattern'],
    motorUnitPotentials: ['mup', 'pum', 'motor unit', 'unidad motora'],
    
    // Valores de referencia
    normalRange: ['normal', 'ref range', 'rango normal', 'reference', 'norm'],
    upperLimit: ['upper', 'límite superior', 'max', 'ul'],
    lowerLimit: ['lower', 'límite inferior', 'min', 'll']
  };

  /**
   * Configuraciones predefinidas para diferentes tipos de tablas
   */
  private static readonly TABLE_CONFIGS: { [key: string]: TableConfig } = {
    ncs: {
      type: 'ncs',
      expectedHeaders: ['nerve', 'latency', 'amplitude', 'velocity'],
      bilateralData: true
    },
    emg: {
      type: 'emg',
      expectedHeaders: ['muscle', 'insertional', 'spontaneous', 'recruitment'],
      bilateralData: true
    },
    fwave: {
      type: 'fwave',
      expectedHeaders: ['nerve', 'fLatency', 'fAmplitude'],
      bilateralData: true
    },
    hreflex: {
      type: 'hreflex',
      expectedHeaders: ['nerve', 'hLatency', 'hAmplitude'],
      bilateralData: true
    }
  };

  /**
   * Normaliza un valor de celda, convirtiéndolo a número, null o string limpio.
   * @param value - El valor de la celda de la tabla.
   * @returns El valor normalizado.
   */
  private static normalizeValue(value: string): number | string | null {
    if (!value) return null;
    
    const trimmedValue = value.trim();
    
    // Valores que representan ausencia de datos
    if (trimmedValue === 'n/a' || 
        trimmedValue === '--' || 
        trimmedValue === '' || 
        trimmedValue === 'N/A' ||
        trimmedValue === 'NR' ||
        trimmedValue === 'No Response' ||
        trimmedValue === 'Sin Respuesta') {
      return null;
    }

    // Intentar convertir a número
    const numValue = parseFloat(trimmedValue.replace(',', '.'));
    if (!isNaN(numValue)) {
      return numValue;
    }

    // Retornar como string limpio
    return trimmedValue;
  }

  /**
   * Analiza las líneas de cabecera de una tabla para construir un mapa estructural.
   * @param headerLines - Un array de strings, cada uno una línea de la cabecera.
   * @param tableType - Tipo de tabla para aplicar configuración específica.
   * @returns Un HeaderMap que describe la estructura de la tabla.
   */
  private static parseHeaders(headerLines: string[], tableType?: string): HeaderMap {
    const headerMap: HeaderMap = { columns: [] };
    
    console.log(`🔍 Analizando cabeceras para tabla tipo: ${tableType || 'desconocido'}`);
    console.log(`📋 Líneas de cabecera:`, headerLines);

    const mainHeaderLine = headerLines[0].toLowerCase().split(/\s{2,}|\t/); // Dividir por múltiples espacios o tabs
    const sideHeaderLine = headerLines.length > 1 ? headerLines[1].toLowerCase().split(/\s{2,}|\t/) : null;

    console.log(`📊 Cabeceras principales:`, mainHeaderLine);
    console.log(`🔄 Cabeceras laterales:`, sideHeaderLine);

    let colIndex = 0;
    mainHeaderLine.forEach((header, i) => {
      const cleanHeader = header.replace(/[:()]/g, '').trim();
      
      // Buscar la propiedad correspondiente
      const property = Object.keys(this.ENHANCED_HEADER_MAP).find(key => 
        this.ENHANCED_HEADER_MAP[key].some(synonym => 
          cleanHeader.includes(synonym) || synonym.includes(cleanHeader)
        )
      );

      if (property) {
        console.log(`✅ Cabecera "${header}" mapeada a propiedad "${property}"`);
        
        // Verificar si esta cabecera tiene sub-cabeceras L/R
        const hasBilateralSubHeaders = sideHeaderLine && 
          (sideHeaderLine[colIndex]?.includes('l') || sideHeaderLine[colIndex]?.includes('r'));

        if (hasBilateralSubHeaders) {
          // Mapear columna para la izquierda
          headerMap.columns.push({ index: colIndex, property, side: 'left' });
          console.log(`👈 Columna ${colIndex}: ${property} (izquierda)`);
          colIndex++;
          
          // Mapear columna para la derecha
          headerMap.columns.push({ index: colIndex, property, side: 'right' });
          console.log(`👉 Columna ${colIndex}: ${property} (derecha)`);
          colIndex++;
        } else {
          headerMap.columns.push({ index: colIndex, property, side: null });
          console.log(`🔄 Columna ${colIndex}: ${property} (bilateral/compartida)`);
          colIndex++;
        }
      } else {
        console.log(`⚠️ Cabecera "${header}" no reconocida, saltando...`);
        colIndex++;
      }
    });

    console.log(`📋 Mapa de cabeceras final:`, headerMap);
    return headerMap;
  }

  /**
   * Determina si una línea debe ser ignorada durante el análisis.
   * @param line - La línea a evaluar.
   * @returns true si la línea debe ser ignorada.
   */
  private static shouldIgnoreLine(line: string): boolean {
    const trimmedLine = line.trim().toLowerCase();
    
    // Líneas de separación
    if (trimmedLine.startsWith('---') || trimmedLine.startsWith('===')) {
      return true;
    }
    
    // Líneas con datos por defecto o irrelevantes
    if (trimmedLine.includes('default') || 
        trimmedLine.includes('ejemplo') || 
        trimmedLine.includes('sample')) {
      return true;
    }
    
    // Líneas muy cortas o vacías
    if (trimmedLine.length < 3) {
      return true;
    }
    
    return false;
  }

  /**
   * Extrae el nombre del nervio o músculo de una línea de datos.
   * @param line - La línea de datos.
   * @returns El nombre del nervio/músculo encontrado.
   */
  private static extractNerveOrMuscle(line: string): string | null {
    const trimmedLine = line.trim();
    const firstColumn = trimmedLine.split(/\s{2,}|\t/)[0];
    
    // Lista de nervios y músculos comunes
    const nervePatterns = [
      /\b(ulnar|mediano|radial|peroneal|tibial|sural|femoral)\b/i,
      /\b(median|ulnar|radial|peroneal|tibial|sural|femoral)\b/i,
      /\b(ciático|femorocutáneo|safeno)\b/i
    ];
    
    const musclePatterns = [
      /\b(abductor|flexor|extensor|bíceps|tríceps|gastrocnemio)\b/i,
      /\b(deltoides|tibial anterior|peroneo|sóleo)\b/i
    ];
    
    // Buscar patrones de nervios
    for (const pattern of nervePatterns) {
      const match = firstColumn.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Buscar patrones de músculos
    for (const pattern of musclePatterns) {
      const match = firstColumn.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Si no se encuentra un patrón específico, retornar la primera columna limpia
    return firstColumn || null;
  }

  /**
   * Función principal que toma el texto de una tabla y lo convierte en datos estructurados.
   * @param tableText - El string completo de la sección de la tabla.
   * @param tableType - Tipo de tabla (opcional) para aplicar configuración específica.
   * @returns Un array de objetos, cada uno representando un resultado de prueba.
   */
  public static parse(tableText: string, tableType?: string): ParsedRowData[] {
    console.log(`�� Iniciando análisis avanzado de tabla tipo: ${tableType || 'desconocido'}`);
    console.log(`📄 Texto de entrada (${tableText.length} caracteres)`);
    
    if (!tableText || tableText.trim().length === 0) {
      console.log('⚠️ Texto de tabla vacío');
      return [];
    }
    
    // 🔍 PASO 1: ANÁLISIS DE ESTRUCTURA
    const structureAnalysis = this.analyzeTableStructure(tableText);
    console.log('📊 Análisis de estructura:', structureAnalysis);
    
    // 🎯 PASO 2: SELECCIONAR ESTRATEGIA DE PARSING
    const results = this.parseWithStrategy(tableText, structureAnalysis, tableType);
    
    // 🔍 PASO 3: VALIDACIÓN Y MEJORA DE RESULTADOS
    const validatedResults = this.validateAndImproveResults(results, structureAnalysis);
    
    console.log(`✅ Análisis completado: ${validatedResults.length} resultados válidos`);
    console.log(`📈 Confianza: ${structureAnalysis.confidence}%`);
    
    return validatedResults;
  }

  /**
   * 🔍 NUEVO: Análisis profundo de estructura de tabla
   */
  private static analyzeTableStructure(tableText: string): TableStructureAnalysis {
    const lines = tableText.split('\n').filter(line => line.trim().length > 0);
    const analysis: TableStructureAnalysis = {
      strategy: 'standard',
      confidence: 0,
      headerRows: 0,
      dataRows: 0,
      columnCount: 0,
      hasMultilineHeaders: false,
      hasMergedCells: false,
      separatorType: 'spaces',
      issues: [],
      recommendations: []
    };
    
    if (lines.length < 2) {
      analysis.issues.push('Tabla insuficiente (menos de 2 líneas)');
      analysis.confidence = 0;
      return analysis;
    }
    
    // 📊 ANALIZAR SEPARADORES
    const separatorAnalysis = this.analyzeSeparators(lines);
    analysis.separatorType = separatorAnalysis.primaryType;
    
    // 📋 DETECTAR CABECERAS
    const headerAnalysis = this.detectHeaders(lines, separatorAnalysis);
    analysis.headerRows = headerAnalysis.headerRowCount;
    analysis.hasMultilineHeaders = headerAnalysis.hasMultilineHeaders;
    
    // 📏 ANALIZAR COLUMNAS
    const columnAnalysis = this.analyzeColumns(lines, separatorAnalysis, headerAnalysis);
    analysis.columnCount = columnAnalysis.averageColumnCount;
    analysis.hasMergedCells = columnAnalysis.hasMergedCells;
    
    // 📊 CONTAR FILAS DE DATOS
    analysis.dataRows = Math.max(0, lines.length - analysis.headerRows);
    
    // 🎯 DETERMINAR ESTRATEGIA ÓPTIMA
    analysis.strategy = this.selectOptimalStrategy(analysis);
    
    // 📈 CALCULAR CONFIANZA
    analysis.confidence = this.calculateStructureConfidence(analysis, lines);
    
    // 💡 GENERAR RECOMENDACIONES
    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }

  /**
   * 🔧 NUEVO: Análisis de separadores (tabs, espacios, mixto)
   */
  private static analyzeSeparators(lines: string[]): {
    primaryType: 'tabs' | 'spaces' | 'mixed';
    tabCount: number;
    spaceCount: number;
    consistency: number;
  } {
    let tabLines = 0;
    let spaceLines = 0;
    let totalTabs = 0;
    let totalSpaces = 0;
    
    lines.forEach(line => {
      const tabCount = (line.match(/\t/g) || []).length;
      const spaceGroupCount = (line.match(/\s{2,}/g) || []).length;
      
      if (tabCount > 0) {
        tabLines++;
        totalTabs += tabCount;
      }
      if (spaceGroupCount > 0) {
        spaceLines++;
        totalSpaces += spaceGroupCount;
      }
    });
    
    const tabRatio = tabLines / lines.length;
    const spaceRatio = spaceLines / lines.length;
    
    let primaryType: 'tabs' | 'spaces' | 'mixed';
    if (tabRatio > 0.7) {
      primaryType = 'tabs';
    } else if (spaceRatio > 0.7) {
      primaryType = 'spaces';
    } else {
      primaryType = 'mixed';
    }
    
    const consistency = Math.max(tabRatio, spaceRatio);
    
    return {
      primaryType,
      tabCount: totalTabs,
      spaceCount: totalSpaces,
      consistency
    };
  }

  /**
   * 📋 NUEVO: Detección avanzada de cabeceras
   */
  private static detectHeaders(lines: string[], separatorInfo: any): {
    headerRowCount: number;
    hasMultilineHeaders: boolean;
    headerLines: string[];
  } {
    const headerLines: string[] = [];
    let headerRowCount = 0;
    let hasMultilineHeaders = false;
    
    // Buscar hasta las primeras 4 líneas para cabeceras
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // Calcular puntuación de cabecera
      let headerScore = 0;
      
      // Buscar términos médicos conocidos
      const medicalTerms = Object.values(this.ENHANCED_HEADER_MAP).flat();
      for (const term of medicalTerms) {
        if (line.includes(term.toLowerCase())) {
          headerScore += 1;
        }
      }
      
      // Penalizar por números (cabeceras típicamente no tienen muchos números)
      const numberCount = (line.match(/\d/g) || []).length;
      headerScore -= numberCount * 0.1;
      
      // Bonus por palabras típicas de cabecera
      if (line.includes('nerve') || line.includes('lat') || line.includes('amp')) {
        headerScore += 0.5;
      }
      
      // Si es una línea de cabecera válida
      if (headerScore > 0.5) {
        headerLines.push(lines[i]);
        headerRowCount = i + 1;
        
        // Detectar cabeceras multi-línea
        if (i > 0 && headerLines.length > 1) {
          hasMultilineHeaders = true;
        }
      } else if (headerRowCount > 0) {
        // Si ya encontramos cabeceras y esta línea no es cabecera, parar
        break;
      }
    }
    
    // Si no se encontraron cabeceras, asumir la primera línea
    if (headerRowCount === 0) {
      headerLines.push(lines[0]);
      headerRowCount = 1;
    }
    
    return {
      headerRowCount,
      hasMultilineHeaders,
      headerLines
    };
  }

  /**
   * 📏 NUEVO: Análisis avanzado de columnas
   */
  private static analyzeColumns(lines: string[], separatorInfo: any, headerInfo: any): {
    averageColumnCount: number;
    hasMergedCells: boolean;
    columnConsistency: number;
  } {
    const columnCounts: number[] = [];
    let hasMergedCells = false;
    
    lines.forEach((line, index) => {
      let columnCount = 0;
      
      if (separatorInfo.primaryType === 'tabs') {
        columnCount = line.split('\t').length;
      } else {
        // Para espacios, buscar grupos de caracteres separados por espacios múltiples
        const parts = line.split(/\s{2,}/).filter(part => part.trim().length > 0);
        columnCount = parts.length;
      }
      
      columnCounts.push(columnCount);
      
      // Detectar posibles celdas combinadas (variación significativa en columnas)
      if (index > 0) {
        const previousCount = columnCounts[index - 1];
        if (Math.abs(columnCount - previousCount) > 1) {
          hasMergedCells = true;
        }
      }
    });
    
    const averageColumnCount = Math.round(
      columnCounts.reduce((sum, count) => sum + count, 0) / columnCounts.length
    );
    
    // Calcular consistencia de columnas
    const variance = columnCounts.reduce((sum, count) => 
      sum + Math.pow(count - averageColumnCount, 2), 0) / columnCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const columnConsistency = Math.max(0, 1 - (standardDeviation / averageColumnCount));
    
    return {
      averageColumnCount,
      hasMergedCells,
      columnConsistency
    };
  }

  /**
   * 🎯 NUEVO: Selección de estrategia óptima de parsing
   */
  private static selectOptimalStrategy(analysis: TableStructureAnalysis): ParsingStrategy {
    // Estrategia basada en características detectadas
    if (analysis.hasMultilineHeaders && analysis.hasMergedCells) {
      return 'merged_cells';
    } else if (analysis.hasMultilineHeaders) {
      return 'multiline_headers';
    } else if (analysis.hasMergedCells) {
      return 'merged_cells';
    } else if (analysis.columnCount >= 3 && analysis.headerRows >= 1) {
      return 'standard';
    } else if (analysis.dataRows > 0) {
      return 'free_form';
    } else {
      return 'fallback';
    }
  }

  /**
   * 🧮 NUEVO: Cálculo de confianza en la estructura
   */
  private static calculateStructureConfidence(analysis: TableStructureAnalysis, lines: string[]): number {
    let confidence = 50; // Base
    
    // Factores positivos
    if (analysis.headerRows > 0) confidence += 20;
    if (analysis.columnCount >= 3) confidence += 15;
    if (analysis.dataRows >= 2) confidence += 10;
    if (analysis.separatorType !== 'mixed') confidence += 10;
    
    // Factores negativos
    if (analysis.hasMultilineHeaders) confidence -= 5;
    if (analysis.hasMergedCells) confidence -= 10;
    if (analysis.issues.length > 0) confidence -= analysis.issues.length * 5;
    
    // Bonificaciones por consistencia
    if (lines.length > 5) confidence += 5;
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * 🔄 NUEVO: Parsing con estrategia seleccionada
   */
  private static parseWithStrategy(
    tableText: string, 
    analysis: TableStructureAnalysis, 
    tableType?: string
  ): ParsedRowData[] {
    console.log(`🎯 Usando estrategia: ${analysis.strategy}`);
    
    try {
      switch (analysis.strategy) {
        case 'standard':
          return this.parseStandard(tableText, analysis);
        case 'multiline_headers':
          return this.parseMultilineHeaders(tableText, analysis);
        case 'merged_cells':
          return this.parseMergedCells(tableText, analysis);
        case 'free_form':
          return this.parseFreeForm(tableText, analysis);
        default:
          return this.parseFallback(tableText, analysis);
      }
    } catch (error) {
      console.warn(`⚠️ Estrategia ${analysis.strategy} falló, usando fallback:`, error);
      return this.parseFallback(tableText, analysis);
    }
  }

  /**
   * 📊 ESTRATEGIA ESTÁNDAR (mejorada)
   */
  private static parseStandard(tableText: string, analysis: TableStructureAnalysis): ParsedRowData[] {
    // Implementación de la estrategia estándar mejorada
    const lines = tableText.split('\n').filter(line => line.trim().length > 0);
    const headerLines = lines.slice(0, analysis.headerRows);
    const dataLines = lines.slice(analysis.headerRows);
    
    // Usar el parsing original mejorado
    return this.parseWithOriginalMethod(tableText, 'standard');
  }

  /**
   * 📋 ESTRATEGIA PARA CABECERAS MULTI-LÍNEA
   */
  private static parseMultilineHeaders(tableText: string, analysis: TableStructureAnalysis): ParsedRowData[] {
    console.log('📋 Procesando cabeceras multi-línea...');
    
    const lines = tableText.split('\n').filter(line => line.trim().length > 0);
    const headerLines = lines.slice(0, analysis.headerRows);
    const dataLines = lines.slice(analysis.headerRows);
    
    // Combinar cabeceras multi-línea en una sola línea lógica
    const combinedHeader = this.combineMultilineHeaders(headerLines);
    console.log('🔗 Cabecera combinada:', combinedHeader);
    
    // Procesar con la cabecera combinada
    const reconstructedTable = [combinedHeader, ...dataLines].join('\n');
    return this.parseWithOriginalMethod(reconstructedTable, 'multiline');
  }

  /**
   * 🔄 COMBINAR CABECERAS MULTI-LÍNEA
   */
  private static combineMultilineHeaders(headerLines: string[]): string {
    if (headerLines.length === 1) return headerLines[0];
    
    // Dividir cada línea de cabecera en columnas
    const headerColumns: string[][] = headerLines.map(line => {
      return line.split(/\s{2,}|\t/).filter(col => col.trim().length > 0);
    });
    
    // Encontrar el número máximo de columnas
    const maxColumns = Math.max(...headerColumns.map(cols => cols.length));
    
    // Combinar columnas verticalmente
    const combinedColumns: string[] = [];
    for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
      const columnParts: string[] = [];
      
      headerColumns.forEach(rowCols => {
        if (colIndex < rowCols.length && rowCols[colIndex].trim()) {
          columnParts.push(rowCols[colIndex].trim());
        }
      });
      
      combinedColumns.push(columnParts.join(' '));
    }
    
    return combinedColumns.join('\t');
  }

  /**
   * 🔀 ESTRATEGIA PARA CELDAS COMBINADAS
   */
  private static parseMergedCells(tableText: string, analysis: TableStructureAnalysis): ParsedRowData[] {
    console.log('🔀 Procesando tabla con celdas combinadas...');
    
    // Por ahora, usar estrategia estándar con post-procesamiento
    const standardResults = this.parseStandard(tableText, analysis);
    
    // TODO: Implementar lógica específica para celdas combinadas
    return standardResults;
  }

  /**
   * 📝 ESTRATEGIA PARA FORMATO LIBRE
   */
  private static parseFreeForm(tableText: string, analysis: TableStructureAnalysis): ParsedRowData[] {
    console.log('📝 Procesando formato libre...');
    
    // Intentar extraer pares clave-valor en lugar de tabla estructurada
    const keyValuePairs = this.extractKeyValuePairs(tableText);
    return this.convertKeyValueToRows(keyValuePairs);
  }

  /**
   * 🔧 ESTRATEGIA FALLBACK
   */
  private static parseFallback(tableText: string, analysis: TableStructureAnalysis): ParsedRowData[] {
    console.log('🔧 Usando estrategia fallback...');
    
    // Usar el método original como último recurso
    return this.parseWithOriginalMethod(tableText, 'fallback');
  }

  /**
   * 🔄 USAR MÉTODO ORIGINAL (compatibilidad)
   */
  private static parseWithOriginalMethod(tableText: string, context: string): ParsedRowData[] {
    // Llamar al método parse original pero sin recursión infinita
    const lines = tableText.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    // Implementar lógica básica del parser original
    const results: ParsedRowData[] = [];
    const headerLine = lines[0];
    const dataLines = lines.slice(1);
    
    // Procesar cada línea de datos
    dataLines.forEach((line, index) => {
      if (this.shouldIgnoreLine(line)) return;
      
      const cells = this.splitTableRow(line);
      if (cells.length < 2) return;
      
      const row: ParsedRowData = {
        nerve: this.extractNerveOrMuscle(line) || `Unknown_${index}`,
        side: this.inferSideFromContext(line),
        data: {}
      };
      
      // Mapear valores numéricos básicos
      cells.forEach((cell, cellIndex) => {
        const numValue = this.parseNumericValue(cell);
        if (numValue !== null) {
          if (cellIndex === 1) row.latency = numValue;
          else if (cellIndex === 2) row.amplitude = numValue;
          else if (cellIndex === 3) row.velocity = numValue;
        }
      });
      
      if (this.hasMinimumRequiredData(row)) {
        results.push(row);
      }
    });
    
    return results;
  }

  // ========== MÉTODOS AUXILIARES (mantener compatibilidad) ==========
  
  private static shouldIgnoreLine(line: string): boolean {
    const trimmedLine = line.trim().toLowerCase();
    
    if (trimmedLine.startsWith('---') || trimmedLine.startsWith('===')) return true;
    if (trimmedLine.includes('default') || trimmedLine.includes('ejemplo')) return true;
    if (trimmedLine.length < 3) return true;
    
    return false;
  }

  private static splitTableRow(line: string): string[] {
    if (line.includes('\t')) {
      return line.split('\t').map(cell => cell.trim());
    }
    return line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell.length > 0);
  }

  private static extractNerveOrMuscle(line: string): string | null {
    const trimmedLine = line.trim();
    const firstColumn = this.splitTableRow(trimmedLine)[0];
    
    const nervePatterns = [
      /\b(ulnar|mediano|radial|peroneal|tibial|sural|femoral)\b/i,
      /\b(median|ulnar|radial|peroneal|tibial|sural|femoral)\b/i
    ];
    
    for (const pattern of nervePatterns) {
      const match = firstColumn.match(pattern);
      if (match) return match[1];
    }
    
    return firstColumn || null;
  }

  private static parseNumericValue(text: string): number | null {
    if (!text || text.trim() === '' || text.toLowerCase().includes('n/a')) {
      return null;
    }
    
    const cleaned = text.replace(/[^\d.-]/g, '');
    const value = parseFloat(cleaned);
    
    return isNaN(value) ? null : value;
  }

  private static inferSideFromContext(line: string): 'left' | 'right' | 'bilateral' {
    const lineLower = line.toLowerCase();
    
    if (lineLower.includes('left') || lineLower.includes('izq') || lineLower === 'l') {
      return 'left';
    }
    if (lineLower.includes('right') || lineLower.includes('der') || lineLower === 'r') {
      return 'right';
    }
    
    return 'bilateral';
  }

  private static hasMinimumRequiredData(row: ParsedRowData): boolean {
    if (!row.nerve) return false;
    
    return (row.latency && row.latency > 0) || 
           (row.amplitude && row.amplitude > 0) || 
           (row.velocity && row.velocity > 0);
  }

  // ========== NUEVOS MÉTODOS AUXILIARES ==========

  private static extractKeyValuePairs(text: string): { [key: string]: string } {
    const pairs: { [key: string]: string } = {};
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (colonMatch) {
        pairs[colonMatch[1].trim()] = colonMatch[2].trim();
      }
    });
    
    return pairs;
  }

  private static convertKeyValueToRows(pairs: { [key: string]: string }): ParsedRowData[] {
    // Convertir pares clave-valor a formato de fila
    const results: ParsedRowData[] = [];
    
    Object.entries(pairs).forEach(([key, value]) => {
      if (this.isNerveOrMuscleKey(key)) {
        const row: ParsedRowData = {
          nerve: key,
          side: 'bilateral',
          data: { value }
        };
        results.push(row);
      }
    });
    
    return results;
  }

  private static isNerveOrMuscleKey(key: string): boolean {
    const medicalTerms = ['nerve', 'muscle', 'lat', 'amp', 'vel'];
    return medicalTerms.some(term => key.toLowerCase().includes(term));
  }

  private static generateRecommendations(analysis: TableStructureAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.confidence < 70) {
      recommendations.push('Considerar revisión manual de los datos extraídos');
    }
    
    if (analysis.hasMultilineHeaders) {
      recommendations.push('Tabla con cabeceras multi-línea detectada - validar mapeo de columnas');
    }
    
    if (analysis.hasMergedCells) {
      recommendations.push('Posibles celdas combinadas detectadas - verificar datos extraídos');
    }
    
    if (analysis.separatorType === 'mixed') {
      recommendations.push('Formato de separadores inconsistente - revisar estructura de tabla');
    }
    
    return recommendations;
  }

  private static validateAndImproveResults(
    results: ParsedRowData[], 
    analysis: TableStructureAnalysis
  ): ParsedRowData[] {
    // Filtrar resultados inválidos
    const validResults = results.filter(result => this.isValidResult(result));
    
    // Aplicar mejoras basadas en el análisis
    return validResults.map(result => this.improveResult(result, analysis));
  }

  private static isValidResult(result: ParsedRowData): boolean {
    return !!(result.nerve && (result.latency > 0 || result.amplitude > 0 || result.velocity > 0));
  }

  private static improveResult(result: ParsedRowData, analysis: TableStructureAnalysis): ParsedRowData {
    // Aplicar mejoras contextuales
    const improved = { ...result };
    
    // Normalizar nombres de nervios
    if (improved.nerve) {
      improved.nerve = this.normalizeNerveName(improved.nerve);
    }
    
    return improved;
  }

  private static normalizeNerveName(nerve: string): string {
    const normalized = nerve.toLowerCase().trim();
    const nerveMap: { [key: string]: string } = {
      'median': 'Mediano',
      'mediano': 'Mediano',
      'ulnar': 'Ulnar',
      'cubital': 'Ulnar',
      'radial': 'Radial'
    };
    
    return nerveMap[normalized] || nerve;
  }

  /**
   * 📊 MÉTODO PÚBLICO MEJORADO: Validación de resultados con métricas detalladas
   */
  public static validateResults(results: ParsedRowData[]): {
    totalRows: number;
    validRows: number;
    completenessScore: number;
    qualityScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let validRows = 0;
    let qualitySum = 0;
    
    results.forEach((result, index) => {
      const hasRequiredData = result.nerve || result.muscle;
      const hasNumericData = Object.values(result).some(value => typeof value === 'number' && value > 0);
      
      let rowQuality = 0;
      
      if (hasRequiredData) rowQuality += 40;
      if (hasNumericData) rowQuality += 30;
      if (result.side && result.side !== 'bilateral') rowQuality += 20;
      if (result.latency && result.amplitude && result.velocity) rowQuality += 10;
      
      qualitySum += rowQuality;
      
      if (hasRequiredData && hasNumericData) {
        validRows++;
      } else {
        issues.push(`Fila ${index + 1}: Datos insuficientes`);
      }
      
      if (rowQuality < 50) {
        recommendations.push(`Revisar calidad de datos en fila ${index + 1}`);
      }
    });
    
    const completenessScore = results.length > 0 ? (validRows / results.length) * 100 : 0;
    const qualityScore = results.length > 0 ? qualitySum / results.length : 0;
    
    if (completenessScore < 80) {
      recommendations.push('Considerar re-procesar el archivo con diferentes parámetros');
    }
    
    if (qualityScore < 60) {
      recommendations.push('La calidad de los datos extraídos es baja - validación manual recomendada');
    }
    
    return {
      totalRows: results.length,
      validRows,
      completenessScore,
      qualityScore,
      issues,
      recommendations
    };
  }
}

export default TableParser; 