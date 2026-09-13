# DB Enhance — Website Recommendations Todos

Synced with [DB Enhance - Website Recommendations & Required Updates.pdf](./DB%20Enhance%20-%20Website%20Recommendations%20%26%20Required%20Updates.pdf) and `apps/site` as of **2026-09-13** (site work in [9e83347](https://github.com/MASTERAMARJEET/dbenhance/commit/9e83347)).

**Legend:** `[x]` done in repo · `[~]` partial / needs ops or CMS · `[ ]` not done

## Status snapshot

| Area | Code / UX | Content / ops |
| --- | --- | --- |
| Site-wide chrome | Done | — |
| Home | Done | Optional photo swaps |
| About | Done (layout + collage) | CMS “Who We Are” may still be placeholder in admin |
| Services | Testimonials UI ready | Upload testimonial media |
| Gallery | Empty state ready | Upload gallery items |
| Contact | Done | — |
| Booking + email | Done | Done |
| Privacy | Draft page | Legal review |

---

## Common (all pages) — PDF “Common Recommendations”

- [x] Clickable contact number (header, top-right) → `tel:` for **default city** (Bangalore) via `locations.ts`
- [x] Floating **Book an Appointment** on all pages (`AppointmentFloat.astro` in `Base.astro`)
- [x] Floating **WhatsApp** (bottom-right) → default city WhatsApp (`wa.me` for Bangalore)
- [x] Footer: **Bangalore + Chennai** addresses and phones (Bangalore first)
- [x] Footer: **Instagram**, **Facebook**, **YouTube** (`SOCIAL_LINKS` in `locations.ts`)
- [x] Footer: **Copyright** (`© {year} {siteTitle}`)
- [x] Footer: **Privacy Policy** → `/privacy`
- [x] Remove broken header **Search** bar (no search in `Base.astro`; PDF asked to remove, not fix)
- [x] Primary nav: **Home → About → Services → Gallery → Contact** (`seed/seed.json` menu `primary`)

---

## Booking form, thank-you, and lead email — PDF “Book an Appointment Form” / “Lead Submission”

- [x] Fields: Name, Mobile, Service (dropdown), Message, Submit
- [x] **Extra (not in PDF):** Preferred location dropdown (Bangalore / Chennai) on the form
- [x] Success redirect → `/thankyou`
- [x] POST `/api/book-appointment` sends email via Cloudflare **`EMAIL`** binding
- [x] Lead inboxes (PDF lists **both**):
  - [x] `dbenhance.blr@gmail.com` — `BOOKING_LEAD_EMAILS` + Wrangler allow-list
  - [x] `rekha.dbenhance@gmail.com` — `BOOKING_LEAD_EMAILS` + Wrangler allow-list

---

## 1. Home — PDF “Home Page” / “Home Page Images”

- [x] Hero mosaic: one image each for **Hair Patch**, **Hair Extension**, **Nail Care**, **Bridal Make Up** (`site-images.json` → `HERO_MOSAIC`)
- [x] Fix second mosaic “Loading…” / broken URLs (incl. hair extension via `DbIq3RrJIsY`, nail path)
- [x] Shared chrome (phone, book, WhatsApp, footer) via `Base.astro`

---

## 2. About — PDF “About Page” / “About Us Content” / “About Page Image”

- [x] About immediately after Home in nav
- [x] Dual-city story in **page hero + fallback body** when CMS page is empty (`about.astro`)
- [~] **Who We Are in CMS:** `seed/seed.json` `pages/about` is still generic placeholder — edit in prod/dev admin (or seed) so published content matches PDF; fallback copy is not used once CMS content exists
- [x] About image area: 4-service collage (`ABOUT_SERVICE_COLLAGE` / `site-images.json`)
- [x] Shared chrome via `Base.astro`

---

## 3. Services — PDF “Services Page” / “Testimonials”

- [x] Shared chrome via `Base.astro`
- [~] **Testimonials:** `testimonials` collection + grid on `/services` — section appears only when published entries exist (no empty-state block; add CMS entries to satisfy PDF)

---

## 4. Gallery — PDF “Gallery Page”

- [x] Gallery in primary nav → `/gallery`
- [x] Empty state when no `gallery_items` (“Coming soon” + Instagram CTA)
- [ ] **CMS:** populate gallery with Hair Patch, Extension, Nail, Bridal, other services; both cities where suitable (`gallery_items` collection)
- [x] Shared chrome via `Base.astro`

---

## 5. Contact — PDF “Contact Page” / “Visit Us” / maps

- [x] Two **Visit us** blocks: **DB Enhance – Bangalore** and **DB Enhance - Chennai** (headings from `locations.ts`)
- [x] Address lines, **clickable phones**, Maps links per location
- [x] **Google Maps embeds** for both (Bangalore first in `LOCATION_ORDER`)
- [x] Per-location WhatsApp links on contact cards
- [x] Shared chrome + footer per PDF “Common Elements”

---

## Privacy — PDF footer link

- [x] Draft `/privacy` for legal review (references booking email + `contact@dbenhance.com`)

---

## Follow-ups (not in PDF)

- [ ] **Proper search:** restore working site search (fix LiveSearch URLs for pages + services, or dedicated search UI that never 404s) — PDF explicitly removed header search only; sidebar widget remains in seed for future use
- [ ] **City geo + city-specific chrome:** approximate visitor location, Bangalore/Chennai switcher + cookie; default header phone / WhatsApp / hours / SEO from selected city (see `DEFAULT_CITY_ID` comment in `locations.ts`)

---

## Content / media (salon team)

- [ ] Upload **gallery** images (major services; both cities)
- [ ] Upload **testimonial** videos/images (`testimonials` collection)
- [ ] Optionally replace mosaic / about collage with final brand photos
- [ ] Review and approve **Privacy Policy** text
- [ ] Update **About** page body in EmDash admin (dual-city “Who We Are”)

---

## Cloudflare / deploy / smoke-test

- [x] **Email Sending:** domain onboarded; Worker binding + `BOOKING_FROM_EMAIL=bookings@dbenhance.com` in `wrangler.jsonc`
- [x] **Destination addresses (Email Routing):** `dbenhance.blr@gmail.com` and `rekha.dbenhance@gmail.com` verified
- [x] Set **`EMDASH_ENCRYPTION_KEY`** secret per environment (prod vs dev)
- [x] **Deploy** prod (`pnpm deploy:site:prod`)
- [x] **Smoke-test:** header phone, float book + form → thank-you + inbox, WhatsApp, contact maps, privacy link, nav order, gallery/testimonial sections when content exists

---

## Repo pointers (implemented)

| Concern | Location |
| --- | --- |
| Locations, social, booking emails | `apps/site/src/data/locations.ts` |
| Layout chrome | `apps/site/src/layouts/Base.astro` |
| Appointment UI + API | `apps/site/src/components/AppointmentFloat.astro`, `apps/site/src/pages/api/book-appointment.ts` |
| Hero / collage images | `apps/site/src/data/site-images.json`, `apps/site/src/utils/site-media.ts` |
| Email binding | `apps/site/wrangler.jsonc` (`send_email`, `BOOKING_FROM_EMAIL`) |
