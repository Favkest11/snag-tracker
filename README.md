LIVE:::https://snag-tracker.netlify.app/
# 🏗️ SnagTracker - Construction Defect Management System (MVP)

A web application designed for efficient reporting, delegating, and tracking of construction site defects (snags). The project demonstrates a full task lifecycle (CRUD) and the implementation of Role-Based Access Control (RBAC) tailored for the construction industry.

## ✨ Core Business Features

* **Role-Based Access Control (RBAC):**
  * **General Contractor (Generalny Wykonawca):** Full visibility of all issues across the site, the ability to report new snags, and the authority to perform final verification and closure (deletion) of resolved tasks.
  * **Worker / Subcontractor (Pracownik):** Automatic data filtering to display only assigned tasks. Workers can update the progress status of their tasks in real-time.
* **File Management (Object Storage):** Asynchronous upload of defect photos directly to the cloud, automatically generating and storing public URLs in the database.
* **Dynamic Workflows:** Smooth task progression through operational stages: `DO ZROBIENIA` (To Do) ➡️ `W TOKU` (In Progress) ➡️ `ROZWIĄZANE` (Resolved) ➡️ `ZATWIERDZONE` (Approved & Deleted).
* **Reliability & Fail-safes:** Implemented fallback mechanisms (local backup data) to ensure UI continuity and a seamless demonstration even in the event of database connection drops.

## 🛠️ Tech Stack

* **Frontend:** React, Next.js (App Router)
* **Backend / Database:** Supabase (PostgreSQL)
* **File Storage:** Supabase Storage (Public Buckets)

## 🚀 Local Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_GITHUB_USERNAME/snag-tracker.git](https://github.com/Favkest11/snag-tracker.git)
2.Install dependencies:
npm install
* **3.Configure environment variables. Create a .env.local file in the root directory and add your Supabase keys:
* **NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
* **NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
* **4.Run the development server:
* **npm run dev
