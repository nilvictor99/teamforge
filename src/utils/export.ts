import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Team, Algorithm } from '../types';

function getAlgorithmName(alg: Algorithm): string {
  switch (alg) {
    case 'random': return 'Aleatorio (Fisher-Yates)';
    case 'chronological': return 'Cronológico';
    case 'chronological-reverse': return 'Cronológico Inverso';
    case 'sequential': return 'Ordenado por lista';
    default: return 'Aleatorio';
  }
}

function getFilename(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
  return `teamforge-equipos-${timestamp}`;
}

export function exportToPDF(teams: Team[], algorithm: Algorithm) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(18);
  doc.text('TeamForge - Resultados del Sorteo', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 14, 30);
  doc.text(`Algoritmo: ${getAlgorithmName(algorithm)}`, 14, 36);
  doc.text(`Total participantes: ${teams.reduce((sum, t) => sum + t.members.length, 0)}`, 14, 42);
  
  const tableData: string[][] = [];
  teams.forEach(team => {
    team.members.forEach((member) => {
      tableData.push([team.name, member.name]);
    });
  });
  
  autoTable(doc, {
    startY: 50,
    head: [['Grupo', 'Participante']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${getFilename()}.pdf`);
}

export function exportToExcel(teams: Team[]) {
  const data: Array<{ Grupo: string; Participante: string }> = [];
  teams.forEach(team => {
    team.members.forEach(member => {
      data.push({ Grupo: team.name, Participante: member.name });
    });
  });
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${getFilename()}.xlsx`);
}
