# 5th EZECON 2026 — Conference Website

Build a premium, production-ready conference website for the **5th East Zone Emergency Medicine Conference & 8th Bengal EM Conclave** organized by **SEMI West Bengal Chapter**.

## Conference Details (Extracted from Brochure)

| Detail | Value |
|--------|-------|
| **Full Name** | 5th EZECON 2026 — 5th East Zone Emergency Medicine Conference & 8th Bengal EM Conclave |
| **Dates** | 8–9 August 2026 (Saturday & Sunday) |
| **Venue** | AltAir Boutique Hotel, EM 4, EM Block, Sector V, Salt Lake City, Kolkata – 700091 |
| **Organizer** | Society for Emergency Medicine India (SEMI) — West Bengal Chapter |
| **Theme** | "Where Knowledge Meets Compassion!" |
| **Website** | www.ezeconsemi.com |
| **Emails** | semiezecon@gmail.com / semiwbchapter@gmail.com |
| **Key Contacts** | Dr Nishant Agarwal: 9836782161 · Dr Bodhisatwa Choudhuri: 9830636315 |
| **Expected Delegates** | 300+ |

---

## User Review Required

> [!IMPORTANT]
> **Google Sheets & Apps Script**: The registration system will store data in Google Sheets via Apps Script. You'll need to:
> 1. Create a new Google Sheet
> 2. Deploy the Apps Script as a Web App
> 3. Replace placeholder IDs in the code with your actual Sheet ID and Drive Folder ID

> [!IMPORTANT]
> **Payment Method**: The brochure doesn't specify an online payment gateway. This plan uses the **QR code + payment screenshot upload** approach (like SPICK PICU). If you prefer **Razorpay** (like Apollo), let me know.

> [!WARNING]
> **Committee Photos**: The brochure contains names but no photos. I'll use professional placeholder avatars. You'll need to replace them with real photos later.

## Open Questions

1. **Domain**: Will this be deployed to `www.ezeconsemi.com` or a different domain via GitHub Pages?
2. **Logo**: Do you have an EZECON/SEMI logo image file, or should I create a text-based logo?
3. **Payment QR Code**: Do you have a UPI QR code image for registration payments?
4. **Gala Dinner**: The brochure lists "Gala Dinner" as a separate ₹3,000 category — should this be a checkbox add-on during registration?
5. **Pre-conference Workshops**: The brochure mentions workshops but doesn't list specific workshop names/times. Should I create placeholder workshop entries?

---

## Proposed Changes

### Design System & Architecture

The website uses a **royal navy + gold + white** color scheme with glassmorphism, premium typography (Playfair Display + Inter), and smooth scroll animations. Architecture mirrors the Apollo/SPICK PICU pattern:
- Shared `nav.html` and `footer.html` loaded via `fetch()`
- Single `style.css` design system
- Single `script.js` for all shared logic
- Pages at root level, assets in `/assets/` subdirectories

---

### File Structure

```
d:\Personal\Dadas\ezecon\
├── index.html          # Homepage
├── about.html          # About the conference
├── committee.html      # Organizing & scientific committees
├── program.html        # Scientific program / schedule
├── speakers.html       # Featured speakers
├── register.html       # Registration form
├── dashboard.html      # Post-registration dashboard
├── login.html          # Login page
├── venue.html          # Venue & travel info
├── sponsors.html       # Sponsor tiers
├── contact.html        # Contact form & info
├── nav.html            # Shared navigation component
├── footer.html         # Shared footer component
├── style.css           # Complete design system
├── script.js           # All JavaScript functionality
├── code.gs             # Google Apps Script backend
├── DEPLOYMENT.md       # Deployment guide
└── assets/
    ├── images/         # Logos, speaker photos, venue images
    └── docs/           # Brochure PDF, etc.
```

---

### Core Infrastructure

#### [NEW] [style.css](file:///d:/Personal/Dadas/ezecon/style.css)
Complete CSS design system (~2500+ lines) featuring:
- **CSS Variables**: Royal navy (`#0B1F3A`), SEMI blue (`#1B4F72`), emergency red accent (`#C0392B`), gold (`#C8A951`), white, greys
- **Typography**: Playfair Display (headings) + Inter (body) via Google Fonts
- **Components**: Navbar (sticky + glassmorphism on scroll), hero section, cards, buttons, form controls, pricing table, timeline, speaker cards, accordion, modals, toast notifications
- **Animations**: Reveal-on-scroll, counter animations, hover effects, smooth transitions
- **Responsive**: Mobile-first breakpoints at 768px and 1024px
- **Dark/Light mode**: CSS custom properties toggle via JS

