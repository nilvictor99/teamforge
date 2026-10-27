import { useState } from 'react';
import { Search, Filter, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Participant } from '../types';
import { normalizeName } from '../utils/columnDetector';

interface DataInspectorProps {
  participants: Participant[];
  sources: string[];
  onUpdate: (participants: Participant[]) => void;
  onRestore: () => void;
}

export function DataInspector({ participants, sources, onUpdate, onRestore }: DataInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F' | 'unknown'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = participants.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (genderFilter === 'M' && p.gender !== 'M') return false;
    if (genderFilter === 'F' && p.gender !== 'F') return false;
    if (genderFilter === 'unknown' && p.gender) return false;
    if (sourceFilter !== 'all' && p.sourceFile !== sourceFilter) return false;
    return true;
  });

  const handleNormalize = () => {
    const normalized = participants.map(p => ({ ...p, name: normalizeName(p.name) }));
    onUpdate(normalized);
  };

  const handleRemoveSelected = () => {
    const updated = participants.filter(p => !selected.has(p.id));
    onUpdate(updated);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  if (participants.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Inspector de Datos ({participants.length})
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={handleNormalize} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              Normalizar mayúsculas/minúsculas
            </button>
            {sources.length > 1 && (
              <button onClick={onRestore} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Restaurar lista unida
              </button>
            )}
            {selected.size > 0 && (
              <button onClick={handleRemoveSelected} className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1">
                <Trash2 className="h-3 w-3" />
                Eliminar seleccionados ({selected.size})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los géneros</option>
              <option value="M">Solo Masculino</option>
              <option value="F">Solo Femenino</option>
              <option value="unknown">Sin género</option>
            </select>
            {sources.length > 1 && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los archivos</option>
                {sources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="p-2 text-left"></th>
                  <th className="p-2 text-left text-gray-900 dark:text-white">Nombre</th>
                  <th className="p-2 text-left text-gray-900 dark:text-white">Género</th>
                  <th className="p-2 text-left text-gray-900 dark:text-white">Origen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2 text-gray-900 dark:text-white">{p.name}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{p.gender || '-'}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400 text-xs truncate max-w-[100px]">{p.sourceFile || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mostrando {filtered.length} de {participants.length}
          </p>
        </div>
      )}
    </div>
  );
}
