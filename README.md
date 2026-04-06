# SMM Tracker

A client-side web application for freelance social media managers to track clients, content tasks, and payments — all in the browser, no backend needed.

**Live demo:** https://mihaelaaa-23.github.io/smm-tracker/

---

## Features

### Clients
- Add, edit, delete SMM clients
- Track platforms (Instagram, TikTok, Facebook, LinkedIn)
- Mark clients as active/inactive and priority
- Click any client to view their full detail page

### Tasks
- Create tasks linked to a client with deadline, type, priority and status
- Filter by status, priority and client
- Mark tasks as needing client approval
- Overdue tasks highlighted automatically

### Payments
- Monthly payment tracking per client
- Filter by status (paid/unpaid/partial), currency and client search
- Days overdue shown automatically
- Email reminder via mailto for unpaid payments
- Bottom bar with Total Billed / Collected / Outstanding per month
- Month navigation to browse payment history

### Dashboard
- Summary cards: Active Clients, Pending Tasks, Collected, Unpaid
- Revenue bar chart (last 6 months)
- Payment status donut chart (current month)
- Tasks due this week
- Unpaid payments this month

### Client Detail Page
- Per-client view with all their tasks and payments
- Invoice blocked indicator when tasks need approval

### UX
- Light / dark mode toggle, persisted in localStorage
- Luxury minimal design inspired by BestSecret
- Urbanist font
- Mobile-first, optimized for iPad and iPhone
- Custom confirm dialogs
- Mobile bottom navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Local storage | Dexie.js (IndexedDB) |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | GitHub Pages |

---

## App Flows

### Adding a client
1. Navigate to Clients
2. Click **+ Add Client**
3. Fill in name, brand, platforms, status and notes
4. Click **Add Client** — saved to IndexedDB

### Tracking tasks
1. Navigate to Tasks or open a Client Detail page
2. Click **+ Add Task**
3. Set title, type, priority, deadline and approval flag
4. Update status inline via the dropdown on each card

### Recording a payment
1. Navigate to Payments
2. Click **+ Add Payment** or the **+** button on a client row
3. Select client, month/year, amount, currency and status
4. Overdue state is derived automatically from the payment date

---

## Project Structure
src/
├── components/
│   ├── ui/          # Layout, Navbar, Sidebar, MobileNav, FilterDropdown, ActiveFilters, ConfirmDialog
│   ├── clients/     # ClientCard, ClientForm, ClientList
│   ├── tasks/       # TaskCard, TaskForm, TaskList
│   └── payments/    # PaymentForm, PaymentList, PaymentSummary
├── pages/           # DashboardPage, ClientsPage, ClientDetailPage, TasksPage, PaymentsPage, NotFoundPage
├── db/              # Dexie schema + all DB operations + formatPeriod helper
├── hooks/           # useTheme, useConfirm
└── types/           # Client, Task, Payment interfaces

---

## Git Workflow

- `main` — production branch (deployed to GitHub Pages)
- `feature/*` — one branch per feature, merged via PR

Commit convention: `feat:` / `fix:` / `style:` / `chore:` / `docs:`

---

## Local Development
```bash
git clone https://github.com/mihaelaaa-23/smm-tracker
cd smm-tracker
npm install
npm run dev
```

Open [http://localhost:5173/smm-tracker/](http://localhost:5173/smm-tracker/)

---

## Deploy
```bash
npm run deploy
```

Deploys to GitHub Pages via `gh-pages` package.