import { X } from 'lucide-react';

interface ColumnSelectorProps {
  columns: string[];
  onSelect: (columnIndex: number) => void;
  onCancel: () => void;
}

export function ColumnSelector({ columns, onSelect, onCancel }: ColumnSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seleccionar columna
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          El archivo tiene múltiples columnas con datos. Selecciona de cuál extraer los nombres:
        </p>
        <div className="space-y-2">
          {columns.map((col, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              {col}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
