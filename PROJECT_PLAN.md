# AttendEase Dashboard - Project Plan

## 🎯 Dashboard Screens by Role

### 🟣 Super Admin (Full System Access)

**Available Screens:**

1. **Dashboard** (`/dashboard`)
   - System-wide statistics
   - Total users by role
   - Today's attendance summary (all departments)
   - Recent activities
   - Quick actions

2. **Users Management** (`/dashboard/users`)
   - ✅ Already implemented
   - Create any role
   - Edit/delete users
   - Assign supervisors
   - Change roles

3. **Departments** (`/dashboard/departments`)
   - Create/edit/delete departments
   - Assign department heads
   - View department statistics

4. **Attendance** (`/dashboard/attendance`)
   - View all attendance records
   - Filter by department/date/user
   - Manual attendance entry
   - Attendance corrections

5. **Leave Management** (`/dashboard/leave`)
   - View all leave requests
   - Approve/reject any request
   - Leave balance overview
   - Leave policies management

6. **Reports** (`/dashboard/reports`)
   - Attendance reports (all departments)
   - Leave reports
   - User activity reports
   - Export to CSV/PDF

7. **Settings** (`/dashboard/settings`)
   - System settings
   - Attendance policies
   - Leave policies
   - Working hours configuration
   - Holidays management

8. **System Logs** (`/dashboard/logs`)
   - User activity logs
   - System events
   - Audit trail

---

### 🔵 Admin (Department-Level Access)

**Available Screens:**

1. **Dashboard** (`/dashboard`)
   - Department/company-wide statistics
   - Today's attendance summary
   - Pending leave requests
   - Quick actions

2. **Users Management** (`/dashboard/users`)
   - ✅ Already implemented
   - Create HR, Supervisor, Employee
   - Cannot create Super Admin or Admin
   - Edit/delete (except Super Admin)

3. **Departments** (`/dashboard/departments`)
   - View all departments
   - Edit departments (if assigned)
   - View department statistics

4. **Attendance** (`/dashboard/attendance`)
   - View all attendance records
   - Filter by department/date/user
   - Manual attendance entry
   - Attendance corrections

5. **Leave Management** (`/dashboard/leave`)
   - View all leave requests
   - Approve/reject requests
   - Leave balance overview

6. **Reports** (`/dashboard/reports`)
   - Attendance reports
   - Leave reports
   - Export to CSV/PDF

7. **Settings** (`/dashboard/settings`)
   - Limited settings (profile, preferences)
   - Cannot change system settings

---

### 🟢 HR (Employee Management)

**Available Screens:**

1. **Dashboard** (`/dashboard`)
   - Employee statistics
   - Today's attendance summary
   - Pending leave requests
   - New joiners/leavers

2. **Users Management** (`/dashboard/users`)
   - ✅ Already implemented
   - Create Employees only
   - Edit employee details
   - Cannot delete users

3. **Employees** (`/dashboard/employees`)
   - Employee directory
   - Employee records
   - Documents management
   - Onboarding status

4. **Attendance** (`/dashboard/attendance`)
   - View all employee attendance
   - Manual attendance entry
   - Attendance corrections
   - Late/absent tracking

5. **Leave Management** (`/dashboard/leave`)
   - View all leave requests
   - Approve/reject requests
   - Leave balance management
   - Leave reports

6. **Reports** (`/dashboard/reports`)
   - Attendance reports
   - Leave reports
   - Employee performance

---

### 🟡 Supervisor (Team Management)

**Available Screens:**

1. **Dashboard** (`/dashboard`)
   - Team overview
   - Team attendance today
   - Team leave requests
   - Team performance metrics

2. **My Team** (`/dashboard/team`)
   - Team members list
   - Team attendance view
   - Team calendar

3. **Team Attendance** (`/dashboard/team/attendance`)
   - View team members' attendance
   - Approve late entries
   - Request attendance corrections

4. **Team Leave** (`/dashboard/team/leave`)
   - View team leave requests
   - Approve/reject team member leaves
   - Team leave calendar

5. **My Attendance** (`/dashboard/my-attendance`)
   - Mark attendance (check-in/out)
   - View my attendance history
   - Request corrections

6. **My Leave** (`/dashboard/my-leave`)
   - Request leave
   - View leave balance
   - View leave history

7. **Profile** (`/dashboard/profile`)
   - Personal information
   - Change password
   - Preferences

---

### ⚪ Employee (Self-Service)

**Available Screens:**

1. **Dashboard** (`/dashboard`)
   - Personal stats
   - Today's attendance status
   - Upcoming leaves
   - Announcements

2. **My Attendance** (`/dashboard/my-attendance`)
   - Mark attendance (check-in/out)
   - View attendance history
   - Request corrections
   - Attendance calendar

