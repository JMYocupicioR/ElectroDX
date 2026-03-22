/**
 * MEJORADO: Parser RTF robusto para manejar formatos complejos
 * Incluye soporte para tablas, múltiples codificaciones y estructura compleja
 */
export class EnhancedRTFParser {
  private static readonly RTF_CONTROL_WORDS = {
    // Estructura del documento
    'rtf': 'document_start',
    'fonttbl': 'font_table',
    'colortbl': 'color_table',
    'stylesheet': 'style_sheet',
    'info': 'document_info',
    'title': 'document_title',
    'author': 'document_author',
    'subject': 'document_subject',
    'keywords': 'document_keywords',
    'doccomm': 'document_comment',
    'creatim': 'creation_time',
    'revtim': 'revision_time',
    'printim': 'print_time',
    'buptim': 'backup_time',
    
    // Formato de párrafo
    'par': 'paragraph',
    'pard': 'paragraph_default',
    'plain': 'character_default',
    'sect': 'section',
    'sectd': 'section_default',
    'page': 'page_break',
    'line': 'line_break',
    'tab': 'tab',
    'cell': 'table_cell',
    'row': 'table_row',
    'nestcell': 'nested_cell',
    'nestrow': 'nested_row',
    'trowd': 'table_row_default',
    'cellx': 'cell_boundary',
    'trgaph': 'table_gap',
    'trleft': 'table_left',
    'trqc': 'table_center',
    'trqr': 'table_right',
    'trql': 'table_left_align',
    
    // Formato de carácter
    'b': 'bold',
    'i': 'italic',
    'u': 'underline',
    'ul': 'underline',
    'ulnone': 'underline_none',
    'strike': 'strikethrough',
    'scaps': 'small_caps',
    'caps': 'all_caps',
    'sub': 'subscript',
    'super': 'superscript',
    'nosupersub': 'no_super_sub',
    'f': 'font',
    'fs': 'font_size',
    'cf': 'color_foreground',
    'cb': 'color_background',
    'highlight': 'highlight',
    'shad': 'shadow',
    'outline': 'outline',
    'emboss': 'emboss',
    'imprint': 'imprint',
    'v': 'hidden',
    
    // Alineación
    'ql': 'align_left',
    'qc': 'align_center',
    'qr': 'align_right',
    'qj': 'align_justify',
    'qd': 'align_distribute',
    
    // Espaciado
    'sl': 'line_spacing',
    'sb': 'space_before',
    'sa': 'space_after',
    'fi': 'first_line_indent',
    'li': 'left_indent',
    'ri': 'right_indent',
    
    // Listas
    'pn': 'paragraph_numbering',
    'pntext': 'paragraph_number_text',
    'pntxta': 'paragraph_number_text_after',
    'pntxtb': 'paragraph_number_text_before',
    
    // Campos
    'field': 'field',
    'fldrslt': 'field_result',
    'fldinst': 'field_instruction',
    'fldpriv': 'field_private',
    
    // Objetos
    'object': 'object',
    'objemb': 'embedded_object',
    'objlink': 'linked_object',
    'objautlink': 'auto_linked_object',
    'objsub': 'subscriber_object',
    'objpub': 'publisher_object',
    'objicemb': 'ice_embedded_object',
    'objw': 'object_width',
    'objh': 'object_height',
    'objscalex': 'object_scale_x',
    'objscaley': 'object_scale_y',
    
    // Imágenes
    'pict': 'picture',
    'picw': 'picture_width',
    'pich': 'picture_height',
    'picwgoal': 'picture_width_goal',
    'pichgoal': 'picture_height_goal',
    'picscalex': 'picture_scale_x',
    'picscaley': 'picture_scale_y',
    'piccropl': 'picture_crop_left',
    'piccropr': 'picture_crop_right',
    'piccropt': 'picture_crop_top',
    'piccropb': 'picture_crop_bottom',
    'bin': 'binary_data',
    'blipupi': 'blip_upi',
    'blipuid': 'blip_uid',
    'pngblip': 'png_blip',
    'jpegblip': 'jpeg_blip',
    'emfblip': 'emf_blip',
    'wmetafile': 'wmf_blip',
    'dibitmap': 'dib_bitmap',
    'wbitmap': 'wbitmap',
    
    // Caracteres especiales
    'ldblquote': 'left_double_quote',
    'rdblquote': 'right_double_quote',
    'lquote': 'left_single_quote',
    'rquote': 'right_single_quote',
    'bullet': 'bullet',
    'endash': 'en_dash',
    'emdash': 'em_dash',
    'ltrmark': 'left_to_right_mark',
    'rtlmark': 'right_to_left_mark',
    'zwj': 'zero_width_joiner',
    'zwnj': 'zero_width_non_joiner',
    
    // Codificación
    'ansi': 'ansi_codepage',
    'mac': 'mac_codepage',
    'pc': 'pc_codepage',
    'pca': 'pca_codepage',
    'ansicpg': 'ansi_codepage_number',
    'deff': 'default_font',
    'deflang': 'default_language',
    'deflangfe': 'default_language_fe',
    'uc': 'unicode_count',
    'u': 'unicode_char',
    
    // Revisiones
    'revised': 'revised_text',
    'deleted': 'deleted_text',
    'revauth': 'revision_author',
    'revdttm': 'revision_datetime',
    'revtbl': 'revision_table',
    
    // Comentarios
    'atnid': 'annotation_id',
    'atnauthor': 'annotation_author',
    'atnicn': 'annotation_initial',
    'atndate': 'annotation_date',
    'atntime': 'annotation_time',
    'atnref': 'annotation_reference',
    'annotation': 'annotation',
    
    // Marcadores
    'bkmkstart': 'bookmark_start',
    'bkmkend': 'bookmark_end',
    
    // Hipervínculos
    'hyperlink': 'hyperlink',
    'hlloc': 'hyperlink_location',
    'hlsrc': 'hyperlink_source',
    
    // Formas
    'shp': 'shape',
    'shpinst': 'shape_instance',
    'shprslt': 'shape_result',
    'shptxt': 'shape_text',
    'shplid': 'shape_id',
    'shpleft': 'shape_left',
    'shptop': 'shape_top',
    'shpright': 'shape_right',
    'shpbottom': 'shape_bottom',
    'shpwr': 'shape_wrap',
    'shpwrk': 'shape_wrap_type',
    'shpfhdr': 'shape_header',
    'shpz': 'shape_z_order',
    
    // Notas al pie
    'footnote': 'footnote',
    'endnote': 'endnote',
    'chftn': 'footnote_char',
    'chftnsepc': 'footnote_separator_char',
    'chftnsep': 'footnote_separator',
    'chftnpn': 'footnote_page_number',
    'ftnstart': 'footnote_start',
    'ftnrestart': 'footnote_restart',
    'ftnrstcont': 'footnote_restart_continuous',
    'ftnrstpg': 'footnote_restart_page',
    'ftnnalc': 'footnote_numbering_alc',
    'ftnnauc': 'footnote_numbering_auc',
    'ftnnlc': 'footnote_numbering_lc',
    'ftnnuc': 'footnote_numbering_uc',
    'ftnnchi': 'footnote_numbering_chi',
    'ftnnr': 'footnote_numbering_roman',
    'ftnnar': 'footnote_numbering_arabic',
    
    // Encabezados y pies de página
    'header': 'header',
    'footer': 'footer',
    'headerl': 'header_left',
    'headerr': 'header_right',
    'headerf': 'header_first',
    'footerl': 'footer_left',
    'footerr': 'footer_right',
    'footerf': 'footer_first',
    'titlepg': 'title_page',
    'facingp': 'facing_pages',
    'margmirror': 'mirror_margins',
    
    // Márgenes
    'margl': 'margin_left',
    'margr': 'margin_right',
    'margt': 'margin_top',
    'margb': 'margin_bottom',
    'gutter': 'gutter',
    'guttersxn': 'gutter_section',
    'margtsxn': 'margin_top_section',
    'margbsxn': 'margin_bottom_section',
    'marglsxn': 'margin_left_section',
    'margrsxn': 'margin_right_section',
    
    // Información de página
    'paperw': 'paper_width',
    'paperh': 'paper_height',
    'psz': 'paper_size',
    'landscape': 'landscape',
    'facingp': 'facing_pages',
    'margmirror': 'mirror_margins',
    'gutter': 'gutter',
    'sectunlocked': 'section_unlocked',
    'sectdefaultcl': 'section_default_column',
    'endnhere': 'endnote_here',
    'enddoc': 'endnote_end_document',
    'ftnsep': 'footnote_separator',
    'ftnsepc': 'footnote_separator_continued',
    'aftnsep': 'alternate_footnote_separator',
    'aftnsepc': 'alternate_footnote_separator_continued',
    'ftnstart': 'footnote_start_number',
    'aftnstart': 'alternate_footnote_start_number',
  };

