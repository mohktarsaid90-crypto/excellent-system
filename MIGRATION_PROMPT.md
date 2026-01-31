# Mano ERP - Complete System Migration Prompt

## Project Identity
**Name:** Mano ERP  
**Purpose:** Dedicated ERP for Mano Distribution Company  
**Primary Language:** Arabic (RTL) with English support  
**Currency:** Egyptian Pounds (EGP / ج.م)

---

## 1. DESIGN SYSTEM (CRITICAL - Implement First)

### Theme: Modern Dark Premium SaaS (InkFlow Inspired)

**Color Palette (HSL Values):**
```css
/* Core Backgrounds */
--background: 0 0% 4%;           /* Deep black #0b0b0b */
--foreground: 0 0% 100%;         /* Pure white */

/* Card Surfaces - Dark Glassmorphism */
--card: 0 0% 7%;
--card-foreground: 0 0% 100%;

/* Popover/Dropdown */
--popover: 0 0% 8%;
--popover-foreground: 0 0% 100%;

/* Primary - Vibrant Orange #ff6b00 */
--primary: 25 100% 50%;
--primary-foreground: 0 0% 100%;

/* Secondary */
--secondary: 0 0% 12%;
--secondary-foreground: 0 0% 100%;

/* Muted - Grey for subtext #888888 */
--muted: 0 0% 15%;
--muted-foreground: 0 0% 53%;

/* Accent - Same Orange */
--accent: 25 100% 50%;
--accent-foreground: 0 0% 100%;

/* Status Colors */
--destructive: 0 72% 50%;
--success: 152 69% 40%;
--warning: 38 92% 50%;
--info: 199 89% 48%;

/* Borders - Subtle dark #1A1A1A */
--border: 0 0% 10%;
--input: 0 0% 12%;
--ring: 25 100% 50%;

/* Sidebar - Solid black */
--sidebar-background: 0 0% 3%;
--sidebar-foreground: 0 0% 100%;
--sidebar-primary: 25 100% 50%;
```

