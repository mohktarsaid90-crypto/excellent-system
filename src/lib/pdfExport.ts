// Unified PDF Export System with Arabic RTL Support
// Uses browser-based print-to-PDF for proper Arabic text rendering

import { supabase } from '@/integrations/supabase/client';

export interface SummaryItem {
  label: string;
  value: string | number;
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  summaryItems?: SummaryItem[];
  tableData: ExportData;
  filename: string;
  language: string;
}

// Fetch company settings for PDF header
const fetchCompanySettings = async () => {
  try {
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
};

// Generate professional printable HTML document
const generateProfessionalPDF = (
  companyName: string,
  companyPhone: string | null,
  companyAddress: string | null,
  taxId: string | null,
  title: string,
  subtitle: string | null,
  summaryItems: SummaryItem[],
  tableData: ExportData,
  language: string
): string => {
  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const fontFamily = isArabic 
    ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Segoe UI', Tahoma, Arial, sans-serif";
  
  const now = new Date();
  const dateStr = now.toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Build summary cards HTML
  const summaryHTML = summaryItems.length > 0 ? `
    <div class="summary-grid">
      ${summaryItems.map(item => `
        <div class="summary-card">
          <div class="summary-label">${item.label}</div>
          <div class="summary-value">${item.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Build table HTML
  const headersHTML = tableData.headers.map(h => `<th>${h}</th>`).join('');
  const rowsHTML = tableData.rows.map(row => `
    <tr>
      ${row.map(cell => `<td>${cell}</td>`).join('')}
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
      padding: 20px 30px;
      color: #1a1a1a;
      background: white;
      line-height: 1.6;
      font-size: 12px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid #0d9488;
    }
    
    .company-info {
      text-align: ${isArabic ? 'right' : 'left'};
    }
    
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #0d9488;
      margin-bottom: 4px;
    }
    
    .company-details {
      font-size: 11px;
      color: #666;
      line-height: 1.5;
    }
    
    .document-info {
      text-align: ${isArabic ? 'left' : 'right'};
    }
    
    .document-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }
    
    .document-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .document-date {
      font-size: 11px;
      color: #94a3b8;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      text-align: ${isArabic ? 'right' : 'left'};
    }
    
    .summary-label {
      font-size: 10px;
      color: #64748b;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    
    th {
      background: #0d9488;
      color: white;
      font-weight: 600;
      padding: 10px 12px;
      text-align: ${isArabic ? 'right' : 'left'};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: ${isArabic ? 'right' : 'left'};
      font-size: 12px;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    tr:hover {
      background: #f1f5f9;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    
    .footer-left {
      text-align: ${isArabic ? 'right' : 'left'};
    }
    
    .footer-right {
      text-align: ${isArabic ? 'left' : 'right'};
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
        margin: 10mm;
        size: A4 landscape;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${companyName}</div>
      <div class="company-details">
        ${companyPhone ? `<div>${isArabic ? 'هاتف' : 'Phone'}: ${companyPhone}</div>` : ''}
        ${companyAddress ? `<div>${companyAddress}</div>` : ''}
        ${taxId ? `<div>${isArabic ? 'الرقم الضريبي' : 'Tax ID'}: ${taxId}</div>` : ''}
      </div>
    </div>
    <div class="document-info">
      <div class="document-title">${title}</div>
      ${subtitle ? `<div class="document-subtitle">${subtitle}</div>` : ''}
      <div class="document-date">${dateStr} - ${timeStr}</div>
    </div>
  </div>
  
  ${summaryHTML}
  
  <table>
    <thead>
      <tr>${headersHTML}</tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
  
  <div class="footer">
    <div class="footer-left">
      ${isArabic ? 'إجمالي السجلات' : 'Total Records'}: ${tableData.rows.length}
    </div>
    <div class="footer-right">
      ${isArabic ? 'تم إنشاء هذا التقرير بواسطة نظام مانو ERP' : 'Generated by Mano ERP System'}
    </div>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();
};

// Main export function - handles both Arabic and English with company branding
export const exportToPDFProfessional = async (options: ExportOptions) => {
  const { title, subtitle, summaryItems = [], tableData, language } = options;
  
  // Fetch company settings
  const company = await fetchCompanySettings();
  const companyName = company?.company_name || 'Mano ERP';
  const companyPhone = company?.phone || null;
  const companyAddress = company?.address || null;
  const taxId = company?.tax_id || null;
  
  const html = generateProfessionalPDF(
    companyName,
    companyPhone,
    companyAddress,
    taxId,
    title,
    subtitle || null,
    summaryItems,
    tableData,
    language
  );
  
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

// Convenience function for simple table exports (no summary cards)
export const exportTableToPDF = async (
  title: string,
  tableData: ExportData,
  filename: string,
  language: string
) => {
  await exportToPDFProfessional({
    title,
    tableData,
    filename,
    language,
    summaryItems: [],
  });
};

// Convenience function for report exports with summary cards
export const exportReportToPDF = async (
  title: string,
  summaryItems: SummaryItem[],
  tableData: ExportData,
  filename: string,
  language: string
) => {
  await exportToPDFProfessional({
    title,
    summaryItems,
    tableData,
    filename,
    language,
  });
};