#### [NEW] [script.js](file:///d:/Personal/Dadas/ezecon/script.js)
Shared JavaScript (~800+ lines) including:
- Component loader (nav.html, footer.html via `fetch()`)
- Sticky navbar with scroll effect
- Mobile hamburger menu with overlay
- Active link highlighting
- Countdown timer (to Aug 8, 2026)
- Animated counters (IntersectionObserver)
- Scroll reveal animations
- Program tabs (day-wise switching)
- Speaker modal popups
- FAQ accordion
- Dark/light mode toggle (localStorage persisted)
- Back-to-top button
- Toast notification system
- Form validation utilities
- Registration pricing logic (early bird vs regular, category-based)
- Registration form submission to Google Apps Script
- Payment screenshot upload (base64)
- Login/logout with localStorage session
- Dashboard data population
- QR code generation (via quickchart.io API)
- WhatsApp contact button

#### [NEW] [nav.html](file:///d:/Personal/Dadas/ezecon/nav.html)
Shared navigation component:
- Fixed top navbar with glassmorphism
- Logo + conference name
- Links: Home, About, Committee, Speakers, Program, Register, Login
- "More" dropdown: Venue, Sponsors, Contact
- Mobile hamburger with slide-in menu + overlay
- Logout button (shown when logged in)
- Dark mode toggle button

#### [NEW] [footer.html](file:///d:/Personal/Dadas/ezecon/footer.html)
Shared footer:
- Conference secretariat info
- Quick links grid
- Contact details (Dr Nishant Agarwal, Dr Bodhisatwa Choudhuri)
- Email links
- Social media icons
- WhatsApp floating button
- Copyright notice
- "Managed by" credit line

---

### Pages

#### [NEW] [index.html](file:///d:/Personal/Dadas/ezecon/index.html) — Homepage
- **Hero Section**: Full-viewport with gradient overlay on emergency medicine background, conference title "5th EZECON 2026", tagline "Where Knowledge Meets Compassion!", date/venue, countdown timer, Register CTA + View Program button
- **About Preview**: Brief description, feature cards (National Faculty, Workshops, Poster Presentations, WBMC Credits)
- **Stats Counter**: 300+ Delegates, 50+ Speakers, 2 Days, 10+ Workshops (animated counters)
- **Speakers Preview**: 4-6 featured speaker cards with "View All" link
- **Program Highlights**: Key scientific topics in elegant cards
- **Sponsors Preview**: Logo carousel/grid
- **Contact Preview**: Secretariat info with CTA

#### [NEW] [about.html](file:///d:/Personal/Dadas/ezecon/about.html) — About
- Page banner with breadcrumb
- About EZECON — conference history & mission
- About SEMI West Bengal Chapter
- Theme section: "Where Knowledge Meets Compassion!"
- Scientific scope cards: Resuscitation & Acute Care, System-Based Emergencies, Trauma & Procedural Care, Special Population Emergencies
- Objectives list
- Key highlights with icons

#### [NEW] [committee.html](file:///d:/Personal/Dadas/ezecon/committee.html) — Committee
- Page banner
- **Patrons**: Dr Shree Sowjanya Patibandla, Dr T. S. Srinath Kumar, Dr Ramyajit Lahiri, Dr Sudip Chakraborty
- **Organizing Committee**: Dr Kumar Raj (Chairman), Dr Bodhisatwa Choudhuri (Co-Chairman), Dr Nishant Agarwal (Secretary), Dr Purusatyam Chakraborty (Jt. Secretary), Dr Sudip Banerjee (Treasurer)
- **Sub-Committees**: Workshop, Scientific, Finance & Sponsorship, Poster, Quiz, Registration & Hospitality
- **Co-opted Members**: Dr Anindya Dasgupta, Dr Aparajita Mitra, Dr Mainak Majumdar, Dr Smita Maitra, Dr Sujoy Das Thakur, Dr Subham Saha
- Each member in a premium card with placeholder photo, name, designation

#### [NEW] [program.html](file:///d:/Personal/Dadas/ezecon/program.html) — Scientific Program
- Page banner
- Day tabs: "Day 1 — 8th August" / "Day 2 — 9th August"
- Timeline-style schedule with glassmorphism cards
- Topics grouped by theme: Resuscitation, Cardiac, Respiratory, Renal, GI, Neuro, Endocrine, Trauma, Pediatric, Geriatric, Obstetric, Environmental, Toxicology
- Placeholder time slots and session details
- Workshop schedule section
- Downloadable program PDF link

#### [NEW] [speakers.html](file:///d:/Personal/Dadas/ezecon/speakers.html) — Speakers / Faculty
- Page banner
- Filter tabs: All, National, International, Workshop Faculty
- Speaker cards grid with: photo, name, specialty, institution
- Modal popup on click: detailed bio, session details
- Placeholder speakers based on committee members + generic national faculty entries

#### [NEW] [register.html](file:///d:/Personal/Dadas/ezecon/register.html) — Registration
**Closely modeled on Apollo + SPICK PICU registration flow:**
- Page banner
- **Pricing Table**: 
  | Category | Early Bird (Till 30 June) | Regular (1 July+) |
  |----------|--------------------------|-------------------|
  | SEMI Member | ₹2,000 | ₹2,500 |
  | Non-SEMI Member | ₹2,500 | ₹3,000 |
  | Gala Dinner (Add-on) | ₹3,000 | ₹3,000 |
