import * as XLSX from 'xlsx';
import type { Participant, ParseResult } from '../types';

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function isHeaderRow(row: string[]): boolean {
  if (row.length === 0) return false;
  const headerKeywords = ['nombre', 'name', 'alumno', 'participante', 'integrante', 'persona', 'miembro', 'equipo'];
  const firstCell = normalizeName(row[0]).toLowerCase();
  if (headerKeywords.some(k => firstCell.includes(k))) return true;
  // If all cells are short strings and look like headers
  const allShort = row.every(c => normalizeName(c).length < 30);
  if (allShort && row.length > 1) {
    const hasNumbers = row.some(c => /\d/.test(c));
    if (!hasNumbers) return true;
  }
  return false;
}

export function parseTextInput(text: string): ParseResult {
  if (!text.trim()) {
    return { participants: [], hasDuplicates: false, duplicates: [], needsColumnSelection: false };
  }
  
  // Split by commas, semicolons, newlines, tabs
  const items = text.split(/[\n\r,;\t]+/).map(normalizeName).filter(n => n.length > 0);
  
  const participants: Participant[] = items.map((name, idx) => ({
    id: crypto.randomUUID(),
    name,
    originalIndex: idx
  }));
  
  const names = participants.map(p => p.name.toLowerCase());
  const duplicatesSet = new Set<string>();
  const seen = new Set<string>();
  names.forEach(n => {
    if (seen.has(n)) duplicatesSet.add(n);
    else seen.add(n);
  });
  
  return {
    participants,
    hasDuplicates: duplicatesSet.size > 0,
    duplicates: Array.from(duplicatesSet),
    needsColumnSelection: false
  };
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        // Use only first sheet as per decision
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('El archivo no contiene hojas válidas'));
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        if (jsonData.length === 0) {
          resolve({ participants: [], hasDuplicates: false, duplicates: [], needsColumnSelection: false });
          return;
        }
        
        // Check if first row is header
        const firstRow = jsonData[0].map(c => String(c || ''));
        let startIndex = 0;
        if (isHeaderRow(firstRow)) {
          startIndex = 1;
        }
        
        // Find columns with data
        const colData: string[][] = [];
        const maxCols = Math.max(...jsonData.slice(startIndex).map(r => r.length));
        for (let c = 0; c < maxCols; c++) {
          const col: string[] = [];
          for (let r = startIndex; r < jsonData.length; r++) {
            const cell = jsonData[r][c];
            if (cell !== undefined && cell !== null && String(cell).trim()) {
              col.push(normalizeName(String(cell)));
            }
          }
          if (col.length > 0) colData.push(col);
        }
        
        if (colData.length === 0) {
          resolve({ participants: [], hasDuplicates: false, duplicates: [], needsColumnSelection: false });
          return;
        }
        
        if (colData.length > 1) {
          // Need to ask user - return with available columns info
          // For now, we'll need to handle this in component
          // Use first column as default but flag for selection
          const participants: Participant[] = colData[0].map((name, idx) => ({
            id: crypto.randomUUID(),
            name,
            originalIndex: idx
          }));
          const names = participants.map(p => p.name.toLowerCase());
          const duplicatesSet = new Set<string>();
          const seen = new Set<string>();
          names.forEach(n => {
            if (seen.has(n)) duplicatesSet.add(n);
            else seen.add(n);
          });
          resolve({
            participants,
            hasDuplicates: duplicatesSet.size > 0,
            duplicates: Array.from(duplicatesSet),
            needsColumnSelection: true,
            availableColumns: colData.map((_, i) => `Columna ${i + 1}`),
            rawData: jsonData
          });
          return;
        }
        
        const participants: Participant[] = colData[0].map((name, idx) => ({
          id: crypto.randomUUID(),
          name,
          originalIndex: idx
        }));
        
        const names = participants.map(p => p.name.toLowerCase());
        const duplicatesSet = new Set<string>();
        const seen = new Set<string>();
        names.forEach(n => {
          if (seen.has(n)) duplicatesSet.add(n);
          else seen.add(n);
        });
        
        resolve({
          participants,
          hasDuplicates: duplicatesSet.size > 0,
          duplicates: Array.from(duplicatesSet),
          needsColumnSelection: false
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export function extractFromColumn(jsonData: unknown[][], columnIndex: number): Participant[] {
  if (jsonData.length === 0) return [];
  const firstRow = jsonData[0].map(c => String(c || ''));
  let startIndex = 0;
  if (isHeaderRow(firstRow)) startIndex = 1;
  
  const participants: Participant[] = [];
  for (let r = startIndex; r < jsonData.length; r++) {
    const cell = jsonData[r][columnIndex];
    if (cell !== undefined && cell !== null && String(cell).trim()) {
      participants.push({
        id: crypto.randomUUID(),
        name: normalizeName(String(cell)),
        originalIndex: participants.length
      });
    }
  }
  return participants;
}
