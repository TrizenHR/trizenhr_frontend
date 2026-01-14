# AttendEase Dashboard - Project Plan

## 📋 System Overview

**AttendEase** is a multi-tenant SaaS platform for attendance, leave, and payroll management built with Next.js, Node.js, Express, and MongoDB.

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, MongoDB/Mongoose
- **Storage**: MinIO (photo storage)
- **Auth**: JWT with role-based access control

---

## 🎯 Role-Based Access Control

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **Super Admin** | Platform owner (Trizen Ventures) | Manage all organizations, cross-org user management |
| **Admin** | Organization administrator | Full access within organization |
| **HR** | Human resources | User management, attendance, leave, payroll |
| **Supervisor** | Team lead | Team attendance/leave approvals |
| **Employee** | Staff member | Self-service attendance, leave, salary viewing |

---

## 🚀 Implementation Phases

### ✅ Phase 1: Core Functionality (Week 1) - COMPLETE
- Authentication system (JWT, role-based access)
- User management (CRUD for all roles)
- My Attendance page
  - Camera-based check-in/out with photo capture (MinIO)
  - Monthly statistics with filters
  - Attendance history with pagination
- Dashboard screens (role-specific widgets)
- Profile page with password change

### ✅ Phase 2: Leave Management (Week 2) - COMPLETE
- Leave request/approval workflow
- Leave balance tracking and deduction
- My Leave page (employees)
- Leave Approvals page (supervisors/HR/admin)
- Leave Calendar view with attendance integration
- **Holiday Management**:
  - CRUD system for holidays (National/Company/Optional)
  - Year selector and recurring holiday support
  - Indian holidays seed script
  - Calendar integration

### ✅ Phase 3: Team Management (Week 3) - COMPLETE
- Team attendance view (Supervisor/HR/Admin)
- Team leaves overview
- Employee directory (HR/Admin)
- Department management (Admin/Super Admin)
- Unified calendar structure (My Calendar for all roles)

### ✅ Phase 4: Reports & Analytics (Week 4) - COMPLETE
- Attendance reports (date range, department, status filters)
- Leave reports (comprehensive filtering)
- Summary statistics cards
- CSV export functionality
- Search and pagination

### ✅ Phase 5: Multi-Tenant SaaS (Week 5) - COMPLETE
- **Backend**:
  - Organization model with subscription plans
  - All models updated with organizationId
  - Tenant isolation middleware (tenantContext)
  - Migration script (zero data loss)
- **Frontend**:
  - Organization management page (Super Admin only)
  - Organization selector in user creation
  - Quick-create users from org table
  - Updated dashboards with org-level stats
- **Security**:
  - JWT-level isolation
  - Service-level filtering
  - Database compound indexes per organization

### 🚧 Phase 6: Payroll Management (Week 6) - IN PROGRESS

**✅ Completed:**
- **Backend**:
  - 3 Models: SalaryStructure, PayrollRun, PayrollRecord
  - Payroll service with attendance/leave integration
  - 10 API endpoints with RBAC
  - Holiday-aware working days calculation
  - Prorated salary for absences
  - Support for all roles (not just employees)
- **Frontend**:
  - TypeScript types and API client (10 methods)
  - Permission helpers (canManagePayroll, canViewAllPayroll, canProcessPayroll)
  - 3 Pages:
    - `/dashboard/salary-structures` - Admin/HR manage salary components
    - `/dashboard/payroll` - Admin/HR process monthly payroll
    - `/dashboard/my-salary` - All users view own payslips
  - Sidebar navigation updates

**Features:**
- **Salary Structure Management**: Base salary + allowances/deductions (fixed or percentage-based)
- **Payroll Processing**: Monthly batch processing with automatic calculations
- **Attendance Integration**: Working days = Attendance + Approved Leaves
- **Proration**: Automatic salary reduction for absences
- **Holiday Awareness**: Working days exclude weekends AND public/company holidays
- **Flexibility**: Supports custom allowances/deductions per employee
- **Role Support**: Payroll for Employees, Supervisors, HR, and Admins

**Calculation Logic:**
```
Working Days = Total Weekdays - Public Holidays - Company Holidays
Days Worked = Attendance Days + Approved Leave Days
Absent Days = Working Days - Days Worked

If Absent Days > 0:
   Effective Base = (Base Salary / Working Days) × Days Worked
Else:
   Effective Base = Base Salary

Gross Salary = Effective Base + Allowances (fixed + percentage)
Total Deductions = Deductions (fixed + percentage of gross)
Net Salary = Gross - Deductions
```

**Current Limitations (By Design - Prototype):**
- Manual allowances/deductions (no statutory auto-calculation)
- No PDF payslip generation
- No Indian compliance (EPF, ESI, Professional Tax, TDS)
- No email notifications
- No bulk import

**Design Philosophy:**
- **Flexible**: Company-specific allowances/deductions
- **Extensible**: Easy to add statutory calculations later
- **Compliant-Ready**: Structure supports future compliance additions

---

## 📊 Feature Comparison Matrix

| Feature | Super Admin | Admin | HR | Supervisor | Employee |
|---------|-------------|-------|-----|------------|----------|
| **User Management** | ✅ All roles | ✅ HR/Supervisor/Employee | ✅ Employee only | ❌ | ✅ Self |
| **Attendance (All)** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Attendance (Team)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Attendance (Self)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Leave Approvals (All)** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Leave Approvals (Team)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Holiday Management** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Salary Management** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Payroll Processing** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Own Payslips** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Reports** | ✅ All | ✅ All | ✅ Employee | ✅ Team | ✅ Self |
| **Organization Management** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🏗️ Architecture Highlights

### Multi-Tenant Isolation (4 Layers)
1. **JWT Level**: organizationId in token (except Super Admin)
2. **Middleware Level**: tenantContext validates and filters
3. **Service Level**: All queries include organizationId
4. **Database Level**: Compound unique indexes per org

### Super Admin Special Handling
- No organizationId (platform-level access)
- Can specify `?organizationId=xyz` to manage specific org
- Email uniqueness is global (not per-org)
- No department, supervisor, or employeeId

---

## 📁 Project Structure
```
attendease-dashboard-ui/
├── client/                # Next.js frontend
│   ├── src/app/          # Pages (App Router)
│   ├── src/components/   # Reusable components
│   ├── src/lib/          # API client, types, permissions
│   └── src/hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── src/models/       # Mongoose schemas
│   ├── src/services/     # Business logic
│   ├── src/controllers/  # Route handlers
│   ├── src/routes/       # API routes with RBAC
│   ├── src/middleware/   # Auth, tenant context
│   └── src/scripts/      # Seeds and migrations
└── PROJECT_PLAN.md       # This file
```

---

## 🔮 Future Enhancements (Phase 7+)

### Payroll Compliance (India)
- EPF auto-calculation (12% employee + 12% employer)
- ESI for salary < ₹21,000
- Professional Tax (state-wise)
- TDS calculation with IT slabs
- Form 16 generation

### Additional Features
- PDF payslip generation
- Email notifications (payslip ready, leave approved, etc.)
- Bulk salary structure import
- Performance bonuses and incentives
- Loan/advance management
- System activity logs
- Advanced analytics dashboards

---

## 📝 Current Status

**Active Phase**: Phase 6 - Payroll Management (90% complete)

**Remaining Tasks**:
- [ ] Testing payroll with real data
- [ ] End-to-end validation of calculations
- [ ] Documentation updates

**Next Phase**: Polish and production readiness
- Advanced features based on client feedback
- Performance optimization
- Compliance additions (if required)
