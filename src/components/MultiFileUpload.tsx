import { useCallback, useState } from 'react';
import { Upload, FileText, X, Plus, Files } from 'lucide-react';
import { cn } from '../utils/cn';
import type { SourceFile } from '../types';

interface MultiFileUploadProps {
  sources: SourceFile[];
  onFilesSelect: (files: File[]) => void;
  onTextPaste: (text: string) => void;
  onClear: () => void;
  participantCount: number;
  hasData: boolean;
}

export function MultiFileUpload({ sources, onFilesSelect, onTextPaste, onClear, participantCount, hasData }: MultiFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext === 'xlsx' || ext === 'xls' || ext === 'csv' || ext === 'txt';
    });
    if (files.length > 0) onFilesSelect(files);
  }, [onFilesSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesSelect(files);
    e.target.value = '';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextPaste(e.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Files className="h-5 w-5" />
        1. Ingesta de Datos (Múltiples archivos)
      </h2>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
        )}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Arrastra y suelta uno o varios archivos aquí
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          .xlsx, .xls, .csv, .txt
        </p>
        <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
          <Plus className="h-4 w-4 inline mr-1" />
          Añadir archivos
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv,.txt" multiple onChange={handleFileInput} />
        </label>
      </div>

      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Archivos cargados</p>
          <div className="flex flex-wrap gap-2">
            {sources.map(src => (
              <span key={src.id} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                {src.name} ({src.count})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          O pegar lista manualmente
        </label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Pega nombres separados por comas, saltos de línea, punto y coma o tabuladores..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
        />
      </div>

      <div className="flex items-center justify-between">
        {hasData && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            ✅ {participantCount} participantes válidos detectados
          </span>
        )}
        <button
          onClick={() => { setText(''); onClear(); }}
          className="ml-auto px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
        >
          <X className="h-4 w-4" />
          Limpiar todo
        </button>
      </div>
    </div>
  );
}
