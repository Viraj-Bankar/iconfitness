# ICON FITNESS — Modern Minimal Fitness Website (Dark Edition)

A modern, high-performance, responsive commercial web application for **ICON FITNESS**, located on Dehu – Alandi Road, Moshi Gaon, Moshi, Pimpri-Chinchwad, Maharashtra.

---

## Brand Identity & Creative Direction

- **Visual Direction**: Modern Minimal Fitness — Dark Edition
- **Palette**:
  - Primary Black (`#080808`)
  - Charcoal (`#171717`)
  - Deep Charcoal (`#222222`)
  - Fitness Red (`#ED101B`) & Dark Red (`#B9000B`)
  - Pure White (`#FFFFFF`)
  - Muted Grey (`#A1A1A1`) & Border Grey (`#303030`)
- **Typography**: Anton, Bebas Neue, Oswald, and Inter
- **Official Mascot**: Preserved original muscular bodybuilder mascot with ribbons and brand wordmark.
- **Slogans**:
  - *TRAIN HARD. STAY STRONG. BE ICONIC.*
  - *STRONG TODAY. STRONGER TOMORROW.*
  - *YOUR FITNESS. OUR PASSION.*
  - *DISCIPLINE TODAY. SUCCESS TOMORROW.*
  - *TRANSFORM YOURSELF.*

---

## Core Features

1. **WhatsApp-Only Direct Enquiry Engine**:
   - Official Business Number: `+91 9637545941` (`919637545941`).
   - Modal and footer forms with interest selection and auto-populated membership rate cards.
   - 100% email-free client direct messaging.
2. **Owner Gallery Management Portal (`/admin/gallery`)**:
   - Private, mobile-friendly owner portal with Supabase Authentication (`/admin/login`).
   - Direct image/video uploads to Supabase Storage bucket (`gym-gallery`).
   - Draft and live status control with one-click "PUBLISH TO WEBSITE".
   - Caption editing and item deletion.
3. **Customer Review System & Moderation**:
   - Public review submission with rate-limiting and spam protection.
   - Dual-source reviews: Verified Google Business Profile rating and authentic website reviews.
   - Protected owner moderation modal to approve, reject, or delete submitted reviews.
4. **Hardened Security & Database RLS**:
   - Supabase Row Level Security (RLS) on `public.gallery_items`, `public.reviews`, and `storage.objects`.
   - Server-controlled authorization (`isAuthorizedOwner`) validating against official owner allowlist or `app_metadata`.
   - Never trusts client-editable `user_metadata`.

---

## Official Membership Pricing (Poster Rates)

- **Plan 01 — Monthly**: 1 Month | ₹1,200
- **Plan 02 — Quarterly**: 3 Months | ₹3,000
- **Plan 03 — Half Yearly**: 6 Months | ₹5,500
- **Plan 04 — Yearly**: 1 Year | ₹8,000 *(Best Value Plan)*
- **Plan 05 — Couple Membership**: 3 Months | ₹4,500 *(Special Couple Discount for 2 Persons)*
- **Offers**: Group Discount Available & Personal Training Guidance

---

## 6 Fitness Facilities

1. **Strength Training**: Commercial free-weights, Olympic barbells, plate-loaded stations, and turf lane with battle ropes.
2. **Zumba**: Group dance fitness with high-energy movement.
3. **Yoga**: Mobility, flexibility, and core stability.
4. **Steam Bath**: Post-workout therapeutic relaxation suite.
5. **Personal Training**: Dedicated 1-on-1 coaching and technique correction.
6. **Cardio Training**: Commercial treadmills, cross-trainers, and spin bikes.

---

## Operating Hours & Contact Information

- **Timings**:
  - Morning Session: **5:30 AM - 11 AM**
  - Evening Session: **5:00 PM – 10:00 PM**
- **Address**: Dehu – Alandi Road, Moshi Gaon, Moshi, Pimpri-Chinchwad, Maharashtra – 412105.
- **Plus Code**: MVHC+8R, Pimpri-Chinchwad, Maharashtra
- **Phone Numbers**:
  - +91 9637545941
  - +91 8669022902
- **Instagram**: [@icon_fitness77](https://www.instagram.com/icon_fitness77/)

---

## Tech Stack

- **React 19** + **Vite 8**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Database, Storage)
- **Framer Motion**
- **Lucide React**

---

## Production Deployment Guide (e.g. Vercel)

### 1. Database Setup (Supabase)
Execute the SQL migrations in the Supabase SQL Editor:
1. `supabase/migrations/20261112000000_create_reviews_table.sql`
2. `supabase/migrations/20261112010000_create_gallery_and_storage.sql`
3. `supabase/migrations/20261112020000_harden_owner_rls_and_storage.sql`

### 2. Environment Variables Configuration
Set the following environment variables in your hosting provider (e.g. Vercel Dashboard -> Project Settings -> Environment Variables):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (`https://your-project.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |
| `VITE_OWNER_EMAIL` | Official gym owner email (e.g. `owner@iconfitness.com`) |
| `VITE_GOOGLE_PLACE_ID` | Optional Google Place ID for Moshi location |
| `VITE_GOOGLE_WRITE_REVIEW_URL` | Direct Google review submission link |

### 3. Vercel SPA Routing
The repository includes `vercel.json` with rewrite rules (`/(.*)` -> `/index.html`) to ensure deep routing for `/admin/login` and `/admin/gallery` works cleanly.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run production build
npm run build

# Preview build locally
npm run preview
```

---

## License

© 2026 ICON FITNESS. All Rights Reserved.
