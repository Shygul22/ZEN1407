## Goal

Build a **clickable full demo** of the business management platform — every role, every screen, every list visible and navigable. Data is seeded/mock so the boss can walk through the entire system. Payments are record-only (Accounts logs them manually). Videos are uploaded by admin to Lovable Cloud storage.

## Look & feel

Modern light theme with a deep indigo primary, clean dashboard layouts on the staff side, and an app-like mobile-first feel on the customer side (rounded cards, bottom nav, vertical video feed).

## Roles & access

Single login screen → routes user to their role workspace based on assigned role (stored in `user_roles` table, separate from profiles).

- **Super Admin (Boss)** — sees everything, assigns jobs
- **Admin** — service list, enquiry list, customer/CID directory
- **Accounts** — balance list, payment recording, ledger
- **Service Engineer** — assigned jobs, update status, service history
- **Sales** — enquiries, leads, convert to customer
- **Customer** — separate mobile-style app

A demo role-switcher in the header lets the boss preview any role without re-logging in (demo only).

## Staff side (dashboard layout)

Sidebar nav + topbar. Pages:

1. **Dashboard** — KPI cards (open jobs, pending enquiries, outstanding balance, active engineers), recent activity feed
2. **Job List** — table with CIN, customer, location, contact, assigned engineer, status. Boss can assign/reassign jobs
3. **Service List** — all service tickets (open/in-progress/closed) with engineer + CID
4. **Enquiry List** — incoming leads (source: WhatsApp / call / email / app), assignable to Sales
5. **Balance List** — per-customer outstanding, paid, total. Accounts records manual payments (date, amount, method, note)
6. **Customers (CID directory)** — searchable list of customers by CID, drill into profile, purchase history, service history, communication log
7. **Video Library** — admin uploads MP4 product videos (Lovable Cloud storage), title, description, thumbnail; toggles visibility on customer feed
8. **Staff Management** (Boss only) — list staff, assign category/role

## Customer app (mobile-first)

Bottom tab nav: Feed · Services · History · Profile

1. **Video Feed** — vertical scroll of product videos (TikTok-style), tap to view details, like, share
2. **Service Registration** — form to request service (issue type, description, preferred date, location auto-filled)
3. **Contact / Enquiry** — buttons for WhatsApp, Phone, Email, in-app message; in-app message creates an entry in Enquiry List
4. **Purchase History** — list of past orders with amount, date, status
5. **Service History** — past service tickets with engineer, resolution, date
6. **Profile** — personal info, location, contact details, edit
7. **Feedback** — star rating + comment, attached to a service or general
8. **Payments** — view outstanding balance, "Mark as paid offline" / contact accounts (no online checkout in v1)

## Data model (Lovable Cloud)

- `profiles` (id, full_name, phone, email, location, cid)
- `user_roles` (user_id, role enum: super_admin/admin/accounts/service_eng/sales/customer) — separate table, `has_role()` security definer function
- `jobs` (id, cin, customer_id, location, contact, assigned_to, status, created_by)
- `services` (id, customer_id, engineer_id, issue, status, resolution, dates)
- `enquiries` (id, customer_id?, source, message, assigned_to, status)
- `balances` / `payments` (customer_id, amount, type, method, recorded_by, date)
- `purchases` (customer_id, item, amount, date)
- `videos` (id, title, description, video_url, thumbnail_url, visible, uploaded_by)
- `feedback` (customer_id, service_id?, rating, comment)
- `communication_logs` (customer_id, channel, direction, summary, timestamp)
- Storage bucket: `product-videos` (public read, admin write)

RLS on every table, scoped by role via `has_role(auth.uid(), 'role')`.

## Seed data

Pre-populate ~5 customers, 8 jobs across statuses, 6 enquiries, balances, 4 sample videos, purchase + service history — so every screen is visibly populated for demo.

- Real online payment processing
- Real WhatsApp/SMS sending (buttons open `wa.me` / `tel:` / `mailto:` links)
- Push notifications

## Build order

1. Auth + roles + role-switcher demo shell
2. Database schema, RLS, seed data, video storage bucket
3. Staff dashboard shell + Job/Service/Enquiry/Balance/Customer lists
4. Video upload + library
5. Customer mobile app shell + all 8 customer screens
6. Polish, mock data fill, walkthrough QA

Once approved, I'll switch to build mode and start implementing.
