
# Customer Classification & Arabic PDF Fix Plan

## Overview
This plan addresses three key requirements:
1. Add manual customer classification dropdown to Add/Edit Customer forms
2. Fix Arabic PDF rendering for proper character display
3. Ensure classification persists correctly in the database

---

## Part 1: Manual Customer Classification Dropdown

### Current State
- The database already has a `classification` column with enum type `customer_classification` supporting: `retail`, `key_retail`, `modern_trade`
- The `useCustomers.ts` hook supports the `classification` field in create/update operations
- The Customers page form does **not** include a classification dropdown

### Changes Required

**File: `src/pages/Customers.tsx`**
- Add `classification` field to the `formData` state (default: `'retail'`)
- Add a Select dropdown in both Create and Edit dialogs with options:
  - `retail` - "Retail" / "تجزئة"
  - `key_retail` - "Key Retail" / "تجزئة كبرى"  
  - `modern_trade` - "Modern Trade" / "هايبر ماركت/سلاسل"
- Update `handleCreateSubmit` and `handleEditSubmit` to include classification
- Update `openEditDialog` to pre-populate the classification from existing customer data
- Add a "Classification" column to the customers table with appropriate badge styling

**File: `src/hooks/useCustomers.ts`**
- Already supports classification - no changes needed

---

## Part 2: Arabic PDF Fix

### Current Problem
The current `arabicPdfExport.ts` uses a text-reversal workaround that produces broken/garbled Arabic characters because jsPDF doesn't natively support RTL text shaping.

### Solution: Browser Print-to-PDF Approach
Instead of using jsPDF directly for Arabic text, we'll use the browser's native rendering capabilities which handle Arabic correctly. This approach:
1. Creates a hidden print-friendly HTML element
2. Uses `window.print()` to trigger the browser's native PDF export
3. Leverages the browser's built-in Arabic text shaping and font support

### Changes Required

**File: `src/lib/arabicPdfExport.ts`** - Complete rewrite
- Create a new `exportToBrowserPDF()` function that:
  - Generates a styled HTML document with proper RTL support
  - Opens in a new window for printing
  - Uses CSS `@media print` rules for professional output
- Keep the existing `exportSummaryToPDF()` as a fallback for English
- Add proper print styles with page breaks, headers, and table formatting

**File: `src/pages/Reports.tsx`**
- Update `handleGeneratePDF` to use the new browser-based approach for Arabic
- Detect language and route to appropriate export method

---

## Part 3: Data Persistence Verification

### Current State
- RLS policies already restrict customer management to `it_admin` and `sales_manager` roles
- Classification is stored as a database enum, ensuring only valid values

### Verification
- The classification field is properly typed and will persist as long as proper roles are enforced
- No additional database changes needed - the schema already supports this

---

## Technical Implementation Details

### Customer Classification Dropdown Component

```text
┌─────────────────────────────────────────┐
│  Customer Category (تصنيف العميل)       │
├─────────────────────────────────────────┤
│  ▼ Select category...                   │
├─────────────────────────────────────────┤
│  • Retail (تجزئة)                       │
│  • Key Retail (تجزئة كبرى)              │
│  • Modern Trade (هايبر ماركت/سلاسل)     │
└─────────────────────────────────────────┘
```

### PDF Export Flow

```text
┌──────────────────┐     ┌─────────────────────┐
│  User clicks     │────▶│  Check language     │
│  "Download PDF"  │     │                     │
└──────────────────┘     └─────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
              ▼                                         ▼
    ┌─────────────────┐                    ┌─────────────────┐
    │  Arabic (ar)    │                    │  English (en)   │
    │                 │                    │                 │
    │  Browser Print  │                    │  jsPDF Direct   │
    │  (native RTL)   │                    │  (existing)     │
    └─────────────────┘                    └─────────────────┘
```

---

## Files to be Modified

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Customers.tsx` | Modify | Add classification dropdown to Create/Edit forms, add column to table |
| `src/lib/arabicPdfExport.ts` | Rewrite | New browser-based PDF export for Arabic support |
| `src/pages/Reports.tsx` | Modify | Update PDF export handler to use new method |

---

## Summary

This implementation will:
1. Give users full control over customer classification via a dropdown menu
2. Display the classification in the customers table with color-coded badges
3. Generate PDFs that render Arabic text correctly using the browser's native capabilities
4. Maintain data integrity through existing RLS policies
