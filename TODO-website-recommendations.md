# DB Enhance — Website Recommendations Todos

Checklist from [DB Enhance - Website Recommendations & Required Updates.pdf](./DB%20Enhance%20-%20Website%20Recommendations%20%26%20Required%20Updates.pdf).

## Site-wide

- [x] Centralize locations + social URLs (`locations.ts`); Bangalore default
- [x] Header: clickable Bangalore contact number (top-right)
- [x] Remove broken header Search bar
- [x] Floating “Book an Appointment” button (all pages)
- [x] Floating WhatsApp icon → Bangalore WhatsApp chat (all pages)
- [x] Footer: Bangalore + Chennai location details (Bangalore first)
- [x] Footer: Instagram + Facebook + YouTube links
- [x] Footer: Copyright (keep existing)
- [x] Footer: Privacy Policy link → `/privacy`
- [x] Primary nav order: Home → About → Services → Gallery → Contact

## Follow-ups (not in this PDF pass)

- [ ] **Proper search**: restore working site search (fix LiveSearch URLs for pages + services, or dedicated search UI that never 404s)
- [ ] **City geo + city-specific content**: approximate visitor location, select Bangalore/Chennai, city switcher + cookie; abstract phones/WhatsApp/maps/copy/gallery/testimonials/SEO/booking defaults behind a city context

## Home

- [x] Hero mosaic: one image each for Hair Patch, Hair Extension, Nail Care, Bridal Make Up
- [x] Fix second mosaic “Loading...” / broken image URLs (incl. `nail-art` path)

## About

- [x] Dual-city “Who We Are” copy (Chennai + Bangalore)
- [x] About image area: 4-service collage (Hair Patch, Extension, Nail, Bridal)

## Services

- [x] Testimonials section (CMS collection; empty until assets uploaded)

## Gallery

- [x] Empty-state ready for CMS uploads (both cities / major services)
- [x] Gallery in primary nav

## Contact

- [x] Visit Us: DB Enhance – Bangalore + DB Enhance – Chennai
- [x] Clickable phones for both locations
- [x] Google Maps embeds for both locations (Bangalore first)

## Forms / email

- [x] Appointment form: Name, Mobile, Service dropdown, Message, Submit
- [x] On success → `/thankyou`
- [x] Email leads to `rekha.dbenhance@gmail.com` + `dbenhance.blr@gmail.com` (Resend)

## Privacy

- [x] Draft `/privacy` page for legal review

## Content / media (you)

- [ ] Upload gallery images (Hair Patch, Extension, Nail, Bridal, other; both cities)
- [ ] Upload testimonial videos/images
- [ ] Optionally replace mosaic/about collage with final photos
- [ ] Review/approve Privacy Policy text
- [ ] Provide `RESEND_API_KEY` (and verified from-address) for production emails — see [`apps/site/resend.env.example`](apps/site/resend.env.example)

## Secrets / deploy

- [ ] Set Resend secret in Wrangler / Cloudflare (`wrangler secret put RESEND_API_KEY`)
- [ ] Deploy and smoke-test chrome, form, contact, privacy, nav
