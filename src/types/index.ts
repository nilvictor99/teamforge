export interface Participant {
  id: string;
  name: string;
  originalIndex: number;
  gender?: 'M' | 'F' | 'O' | null;
  sourceFile?: string;
  meta?: Record<string, string>;
}

export type Algorithm = 'random' | 'chronological' | 'chronological-reverse' | 'sequential';

export type GenderControl = 'none' | 'balanced' | 'separate'; 

export interface GenderConfig {
  enabled: boolean;
  mode: GenderControl;
  mixedGroups?: number;
  femaleGroups?: number;
  maleGroups?: number;
}

export type SplitMode = 'groups' | 'perGroup';

export interface TeamConfig {
  splitMode: SplitMode;
  groupCount: number;
  membersPerGroup: number;
  algorithm: Algorithm;
}

export interface Team {
  id: string;
  name: string;
  members: Participant[];
}

export interface ParseResult {
  participants: Participant[];
  hasDuplicates: boolean;
  duplicates: string[];
  needsColumnSelection: boolean;
  availableColumns?: string[];
  rawData?: unknown[][];
}

export interface SourceFile {
  id: string;
  name: string;
  count: number;
  type: 'file' | 'text';
}

export interface MappedColumn {
  index: number;
  header: string;
  useAs: 'name' | 'gender' | 'ignore' | 'meta';
}