**Typography:**
- Font: Inter (primary), JetBrains Mono (code)
- Headings: Pure white (#FFFFFF)
- Secondary text: Muted grey (#888888)

**Special Effects:**
- Cards: Dark glassmorphism with subtle borders, orange glow on hover
- Buttons: Orange glow effect (--shadow-glow)
- Active sidebar: Vertical 3px orange line indicator
- Border radius: 0.75rem

---

## 2. AUTHENTICATION SYSTEM

### Dual Auth Architecture
The system has TWO separate authentication flows:

**A. Admin Panel Auth (AuthContext)**
- Roles: `company_owner`, `it_admin`, `sales_manager`, `accountant`
- Uses `user_roles` table to store role assignments
- Login redirects to `/` (Dashboard)
- Protected routes check role permissions

**B. Agent Mobile Auth (AgentAuthContext)**
- For field sales agents only
- Uses `agents` table with `auth_user_id` foreign key
- Tracks: `is_online`, `last_seen_at`, GPS coordinates
- Login redirects to `/agent` (Agent Dashboard)
- Updates `is_online = true` on login, `false` on logout

### Role Permissions Matrix

| Route/Feature | Company Owner | IT Admin | Sales Manager | Accountant |
|--------------|---------------|----------|---------------|------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Inventory | ✓ | ✓ | ✓ | ✓ |
| Products | ✓ | ✓ | ✓ | ✓ |
| Sales | ✓ | ✓ | ✓ | ✓ |
| Customers | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ |
| Agents | - | ✓ | ✓ | - |
| Load Management | - | ✓ | ✓ | - |
| Live Map | - | ✓ | ✓ | - |
| Journey Plans | - | ✓ | ✓ | - |
| Reconciliation | - | ✓ | - | ✓ |
| Invoices | - | ✓ | - | ✓ |
| Settings | ✓ | ✓ | - | - |
| Users | ✓ | ✓ | - | - |

---

## 3. DATABASE SCHEMA (Supabase)

### Core Tables

**agents**
```sql
id, auth_user_id, name, email, phone, 
monthly_target, current_sales,
cartons_target, tons_target,
can_give_discounts, can_add_clients, can_process_returns,
max_discount_percent (default 10),
is_active, is_online,
last_location_lat, last_location_lng, last_seen_at,
credit_balance, created_at, updated_at
```

**customers**
```sql
id, name, email, phone, address, city,
classification ENUM('retail', 'key_retail', 'modern_trade'),
assigned_agent_id (FK agents),
location_lat, location_lng,
credit_limit, current_balance,
created_at, updated_at
```

**products**
```sql
id, sku, name_en, name_ar, category,
unit_price, carton_price, cost_price,
pieces_per_carton, stock_quantity, min_stock_level,
vat_rate (default 15%), is_active,
created_at, updated_at
```

**invoices**
```sql
id, invoice_number, agent_id (FK), customer_id (FK),
subtotal, discount_amount, vat_amount, total_amount,
payment_status ENUM('pending', 'partial', 'paid', 'overdue'),
payment_method ENUM('cash', 'credit', 'bank_transfer', 'cheque'),
is_synced, synced_at, offline_created, notes,
created_at, updated_at
```

**invoice_items**
```sql
id, invoice_id (FK), product_id (FK),
quantity, unit_price, discount_percent,
vat_amount, line_total, created_at
```

**agent_visits**
```sql
id, agent_id (FK), customer_id (FK),
visit_date, visit_type, outcome,
check_in_at, check_out_at,
location_lat, location_lng,
invoice_id (FK - optional), notes, created_at
```

**agent_locations**
```sql
id, agent_id (FK), latitude, longitude, recorded_at
```

**journey_plans**
```sql
id, agent_id (FK), plan_date,
status ('planned', 'in_progress', 'completed'),
created_by, notes, created_at, updated_at
```

**journey_stops**
```sql
id, journey_plan_id (FK), customer_id (FK),
stop_order, status ('pending', 'completed', 'skipped'),
check_in_at, check_in_lat, check_in_lng, check_out_at,
notes, created_at
```

**stock_loads**
```sql
id, agent_id (FK), status ('requested', 'approved', 'released'),
requested_at, approved_at, approved_by,
released_at, released_by, notes, created_at
```

**stock_load_items**
```sql
id, stock_load_id (FK), product_id (FK),
requested_quantity, approved_quantity, released_quantity,
created_at
```

**reconciliations**
```sql
id, agent_id (FK), date, status ('pending', 'submitted', 'approved', 'disputed'),
total_loaded, total_sold, total_returned, total_damaged,
cash_collected, expected_cash, variance,
damage_value, return_value,
submitted_at, approved_at, approved_by, notes, created_at
```

**reconciliation_items**
```sql
id, reconciliation_id (FK), product_id (FK),
loaded_quantity, sold_quantity, returned_quantity, damaged_quantity,
remaining_quantity, unit_price, total_value, damage_reason, created_at
```

**user_roles**
```sql
id, user_id (FK auth.users), role admin_role ENUM, created_at
```

**user_permissions**
```sql
id, user_id (FK), 
can_access_dashboard, can_access_inventory, can_access_products,
can_access_sales, can_access_customers, can_access_representatives,
can_access_agents, can_access_reports, can_access_settings,
can_access_users, can_access_invoices, can_access_reconciliation,
can_access_load_management, can_access_live_map,
can_edit_agents, can_edit_customers, can_edit_products,
can_delete_users, created_at, updated_at
```

**profiles**
```sql
id, user_id (FK), full_name, email, avatar_url, created_at, updated_at
```

**company_settings**
```sql
id, company_name, logo_url, address, phone, tax_id, created_at, updated_at
```

### Database Functions (Postgres)
```sql
-- Check if user is admin
CREATE FUNCTION is_admin(_user_id uuid) RETURNS boolean

-- Check specific role
CREATE FUNCTION has_role(_user_id uuid, _role admin_role) RETURNS boolean

-- Check if user is agent
CREATE FUNCTION is_agent(_user_id uuid) RETURNS boolean

-- Get agent ID from user
CREATE FUNCTION get_agent_id(_user_id uuid) RETURNS uuid

-- Validate visit within 100m of customer
CREATE FUNCTION validate_visit_proximity() RETURNS TRIGGER
-- Raises exception if distance > 100 meters
```

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Agents can only see/edit their own data
- Admins can view all data based on role
- GPS proximity validation on visits (100m rule)

---

## 4. APPLICATION ROUTES

### Admin Panel Routes
```
/login                 - Admin login page
/                      - Dashboard (protected)
/inventory             - Inventory management
/products              - Products CRUD
/sales                 - Sales overview
/customers             - Customer management with map
/representatives       - Rep list (legacy)
/reports               - Advanced reporting (4 types)
/agents                - Agent management (IT Admin, Sales Manager)
/agents/:id            - Agent detail page
/load-management       - Stock load requests (IT Admin, Sales Manager)
/live-map              - Real-time agent tracking (IT Admin, Sales Manager)
/journey-planning      - Route planning (IT Admin, Sales Manager)
/reconciliation        - Tafreegh (IT Admin, Accountant)
/invoices              - Invoice center (IT Admin, Accountant)
/settings              - System settings (Owner, IT Admin)
/users                 - User management (Owner, IT Admin)
/unauthorized          - Access denied page
```

### Agent Mobile Routes
```
/agent-login           - Agent login (separate auth)
/agent                 - Agent dashboard (mobile-first)
/agent/visit           - Record visits
/agent/sale            - Create invoices
/agent/targets         - View targets & progress
/agent/inventory       - Vehicle inventory
/agent/settlement      - End-of-day reconciliation
/agent/today-route     - Today's journey plan
/agent/add-customer    - Add new customer
```

---

## 5. CORE FEATURES

### Dashboard
- 6 stat cards: Revenue, Sales, Customers, Products, Active Reps, Low Stock
- KPI Metrics section:
  - **Productivity** = Invoices / Total Visits
  - **Strike Rate** = Successful Visits / Total Visits (%)
  - **Drop Size** = Total Revenue / Total Invoices
- Sales Chart (line/bar)
- Target vs Actual (Volume in Cartons, Value in EGP, Weight in Tons)
- Rep Performance table
- Recent Orders
- Top Products

### Agent Management
- Create/Edit agents with targets (monthly, cartons, tons)
- Permission toggles:
  - Can Give Discounts (with max_discount_percent)
  - Can Add Clients
  - Can Process Returns
- Kill Switch (instant deactivation)
- View agent detail with performance metrics

### Load Management (Stock Loading)
Workflow:
1. Agent requests stock load (items + quantities)
2. Sales Manager approves (can modify quantities)
3. Warehouse releases approved stock
4. Stock appears in agent's vehicle inventory

### Journey Planning
- Weekly plans (Saturday-Thursday)
- Assign customers to routes with stop order
- GPS validation: Visit cannot start if agent > 100m from customer

### Invoice System
- Discount types: Percentage (%) or Fixed Amount
- VAT calculation (15% default)
- Payment status tracking
- Offline creation support with sync

### Reconciliation (Tafreegh)
End-of-day settlement:
- Loaded vs Sold vs Returned vs Damaged
- Cash collected vs Expected
- Variance calculation
- Submit for approval workflow

### Reports (4 Types)
1. **Sales Report**: Revenue, invoice count, payment status breakdown
2. **Agent Performance**: KPIs per agent (Productivity, Strike Rate, Drop Size)
3. **Customer Analysis**: Classification, withdrawal patterns
4. **Inventory Report**: Stock levels, damages, returns

All reports support:
- Date range filter (Today, This Month, Last Month, Custom)
- PDF export (Arabic RTL support)
- Excel export

### Live Map
- Real-time agent locations (Leaflet)
- Customer locations
- Only visible to IT Admin and Sales Manager

---

## 6. RTL IMPLEMENTATION

### CSS Variables
```css
:root {
  --app-sidebar-width: 16rem;
}

/* LTR: Sidebar left, content margin-left */
[dir="ltr"] .app-main-content {
  margin-left: var(--app-sidebar-width);
}

/* RTL: Sidebar right, content margin-right */
[dir="rtl"] .app-main-content {
  margin-right: var(--app-sidebar-width);
}
```

### Sidebar Active Indicator
```css
.sidebar-active-indicator::after {
  content: '';
  width: 3px;
  background: hsl(25 100% 50%);
}

[dir="ltr"] .sidebar-active-indicator::after { right: 0; }
[dir="rtl"] .sidebar-active-indicator::after { left: 0; }
```

### Language Context
- Stores preference in localStorage (`manoErp_language`)
- Updates `document.dir` and `document.lang`
- Adds `rtl` class to body
- Full translation dictionary with 100+ keys

---

## 7. AGENT MOBILE APP

### Mobile-First Layout (AgentMobileLayout)
- Sticky header with orange background
- Agent name display
- Logout button
- Connection status indicator (online/offline)
- Full RTL support (dir="rtl")

### Features
- Touch-friendly large buttons
- GPS location tracking
- Offline mode support
- Camera for proof of delivery (future)

---

## 8. KEY BUSINESS RULES

1. **Quantities in Cartons (كراتين)** - Weight (Tons) hidden from agents
2. **100m GPS Rule** - Visits require proximity to customer location
3. **Discount Limits** - Agents have `max_discount_percent` ceiling
4. **Journey Plans** - Weekly (Saturday-Thursday), not Friday
5. **Real-time Stock** - Vehicle inventory updates after each sale
6. **Credit Limits** - Customers have `credit_limit` and `current_balance`

---

## 9. TECHNOLOGY STACK

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + tailwindcss-animate
- shadcn/ui components
- React Query (TanStack Query)
- React Router DOM
- Recharts (charts)
- Leaflet + React-Leaflet (maps)
- Framer Motion (animations)
- date-fns (date handling)

**Backend:**
- Supabase (Lovable Cloud)
- PostgreSQL with RLS
- Edge Functions (Deno)

**Export:**
- jsPDF + jspdf-autotable (PDF)
- ExcelJS (Excel)
- Arabic RTL PDF support

---

## 10. EDGE FUNCTIONS

**create-admin-user**
Creates admin users with role assignment.

**create-agent-user**  
Creates agent users and links to agents table.

---

## 11. IMPLEMENTATION ORDER

1. **Phase 1: Foundation**
   - Set up design system (index.css, tailwind.config.ts)
   - Create database tables with RLS
   - Implement LanguageContext with translations
   - Build AppLayout, AppSidebar components

2. **Phase 2: Auth**
   - AuthContext for admin panel
   - AgentAuthContext for mobile
   - ProtectedRoute components
   - Login pages

3. **Phase 3: Core Modules**
   - Dashboard with KPIs
   - Products CRUD
   - Customers CRUD with map
   - Agent Management

4. **Phase 4: Operations**
   - Load Management workflow
   - Journey Planning
   - Invoice creation
   - Reconciliation

5. **Phase 5: Agent Mobile**
   - AgentMobileLayout
   - Visit recording with GPS
   - Mobile invoice creation
   - Settlement flow

6. **Phase 6: Advanced**
   - Live Map tracking
   - Reports with export
   - User permissions
   - Settings page

---

## 12. CUSTOM INSTRUCTIONS FOR AI

Add to project settings → Manage Knowledge:

```
Project Identity: "This project is a dedicated ERP for Mano Distribution Company. All user interfaces must remain in Arabic."

Core Calculation Logic:
- "Productivity = Invoices / Total Visits."
- "Strike Rate = Successful Orders / Total Visits."
- "Drop Size = Total Revenue / Total Invoices."
- "All quantities must be tracked in Cartons (كراتين), and weight metrics (Tons) should be hidden from agent views."

Security & Roles: "Maintain strict RLS (Row Level Security). Agents can only see their own assigned customers, visits, and stock. Only Admins can see the overall map and all agents' data."

GPS & Journey Plans: "A visit cannot be 'started' unless the agent's GPS coordinates are within 100 meters of the customer's saved location. Journey plans are weekly (Saturday-Thursday)."

Stock Management: "Vehicle stock is updated in real-time after each sale. End-of-shift reconciliation must account for 'Unloaded' vs 'Carry-over' stock."
```

---

This prompt contains everything needed to rebuild Mano ERP exactly as it exists. Copy the entire contents to a new Lovable project and follow the implementation phases.
