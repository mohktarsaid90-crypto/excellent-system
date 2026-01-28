// Browser-based PDF export with native Arabic support
// Uses the browser's print functionality to ensure proper RTL text rendering

// HTML escape utility to prevent XSS in PDF templates
const escapeHtml = (unsafe: string | number): string => {
  const str = String(unsafe);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export interface SummaryItem {
  label: string;
  value: string | number;
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

// Generate a printable HTML document and trigger browser print
const generatePrintableHTML = (
  title: string,
  summaryItems: SummaryItem[],
  tableData: ExportData,
  language: string
): string => {
  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const fontFamily = isArabic 
    ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Segoe UI', Tahoma, Arial, sans-serif";
  
  const dateStr = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build summary cards HTML - escape all dynamic content to prevent XSS
  const summaryHTML = summaryItems.map(item => `
    <div class="summary-card">
      <div class="summary-label">${escapeHtml(item.label)}</div>
      <div class="summary-value">${escapeHtml(item.value)}</div>
    </div>
  `).join('');

  // Build table HTML - escape all dynamic content to prevent XSS
  const headersHTML = tableData.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const rowsHTML = tableData.rows.map(row => `
    <tr>
      ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}
    </tr>
  `).join('');

  // Escape document metadata
  const safeTitle = escapeHtml(title);
  const safeLanguage = escapeHtml(language);

  return `
<!DOCTYPE html>
<html lang="${safeLanguage}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${fontFamily};
      direction: ${dir};
      padding: 20px;
      color: #1a1a1a;
      background: white;
      line-height: 1.6;
    }
    
    .header {
      text-align: ${isArabic ? 'right' : 'left'};
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #0d9488;
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #0d9488;
      margin-bottom: 8px;
    }
    
    .date {
      font-size: 14px;
      color: #666;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: ${isArabic ? 'right' : 'left'};
    }
    
    .summary-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    th {
      background: #0d9488;
      color: white;
      font-weight: 600;
      padding: 12px 16px;
      text-align: ${isArabic ? 'right' : 'left'};
      font-size: 12px;
      text-transform: uppercase;
    }
    
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      text-align: ${isArabic ? 'right' : 'left'};
      font-size: 14px;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    tr:hover {
      background: #f1f5f9;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .summary-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .summary-card {
        break-inside: avoid;
      }
      
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      @page {
        margin: 15mm;
        size: A4 landscape;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${safeTitle}</div>
    <div class="date">${escapeHtml(dateStr)}</div>
  </div>
  
  ${summaryItems.length > 0 ? `
    <div class="summary-grid">
      ${summaryHTML}
    </div>
  ` : ''}
  
  <table>
    <thead>
      <tr>${headersHTML}</tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
  
  <div class="footer">
    ${isArabic ? 'تم إنشاء هذا التقرير بواسطة نظام مانو للمبيعات' : 'Generated by Mano Sales System'}
  </div>
  
  <script>
    // Auto-print when the page loads
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();
};

// Export to PDF using browser's native print dialog
export const exportToBrowserPDF = (
  title: string,
  summaryItems: SummaryItem[],
  tableData: ExportData,
  filename: string,
  language: string = 'en'
) => {
  const html = generatePrintableHTML(title, summaryItems, tableData, language);
  
  // Open a new window with the printable content
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback: create a blob and open it
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

// Convenience wrapper for summary reports
export const exportSummaryToPDF = (
  title: string, 
  summaryItems: SummaryItem[], 
  tableData: ExportData, 
  filename: string, 
  language: string = 'en'
) => {
  exportToBrowserPDF(title, summaryItems, tableData, filename, language);
};

// Simple table export (no summary cards)
export const exportToPDFWithArabic = (data: ExportData, filename: string, language: string = 'en') => {
  exportToBrowserPDF(data.title, [], data, filename, language);
};
