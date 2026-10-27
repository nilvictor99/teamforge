import { Users, Shuffle, ArrowDown, ArrowUp, ListOrdered, UsersRound } from 'lucide-react';
import type { Algorithm, SplitMode, GenderConfig } from '../types';
import { cn } from '../utils/cn';
import { useState } from 'react';

interface ConfigPanelProps {
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  groupCount: number;
  onGroupCountChange: (count: number) => void;
  membersPerGroup: number;
  onMembersPerGroupChange: (count: number) => void;
  algorithm: Algorithm;
  onAlgorithmChange: (alg: Algorithm) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  participantCount: number;
  hasGender: boolean;
  genderConfig: GenderConfig;
  onGenderConfigChange: (config: GenderConfig) => void;
}

export function ConfigPanel({
  splitMode,
  onSplitModeChange,
  groupCount,
  onGroupCountChange,
  membersPerGroup,
  onMembersPerGroupChange,
  algorithm,
  onAlgorithmChange,
  onGenerate,
  canGenerate,
  participantCount,
  hasGender,
  genderConfig,
  onGenderConfigChange
}: ConfigPanelProps) {
  const [showGender, setShowGender] = useState(false);
  
  const algorithms = [
    { id: 'random' as Algorithm, name: 'Aleatorio', icon: Shuffle, desc: 'Barajado Fisher-Yates' },
    { id: 'sequential' as Algorithm, name: 'Ordenado por lista', icon: ListOrdered, desc: '1→G1, 2→G2, 3→G3...' },
    { id: 'chronological' as Algorithm, name: 'Cronológico', icon: ArrowDown, desc: 'Orden de llegada' },
    { id: 'chronological-reverse' as Algorithm, name: 'Cronológico Inverso', icon: ArrowUp, desc: 'Desde el último al primero' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Configuración del Sorteo</h2>
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo de división</label>
        <div className="flex gap-2">
          <button
            onClick={() => onSplitModeChange('groups')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg border transition-colors",
              splitMode === 'groups'
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            Cantidad de grupos
          </button>
          <button
            onClick={() => onSplitModeChange('perGroup')}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg border transition-colors",
              splitMode === 'perGroup'
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            Integrantes por grupo
          </button>
        </div>
        
        <div>
          {splitMode === 'groups' ? (
            <input
              type="number"
              min="1"
              value={groupCount}
              onChange={(e) => onGroupCountChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Número de grupos"
            />
          ) : (
            <input
              type="number"
              min="1"
              value={membersPerGroup}
              onChange={(e) => onMembersPerGroupChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Integrantes por grupo"
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algoritmo</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {algorithms.map((alg) => {
            const Icon = alg.icon;
            return (
              <button
                key={alg.id}
                onClick={() => onAlgorithmChange(alg.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  algorithm === alg.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", algorithm === alg.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500")} />
                  <span className={cn("font-medium text-sm", algorithm === alg.id ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white")}>
                    {alg.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{alg.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {hasGender && (
        <div className="space-y-3">
          <button
            onClick={() => setShowGender(!showGender)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <UsersRound className="h-4 w-4" />
            Control por género
            <span className="text-xs text-green-600 dark:text-green-400">({hasGender ? 'Detectado' : ''})</span>
          </button>
          
          {showGender && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={genderConfig.enabled}
                  onChange={(e) => onGenderConfigChange({ ...genderConfig, enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar control por género</span>
              </label>
              
              {genderConfig.enabled && (
                <div className="space-y-3">
                  <select
                    value={genderConfig.mode}
                    onChange={(e) => onGenderConfigChange({ ...genderConfig, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="balanced">Mixto equilibrado</option>
                    <option value="separate">Grupos por género</option>
                  </select>
                  
                  {genderConfig.mode === 'separate' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Grupos solo mujeres</label>
                        <input
                          type="number"
                          min="0"
                          value={genderConfig.femaleGroups || 0}
                          onChange={(e) => onGenderConfigChange({ ...genderConfig, femaleGroups: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Grupos solo hombres</label>
                        <input
                          type="number"
                          min="0"
                          value={genderConfig.maleGroups || 0}
                          onChange={(e) => onGenderConfigChange({ ...genderConfig, maleGroups: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!canGenerate && participantCount > 0 && participantCount < groupCount && splitMode === 'groups' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ Hay menos participantes ({participantCount}) que grupos solicitados ({groupCount}). Se requiere al menos 1 participante por grupo.
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={cn(
          "w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2",
          canGenerate
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        )}
      >
        <Users className="h-5 w-5" />
        🚀 Generar Equipos
      </button>
    </div>
  );
}
