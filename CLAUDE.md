# Interlude Studio — Handoff Platform

A project handoff platform built by Interlude Studio. Studio admins create rich, editorial-style project handoffs for clients with logos, colors, typography, web pages, animations, collateral, and more. Clients view a polished read-only version at a custom slug, optionally password-protected, with one-click ZIP download of all assets.

This file is the source of truth for any agent (Claude Code or otherwise) working on this codebase. Read it fully before making changes.

---

## Tech Stack

- **Framework:** Next.js 14.0.4 (App Router)
- **Language:** TypeScript + JSX (mixed — components are `.jsx`, lib code is `.ts`)
- **UI:** React 18, inline styles (no CSS files, no Tailwind)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket: `project-files`)
- **ZIP downloads:** `jszip`
- **Hosting:** Vercel (auto-deploys from `main` branch on GitHub)
- **Repo:** https://github.com/Rafuego/projects-interlude-v5

---

## Deployment Workflow

**Push to `main` → Vercel auto-deploys.** That's it. No manual deploy step.

```bash
git add <files>
git commit -m "..."
git push origin main
```

Wait ~1–2 minutes for Vercel to build and deploy, then hard refresh (`Cmd+Shift+R`) the live site to see changes.

---

## Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Redirects to `/admin` |
| `/admin` | `app/admin/page.jsx` | Studio dashboard — list/create/delete projects |
| `/admin/[project]` | `app/admin/[project]/page.jsx` | Edit a specific project (admin view) |
| `/[project]` | `app/[project]/page.jsx` | Public client view (read-only, optional password) |

---

## Data Model

**Single table: `projects`**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Project name |
| `client` | TEXT | Client name |
| `type` | TEXT | One of: `brand`, `website`, `product`, `deck` |
| `date` | TEXT | Formatted string ("January 2026") |
| `overview` | TEXT | Overview description |
| `figma_link` | TEXT | Optional Figma URL |
| `slug` | TEXT (unique) | Used in client URL `/[slug]` |
| `password` | TEXT (nullable) | Optional client-view password |
| `is_published` | BOOLEAN | Whether `/[slug]` returns content |
| `data` | JSONB | All section content (see below) |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto-updated on save |

**Storage bucket:** `project-files` (public). File path: `{projectId}/{folder}/{timestamp}-{filename}` (e.g. `abc123/logos/1710000000000-logo.svg`).

### `data` JSONB shape

```jsonc
{
  "research": {
    "documents": [{ "id", "name", "fileType", "description", "uploadDate", "file", "fileUrl" }],
    "notes": [{ "id", "title", "content", "author", "date" }]
  },
  "logos": [{ "id", "name", "format", "usage", "preview", "file", "fileUrl" }],
  "colors": [{ "id", "name", "hex", "rgb", "usage" }],
  "typography": [{ "id", "name", "family", "weight", "usage", "file", "fileUrl" }],
  "webpages": [{ "id", "name", "status", "figmaLink", "screenshot", "screenshotUrl", "notes", "additionalNotes", "links" }],
  "animations": [{ "id", "name", "animationType", "format", "notes", "file", "fileUrl", "animationData" }],
  "collateral": [{ "id", "name", "description", "fileType", "file", "fileUrl", "fileName" }],
  "devNotes": ["string", "..."],
  "helpDocs": [{ "title", "url", "description" }]
}
```

> **Backward compatibility:** Older projects may be missing some keys (e.g. `collateral`). All UI code uses optional chaining (`project.collateral?.length`) and fallbacks (`project.collateral || []`). Preserve this pattern for any new sections.

---

## Sections (Sidebar Navigation)

Sections appear in this order with Roman numeral labels in the sidebar. The client view hides empty sections automatically.

| # | ID | Label | Data key |
|---|---|---|---|
| I | `overview` | Overview | (top-level fields) |
| II | `research` | Research & Strategy | `research` |
| III | `logos` | Logos | `logos` |
| IV | `colors` | Colors | `colors` |
| V | `typography` | Typography | `typography` |
| VI | `webpages` | Web Pages | `webpages` |
| VII | `animations` | Animations | `animations` |
| VIII | `collateral` | Collateral | `collateral` |
| IX | `notes` | Dev Notes | `devNotes` + `helpDocs` |

