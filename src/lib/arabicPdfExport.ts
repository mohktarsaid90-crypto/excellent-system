import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

// Arabic text reversal helper for PDF rendering
// jsPDF doesn't support RTL natively, so we need to reverse Arabic text
function reverseArabicText(text: string): string {
  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(text)) {
    return text;
  }
  
  // Split by spaces and reverse each word, then join
  // This handles mixed content (numbers with Arabic)
  const parts = text.split(/(\s+)/);
  const reversed = parts.map(part => {
    if (arabicRegex.test(part)) {
      return part.split('').reverse().join('');
    }
    return part;
  }).reverse().join('');
  
  return reversed;
}

// Process data for Arabic PDF - reverses Arabic text in headers and rows
function processDataForArabic(data: ExportData, isArabic: boolean): ExportData {
  if (!isArabic) return data;
  
  return {
    title: reverseArabicText(data.title),
    headers: data.headers.map(h => reverseArabicText(String(h))),
    rows: data.rows.map(row => 
      row.map(cell => reverseArabicText(String(cell)))
    ),
  };
}

export const exportToPDFWithArabic = (data: ExportData, filename: string, language: string = 'en') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const isArabic = language === 'ar';
  const processedData = processDataForArabic(data, isArabic);

  // Set up the document
  doc.setFontSize(18);
  
  // Add title - for Arabic, align right
  if (isArabic) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(processedData.title, pageWidth - 14, 15, { align: 'right' });
  } else {
    doc.text(processedData.title, 14, 15);
  }

  // Add date
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  if (isArabic) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(reverseArabicText(dateStr), pageWidth - 14, 22, { align: 'right' });
  } else {
    doc.text(dateStr, 14, 22);
  }

  // Add table with styling
  autoTable(doc, {
    head: [processedData.headers],
    body: processedData.rows,
    startY: 28,
    styles: { 
      fontSize: 9,
      cellPadding: 3,
      halign: isArabic ? 'right' : 'left',
    },
    headStyles: { 
      fillColor: [13, 148, 136], // Teal color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: isArabic ? 'right' : 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: isArabic ? {} : undefined,
    tableWidth: 'auto',
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
};

// Summary card export
export interface SummaryItem {
  label: string;
  value: string | number;
}

export const exportSummaryToPDF = (
  title: string, 
  summaryItems: SummaryItem[], 
  tableData: ExportData, 
  filename: string, 
  language: string = 'en'
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const isArabic = language === 'ar';
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  const processedTitle = isArabic ? reverseArabicText(title) : title;
  if (isArabic) {
    doc.text(processedTitle, pageWidth - 14, 15, { align: 'right' });
  } else {
    doc.text(processedTitle, 14, 15);
  }

  // Date
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
  if (isArabic) {
    doc.text(reverseArabicText(dateStr), pageWidth - 14, 22, { align: 'right' });
  } else {
    doc.text(dateStr, 14, 22);
  }

  // Summary section
  doc.setFontSize(12);
  let yPos = 30;
  const colWidth = (pageWidth - 28) / 4;
  
  summaryItems.forEach((item, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = isArabic ? pageWidth - 14 - (col * colWidth) : 14 + (col * colWidth);
    const y = yPos + (row * 15);
    
    const labelText = isArabic ? reverseArabicText(item.label) : item.label;
    const valueText = isArabic ? reverseArabicText(String(item.value)) : String(item.value);
    
    doc.setTextColor(100);
    doc.text(labelText, x, y, { align: isArabic ? 'right' : 'left' });
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(valueText, x, y + 6, { align: isArabic ? 'right' : 'left' });
    doc.setFontSize(12);
  });

  // Data table
  const processedData = processDataForArabic(tableData, isArabic);
  const tableStartY = yPos + (Math.ceil(summaryItems.length / 4) * 15) + 10;

  autoTable(doc, {
    head: [processedData.headers],
    body: processedData.rows,
    startY: tableStartY,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      halign: isArabic ? 'right' : 'left',
    },
    headStyles: { 
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: isArabic ? 'right' : 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
};
