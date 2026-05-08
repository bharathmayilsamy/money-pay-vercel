# Money Pay — Deployment Guide

## Quick Start (Vercel + Supabase — Free Tier)

### Step 1: Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free account)
2. Create a new project (note down your **Project URL** and **anon public key** from Settings → API)
3. Go to **SQL Editor** → **New Query**
4. Copy the entire contents of `supabase-schema.sql` and paste it → **Run**

### Step 2: Deploy to Vercel (free)

**Option A — GitHub (recommended):**
1. Push the `money-pay-vercel/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
4. Click **Deploy** — Vercel auto-detects Vite

**Option B — Vercel CLI:**
```bash
npm i -g vercel
cd money-pay-vercel
cp .env.example .env   # fill in your Supabase values
vercel --prod
```

### Step 3: Done!

Your app is live. Login credentials:
- **Admin**: any phone number → OTP `123456`
- **Tenants**: `9876543210`, `9988776655`, `9876543212` → OTP `123456`

---

## How Supabase sync works

- **No Supabase configured**: all data stays in browser localStorage (works offline, single device)
- **Supabase configured**: data loads from cloud on start; every change syncs automatically
- First launch seeds your demo data into Supabase; subsequent devices load from cloud

## Local development

```bash
cd money-pay-vercel
cp .env.example .env       # add your Supabase keys
npm install
npm run dev                # http://localhost:3000
```

## Build for production

```bash
npm run build              # outputs to dist/
```
The `dist/` folder is a static site — host anywhere (Netlify, GitHub Pages, Cloudflare Pages, S3).
