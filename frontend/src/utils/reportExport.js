import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (data, title, columns) => {
  const doc = new jsPDF();
  doc.text(title, 20, 10);
  doc.autoTable({
    head: [columns],
    body: data.map(item => columns.map(col => item[col])),
    startY: 20,
  });
  doc.save(`${title.toLowerCase()}_${new Date().getTime()}.pdf`);
};

export const exportToExcel = (data, title) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `${title.toLowerCase()}_${new Date().getTime()}.xlsx`);
};

// Add more export utilities...