---

## Key Files

```
projects-interlude-v5/
├── app/
│   ├── layout.tsx                    # Root layout, metadata, favicon, fonts
│   ├── page.tsx                      # Home → redirect to /admin
│   ├── admin/
│   │   ├── page.jsx                  # Dashboard
│   │   └── [project]/page.jsx        # Project editor (wraps HandoffPlatform)
│   ├── [project]/page.jsx            # Public client view (wraps ClientHandoffPlatform)
│   ├── icon.png                      # Favicon (Next.js convention)
│   └── favicon.png                   # Favicon (legacy path)
├── components/
│   ├── HandoffPlatform.jsx           # Admin editor (~3000 lines, all sections inline)
│   └── ClientHandoffPlatform.jsx     # Client viewer (~1600 lines, read-only)
├── lib/
│   └── supabase.ts                   # Supabase client + CRUD functions
├── public/
│   ├── projects/symphony.json        # Example project data
│   └── projects/favicon-32x32.png
├── supabase-schema.sql               # Schema, indexes, RLS policies
├── supabase-setup.sql                # Setup helper
└── next.config.js                    # Trivial — just reactStrictMode: true
```

### `lib/supabase.ts` — exports

- `supabase` — client instance
- `uploadFile(projectId, file, folder)` — uploads to Storage, returns `{path, url}`
- `deleteFile(path)` — removes from Storage
- `getProjects()` — list all
- `getProjectById(id)` — fetch one (admin)
- `getProjectBySlug(slug)` — fetch published project (client view)
- `createProject({name, client, type, slug})` — creates with default empty `data`
- `updateProject(id, updates)` — generic partial update
- `deleteProjectFromDb(id)` — deletes record + all storage files
- `checkSlugAvailable(slug, excludeId?)` — slug uniqueness check

> **IMPORTANT:** Supabase URL and anon key are currently **hardcoded as fallbacks** in `lib/supabase.ts` (lines 3–4). Production uses env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel. Don't commit real production keys here — leave the existing fallbacks alone unless rotating.

---

## Component Architecture

### `components/HandoffPlatform.jsx` (admin editor)

Single huge component containing every section's UI inline. Receives:
- `projectSlug` (legacy, usually null)
- `initialProject` — current project state from parent
- `onSave(updatedProject)` — debounced auto-save callback (500ms)
- `onFileUpload(file, folder)` — uploads to Supabase, returns public URL
- `isAdmin` — flag

**Internal sub-components:**
- `EditableField` — click-to-edit text/textarea, blurs to save
- `FileUploadZone` — drag-and-drop file input
- `TagSelector` — project type dropdown (color-coded)
- `LottiePreview` — placeholder animation preview

**Helpers:**
- `addItem(section, newItem)` — appends `{...newItem, id: Date.now()}` to `prev[section]`
- `removeItem(section, id)` — filters by id
- `handleFileUpload(section, id, file)` — uploads file, updates the matching item with `file`, `fileUrl`, etc. For `collateral` it also stores `fileType` (extension) and `fileName`.

### `components/ClientHandoffPlatform.jsx` (client viewer)

Read-only mirror of `HandoffPlatform`. Same visual layout. Receives only `project`.

Key features:
- `availableSections` filter — hides sections with no content
- `downloadAllAssets` — uses jszip to bundle all files into folders `01_Research`, `02_Logos`, ..., `06_Collateral`
- Color values are click-to-copy
- Typography uses `@font-face` injection from uploaded fonts

---

## Save / Load Flow (gotcha)

`app/admin/[project]/page.jsx::saveProject` **explicitly maps** which fields go into the `data` JSONB column. If you add a new section, you **must** add it to that map, or the data will not persist. Example:

