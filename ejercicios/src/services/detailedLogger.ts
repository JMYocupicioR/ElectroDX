/**
 * SISTEMA DE LOGGING DETALLADO PARA DEBUGGING EFICIENTE
 * =====================================================
 * 
 * Implementa un sistema robusto de logs con niveles de severidad,
 * contexto médico y trazabilidad completa para depuración.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: any;
  stackTrace?: string;
  sessionId: string;
  processId: string;
}

export interface LoggingConfig {
  enableConsole: boolean;
  enableStorage: boolean;
  minLevel: LogLevel;
  maxEntries: number;
  includeStackTrace: boolean;
  formatStyle: 'detailed' | 'compact' | 'medical';
}

export class DetailedLogger {
  private module: string;
  private sessionId: string;
  private processId: string;
  private static globalConfig: LoggingConfig = {
    enableConsole: true,
    enableStorage: true,
    minLevel: 'INFO',
    maxEntries: 1000,
    includeStackTrace: false,
    formatStyle: 'medical'
  };

  private static logHistory: LogEntry[] = [];
  private static readonly LOG_LEVELS: Record<LogLevel, number> = {
    'DEBUG': 0,
    'INFO': 1,
    'WARN': 2,
    'ERROR': 3,
    'CRITICAL': 4
  };

  constructor(module: string, processId?: string) {
    this.module = module;
    this.sessionId = this.generateSessionId();
    this.processId = processId || this.generateProcessId();
  }

  // ========== MÉTODOS PRINCIPALES DE LOGGING ==========

  /**
   * 🔍 Log nivel DEBUG - Para desarrollo y debugging detallado
   */
  debug(message: string, context?: any): void {
    this.log('DEBUG', message, context);
  }

  /**
   * ℹ️ Log nivel INFO - Para flujo normal del programa
   */
  info(message: string, context?: any): void {
    this.log('INFO', message, context);
  }

  /**
   * ⚠️ Log nivel WARN - Para situaciones que requieren atención
   */
  warn(message: string, context?: any): void {
    this.log('WARN', message, context);
  }

  /**
   * ❌ Log nivel ERROR - Para errores manejables
   */
  error(message: string, context?: any): void {
    this.log('ERROR', message, context, true);
  }

  /**
   * 💥 Log nivel CRITICAL - Para errores críticos del sistema
   */
  critical(message: string, context?: any): void {
    this.log('CRITICAL', message, context, true);
  }

  /**
   * 🎯 Log específico para inicio de operación
   */
  startOperation(operationName: string, context?: any): string {
    const operationId = this.generateOperationId();
    this.info(`🚀 INICIO: ${operationName}`, { 
      operationId, 
      ...context 
    });
    return operationId;
  }

  /**
   * ✅ Log específico para fin exitoso de operación
   */
  endOperation(operationName: string, operationId: string, context?: any): void {
    this.info(`✅ ÉXITO: ${operationName}`, { 
      operationId, 
      ...context 
    });
  }

  /**
   * ❌ Log específico para fin fallido de operación
   */
  failOperation(operationName: string, operationId: string, error: any, context?: any): void {
    this.error(`❌ FALLO: ${operationName}`, { 
      operationId, 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context 
    });
  }

  /**
   * 📊 Log específico para métricas y estadísticas
   */
  metrics(metricName: string, values: Record<string, number | string>, context?: any): void {
    this.info(`📊 MÉTRICA: ${metricName}`, { 
      metrics: values, 
      ...context 
    });
  }

  /**
   * 🏥 Log específico para contexto médico
   */
  medical(event: string, medicalContext: {
    patientId?: string;
    studyType?: string;
    nervesTested?: string[];
    findings?: string[];
    confidence?: number;
  }, additionalContext?: any): void {
    this.info(`🏥 MÉDICO: ${event}`, { 
      medical: medicalContext, 
      ...additionalContext 
    });
  }

  /**
   * 🔄 Log para seguimiento de flujo de procesamiento
   */
  step(stepNumber: number, stepName: string, status: 'start' | 'progress' | 'complete' | 'error', context?: any): void {
    const emoji = {
      start: '🔄',
      progress: '⏳',
      complete: '✅',
      error: '❌'
    }[status];

    const level: LogLevel = status === 'error' ? 'ERROR' : 'INFO';
    
    this.log(level, `${emoji} PASO ${stepNumber}: ${stepName}`, { 
      step: stepNumber, 
      status, 
      ...context 
    });
  }

  // ========== MÉTODO CORE DE LOGGING ==========

  private log(level: LogLevel, message: string, context?: any, includeStack: boolean = false): void {
    const config = DetailedLogger.globalConfig;
    
    // Verificar si el nivel cumple el mínimo configurado
    if (DetailedLogger.LOG_LEVELS[level] < DetailedLogger.LOG_LEVELS[config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      context,
      sessionId: this.sessionId,
      processId: this.processId,
      stackTrace: (includeStack || config.includeStackTrace) ? this.getStackTrace() : undefined
    };

    // Almacenar en historial
    if (config.enableStorage) {
      this.storeLogEntry(entry);
    }

    // Mostrar en consola
    if (config.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  // ========== MÉTODOS DE SALIDA ==========

  private outputToConsole(entry: LogEntry): void {
    const config = DetailedLogger.globalConfig;
    const formatted = this.formatLogEntry(entry, config.formatStyle);
    
    switch (entry.level) {
      case 'DEBUG':
        console.debug(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
      case 'CRITICAL':
        console.error(formatted);
        break;
    }
  }

  private formatLogEntry(entry: LogEntry, style: 'detailed' | 'compact' | 'medical'): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    switch (style) {
      case 'detailed':
        return this.formatDetailed(entry, timestamp);
      case 'compact':
        return this.formatCompact(entry, timestamp);
      case 'medical':
        return this.formatMedical(entry, timestamp);
      default:
        return this.formatCompact(entry, timestamp);
    }
  }

  private formatDetailed(entry: LogEntry, timestamp: string): string {
    let formatted = `[${timestamp}] [${entry.level}] [${entry.module}] ${entry.message}`;
    
    if (entry.context) {
      formatted += `\n  📋 Contexto: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.stackTrace) {
      formatted += `\n  📚 Stack: ${entry.stackTrace}`;
    }
    
    return formatted;
  }

  private formatCompact(entry: LogEntry, timestamp: string): string {
    const levelEmoji = {
      'DEBUG': '🔍',
      'INFO': 'ℹ️',
      'WARN': '⚠️',
      'ERROR': '❌',
      'CRITICAL': '💥'
    }[entry.level];

    let formatted = `${levelEmoji} [${entry.module}] ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextSummary = this.summarizeContext(entry.context);
      formatted += ` | ${contextSummary}`;
    }
    
    return formatted;
  }

  private formatMedical(entry: LogEntry, timestamp: string): string {
    const levelEmoji = {
      'DEBUG': '🔬',
      'INFO': '🏥',
      'WARN': '⚕️',
      'ERROR': '🚨',
      'CRITICAL': '💊'
    }[entry.level];

    let formatted = `${levelEmoji} [${timestamp}] [${entry.module}] ${entry.message}`;
    
    if (entry.context?.medical) {
      const medical = entry.context.medical;
      const medicalSummary = [
        medical.studyType && `Tipo: ${medical.studyType}`,
        medical.nervesTested && `Nervios: ${medical.nervesTested.length}`,
        medical.confidence && `Confianza: ${medical.confidence}%`
      ].filter(Boolean).join(' | ');
      
      if (medicalSummary) {
        formatted += `\n  🏥 Contexto Médico: ${medicalSummary}`;
      }
    }
    
    return formatted;
  }

  private summarizeContext(context: any): string {
    if (!context || typeof context !== 'object') {
      return String(context);
    }

    const keys = Object.keys(context);
    if (keys.length === 0) return '';
    
    if (keys.length === 1) {
      return `${keys[0]}: ${context[keys[0]]}`;
    }
    
    return `${keys.length} campos`;
  }

  // ========== ALMACENAMIENTO ==========

  private storeLogEntry(entry: LogEntry): void {
    DetailedLogger.logHistory.push(entry);
    
    // Mantener límite de entradas
    const maxEntries = DetailedLogger.globalConfig.maxEntries;
    if (DetailedLogger.logHistory.length > maxEntries) {
      DetailedLogger.logHistory = DetailedLogger.logHistory.slice(-maxEntries);
    }
  }

  // ========== MÉTODOS ESTÁTICOS DE UTILIDAD ==========

  /**
   * Configurar el sistema de logging globalmente
   */
  static configure(config: Partial<LoggingConfig>): void {
    DetailedLogger.globalConfig = { ...DetailedLogger.globalConfig, ...config };
  }

  /**
   * Obtener historial de logs
   */
  static getLogHistory(filter?: {
    level?: LogLevel;
    module?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filtered = DetailedLogger.logHistory;
    
    if (filter) {
      if (filter.level) {
        const minLevelValue = DetailedLogger.LOG_LEVELS[filter.level];
        filtered = filtered.filter(entry => 
          DetailedLogger.LOG_LEVELS[entry.level] >= minLevelValue
        );
      }
      
      if (filter.module) {
        filtered = filtered.filter(entry => entry.module === filter.module);
      }
      
      if (filter.since) {
        filtered = filtered.filter(entry => 
          new Date(entry.timestamp) >= filter.since!
        );
      }
      
      if (filter.limit) {
        filtered = filtered.slice(-filter.limit);
      }
    }
    
    return filtered;
  }

  /**
   * Exportar logs como texto
   */
  static exportLogs(format: 'text' | 'json' | 'csv' = 'text'): string {
    const logs = DetailedLogger.logHistory;
    
    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return DetailedLogger.formatAsCSV(logs);
      case 'text':
      default:
        return logs.map(entry => {
          const timestamp = new Date(entry.timestamp).toLocaleString();
          return `[${timestamp}] [${entry.level}] [${entry.module}] ${entry.message}`;
        }).join('\n');
    }
  }

  /**
   * Limpiar historial de logs
   */
  static clearHistory(): void {
    DetailedLogger.logHistory = [];
  }

  /**
   * Obtener estadísticas de logs
   */
  static getStatistics(): {
    totalEntries: number;
    byLevel: Record<LogLevel, number>;
    byModule: Record<string, number>;
    lastEntry?: LogEntry;
    oldestEntry?: LogEntry;
  } {
    const logs = DetailedLogger.logHistory;
    
    const byLevel = logs.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);
    
    const byModule = logs.reduce((acc, entry) => {
      acc[entry.module] = (acc[entry.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalEntries: logs.length,
      byLevel,
      byModule,
      lastEntry: logs[logs.length - 1],
      oldestEntry: logs[0]
    };
  }

  // ========== MÉTODOS PRIVADOS DE UTILIDAD ==========

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateProcessId(): string {
    return `proc_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private getStackTrace(): string {
    const error = new Error();
    return error.stack?.split('\n').slice(3).join('\n') || '';
  }

  private static formatAsCSV(logs: LogEntry[]): string {
    const headers = ['Timestamp', 'Level', 'Module', 'Message', 'Context'];
    const rows = logs.map(entry => [
      entry.timestamp,
      entry.level,
      entry.module,
      entry.message.replace(/"/g, '""'), // Escape quotes
      entry.context ? JSON.stringify(entry.context).replace(/"/g, '""') : ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

// ========== LOGGER ESPECIALIZADO PARA CONTEXTO MÉDICO ==========

export class MedicalLogger extends DetailedLogger {
  constructor(module: string) {
    super(`Medical_${module}`);
  }

  /**
   * Log específico para procesamiento de paciente
   */
  patientProcessing(patientId: string, stage: string, status: 'start' | 'complete' | 'error', context?: any): void {
    this.medical(`Procesamiento de paciente - ${stage}`, {
      patientId,
      ...context
    });
  }

  /**
   * Log específico para análisis de nervio
   */
  nerveAnalysis(nerve: string, side: 'left' | 'right' | 'bilateral', results: any, context?: any): void {
    this.medical('Análisis de nervio', {
      nervesTested: [nerve],
      findings: results ? ['Datos procesados'] : ['Sin datos'],
      ...context
    }, { nerve, side, results });
  }

  /**
   * Log específico para detección de tabla
   */
  tableDetection(tableType: string, detected: boolean, confidence?: number, context?: any): void {
    this.medical(`Detección de tabla ${tableType}`, {
      studyType: tableType,
      confidence: confidence || (detected ? 100 : 0),
      findings: detected ? ['Tabla detectada'] : ['Tabla no detectada']
    }, context);
  }

  /**
   * Log específico para validación médica
   */
  medicalValidation(validation: string, passed: boolean, issues?: string[], context?: any): void {
    this.medical(`Validación médica - ${validation}`, {
      findings: issues || [],
      confidence: passed ? 100 : 50
    }, { passed, issues, ...context });
  }
}

export default DetailedLogger; 