  private static readonly SPECIAL_CHARS = {
    '\\': '\\',
    '{': '{',
    '}': '}',
    '~': '\u00A0', // Non-breaking space
    '-': '\u00AD', // Soft hyphen
    '_': '\u2011', // Non-breaking hyphen
    '|': '\u2003', // Em space
    '\'': '', // Hex encoded character (handled separately)
    '\n': '\n',
    '\r': '\r',
    '\t': '\t',
  };

  private static readonly UNICODE_REPLACEMENTS: { [key: string]: string } = {
    '\\u8216': "'",
    '\\u8217': "'",
    '\\u8220': '"',
    '\\u8221': '"',
    '\\u8211': '-',
    '\\u8212': '-',
    '\\u8226': '*',
    '\\u8230': '...',
    '\\u8364': 'EUR',
    '\\u8482': '(TM)',
    '\\u169': '(C)',
    '\\u174': '(R)',
    '\\u8240': 'permille',
    '\\u8249': '<',
    '\\u8250': '>',
    '\\u171': '<<',
    '\\u187': '>>',
    '\\u8594': '<->',
    '\\u8592': '<-',
    '\\u8593': '^',
    '\\u8595': 'v'
  };

  /**
   * MEJORADO: Parsear contenido RTF con manejo robusto de errores
   */
  public static parseRTF(rtfContent: string): {
    text: string;
    tables: any[];
    metadata: any;
    structure: any;
    errors: string[];
  } {
    const result = {
      text: '',
      tables: [] as any[],
      metadata: {} as any,
      structure: {} as any,
      errors: [] as string[]
    };

    try {
      // 🔥 PASO 1: Validar formato RTF
      if (!rtfContent.trim().startsWith('{\\rtf')) {
        throw new Error('Formato RTF inválido: debe comenzar con {\\rtf');
      }

      // 🔥 PASO 2: Limpiar y normalizar contenido
      const cleanContent = this.normalizeRTFContent(rtfContent);

      // 🔥 PASO 3: Tokenizar contenido RTF
      const tokens = this.tokenizeRTF(cleanContent);

      // 🔥 PASO 4: Parsear tokens
      const parsed = this.parseTokens(tokens);

      // 🔥 PASO 5: Extraer texto plano
      result.text = this.extractPlainText(parsed);

      // 🔥 PASO 6: Extraer tablas
      result.tables = this.extractTables(parsed);

      // 🔥 PASO 7: Extraer metadatos
      result.metadata = this.extractMetadata(parsed);

      // 🔥 PASO 8: Extraer estructura
      result.structure = this.extractStructure(parsed);

      console.log('✅ RTF parseado exitosamente:', {
        textLength: result.text.length,
        tablesFound: result.tables.length,
        metadataKeys: Object.keys(result.metadata).length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      result.errors.push(`Error al parsear RTF: ${errorMessage}`);
      console.error('❌ Error al parsear RTF:', error);
      
      // 🔥 FALLBACK: Intentar extracción básica
      try {
        result.text = this.extractBasicText(rtfContent);
        result.errors.push('Se utilizó extracción básica como fallback');
      } catch (fallbackError) {
        result.errors.push('Falló también la extracción básica');
      }
    }

    return result;
  }

  /**
   * NUEVO: Normalizar contenido RTF
   */
  private static normalizeRTFContent(content: string): string {
    // Normalizar saltos de línea
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remover caracteres de control problemáticos
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Normalizar espacios en blanco
    content = content.replace(/\s+/g, ' ');
    
    return content;
  }

  /**
   * NUEVO: Tokenizar contenido RTF
   */
  private static tokenizeRTF(content: string): any[] {
    const tokens: any[] = [];
    let pos = 0;
    
    while (pos < content.length) {
      const char = content[pos];
      
      if (char === '{') {
        tokens.push({ type: 'group_start', pos });
        pos++;
      } else if (char === '}') {
        tokens.push({ type: 'group_end', pos });
        pos++;
      } else if (char === '\\') {
        const controlResult = this.parseControlWord(content, pos);
        tokens.push(controlResult.token);
        pos = controlResult.nextPos;
      } else {
        const textResult = this.parseText(content, pos);
        if (textResult.text) {
          tokens.push({ type: 'text', text: textResult.text, pos });
        }
        pos = textResult.nextPos;
      }
    }
    
    return tokens;
  }

  /**
   * NUEVO: Parsear palabra de control
   */
  private static parseControlWord(content: string, pos: number): {
    token: any;
    nextPos: number;
  } {
    let nextPos = pos + 1; // Saltar el '\'
    
    // Verificar si es un carácter especial
    if (nextPos < content.length && this.SPECIAL_CHARS[content[nextPos]]) {
      return {
        token: {
          type: 'special_char',
          char: this.SPECIAL_CHARS[content[nextPos]],
          pos
        },
        nextPos: nextPos + 1
      };
    }
    
    // Verificar si es un carácter hexadecimal
    if (nextPos < content.length && content[nextPos] === '\'') {
      const hexMatch = content.slice(nextPos + 1, nextPos + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hexMatch)) {
        const charCode = parseInt(hexMatch, 16);
        return {
          token: {
            type: 'hex_char',
            char: String.fromCharCode(charCode),
            pos
          },
          nextPos: nextPos + 3
        };
      }
    }
    
    // Parsear palabra de control normal
    let controlWord = '';
    while (nextPos < content.length && /[a-zA-Z]/.test(content[nextPos])) {
      controlWord += content[nextPos];
      nextPos++;
    }
    
    // Parsear parámetro numérico opcional
    let parameter = '';
    let hasParameter = false;
    
    if (nextPos < content.length && (content[nextPos] === '-' || /\d/.test(content[nextPos]))) {
      hasParameter = true;
      if (content[nextPos] === '-') {
        parameter += '-';
        nextPos++;
      }
      while (nextPos < content.length && /\d/.test(content[nextPos])) {
        parameter += content[nextPos];
        nextPos++;
      }
    }
    
    // Saltar el espacio delimitador opcional
    if (nextPos < content.length && content[nextPos] === ' ') {
      nextPos++;
    }
    
    return {
      token: {
        type: 'control_word',
        word: controlWord,
        parameter: hasParameter ? parseInt(parameter) : null,
        pos
      },
      nextPos
    };
  }

  /**
   * NUEVO: Parsear texto plano
   */
  private static parseText(content: string, pos: number): {
    text: string;
    nextPos: number;
  } {
    let text = '';
    let nextPos = pos;
    
    while (nextPos < content.length) {
      const char = content[nextPos];
      if (char === '\\' || char === '{' || char === '}') {
        break;
      }
      text += char;
      nextPos++;
    }
    
    return { text, nextPos };
  }

  /**
   * NUEVO: Parsear tokens en estructura
   */
  private static parseTokens(tokens: any[]): any {
    const result = {
      groups: [] as any[],
      controlWords: [] as any[],
      text: [] as any[],
      tables: [] as any[],
      metadata: {} as any
    };
    
    let groupLevel = 0;
    let currentGroup: any = null;
    let currentTable: any = null;
    let inTable = false;
    
    for (const token of tokens) {
      switch (token.type) {
        case 'group_start':
          groupLevel++;
          currentGroup = {
            level: groupLevel,
            content: [],
            startPos: token.pos
          };
          result.groups.push(currentGroup);
          break;
          
        case 'group_end':
          groupLevel--;
          if (currentGroup) {
            currentGroup.endPos = token.pos;
            currentGroup = null;
          }
          break;
          
        case 'control_word':
          result.controlWords.push(token);
          
          // Detectar inicio de tabla
          if (token.word === 'trowd') {
            inTable = true;
            currentTable = {
              rows: [],
              cells: [],
              properties: {}
            };
          }
          
          // Detectar fin de fila de tabla
          if (token.word === 'row' && inTable && currentTable) {
            currentTable.rows.push([...currentTable.cells]);
            currentTable.cells = [];
          }
          
          // Detectar fin de tabla
          if (token.word === 'pard' && inTable && currentTable) {
            result.tables.push(currentTable);
            currentTable = null;
            inTable = false;
          }
          
          // Detectar celda de tabla
          if (token.word === 'cell' && inTable && currentTable) {
            // La celda se agregará cuando se encuentre el texto
          }
          
          break;
          
        case 'text':
          result.text.push(token);
          
          // Agregar texto a celda de tabla si estamos en una tabla
          if (inTable && currentTable && token.text.trim()) {
            currentTable.cells.push(token.text.trim());
          }
          break;
          
        case 'special_char':
        case 'hex_char':
          result.text.push({
            type: 'text',
            text: token.char,
            pos: token.pos
          });
          break;
      }
    }
    
    return result;
  }

  /**
   * NUEVO: Extraer texto plano
   */
  private static extractPlainText(parsed: any): string {
    let text = '';
    
    for (const textToken of parsed.text) {
      if (textToken.text) {
        text += textToken.text;
      }
    }
    
    // Aplicar reemplazos de Unicode
    for (const [pattern, replacement] of Object.entries(this.UNICODE_REPLACEMENTS)) {
      text = text.replace(new RegExp(pattern, 'g'), replacement);
    }
    
    // Limpiar espacios múltiples y saltos de línea
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * NUEVO: Extraer tablas
   */
  private static extractTables(parsed: any): any[] {
    const tables = [];
    
    for (const table of parsed.tables) {
      if (table.rows && table.rows.length > 0) {
        tables.push({
          rows: table.rows,
          rowCount: table.rows.length,
          columnCount: table.rows[0] ? table.rows[0].length : 0,
          properties: table.properties || {}
        });
      }
    }
    
    return tables;
  }

  /**
   * NUEVO: Extraer metadatos
   */
  private static extractMetadata(parsed: any): any {
    const metadata: any = {};
    
    for (const controlWord of parsed.controlWords) {
      switch (controlWord.word) {
        case 'title':
          metadata.title = 'Document Title';
          break;
        case 'author':
          metadata.author = 'Document Author';
          break;
        case 'subject':
          metadata.subject = 'Document Subject';
          break;
        case 'keywords':
          metadata.keywords = 'Document Keywords';
          break;
        case 'creatim':
          metadata.created = 'Creation Time';
          break;
        case 'revtim':
          metadata.revised = 'Revision Time';
          break;
        case 'printim':
          metadata.printed = 'Print Time';
          break;
      }
    }
    
    return metadata;
  }

  /**
   * NUEVO: Extraer estructura
   */
  private static extractStructure(parsed: any): any {
    return {
      groupCount: parsed.groups.length,
      controlWordCount: parsed.controlWords.length,
      textTokenCount: parsed.text.length,
      tableCount: parsed.tables.length,
      maxGroupLevel: Math.max(...parsed.groups.map(g => g.level), 0)
    };
  }

  /**
   * NUEVO: Extracción básica como fallback
   */
  private static extractBasicText(rtfContent: string): string {
    // Remover comandos RTF básicos
    let text = rtfContent.replace(/\{\\rtf1[^}]*\}/g, '');
    text = text.replace(/\{\\[^}]*\}/g, '');
    text = text.replace(/\\[a-zA-Z]+\d*\s?/g, '');
    text = text.replace(/\{|\}/g, '');
    text = text.replace(/\\\'/g, '');
    
    // Aplicar reemplazos de Unicode
    for (const [pattern, replacement] of Object.entries(this.UNICODE_REPLACEMENTS)) {
      text = text.replace(new RegExp(pattern, 'g'), replacement);
    }
    
    // Limpiar espacios múltiples
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
} 