```js
data: {
  research: updatedProject.research,
  logos: updatedProject.logos,
  colors: updatedProject.colors,
  typography: updatedProject.typography,
  webpages: updatedProject.webpages,
  animations: updatedProject.animations,
  collateral: updatedProject.collateral || [],   // ← required for collateral
  devNotes: updatedProject.devNotes,
  helpDocs: updatedProject.helpDocs,
}
```

The client-view page (`app/[project]/page.jsx`) uses `...data.data` spread, so it picks up everything automatically.

---

## How to Add a New Section

Use the Collateral section (added 2026-05-04) as a reference implementation. Steps:

1. **`lib/supabase.ts`** — add `<section>: []` (or whatever default shape) to the `data` object inside `createProject`.
2. **`components/HandoffPlatform.jsx`:**
   - Add `<section>: []` to `defaultProject` (~line 325).
   - Add `{ id: '<section>', label: '...' }` to the `sections` array (~line 426).
   - Add a stat card to the overview grid (~line 745) if appropriate.
   - Add the section UI block (search for `{/* Dev Notes Section */}` and insert above it).
   - If the file upload needs special handling (e.g. capture extension for `fileType`), extend `handleFileUpload`.
3. **`components/ClientHandoffPlatform.jsx`:**
   - Add to the `sections` array (~line 153).
   - Add a `case` to the `availableSections` filter switch (~line 165).
   - Add a stat card to the overview grid.
   - Add the read-only section UI block.
   - Add a folder block to `downloadAllAssets` (the ZIP builder, ~line 58).
4. **`app/admin/[project]/page.jsx`** — add the new key to the `saveProject` `data` map (line ~62). **This is the most-forgotten step.**

Then push to `main` and verify on Vercel.

---

## Styling Conventions

- All inline styles. No CSS files, no Tailwind, no styled-components.
- Color palette:
  - Charcoal text: `#2C2C2C`
  - Taupe accent: `#A89585`
  - Warm white background: `#F8F6F3`
  - Card cream: `#FAF9F7`
  - Border: `#E8E4DE`
  - Muted text: `#888`
- Fonts (loaded from Google Fonts in `app/layout.tsx`):
  - Headings / display: **Cormorant Garamond** (serif)
  - Body / UI: **DM Sans**
  - Code / mono: **DM Mono**
- Section headers are uppercase, 14px, letter-spaced, color `#A89585`.
- Cards have a 1px `#E8E4DE` border on white background.
- Buttons: 1px charcoal border, transparent bg, uppercase 11px DM Sans label.

---

## Local Dev

```bash
npm install
npm run dev
```

Runs at `http://localhost:3000`. Hot-reloads on save. The dev server uses the same Supabase project as production (because keys are hardcoded as fallbacks), so be careful — edits made locally will affect live data.

---

## Known Gotchas

- **Saves explicit field mapping** — see "Save / Load Flow" above. Always update `app/admin/[project]/page.jsx` when adding sections.
- **Hardcoded Supabase keys** — `lib/supabase.ts` has fallback values. Set env vars in Vercel for production isolation.
- **Section visibility** — client view hides empty sections via `availableSections` filter. The `case` for a new section must be added there or it'll always show (or never show).
- **Old projects** — predate newer sections. Always use optional chaining when reading from `project.<section>`.
- **File uploads on `npm run dev` go to production Supabase Storage.** Be mindful when testing.

---

## Recent Changes (changelog)

- **2026-05-04:** Added favicon (`app/icon.png`), referenced in `app/layout.tsx` metadata.
- **2026-05-04:** Added **Collateral** section (VIII) — accepts any file type for business cards, one-pagers, banners, etc. Includes admin editor, client view, and ZIP download integration.

---

## Conventions for Agents

- **Always push to `main` for the user to see changes.** Vercel deploys from `main`.
- **Never** commit production secrets or new env values without asking.
- **Never** modify Supabase schema or RLS policies without explicit approval.
- When adding sections, follow the Collateral pattern exactly.
- Preserve the inline-style, editorial aesthetic. No new CSS frameworks.
- Use optional chaining everywhere when reading from `project.data` to keep old projects working.
- For destructive actions (deletes, schema changes, force pushes), confirm with the user first.
