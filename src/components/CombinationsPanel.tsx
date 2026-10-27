import { useState } from 'react';
import { Shuffle, Copy } from 'lucide-react';
import type { Team, Algorithm, GenderConfig } from '../types';
import { generateMultipleCombinations } from '../utils/algorithms';
import type { Participant } from '../types';

interface CombinationsPanelProps {
  participants: Participant[];
  algorithm: Algorithm;
  groupCount: number;
  genderConfig?: GenderConfig;
  onSelectCombination: (teams: Team[]) => void;
}

export function CombinationsPanel({ participants, algorithm, groupCount, genderConfig, onSelectCombination }: CombinationsPanelProps) {
  const [combinations, setCombinations] = useState<Team[][]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [count, setCount] = useState(3);

  const handleGenerate = () => {
    const combos = generateMultipleCombinations(participants, algorithm, groupCount, count, genderConfig);
    setCombinations(combos);
    setActiveIndex(0);
  };

  if (participants.length === 0 || groupCount <= 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Combinaciones Rápidas
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="10"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 3)}
          className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Generar {count} combinaciones
        </button>
      </div>

      {algorithm !== 'random' && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          ℹ️ Las combinaciones tienen más sentido con el algoritmo Aleatorio
        </p>
      )}

      {combinations.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {combinations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeIndex === idx
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Combinación {idx + 1}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {combinations[activeIndex].map((team) => (
              <div key={team.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                  {team.name} ({team.members.length})
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                  {team.members.map(m => m.name).join(', ')}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectCombination(combinations[activeIndex])}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Usar esta combinación
          </button>
        </div>
      )}
    </div>
  );
}
