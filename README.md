# Guest List Manager

A Svelte 5 + Supabase app to manage house party guests, tag them for occasions, and send invites.

## Features

- **Guest Registry** — Add/edit/delete guests with name, email, phone, and family grouping
- **Occasion Tags** — Tag each guest for one or more occasions (e.g. "Son's Birthday", "Diwali")
- **Filter & Search** — Search guests by name/email/phone; filter by occasion
- **Send Invites** — Select guests tagged for an occasion and send email invitations
- **View Invited** — See who's been invited to what

## Tech Stack

- Svelte 5 (runes: `$state`, `$derived`, `$effect`)
- Supabase (PostgreSQL + realtime)
- Vercel deployment

## Setup

1. Create a Supabase project and run the SQL in `supabase/schema.sql`
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. `npm run dev`

## Env Vars

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

Connect to Vercel, set env vars, deploy.

## Default Occasions

- Son's Birthday (#FF6B6B)
- Diwali (#FFA500)
- Christmas (#2ECC71)
- Summer BBQ (#3498DB)
- Daughter's Birthday (#9B59B6)
