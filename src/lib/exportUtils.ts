import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 22,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [44, 125, 160] },
  });
  doc.save(`${filename}.pdf`);
}
