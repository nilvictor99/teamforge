import { FileDown, FileSpreadsheet, RefreshCw } from 'lucide-react';
import type { Team, Algorithm } from '../types';
import { exportToPDF, exportToExcel } from '../utils/export';

interface ResultsPanelProps {
  teams: Team[];
  algorithm: Algorithm;
  onNewDraw: () => void;
}

export function ResultsPanel({ teams, algorithm, onNewDraw }: ResultsPanelProps) {
  
  const sizes = teams.map(t => t.members.length);
  const isBalanced = sizes.length > 0 && Math.max(...sizes) - Math.min(...sizes) <= 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Resultados</h2>
        <button
          onClick={onNewDraw}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Nuevo Sorteo
        </button>
      </div>

      {!isBalanced && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          ℹ️ Grupos equilibrados al máximo posible
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => {
          const colors = [
            'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
            'border-green-500 bg-green-50 dark:bg-green-900/20',
            'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
            'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
            'border-pink-500 bg-pink-50 dark:bg-pink-900/20',
            'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
          ];
          return (
            <div key={team.id} className={`border-l-4 rounded-lg p-4 ${colors[idx % colors.length]}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                {team.name}
                <span className="text-sm text-gray-500 dark:text-gray-400">{team.members.length} integrantes</span>
              </h3>
              <ul className="space-y-1">
                {team.members.map((member) => (
                  <li key={member.id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                    {member.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => exportToPDF(teams, algorithm)}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
        >
          <FileDown className="h-4 w-4" />
          Descargar PDF
        </button>
        <button
          onClick={() => exportToExcel(teams)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Descargar Excel
        </button>
      </div>
    </div>
  );
}
