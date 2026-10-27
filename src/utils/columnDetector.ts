import type { Participant } from '../types';

export function detectGender(value: string): 'M' | 'F' | 'O' | null {
  if (!value) return null;
  const v = value.toString().trim().toLowerCase();
  if (['m', 'masculino', 'hombre', 'male', 'masc'].includes(v)) return 'M';
  if (['f', 'femenino', 'mujer', 'female', 'fem'].includes(v)) return 'F';
  if (['o', 'otro', 'other'].includes(v)) return 'O';
  // Single letter
  if (v === 'm') return 'M';
  if (v === 'f') return 'F';
  return null;
}

export function isGenderColumn(header: string): boolean {
  const h = header.toLowerCase();
  return ['sexo', 'genero', 'género', 'gender', 'sex', 'm/f'].some(k => h.includes(k));
}

export function isNameColumn(header: string): boolean {
  const h = header.toLowerCase();
  return ['nombre', 'name', 'alumno', 'participante', 'integrante', 'apellidos', 'persona', 'miembro'].some(k => h.includes(k));
}

export function shouldIgnoreColumn(header: string): boolean {
  const h = header.toLowerCase();
  return ['id', 'matricula', 'matrícula', 'codigo', 'código', 'n°', 'no.', 'estado', 'grupo', 'tel', 'telefono', 'teléfono', 'email', 'correo'].some(k => h.includes(k));
}

export function normalizeName(name: string): string {
  let n = name.trim().replace(/\s+/g, ' ');
  // Capitalizar
  n = n.split(' ').map(word => {
    if (word.length === 0) return word;
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  return n;
}

export function findDuplicates(participants: Participant[]): { hasDuplicates: boolean; duplicates: string[] } {
  const names = participants.map(p => p.name.toLowerCase());
  const duplicatesSet = new Set<string>();
  const seen = new Set<string>();
  names.forEach(n => {
    if (seen.has(n)) duplicatesSet.add(n);
    else seen.add(n);
  });
  return { hasDuplicates: duplicatesSet.size > 0, duplicates: Array.from(duplicatesSet) };
}
