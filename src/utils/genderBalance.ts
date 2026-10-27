import type { Participant, Team } from '../types';

export function separateByGender(participants: Participant[]) {
  const males = participants.filter(p => p.gender === 'M');
  const females = participants.filter(p => p.gender === 'F');
  const unknown = participants.filter(p => !p.gender || p.gender === 'O');
  return { males, females, unknown };
}

export function distributeBalanced(teams: Team[], participants: Participant[]): Team[] {
  const { males, females, unknown } = separateByGender(participants);
  
  // Crear copias vacías
  const result: Team[] = teams.map(t => ({ ...t, members: [] }));
  
  // Distribuir equilibradamente intercalando
  const maxLen = Math.max(males.length, females.length);
  const order: Participant[] = [];
  
  for (let i = 0; i < maxLen; i++) {
    if (i < females.length) order.push(females[i]);
    if (i < males.length) order.push(males[i]);
  }
  order.push(...unknown);
  
  // Distribuir por rondas
  order.forEach((p, idx) => {
    result[idx % result.length].members.push(p);
  });
  
  return result;
}

export function distributeSeparate(
  teams: Team[], 
  participants: Participant[],
  femaleGroups: number,
  maleGroups: number
): Team[] {
  const { males, females, unknown } = separateByGender(participants);
  const result: Team[] = teams.map(t => ({ ...t, members: [] }));
  
  // Asignar grupos: primeros femaleGroups para mujeres, siguientes para hombres
  // Asignar mujeres
  females.forEach((p, idx) => {
    if (femaleGroups > 0) {
      const teamIdx = idx % femaleGroups;
      result[teamIdx].members.push(p);
    }
  });
  
  // Asignar hombres
  males.forEach((p, idx) => {
    if (maleGroups > 0) {
      const teamIdx = femaleGroups + (idx % maleGroups);
      if (teamIdx < result.length) {
        result[teamIdx].members.push(p);
      }
    }
  });
  
  // Distribuir desconocidos al resto
  unknown.forEach((p, idx) => {
    result[idx % result.length].members.push(p);
  });
  
  return result;
}
