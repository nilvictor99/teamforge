import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { MappedColumn } from '../types';

interface ColumnMapperProps {
  headers: string[];
  previewData: string[][];
  onApply: (mappings: MappedColumn[]) => void;
  onCancel: () => void;
}

export function ColumnMapper({ headers, previewData, onApply, onCancel }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<MappedColumn[]>(() => 
    headers.map((h, i) => {
      const hl = h.toLowerCase();
      if (['nombre','name','alumno','participante','integrante'].some(k => hl.includes(k))) {
        return { index: i, header: h, useAs: 'name' as const };
      }
      if (['sexo','genero','género','gender','sex'].some(k => hl.includes(k))) {
        return { index: i, header: h, useAs: 'gender' as const };
      }
      if (['id','matricula','codigo','estado','tel','email'].some(k => hl.includes(k))) {
        return { index: i, header: h, useAs: 'ignore' as const };
      }
      return { index: i, header: h, useAs: i === 0 ? 'name' as const : 'ignore' as const };
    })
  );

  const updateMapping = (index: number, useAs: MappedColumn['useAs']) => {
    setMappings(prev => prev.map(m => m.index === index ? { ...m, useAs } : m));
  };

  const hasNameColumn = mappings.some(m => m.useAs === 'name');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mapeo de columnas
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona qué columna usar para nombres (obligatorio), género (opcional) o ignorar.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {headers.map((h, i) => (
                  <th key={i} className="text-left p-2 text-gray-900 dark:text-white">
                    {h || `Columna ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 3).map((row, ri) => (
                <tr key={ri} className="border-b border-gray-100 dark:border-gray-700/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2 text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {h || `Columna ${i + 1}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {previewData[0]?.[i] || ''}
                </p>
              </div>
              <select
                value={mappings.find(m => m.index === i)?.useAs}
                onChange={(e) => updateMapping(i, e.target.value as MappedColumn['useAs'])}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="name">Usar como nombre</option>
                <option value="gender">Usar como género</option>
                <option value="ignore">Ignorar</option>
                <option value="meta">Guardar en meta</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onApply(mappings)}
            disabled={!hasNameColumn}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Aplicar mapeo
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            Cancelar
          </button>
        </div>
        {!hasNameColumn && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Debes marcar al menos una columna como "Usar como nombre"
          </p>
        )}
      </div>
    </div>
  );
}
