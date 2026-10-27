import { useState } from 'react';
import { MultiFileUpload } from './components/MultiFileUpload';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { ColumnMapper } from './components/ColumnMapper';
import { DataInspector } from './components/DataInspector';
import { CombinationsPanel } from './components/CombinationsPanel';
import { DuplicateManager } from './components/DuplicateManager';
import { parseTextInput, parseExcelFile } from './utils/parser';
import { generateTeams, calculateGroupCount } from './utils/algorithms';
import { mergeParticipants } from './utils/merge';
import { detectGender, findDuplicates } from './utils/columnDetector';
import type { Participant, Algorithm, SplitMode, Team, SourceFile, MappedColumn, GenderConfig } from './types';
import { Users, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [originalParticipants, setOriginalParticipants] = useState<Participant[]>([]);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('groups');
  const [groupCount, setGroupCount] = useState(3);
  const [membersPerGroup, setMembersPerGroup] = useState(3);
  const [algorithm, setAlgorithm] = useState<Algorithm>('sequential');
  const [teams, setTeams] = useState<Team[]>([]);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [showMapper, setShowMapper] = useState(false);
  const [mapperData, setMapperData] = useState<{ headers: string[]; preview: string[][]; fileName: string; rawData: unknown[][] } | null>(null);
  const [genderConfig, setGenderConfig] = useState<GenderConfig>({ enabled: false, mode: 'balanced' });
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);

  const hasGender = participants.some(p => p.gender);

  const handleFilesSelect = async (files: File[]) => {
    const allNewParticipants: Participant[] = [];
    const newSources: SourceFile[] = [];
    let baseIndex = participants.length;
    
    for (const file of files) {
      try {
        if (file.name.endsWith('.txt')) {
          const text = await file.text();
          const result = parseTextInput(text);
          const withSource = result.participants.map((p, i) => ({ ...p, sourceFile: file.name, originalIndex: baseIndex + i }));
          baseIndex += withSource.length;
          allNewParticipants.push(...withSource);
          newSources.push({ id: crypto.randomUUID(), name: file.name, count: withSource.length, type: 'file' });
        } else {
          const reader = new FileReader();
          const data = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsBinaryString(file);
          });
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length === 0) continue;
          
          const headers = (jsonData[0] as any[]).map(h => String(h || ''));
          const colCount = headers.filter(h => h.trim()).length || jsonData[0].length;
          
          if (colCount > 1) {
            setMapperData({ headers, preview: jsonData.slice(0, 4).map(r => r.map(c => String(c || ''))), fileName: file.name, rawData: jsonData });
            setShowMapper(true);
            continue;
          }
          
          const result = await parseExcelFile(file);
          const withSource = result.participants.map((p, i) => ({ ...p, sourceFile: file.name, originalIndex: baseIndex + i }));
          baseIndex += withSource.length;
          allNewParticipants.push(...withSource);
          newSources.push({ id: crypto.randomUUID(), name: file.name, count: withSource.length, type: 'file' });
        }
      } catch (error) {
        console.error(error);
      }
    }
    
    if (allNewParticipants.length > 0) {
      const merged = mergeParticipants([participants, allNewParticipants]);
      setParticipants(merged);
      setOriginalParticipants(merged);
      const dup = findDuplicates(merged);
      setHasDuplicates(dup.hasDuplicates);
      setDuplicates(dup.duplicates);
      setSources([...sources, ...newSources]);
      setTeams([]);
    }
  };

  const handleMapperApply = (mappings: MappedColumn[]) => {
    if (!mapperData) return;
    const { rawData, fileName } = mapperData;
    const nameCol = mappings.find(m => m.useAs === 'name');
    const genderCol = mappings.find(m => m.useAs === 'gender');
    
    if (!nameCol) {
      setShowMapper(false);
      return;
    }
    
    const extracted: Participant[] = [];
    let idx = participants.length;
    for (let r = 1; r < rawData.length; r++) {
      const nameVal = String(rawData[r][nameCol.index] || '').trim();
      if (!nameVal) continue;
      let gender: 'M' | 'F' | 'O' | null = null;
      if (genderCol) {
        gender = detectGender(String(rawData[r][genderCol.index] || ''));
      }
      extracted.push({
        id: crypto.randomUUID(),
        name: nameVal,
        originalIndex: idx++,
        gender,
        sourceFile: fileName,
        meta: {}
      });
    }
    
    const merged = mergeParticipants([participants, extracted]);
    setParticipants(merged);
    setOriginalParticipants(merged);
    const dup = findDuplicates(merged);
    setHasDuplicates(dup.hasDuplicates);
    setDuplicates(dup.duplicates);
    setSources([...sources, { id: crypto.randomUUID(), name: fileName, count: extracted.length, type: 'file' }]);
    setShowMapper(false);
    setTeams([]);
  };

  const handleTextPaste = (text: string) => {
    if (!text.trim()) return;
    const result = parseTextInput(text);
    const withSource = result.participants.map((p, i) => ({ ...p, sourceFile: 'Texto pegado', originalIndex: participants.length + i }));
    const merged = mergeParticipants([participants, withSource]);
    setParticipants(merged);
    setOriginalParticipants(merged);
    const dup = findDuplicates(merged);
    setHasDuplicates(dup.hasDuplicates);
    setDuplicates(dup.duplicates);
    if (!sources.find(s => s.name === 'Texto pegado')) {
      setSources([...sources, { id: crypto.randomUUID(), name: 'Texto pegado', count: withSource.length, type: 'text' }]);
    }
    setTeams([]);
  };

  const handleClear = () => {
    setParticipants([]);
    setOriginalParticipants([]);
    setHasDuplicates(false);
    setDuplicates([]);
    setTeams([]);
    setSources([]);
  };

  const handleRestore = () => {
    setParticipants(originalParticipants);
    const dup = findDuplicates(originalParticipants);
    setHasDuplicates(dup.hasDuplicates);
    setDuplicates(dup.duplicates);
  };

  const handleSplitModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
    if (mode === 'groups') {
      const calc = calculateGroupCount(participants.length, 'groups', groupCount);
      setMembersPerGroup(calc.membersPerGroup);
    } else {
      const calc = calculateGroupCount(participants.length, 'perGroup', membersPerGroup);
      setGroupCount(calc.groupCount);
    }
  };

  const handleGroupCountChange = (count: number) => {
    setGroupCount(count);
    if (splitMode === 'groups') {
      const calc = calculateGroupCount(participants.length, 'groups', count);
      setMembersPerGroup(calc.membersPerGroup);
    }
  };

  const handleMembersPerGroupChange = (count: number) => {
    setMembersPerGroup(count);
    if (splitMode === 'perGroup') {
      const calc = calculateGroupCount(participants.length, 'perGroup', count);
      setGroupCount(calc.groupCount);
    }
  };

  const handleGenerate = () => {
    const calc = splitMode === 'groups' 
      ? calculateGroupCount(participants.length, 'groups', groupCount)
      : calculateGroupCount(participants.length, 'perGroup', membersPerGroup);
    const generatedTeams = generateTeams(participants, algorithm, calc.groupCount, genderConfig);
    setTeams(generatedTeams);
  };

  const { groupCount: calcGroupCount } = splitMode === 'groups'
    ? calculateGroupCount(participants.length, 'groups', groupCount)
    : calculateGroupCount(participants.length, 'perGroup', membersPerGroup);

  const canGenerate = participants.length > 0 && participants.length >= calcGroupCount && calcGroupCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TeamForge</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gestor web de equipos - Múltiples archivos • Género • Combinaciones
          </p>
        </header>

        {hasDuplicates && duplicates.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Se detectaron nombres duplicados: {duplicates.slice(0, 5).join(', ')}
              {duplicates.length > 5 && ` y ${duplicates.length - 5} más.`}
            </p>
            <button
              onClick={() => setShowDuplicateManager(true)}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Gestionar duplicados
            </button>
          </div>
        )}

        <MultiFileUpload
          sources={sources}
          onFilesSelect={handleFilesSelect}
          onTextPaste={handleTextPaste}
          onClear={handleClear}
          participantCount={participants.length}
          hasData={participants.length > 0}
        />

        {participants.length > 0 && (
          <>
            <DataInspector
              participants={participants}
              sources={sources.map(s => s.name)}
              onUpdate={setParticipants}
              onRestore={handleRestore}
            />

            <ConfigPanel
              splitMode={splitMode}
              onSplitModeChange={handleSplitModeChange}
              groupCount={groupCount}
              onGroupCountChange={handleGroupCountChange}
              membersPerGroup={membersPerGroup}
              onMembersPerGroupChange={handleMembersPerGroupChange}
              algorithm={algorithm}
              onAlgorithmChange={setAlgorithm}
              onGenerate={handleGenerate}
              canGenerate={canGenerate}
              participantCount={participants.length}
              hasGender={hasGender}
              genderConfig={genderConfig}
              onGenderConfigChange={setGenderConfig}
            />

            <CombinationsPanel
              participants={participants}
              algorithm={algorithm}
              groupCount={calcGroupCount}
              genderConfig={genderConfig}
              onSelectCombination={(combos) => setTeams(combos)}
            />

            {teams.length > 0 && (
              <ResultsPanel
                teams={teams}
                algorithm={algorithm}
                onNewDraw={handleGenerate}
              />
            )}
          </>
        )}
      </div>

      {showMapper && mapperData && (
        <ColumnMapper
          headers={mapperData.headers}
          previewData={mapperData.preview}
          onApply={handleMapperApply}
          onCancel={() => setShowMapper(false)}
        />
      )}

      {showDuplicateManager && (
        <DuplicateManager
          participants={participants}
          duplicates={duplicates}
          onApply={(updated) => {
            setParticipants(updated);
            setOriginalParticipants(updated);
            const dup = findDuplicates(updated);
            setHasDuplicates(dup.hasDuplicates);
            setDuplicates(dup.duplicates);
            setShowDuplicateManager(false);
            setTeams([]);
          }}
          onCancel={() => setShowDuplicateManager(false)}
        />
      )}
    </div>
  );
}

export default App;
