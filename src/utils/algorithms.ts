import type { Participant, Team, Algorithm, GenderConfig } from '../types';
import { distributeBalanced, distributeSeparate } from './genderBalance';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateTeams(
  participants: Participant[],
  algorithm: Algorithm,
  groupCount: number,
  genderConfig?: GenderConfig
): Team[] {
  if (participants.length === 0 || groupCount <= 0) return [];
  if (participants.length < groupCount) return [];
  
  // Crear grupos vacíos
  let teams: Team[] = Array.from({ length: groupCount }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Grupo ${i + 1}`,
    members: []
  }));
  
  // Aplicar control por género si está habilitado
  if (genderConfig?.enabled && genderConfig.mode === 'balanced') {
    teams = distributeBalanced(teams, participants);
    return teams;
  }
  
  if (genderConfig?.enabled && genderConfig.mode === 'separate') {
    const femaleGroups = genderConfig.femaleGroups || 0;
    const maleGroups = genderConfig.maleGroups || 0;
    if (femaleGroups + maleGroups <= groupCount) {
      teams = distributeSeparate(teams, participants, femaleGroups, maleGroups);
      return teams;
    }
  }
  
  let ordered: Participant[] = [];
  
  if (algorithm === 'random') {
    ordered = shuffle(participants);
  } else if (algorithm === 'chronological') {
    ordered = [...participants].sort((a, b) => a.originalIndex - b.originalIndex);
  } else if (algorithm === 'chronological-reverse') {
    ordered = [...participants].sort((a, b) => b.originalIndex - a.originalIndex);
  } else if (algorithm === 'sequential') {
    ordered = [...participants].sort((a, b) => a.originalIndex - b.originalIndex);
  }
  
  // Distribución lineal por rondas (1->G1, 2->G2, 3->G3, 4->G1...)
  ordered.forEach((participant, idx) => {
    const teamIndex = idx % groupCount;
    teams[teamIndex].members.push(participant);
  });
  
  return teams;
}

export function generateMultipleCombinations(
  participants: Participant[],
  algorithm: Algorithm,
  groupCount: number,
  count: number = 3,
  genderConfig?: GenderConfig
): Team[][] {
  const combinations: Team[][] = [];
  for (let i = 0; i < count; i++) {
    combinations.push(generateTeams(participants, algorithm, groupCount, genderConfig));
  }
  return combinations;
}

export function calculateGroupCount(
  participantsCount: number,
  splitMode: 'groups' | 'perGroup',
  value: number
): { groupCount: number; membersPerGroup: number } {
  if (splitMode === 'groups') {
    const groupCount = Math.max(1, Math.floor(value));
    const membersPerGroup = Math.ceil(participantsCount / groupCount);
    return { groupCount, membersPerGroup };
  } else {
    const membersPerGroup = Math.max(1, Math.floor(value));
    const groupCount = Math.ceil(participantsCount / membersPerGroup);
    return { groupCount, membersPerGroup };
  }
}
