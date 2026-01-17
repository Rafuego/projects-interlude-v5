# Interlude Handoff Platform

A refined, editorial handoff experience for brand and web development deliverables with admin dashboard and client-facing views.

## Architecture

- **`/admin`** — Studio dashboard (create, edit, manage all projects)
- **`/admin/[project]`** — Edit a specific project with full editing capabilities
- **`/[slug]`** — Client-facing view (read-only, password protected if set)

**Data Storage:** Supabase (PostgreSQL database + file storage)

---

## Quick Start

### 1. Set Up Supabase (One-Time Setup)

Your Supabase project is already configured. You just need to create the database table:

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** in the sidebar
4. Copy the contents of `supabase-setup.sql` and run it
5. Go to **Storage** in the sidebar and create a bucket called `project-files`
   - Toggle **"Public bucket"** ON

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the admin dashboard.

---

## Deploying to Vercel

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Click Deploy — done!

### Custom Domain

1. Vercel dashboard → Settings → Domains
2. Add `projects.interlude.studio`
3. Update DNS as instructed

---

## How It Works

### For You (Admin)

1. Go to `/admin` to see all projects
2. Click **"+ New Project"** to create a handoff
3. Edit content (logos, colors, pages, etc.) — changes auto-save
4. Open **Settings** (gear icon) to configure:
   - **Slug** — the client-facing URL
   - **Password** — optional protection
   - **Publish** — make it live
5. Copy the client link and send it

### For Clients

1. They visit `projects.interlude.studio/symphony`
2. Enter password if required
3. View and download assets — read-only

---

## File Uploads

Files are stored in Supabase Storage:
- Logos: SVG, PNG, PDF
- Research: PDF
- Typography: TTF, OTF, WOFF, WOFF2
- Screenshots: PNG, JPG
- Animations: JSON (Lottie), MP4

---

## Project Structure

```
interlude-handoff/
├── app/
│   ├── admin/page.tsx           # Dashboard
│   ├── admin/[project]/page.tsx # Edit view
│   └── [project]/page.tsx       # Client view
├── components/
│   ├── HandoffPlatform.jsx      # Admin editor
│   └── ClientHandoffPlatform.jsx # Read-only view
├── lib/supabase.ts              # Database client
└── supabase-setup.sql           # DB setup script
```

---

## Support

Built by Interlude Studio.
