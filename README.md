# Noble Kings Academy — School Management System (SMS)

A modern, role-based academic portal and school management platform built for **Noble Kings Academy**. Supports Nursery, Primary, and Junior Secondary education with automated grading, digital ID cards, printable termly report cards, and administrative oversight.

---

## 🌟 Key Features

### 1. 🌐 Public School Portal & Website (`/`)
- Modern, responsive landing page featuring school branding, mission, and accreditation.
- Academic program overviews (Nursery, Primary, Junior Secondary).
- Real-time school bulletin notices and campus announcements.
- Direct links into the unified role-based portal.

### 2. 🔐 Unified Authentication (`/login`)
- **Portal ID Login**: Supports custom 6-digit student IDs (e.g. `849201`), teacher employee IDs (`200001`), and master administrator access (`000000`).
- **Standard Email Login**: Compatible with email/password credentials.
- **Self-Service Registration**: Auto-generates unique 6-digit Portal IDs for newly registered students and faculty.
- **Zero-Config Demo Mode**: Allows immediate testing with pre-seeded mock records without requiring Supabase credentials.

### 3. 🎓 Student & Parent Portal (`/student`)
- **Digital Student Identification Card**: Displays official student ID, grade level, admission number, and active status.
- **Termly Performance Report Sheet**:
  - Breakdown of Continuous Assessment (CA 1–3, 40 marks) and Terminal Examination (60 marks).
  - Total scores, automated letter grades (A–F), and teachers' remarks.
  - **Official Printable Report Card (`window.print()`)**: Formatted specifically for A4 printing and PDF export with school letterhead, grading scale, teacher/principal signature lines, and official stamp.
- **Approved Weekly Curriculum Plans**: View curriculum topics and learning objectives published by the administration.
- **Faculty Directory & Announcements**: Contact details for assigned subject teachers and school notices.

### 4. 👨‍🏫 Teacher Portal (`/teacher`)
- **Grade-Scanned Classes**: Access assigned grades (e.g., Primary 1, Primary 2, JSS 1).
- **Result Entry & CA Recording**:
  - Enter CA1 (10%), CA2 (10%), CA3 (10%), and Exam (60%).
  - Multi-subject scoring per student.
  - Staged results workflow with bulk review before submitting for administrative approval.
- **Curriculum Planning**: Draft and submit weekly schemes of work by term and subject.

### 5. ⚙️ Administrator Portal (`/admin`)
- **Academic Governance**: Configure academic sessions (e.g., 2024/2025) and active terms.
- **Class & Subject Management**: Create and organize classes across levels.
- **User Approvals**: Approve or toggle status for newly registered students and teachers.
- **Curriculum Oversight**: Review, edit, and publish weekly curriculum plans to student dashboards.
- **Academic Results Control**: Oversee, search, and verify all submitted examination marks.
- **School Announcements**: Broadcast targeted announcements (All, Teachers, or Students).

---

## 🏗️ Technical Architecture

- **Frontend**: [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/), [React Router v7](https://reactrouter.com/), [Lucide React](https://lucide.dev/)
- **Linter & Code Quality**: [Oxlint](https://oxc.rs/)
- **Data Layer**: Dual-mode data client (`src/supabase/client.js`):
  - **Live Supabase Mode**: Connects to Supabase PostgreSQL when `.env` is configured.
  - **Local/Demo Mode**: Persisted `localStorage` database with full CRUD capabilities.
- **Database Schema**:
  - `DATABASE_SCHEMA.sql`: 14 relational tables with constraints, triggers, and auto-grade calculation.
  - `RLS_POLICIES.sql`: Complete PostgreSQL Row Level Security (RLS) policies per role.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Development
```bash
# Navigate to the frontend directory
cd school-management-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🔑 Demo Login Credentials (Out-of-the-Box)

| Role | Portal ID / Identifier | Default Password | Initial Landpage |
|---|---|---|---|
| **Administrator** | `000000` or `admin@school.com` | `admin123` | `/admin` |
| **Teacher** | `200001` or `teacher@school.com` | `teacher123` | `/teacher` |
| **Student** | `849201` or `student@school.com` | `student123` | `/student` |

---

## 🗄️ Connecting to Supabase (Production)

1. Follow the steps in [`SUPABASE_SETUP_GUIDE.md`](../SUPABASE_SETUP_GUIDE.md).
2. Execute [`DATABASE_SCHEMA.sql`](../DATABASE_SCHEMA.sql) in your Supabase SQL Editor.
3. Execute [`RLS_POLICIES.sql`](../RLS_POLICIES.sql) to apply Row Level Security.
4. Copy `school-management-system/.env.example` to `school-management-system/.env` and update credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
