import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import type { Participant } from '../types';

interface DuplicateManagerProps {
  participants: Participant[];
  duplicates: string[];
  onApply: (participants: Participant[]) => void;
  onCancel: () => void;
}

export function DuplicateManager({ participants, duplicates, onApply, onCancel }: DuplicateManagerProps) {
  const [action, setAction] = useState<'keep' | 'remove'>('keep');
  
  const duplicateGroups = duplicates.map(dupName => {
    const matches = participants.filter(p => p.name.toLowerCase() === dupName);
    return { name: dupName, matches };
  });

  const handleApply = () => {
    if (action === 'keep') {
      onApply(participants);
      return;
    }
    
    // Mantener solo la primera aparición de cada nombre
    const seenFirst = new Set<string>();
    const result = participants.filter(p => {
      const key = p.name.toLowerCase();
      if (seenFirst.has(key)) return false;
      seenFirst.add(key);
      return true;
    });
    
    onApply(result);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Nombres duplicados detectados
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Se encontraron {duplicates.length} nombre{duplicates.length > 1 ? 's' : ''} duplicado{duplicates.length > 1 ? 's' : ''}.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {duplicateGroups.map(group => (
            <div key={group.name} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-2 capitalize">
                "{group.name}" aparece {group.matches.length} veces
              </p>
              <div className="space-y-1">
                {group.matches.map((m, idx) => (
                  <div key={m.id} className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <span className="w-4">{idx + 1}.</span>
                    <span className="flex-1">{m.name}</span>
                    {m.sourceFile && <span className="text-yellow-600 dark:text-yellow-500">({m.sourceFile})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <input
              type="radio"
              checked={action === 'keep'}
              onChange={() => setAction('keep')}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Mantener todos</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contarlos como participantes distintos (recomendado si son personas diferentes)</p>
            </div>
          </label>
          
          <label className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <input
              type="radio"
              checked={action === 'remove'}
              onChange={() => setAction('remove')}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Eliminar duplicados</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mantener solo la primera aparición de cada nombre</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Aplicar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
