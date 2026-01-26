import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export const exportToExcel = (data: ExportData, filename: string) => {
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.title);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (data: ExportData, filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(data.title, 14, 20);
  
  // Add table
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: 30,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 148, 136] }, // Teal color
  });
  
  doc.save(`${filename}.pdf`);
};

export const formatCurrency = (amount: number, currency: string = 'SAR') => {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string, locale: string = 'en') => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string, locale: string = 'en') => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
