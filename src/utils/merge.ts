import type { Participant } from '../types';

export function mergeParticipants(lists: Participant[][]): Participant[] {
  const merged: Participant[] = [];
  let globalIndex = 0;
  
  for (const list of lists) {
    for (const p of list) {
      merged.push({
        ...p,
        originalIndex: p.originalIndex !== undefined ? p.originalIndex : globalIndex++
      });
      if (p.originalIndex === undefined) globalIndex++;
    }
  }
  
  // Reindex if needed
  return merged.map((p, i) => ({ ...p, originalIndex: p.originalIndex ?? i }));
}

export function removeDuplicates(participants: Participant[], keepFirst: boolean = true): Participant[] {
  const seen = new Map<string, Participant>();
  for (const p of participants) {
    const key = p.name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, p);
    } else if (!keepFirst) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

export function filterByGender(participants: Participant[], filter: 'all' | 'M' | 'F'): Participant[] {
  if (filter === 'all') return participants;
  return participants.filter(p => p.gender === filter);
}

export function filterBySource(participants: Participant[], sources: string[]): Participant[] {
  if (sources.length === 0) return participants;
  return participants.filter(p => p.sourceFile && sources.includes(p.sourceFile));
}
