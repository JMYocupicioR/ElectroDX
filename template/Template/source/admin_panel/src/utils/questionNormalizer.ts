/**
 * Question Normalizer Utility
 * 
 * Automatically detects and normalizes different question formats for bulk upload.
 * Handles both flat and nested structures, applies corrections, and provides warnings.
 */

export interface NormalizationResult {
    normalized: any;
    warnings: string[];
    errors: string[];
    corrected: boolean;
}

/**
 * Normalizes a raw question object to the expected database format
 * 
 * @param rawQuestion - The raw question data from JSON/CSV
 * @returns NormalizationResult with normalized data and any warnings/errors
 */
export function normalizeQuestion(rawQuestion: any): NormalizationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let corrected = false;

    // Create a working copy
    const q = { ...rawQuestion };

    // --- 1. DETECT FORMAT AND NORMALIZE STRUCTURE ---
    
    // If question has 'stem' at root level (flat format), convert to nested
    if (q.stem && !q.content) {
        corrected = true;
        warnings.push('Formato plano detectado → convertido a formato anidado');
        
        q.content = {
            stem: q.stem,
            options: q.options || [],
            findings: q.findings || []
        };
        
        // Remove from root level
        delete q.stem;
        delete q.options;
        delete q.findings;
    }

    // --- 2. VALIDATE CONTENT OBJECT ---
    
    if (!q.content || typeof q.content !== 'object') {
        errors.push('Campo "content" faltante o inválido');
        return { normalized: q, warnings, errors, corrected };
    }

    // Ensure content has stem
    if (!q.content.stem || typeof q.content.stem !== 'string' || q.content.stem.trim() === '') {
        errors.push('Campo "content.stem" (enunciado) es requerido');
        return { normalized: q, warnings, errors, corrected };
    }

    // Ensure content has options array
    if (!Array.isArray(q.content.options) || q.content.options.length === 0) {
        errors.push('Campo "content.options" debe ser un array con al menos una opción');
        return { normalized: q, warnings, errors, corrected };
    }

    // --- 3. NORMALIZE OPTIONS ---
    
    q.content.options = q.content.options.map((opt: any, optIndex: number) => {
        const normalizedOpt = { ...opt };
        
        // Rename 'feedback' to 'feedback_clinical' if needed
        if (opt.feedback && !opt.feedback_clinical) {
            normalizedOpt.feedback_clinical = opt.feedback;
            delete normalizedOpt.feedback;
            if (optIndex === 0) { // Only warn once per question
                corrected = true;
                warnings.push('Campo "feedback" renombrado a "feedback_clinical" en opciones');
            }
        }
        
        // Ensure required fields
        if (!normalizedOpt.text) {
            normalizedOpt.text = `Opción ${optIndex + 1}`;
            corrected = true;
            warnings.push(`Opción ${optIndex + 1}: texto faltante, agregado por defecto`);
        }
        
        if (typeof normalizedOpt.is_correct !== 'boolean') {
            normalizedOpt.is_correct = false;
        }
        
        return normalizedOpt;
    });

    // --- 4. VALIDATE CORRECT ANSWERS ---
    
    const correctAnswers = q.content.options.filter((opt: any) => opt.is_correct === true);
    
    if (correctAnswers.length === 0) {
        // No correct answer - mark first as correct
        q.content.options[0].is_correct = true;
        corrected = true;
        warnings.push('⚠️ Sin respuesta correcta → primera opción marcada como correcta');
    } else if (correctAnswers.length > 1) {
        // Multiple correct answers - keep only first one
        let foundFirst = false;
        q.content.options = q.content.options.map((opt: any) => {
            if (opt.is_correct && !foundFirst) {
                foundFirst = true;
                return opt;
            } else if (opt.is_correct) {
                return { ...opt, is_correct: false };
            }
            return opt;
        });
        corrected = true;
        warnings.push(`⚠️ Múltiples respuestas correctas (${correctAnswers.length}) → solo primera mantenida`);
    }

    // --- 5. NORMALIZE ROOT FIELDS ---
    
    // Island name
    if (!q.island_name || typeof q.island_name !== 'string' || q.island_name.trim() === '') {
        errors.push('Campo "island_name" es requerido');
        return { normalized: q, warnings, errors, corrected };
    }
    q.island_name = q.island_name.trim();

    // Topic name
    if (!q.topic_name || typeof q.topic_name !== 'string' || q.topic_name.trim() === '') {
        errors.push('Campo "topic_name" es requerido');
        return { normalized: q, warnings, errors, corrected };
    }
    q.topic_name = q.topic_name.trim();

    // Difficulty (1-5)
    if (typeof q.difficulty !== 'number') {
        if (typeof q.difficulty === 'string' && !isNaN(Number(q.difficulty))) {
            q.difficulty = Number(q.difficulty);
            corrected = true;
            warnings.push('Dificultad convertida de string a número');
        } else {
            q.difficulty = 1;
            corrected = true;
            warnings.push('Dificultad inválida → establecida en 1 por defecto');
        }
    }
    
    if (q.difficulty < 1 || q.difficulty > 5) {
        q.difficulty = Math.max(1, Math.min(5, q.difficulty));
        corrected = true;
        warnings.push(`Dificultad fuera de rango → ajustada a ${q.difficulty}`);
    }

    // is_critical (boolean)
    if (typeof q.is_critical !== 'boolean') {
        q.is_critical = false;
        corrected = true;
        warnings.push('Campo "is_critical" faltante → establecido en false');
    }

    // Optional fields - set empty strings if missing
    if (!q.pearl || typeof q.pearl !== 'string') {
        q.pearl = '';
    }
    
    if (!q.source_reference || typeof q.source_reference !== 'string') {
        q.source_reference = '';
    }

    // Ensure findings exists (can be empty array)
    if (!q.content.findings) {
        q.content.findings = [];
    }

    return {
        normalized: q,
        warnings,
        errors,
        corrected
    };
}

/**
 * Batch normalize an array of questions
 * 
 * @param questions - Array of raw question objects
 * @returns Object with normalized questions and summary statistics
 */
export function normalizeQuestions(questions: any[]): {
    normalized: any[];
    totalCorrections: number;
    totalWarnings: number;
    totalErrors: number;
    details: Array<{ index: number; warnings: string[]; errors: string[] }>;
} {
    let totalCorrections = 0;
    let totalWarnings = 0;
    let totalErrors = 0;
    const details: Array<{ index: number; warnings: string[]; errors: string[] }> = [];

    const normalized = questions.map((q, index) => {
        const result = normalizeQuestion(q);
        
        if (result.corrected) totalCorrections++;
        totalWarnings += result.warnings.length;
        totalErrors += result.errors.length;
        
        if (result.warnings.length > 0 || result.errors.length > 0) {
            details.push({
                index: index + 1,
                warnings: result.warnings,
                errors: result.errors
            });
        }
        
        return result.normalized;
    });

    return {
        normalized,
        totalCorrections,
        totalWarnings,
        totalErrors,
        details
    };
}
