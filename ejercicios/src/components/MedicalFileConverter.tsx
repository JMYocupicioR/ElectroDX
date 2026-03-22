import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertTriangle, Settings } from 'lucide-react';
import { MedicalFileConverter } from '../services/medicalFileConverter';
import { FileConversionResult } from '../types/medical';

const MedicalFileConverterComponent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [conversionResults, setConversionResults] = useState<FileConversionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev: File[]) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev: File[]) => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number): void => {
    setFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const handleConvert = async (): Promise<void> => {
    setIsProcessing(true);
    const converter = MedicalFileConverter.getInstance();
    const results: FileConversionResult[] = [];

    for (const file of files) {
      try {
        const result = await converter.convertFile(file);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          report: null,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
          warnings: [],
          processingTime: 0
        });
      }
    }

    setConversionResults(results);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Conversor de Archivos Médicos</h1>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-6 w-6" />
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg">
                  Arrastra y suelta tus archivos aquí o{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    selecciona archivos
                  </button>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Formatos soportados: RTF, DOCX, PDF, XML • Tamaño máximo: 50MB por archivo
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold">Archivos seleccionados</h2>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span>{file.name}</span>
                      <span className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConvert}
              disabled={files.length === 0 || isProcessing}
              className={`
                px-6 py-2 rounded-lg font-medium flex items-center
                ${
                  files.length === 0 || isProcessing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Convertir archivos
                </>
              )}
            </button>
          </div>

          {conversionResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold">Resultados de la conversión</h2>
              <div className="space-y-2">
                {conversionResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      result.success
                        ? 'bg-green-900/50 border border-green-500/50'
                        : 'bg-red-900/50 border border-red-500/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {result.success ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="font-medium">
                        {files[index].name} - {result.success ? 'Éxito' : 'Error'}
                      </span>
                    </div>
                    {result.errors.length > 0 && (
                      <div className="text-sm text-red-200">
                        {result.errors.map((error, i) => (
                          <p key={i}>{error}</p>
                        ))}
                      </div>
                    )}
                    {result.warnings.length > 0 && (
                      <div className="text-sm text-yellow-200 mt-2">
                        {result.warnings.map((warning, i) => (
                          <p key={i}>{warning}</p>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-400 mt-2">
                      Tiempo de procesamiento: {(result.processingTime / 1000).toFixed(2)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".rtf,.docx,.pdf,.xml"
            multiple
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalFileConverterComponent; 