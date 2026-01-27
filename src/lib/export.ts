import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export const exportToExcel = async (data: ExportData, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(data.title);
  
  // Add headers
  worksheet.addRow(data.headers);
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D9488' } // Teal color
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Add data rows
  data.rows.forEach(row => {
    worksheet.addRow(row);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
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