- **Registration Form** (card-based sections like SPICK PICU):
  - Personal Details: First Name, Last Name, Email, Phone, Institution, Designation, City
  - Create Password
  - Registration Type: SEMI Member / Non-SEMI Member
  - Gala Dinner checkbox add-on
  - Workshop selection (optional)
  - Food preference
  - Dynamic price display with early bird detection
- **Payment Section**: QR code display, payment screenshot upload
- **Submit**: Sends to Google Apps Script, shows success toast, redirects to login

#### [NEW] [login.html](file:///d:/Personal/Dadas/ezecon/login.html) — Login
- Elegant centered login card
- Email + password fields
- Login button → validates against Google Sheet
- "Register first" link
- Session stored in localStorage

#### [NEW] [dashboard.html](file:///d:/Personal/Dadas/ezecon/dashboard.html) — Dashboard
- Auth guard (redirect to login if no session)
- Welcome banner with user name
- Stats cards: Name/Type, Email, Conference Dates, Venue
- Registration details: ID, type, payment status
- QR code display (generated via API)
- Download confirmation slip button
- Abstract upload section (drag & drop)
- Uploaded files list
- Conference info quick-links
- Logout button

#### [NEW] [venue.html](file:///d:/Personal/Dadas/ezecon/venue.html) — Venue
- Page banner
- Venue hero: AltAir Boutique Hotel details with image
- Google Maps embed (Salt Lake Sector V location)
- Travel information cards:
  - By Air: NSCBI Airport – 11.5 km (~25 min)
  - By Train: Sealdah – 8.5 km (~30 min), Howrah – 12 km (~45 min)
  - By Road: Buses, taxis, app-based cabs
- Nearby hotels section
- Local attractions

#### [NEW] [sponsors.html](file:///d:/Personal/Dadas/ezecon/sponsors.html) — Sponsors
- Page banner
- Sponsor tiers: Platinum, Gold, Silver, Bronze (with placeholder logos)
- Sponsorship packages / benefits table
- "Become a Sponsor" CTA with contact info
- Partnership inquiry form

#### [NEW] [contact.html](file:///d:/Personal/Dadas/ezecon/contact.html) — Contact
- Page banner
- Contact form (Name, Email, Subject, Message) → Google Apps Script
- Organizer cards: Dr Nishant Agarwal (Secretary), Dr Bodhisatwa Choudhuri (Co-Chairman)
- Email links: semiezecon@gmail.com, semiwbchapter@gmail.com
- Social media links
- Google Maps embed
- FAQ accordion section

---

### Backend

#### [NEW] [code.gs](file:///d:/Personal/Dadas/ezecon/code.gs) — Google Apps Script
Modeled on the SPICK PICU `code.gs`:
- `doPost()` router: register, login, uploadAbstract, getMyFiles, contact
- `registerUser()`: Duplicate email check, serial number generation (EZ-1001, EZ-1002...), payment screenshot upload to Drive, QR code generation & save, sheet append, confirmation email
- `loginUser()`: Email + password match against sheet
- `uploadAbstract()`: File upload to Drive, log to Abstracts sheet
- `getMyFiles()`: Return user's uploaded files
- `sendConfirmationEmail()`: HTML email with QR code inline image + attachment
- `sendFailureEmail()`: Error notification to admin
- Sheet structure: Serial No, First Name, Last Name, Email, Phone, Institution, Designation, City, Password, Member Type, Gala Dinner, Workshop, Food, Amount, Payment Screenshot URL, QR Code URL, Timestamp

#### [NEW] [DEPLOYMENT.md](file:///d:/Personal/Dadas/ezecon/DEPLOYMENT.md) — Deployment Guide
- Google Sheets setup instructions
- Apps Script deployment steps
- GitHub Pages deployment
- CNAME setup for custom domain
- Configuration checklist

---

## Verification Plan

### Automated Tests
1. Open `index.html` in browser — verify hero, countdown, animations, responsive layout
2. Navigate all pages via navbar — verify links, active states, component loading
3. Test mobile responsive design at 375px, 768px, 1024px viewports
4. Test registration form validation (empty fields, invalid email, missing screenshot)
5. Test dark/light mode toggle and persistence
6. Verify countdown timer accuracy
7. Test FAQ accordion open/close behavior

### Manual Verification
1. **Registration Flow**: Fill form → upload screenshot → submit → verify success toast → login → verify dashboard shows correct data
2. **Google Sheets**: After deploying Apps Script, verify registration data appears in sheet with correct columns
3. **Email**: Verify confirmation email is sent with QR code
4. **Cross-browser**: Test in Chrome, Firefox, Edge
5. **Performance**: Verify page load under 3 seconds on standard connection