3. **My Leave** (`/dashboard/my-leave`)
   - Request leave
   - View leave balance
   - View leave history
   - Leave calendar

4. **Profile** (`/dashboard/profile`)
   - Personal information
   - Emergency contacts
   - Documents
   - Change password

---

## 📊 Feature Comparison Matrix

| Feature | Super Admin | Admin | HR | Supervisor | Employee |
|---------|-------------|-------|-------|------------|----------|
| **User Management** |||||
| Create Users | ✅ All roles | ✅ HR/Supervisor/Employee | ✅ Employee only | ❌ | ❌ |
| Edit Users | ✅ All | ✅ Except Super Admin | ✅ Employees | ❌ | ✅ Self only |
| Delete Users | ✅ All | ✅ Except Super Admin/Admin | ❌ | ❌ | ❌ |
| **Attendance** |||||
| View All | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Team | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Self | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark Attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Corrections | ✅ | ✅ | ✅ | Request only | Request only |
| **Leave** |||||
| Approve All | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Team | ✅ | ✅ | ✅ | ✅ | ❌ |
| Request Leave | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Reports** |||||
| System Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| Department Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Team Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Self Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Settings** |||||
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Profile Settings | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality (Week 1) - ✅ 100% COMPLETE

**All Features Completed:**
- [x] Authentication system (login, JWT, role-based access)
- [x] User management (CRUD operations for all roles)
- [x] My Attendance page
  - [x] Camera-based check-in with photo capture
  - [x] Check-out functionality
  - [x] Today's status display
  - [x] Monthly statistics with month/year selector
  - [x] Attendance history table with pagination
  - [x] Date range and status filters
- [x] MinIO photo storage integration
- [x] Dashboard screens (all roles)
  - [x] Employee Dashboard (with real API data)
  - [x] Supervisor Dashboard (with mock data)
  - [x] HR Dashboard (with mock data)
  - [x] Admin Dashboard (with mock data)
  - [x] Super Admin Dashboard (with mock data)
- [x] Profile page
  - [x] User information display
  - [x] Password change functionality

**Note:** Supervisor/HR/Admin dashboards use mock data pending Phase 3 (Team Management) implementation.

---

### Phase 2: Leave Management (Week 2) - ✅ 100% COMPLETE
- [x] Leave request API and models
- [x] Leave balance tracking
- [x] My Leave page (Employee)
- [x] Leave approval interface (Supervisor/HR/Admin)
- [x] Approve/Reject workflow with notes
- [x] Balance deduction on approval
- [x] Attendance integration (ON_LEAVE marking)
- [x] Leave calendar view with attendance display
- [x] **Holiday Management System**
  - Complete CRUD API for holidays (Admin/HR/Super Admin)
  - Manage Holidays page with year selector
  - Holiday types: National, Company, Optional
  - Recurring holiday support
  - Indian holidays seed script (`npm run seed:holidays`)
  - Calendar integration (holidays show with blue background)
- [x] Complete testing and documentation

### Phase 3: Team Management (Week 3)
- [ ] Team attendance view (Supervisor)
- [ ] Team leave approvals
- [ ] Employee directory (HR)
- [ ] Department management

### Phase 4: Reports & Analytics (Week 4)
- [ ] Attendance reports
- [ ] Leave reports
- [ ] Export functionality
- [ ] Charts and graphs

### Phase 5: Advanced Features (Week 5+)
- [ ] System logs
- [ ] Bulk operations
- [ ] Notifications
- [ ] Advanced settings

---

## 📝 Project Status

### Completed ✅
- ✅ **Phase 1: Core Functionality** - 100% Complete
  - Authentication system (login, JWT tokens, role-based access)
  - User management (create, edit, delete users)
  - My Attendance feature
    - Check-in/check-out with camera photo capture
    - Today's status card
    - Monthly statistics
    - Attendance history with filters & pagination
  - MinIO photo storage (organized by date, fast-fail timeouts)
  - Dashboard screens (all roles)
    - Employee: Real data from APIs
    - Supervisor/HR/Admin/SuperAdmin: Mock data (Phase 3)
  - Profile page (user info display, password change)

### Current Phase 🎯
**Phase 2: Leave Management** - ✅ 100% COMPLETE
- ✅ Backend: Leave models, services, controllers, routes with RBAC
- ✅ Frontend: Types, API client, My Leave page, Leave Approvals page, Leave Calendar
- ✅ Complete workflow: Request → Approval → Balance deduction → Attendance marking
- ✅ Holiday Management: CRUD system with Indian holiday seed script (Admin/HR access)
- ✅ Profile navigation link added to sidebar

### Next Steps ⏭️
- Integrate holidays into Leave Calendar display
- Move to Phase 3: Team Management
  - Team attendance view (Supervisor)
  - Team leave approvals  
  - Employee directory (HR)
  - Department management

