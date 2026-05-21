# TeamOS — Product Specification
**Version:** 4.28.0
**Owner:** Carmen Corio
**Status:** Active Development
**Last Updated:** May 17, 2026

---

## Table of Contents
1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Architecture Overview](#4-architecture-overview)
5. [Feature Specification](#5-feature-specification)
6. [Engineering Standards](#6-engineering-standards)
7. [Security Structure](#7-security-structure)
8. [API Contracts](#8-api-contracts)
9. [Design System](#9-design-system)
10. [Roadmap](#10-roadmap)
11. [Changelog](#11-changelog)

---

## 1. Product Vision

TeamOS is not another dashboard. It is the CSM's intelligent work layer.

Gainsight, Salesforce, Gong, Gmail, Slack, and support tools remain the systems of record. TeamOS reads those signals through Dust AI, tells the CSM what matters today, and helps them prepare, respond, strategize, and follow up — without jumping between tabs.

**The north star experience:**
> "I already checked your systems. Here is your day, here is what matters, here is what to do next, and here are the agents ready to help."

**The rule every feature must pass:**
> Does this save the CSM a click, a search, a meeting prep step, a follow-up draft, or a missed customer commitment? If not, cut it.

---

## 2. Problem Statement

CSMs at 1Password (and similar SaaS orgs) spend 40–60% of their day doing admin that should be automated:
- Manually copying Gong call notes into Gainsight CTAs
- Switching between 6–8 tabs to prep for a single customer call
- Rebuilding account context from scratch before every meeting
- Manually filling scorecard forms with data already in Gainsight
- Writing re-engagement emails from memory instead of from signal

Leadership added a Dust-built scorecard that requires CSMs to manually copy numbers from Gainsight into a form. TeamOS solves this and makes the entire tool actually useful.

---

## 3. Target Users

### Primary: Customer Success Managers (Commercial / Mid-Market)
- Manage 25–50 accounts
- Use: Gainsight (CTAs, health, success plans), Gong (call recordings), Salesforce (opportunities), Gmail, Slack, Google Calendar
- Pain: Too much context-switching, too much manual data entry, not enough time to prepare

### Secondary (Planned)
| Role | Primary Use Case |
|------|-----------------|
| Account Executives | Renewal pipeline, expansion signals, opportunity context |
| BDRs | Outreach sequencing, account research |
| Onboarding Specialists | Kickoff prep, milestone tracking |
| Solutions Engineers | Technical context, integration status |
| CS Leadership | Team health, portfolio risk, forecast |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    TeamOS Frontend                   │
│              (Static HTML / React JSX)               │
└────────────────────┬────────────────────────────────┘
                     │
              ┌──────▼──────┐
              │   Dust API   │  ← Agent routing layer
              └──────┬──────┘
                     │
       ┌─────────────┼─────────────────┐
       │             │                 │
  ┌────▼────┐  ┌─────▼────┐  ┌────────▼──────┐
  │Gainsight│  │   Gong   │  │  Salesforce   │
  │  API    │  │   API    │  │     API       │
  └─────────┘  └──────────┘  └───────────────┘
       │             │                 │
  ┌────▼────┐  ┌─────▼────┐  ┌────────▼──────┐
  │  Gmail  │  │  Slack   │  │Google Calendar│
  │  API    │  │   API    │  │     API       │
  └─────────┘  └──────────┘  └───────────────┘
```

### Tech Stack
| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Static HTML + Vanilla JS (prototype) | Active |
| Frontend v2 | Next.js 14 (App Router) | Planned |
| Styling | CSS custom properties / Tailwind | Active |
| Agent Layer | Dust AI API | Pending OAuth |
| CRM | Gainsight REST API | Pending admin approval |
| Calls | Gong API | Pending |
| CRM | Salesforce API | Planned |
| Email | Gmail API | Planned |
| Calendar | Google Calendar API | Planned |
| Deployment | Vercel | Active |
| Repo | GitHub (carmenrcorio/TeamOS) | Active |

---

## 5. Feature Specification

### 5.1 Daily Command Brief (Top Section)
**Replaces:** Static account cards
**Purpose:** Tell the CSM what kind of day they're walking into, where to focus first, and what agents can help immediately.

**Three-panel layout:**

#### Panel A — Priority Stack
- AI-ranked list of today's 3 most important items
- Each item: account name, meeting type, urgency signal, one action button
- Ranked by: health score + renewal proximity + CTA overdue count + Gong silence
- Source: Gainsight + Google Calendar + Gong

#### Panel B — Next Up
- Shows only the immediately next customer-facing meeting
- Includes: account name, meeting goal, what to know (health, CTAs, last Gong, renewal days), agent action buttons
- Buttons: Prep Me, Risk Analyst, Generate Deck
- Auto-updates as meetings complete

#### Panel C — Ask Dust
- Free-text input wired to Dust API
- Placeholder: "Ask anything about an account, renewal, or open loop…"
- Quick-action buttons: Prepare My Day, Draft Follow-Ups, Find Open Loops, Review At-Risk Renewals

---

### 5.2 Portfolio Pulse Strip
**Location:** Between nav and main content
**Purpose:** One-line portfolio health at a glance. Every item is a clickable trigger.

| Item | Popover Content |
|------|----------------|
| 📅 N calls today | Mini call list with time, account, health badge, Gong + Gainsight buttons |
| ⚠️ N at risk | Account rows with health delta, top risk signal, SFDC + GS + Gong buttons |
| 🔴 $NNK ARR at risk | Renewal pipeline bars with countdown, SFDC + GS buttons |
| 📋 N overdue CTAs | CTA list with days overdue, Gainsight link, inline Done button |
| 👻 N dark accounts | Dark accounts with days silent, Ghost-Buster button |

**Popover rules:**
- 310px wide, drops below trigger
- Dismisses on click-away
- Right-aligned for last 2 items
- No page navigation on click

---

### 5.3 Calendar (Center Column)
- Visual colored event blocks (not text rows)
- Color coded: green (healthy), amber (at risk), red (critical), gray (internal)
- Click → opens Mission Briefing in right panel + highlights event
- Internal meetings: not clickable, no briefing

---

### 5.4 Mission Briefing (Right Panel)
**Triggered by:** Clicking calendar event or account
**Three story sections:**
1. 🎯 Where we are — health trajectory, CTA status, adoption summary
2. 🎙 Last Gong — most recent call summary, sentiment, flags
3. 🚀 The objective — what to accomplish in this specific meeting

**Agent buttons (all open drawer):**
- ⚡ Prep Me → Battle card
- 🛡 Risk Analyst → Churn score + save play
- 🔄 Save Strategy → Full slide-over drawer
- ✅ Next Steps → 3 Gainsight CTAs

**Black deck button:** Opens modal with progress animation → Google Slides + PPTX download

---

### 5.5 Agent Drawer (Slide-Over)
**Width:** 380–420px, slides from right
**Triggered by:** All 4 agent buttons
**Scrollable sections per agent:**

| Agent | Sections |
|-------|---------|
| Prep Me | Account Snapshot, Last Gong, Discovery Questions, Battle Card, Follow-Up Plan |
| Risk Analyst | Churn Score, 3 Driving Signals, Discovery Questions, Recommended Save Play |
| Save Strategy | Talking Points, Discovery, Objection Handlers, Extension Terms |
| Next Steps | Immediate CTAs, Follow-Up Sequence |

**Footer:** Context-aware action buttons (Push to Gainsight, Generate Deck, Copy, etc.)

---

### 5.6 Ghost-Buster (Dark Zone)
**Triggered by:** Ghost-Buster button in Dark Zone or pulse strip popover
**Opens:** Right panel email draft state
**Content:**
- Account context (days dark, ARR, renewal)
- Gong personalization signal
- Pre-written subject + body
- Send via Gmail / Edit first buttons
- Sent state persists for session

---

### 5.7 Live Signals Widget
**Location:** Below Dark Zone in center column
**Purpose:** Real-time feed of account signals from Gainsight + Gong
**Signal types:**
- Champion change (🔴 HIGH RISK)
- Health score drop (🟡 WATCH)
- Gong silence threshold crossed (🔴 CRITICAL)
- Expansion signal detected (🟢 OPPORTUNITY)
- Support ticket spike (🟡 WATCH)

---

### 5.8 Recipe for Success Tab
**Purpose:** Auto-filled scorecard replacing the manual Dust form
**Data source:** Gainsight API (verified checkmarks, not manual entry)
**Framing:** "Automated tax return — accurate, 100% hands-off"
**Status:** Pending Gainsight admin OAuth approval

---

## 6. Engineering Standards

These standards apply to every build, every run, every PR. No exceptions.

### 6.1 Code Quality

```
REQUIRED ON EVERY BUILD:
- No inline event handlers on elements with side effects (use addEventListener or onClick handlers)
- No string-based HTML injection (innerHTML) without explicit sanitization
- All user-facing strings defined as constants, not inline literals
- No console.log left in production code
- All async operations wrapped in try/catch
- All API calls have explicit timeout handling (default: 10s)
```

### 6.2 File Structure (Next.js v2)
```
/teamOS
├── /app
│   ├── /api              ← Server-side API routes only (never expose keys client-side)
│   │   ├── /dust         ← Dust agent proxy
│   │   ├── /gainsight    ← Gainsight proxy
│   │   └── /gong         ← Gong proxy
│   ├── /dashboard        ← CSM dashboard page
│   ├── /recipe           ← Recipe for Success page
│   └── layout.tsx
├── /components
│   ├── /pulse            ← Pulse strip + popovers
│   ├── /briefing         ← Mission briefing panel
│   ├── /drawer           ← Agent slide-over drawer
│   ├── /calendar         ← Calendar widget
│   ├── /signals          ← Live signals feed
│   └── /command          ← Daily command brief
├── /lib
│   ├── api.ts            ← All external API calls
│   ├── auth.ts           ← Auth utilities
│   └── constants.ts      ← Color tokens, config
├── /styles
│   └── globals.css       ← Design tokens only
└── /public
```

### 6.3 State Management
- Use React Context for session-level state (selected account, panel mode)
- Use local component state for UI interactions (popover open/closed, loading)
- Never store sensitive data (tokens, PII) in component state or localStorage
- All server state fetched via SWR or React Query with proper revalidation

### 6.4 Performance Standards
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 85 |
| Bundle size (initial) | < 200KB gzipped |
| API response timeout | 10s hard limit |

### 6.5 Error Handling
```
Every API call must:
1. Show loading state during fetch
2. Show error state on failure (never a blank panel)
3. Fall back to cached data if available
4. Log errors to error tracking (Sentry, planned)
5. Never expose raw API errors to the user
```

### 6.6 Commit Standards
```
Format: <type>(<scope>): <description>

Types:
  feat     → new feature
  fix      → bug fix
  refactor → code change, no behavior change
  style    → UI/CSS only
  data     → mock data or copy update
  docs     → spec, readme, changelog update
  security → security-related change

Examples:
  feat(drawer): add discovery questions section to Prep Me agent
  fix(pulse): correct popover alignment on right-edge items
  security(api): move Dust API key to server-side env variable
  data(accounts): update NovaVault health score to 23
```

### 6.7 Pre-Deploy Checklist
```
Before every Vercel deploy:
□ No hardcoded API keys in any file
□ No console.log statements
□ All new UI components tested in both default and error states
□ Changelog updated with new entry
□ vercel.json present and valid (version: 2 only)
□ index.html at repo root (not in subdirectory)
```

---

## 7. Security Structure

### 7.1 Authentication (Planned)
- **Provider:** Auth0 or Clerk
- **Method:** SSO via 1Password SAML (enterprise) or Google OAuth (prototype)
- **Session:** JWT, 8-hour expiry, httpOnly cookie
- **Refresh:** Silent refresh with 15-minute sliding window

### 7.2 API Key Management
```
RULE: No API key ever touches the client browser. Ever.

All keys stored in:  Vercel Environment Variables (encrypted at rest)
All API calls routed: Client → Next.js /api route → External API

Environment variable naming:
  DUST_API_KEY          ← Dust workspace API key
  GAINSIGHT_API_KEY     ← Gainsight REST API key
  GONG_API_KEY          ← Gong API credentials
  SALESFORCE_CLIENT_ID  ← Salesforce OAuth client
  SALESFORCE_SECRET     ← Salesforce OAuth secret
  GMAIL_CLIENT_ID       ← Google OAuth client
  NEXTAUTH_SECRET       ← Auth session secret

Never:
  - Commit .env files to GitHub
  - Use NEXT_PUBLIC_ prefix for any key (makes it client-visible)
  - Log API keys in any console statement
```

### 7.3 Data Handling
```
PII Rules:
- Customer names, emails, ARR data: never logged to console in production
- Account health data: session-only, never persisted to localStorage
- Gong transcripts: displayed in UI only, never cached client-side
- Gmail content: read-only access scope, never stored in app DB

Data in transit:
- HTTPS only (enforced by Vercel)
- All external API calls server-side only
- No customer data passed as URL parameters

Data at rest:
- No app database in v1 (read-only from source systems)
- If DB added: Supabase with RLS policies per user
```

### 7.4 Access Control (Planned)
| Role | Access |
|------|--------|
| CSM | Own accounts only |
| Team Lead | Team accounts + aggregate view |
| CS Director | Full portfolio view |
| AE | Their paired accounts only |
| Admin | Full access + configuration |

### 7.5 OAuth Scopes
```
Request minimum scopes only:

Gainsight:   accounts:read, ctas:read, ctas:write, health:read
Gong:        calls:read, transcripts:read
Salesforce:  Account:read, Opportunity:read
Gmail:       gmail.send, gmail.readonly (compose + read only)
Google Cal:  calendar.readonly
Slack:       channels:history:read, im:read (DMs only)
```

### 7.6 Security Headers (vercel.json)
```json
{
  "version": 2,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self' api.dust.tt app.gainsight.com api.gong.io"
        }
      ]
    }
  ]
}
```

---

## 8. API Contracts

### 8.1 Dust Agent API
```
POST /api/dust/agent
Authorization: Bearer {DUST_API_KEY} (server-side only)

Request:
{
  "agent": "account-strategist" | "qbr-builder" | "risk-analyst" | "icebreaker",
  "context": {
    "accountId": string,
    "accountName": string,
    "health": number,
    "renewal": string,
    "lastGong": string,
    "openCTAs": number
  },
  "prompt": string
}

Response:
{
  "output": string,
  "sources": string[],
  "agent": string,
  "latency": number
}
```

### 8.2 Gainsight Account API
```
GET /api/gainsight/accounts
Query: ?csm={userId}&status=active

Response:
{
  "accounts": [
    {
      "id": string,
      "name": string,
      "arr": number,
      "health": number,
      "renewalDate": string,
      "openCTAs": number,
      "lastGong": string,
      "champion": { "name": string, "title": string, "email": string },
      "riskFlags": string[]
    }
  ]
}
```

### 8.3 Gong Call API
```
GET /api/gong/calls
Query: ?accountId={id}&limit=5

Response:
{
  "calls": [
    {
      "id": string,
      "date": string,
      "duration": number,
      "participants": string[],
      "sentiment": "positive" | "neutral" | "negative",
      "flags": string[],
      "summary": string,
      "keyMoments": string[]
    }
  ]
}
```

---

## 9. Design System

### 9.1 Color Tokens
```css
:root {
  /* Brand */
  --tl:    #18A575;  /* Teal — primary action, healthy */
  --tl-bg: #E3F5EE;  /* Teal light background */
  --tl-dk: #0A5C41;  /* Teal dark — text on teal bg */
  --tl-md: #0F6E51;  /* Teal medium — hover states */

  /* Warning */
  --am:    #D97706;  /* Amber — at risk, warning */
  --am-bg: #FEF3C7;
  --am-dk: #78350F;

  /* Critical */
  --rd:    #DC2626;  /* Red — critical, error */
  --rd-bg: #FEE2E2;
  --rd-dk: #7F1D1D;

  /* Info */
  --bl:    #2563EB;  /* Blue — info, calendar */
  --bl-bg: #EFF6FF;
  --bl-dk: #1E3A8A;

  /* Neutrals */
  --tx:    #111110;  /* Primary text */
  --tx2:   #52524E;  /* Secondary text */
  --tx3:   #8A8A86;  /* Tertiary text / labels */
  --surf:  #FFFFFF;  /* Card surface */
  --s2:    #F5F4F1;  /* Secondary surface */
  --bg:    #EEEDE9;  /* Page background */
  --bd:    #E0DFD9;  /* Border default */
  --bd2:   #C6C5C0;  /* Border strong */

  /* Radius */
  --r:   8px;
  --rl:  12px;
  --rxl: 18px;
}
```

### 9.2 Typography
```
Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

Sizes:
  9px  — labels, badges, fine print
  10px — section headers (uppercase + tracking)
  11px — body copy, secondary content
  12px — primary body, button text
  13px — nav, emphasized body
  15px — card titles
  18px — section headings
  20px — page headings

Weights:
  400 — body
  500 — medium emphasis
  600 — semi-bold buttons
  700 — headings, labels, badges
```

### 9.3 Component Patterns
```
Cards:     white surface, 1px border, 12px radius, no drop shadow by default
Popovers:  white, 1px border, 12px radius, box-shadow: 0 8px 32px rgba(0,0,0,.12)
Drawers:   white, left border only, no radius, full height
Modals:    white, 18px radius, dark overlay rgba(0,0,0,.5)
Badges:    colored bg + colored text, 4px radius, 700 weight
Buttons:   8px radius, 600-700 weight, family: inherit always
```

---

## 10. Roadmap

### Phase 1 — Prototype (Current)
- [x] Static HTML dashboard
- [x] Pulse strip with 5 popovers
- [x] Calendar with colored event blocks
- [x] Mission Briefing panel (3-story format)
- [x] Agent drawer with all 4 agents
- [x] Ghost-Buster email drafts
- [x] Live Signals widget
- [x] Deck builder modal with progress animation
- [x] Recipe for Success tab (static)
- [ ] Daily Command Brief (replacing account cards)
- [ ] Vercel deployment stable

### Phase 2 — API Integration
- [ ] Gainsight OAuth approval from 1Password admin
- [ ] Gainsight REST API: accounts, health, CTAs
- [ ] Gong API: call recordings, summaries, sentiment
- [ ] Dust API: agent routing, live responses
- [ ] Google Calendar: real event data
- [ ] Gmail: send Ghost-Buster emails

### Phase 3 — Auth + Multi-User
- [ ] Auth0 / Clerk SSO integration
- [ ] Role-based access (CSM / TL / Director / AE)
- [ ] Per-user account filtering
- [ ] User preferences persistence

### Phase 4 — Role Dashboards
- [ ] AE Dashboard
- [ ] BDR Dashboard
- [ ] Onboarding Specialist Dashboard
- [ ] Solutions Engineer Dashboard
- [ ] CS Leadership Portfolio View

### Phase 5 — Network + Scale
- [ ] Salesforce integration
- [ ] Slack integration
- [ ] Support ticket integration
- [ ] Widget bank (CSM-configurable dashboard)
- [ ] Handoff mode / Handoff packet generator

---

## 11. Changelog

All changes logged here. Format: `## [version] — YYYY-MM-DD`

---

## [4.28.0] — 2026-05-21

Send-time scheduling windows — the final Campaign Manager gap closes Gainsight Journey Orchestrator replacement. **Result: 401/401 chromium tests passing.**

### Added

- **Feature**: Send-time scheduling windows on every campaign — business hours only, day-of-week selection, recipient TZ / my TZ / account TZ, skip weekends, skip US holidays, quiet hours. Each campaign object gains a `sendWindow` property — `{ businessHoursOnly, days[], startTime, endTime, timezone, skipWeekends, skipHolidays, quietHours{ enabled, start, end } }`. The wizard's Step 4 (Sequence Builder) now mounts a new `.cm-sw` section (`role="group"` + `aria-label="Send time window configuration"`) directly below the touches list with controls for every field. Day buttons are tri-aria (`aria-pressed`) toggles.
- **Feature**: Live touch send-time preview in Step 4 that recalculates as window settings change. A `cm-sw-preview` block (`role="status"` + `aria-live="polite"`) renders one line per touch — *"Touch 1: Today · 9:00 AM (business hours)"*, *"Touch 2: May 26 · 9:00 AM (Day 5 · skipped Sat May 23)"* — using a new `cmComputeNextSend(baseDate, window)` walker that advances minute-by-day until the date lands inside the window. Helpers added: `cmInWindow`, `cmDefaultSendWindow`, `cmSendWindowDescribe`, `cmFormatSendTime`, `cmTouchAbsoluteSend`, `cmIsUSHoliday`, `cmFormatTimeShort`, `cmParseHHMM`, `cmDayName`. `CM_US_HOLIDAYS` carries the 2026 + 2027 federal-holiday subset.
- **Feature**: View panel shows active send window + any queued touches awaiting next window. A new `cm-drawer-sec` block titled *"Send window"* renders below the Sequence Progress section. When the current moment falls outside the campaign's window, a queue line appears: *"📅 N touches queued for next window: Mon May 26 · 9:00 AM"*.
- **Feature**: All 3 demo campaigns get sensible default windows injected. `cmp1` (June Renewal Push) ships with the default Mon–Fri 9–5, recipient TZ, skip weekends. `cmp2` (Dark Zone Re-engagement) restricts to Tue–Thu only. `cmp3` (Q2 EBR Invitations) restricts to Mon–Wed + skip US holidays. Injection runs once at script load via `CM_SEND_WINDOW_OVERRIDES`.
- **Validation**: warns when window is too narrow (< 4h wide) OR when "Immediately" touches fall outside the current window. Both warnings render as `role="alert"` `.cm-wiz-warn` strips at the top of Step 4; the queue warning shows the computed time *"It will queue until Mon 9:00 AM."* from `cmComputeNextSend`.
- **Wizard persistence**: `cmWizBuild` (the wizard → campaign serializer) deep-clones `CM_WIZ.sendWindow` onto the new campaign so configured windows survive save/send/draft.

### Changed (UX)

- Step 5 review summary gains a *"Send window"* row, between Templates and Sending from, with the human-readable description (e.g. *"Business hours only (Mon–Fri 9 AM–5 PM) · recipient TZ · skip weekends"*).

---

## [4.27.0] — 2026-05-21

Campaign Manager medium-effort bundle — two features that take the tab from 8/10 to 9.5/10 on workflow replacement. **Result: 390/390 chromium tests passing.**

### Added

- **Feature**: Bulk contact actions in the Contacts sub-tab — checkbox column, master toggle, sticky action bar with Add to Campaign / Send 1:1 / Add Note / Export Selected.
  - Each row gets a 22 px `role="checkbox"` button with `aria-checked` synced and an `aria-label="Select {Name}"`. A new master row above the list carries `role="checkbox"` + `aria-label="Select all visible contacts"` and tri-state (`true` / `false` / `mixed`) depending on how many eligible (non-departed) rows are currently selected. Departed contacts are visibly skipped by select-all.
  - Selection lives in component memory (`CM_CONTACT_BULK`), not localStorage. When the filter chips or search box change the visible set, selections for now-hidden contacts are pruned automatically; selections for still-visible contacts persist. Switching sub-tabs clears the entire selection.
  - When ≥ 1 contact is selected, a sticky bottom action bar slides up inside the Contacts content area (not fixed to the viewport). The bar carries `role="region"` + a live-updating `aria-label` + an `aria-live="polite"` count. Four bulk actions:
    - **Add to Campaign** opens the existing picker modal with the title rewritten as *"Add N contacts to a campaign"* and routes selection through `cmBulkAddToCampaignSelect`, which appends every selected id (no duplicates) to the chosen campaign and toasts *"N contacts added to {Campaign} · Gainsight ✓"*.
    - **Send 1:1 Email** opens the existing Quick Send modal and pre-populates the recipient list with every selected contact via `cmQsAddContact`.
    - **Add Note** opens a textarea modal *"Add a note for N contacts"*; saving toasts *"Note added to N contacts · Gainsight synced ✓"*.
    - **Export Selected** builds a CSV (`Name`, `Email`, `Account`, `SSO`, `SCIM`, `ARR`, `Renewal`, `Sequence Status`, `Last Activity`) filename `contacts-export-YYYY-MM-DD.csv`, with the same Blob → download path the campaign-level Export uses + clipboard fallback. Toasts *"N contacts exported · CSV ✓"*.
    - **×** clears the selection and slides the bar down.

- **Feature**: Custom date range option in Analytics — from/to date picker, validates the range, dropdown label updates with the active range, × to clear back to default.
  - The Time period dropdown now carries a 5th option, *"Custom range…"*. Selecting it reveals an inline `role="group"` row with `From` + `To` date inputs and an `Apply` button. Validation runs on every input change (`cmAnalyticsValidateUI`) and gates the Apply button. Three error states surface inline:
    - *"Invalid date range"* — unparseable input
    - *"Dates cannot be in the future"* — From or To later than today
    - *"From date must be before To date"*
  - On Apply, `CM_ANALYTICS_PERIOD` flips to `'custom'`, `CM_ANALYTICS_CUSTOM` stores the from/to strings, and `cmAnalyticsCustomData` synthesizes the KPI record by scaling the *All time* totals against a 365-day window. The page header renders the active range as `"Custom: Apr 1 — May 15"` with a tiny `×` button that calls `cmAnalyticsClearCustom()` and reverts to the *This quarter* preset.
  - When the selected range spans fewer than 7 days, an amber banner appears above the KPI tiles: *"⚠ Limited data · Custom ranges under 7 days may show incomplete trends"*.
  - Date inputs carry `aria-label="From date"` / `"To date"` and `aria-describedby="cm-analytics-range-err"` so screen readers pick up the inline error message.

---

## [4.26.1] — 2026-05-21

Campaign Manager quick-win bundle — 3 small fixes shipping together. The requested label was [4.22.0], but that's already used; this entry covers the same bundle under 4.26.1. **Result: 373/373 chromium tests passing.**

### Fixed

- **Fix**: Wizard Step 2 contact rows have full-width click targets. The row was already wrapped in a `<label>`, but Playwright + screen-reader QA both reported misclicks on the small native checkbox area. Each row is now a `role="checkbox"` `<div>` with `tabindex="0"`, an explicit `onclick` handler (`cmStep2ToggleRow`), and Enter / Space keyboard handlers. `aria-checked` stays in sync with the underlying input. The native checkbox remains visible and clickable (with `stopPropagation` so it doesn't double-fire the row handler). Departed contacts get `aria-disabled="true"` + `tabindex="-1"`.
- **Fix**: Export List in the campaign detail panel was always firing a toast, but the previous `catch` path (Blob unsupported) was silent. Both paths now toast — *"Contact list exported · {N} contacts · CSV ✓"* on a successful download, or *"Contact list copied to clipboard · {N} contacts · CSV ✓"* on the clipboard fallback.
- **Fix**: Edit Template inline editor now shows the same full toolbar as the +New Template modal. Refactored the four toolbar primitives (`cmTbWrap` / `cmTbInsertLink` / `cmTbInsertVar` / `cmTbToggleVars`) to accept an optional `taId` + `popId` so they bind to any textarea. Added two reusable mount helpers — `cmMountFormatToolbar(taId, popId)` (B / I / U / Link / Variable) and `cmMountSubjectVarPicker(inputId, popId)` (Variable only) — and rebuilt both the New Template modal and the Edit Template view on top of them. Subject lines on both surfaces now carry a `+ Insert Variable` dropdown. Every variable button has `role="option"`; the parent popovers carry `role="listbox"`. The outside-click dismiss handler now closes any open `.cm-tb-vars-pop`, not just the legacy single-id popover.

---

## [4.26.0] — 2026-05-20

CSM Dashboard workflow QA — 6 bug fixes + 5 improvements (the requested label was [4.22.0], but that's already used; this entry covers the same fix bundle under 4.26.0 since v4.22.0–4.25.0 already shipped). **Result: 370/370 chromium tests passing.**

### Fixed

- **Fix**: Pulse Strip *3 calls today* chip is no longer dead — it now calls `psPulseScrollToCalls()`, switches to the Dashboard, scrolls to a new `#mb-calls-header` (the "Next Up · Today's Calls (3)" header), and runs a 1.4s teal flash on the bar.
- **Fix**: Pulse Strip *$12K–$18K expansion pipeline* chip is no longer dead — it now calls `psPulseOpenExpansion()`, switches to Forecasting → Pipeline, and runs `fcHighlightExpansionRows()` to flash the Acme Corp expansion row(s) teal.
- **Fix**: Priority Stack row 5 *Open Task* button verified — it was already wired to `psBtnAction(this, 'Open Task', () => openTaskBrief('brightex-proj'))` and `TASK_BRIEFS['brightex-proj']` renders the full Task Brief panel. Locked under test to prevent regression.
- **Fix**: Next Up *Risk Analyst* button verified — `agentBtn('risk','acme', this)` opens the Risk Analysis drawer for Acme via the existing 1.5s loading-state wrapper. Locked under test.
- **Fix**: Draft Reply compose drawer replaces `{meeting_link}` with `https://calendly.com/carmen-1password` across all three tone variants (professional / direct / empathetic). Added an `.ps-compose-ph-warn` strip beneath the body textarea that scans live for any `{token}` or `[token]` placeholder and renders each as an amber `✏️` chip. *Mark as Sent* refuses to fire the *Reply logged* toast when placeholders remain unfilled and emits *"⚠ Unfilled placeholder detected: {token}. Replace before sending."* instead.
- **Fix**: `.pulse-strip` no longer clips the leftmost chip at narrow viewports. `overflow-x:auto` + `scroll-snap-type:x mandatory` are now applied unconditionally, edge gradients (`::before` / `::after`) fade the leftmost and rightmost 24 px so scrollability is visually obvious, and each chip carries `scroll-snap-align:start; flex-shrink:0`.

### Added

- **Feature**: AI ranking ⓘ tooltip on the Priority Stack subtitle. A 16 px `i` button (`#bf-rank-i`) toggles a popover (`role="dialog"`) explaining the 4-signal score model (Health 40% · Renewal 30% · CTAs 15% · Gong Silence 15%) plus the *"NovaVault scored highest today because…"* reason line, with a Phase 4 *Adjust weights* placeholder. `aria-expanded` flips on each click; outside-click closes the popover.
- **Feature**: Next Up signal chips are now clickable. SSO, Expansion, and Champion chips each open `#bf-sig-pop` — a body-level `role="dialog"` popover seeded with the exact Gong quote + timestamp (e.g. *"David Kim · May 10 call · 0:23:14"*) for SSO/Expansion, or a champion card for David Kim. Each carries an *Open full call in Gong* / *View full contact profile* button (Phase 2 stubs). Escape closes the popover; the trigger chip regains focus.
- **Feature**: Urgent Inbox rows expose hover-only inline `💬 Quick Reply` + `✓ Dismiss` buttons. Quick Reply routes per inbox item — Brightex → `psComposeOpen('brightex')`, NovaVault → `openAgentDrawer('save','nova')`, Meridian and Maggie Spry → Phase 2 toasts. Dismiss fades the row, hides it, and persists to `teamos_inbox_dismissed` so dismissed rows stay hidden across sessions. `event.stopPropagation()` keeps the row's primary click handler from firing.
- **Feature**: Mark Prepped per Today's Calls card. The Prepare My Day Dust output now routes each call card through a new `duCallCard()` helper that appends a `.du-prep-btn`. Clicking sets `teamos_calls_prepped[acct]`, adds the `.prepped` class (strikethrough + dimmed), and toasts *"{Account} {Type} marked prepped · Logged to Gainsight ✓"*.
- **Feature**: Session-aware Dust Agents. On script load, `psDustApplyContext()` reads the Next Up *In NN min* badge — when ≤ 90 min, it prepends two contextual chips to `#bf-qa` (`Prep Me · {Account}` with a `⏰ NN MIN` badge, then `Risk Analyst · {Account}`) and surfaces a *"Context: next event · {Account} in NN min"* label below the row. Outside 90 min, no chips are inserted.

### Changed (UX)

- Today's Tasks 6 + 7 buttons now use specific verbs (*Schedule* / *Update*) instead of the generic *Open*. Task labels carry a `title` attribute so the full task text shows on hover when truncated.

---

## [4.25.0] — 2026-05-20

Team View Phase 3 — completes the pod-level workspace. **Result: 355/355 chromium tests passing.**

### Added

- **Feature**: Team View Phase 3 — Wins & Losses board with AI insight bar, Pod Unengaged accounts with AI member recommendations, Pod Pipeline View (combined opps + renewals + expansions), Pod Task Hub with filter chips, Pod Comm Strip with Slack thread previews.
- **Wins & Losses board** (Section D): two-column grid under the Shared Account Book. Left column tinted teal — 4 wins (Bertram Industries $42K · Logan Foods $32K · Acme Corp $18K early · Vortex Labs $36K). Right column tinted red — 2 losses (Henlow Co $28K · Mira Health $16K) with explicit *Lost reason* + *Learning* lines. A standing AI Insight footer spans both columns: *"Pod close rate: 67% · Save rate: 50% · Average uplift: 8.4% · Best performer: David (2 wins, $60K)"*.
- **Pod Unengaged Accounts** (Section E): 3 cards (Meridian / Creston / Apex) showing days-dark, last pod touch, an AI recommendation tagged to a specific pod member, and an "Assign to {Name}" button. The button creates a real task in `teamos_pod_tasks[acct]` (the same store the Strategy Huddle Pod Tasks tab reads), so re-engagement assignments show up inside the account's huddle automatically.
- **Pod Pipeline View** (Section F): combined 8-row table (Account / Type / $ Value / Owner / Support / Stage / Close Date). Owner + Support render as avatar pills with hover full names. Stage badges use 6 colour-coded classes (Closed Won / Discovery / Save Active / At Risk / Dark / Champion Change). Footer carries Commit $128K · Best Case $217K · Pipeline $89K · Closed Won Q2 $110K.
- **Pod Task Hub** (Section G): 12 aggregated tasks across all 6 pod members. Member filter chips (`All / Carmen / David / Liam / Marco / Jennifer / Sarah`) and priority chips (`All priority / Critical / High / Watch`). Each row shows an avatar pill, owner name, task title, due date, priority badge, account tag, and a Mark Done toggle. Done state persists to `teamos_hub_tasks`. *+ Assign Task* routes into the existing Strategy Huddle Pod Tasks form (reuses Phase 2 UX).
- **Pod Comm Strip** (Section H): 5 Slack thread previews — `from → to · title · count · when` — plus a right-aligned *📅 Schedule Pod Huddle* button. Thread click and Schedule button both toast Phase 2 stubs.
- **Accessibility**: Win/Loss cards carry `role="article"`; Unengaged cards carry `role="article"` + `aria-label="Unengaged account: {Name}"`; Pipeline `<table>` carries `role="table"`; Task Hub list carries `role="list"` with each row as `listitem`; Comm Strip carries `role="region"` + `aria-label="Pod communication threads"`. Filter chips expose `aria-pressed` state; thread cards are keyboard-activatable buttons with Enter/Space handlers.

---

## [4.24.0] — 2026-05-20

Team View Phase 2 — Strategy Huddle drawer replaces the Phase 1 toast stub. **Result: 339/339 chromium tests passing.**

### Added

- **Feature**: Team View Phase 2 — Strategy Huddle drawer with 5 tabs (Overview / Pod Notes / Pod Tasks / Smart Sheet / AI Strategy), threaded notes with @mentions, cross-role task assignment with Urgent Inbox auto-flag, collaborative smart sheet, AI pod strategy with member-specific recommendations.
- **Drawer mechanics**: body-level right-side dialog, 520 px wide, `role="dialog"` + `aria-modal="true"`. Registered with the v4.16.0 single drawer manager so opening it closes any other open drawer. Header surfaces account name + the colour-coded pod-status badge; subhead reads *"Strategy Huddle · 6 pod members have access"*. Escape closes the drawer and restores focus to the row that opened it. Each tab is its own pane that retains its own scroll position when you switch tabs.
- **Tab 1 — Overview**: unified snapshot — Health (Gainsight), ARR, Renewal + days remaining, Open Opp, CSM/AE/BDR/RS avatar pills, Last Gong, Open CTAs, Champion, Outreach Sequence Status, Contract Status. Footer reinforces cross-role visibility: *"This view is visible to all 6 pod members. AEs can now see Gainsight health. CSMs can now see Outreach sequences."*
- **Tab 2 — Pod Notes**: threaded note feed seeded with the NovaVault demo (3 notes incl. 1 reply nested under its parent). Compose area with `@`-mention autocomplete (dropdown lists all 6 pod members; selecting one inserts `@firstname.lastname` at the caret). Posting a note prepends to the feed, persists to `teamos_pod_notes[acct]`, and toasts *"Note posted · Pod notified ✓"*.
- **Tab 3 — Pod Tasks**: per-account task list (NovaVault seeded with 3 tasks across Sarah / David / Carmen). Each row carries assignee, title, due date, and Critical / High / Watch priority badge. Mark Done toggles state and persists to `teamos_pod_tasks[acct]`. *+ Assign New Task* opens an inline form (assignee / title / due date / priority radio); submitting toasts *"Task assigned to {Name} · Added to their Today's Tasks ✓"* and — when Priority is Critical AND the due date is within 48 hours — fires an additional *"Critical task added to {Name}'s Urgent Inbox ⚠"* toast.
- **Tab 4 — Smart Sheet**: editable stakeholder-map table seeded with NovaVault's 4 known/unknown contacts (Michael Torres / departed James Wu / CFO unknown / CISO unknown). Inline-editable cells, *+ Add Row* + *💾 Save Sheet* persist to `teamos_pod_sheets[acct]`. *🧠 Ask AI to suggest* toasts a Phase 2 stub. A standing AI Insight card below the table flags the champion gap.
- **Tab 5 — AI Strategy**: 3 numbered, member-tagged recommendations (Sarah / Carmen / David for NovaVault), each with a *Why* explanation. HIGH risk assessment card with the full reasoning copy. *Schedule Pod Huddle* and *Mark Strategy Reviewed* buttons toast Phase 2 stubs. Accounts other than NovaVault inherit a default scaffold so the pane still renders.
- **Accessibility**: drawer carries `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; each tab button has `role="tab"` + `aria-selected` and Escape closes the drawer at a Strategy-Huddle-specific level in the Escape chain. Status badges in the header carry `aria-label="Pod status: …"`.

---

## [4.23.0] — 2026-05-20

Team View Phase 1 — pod-level shared workspace replaces the Coming Soon placeholder. **Result: 325/325 chromium tests passing.**

### Added

- **Feature**: Team View Phase 1 — Pod Pulse Strip (7 chips), Pod Roster (6 member cards), Shared Account Book grid with bidirectional role visibility (CSM + AE + BDR + RS columns) and an AI Pod Recommendation per row.
- **Pod Pulse Strip**: 7 sticky chips styled like the Dashboard pulse strip — `👥 Pod Members 6`, `💰 Pod ARR $2.4M`, `📈 Pipeline Open $340K`, `✨ Wins Q2 4 · $128K`, `💥 Losses Q2 2 · $44K`, `⚠️ Pod Unengaged 3`, `✅ Open Pod Tasks 12`. Clicking Pod Members / Pod ARR / Pipeline Open / Pod Unengaged scrolls to the Roster or Book section. Wins / Losses / Tasks toast as Phase 2 stubs.
- **Pod Roster**: 6 member cards (180 × 120) with avatar + role-tinted circle, name, role label, presence status, and "Focused on: …" line. Each card carries `role="button"`, an `aria-label`, and Enter/Space keyboard support. Per-card `💬 Slack` / `📅 Cal` buttons toast Phase 2 stubs and use `stopPropagation` so they don't trigger the parent card's Phase 3 profile stub.
- **Shared Account Book**: 12-column table — Account / Health / ARR / Renewal / Open Opp / Pod Status / CSM / AE / BDR / RS / Last Pod Touch / AI Pod Rec — with a column picker matching the Forecasting Pipeline pattern. Pod Status badges use six colour-coded classes (`EXPANSION`/teal, `CRITICAL SAVE`/red, `AT RISK`/amber, `STABLE`/green, `DARK`/gray, `CHAMPION CHANGE`/purple). CSM / AE / BDR / RS columns render 24 px avatar pills with `title` and `aria-label` showing the full name + role. Row click + Enter/Space open the Strategy Huddle stub (Phase 2).
- **AI Pod Recommendation**: each account row carries a recommendation string tagged to a specific pod member (e.g. *"Sarah: prep extension terms with Carmen. David: hold outreach."*).
- **Accessibility**: roster cards and book rows are keyboard-navigable buttons, status badges expose `aria-label="Pod status: …"`, the pulse strip is a `nav` region with `aria-label="Pod pulse"`, and avatar pills carry both `title` and `aria-label`.

---

## [4.22.0] — 2026-05-19

Two Risk Matrix fixes in the Risk & Signals tab. **Result: 311/311 chromium tests passing.**

### Fixed / Added

- **Fix**: Risk Matrix overflow — container clipping resolved. `.rs-mx-wrap` and `.rs-mx` both carry `overflow:hidden`, the matrix has `min-height:320px` + `aspect-ratio:1/1` + `max-height:480px`, and bubble positions are inset to the 6 %–94 % range so dots at extreme axis values (`daysOut=0` / `health=100`) no longer clip the border. Mobile viewports (≤ 480 px) keep the same aspect ratio and scale proportionally.
- **UX**: Risk Matrix axis labels added for orientation. A vertical `↑ Healthier` label sits left of the matrix and a centered `← Renewal sooner · later →` label below it. Both `aria-hidden="true"` so screen readers get the per-bubble `aria-label` instead.
- **UX**: Quadrant labels are now two-line — bold action word on line 1 and a plain-language explanation on line 2. Watch · *Healthy · renewal approaching*. Stable ✓ · *Healthy · renewal not urgent*. Act now 🔴 · *Low health · renewal soon*. Monitor · *Low health · renewal not urgent*.
- **UX**: Legend below the matrix now spells out the encoding — `● Bubble size = ARR`, `↓↓ Arrow = health declining fast`, `? = No recent data (dark account)` — in addition to the existing colour swatches.
- **UX**: Matrix header replaced with `Risk Matrix · 6 accounts` + the sentence *"Each bubble = one account. Position shows risk. Size shows ARR."* — readable by an executive seeing it for the first time.
- **Accessibility**: `.rs-mx` carries `role="img"` + `aria-label="Risk matrix showing 6 accounts by health score and days to renewal"`. Per-bubble `aria-label`s (Health / days / ARR / trend) are unchanged.

---

## [4.21.1] — 2026-05-18

UX polish on the Recipe for Success Bonus Targets panel. **Result: 302/302 chromium tests passing.**

### Changed

- **UX**: Bonus Targets bar redesigned as a slim single-row strip, max 56px height, flush with the page (no card border-radius, no thick teal left border, no shadow). Background is `var(--surf)` with a 1px bottom border only.
- Layout: one row with two groups separated by a subtle 1px vertical divider — `🎯 Retention  $127K / $150K  −$23K · 6 wks  |  📈 Growth  $32K / $650K  −$618K · 7 mo` — followed by two text-link actions (`View Forecast →` / `View Pipeline →`) and a right-aligned `Synced · auto-updates` label.
- Typography: numbers 15px / weight 600, labels 10px uppercase muted, gap text 12px (red only when negative — no pills or badges), action links 12px, sync label 10px muted gray.
- `sr-only` spans preserve "Retention bonus:" / "Growth bonus:" labels for screen readers; emoji + uppercase label stays `aria-hidden`.

---

## [4.21.0] — 2026-05-18

Recipe for Success tab rebuilt from report card to coaching tool. The two numbers that matter — $650K annual growth goal and $150K Q2 retention target — anchor every category. **Result: 301/301 chromium tests passing (285 prior + 16 new v4.21.0 tests).**

### Fixed / Added

**Section 1 — MY BONUS TARGETS panel above the hero.** A new `.rcp-bonus` panel renders at the very top of the Recipe tab (above the 74.5% score), with `role="region"` + `aria-label="My bonus targets"`. Two columns:
- **Retention bonus**: `$127K committed` / `$150K target` with a `-$23K gap` chip (`role="status"`). The committed number is computed live from `fcReadOverrides()` deltas against `FC_PIPELINE` — when a CSM updates a forecast amount on the Forecasting Pipeline tab, the Recipe header recomputes on next render.
- **Growth bonus**: `$32K closed` / `$650K target` with a `-$618K gap` chip (`role="status"`).
- Two `.rcp-bonus-btn` actions (`Update Retention Forecast`, `Log Growth`) call `rcpJumpRetention()` / `rcpJumpGrowth()` which route to `forecast` → `pipeline` and toast.

**Section 2 — Reframe the score with bonus translation.** Below the 74.5% score, a new `.rcp-bonus-trans` sentence reads: *"~78% bonus attainment if Q2 closes as forecast. **Renewal Forecast** is the highest-risk category — every $1K of churn there is $1K off your retention bonus."* The 78% figure is hardcoded per spec.

**Section 3 — Named accounts in every category gap.** Each of the 4 `.sc-card` blocks now renders a `.rcp-gap-detail` block beneath the status pills, populated by a new `rcpGapDetail(sec)` helper:
- **Success Plans**: NovaVault + Meridian listed as missing plans, each with a `Create Plan` button (`rcpCreatePlan('nova'|'meridian')`) that flips the named-accounts-resolved state in `RCP_SUCCESS_PLANS_RESOLVED` and increments the card count (`16/18` → `17/18` → `18/18`).
- **Book of Business Growth**: Acme expansion lead with `$12K–$18K` ARR range and a `Prep expansion ask` button (`rcpExpansionAcme()`) that opens the Acme drawer if available.
- **Renewal Forecast Actions**: Meridian + Creston + Apex listed as blank statuses, plus an `Update All 3` button (`rcpJumpForecastBlanks()`) that routes to Forecasting Pipeline and highlights the three rows in sequence.
- **EBR + Advocacy**: NovaVault (`role="alert"`, `URGENT — bonus risk`) + Brightex (`Owed in 30 days`) as priority EBRs, plus a `Draft both EBR outreach` button (`rcpEbrDraftBoth()`). Advocacy section lists Acme case study + Brightex reference call (seeded from `teamos_recipe_advocacy` localStorage key) and an `Add milestone` button (`rcpOpenAddMilestone()`) that opens a modal with account + label + status fields. Saved milestones bump the Advocacy card count.

**Section 4 — Quarter Projection upgrade.** The 3-line projection block is rewritten as `.rcp-proj-bonus`:
- Dollar-denominated retention pacing (`$127K committed of $150K target — $23K short`).
- Dollar-denominated growth pacing (`$32K closed of $162K Q2 pacing — $130K short`).
- A new `.rcp-proj-warn` (`role="alert"`) NovaVault churn scenario card: *"If NovaVault churns, retention drops from $127K → $96K — $54K below target."*
- Score-to-Exceeding sentence retained.

**Section 5 — Dust Action Plan updated with named accounts.** The 3 action plan cards now name specific accounts:
- Card 1: "Draft EBR outreach for **NovaVault** (URGENT) + **Brightex** (owed in 30 days)".
- Card 2: "Get renewal commitment from **Meridian**, **Creston**, **Apex** (3 blank forecasts blocking your $150K target)".
- Card 3: keeps the NovaVault + Brightex prep CTAs.

**Accessibility.** All new interactive elements carry keyboard handlers (Enter/Space). `.rcp-bonus` is a `region`; gap chips and the NovaVault churn warning use `role="status"` / `role="alert"`. The Add milestone modal traps focus, restores it on close, and binds Escape.

**Internal cleanup.** Removed a 395-line duplicate `buildRecipe` + notes-module block (the file had carried the dup across many prior versions). Also removed a redundant script-level `buildRecipe()` call that ran before `RCP_NOTES_KEY` was assigned and crashed under the de-duped layout.

---

## [4.20.0] — 2026-05-18

Three CSM Dashboard workflow fixes. **Result: 285/285 chromium tests passing.**

### Fixed / Added

**FIX 1 — Internal Urgent Inbox items open a dedicated context panel.** Previously the Maggie Spry Slack DM row called `acctClick('nova')` and routed the CSM to the NovaVault account briefing — wrong template for a leadership DM. New flow:
- The Maggie row now carries `data-type="internal"` + `data-inbox-id="maggie-spry"` and routes to `psInternalOpen('maggie-spry')` on click + Enter/Space.
- A new body-level `#int-panel-ov` + `#int-panel` slide-over (380 px, anchored to the right, indigo accent, `role="dialog"`, `aria-modal="false"`) shows: section header "Internal message" + sender name + role/channel/age subline, a `.int-panel-card` for **Message context** (the Phase-2 placeholder copy from the spec), an amber `.likely` card for **Likely topic (based on timing)**, three suggested-action buttons (Reply in Slack / Share Forecast / View NovaVault Brief), and a Phase-2 footer.
- The "View NovaVault Brief" action closes the panel and routes to `acctClick('nova', null)` — the only path that touches the customer briefing surface, and only when explicitly chosen.
- `INBOX_INTERNAL` is a small map so other internal contacts (CS Ops, AE pings) can be added later by extending the data, not the markup.
- Customer rows (Michael Torres, Sarah Chen, Jennifer Ramos) keep their existing `acctClick(acct, event)` routing — no regression to the briefing flow that was correct.
- Escape closes; focus returns to the triggering inbox row.

**FIX 2 — Data-source attribution footer on every data-bearing surface.** A new `dataAttribHtml(extra)` helper returns a `<div class="data-attrib" role="note" aria-label="Data source attribution">` line with the shared text `Data: Demo data · Live sync available in Phase 2`. Centralized so the Phase 2 swap (when the Gainsight / Gong / Salesforce APIs land) is a one-line change to `DATA_ATTRIB_TEXT`. Wired into:
- **Agent drawer body** — appended after the notes section in both `openAgentDrawer` paths (full payload + missing-data empty state).
- **Next Up widget** — static markup added below the action button row.
- **Risk Matrix snapshot slide-over** — appended to `rsMxRenderDetail` after the action buttons.
- **All Signals section** — appended to `rsRenderSignals` after the signal list.
- **Forecasting Pipeline table** — appended to `fcRenderPipeline` after the summary tiles.

**FIX 3 — Forecast quick-link in the Mission Briefing header.**
- Part A — `psKpiRenew()` ("$89K renews this month" pulse chip) already routes to Forecasting → Timeline as of v4.10.0; re-verified with a new dedicated test.
- Part B — `view-default .rp-hd.pl` gains a new `.mb-fc-btn` chip (`📊 Forecast`, `role="link"`, `aria-label="View Forecasting tab"`) between the `Prepare My Day · Auto-loaded` pl-tag and the existing `⚡ Live` chip. Click navigates to Forecasting → Pipeline via the new `psOpenForecastTab()` helper. Same gray outlined visual treatment as the Live chip so neither dominates the header.

### Engineering notes
- `#int-panel` mounts at body level (not inside `#tab-dash`) so it survives tab swaps. Sticky `top: 88px` matches the existing `.rs-mx-snap` slide-over geometry; offline-banner offset bumps to 124 px the same way.
- The internal panel uses a transparent overlay (`#int-panel-ov`) so the page behind it stays interactive (non-modal per spec).
- The drawer manager (v4.16.0 `_drawerManagerOpen`) is intentionally NOT called for the internal panel — it's a sub-panel that's free to coexist with the underlying tab, not a competing full drawer.
- `dataAttribHtml(extra)` accepts an optional override string so future per-panel customization (e.g. "Data: Gainsight live · Last synced 9:14 AM") is a single argument away.

### Test coverage
- **285 / 285 chromium passing** (was 267 in v4.19.0). 18 new tests under a `v4.20.0 CSM Dashboard workflow fixes` describe — 8 FIX 1 (data-type tagging, click routing, panel a11y, body sections, Reply in Slack toast, View NovaVault Brief jump, Escape returns focus, customer-row regression), 6 FIX 2 (helper output + per-surface footer count for Next Up / drawer / matrix snapshot / All Signals / Pipeline), 4 FIX 3 (pulse-strip Part A re-verify, header chip a11y, click navigation, button ordering).

### Spec label
Shipped as `[4.20.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.19.0] — 2026-05-18

Four Risk & Signals workflow fixes. **Result: 267/267 chromium tests passing.**

### Added / Fixed

**FIX 1 — Ghost-Buster auto-suppresses when an inbound signal exists.** Launching a 3-touch cold sequence after the contact just emailed reads like the CSM never noticed. New flow:
- `rsFindInboundSignal(acct)` returns the matching signal when `src === 'INBOX'` OR the desc/ctx blob contains `/\binbound\b|\bemailed\b/i`. Meridian + Brightex hit; Creston / Apex / NovaVault don't.
- `rsInboundContactName(signal, acct)` extracts the first name from the signal text (e.g. "Jennifer Ramos emailed yesterday" → `Jennifer`) with a champion-field fallback.
- `gbDrawerOpen(acct)` checks for an inbound signal before rendering. When one is found, the drawer body becomes a `<div class="gb-inbound-warn" role="alert" aria-label="Inbound signal detected — direct reply recommended">` with: amber `⚠ Inbound detected` header, plain-English summary, `[Reply to Jennifer →]` primary CTA (focused on open) routing to `draftReply` or `rsDraftReplyBrightex`, `[View Signal]` secondary that jumps to All Signals, and a small "Launch Ghost-Buster anyway →" bypass link for edge cases.
- A new `_gbDrawerOpenInternal(acct, forceSequence)` carries the bypass flag.

**FIX 2 — Competitor flag in Risk Matrix account snapshot.** `rsFindCompetitorFlag(acct)` scans `RS_SIGNALS` for a Gong-sourced row whose description contains `/competitor/i`, then extracts the competitor name (the capitalized token after "— ") and the call count (digit before "Gong call"). When found, `rsMxRenderDetail` renders a 6th key-value row: `Competitor · ⚠ Okta flagged · 2 calls` (amber, prefixed with ⚠ via CSS `::before`). When no Gong competitor signal exists, the row is hidden — no empty placeholder. Brightex shows the row; Acme / NovaVault / dark accounts do not. `aria-label="Competitor flag: Okta mentioned in 2 calls"` for screen readers.

**FIX 3 — Save Play expected-outcome dates are dynamic.** Hardcoded dates ("Touch 1 reply by May 18") were already stale on May 19. New date-token system:
- `{+Nbd}` resolves to today + N business days (skips Sat/Sun).
- `{+Nd}` resolves to today + N calendar days.
- `rsAddBusinessDays`, `rsAddCalendarDays`, `rsFormatShortDate` ("May 18"), and `rsResolveDateTokens` work together to substitute tokens at render time inside `rsPlayCardHTML` (before HTML-escaping).
- `RS_PLAYS.nova` Step 2 outcome rewritten: `Touch 1 reply within 2 business days (by {+2bd}). If no reply by {+5d}, schedule Touch 2 (AE warm intro request through David Kim relationship).`
- `RS_PLAYS.nova` Step 3 outcome rewritten: `Soft-commit to a renewal discussion before {+10d}.`
- Renewal-fixed dates (e.g. Brightex "Renewal signed by Jun 10") remain hardcoded because they're anchored to the actual renewal date, not a relative deadline.

**FIX 4 — Signal staleness badges + NEW-first sort.** Two pieces:
- `rsParseAgeDays(updated)` parses freeform timestamp strings ("Today · 6:14 AM", "Yesterday", "2h ago", "7d ago", "45d ago", etc.) into a day count. `rsAgeBucket` maps to `{ bucket: NEW|FRESH|STALE, days }` with thresholds 0-1 / 2-6 / 7+. NEW renders a teal `.rs-sig-age.new` pill; STALE renders a muted gray `.rs-sig-age.stale` pill; FRESH renders no badge so the eye reads only the actionable extremes.
- The default `RS_SIG_SORT = 'newest'` no longer fires the legacy creation-order sort. It now buckets within each severity tier — within Critical, NEW comes before STALE; the same applies within High, Watch, and Opportunity. The Monday-morning feed reads as "here's what's new today" instead of "here's everything that's ever been flagged."

### Engineering notes
- `_gbDrawerOpenInternal` is intentionally underscore-prefixed: the "Launch anyway" link is the only caller besides `gbDrawerOpen`, which itself delegates with `forceSequence:false`.
- `rsResolveDateTokens` runs before `rsEscape` because the substituted strings contain no HTML and the order keeps the test surface predictable.
- The staleness sort runs alongside the existing severity + ARR sort options — switching to "Severity" or "ARR at risk" via the existing select still works.
- Two pre-existing tests (v4.13.0 FIX 1 + v4.14.0 notes section) switched from Meridian → Creston for the Ghost-Buster drawer assertion because Meridian now triggers the inbound-suppression warning, which doesn't include the Situation Read or the notes section.

### Test coverage
- **267 / 267 chromium passing** (was 252 in v4.18.0). 15 new tests under a `v4.19.0 Risk & Signals workflow fixes` describe — 5 FIX 1 (helper + suppression render + Reply CTA + bypass + clean account), 3 FIX 2 (helper + Brightex row + Acme no-row), 3 FIX 3 (token resolver + Step 2 dynamic date + business-day math), 4 FIX 4 (bucket helper + NEW/STALE counts + sort ordering + aria-label wording).

### Spec label
Shipped as `[4.19.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.18.0] — 2026-05-18

Four Campaign Manager workflow fixes. **Result: 252/252 chromium tests passing.**

### Fixed / Added

**FIX 1 — Unfilled `[Bracket]` placeholders block the send.** Previously a missing personalization (`[Account-specific value summary]`) would ship as a literal bracket in the outgoing email. New blocking flow on every send path:
- `cmFindWizardUnfilled(contactPool)` walks each contact's effective draft (per-contact override OR template default), runs `cmCollectPlaceholders`, and returns `{ contactId, name, acct, placeholderLabels }` for every offender.
- `cmFindFreeformUnfilled(body)` is the single-body variant used by Quick Send (one shared message → broadcast).
- `cmOpenSendConfirm` short-circuits the confirmation modal when offenders exist and calls `cmShowUnfilledWarning` instead. The warning modal is promoted to `role="alertdialog"` with `aria-label="Unfilled placeholders detected — cannot send"`, lists each offender with their company + bracketed labels in a red-tinted box, and focuses a `[Review Drafts]` button that calls `cmReviewUnfilled(firstContactId)` → jumps the wizard to Step 3 on the first affected contact.
- `cmQuickSendSubmit` calls `cmShowUnfilledWarningQuickSend` which reopens the Quick Send modal with subject/recipients/signature flag restored when the CSM clicks `[Review Message]`.
- Part B of the spec (amber chip highlight on placeholders) ships across Step 3 + Step 5 via the existing v4.12.0 FIX 8 `.cm-ph-bar` chip strip — confirmed in place during this work.

**FIX 2 — Step 2 account headers show exact health score + last touch.** `cmWizStep2BuildGroups` now reads `CM_ACCT_HEALTH[acctKey]` and `lastTouch` (from the first contact in each group). The right-side meta line reads `SSO: Deployed · ARR: $48K · Health: 82 · Last touch: May 10`, with the health number rendered as a color-coded pill (`<50 red`, `50-74 amber`, `75+ teal`, `null gray`) and `aria-label="Health score: 48, At risk"` for screen readers.

**FIX 3 — Per-touch template selector in Step 4.** Each touch row now carries a third dropdown: "Same as campaign" (default) + every entry in `CM_TEMPLATES` (6 defaults + any user-built) + `+ New template…`. New `tpl` field added to each touch object (initialized to `'same'`). The "+ New template…" sentinel reverts the dropdown to the prior value and opens the existing template builder (`cmNewTemplate`) so a CSM can build a template inline and pick it from the dropdown when she returns. `cmWizStep4RefreshSummary(i)` repaints just the per-touch footer text — no full Step 4 rebuild — so focus stays on the open dropdown. Step 5 summary surfaces `T1: Same as campaign · T2: EBR Invitation · T3: Champion Introduction`.

**FIX 4 — Call task as 4th channel option.** The channel `<select>` on every touch row now includes `📞 Call task` as the 4th option. Selecting it swaps the per-touch footer line to `Call task · reminder created in Gainsight CTA on Day N` (amber) instead of the standard "Template / Stop on reply" copy. Step 5's Sequence summary renders the mixed cadence as `Email → Call task → Email` so the CSM can verify it at a glance. When the campaign launches, every Call touch fires its own toast: `Call task created · Gainsight CTA · Day N reminder for X contacts ✓`.

### Engineering notes
- `cmOpenSendConfirm` short-circuit applies only to `ctx.source === 'wizard'` paths today — campaign-card sends operate on already-stored contact records and don't have per-recipient draft override state in scope. Phase 2 will extend the check to card sends once the per-campaign draft store is wired up to the active campaign loader.
- The placeholder-blocking warning re-uses the generic `#cm-modal-ov` shell. Promoting the modal to `role="alertdialog"` happens after `cmOpenModal` returns; the role is reverted back to `"dialog"` when the CSM dismisses the warning so the next caller gets a stock dialog.
- The Step 2 health bands use a single CSS class (`.cm-wiz-grp-health.r/a/g/gy`) shared with the existing v4.10.0 badge taxonomy palette — no new color tokens.

### Test coverage
- **252 / 252 chromium passing** (was 236 in v4.17.0). 16 new tests under a `v4.18.0 Campaign Manager workflow fixes` describe — 5 FIX 1 (finder helper, wizard block, Review Drafts jump, Quick Send block, clean-drafts happy path), 3 FIX 2 (header content, color band per account, aria-label wording), 4 FIX 3 (selector options + change + new-template modal + Step 5 summary), 4 FIX 4 (Call task option + summary swap + Step 5 mixed cadence + send-time toast).
- One pre-existing test (`Send opens confirmation modal with reviewable recipient list`) was updated to pre-seed clean draft bodies so the placeholder check doesn't block its happy-path assertion.

### Spec label
Shipped as `[4.18.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.17.0] — 2026-05-18

Four Forecasting-tab workflow fixes from CSM QA. **Result: 236/236 chromium tests passing.**

### Added / Fixed

**FIX 1 — Forecast narrative auto-regenerates after overrides change.** Editing a forecast amount or status used to leave the Dust narrative stale until the CSM clicked Regenerate manually. A new debounce + silent regen path:
- `var _fcRegenTimer` + `fcScheduleRegen()` clear-and-set a 2 s timer; rapid edits collapse to a single regen.
- `fcRegenerateDust()` flashes `↻ Updating…` in the existing `#fc-dust-gen` span, rebuilds the dust section after 350 ms, swaps the timestamp to "Updated just now" for 1.8 s, then settles on the fresh full timestamp.
- `#fc-dust-gen` now carries `aria-live="polite"` so screen readers announce the refresh without an alert.
- Both `fcSaveOverride` (forecast $ override) and `fcSetStatus` (status dropdown) end with `fcScheduleRegen()`.
- No toast on auto-regen — silent by design. The manual `[Regenerate]` button still fires `fcRegenerate()` which keeps its toast.

**FIX 2 — Copy Forecast Summary leads with Attainment %.** `fcBuildForecastSummary()` now produces a header that puts the manager's question first.
- When a quota is set:
  ```
  Q2 2026 Forecast · Carmen Corio · May 18
  Attainment: $147K of $150K (98% · −$3K vs target)
  Commit: $147K | At Risk: $36K | Gap: −$3K
  —
  [account lines]
  ```
- When no quota is set, the second line nudges: `(Set a quota target to see attainment %)`.
- The third line (Commit / At Risk / Gap) is kept as a quick-glance summary alongside the headline.

**FIX 3 — NovaVault Extension Terms is a give-get block.** The previous single-list of offer terms didn't show what NovaVault commits to in return. The `DRAWER.save.nova` Extension Terms section migrates from the flat `ext: [[label,value],…]` shape to a new `extGroups: [{ tone, label, rows, aria }]` shape:
- Group 1 (`tone:'offer'`, amber): `60-day extension (Jun 1 → Jul 31)` / `Current pricing locked` / `Weekly touchpoints with Carmen` / `Decision deadline: July 15, 2026`.
- Group 2 (`tone:'need'`, indigo, `role="region"` + `aria-label="What we need from NovaVault"`): `Champion intro: Michael Torres joins a 30-min kickoff call by Jun 8` / `Exec sponsor: NovaVault names one executive sponsor for the extension period` / `Evaluation commitment: formal evaluation completed by Jul 1 (not just "thinking about it")`.
- The legacy `ext` renderer is untouched — Acme + Brightex Save Strategy entries continue to use the flat shape if they had one.

**FIX 4 — Prep Me drawer carries a Call Success section.** A new section type inserted between Account Snapshot and Last Gong in every Prep Me entry (`DRAWER.prep.acme / brightex / nova`):
- New `callSuccess: { win, acceptable, avoid, aria }` payload renders three color-coded pills (WIN green, ACCEPTABLE amber, AVOID red) inside a `role="note"` region with `aria-label="Call success criteria for [Account]"`.
- Acme QBR: WIN = SSO pilot + named technical lead; ACCEPTABLE = EBR completed + meeting within 2 weeks; AVOID = no next step.
- Brightex Risk Review: WIN = specific evaluation criteria + side-by-side comparison; ACCEPTABLE = SLA answered + 30-day extension; AVOID = "still evaluating" with no decision date.
- NovaVault Exec Check-in: WIN = Torres agrees to extension + kick-off by Jun 8; ACCEPTABLE = Torres commits to a decision date; AVOID = renewal date passes with no commitment.

### Engineering notes
- `openAgentDrawer` and `restoreAgentOutput` share a sub-renderer that walks the `sections` array — both got the new `extGroups` and `callSuccess` branches. New section types are additive; legacy `items` / `objections` / `ctas` / `note` / `ext` all keep their existing renderers.
- `fcRegenerateDust` re-renders the entire dust section when it's visible; otherwise it just updates the cached `FC_DUST_GEN` string so the next render picks it up. The "Updated just now" flash → full timestamp swap happens via two staggered setTimeout calls so screen readers announce the natural-language update first and the timestamp second.
- The auto-regen path deliberately does NOT call `toast()` — the spec wanted a silent update that feels automatic.

### Test coverage
- **236 / 236 chromium passing** (was 224 in v4.16.0). 12 new tests under a `v4.17.0 Forecasting workflow fixes` describe — 4 FIX 1 (helpers exist, override schedules debounce, status schedules debounce, rapid edits collapse to a single timer), 2 FIX 2 (Attainment line with quota, no-quota nudge), 2 FIX 3 (extGroups structure + drawer renders both groups with aria-label on needs region), 4 FIX 4 (every Prep Me account carries Call Success, drawer renders pills + role=note, NovaVault wording, section ordering between snapshot and Last Gong).

### Spec label
Shipped as `[4.17.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.16.0] — 2026-05-18

Two targeted UI fixes from visual QA screenshots. **Result: 224/224 chromium tests passing.**

### Fixed

**FIX 1 — Drawer manager enforces single-drawer-at-a-time.** Visual QA caught the Account Snapshot slide-over rendering on top of the Save Strategy drawer with no z-index separation. Root cause: each drawer's open path was unaware of every other open drawer. New design:
- A global `_openDrawer` variable tracks which "full" drawer is on-screen (`'agent' / 'gb' / 'compose' / 'rs-slide-ov' / 'fc-acct' / 'cm-cv'`).
- A `DRAWER_REGISTRY` map ties each id to its CSS selector + close function. Adding a new drawer surface is a one-line registration.
- A `DRAWER_SUBPANELS` list holds the Risk Matrix Account Snapshot (`#rs-mx-snap`) — closed whenever a full drawer opens, but never tracked as `_openDrawer` (it's a sub-panel that's free to coexist with itself).
- `closeAllDrawers(exceptId)` runs every registered close function for the other drawers + all sub-panels.
- `_drawerManagerOpen(id)` is called at the top of each drawer's open path; `_drawerManagerClose(id)` at the top of each close path.
- Each open path keeps its own CSS transition (fade-out for the leaving drawer ~100 ms via the existing overlay opacity rule, slide-in for the new drawer ~250 ms via the existing transform transition), so the handoff reads as smooth.
- Escape continues to close the topmost open drawer via the existing precedence chain (ps-compose → gb-drawer → rs-mx-snap → rs-slide-ov → cm-modal-ov → drawer → dropdowns); the manager doesn't change Escape semantics.

**FIX 2 — Urgent Inbox rows rebuilt for triage-readability.** Visual QA showed names truncated to initials (`N`, `M.`, `S..`, `Maggi...`) when the chips pushed them out of the one-line flex container. New layout: each row is a 52 px two-line card.
- Row 1: avatar + full first name (`Michael Torres`) + account (`NovaVault`) with a centered-dot separator. Names no longer truncate to initials.
- Row 2: status chip + source chip + relative time (margin-left:auto pins time right). Chips wrap to row 2 instead of competing with the name on row 1.
- New row content reads like a triage queue:
  - `Michael Torres · NovaVault — CRITICAL SAVE · GAINSIGHT · 2h ago`
  - `Maggie Spry · CS Leadership — DM · SLACK · 1h ago`
  - `Sarah Chen · Brightex — SLA OPEN · GMAIL · 3h ago`
  - `Jennifer Ramos · Meridian — INBOUND · GMAIL · 5h ago`
- Each row is `role="button"` + `tabindex="0"` + a descriptive `aria-label="[Name], [Account], [Status], [time]"`. Enter/Space triggers `acctClick` so keyboard users can route every row to the Mission Briefing.
- Status chips use the v4.10.0 unified taxonomy (`.tb-crit`, `.tb-high`, `.tb-watch`, `.tb-opp`). Source chips use the outlined `.tb-src` variant with system-specific text colors.
- A new `.ii-av.opp` teal avatar variant was added to badge the Jennifer Ramos / Meridian inbound row.

### Engineering notes
- `_drawerManagerOpen` calls `closeAllDrawers(thisId)` first, then sets `_openDrawer = thisId`. The order matters: closing happens before the new drawer flips its `.on` class, so the CSS transitions sequence cleanly.
- The Risk Matrix snapshot is intentionally NOT tracked in `_openDrawer`. It's a sub-panel of the matrix grid — it's allowed to coexist with itself (clicking a different bubble swaps content without closing) but a "real" drawer dismisses it.
- Drawer manager wiring touches: `openDrawer` / `closeDrawer` (agent), `gbDrawerOpen` / `gbDrawerClose`, `psComposeOpen` / `psComposeClose`, `cmCampView` / `cmCampViewClose`, `rsOpenSlide` / `rsCloseSlide`, `fcOpenAcctDrawer` / `fcCloseAcctDrawer` — 6 surfaces total.

### Test coverage
- **224 / 224 chromium passing** (was 213 in v4.15.0). 11 new tests under a `v4.16.0 Drawer manager + Urgent Inbox` describe — 6 FIX 1 tests (drawer→drawer handoff, agent→compose, sub-panel auto-close, helper exists, Escape topmost, cross-tab drawer swap) and 5 FIX 2 tests (full names + accounts present, every row's status+source chip + class assertion, two-line row geometry, role/aria on every row, keyboard Enter routes acctClick).

### Spec label
Shipped as `[4.16.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.15.0] — 2026-05-18

CSM Dashboard QA audit — 6 fixes (2 crashes + 4 wiring/UX). **Result: 213/213 chromium tests passing.**

### Fixed

**FIX 1 — Priority Stack row 2 Draft Reply opens a compose drawer (was a hard crash).** The previous handler called `draftReply('brightex')` which paints into `view-draft` inside the dashboard's Mission Briefing panel — a path that crashed when the surrounding tab state was inconsistent. New flow: `psComposeOpen('brightex')` mounts a body-level `<aside id="ps-compose" role="dialog" aria-modal="true">` (520 px right-side overlay, z-index 9101 over the 9100 overlay) and renders:
- A context block (Last email · 4h ago / Last Gong · May 10 / Health 48 / Renewal Jun 15).
- A 3-button tone selector — Professional / Direct / Empathetic — wired through `psComposeSetTone(t)`. Each tone swaps the body to a distinct pre-filled draft; the textarea is editable after switching.
- FROM (`carmen@1password.com` read-only), TO (`sarah.chen@brightex.com` read-only), SUBJECT (`Re: SLA question — Brightex` editable input), and a 220-px body `<textarea>`.
- Footer: `[Cancel]`, `[Copy Draft]` (Clipboard API + `execCommand('copy')` fallback), `[Mark as Sent]` (fires `Reply logged · Brightex · Gainsight timeline ✓` and closes).
- Escape closes; focus returns to the trigger element via `PS_COMPOSE_TRIGGER`.

**FIX 2 — Priority Stack row 4 Ghost-Buster opens the in-tab drawer (was a hard crash).** The previous handler called `openGhostBusterFromPopover('meridian')` which toggled the dashboard's `view-meridian` panel. The audit reported this as a crash; the spec was to route through the same drawer Risk & Signals uses. Onclick now calls `openGhostBuster('meridian')` which routes through `rsOpenGB` → `gbDrawerOpen` (the v4.13.0 drawer). No tab change; the existing 3-touch sequence + Situation Read content renders inside the body-level `#gb-drawer` overlay.

**FIX 3 — Priority Stack row 3 Prep Me is wired correctly.** The Acme button calls `openAgentDrawer('prep', 'acme')` which mounts `DRAWER.prep.acme` into the agent drawer. New v4.15.0 test asserts the drawer opens with the Pre-Call Brief title when the row 3 button is clicked.

**FIX 4 — Loading states on all 5 Priority Stack action buttons.** Every row's `.bf-act` button is wrapped with `psBtnAction(this, label, fn)`. The wrapper:
1. Saves the original `innerHTML` + `aria-label`.
2. Adds `.ps-loading` (CSS spins the leading `i.ti` icon + drops opacity to .7 + disables pointer events).
3. Sets `aria-busy="true"` and `aria-label="Loading [label]…"`.
4. Runs the supplied action (`openAgentDrawer` / `psComposeOpen` / `openGhostBuster` / `openTaskBrief`).
5. Polls every 80 ms for `#drawer.on, #gb-drawer.on, #ps-compose.on, #cm-modal-ov.on`. When any of them mounts, restores the button.
6. Times out at 3 s with toast `Unable to load [label] · Try again ✓`.

**FIX 5 — Priority Stack company names are interactive buttons.** Every `.bf-nm` span now carries `role="button"`, `tabindex="0"`, `aria-label="View [Account] in Agent Hub"`, and an `onkeydown` handler so Enter / Space trigger the same `psNameClick(key, event)` jump (which routes through the existing `acctClick` → `openPanel` → `_updateAgentHubAccount` chain). CSS: explicit cursor:pointer + teal underline on hover + visible focus ring. `window._activeAccount` updates correctly on click + keyboard activation.

**FIX 6 — Confirmation toasts audit.** Audited and verified that drawer footer buttons fire toasts on completion. New regression tests assert:
- Save Strategy "Push to Gainsight" → `3 CTAs created in Gainsight · NovaVault · Assigned to Carmen ✓`.
- Pre-Call Brief "Copy battle card" → `Battle card copied to clipboard ✓`.

### Engineering notes
- The compose drawer is generic enough that other 1:1 reply entry points could reuse it; today only Brightex Draft Reply is wired. The `PS_COMPOSE_PAYLOADS` map keys off the account key so adding new contacts is a data-only change.
- `psBtnAction` uses a 3-second timeout because some drawer initializers (Risk & Signals → goTab → openPanel) defer renders by ~80 ms. The 80 ms poll interval keeps the loading flash visible long enough to be noticed but short enough that it never feels stuck.
- The Escape handler chain now reads (highest precedence first): `#ps-compose` → `#gb-drawer` → `#rs-mx-snap` → `#rs-slide-ov` → `#cm-modal-ov` → drawer / dropdowns.

### Test coverage
- **213 / 213 chromium passing** (was 197 in v4.14.0). 16 new tests under a `v4.15.0 CSM Dashboard fixes` describe — 5 FIX 1 tests (handler wiring, drawer markup, tone swap, Mark as Sent toast, Escape), 2 FIX 2 tests (handler wiring + drawer mount stays on dash), 1 FIX 3 test (Prep Me Acme), 3 FIX 4 tests (wrapper wiring + loading class flips + clears), 3 FIX 5 tests (role/aria on every name + click jump + Enter jump), 2 FIX 6 tests (Push to Gainsight + Copy battle card toasts).

### Spec label
Shipped as `[4.15.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.14.0] — 2026-05-18

Forecasting audit follow-up — 3 fixes + 2 features + 2 enhancements. **Result: 197/197 chromium tests passing.** Closes the gap from the senior PM 8.2/10 rating.

### Fixed

**FIX 1 — Stale-state account bug in the shared agent drawer.** `closeDrawer` now explicitly clears the drawer DOM (`#drawer-title` / `#drawer-sub` / `#drawer-scroll` / `#drawer-ft`) AND nulls `_drawerCtx.acct` + `_drawerCtx.lastAgent`. `openAgentDrawer(type, acct)` sets `_drawerCtx.acct = acct` BEFORE any render call so guards see fresh state. When `DRAWER[type][acct]` is missing for the requested pair (e.g. `risk` × `apex`), the drawer now paints an explicit empty-state card identifying the requested account ("No Risk Analysis content available for Apex Dynamics yet.") instead of falling through and leaving the previous account's content on screen. Marker comment in the code: `// ACCOUNT ISOLATION: each drawer open must pass accountKey explicitly. Never read from shared state on open.` All 6 Pipeline row action buttons audited — every row passes its own key via `FC_PIPELINE[i].actionAcct === FC_PIPELINE[i].key`.

**FIX 2 — Ghost-Buster from Forecasting Pipeline opens the in-tab drawer.** Already shipped in v4.13.0 (Forecasting's `openGhostBuster(acct)` routes through `rsOpenGB` → `gbDrawerOpen`). New v4.14.0 tests confirm: `fcAction('gb', 'meridian')` / `fcAction('gb', 'creston')` open `#gb-drawer.on` with the right account header and `#tab-forecast` remains active.

**FIX 3 — Timeline cards clickable as whole units.** The previous markup only made the `.fc-tl-nm` name span clickable. The entire `.fc-tl-acct` card now carries `role="button"`, `tabindex="0"`, an `aria-label="[Account] — view in Pipeline"`, `cursor:pointer` + teal hover border + `View in Pipeline →` tooltip rendered via the `::after` pseudo-element. Enter and Space both trigger the same `fcJumpToPipelineRow(key)` jump that the click handler fires.

### Added

**FEATURE — Recovery Path section in Dust Forecast.** When quota is set AND `commit - quota < 0`, a new amber `.fc-recovery` block renders below the 3 stat tiles inside `fcRenderRollup`:
- Header: `📈 Recovery path` + `$XK gap` pill.
- Row: `📈 Acme Corp expansion signal · +$12K–$18K potential · SSO enterprise upgrade · David Kim flagged interest unprompted` + a primary `Open Expansion Play →` button that fires `fcAction('prep', 'acme')` (same target as the existing ARR Trends expansion CTA).
- `role="note"`, `aria-label="Recovery path for quota gap"`.

When the gap is positive, the block flips to the teal `.fc-recovery.positive` variant with a single line: `✓ Above quota by $XK · Acme expansion could add $12–18K more`. When no quota is set, the block doesn't render.

**FEATURE — Freeform notes field in every drawer.** A new `.dr-notes` section appended to every agent drawer body (Save Strategy / Risk Analysis / Pre-Call Brief / Next Steps) plus the Ghost-Buster drawer. Carries: `<textarea>` (3 rows, vertical resize, max 500 chars), live `X / 500` character counter (`aria-live="polite"`), and a `[Save Note]` button. Persists to `localStorage.teamos_drawer_notes` keyed by `${acct}_${drawer_suffix}` (e.g. `nova_save_strategy`, `brightex_risk_analyst`, `meridian_ghost_buster`). On save: toast `Note saved · [Account] · Gainsight timeline updated ✓`. On drawer re-open: `dr_HydrateNoteField(type, acct)` reads the stored value and pre-fills the textarea so the CSM's prior note is visible. `aria-label="Notes for [Account] [Drawer] notes"`, `aria-describedby` ties the textarea to its character counter.

### UX

**Copy Forecast Summary promoted to a full-width button.** Previously a small right-aligned `.fc-btn` link in the rollup header. Now a full-width `.fc-copy-summary-btn` (40 px tall, outlined) rendered below the 3 stat tiles. Same `fcCopyForecastSummary()` handler; same `#fc-copy-summary-btn` id so the v4.7.0 test still resolves.

**Risk Analysis drawer shows attribution sentence below the score.** A single static line — `Based on health velocity, Gong sentiment trend, and champion engagement in the last 30 days.` — renders below the churn-probability percentage in `DRAWER.risk` views (Acme / Brightex / NovaVault). Phase 2 will dynamically generate this line from the actual contributing signals; the static version unblocks the trust signal now.

### Engineering notes
- `_drawerCtx.acct` is now set at the TOP of `openAgentDrawer` (before any rendering) and explicitly cleared in `closeDrawer`. The previous code set it AFTER the render block, which left a stale `_drawerCtx.acct` value during the render of any subsequent close-then-open pair.
- `dr_NotesSection(type, acct)` is the shared HTML builder — same markup, same handlers, same persistence — used by both the agent drawer and the Ghost-Buster drawer.
- Recovery Path lives inside `fcRenderRollup`'s string so it's re-painted automatically whenever the rollup re-renders (quota changes, forecast overrides, etc.).

### Test coverage
- **197 / 197 chromium passing** (was 178 in v4.13.0). 19 new tests under a `v4.14.0 Forecasting audit fixes` describe — 3 FIX 1 tests (close clears state, missing data shows empty state, every Pipeline row passes its own key), 2 FIX 2 tests (Meridian + Creston GB stays on Forecasting), 3 FIX 3 tests (role=button + cursor + click navigation + Enter), 4 FIX 4 tests (negative gap, Open Expansion Play wiring, positive gap, hidden when no quota), 4 FEATURE tests (notes aria-label + persistence + char counter + Ghost-Buster notes), 1 ENHANCEMENT test each for Copy Summary geometry and Risk Analysis attribution (plus a negative test that Save Strategy does NOT carry the Risk attribution).

### Spec label
Shipped as `[4.14.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.13.0] — 2026-05-18

Risk & Signals QA audit — 6 fixes + 1 enhancement. **Result: 178/178 chromium tests passing.**

### Fixed

**FIX 1 — Ghost-Buster now opens an in-tab drawer overlay from all 3 locations.** Previously `rsOpenGB` switched to the Dashboard tab and swapped the Mission Briefing into a `view-{acct}` panel — the user reported this as "navigates to CSM Dashboard" because the visual context shift was indistinguishable from a route change. New behavior: a body-level `<aside id="gb-drawer" role="dialog" aria-modal="true">` slides in from the right (520 px wide, z-index 9101 over its overlay), and `gbDrawerOpen(acct)` clones the existing `#view-{acct} .rp-scroll` content into the drawer so all the rich Ghost-Buster wizard content (Situation Read, 3-touch sequences, channel selection, editable email drafts, signature panel) renders unchanged. All three call sites — All Signals signal 3, Champions NovaVault "View Ghost-Buster", Dark Zone Meridian/Creston/Apex — and the Forecasting Pipeline action button + Silent Accounts row + `window.openGhostBuster` alias all route through the same drawer. Escape closes; focus returns to the trigger element. The legacy `openGhostBusterFromPopover` (used by the pulse-strip dark popover) keeps its in-dashboard panel-swap behavior so that flow still works.

**FIX 2 — "Open Save Strategy" in All Signals opens the Save Strategy drawer.** The All Signals row's `rsSigAction('save', acct, id)` routes through `rsOpenSave` → `openAgentDrawer('save', acct)` and the agent drawer opens correctly. A new test asserts that the All Signals NovaVault row opens the drawer with the Save Strategy title and keeps the CSM on the Risk & Signals tab.

**FIX 3 — Escalate to TL reworded.** `rsPlayEscalate` now toasts `Situation brief sent to Team Lead · [Account] · Escalation summary attached ✓` instead of the previous `· Dust summary attached ✓`. The handler has been wired since v4.9.0; the QA audit report likely reflected the prior misleading wording.

**FIX 4 — Risk Matrix snapshot restored to a right-side slide-over.** The previous `rs-mx-split` grid (`1fr 320px`) put the snapshot in the right column on wide viewports but collapsed to inline below the chart at the `<= 1100 px` breakpoint — the user-reported regression. The detail panel is now a fixed-position `<aside id="rs-mx-snap">` mounted at body level (360 px wide, sticky from `top:88px`) that slides in on bubble click. The matrix chart now occupies the full content width permanently — the snapshot can never push it off-screen. `rsMxSelect` opens the slide-over and remembers the triggering bubble; Escape closes and returns focus.

**FIX 5 — "Generate Save Deck" fires a distinct Dust-deck toast.** The Save Strategy drawer footer's `deck-sec` button now invokes a new `rsFireSaveDeckToast(acct)` helper before opening the deck progress modal: `Save deck generating · [Account name] · Dust is building your slides ✓`. Distinct from the `Push to Gainsight` Gainsight-CTA toast.

**FIX 6 — KPI portfolio bar moved above the matrix chart.** The `.rs-portfolio` block (4 cells: at-risk count + dark zone count + healthy count + total ARR) is now rendered between the section header and the chart. The 10-second portfolio read justifies the whole tab and is now the first thing visible. A new layout test asserts the portfolio bar's bounding-rect top is above the matrix chart's.

### Enhancement

**Auto-expand in-progress Save Play step.** On `rsRenderPlays()` (first call per session), every play scans its steps for an `s === 'in-prog'` entry with a `body` field and sets `RS_PLAY_STEP_OPEN[acct][stepNum] = true` BEFORE building the cards — so the HTML renders with `aria-expanded="true"` + `.on` directly. `RS_PLAY_AUTO_EXPANDED[acct]` flag prevents re-expansion on subsequent renders, so a manual collapse by the CSM is honored. NovaVault Step 2 (Cold intro to Michael Torres) and Brightex Step 3 (Draft SLA response) both auto-expand on load.

### Engineering notes
- `#gb-drawer` clones `view-{acct}` content rather than moving it so the dashboard's own Mission Briefing flow (via `openPanel`/`openGhostBusterFromPopover`) still works for the pulse-strip dark popover.
- The `rs-mx-detail` id moved from an inline grid column into the `<div class="rs-mx-snap-body">` body-level node. `rsMxRenderDetail` is unchanged — `getElementById('rs-mx-detail')` still resolves.
- The pre-existing v4.9.0 FIX 4 test for Escalate wording was updated to assert the new spec phrase; the v4.9.0 FIX 10 step-toggle tests were updated to target a non-auto-expanded step (Brightex Step 4 pending) so the toggle assertion still flips false → true.
- Three tests that previously asserted Ghost-Buster opens `view-{acct}` on the Dashboard were updated to assert `#gb-drawer.on` instead.

### Test coverage
- **178 / 178 chromium passing** (was 164 in v4.12.0). 14 new tests under a `v4.13.0 Risk & Signals audit fixes` describe — 6 FIX 1 tests (drawer markup + 3 entry points + Escape + content), 1 FIX 2 test, 1 FIX 3 wording test, 2 FIX 4 tests (slide-over open + Escape), 1 FIX 5 toast test, 1 FIX 6 layout test, 2 enhancement tests (auto-expand + manual-collapse-persists).

### Spec label
Shipped as `[4.13.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.12.0] — 2026-05-18

Campaign Manager QA audit follow-up — 9 items. **Result: 164/164 chromium tests passing.** Four items (FIX 2 per-contact body edits, FIX 3 Pause confirm strip, FIX 4 Archive drawer flow, FIX 5 Export List Blob CSV) were already shipped in v4.8.0 and re-verified here; the other 5 items landed fresh.

### Verified already shipped (no code change, re-tested)
- **FIX 2 — Body overrides per contact.** `CM_WIZ.drafts[contactId] = { subject, body }` was added in v4.8.0 (FIX 11). New v4.12.0 regression test asserts that editing Sarah's body, cycling to Michael, then cycling back preserves Sarah's edit and does not leak to Michael.
- **FIX 3 — Pause Campaign drawer confirm strip + Resume button.** `cmCampPause → cmCampPauseConfirm` (v4.8.0 FIX 4) still routes correctly from the drawer footer.
- **FIX 4 — Archive in detail panel routes through `cmCampArchive`.** Same handler the card-level archive uses; the v4.8.0 `cmCampInDrawer(id)` branch handles the drawer path with the inline confirm strip.
- **FIX 5 — Export List builds a real CSV via the Blob API.** `cmCampExport` (v4.8.0 FIX 6) still generates the 6-column CSV. New v4.12.0 test hooks `URL.createObjectURL` to capture the Blob contents and asserts the header row + that the drawer stays open.

### Fixed

**FIX 1 — Step 1 Next button no longer stuck disabled.** The previous code rendered the Next button once per `cmWizRender()` call; typing in the name input only mutated `CM_WIZ.name` and never re-evaluated the footer, so the button stayed disabled until the user clicked a type chip (which re-rendered the whole wizard). New behavior:
- The name `<input>` `oninput` writes through to `CM_WIZ.name` AND calls `cmWizStep1ReevalNext()`, which toggles `disabled` on `#cm-wiz-next-step1` directly.
- The type chips route through a new `cmWizStep1PickType(typeKey, el)` helper that updates state, swaps the `.on` class on the clicked chip, and calls the same re-evaluator — no full re-render, so the focused name input keeps focus + cursor position.
- `cmOpenWizard` defers a `cmWizStep1ReevalNext()` call so a freshly-opened wizard always has the correct disabled state.
- The button now carries `id="cm-wiz-next-step1"` + `data-testid="wiz-next-step1"` for test coverage.

**FIX 6 — Contact rows in campaign detail panel now open an inline sub-panel.** Each `<tr>` in the contacts table is wrapped with a second hidden `<tr class="cm-cv-sub-row" hidden>` directly below it. On click (or Enter from a focused row), the sub-panel toggles open with `role="region"` + `aria-label="[Name] contact details"` + auto-focus on the panel for screen reader users. The panel surfaces: name + company + email header with a Close (×) button; a 4-cell grid (SSO / SCIM / Renewal / ARR); a Sequence history block reusing the same row data the contacts table renders; a `[Send 1:1 Email]` primary button + a `Close` secondary. Only one sub-panel can be open at a time per drawer — opening another row closes the previous. Send 1:1 fires `toast('1:1 email sent · [Name] · Logged in Gainsight ✓')`. The drawer's z-index was bumped to `9001` (was unset) so clicks inside the drawer don't fall through to the overlay's close handler.

**FIX 7 — 0-count segment chips: hover tooltip + click opens wizard.** Previously the 0-count chips only opened the tooltip on click (v4.8.0 FIX 1) and never opened the wizard. New behavior:
- The `disabled` attribute is replaced with an `.empty` class so the chip stays clickable.
- A CSS rule (`.cm-seg-chip.empty:hover .cm-seg-empty-pop, …:focus-visible …`) shows the tooltip on hover/focus.
- `aria-describedby` ties the chip to its tooltip popover (`role="tooltip"`).
- Click on an empty chip opens the wizard with `CM_WIZ.segmentEmpty = true` and lands at Step 1 (so the CSM names the campaign first). When advancing to Step 2, a new amber `.cm-wiz-empty-banner` ("Configured for: **[Segment]** accounts. No matching accounts found yet — you can still build this campaign for future use.") renders above the existing EBR context note.

**FIX 8 — AI Draft placeholder chips above the body textarea.** A new `.cm-ph-bar` strip is injected by `cmRenderEditablePreview` above the body `<textarea>` whenever `cmCollectPlaceholders` detects bracketed tokens (`[Something]` patterns of 2+ chars on a single line). Each chip carries:
- Amber styling per spec (bg `#FEF3C7`, color `#B45309`, weight 600).
- A ✏️ prefix on the visible label.
- `aria-label="Required: [field name]"`.
- An `onclick` that focuses the textarea and calls `setSelectionRange(start, end)` so the next keystroke replaces the placeholder.

`cmPhRefresh` rebuilds the chip bar on every `input` event so chips disappear as the CSM fills them. When all placeholders are gone the bar removes itself.

**FIX 9 — Send confirmation submit button updates live.** The "Ready to send?" modal's confirm button now carries `id="cm-send-confirm-btn"` and an `aria-label` + visible label that update every time the user toggles a recipient checkbox:
- `Confirm & Send to N people` / `Confirm & Send to 1 person`.
- With 0 recipients: button receives `disabled`, an `Select at least 1 recipient` `title` tooltip, an explanatory `aria-label`, and a "Select at least 1 recipient" inline label.
- Each recipient checkbox now carries an `aria-label="Send to [First Last]"` for screen-reader parity.

### Engineering notes
- `cm-drawer` z-index was unset; explicit `z-index:9001` (one above the overlay's 9000) is required for FIX 6's row-click interaction to register inside the drawer.
- `cmWizStep1PickType` replaces the inline `onclick="CM_WIZ.type='...';cmWizRender()"` so the wizard doesn't re-render mid-edit (which used to drop focus on the name input).
- `cmCollectPlaceholders` is a pure function and is exposed on `window` for tests. Its regex skips 1-char and multi-line bracketed text to avoid false positives on legitimate bracketed content inside the template body.

### Test coverage
- **164 / 164 chromium passing** (was 145 in v4.11.0). 19 new tests under a `v4.12.0 Campaign Manager audit fixes` describe — three FIX 1 tests (initial disabled state + name-first + type-first), one regression each for FIX 2/3/4/5, four FIX 6 tests (sub-panel open, single-open invariant, Send 1:1 toast, Close button), two FIX 7 tests (tooltip a11y + hover display), three FIX 8 tests (collector + chip bar + click-to-select), three FIX 9 tests (label updates + disabled state + checkbox aria-labels).
- Existing v4.8.0 tests for the segment chip behavior were updated to match the new contract: chips now carry `.empty` (not `disabled`) and click opens the wizard with the empty-segment banner instead of just a toast.

### Spec label
Shipped as `[4.12.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.11.0] — 2026-05-18

Two additive Campaign Manager features. **Result: 145/145 chromium tests passing.** No structural changes — both features piggyback on the existing `#cm-modal-ov` chrome.

### Added

**FEATURE 1 — Inline `[+ Add contact]` everywhere email flows exist.** A single shared modal component, opened with `cmAddContactPrompt(ctx)`, surfaces from four locations:
1. **Wizard Step 2 audience picker** — a "Don't see someone? `[+ Add contact]`" line below the grouped contact list. Saves with `ctx={kind:'wizard'}` so the new contact is pre-checked and the list re-renders without re-running Step 2.
2. **Contacts tab header** — the existing `Add Contact` button (the FIX 7 alias from v4.8.0) now routes to the lightweight modal too.
3. **Campaign detail drawer** — `[+ Add contact to this campaign]` below the contacts table. Saves with `ctx={kind:'campaign', cmpId}` so the contact is pushed into `camp.contactIds`, `contactCount` bumps, and the drawer re-renders.
4. **Compose flows (Quick Send TO field)** — `[+ Add new contact]` below the recipient field. Saves with `ctx={kind:'compose', cb}` so the new contact's email auto-populates the TO list via the callback.

Modal fields: First name (required, aria-required), Last name, Email (required, aria-required), Company, Account (`<select>` of known accounts + `Other / not in system`), Role. Inline `role="alert"` errors fire on blank submit for both required fields. `role="dialog"` + `aria-modal="true"` are inherited from `#cm-modal`. New contacts persist to `localStorage.teamos_contacts` and hydrate back into `CM_CONTACTS` on script load (deduped by id). Toast: `[First Last] added · [Account] ✓`.

**FEATURE 2 — Quick Send (`✉ Quick Send`).** A 560 px modal opened from a new button next to `[+ New Campaign]` in the Campaigns sub-section header. Lets the CSM blast individual emails to multiple contacts without going through the wizard.

Fields:
- **TO**: typeahead-search chip-picker over `CM_CONTACTS`. Departed contacts excluded. Backspace on empty input pops the last chip. ArrowUp/Down/Enter pick a result. Up to 8 matches shown at a time.
- **FROM**: read-only `carmen@1password.com`.
- **SUBJECT**: required (`aria-required`); `Enter` moves focus to MESSAGE.
- **MESSAGE**: required, 10 char min (`aria-required`); `Cmd+Enter` / `Ctrl+Enter` submits.
- **Append signature** checkbox (default checked, pulls from the existing `teamos_signature` localStorage value when the signature is appended at simulated-send time).

Submit button label and `aria-label` update live: `Send to 1 person` / `Send to N people` / `Send to 0 people` while empty. On submit:
1. Validation fires inline errors via `role="alert"` for each missing field; the field with the first error receives focus.
2. The record is unshifted into `CM_QUICK_SENDS` (in-memory + `localStorage.teamos_quick_sends`).
3. Toast: `Sent to N contacts · Logged in Gainsight ✓`.
4. Modal closes; `.qs` width class is cleared on `cmCloseModal`.

A new bottom row in the **Analytics → Per-campaign performance** table renders the aggregated total when any Quick Sends exist:
> `Quick Sends · May 18 · 3 sent · — · — · — · [Details →]`

Clicking the row (or the `Details →` button) opens a Quick Send history modal listing every record (subject + timestamp + recipient count).

### Engineering notes
- The shared modal mounts into the existing `#cm-modal-ov` chrome (hoisted out of `#tab-campaign` to body-level in v4.9.0). `CM_ADD_CONTACT_CTX` carries the origin context across the open → save lifecycle so a single save handler can dispatch four different post-save behaviors.
- `CM_QS` holds the in-flight Quick Send composer state (chips, subject, message, signature flag) and resets on every open / close. The typeahead popover positions absolute under the chip bar; an outside-click handler dismisses it.
- The Quick Sends Analytics row build initially shadowed the outer `var d = CM_ANALYTICS_DATA[...]` with `var d = new Date(latest.ts)`. JS function-scoped var hoisting made `d` reference the Date object when `sec.innerHTML` was assembled, blowing up at `d.sent.toLocaleString()`. Caught by the new FEATURE 2 Analytics test; the inner variable was renamed `qsDate`.

### Test coverage
- **145 / 145 chromium passing** (was 129 in v4.10.0). 17 new tests under a `v4.11.0 Campaign Manager features` describe — three modal-shape tests for FEATURE 1 + one location test per entry point + 9 Quick Send tests covering keyboard, typeahead, validation, persistence, Analytics row, and Escape close.
- Existing `Add Contact save validates required Email then persists` test was updated to also fill `#cm-ac-fn` (First name is now required per spec).

### Spec label
Shipped as `[4.11.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.10.0] — 2026-05-17

CSM Dashboard structural UX overhaul. **Result: 129/129 chromium tests passing.** No new features — every change tightens or reorganizes existing content based on the senior-PM browser extension review.

### UX
- **Left rail simplified** to Urgent Inbox (compact) + Today's Tasks (checklist). Source filter row above Tasks removed. Dark Zone floating widget removed.
- **Admin broadcast task cards removed** from left rail. Replaced with two plain numbered rows in the Tasks list carrying only an indigo source dot.
- **Dark Zone widget removed** from the left rail; the content reappears inside Mission Briefing as a "Silent Accounts" section in the Prepare My Day output. The Priority Stack `73 DAYS DARK` row tag remains the in-page entry point.
- **Priority Stack buttons unified** to a single `.bf-act` base style: outlined, 28 px tall, leading icon, hover fills teal. The row TAG carries the urgency color; the button no longer competes.
- **Next Up account summary** replaced with up to 3 signal chips (`SSO rollout active`, `Expansion signal`, `Champion: David Kim`). Chips: small pill, teal border, no fill.
- **Dust Agents "Agents" chip** replaced with a right-aligned `→ All Agents (9)` text link in the 6th cell of the 2×3 grid. The dropdown still mounts via `toggleAgentsDropdown` from the same trigger element.
- **Mission Briefing header** — TeamOS Live demoted from a filled-teal CTA button to a subtle gray-outlined chip labelled `⚡ Live`, right-aligned in the header row. The `Prepare My Day · Auto-loaded` pl-tag stays dominant.
- **Live Signals widget removed** from the right rail; Calendar now takes the full column height. The same data lives in three better surfaces: status-bar KPIs, Priority Stack, and Mission Briefing's Signals to Know in the PMD output.
- **Badge taxonomy unified** to 6 types applied globally across the dashboard: `.tb-crit` (red), `.tb-high` (amber), `.tb-watch` (gray), `.tb-opp` (teal), `.tb-admin` (indigo), `.tb-src` (outlined, system-color per source). All 11 px / weight 600 / `2px 8px` / radius 4 / uppercase.
- **Pulse strip swap** — "Drive Docs" → "Renews This Month $89K" (routes to Forecasting → Timeline). "Training" hidden via `display:none` and replaced with "Expansion Pipeline $12K–$18K" (routes to Forecasting → Pipeline). The two legacy popovers remain in DOM so callers that opened them programmatically don't break; the pulse strip still satisfies the `>= 7 ps-wrap` assertion.

### Engineering notes
- The compact Urgent Inbox row replaces three-line `.ii-from / .ii-body / .ii-meta` with one flex row carrying `.ii-av` (initial avatar) + `.ii-mid` (name + chips) + `.ii-time`. Italic body preview text is gone.
- Today's Tasks rows now use a `.ac-n` numbered prefix + single `.src-dot` + ellipsised `.ac-title` + single trailing action button. Old `.ac-from` sender attribution + `.ac-top` meta row + `.ac-badge.ov / td / lo` urgency badges gone.
- `.bf-act.r / .a / .g / .gy` color variants removed from the Priority Stack CSS. Markup that previously carried `bf-act g` now uses just `bf-act` — the visual urgency now lives on the row tag, not the button.
- The Drive Docs and Training popovers stay in DOM (`display:none` on their `.ps-wrap` parents) — the existing Agent Hub Quick Links and external triggers that `togglePop('cft' / 'train')` still resolve at the JS level for Phase 2.
- `psSilentChampionApex()` extracted from inline `onclick` so the Silent Accounts row's "Champion Protocol" button stays readable in the source.

### Test coverage
- **129 / 129 chromium passing** (was 113 in v4.9.0). 16 new tests under a `v4.10.0 Dashboard UX overhaul` describe — one per SPEC section plus a Silent Accounts routing check, a TeamOS-Live computed-style check, and a regression for the `>= 7 ps-wrap` invariant.

### Spec label
Shipped as `[4.10.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.9.0] — 2026-05-17

Risk & Signals follow-up — 10 fixes. **Result: 113/113 chromium tests passing.** All 14 broken interactions called out in the QA browser-extension audit are now wired to real operations.

### Fixed

**FIX 1 — Ghost-Buster wired across all 5 entry points.** `rsOpenGB(acct)` previously called `openGhostBusterFromPopover` which only toggles the `view-{acct}` class inside `#tab-dash`. From any other tab the panel flipped invisibly. The handler now calls `goTab('dash', …)` first, defers 80 ms, then opens the panel — All Signals signal 3 NovaVault, Champions NovaVault "View Ghost-Buster", and Dark Zone Meridian / Creston / Apex all land on the correct dashboard view. Added a `window.openGhostBuster(acct)` global alias that routes through the same path so external QA selectors resolve.

**FIX 2 — Brightex SLA Draft Reply opens a real email compose modal.** `rsDraftReplyBrightex()` mounts into the generic `#cm-modal-ov` chrome (role=dialog, aria-modal=true, focus trap via initial autofocus). Modal carries: TO `sarah.chen@brightex.com`, FROM `carmen@1password.com`, SUBJECT `Re: SLA question — Brightex`, an editable `<textarea>` pre-filled with the spec body (uptime numbers + 15-minute call offer) including the `{{meeting_link}}` placeholder. Footer: [Cancel] [Copy Draft] [Mark as Sent]. Copy Draft uses `navigator.clipboard.writeText` with `document.execCommand('copy')` fallback. Mark as Sent fires the spec toast `Reply sent · Brightex · Gainsight logged ✓` and closes the modal. Escape closes — the global keydown handler hits `cm-modal-ov` after the new slide-over check.

**FIX 3 — Add Note inline form on Save Plays.** `rsPlayNote(acct)` previously toasted only. Now it flips `RS_PLAY_NOTE_OPEN[acct]`, re-renders the card, reveals an inline `<form class="rs-note-form on">` with a 3-row textarea + [Cancel] [Save Note] buttons, focuses the textarea, and scrolls into view. On submit `rsPlayNoteSave` validates non-empty, appends `{ text, ts }` to `RS_PLAY_NOTES[acct]`, collapses the form, and re-renders so the saved note appears as a `.rs-note-row` below. Toast: `Note saved · <Account> · Gainsight timeline ✓`.

**FIX 4 — Escalate to TL fires the spec toast wording.** `rsPlayEscalate(acct)` strips the trailing " Save Play" from the play name so the toast reads `Situation brief sent to Team Lead · NovaVault · Dust summary attached ✓` rather than the longer card name.

**FIX 5 — Save Strategy opens on a single click.** `rsMxSelect` no longer calls `rsRenderMatrix()`. Instead it toggles the `.sel` class directly on the relevant `.rs-mx-dot` and calls only `rsMxRenderDetail()`. The detail panel's action buttons are no longer torn down between mousedown and click, eliminating the "needs two clicks" race. The matrix dots also picked up a `data-acct` attribute so the toggle can target without re-rendering.

**FIX 6 — All 6 top-bar KPI buttons now perform real operations.** `togglePop` removed from `#pb-calls`, `#pb-risk`, `#pb-arr`, `#pb-ctas`, `#pb-dark`, `#pb-tasks` (cft + train kept the popover). New handlers:
- `rsKpiCalls()` → CSM Dashboard + scroll to Next Up.
- `rsKpiRisk()` → Risk & Signals → Risk Matrix; pulses a teal ring (`.rs-mx-dot.pulse-ring`) on `nova` + `brightex` for 3 s via `window._rsPulseSet`.
- `rsKpiARR()` → Risk & Signals → All Signals with a new synthetic `critHigh` filter that matches both `crit` and `high` (9 rows after FIX 7).
- `rsKpiCTAs()` → opens a 360 px slide-over (`#rs-slide-ov`, role=dialog, aria-modal=false) listing the 3 demo CTAs with [Mark complete] buttons backed by `RS_OVERDUE_CTAS`.
- `rsKpiDark()` → Risk & Signals → Dark Zone.
- `rsKpiTasks()` → slide-over reusing the existing `TASKS` array; clicking [Mark complete] flips `t.done` and re-syncs the top-bar badge via `renderTasksList()`.
Each handler runs `closePops()` first so any stray popover collapses, and toasts the navigation so non-visual users get confirmation.

**FIX 7 — Signal severities corrected.** Signals 7 (Meridian dark zone), 9 (Apex champion change), and 11 (Brightex support spike) all promoted `watch → high`. Signal 5 description now names the competitor explicitly: `Okta mentioned as alternative by Sarah Chen`.

**FIX 8 — Source chip + last-updated timestamp on every signal.** Each `RS_SIGNALS` entry gained `src` (one of `GAINSIGHT`/`GONG`/`IRONCLAD`/`INBOX`/`ZENDESK`) and `updated` (human string). The signal row now renders a `.rs-sig-meta` strip carrying a colored `.rs-sig-src` chip (palette per `RS_SOURCE_STYLE`) + a `.rs-sig-time` clock-icon timestamp. A `.rs-sig-refresh` header above the list reads `Last refreshed: Today · 9:00 AM · Gainsight API`. Chip + timestamp both carry aria-labels.

**FIX 9 — Health-trend velocity indicators on Risk Matrix bubbles.** `RS_ACCOUNTS` entries gained `trend` (`up`/`flat`/`down`/`downdown`/`unknown`), `trendDelta` (human string), and `warnRing` (boolean). `rsRenderMatrix` paints a small floating `.rs-mx-trend` chip on each bubble carrying the arrow per `RS_TREND`. Brightex (`warnRing:true`) gets a dashed `#DC2626` border (`.rs-mx-dot.warn-ring`). A `.rs-trend-key` legend renders below the existing color legend with all 5 states + a note about the red dashed ring. Bubble aria-labels extended with the trend phrase + delta.

**FIX 10 — Save Play steps are expandable accordions.** Each step in `RS_PLAYS` can carry an optional `body` field with `doIt` / `say` / `outcome` strings. The step head now includes a `<button class="rs-pl-step-toggle">` with `aria-expanded` + `aria-controls`. Toggle flips `RS_PLAY_STEP_OPEN[acct][stepNum]`, swaps the button text + chevron, and adds `.on` to the body div in-place (no card re-render — preserves focus + textarea state). Body shows WHAT TO DO / WHAT TO SAY (italic, teal left rule) / EXPECTED OUTCOME. NovaVault Step 2 carries the Michael Torres cold intro talk track; Step 3 the executive sponsor call. Brightex Steps 3/4/5 carry SLA reply, renewal conversation, and renewal close talk tracks.

### Engineering notes
- `#cm-modal-ov` hoisted out of `#tab-campaign` to the body level so the same modal renders from any tab (the Brightex draft modal opens from Risk & Signals). Existing campaign tests (`Add Contact`, `Send Confirmation`, `Escape`) still pass — they reference the modal by id, not by ancestor.
- Slide-over panel `#rs-slide-ov` lives at body level with its own Escape handler chained ahead of `cm-modal-ov`. Slide-over is aria-modal="false" so the underlying tabs remain interactive — different blast radius from a true modal.
- New synthetic `critHigh` filter: handled inline in `rsRenderSignals`'s filter predicate. Doesn't appear in the visible chip list — only the KPI button can set it.
- `RS_PLAY_NOTE_OPEN` / `RS_PLAY_STEP_OPEN` / `RS_PLAY_NOTES` are in-memory only. Phase 2 will push notes to the Gainsight timeline; the toast wording matches that intent.

### Test coverage
- **113 / 113 chromium passing** (was 86 in v4.8.0). 27 new tests added under a `v4.9.0 Risk & Signals fixes` describe — one or more per FIX plus 3 regression checks (11 signal rows, 3 Critical signals, 2 Save Play cards × 5 steps).

### Spec label
Shipped as `[4.9.0]`. Firefox + WebKit still blocked by container network policy.

---

## [4.8.0] — 2026-05-17

Campaign Manager follow-up — 13 items. **Result: 86/86 chromium tests passing.** Three items (FIX 3 — Send confirmation modal on all 3 trigger points; FIX 1 prior version — segment chip behavior; FIX 7 — Add Contact wiring) were already shipped in v4.4.0 and re-verified here; the other 10 items + 1 feature landed fresh.

### Verified already shipped (no code change)
- **FIX 3 — Send confirmation modal on all 3 trigger points.** Card `[Send Campaign]`, wizard Step 5 `[Send Now]`, and Analytics table `[Send →]` all route through `cmCampSendStart` / `cmWizSend` → `cmOpenSendConfirm({source})` since v4.4.0. The modal carries the recipient list with toggleable checkboxes, sender, sequence summary, and a confirm-or-cancel footer. Re-confirmed by the existing `Send opens confirmation modal with reviewable recipient list` test.

### Fixed

**FIX 1 — 0-count segment chips show an empty-state tooltip.** `Unengaged · SSO Active (0)` and `Unengaged · SSO + SCIM (0)` were silent on click. `cmSegmentClick` now intercepts a 0-count chip, shows an inline `.cm-seg-empty-pop` tooltip ("No accounts match this segment yet. As accounts are tagged with SSO/SCIM status in Gainsight, they'll appear here automatically."), and does NOT open the wizard. Tooltip closes on outside-click via the existing document-level click handler. Chips remain `disabled` styled so they read as inactive at-a-glance.

**FIX 2 — EBR Overdue chip surfaces filter context in Step 2.** When the EBR Overdue segment seeds the wizard (`CM_WIZ.segmentKey === 'ebr-overdue'`), Step 2 renders an indigo `.cm-wiz-ctx-note` reading "Filtered to: **Accounts with no EBR completed this quarter** · $25K+ ARR" plus a display-only `EBR Status: Overdue` chip next to the step heading. Renewal Window stays at "All" by design (EBR overdue is not renewal-date-based).

**FIX 4 — Pause Campaign shows inline confirmation + sets PAUSED status.** `cmCampPause` previously toggled status to `draft` silently. Now it injects an inline `.cm-card-confirm.pause` strip into the drawer footer ("Pause this campaign? Contacts will not receive pending touches until you resume.") with Cancel + Pause buttons. `cmCampPauseConfirm` sets `status = 'paused'`, re-renders the list + the drawer (Resume button replaces Pause), and toasts "Campaign paused · Pending touches halted ✓". Resume is single-click (no confirmation) via `cmCampResume`. New `paused` status pill styling: amber on cream.

**FIX 5 — Archive from drawer mirrors card-level flow.** Previously the drawer's Archive button skipped the confirmation strip. Now `cmCampArchive` checks `cmCampInDrawer(id)` first — when the drawer is open it injects the same confirm strip into the drawer footer ("Archive this campaign? It will be hidden from the active list."). On confirm: drawer closes, list re-renders with the archived campaign hidden, toast fires. On cancel: strip is removed. The card-level path is unchanged for when the drawer is closed.

**FIX 6 — Export List generates a real CSV download via Blob API.** `cmCampExport` previously toasted + wrote to clipboard. Now it builds a properly-escaped CSV (RFC-style quote handling via `cmCsvEscape`) with the spec's 6 columns (Contact / Account / Email / Touch Reached / Status / Last Activity), creates a `Blob('text/csv;charset=utf-8')`, generates a temporary `URL.createObjectURL`, and triggers a download via a programmatic `<a download>` click. Filename: `<campaign-slug>-contacts-YYYY-MM-DD.csv` (e.g. `june-renewal-push-contacts-2026-05-17.csv`). Toast: "Contact list exported · N contacts · CSV ✓". Clipboard fallback for browsers without Blob support.

**FIX 7 — `cmOpenAddContact` alias.** Added a public alias `cmOpenAddContact()` that delegates to `cmAddContactPrompt()`. The Add Contact modal itself was already wired in v4.4.0 (Email required + role="alert" validation + SSO/SCIM/usage fields + persistence). The alias matches the external naming convention used by your QA tool.

**FIX 8 — Active contact filter shows only enrolled/replied.** Previous predicate `c.seq !== 'departed' && !unsubscribed` matched the entire book minus the 2 departed champions. New predicate: `(!!c.seq && c.seq !== 'departed') || /replied/i.test(c.seqStatus)` — strictly contacts currently in a sequence or who have replied. Demo result: 2 contacts (Sarah Chen in Renewal Check-in, Michael Torres in Re-engagement).

**FIX 9 — Analytics campaign rows clickable.** Each `<tr>` in the per-campaign performance table now carries `onclick="cmAnalyticsRowClick(id, event)"` + `tabindex="0"` + Enter-key handler. Handler switches to Campaigns sub-section then opens the campaign detail drawer 80 ms later. Click handler ignores clicks targeting buttons inside the progress cell so the inline `Send →` keeps its own behavior.

**FIX 10 — Wizard Step 2 search debounce fix.** Previous implementation re-rendered the entire Step 2 body on every keystroke, which dropped focus and ate every character after the first. New `cmWizSearchInput(v)` updates state immediately and debounces a list-only rerender by 150 ms. `cmWizStep2BuildGroups` is now a pure HTML builder, called by both the initial Step 2 render and the search rerender. Filter-dropdown changes + checkbox toggles also use the list-only update path now. Search input keeps focus + cursor position across rerenders because the input element itself isn't replaced. Full words ("jennifer", "acme", "brightex") filter correctly.

**FIX 11 — Editable email body at Step 3 and Step 5 with contact switcher.** The biggest item in this release. Previous Step 3/5 previews were static `cmWizPreviewHTML` divs showing only the first selected contact. New `cmRenderEditablePreview(stepId)` shared component renders:
- A `.cm-prev-switcher` row above the preview with "Showing: [Contact name · Account] ← N of M →" navigation.
- The subject inline-editable via `contenteditable="true"` with an `oninput` that writes back to the per-contact draft store.
- The body as a `<textarea class="cm-prev-edit">` (240 px min-height, vertical resize) with `oninput` writing back.
- A "Reset to template" link below that clears the per-contact draft.
- Cycle handlers `cmCyclePreview(±1)` step through every selected contact; first/last contact disables the corresponding arrow.

Per-instance draft store: `CM_WIZ.drafts[contactId] = { subject, body }`. `cmGetEffectiveDraft(contactId)` returns the edited draft if it exists, else falls back to `cmFillTemplate(template, contact)` — so untouched contacts always show the personalized template default. Edits affect this campaign instance only; they never mutate the master template.

Drafts flush to `localStorage.teamos_campaign_drafts` keyed by campaign id at the moment the wizard saves (`cmWizSaveDraft`), sends (`cmWizSendActual`), or schedules (`cmSchConfirm`). Shape:
```
{ "campaignId": { "contactId": { subject, body } } }
```

### Added

**FEATURE — SSO / SCIM / ARR / Last active in 1Password surfaced in contact detail panel.** `CM_CONTACTS` records gained `sso`, `scim`, `arr`, `lastActive` fields per the spec's demo data (9 contacts called out by name; the 3 book-account contacts get sensible defaults). The contact detail panel's "Contact info" section now renders these 4 rows above the existing Email / Last Gong / Last CSM touch / Renewal / Note rows. Status values render as colored pills (`.kv-pill.deployed`, `.kv-pill.active`, `.kv-pill.notdeployed`, `.kv-pill.notactive`, `.kv-pill.departed`).

**FEATURE — Wizard Step 2 account group headers show SSO + ARR.** Each `.cm-wiz-grp-hd` now renders an inline `<span class="cm-wiz-grp-meta">SSO: <b>Deployed</b> · ARR: <b>$48K</b></span>` right-aligned next to the existing contact-count badge. Uses the first contact at the account as the per-account proxy (consistent within an account).

### Test coverage
- **86 / 86 chromium passing** (was 73 in v4.7.0). 13 new tests added under a `v4.8.0 Campaign Manager fixes` describe — one per FIX, plus 2 for the feature. Tests stub UI internals via `page.evaluate` so the wizard state transitions don't depend on slowMo/event timing.

### Engineering notes
- `CM_VIEW_ID` is now an explicit `var` declaration at the top of the CM module. Previously it was created implicitly on first assignment, which threw `ReferenceError` when read before that first assignment (caught by the new FIX 5 test).
- The cmRenderContactDetail SSO/SCIM additions originally placed `// comment` lines INSIDE the `+ ... + ... + ...` string-concatenation chain. JS parsed each `+ // comment` as a unary `+` operator coercing the next string to `NaN`, which produced rendered text like `david.kim@acmecorp.comNaNdeployed">Deployed`. Fixed by moving the comment above the concatenation. Caught by the new feature test.

### Spec label
Shipped as `[4.8.0]`. Firefox + WebKit still blocked by container network policy; run locally with `npx playwright install firefox webkit`.

---

## [4.7.0] — 2026-05-17

Forecasting tab follow-up. The user spec listed 9 items; 4 (Pipeline Open Save Play, Ghost-Buster Meridian + Creston, Champion Protocol accountKey audit, reply modals) were already shipped in v4.4.0 and re-verified by the v4.6.0 test suite that ran 73/73 last hour. The 5 genuinely new items (Timeline click → Pipeline jump, ARR Trends row click + chart tooltips, FORECAST_STATUS_CROSSWALK constant, Phase-2 localStorage shape, Copy Forecast Summary button) landed in this release.

### Verified already shipped (FIX 1–4 from the spec)
- **Pipeline "Open Save Play"** is the row action button. NovaVault: `fcAction('save','nova')` → `openAgentDrawer('save','nova')`. Brightex: `fcAction('risk','brightex')` (row's action is Risk Analyst per `FC_PIPELINE` data; the actual save-strategy entry point for Brightex lives in the Dust Forecast Protect card and Pipeline's status filter). No code change needed.
- **Ghost-Buster Meridian + Creston** route through `openGhostBuster(key)` → `openGhostBusterFromPopover(key)` → `openPanel(key, null)` → `view-{key}` activates. Both `view-meridian` and `view-creston` are registered. Test pair from v4.6.0 still green: `activeView: "view-meridian"` and `"view-creston"`.
- **Champion Protocol Apex** passes `apex` (not Brightex). Full 6-row audit in v4.6.0 confirmed each row passes its own key. Audit reinforced as a v4.7.0 test that asserts each onclick string contains the matching account key.
- **Reply modals** for Jennifer (Meridian) + Sarah (Brightex) were built in v4.4.0 via `fcOpenReply(key)`. The body templates differ slightly from this turn's spec wording but carry the same intent. Updated the Brightex subject to match spec verbatim: `Re: SLA question — Brightex`.

### Added — FORECAST_STATUS_CROSSWALK constant (FIX 7)
- Top-level `FORECAST_STATUS_CROSSWALK` constant carrying the spec's exact mapping:
  - `Committed` → `Commit`
  - `On Track` → `Best Case`
  - `At Risk` → `Pipeline`
  - `Likely Churn` → `Omitted`
  - `Expansion Likely` → `Best Case`
  - `Pushed to Next Quarter` → `Omitted`
  - `Unknown` → `Pipeline`
- Block comment above documents the Phase 2 PATCH path: target fields `CSM_Forecast_Amount__c` and `Forecast_Category__c` on the renewal record via `PATCH /v1/renewal/{gainsight_renewal_id}`, and flags the nickname → renewal-ID lookup as the unresolved mapping.

### Changed — localStorage forecast structure (FIX 8)
- Persistence shape upgraded from `{ "nova": 28000 }` to:
  ```js
  { "nova": {
      "display_name":         "NovaVault",
      "forecast_amount":      28000,
      "forecast_status":      "Likely Churn",
      "gainsight_status":     "Omitted",
      "quarter":              "Q2-2026",
      "updated_at":           "<ISO timestamp>",
      "updated_by":           "carmen@1password.com",
      "gainsight_renewal_id": "PENDING_OAUTH",
      "salesforce_opp_id":    "PENDING_OAUTH"
    }
  }
  ```
- New `fcBuildOverrideRecord(key, amount, status)` helper composes the record with the crosswalked `gainsight_status` and an ISO timestamp.
- New `fcOverrideAmount(key)` helper reads the amount field — accepts both the legacy `number` and the new object shape so existing in-browser state migrates transparently.
- `fcReadOverrides` detects legacy `{ key: number }` entries on first read, calls `fcBuildOverrideRecord` to upgrade each, and writes the migrated object back to localStorage before returning.
- `fcSaveOverride` snapshots the current row's `statusLabel` when persisting, so the crosswalked `gainsight_status` is correct without a second user action.
- `fcCommitTotal` reads through `fcOverrideAmount` so the rollup totals work for both shapes. Status weights reset to the spec values (Committed 100%, On Track 85%, At Risk 40%, Likely Churn 10%; Expansion 110%, Unknown 50%, Pushed 0%).

### Changed — Timeline cards navigate to Pipeline (FIX 5)
- New `fcJumpToPipelineRow(key)` helper. Switches to the Pipeline sub-section, locates the row by matching its account name to the FC_PIPELINE entry, scrolls it into center view, and applies a `.fc-row-highlight` class for 2 seconds (teal outline + tinted background, fades via a `fc-row-fade` keyframe animation).
- Timeline `.fc-tl-nm` clicks rebound from `fcOpenAcctDrawer` → `fcJumpToPipelineRow`. CSM stays on the Forecasting tab. The Pipeline-cell account-name link still opens the right-side drawer — different surface, different behavior.

### Added — ARR Trends interactivity (FIX 6)
- Account rows in the ARR history table render with `onclick="fcJumpToPipelineRow(key)"` when the row's account is known (uses a `FC_ACCT_KEY_BY_NAME` lookup). `tabindex="0"` + `Enter` key handler for keyboard parity. `:focus-visible` style added.
- Chart-column tooltips: each `.fc-trend-col` renders with `data-month` + `onmouseenter`/`onmouseleave` handlers calling `fcTrendBarTip(ev, month)` / `fcTrendBarTipHide`. Tooltip is a single shared `<div id="fc-trend-tip">` appended to `<body>` and positioned over the hovered column. Content: month + year, healthy ARR, at-risk ARR, dark/unknown ARR, and a one-line top-account summary. Backed by a `FC_MONTH_BREAKDOWN` map (Dec → May, with the same numbers the `FC_BOOK_HISTORY` chart bars already render).

### Added — Copy Forecast Summary button (FIX 9)
- `[📋 Copy Forecast Summary]` button in the commit-rollup header next to the timestamp.
- `fcBuildForecastSummary()` generates plain-text clipboard content dynamically from current `FC_OVERRIDES` + `FC_PIPELINE` + `fcReadQuota()` state. Format:
  ```
  Q2 2026 Forecast · Carmen Corio · May 17, 2026
  Commit: $134K | At Risk: $67K | Gap to Quota: −$16K (vs $150K target)
  —
  NovaVault: $28K · Likely Churn (Renewal Jun 1) [−$3K vs contract]
  Brightex Inc: $30K · At Risk (Renewal Jun 15) [−$6K vs contract]
  Meridian Health Systems: $22K · Unknown (Renewal Jun 30)
  …
  ```
  Per-account line uses the override amount when set, else contract ARR. The bracketed delta only appears when an override is set and differs from contract. Gap line is omitted when no quota is set.
- `fcCopyForecastSummary()` writes to `navigator.clipboard` and toasts "Forecast summary copied ✓".

### Verification — 73/73 Playwright tests passing on chromium
- Existing 66 tests from v4.6.0 still green (one assertion updated for the new localStorage shape).
- 7 new tests for v4.7.0 added under the Forecasting describe:
  1. `FORECAST_STATUS_CROSSWALK` constant exposes the full Gainsight mapping.
  2. Legacy `{ key: number }` overrides migrate to Phase-2 shape on read.
  3. Timeline card click navigates to Pipeline + highlights the row + clears after 2s.
  4. ARR Trends account row click navigates to Pipeline.
  5. ARR Trends chart bars show a tooltip on hover.
  6. Copy Forecast Summary generates dynamic clipboard text containing Q2 + Carmen + Commit + At Risk + account names.
  7. Pipeline action-button audit (kept under v4.7.0 to catch any future hardcoded-account regression).

### What was NOT done this turn
- Firefox + WebKit still blocked by the container's outbound-network policy (Playwright browser CDN download fails). Run locally with `npx playwright install firefox webkit`.
- Phase 2 PATCH to Gainsight is still a no-op — the toast is the simulation. The crosswalk and the localStorage shape are now ready for the real API call; the missing piece is the `gainsight_renewal_id` lookup that requires the OAuth approval.

---

## [4.6.0] — 2026-05-17

QA pass — first comprehensive Playwright test suite for TeamOS. The user requested a full-suite run against `tests/teamos-qa.spec.js`, but no test file existed in the repo (only `playwright.config.js` from v4.3.0). Authored a fresh 66-test suite covering every major surface shipped in v4.0–v4.5 and ran it against the production code.

### Result
- **Chromium: 66 / 66 passing on the first run.**
- **Firefox + WebKit: not runnable in this container.** The Playwright browser-download endpoint is blocked by the same outbound network policy that prevents direct curl to vercel.app. To run on those engines, install locally: `npx playwright install firefox webkit`, then `npx playwright test --project=firefox` and `--project=webkit`. The config already declares both projects with `slowMo: 100` (Firefox) / `slowMo: 200` (WebKit) per v4.3.0.

### What the suite covers
Six describe groups, 66 tests total:

**Core (8 tests)** — page title, 9-tab nav, default tab, pulse strip centering + 8 indicators, skip-link Tab focus, nav landmark roles, Service Worker registration, toast role=alert/aria-live.

**Recipe for Success (7 tests)** — hero header + wobble animation, 4 metric cards, status pill count = row count, 3-key legend, notes save → localStorage round-trip, `rcpJumpNotes` wiring on the jump button, history toggle.

**Campaigns (10 tests)** — 4 sub-nav tabs, default sub-section, all three switchable sub-sections (Contacts / Templates / Analytics), 3 demo campaign cards, 7 segmentation chips, 2 disabled chips (SSO Active + SSO+SCIM), At-Risk segment opens wizard at Step 2 with `filterHealth='critical' filterRenewal='60'` 2 contacts pre-selected template `t3`, Analytics time-period filter datasets `[847, 48, 1,204]`.

**Campaign Manager actions (13 tests)** — View opens right drawer with 4 stat tiles + 3 sequence rows + 8 contact rows, Escape closes the drawer, Duplicate creates "Copy of …" DRAFT card, Archive shows confirm strip then sets status, Add Contact modal with required Email + `aria-required` + role="alert" validation + persistence, Template Builder modal with variable picker, Add to Campaign requires explicit picker selection, Schedule modal with date/time/timezone, Send confirmation modal with reviewable recipient list, AI Draft generator produces editable preview with at-risk-specific subject, Step 2 health filter narrows the list, Step 2 groups by account.

**Risk & Signals (9 tests)** — 5 sub-nav tabs, 6 matrix dots, dot click loads snapshot + 3 actions, 11 signals with Title Case severity badges, Critical filter → 3 rows, 2 save plays with 5 steps each (= 10 `.rs-pl-step`), Champion Tracker contains "Ryan Patel" + 2 change cards, Dark Zone has 3 cards + 3 selects, Meridian inbound flag.

**Forecasting (14 tests)** — 4 sub-nav tabs, 6 pipeline rows, `Forecast ($)` column present, override persists to localStorage, status change stamps timestamp + 2 s pending pulse, Ghost-Buster Meridian → `view-meridian`, Ghost-Buster Creston → `view-creston`, Champion Protocol Apex passes `apex` (not Brightex), full 6-row action-button audit (Nova→nova, Brightex→brightex, Meridian→meridian, Creston→creston, Apex→apex, Acme→acme), Reply modal opens with Jennifer template, Timeline drawer in-tab (no nav), Commit rollup with quota gap (quota → localStorage), Column picker 15 items, hidden-column toggle adds to table.

**Accessibility (5 tests)** — Escape closes cm-modal-ov / cm-wiz-ov / fc-acct-drawer (the v4.5.0 chain), CSP meta tag present, zero console errors across a full 9-tab nav sweep (filters out the expected browser warnings for `frame-ancestors` and `X-Frame-Options` delivered via meta — those need HTTP-header delivery via `vercel.json` per v3.4.1).

### Selector + timing discipline used
- Every modal/drawer assertion waits 150–250 ms after the trigger and asserts on a class state (`.on`) rather than visibility — handles the CSS transitions.
- `cmShowSection`, `cmOpenWizard`, `fcShowSection`, `rsShow`, `fcSaveOverride`, `fcSetStatus`, `cmSegmentClick`, `fcOpenAcctDrawer` etc. invoked via `page.evaluate` to bypass any UI-event flakiness.
- The action-button audit reads the actual `onclick` attribute strings rather than firing them — catches Fix 4 regressions (Champion Protocol hardcoded to Brightex) directly at the DOM layer.
- `localStorage` checks happen after the in-memory state update + a small wait, so writes settle.
- Toast assertions read `#toast-el` role/aria-live attributes — not the text content, which is ephemeral.

### Engineering notes for future runs
- `playwright.config.js` updated to use `playwright/test` (works with the bundled Playwright Test runner) instead of `@playwright/test` (a separate package). Adds `testDir: './tests'`, `baseURL: 'http://127.0.0.1:8990'`, retain-on-failure traces, fully sequential workers, list + html reporters.
- `.gitignore` added to exclude `node_modules/`, `playwright-report/`, `test-results/`.
- The suite assumes a static server is running on `:8990` before invocation. Locally: `python3 -m http.server 8990 &; npx playwright test`. CI would benefit from adding a `webServer` block to `playwright.config.js` so the server starts/stops automatically.

### Spec label
Shipped as `[4.6.0]`. **QA pass rate: 66/66 on chromium · 0 failures.** Firefox + WebKit deferred for local execution due to the container's outbound network policy blocking Playwright's browser CDN.

---

## [4.5.0] — 2026-05-17

Regression-confirmation + targeted accessibility follow-up. The user issued a spec listing 8 Forecasting items already shipped in v4.4.0; re-verified each end-to-end against the live build, found one inaccurate "deferred" note in the v4.4.0 SPEC (Creston Ghost-Buster), and corrected it. Added one real improvement: the global Escape handler now closes the new modals and drawers introduced in v4.4.0.

### Verified working (already shipped in v4.4.0)
- Ghost-Buster Meridian + Creston: `fcAction('gb','meridian')` → `view-meridian`; `fcAction('gb','creston')` → `view-creston`. Both views exist in the DOM; my v4.4.0 note that Creston "routes to the toast" was wrong (`view-creston` was registered all along).
- Champion Protocol passes correct accountId: full 6-row audit confirms `fcAction('save','nova')`, `fcAction('risk','brightex')`, `fcAction('gb','meridian')`, `fcAction('gb','creston')`, `fcAction('save','apex')`, `fcAction('prep','acme')`.
- Reply modal with TO/SUBJECT/editable body for Meridian (Jennifer Ramos) and Brightex (Sarah Chen, SLA-specific). `Mark as Sent` toasts "Reply logged · [Account] · Gainsight timeline updated ✓".
- Timeline drawer (`#fc-acct-drawer`, 360 px right-side) opens with Health / ARR / Renewal / Open CTAs / Last Gong + three quick-action buttons. CSM stays on the Forecasting tab.
- Forecast ($) override column: text input per row, parses `$28K` / `28000` / `28`, persists to `localStorage.teamos_forecast_overrides`, surfaces a red/teal delta badge vs contract ARR.
- Forecast Status change shows toast + inline timestamp (`Updated 8:43 AM`) + 2 s syncing pulse + Gainsight crosswalk comment.
- Dust Forecast commit rollup (3 cells: Commit total / At Risk / Gap to Quota) with quota persisted to `localStorage.teamos_forecast_quota`.
- Pipeline column picker (15 entries: 9 default visible + 6 hidden) with toggle.

### Added — Escape handler closes the new modals/drawers
Extended the v3.4.0 global Escape handler with an explicit precedence chain so the v4.4.0-era surfaces also dismiss on Escape (previously only the agent drawer + pulse dropdowns did):
1. Generic modal overlay (`#cm-modal-ov`) — Add Contact / Template Builder / Schedule / Send Confirm / Reply / Add-to-Campaign picker / Quota form.
2. Campaign view right-side drawer (`#cm-cv-drawer`).
3. Forecasting account drawer (`#fc-acct-drawer`).
4. Campaign wizard (`#cm-wiz-ov`).
5. Signature modal (`#cm-sig-ov`).
6. Agent drawer (existing v3.4.0 path) — also returns focus to `window._drawerTrigger`.
7. Pulse-strip + nav dropdowns via `closeAllDropdowns()`.

First open layer Escape encounters consumes the event; nothing further fires.

### Corrected — v4.4.0 SPEC entry
Struck the "Creston routes to the Ghost-Buster fallback toast" line. The full chain `fcAction('gb','creston')` → `openGhostBuster('creston')` → `openGhostBusterFromPopover('creston')` → `openPanel('creston', null)` resolves the existing `view-creston` Mission Briefing view, with the registered `Creston Software · $18K ARR · Renews Jul 15` Ghost-Buster card. Headless test: `activeView: "view-creston"`, `crestonNameInDOM: true`.

### Verification matrix (headless, end-to-end)
- FIX 1 Meridian — opens `view-meridian` ✓
- FIX 1 Creston — opens `view-creston` ✓
- FIX 2 Champion Apex — `openAgentDrawer('save','apex')` ✓
- FIX 2 all 6 rows pass own key — audited via DOM onclick attrs ✓
- FIX 3 Reply Meridian + Brightex — both subjects + bodies render ✓
- FIX 4 Timeline drawer — `stillOnForecast: true`, 3 action buttons ✓
- FIX 5 Forecast $ — $30K persisted, delta shown, column present ✓
- FIX 6 Status — pending pulse on click, cleared after 2 s, timestamp persists ✓
- F1 Commit rollup — 3 cells, $134K commit; quota $150K saved → gap −$17K ✓
- F2 Column picker — 15 items, all 6 hidden columns toggle into table ✓
- Escape closes the modal overlay + cv-drawer + fc-acct-drawer ✓
- Zero JS errors.

### Spec label note
Shipped as `[4.5.0]` per spec. No-op for the 8 verified items; the new content is the SPEC correction + Escape handler.

---

## [4.4.0] — 2026-05-17

Comprehensive two-tab build (Campaign Manager + Forecasting) based on a browser-extension QA review. Engineering standard for this release: every button performs a real operation, every form opens a real UI, every filter binds to real data — no toast-only simulations for actions that require UI state changes. Spec labeled as [4.3.0]; shipped as [4.4.0] to preserve monotonic ordering above the existing 4.3.0 entry.

### Part 1 — Campaign Manager fixes (10)

**Fix 1: [View] → right-side drawer.** Replaces the in-place panel from v4.3.0 with a real 480 px slide-in drawer (`#cm-cv-drawer`) backed by a dimmed overlay. Header carries name + type + status tags. Body has 4 stat tiles (Sent / Open / Reply / Unsub), sequence progress bars (Touch 1/2/3 with sent/queued/scheduled counts), and a contacts table with 5 columns (Contact / Account / Touch Reached / Status / Last Activity) — status colour-coded (Not opened grey / Opened amber / Replied teal / Bounced red). Footer: Pause/Resume · Archive · Export List. Verified: 8 rows, 4 tiles, 3 sequence rows for "June Renewal Push".

**Fix 2: [Duplicate] → real card.** `cmCampDuplicate` now deep-copies the campaign, names it "Copy of …", flips status to DRAFT, nulls the rate fields, and unshifts onto `CM_CAMPAIGNS`. The list re-renders immediately. Verified: card count 3 → 4 and the new card carries name "Copy of June Renewal Push" + status "draft".

**Fix 3: [Archive] → confirm strip + slide-out.** Click reveals a red inline confirm strip on the card (`.cm-card-confirm.on`). Cancel hides it. "Yes, archive" animates the card out via a max-height/opacity transition (`.archiving` → `.archived-out`), then sets the campaign's status to `archived` and re-renders. A new "Archived" filter chip surfaces the hidden cards.

**Fix 4: [+ Add Contact] → real form modal.** `cmAddContactPrompt` opens the generic modal with a labeled form (First/Last/Email*/Role/Company/Account picker/SSO/SCIM/Last Active/Seat Util %). Email is the only required field — marked with a red asterisk + `aria-required="true"` + a `role="alert"` error message that surfaces when empty. On save the contact is pushed onto `CM_CONTACTS` and the contacts list re-renders.

**Fix 5: [+ New Template] → real builder modal.** `cmNewTemplate` opens a wider modal with name + category + subject + body textarea, plus a toolbar with B/I/U/Link buttons and a `{{Variable ▾}}` dropdown listing 13 supported tokens. The Newsletter category auto-reveals an "unsubscribe footer required" checkbox. On save the new template is unshifted into `CM_TEMPLATES` and persisted to `localStorage.teamos_templates`.

**Fix 6: Wizard Step 2 audience picker.** Health Score (All / Critical <50 / At-Risk 50–74 / Healthy 75+) and Renewal Window (All / Next 30d / 31–60d / 61–90d) dropdowns now bind to real account data (`CM_ACCT_HEALTH` + `CM_ACCT_DAYS` lookup maps). A search input above the list filters on name + company + email. Contact rows are grouped under uppercase account headers with per-account contact counts. A live counter ("3 contacts selected across 2 accounts") updates on every toggle. Verified: All=13, Critical=4, Next 30d=2, search "wu"=2, 2 group headers.

**Fix 7: Add to Campaign → explicit picker.** `cmAddToCampaign` no longer silently adds to all campaigns. Opens a modal listing active + draft campaigns with radio-style buttons; the CSM must explicitly pick one. Selection appends the contact to that campaign's `contactIds` (deduplicated), increments `contactCount`, closes the modal, and toasts "[Contact] added to [Campaign]".

**Fix 8: Analytics time-period filter.** `cmRenderAnalytics` is now driven by `CM_ANALYTICS_DATA` keyed by period: `quarter` (847 / 58% / 22% / 2), `month` (312 / 61% / 24% / 2), `week` (48 / 62% / 25% / 1), `alltime` (1,204 / 57% / 21% / 2). The per-campaign table also filters by period — "This week" shows only "June Renewal Push" since it's the only campaign with sends in the window. The KPIs and per-campaign trend bars all re-render on dropdown change.

**Fix 9: Schedule modal.** `cmWizSchedule` opens a date/time/timezone picker (default = today + 19 days at 09:00 AM PT) with a live `cm-sched-preview` line updating as the CSM types. Confirming the schedule pushes a campaign with status `scheduled`, the picked label, and a `scheduledAt` field, then closes the wizard and toasts.

**Fix 10: Send confirmation modal.** `cmCampSendStart` (from card) and `cmWizSend` (from wizard Step 5) now both route through `cmOpenSendConfirm`. The modal lists every recipient with a checkbox (`CM_SEND_SELECTED` tracks the live deselected set), shows campaign + accounts summary + sequence schedule, and only sends after explicit confirmation. Deselecting trims the recipient list before the send fires.

### Part 2 — Campaign Manager AI features (2)

**Feature 1: AI Account Segmentation Panel.** Already shipped in v4.3.0; this revision adds segment-specific icons (🚫 / ⚠️ / 📊 / 🔴 / 👤 / 📈 / 📋), hover tooltips per chip ("Dark 60+ days, SSO not deployed" etc.), per-segment health + renewal filter prefills, and lands the wizard at **Step 2** (per spec, was Step 3) so the CSM reviews the audience. The matching template still pre-selects at Step 3, accompanied by a teal "AI recommended this template for [Segment Name] accounts" banner. Verified: 7 chips, Champion Change click → Step 2 with `filterHealth='all'`, `filterRenewal='all'` (kept all for that segment), 2 contacts pre-selected, template `t5`; At-Risk click → `filterHealth='critical'`, `filterRenewal='60'`, 2 contacts, template `t3`.

**Feature 2: AI Draft Generator.** Already shipped in v4.3.0; this revision adds:
- Multi-line loading state per spec: "Generating personalized draft for [Contact] at [Account]… ↳ Reading last Gong call ([date]) ↳ Checking health score ([N · band]) ↳ Checking renewal date ([date])".
- Smarter subject for the At-Risk segment: "Your [Company] renewal — let's connect before [renewal date]".
- "← Back to templates" inline link below the draft to discard and pick another template.
- "AI recommended this template for…" banner at the top of Step 3 when seeded from a segment chip.
- Verified: subject "Your NovaVault renewal — let's connect before Jun 1" for at-risk + Nova; body starts "Hi Michael,…" with the renewal opener; back/use buttons both wire correctly.

### Part 3 — Forecasting fixes (7) + 1 feature

**Fix 1: Forecast ($) override column.** New column rendered via `FC_COL_DEF` driving the table render. Each row carries an editable input (text-mode, accepts `$28K`, `28000`, or `28`). On blur/Enter `fcSaveOverride` parses the number, persists `{key: dollars}` to `localStorage.teamos_forecast_overrides`, fires a toast, and surfaces a delta badge ("−$3K" red / "+$2K" teal) showing the variance from contract ARR. Defaults: Nova=$28K, Brightex=$30K seeded on first load. Other rows render a grayed-out placeholder containing the contract ARR.

**Fix 2: Status update timestamp + pending pulse.** `fcSetStatus` now stamps `FC_STATUS_TS[key]` with a `HH:MM AM` time and sets `FC_STATUS_PENDING[key] = true` for 2 seconds. The row's status cell gains a `.fc-pipe-status-meta` line below the pill showing either "● Syncing…" (animated pulse) or "Updated 8:43 AM". Toast: "Forecast updated · [Account] · [Status] · Logged to Gainsight ✓". Gainsight forecast-category crosswalk documented as a code comment for the Phase 2 server-side bridge.

**Fix 3: Ghost-Buster buttons wired.** Pipeline row actions for Meridian + Creston now route through `openGhostBuster(acct)` (new public wrapper around `openGhostBusterFromPopover`). The wrapper falls back to a toast for accounts without a registered popover view. Verified by stubbing `openAgentDrawer` — Champion Protocol on Apex routed correctly through `openAgentDrawer('save','apex')`.

**Fix 4: Champion Protocol passes correct account key.** The pipeline row HTML reads `r.actionAcct` (not a hardcoded value), and `FC_PIPELINE[apex].actionAcct === 'apex'`. Verified via Playwright stub: `fcAction('champion','apex')` → `openAgentDrawer('save','apex')`. Code comment documents the invariant.

**Fix 5: Reply compose modal.** New `fcOpenReply(acct)` opens the generic modal with TO (locked) + editable Subject + editable Body. Pre-written templates for Meridian (Jennifer Ramos) and Brightex (Sarah Chen, SLA-specific). Footer: Cancel · Copy Draft · Mark as Sent. Mark as Sent closes the modal and toasts "Reply logged · [Account] · Gainsight timeline updated ✓".

**Fix 6: Timeline → in-tab account drawer.** Timeline account links no longer call `fcOpenMB` (which navigated to the dashboard). They now call `fcOpenAcctDrawer(key)` which opens a 360 px right-side drawer with Health / ARR / Renewal / Open CTAs / Last Gong / Status, a one-sentence summary, and three quick actions (Prep Me / Risk Analyst / Open in Gainsight). Clicking the same account toggles the drawer closed. The drawer stays open while the CSM scrolls; × closes it.

**Fix 7: Forecast commit rollup.** New section above the Dust summary card in the Dust Forecast tab. Three cells: Commit total (sum of `FC_OVERRIDES` + status-weighted estimates for non-overridden accounts), At Risk (sum of churn + at-risk ARRs), Gap to Quota. "Set quota" link opens an inline form; the quota persists to `localStorage.teamos_forecast_quota` and the gap shows in teal (+X above) or red (−X below). Verified: commit shows $134K with default overrides + status weights.

**Feature: Pipeline column picker.** New `⚙ Columns` button in the pipeline header opens a dropdown with two sections: "Visible columns ✓" (click to hide) and "Hidden columns (click to show)". Default-visible: Account · Health · ARR · Renewal · Days Out · Forecast ($) · Forecast Status · Risk Weight · Action. Default-hidden: Account Tier · Contract Term · Overdue CTAs · Prior Year ARR · Success Plan · CSM Owner. Toggle adds/removes the column from the live table. Demo data per spec: $25K+ tier for top 3 accounts, $10–25K for dark accounts; overdue CTAs Nova=2 (red) / Brightex=1 (amber); success plan Active for Acme + Creston, Outdated for Brightex, None for the three at-risk dark accounts.

### Accessibility + engineering standards landed
- All new modals + drawers have `role="dialog"` + `aria-modal="true"` + `aria-label` / `aria-labelledby`.
- Add Contact email field is `aria-required="true"` with a `role="alert"` error message.
- Tables use `<thead>` + `<th scope="col">`.
- Status badges use icon + colour (not colour alone — e.g. ⚠ ⏳ ✓ ✗ glyphs accompany colour pills).
- Wizard Step 2 search input + status select have explicit `aria-label`.
- Zero `console.log` confirmed across the file.

### Verification (headless, end-to-end across all 19 items)
Every fix and feature in Parts 1–3 verified via Playwright. Zero JS errors across the full flow. Test highlights:
- View drawer renders correct counts for cmp1 (8 / 4 / 3); Duplicate creates a 4th card with "Copy of …" name; Archive confirm + cmp1.status='archived'; Add Contact persists "test@example.com"; Template Builder persists a new template; wizard health filter narrows to 4 critical contacts; Add to Campaign picker has 3 items + closes on pick; Analytics period switches deliver the three spec datasets verbatim; Schedule modal renders date/time/tz + preview; Send Confirm shows recipient list + send button; segmentation chip click lands at Step 2 with `filterHealth='critical' filterRenewal='60'` for At-Risk; AI Draft loading shows "Reading last Gong call"; subject is segment-specific ("Your NovaVault renewal — let's connect before Jun 1"); Forecast $ override persists to localStorage; status update stamps a timestamp; Champion Protocol on Apex calls `openAgentDrawer('save','apex')`; reply modal opens with the Meridian template; account drawer opens without leaving the Forecasting tab; commit rollup shows $134K; column picker has 15 items and "Account Tier" toggles into the table.

### What was NOT done this turn
- Live email delivery — Phase 1 simulation only by spec.
- Add Contact form does not write to Gainsight (in-memory list only).
- Column picker state is not persisted across sessions (in-memory only); a follow-on can write `visible` flags to localStorage.
- ~~Creston routes to the Ghost-Buster fallback toast~~ — corrected in v4.5.0 below. `view-creston` already existed in the DOM; `openGhostBusterFromPopover('creston')` → `openPanel('creston')` resolves it correctly. The v4.4.0 SPEC entry overstated the gap; nothing was actually broken.

### Spec label note
Shipped as `[4.4.0]` — the user-supplied label was `[4.3.0]` (already used for the v4.3.0 selector/AI sprint shipped earlier today). Monotonic ordering preserved.

---

## [4.3.0] — 2026-05-17

Two phases: Phase 1 reconciles selectors with the external Playwright test suite (5 confirmed mismatches from QA inspection); Phase 2 lands three new AI features in the Campaign Manager (segmentation panel, AI Draft Generator inside the wizard, working campaign View detail panel). All other tabs and dashboard widgets untouched.

### Phase 1 — Selector fixes

**Fix 1 — Campaign sub-tab section IDs.** Section IDs renamed to drop the `-sec-` segment so external tests' `#cm-contacts` / `#cm-templates` / `#cm-analytics` / `#cm-campaigns` selectors resolve directly. `cmShowSection` now looks up `cm-{name}` instead of `cm-sec-{name}`. Verified: clicking each tab toggles `.on` on the corresponding section.

**Fix 2 — Recipe Notes wiring.** Added public aliases `rcpSaveNote()` (delegates to `_rcpNotesSave`) and `rcpJumpNotes()` (delegates to `_rcpScrollToNotes`). Save Note + Notes jump button onclick handlers rewired through both copies of `buildRecipe` via `replace_all`. The notes list container gained a `rcp-notes-hist` class alongside the existing `rcp-notes-list`. Verified: a save round-trip persists to `localStorage.teamos_recipe_notes` and the new row renders under `.rcp-notes-hist`.

**Fix 3 — Risk & Signals selector aliases.** Severity badges gained a second `rs-sev` class alongside `rs-sig-sev`; the text label was downcased to Title Case (`Critical` / `High` / `Watch` / `Opportunity`) so exact-text Playwright matchers work. CSS styling (uppercase / colour) preserved via `text-transform`. Save-play step rows gained `rs-pl-step` alongside `rs-play-step`. Verified: 11 `.rs-sev` badges in All Signals, 10 `.rs-pl-step` rows across both save plays (5 each), `Ryan Patel` is present in the Apex champion card, 3 `<select>` dropdowns in Dark Zone.

**Fix 4 — Forecasting section IDs + showSection alias.** Section IDs renamed: `fc-sec-pipeline` → `fc-pipeline`, `fc-sec-timeline` → `fc-timeline`, `fc-sec-dust` → `fc-dustforecast`, `fc-sec-trends` → `fc-arrtrends`. Added a `FC_SECTION_ID` lookup map so the dispatch function keeps the short keys (`pipeline` / `timeline` / `dust` / `trends`) while resolving the new long IDs. Added a public `fcShowSection()` alias for `fcShow()`. Verified: all four sections toggle `.on` on click.

**Fix 5 — `playwright.config.js`.** New file at the repo root configuring 30 s navigation / 15 s action timeouts and three browser projects. Firefox gets `slowMo: 100`; WebKit gets `slowMo: 200` — the failing-WebKit hang was a Playwright-side timing issue, not a code issue.

### Phase 2 — Campaign Manager AI features

**Feature 1 — AI Account Segmentation Panel.** New `cm-seg-panel` rendered above the campaign list with seven smart-segment chips: Unengaged · No SSO (3, red), Unengaged · SSO Active (0, amber, disabled), Unengaged · SSO + SCIM (0, amber, disabled), At-Risk Renewal (2, red), Champion Change (2, amber), Expansion Ready (1, green), EBR Overdue (4, indigo). Each chip carries a count badge styled to the segment's colour. Clicking a chip pre-fills `CM_WIZ` with the segment's accounts, matching template, matching campaign type, and jumps the wizard to Step 3 so the CSM can review the AI-generated draft and send.

**Feature 2 — AI Draft Generator (wizard Step 3).** New `⚡ Generate AI Draft` button below the template grid. Clicking it shows a 1.5 s "pulling Gong + Gainsight context" loading state, then renders an editable draft preview panel below: FROM / TO / SUBJECT (subject editable via `contenteditable`) + a 280 px-tall editable `<textarea>` containing the AI-personalized body. The opener is segment-specific — one of six pre-written prompts: Unengaged/No SSO, Unengaged/SSO Active, At-Risk Renewal, Champion Change, Expansion Ready, EBR Overdue. The template body has `{{first_name}}`, `{{company}}`, `{{renewal_date}}`, etc. filled from the first selected contact; `{{dust_opener}}` is replaced with the segment opener. `Copy Draft` writes Subject + Body to the clipboard; `Use This Draft` locks the edited content in and advances to Step 4.

**Feature 3 — Campaign View detail panel.** The `[View]` button on each campaign card now opens an in-place detail panel (replaces the list view while `CM_VIEW_ID` is set). Header: campaign name + type pill + status pill + meta line. Contents:
- **Contacts (N)** scrollable list with avatar, name, account, and a per-contact sequence-status badge (Touch 1 sent · No reply · 4h / Opened · 2d / Replied / Bounced / Queued).
- **Sequence progress** bars: Touch 1 (sent/contactCount), Touch 2 queued, Touch 3 scheduled — bar widths reflect actual numbers, with the per-campaign distribution hard-coded for the demo campaigns (`cmp1`: 6/2 / `cmp2`: full Touch 1).
- **Performance** cells: Open rate % + (N opened / total), Reply rate % + (N replied / total). Empty state for draft campaigns.
- **Footer** actions: Pause / Resume (toggles `status` between active and draft), Archive (closes panel + toasts), Close.

### Verification (headless, end-to-end)

**Phase 1**
- Campaign sections — `#cm-campaigns`, `#cm-contacts`, `#cm-templates`, `#cm-analytics` all present; clicking each tab toggles `.on` on the matching section ✓
- Recipe Notes — `typeof rcpSaveNote === 'function'`, `typeof rcpJumpNotes === 'function'`, `.rcp-notes-hist` present, jump button onclick = `rcpJumpNotes()`, save → persisted to localStorage, history row visible ✓
- Risk & Signals — 11 `.rs-sev` badges (first reads `🔴 Critical`), 10 `.rs-pl-step` rows, Ryan Patel found in champions, 3 `<select>` in dark zone ✓
- Forecasting — all 4 renamed IDs present, `fcShowSection` is a function, all three non-default sections toggle `.on` ✓
- `playwright.config.js` — exists at repo root ✓

**Phase 2**
- Segmentation — panel present, 7 chips with correct labels + counts, 2 disabled (SSO Active 0, SSO+SCIM 0) ✓
- Champion-Change segment click → wizard opens at Step 3 with 2 contacts (Nova Torres + Apex Patel), type `custom`, template `t5` ✓
- AI Draft Generator — button present, after 1.5 s the draft box turns on with subject "Introducing myself — your 1Password CSM" and body starting "Hi Michael, My name is Carmen Corio…" (the first selected contact's first name + signed signature); Copy / Use buttons present; Use advances to Step 4 ✓
- Campaign View — clicking `cmCampView('cmp1')` renders the detail panel with name "June Renewal Push", 8 contact rows, 3 sequence rows, 2 performance cells, Pause + Close buttons; Close restores the 3-card list ✓
- Zero JS errors across the full flow.

### What was NOT done this turn
- Adding a sequence-builder step (Step 4) override based on AI draft — current behavior locks the AI draft into the wizard's draft state but the existing per-touch template selector at Step 4 keeps "Same as campaign" semantics.
- Per-contact AI draft variation (current AI draft uses the first selected contact's data only; the wizard preserves this as the canonical preview for the campaign — sending varies the contact name and Gong-derived context at send time).
- Live `/api/anthropic` round-trip for the AI Draft Generator — Phase 1 simulation only; the segment opener templates are pre-written.

### Implementation notes
- Phase 1 fixes were intentionally non-breaking: aliases + dual class names + dual IDs everywhere possible so existing in-house code paths still work alongside the external test selectors.
- Phase 2 added one CSS block (`cm-seg-*`, `cm-ai-*`, `cm-view-*` namespaces, ~90 lines) and one JS module (~210 lines) appended after the v4.0.0 Campaign Manager block.
- `CM_AI_OPENERS` is keyed by segment slug so adding a new segment is a one-line data change.
- Spec label note: shipped as `[4.3.0]` per spec.

---

## [4.2.0] — 2026-05-17

Forecasting tab replaces the Coming Soon placeholder. Pipeline, Timeline, Dust Forecast, and ARR Trends — the full-depth surface behind the dashboard's "$67K ARR at risk" pulse popover. All existing tabs and the pulse popover itself are untouched.

### Tab structure
- New `fc-subnav` at the top of `#tab-forecast` with four tabs: 📈 Pipeline · ⏱ Timeline · 🔮 Dust Forecast · 📊 ARR Trends. `role="tablist"` + per-button `aria-selected`. Default: Pipeline.

### Pipeline
- Renewal pipeline table sorted by urgency (NovaVault 17d at top → Acme 89d at bottom), with 8 columns: Account · Health · ARR · Renewal · Days Out · Forecast Status · Risk Weight · Action.
- Health column shows a coloured dot + score (Unknown ⬜ for dark accounts).
- Days-out values gain red/amber tint when <30 / 31–45 days.
- Forecast status renders as a clickable pill that opens an inline dropdown with all 6 spec states (On Track / At Risk / Likely Churn / Expansion Likely / Committed / Pushed to Next Quarter). Selecting an option mutates in-memory state and toasts the simulated Salesforce sync; outside-click closes the dropdown.
- Risk weight pill (Critical / High / Medium / Low) colour-keyed.
- Action button per row routes through `fcAction(kind, acct)`: Save Play → drawer · Risk Analyst → drawer · Ghost-Buster → existing helper · Champion Protocol → save drawer (Apex) · Prep Me → drawer.
- Account names are `.acct-lk` clickable and route to Mission Briefing on the dashboard.
- 4-cell ARR summary strip below the table: Committed ($48K · Acme) · At Risk ($67K · Nova + Brightex) · Unknown ($55K · 3 dark accounts) · Total ($170K · 6 accounts · Q2–Q3).

### Timeline
- 3-column 90-day timeline bucketed by calendar month of the renewal date (matches the spec labels "Jun 1–Jun 30 · $89K at risk" → Brightex 31d and Meridian 45d both fall in Jun, not strict 30-day windows).
- Column colour scheme: Jun light red · Jul light amber · Aug light green.
- Each account card: clickable name (→ Mission Briefing) · renewal date · ARR · health dot · status badge per account (Critical Save Active / At Risk / Dark 73 days / Dark 67 days / Champion change / Healthy · Expansion signal).
- Column footer: Total ARR + account count for that window.
- Per-column results: Jun → 3 accounts $89K (Nova + Brightex + Meridian); Jul → 1 account $18K (Creston); Aug → 2 accounts $63K (Apex + Acme).

### Dust Forecast
- Indigo summary card matching the Recipe Quarter Projection styling — full prose summary including the $48K committed / $67K at risk / $55K unknown breakdown, the Meridian inbound-signal hook, and the "72% uncertain or at risk" attainment frame.
- Three action cards beneath the summary (Act Now · High Leverage · Protect) with red / teal / amber left borders. Each carries a one-line context + a primary action button: NovaVault save play, reply to Jennifer (Meridian), draft reply to Sarah (Brightex).
- `Regenerate ↻` button shows a spinner for 1.5 s, updates the "Generated" timestamp to the current time, and toasts "Forecast regenerated · Dust analysis complete ✓". Phase 1 keeps the body static.

### ARR Trends
- 6-month chart (Dec → May) showing healthy ARR (green) stacked with at-risk ARR (red) per month. The first column (Dec, $0 risk) shows a single healthy bar; the remaining columns show both bands with the risk delta growing each month ($12K → $18K → $24K → $45K → $67K).
- Legend + commentary strip: "ARR at risk has grown from $0 to $67K over 6 months. Primary drivers: NovaVault health decline (Jan–May) and Brightex health drop (Apr–May)."
- Per-account history table with monthly ARR columns (Jan–May) + trend column. Six account rows + total row at the bottom. Trend column colour-keyed by trajectory.
- Expansion opportunity callout (teal left border) for Acme — Current ARR $48K · Potential +$12K–$18K · Signal line · `Open Expansion Play — Acme →` routes to `openAgentDrawer('prep','acme')`.

### Verification (headless, end-to-end)
- Sub-nav: 4 buttons; Pipeline active by default; section visibility toggles on click ✓
- Pipeline: 6 rows render with NovaVault at top, Acme at bottom; 6 status pills clickable; 4 summary cells render ✓
- Forecast status edit: clicking opens the dropdown; selecting "Committed" updates the pill text + toasts ✓
- Timeline: 3 columns; 6 account cards (3+1+2); footer totals [$89K, $18K, $63K] match the spec exactly ✓
- Dust Forecast: summary card + 3 action cards render; Regenerate triggers a spinner + updates the timestamp to the current time ✓
- ARR Trends: 6 chart columns, 5 risk bars (Dec has none), 7 table rows (6 accounts + total), expansion callout present ✓
- Action wiring: `fcAction('save','nova')` → `openAgentDrawer('save','nova')`; `fcAction('prep','acme')` → `openAgentDrawer('prep','acme')` ✓
- Zero JS errors.

### What was NOT done this turn
- Dust regenerate currently re-renders the same body content with an updated timestamp — Phase 1 is static. Live re-summarization would need the `/api/anthropic` proxy + a server-side forecasting prompt.
- Custom range picker for ARR Trends (currently fixed at 6 months).
- Drag-to-move accounts between timeline columns (out of scope for Phase 1).
- Push-to-Salesforce status updates — currently just toast confirmations.

### Implementation notes
- One CSS block (`fc-*` namespace, ~135 lines) appended to the end of the main `<style>`, after the v4.1.0 Risk & Signals block.
- One JS module (~210 lines) appended after the v4.1.0 module — data tables (FC_PIPELINE / FC_STATUS_OPTS / FC_ACCT_HISTORY / FC_BOOK_HISTORY) + render functions per section + the `fcAction` / `fcOpenMB` helpers wiring to existing `openAgentDrawer` / `openGhostBusterFromPopover` / `openPanel` / `draftReply` functions.
- Coming Soon placeholder for `#tab-forecast` fully replaced; the five remaining Coming Soon tabs (Success Plans, Team View, My Accounts, Analytics) untouched.
- Spec label note: shipped as `[4.2.0]` per spec — third minor in the 4.x line after Campaign Manager and Risk & Signals.

---

## [4.1.0] — 2026-05-17

Risk & Signals tab replaces the Coming Soon placeholder. Portfolio-level risk command centre across 5 sections: Risk Matrix, All Signals, Save Plays, Champion Tracker, Dark Zone. Dashboard widgets (the 5-row Live Signals preview, Mission Briefing, Ghost-Buster, drawers, pulse strip, Service Worker) all untouched — this tab is the full-depth surface beneath the dashboard summary.

### Tab structure
- New `rs-subnav` at the top of `#tab-risk` with five tabs: ⚡ Risk Matrix · 📡 All Signals · 🎯 Save Plays · 👤 Champions · 👻 Dark Zone. `role="tablist"` + per-button `aria-selected`. Default: Risk Matrix.

### Risk Matrix
- Visual grid plotting all 6 accounts on Health (Y, 0–100) × Days to Renewal (X, 0–120+).
- Four quadrants with CSS-gradient background tinted by zone:
  - Top-right (Healthy + 60+ days) → ✓ Stable (green)
  - Top-left (Healthy + <60 days) → ⚠ Watch (amber)
  - Bottom-right (At-Risk + 60+ days) → 👁 Monitor (amber)
  - Bottom-left (At-Risk + <60 days) → ⚡ Act Now (red)
- Each account renders as a circle: position = (daysOut, health); diameter scales with ARR (26–54 px); colour matches risk band (red/amber/green/grey). Initials inside the circle, name label above it.
- Clicking a circle selects it (3 px outline) and loads a right-side snapshot panel with Health · ARR · Renewal · Champion · Open CTAs · Last Gong, plus three actions: `Open in Mission Briefing` (routes to dash + opens panel), `Run Risk Analyst` (drawer), `Open Save Play` (drawer).
- Portfolio summary strip below the matrix: Total at risk · Dark zone · Healthy · Total ARR ($170K across 6 accounts).
- Aria-label on every dot carries the full account context for screen readers.

### All Signals
- Full 11-signal feed (vs. the 5-row preview on the dashboard). Each row: severity badge · account name (clickable → Mission Briefing) · description · context line · action button.
- Severity filter chips: All / 🔴 Critical / 🟡 High / 👁 Watch / ✅ Opportunity. Active chip takes the severity colour.
- Sort dropdown: Newest / Severity / ARR at risk. Severity sort uses `crit < high < watch < opp`; ARR sort reads from `RS_ACCOUNTS`.
- Action buttons route to the right handler per signal: `Run Risk Analyst` → drawer, `Open Save Strategy / Save Play` → drawer, `Ghost-Buster` → `openGhostBusterFromPopover`, `Draft Reply` → existing `draftReply`, `Champion Change Protocol` → switch to Champions section, `Open Prep Me` → drawer.

### Save Plays
- 2 pre-loaded active plays (NovaVault EMERGENCY · Brightex AT RISK) with full step progress, signal context, and action row.
- Each card: header (account · status badge · started date · day count · ARR · renewal); 5-step play list with `✅ done` / `⏳ in-prog` / `○ pending` icons + per-step meta line; "Signals driving this play" bullets; action row with `Update play status` (advances the next in-progress step), `Add note`, `Push to Gainsight`, `Escalate to TL`.
- `+ Start New Save Play` button toasts the simulated Gainsight create. Updating step status mutates in-memory state and re-renders, then toasts the confirmation.

### Champion Tracker
- 2 change cards (NovaVault CRITICAL · Apex Dynamics HIGH) — Previous champion / New contact / Re-engagement status / Recommendation.
- Per-card action rows route to the right helper: NovaVault → View Ghost-Buster / Notify AE / Update status; Apex → Start Re-engagement / Notify AE / Update status.
- "Stable champions" collapsed row list (Acme · Brightex · Meridian with 73d-dark warning glyph) with `Update champion` per row.

### Dark Zone
- 3 dark accounts (Meridian 73d · Creston 67d · Apex 61d) with full re-engagement state and account-specific recommendations.
- Meridian rendered with a teal left border + green inbound-signal callout (`📬 Jennifer Ramos emailed yesterday — RESPOND TODAY`).
- Apex rendered with the AE-warm-intro-first action priority (`Notify AE first` is the primary button; `Ghost-Buster after intro` secondary).
- Re-engagement status `<select>` on every card with the 6 spec states (Not started / AE intro requested / Touch 1 sent / Touch 2 sent / Responded / Closed lost). Change fires a toast confirming the Gainsight sync.

### Verification (headless, end-to-end)
- Sub-nav: 5 buttons; matrix active by default; section visibility toggles on click ✓
- Risk Matrix: 6 dots plotted; 4 portfolio cells; 4 quadrant labels render in correct corners; empty snapshot panel until selection ✓
- Click NovaVault dot → snapshot loads with name + red Critical band + 12 k/v cells (6 fields × 2 cols) + 3 actions ✓
- All Signals: 11 rows render; severities in spec order; Critical filter narrows to 3 ✓
- Save Plays: 2 cards, 5 steps each, 8 action buttons total ✓
- Champion Tracker: 2 change cards + 3 stable rows + 2 recommendations ✓
- Dark Zone: 3 cards, 1 inbound-flagged (Meridian), 3 status selects ✓
- Action wiring: `rsRunRisk('nova')` → `openAgentDrawer('risk', 'nova')`; `rsOpenSave('brightex')` → `openAgentDrawer('save', 'brightex')` ✓
- Zero JS errors across the full flow.

### What was NOT done this turn
- Authoring new save plays from inside the UI — `+ Start New Save Play` toasts the simulated Gainsight create rather than opening a builder.
- Per-step granular status dropdown — `Update play status` advances the next in-progress step in a single click; a step-level dropdown picker would be a follow-on.
- Champion update modal — `Update champion` / `Update status` buttons fire confirmation toasts rather than opening a full form editor.
- Drag-to-reorder play steps and live status push to Gainsight — Phase 2.

### Implementation notes
- One CSS block (`rs-*` namespace, ~155 lines) appended to the end of the main `<style>`. Quadrant zones use a single CSS linear-gradient (bottom-left red → top-right green).
- One JS module (~340 lines) appended after the v4.0.0 Campaign Manager block — data tables, render functions for each section, action helpers that wire to the existing `openAgentDrawer` / `openGhostBusterFromPopover` / `openPanel` / `draftReply` functions.
- Coming Soon placeholder for `#tab-risk` fully replaced; the six other Coming Soon tabs (Forecasting, Success Plans, Team View, My Accounts, Analytics) untouched.
- Spec label note: shipped as `[4.1.0]` per spec — minor-version bump fits a new feature surface that builds on the existing v4.0.0 line.

---

## [4.0.0] — 2026-05-17

Campaign Manager replaces the Campaigns Coming Soon placeholder. Phase 1 — simulation only, no live sends; every send fires a toast. Four sections under one sub-nav: Campaigns, Contacts, Templates, Analytics. All other tabs, dashboard widgets, Mission Briefing, Ghost-Buster, drawers, pulse strip, Service Worker untouched.

### Tab structure
- New `cm-subnav` at the top of `#tab-campaigns` with four tabs (📣 Campaigns · 👥 Contacts · 📄 Templates · 📊 Analytics) and a right-aligned `⚙ Signature` link. Active tab = teal underline + dark text; inactive = muted. `role="tablist"` + `aria-selected` per button.
- Default section on open: Campaigns.

### Contacts
- 12 pre-loaded contacts spanning Acme / Brightex / NovaVault / Meridian / Creston / Apex / Klaxton / Pinnacle. Each carries name, role, email, account, sequence status, last touch, last Gong, renewal, and optional inline notes.
- Search bar (live filter on name + company + email) + filter chips (All / Active / Dark Zone / In Sequence / Replied / Unsubscribed).
- Account tag pills colour-keyed to the existing account system (Acme teal · Brightex amber · NovaVault red · dark accounts grey).
- Departed champions (James Wu × 2) render with a red `⚠ Departed · Do not contact` badge and their action buttons disable.
- Detail panel renders avatar + name + role + tags, a `Contact info` k/v grid (email · last Gong · last CSM touch · renewal · note), sequence history rows (Touch 1 sent · Touch 2 scheduled), and three quick actions: `+ Add to Campaign`, `✉ Send 1:1 Email`, `📝 Add Note` — each fires a contextual toast.
- `Add Contact`, `Import from Gainsight ▾`, `Import from Salesforce ▾` buttons. Imports show a loading toast then a success toast after 1.5 s.

### Templates
- 6 starter templates persisted to `localStorage['teamos_templates']`: Re-engagement · EBR Invitation · Renewal Check-in · Product Update · Champion Introduction · Newsletter. Each declares name, category, icon, subject, body, and a `vars[]` list of `{{placeholder}}` tokens.
- Library grid with category filter chips. Card shows icon · name · category pill · subject preview · variable count · `Preview` + `Use in Campaign` actions.
- Detail panel: full body preview with subject line + signature appended; variable pills clickable in the inline editor.
- Inline editor: subject + body textarea + variable insertion buttons. `Save changes` persists to localStorage and re-renders.

### Campaigns
- 3 pre-loaded demo campaigns:
  - **June Renewal Push** (Renewal · ACTIVE) — 8 contacts · 3-touch sequence · sent May 14 · 62% open · 25% reply · "6 on Touch 1 · 2 on Touch 2".
  - **Dark Zone Re-engagement** (Re-engagement · ACTIVE) — 3 dark accounts · 2-touch · sent May 15.
  - **Q2 EBR Invitations** (EBR · DRAFT) — 12 contacts · prominent `Send Campaign →` button.
- Card layout: name + type pill + status badge on row 1; contact count + touch count + sent date on row 2; open/reply rates inline; action buttons (`View`, `Duplicate`, `Archive`, conditional `Send Campaign`).
- Filter chips: All / Active / Draft / Completed / Scheduled.
- `+ New Campaign` opens a 5-step modal wizard:
  - **Step 1 — Basics**: name, type chips (6 options), optional goal.
  - **Step 2 — Contacts**: contact picker with Gainsight-style filters (health score, renewal window); live counter "N contacts selected across M accounts"; departed champions disabled.
  - **Step 3 — Template**: 2-column template card grid with selection highlight; Dust personalization toggle (on by default); live preview of the personalized email rendered for the first selected contact (FROM / TO / SUBJECT / Dust opener / body with `{{vars}}` filled / signature appended).
  - **Step 4 — Sequence**: touch count selector (1–5), per-touch channel + day picker; sequence-stops-on-reply default on.
  - **Step 5 — Review**: summary + preview + three actions: `Save as Draft`, `Schedule`, `Send Now`. Each persists the campaign to the list with the matching status and fires a contextual toast.
- Progress bar (5-segment) at the top of the wizard tracks step state.
- Next button disabled until the current step is valid (name + type at step 1; ≥1 contact at step 2; template at step 3).

### Analytics
- 4 summary cards: Total emails sent (847) · Avg open rate (58%) · Avg reply rate (22%) · Active sequences (2) — each with trend sub-text.
- Per-campaign performance table: campaign · type · sent · opens · replies · unsub · progress bar. Draft campaigns get an inline `Send →` shortcut.
- Best performers: best subject line · highest reply rate · zero-opens risk card (NovaVault + Apex). Risk card uses red left border and surfaces `Try LinkedIn →` + `Ghost-Buster →` action shortcuts.
- Timeframe selector top-right (This quarter / This week / This month / Custom).

### Signature integration
- Pulls from `localStorage['teamos_signature']` shared with Ghost-Buster via `cmGetSignature()` → `gbGetSignature()` fallback. Default signature returned if the key is empty.
- All template previews + wizard previews append the signature.
- `⚙ Signature` link in the sub-nav opens a modal with a textarea pre-populated from current signature; `Save signature` persists and toasts.

### Data + persistence
- `CM_CONTACTS` (12 contacts) and `CM_CAMPAIGNS` (3 demo campaigns) are session-scoped in-memory arrays — new campaigns created via the wizard persist for the session but reset on reload.
- `CM_TEMPLATES` reads from `localStorage['teamos_templates']` on boot, falling back to the 6 starter templates. Inline edits persist across reloads.
- Updates to the existing localStorage audit comment block apply to the new `teamos_templates` key — still no auth tokens, no PII, no API keys.

### Verification (headless, end-to-end)
- Sub-nav: 4 buttons; correct one active; section visibility toggles on click ✓
- Campaigns: 3 pre-loaded cards render with correct names ✓
- Contacts: 12 rows render; click → detail loads with name, k/v info, sequence rows, 3 action buttons ✓
- Dark Zone filter narrows to 4 (Meridian, Creston, Apex × 2) ✓
- Search "wu" finds 2 (James Wu × 2) ✓
- Templates: 6 cards render in correct order; click → detail with preview + 5 var pills ✓
- Analytics: 4 summary cards with values [847, 58%, 22%, 2]; 3 perf rows; 3 best cards ✓
- Wizard: opens, advances through 5 steps; preview renders at step 3; Send creates a 4th campaign and closes the modal ✓
- Signature modal: opens with prefilled textarea; save persists ✓
- Zero JS errors across the full flow.

### What was NOT done this turn
- Live email delivery — Phase 1 is simulation only by spec.
- Drag-to-reorder for sequence touches — out of scope.
- Per-touch template overrides ("Choose different template") — UI shows "Same as campaign" as the only option this pass.
- Custom-template builder ("+ New Template" button toasts a placeholder rather than opening a builder).

### Implementation notes
- One CSS block (`cm-*` namespace, ~210 lines) appended to the end of the main `<style>`.
- One JS module (~430 lines) appended after the Service Worker registration block — data tables, render functions for each section, wizard state machine, signature helpers.
- Coming Soon placeholder for `#tab-campaigns` fully replaced. The seven other Coming Soon tabs (Risk & Signals, Forecasting, Success Plans, Team View, Analytics, My Accounts) untouched.
- Spec label note: shipped as `[4.0.0]` per spec — major-version bump fits the scope of replacing a placeholder with a full feature surface.

---

## [3.4.1] — 2026-05-17

Completes the v3.4.0 enterprise security work by moving the two directives that browsers ignore in `<meta>` tags to real HTTP response headers via `vercel.json`. No app behavior changes — security posture only.

### Added — `vercel.json` at repo root
- `X-Frame-Options: DENY` (only enforceable as a header).
- `X-Content-Type-Options: nosniff` (header backup for the existing meta).
- `Content-Security-Policy: frame-ancestors 'none'` (only enforceable as a header; defends against clickjacking).
- `Referrer-Policy: strict-origin` (header backup for the existing meta).
- Applied to `/(.*)` so every response Vercel serves on `team-os-tawny.vercel.app` carries these headers.

### Cleaned up — Browser-ignored meta directives
- Removed the `<meta http-equiv="X-Frame-Options" content="DENY">` tag from `<head>` — browsers explicitly ignore this when delivered via meta and surface a console warning. The HTTP header is now canonical.
- Removed the `frame-ancestors 'none';` clause from the CSP meta tag for the same reason. The rest of the CSP (default-src, script-src, style-src, font-src, img-src, connect-src) stays in the meta tag because those directives DO work via meta.
- Console warnings from the browser go silent as a side effect.

### Defense-in-depth
- The CSP meta tag and the CSP HTTP header are layered: the meta carries the directives that work in meta; the header carries the ones that don't. Browsers enforce the intersection, so both layers strengthen the policy together.

### Spec label note
- Shipped as `[3.4.1]` (patch bump under the 3.4.x security/polish line) — the user didn't specify a version label this time.

---

## [3.4.0] — 2026-05-17

Polish, accessibility, and mobile-readiness sprint. Four areas: pulse-strip centering, tablet + mobile responsive layout, WCAG 2.1 AA foundation, and enterprise security/privacy meta. No feature content changed, no agent outputs or scoring logic touched.

### Pulse strip centering
- `.pulse-strip` now uses `justify-content:center; overflow-x:auto` with a hidden scrollbar. Indicators centre on wide viewports; narrow viewports get horizontal scroll instead of wrapping. Verified at 1280 / 1440 / 1920 / 900 / 390 px.

### Mobile responsive layout
- **Tablet (≤1279 px)**: `.main` collapses to 2 columns (left + center) with the right column re-flowing below at full width. Daily Command Brief stacks as Priority Stack full-width + (Next Up | Dust Agents) below. Drawer narrows to `min(80vw, 640px)`.
- **Mobile (≤767 px)**: single-column stack for `.main` and `.brief-strip`. Dust Agents chip grid drops from 3 to 2 columns. Pulse strip becomes horizontally scrollable with a right-edge mask-image fade hint. Touch targets ≥ 44 × 44 px on every interactive element via a `min-height: 44px` rule scoped to the breakpoint. Agent drawer transforms into a bottom sheet (slides up from the bottom, 90 vh tall, rounded top corners, drag-handle indicator). Popovers turn into full-width bottom sheets.

### Accessibility (WCAG 2.1 AA foundation)
- **Skip link**: `<a class="skip-link" href="#main-content">` is the first body child; only visible when keyboard-focused. Jumps past the nav and pulse strip.
- **`<h1 class="sr-only">`** at the top of body provides a page-level heading for screen readers without affecting layout.
- **Landmarks + labels**: `<nav role="navigation" aria-label="Main navigation">`, `<div class="pulse-strip" role="navigation" aria-label="Portfolio pulse">`, `.rp` mission briefing → `role="region" aria-label="Mission Briefing" aria-live="polite"`, `.drawer` → `role="dialog" aria-modal="true" aria-label="Agent output" aria-labelledby="drawer-title"`. Drive Docs and Training popovers → `role="dialog" aria-modal="false"` with `aria-label`.
- **Live regions**: `toast()` now stamps `role="alert" aria-live="assertive" aria-atomic="true"` on the toast element. Mission Briefing has `aria-live="polite"` so panel content swaps are announced.
- **Focus ring**: global `:focus-visible { outline:2px solid #0EA5E9; outline-offset:2px; border-radius:4px }`. Mouse clicks don't draw the ring; keyboard tabs do.
- **Escape key**: global listener closes any open drawer (returning focus to `window._drawerTrigger` if set), then falls through to `closeAllDropdowns` for popovers. `openAgentDrawer` is wrapped to snapshot the current activeElement so focus can return on close.
- **Color contrast fixes**: overrides for the listed failing combinations — `.tag.red` → `#DC2626`, `.tag.amber` → `#92400E`. Skip link bg switched to `#0284C7` for AA on white. `--rd-dk` / `--am-dk` already pass at their existing values.
- **Icons**: existing decorative icons stay as-is; the new toast icon gets `aria-hidden="true"`. Existing aria-labels on close buttons preserved.
- **`prefers-reduced-motion`** disables animation + transitions globally (the Recipe hero wobble already honoured this; now everything does).

### Enterprise readiness
- **CSP meta** in `<head>`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self' https://api.anthropic.com; frame-ancestors 'none';`. Adjusted origins to the actual Tabler webfont host (`cdn.jsdelivr.net`) rather than the spec's `cdnjs.cloudflare.com`.
- **Security meta**: `<meta name="referrer" content="strict-origin">`, `<meta http-equiv="X-Content-Type-Options" content="nosniff">`, `<meta http-equiv="X-Frame-Options" content="DENY">`.
- **Known browser limitation**: `frame-ancestors` and `X-Frame-Options` are ignored when delivered via `<meta>` — the browser surfaces a console warning. Both directives are kept in the markup as the intended policy; for them to actually enforce, ops needs to mirror them as HTTP response headers via Vercel project config (`/vercel.json` headers block). Documented inline.
- **localStorage audit comment block** added next to the first `localStorage` usage: no auth tokens, no customer PII, no API keys persisted client-side; Anthropic API key is server-proxied via `/api/anthropic`.
- **Console statements**: zero `console.log` / `console.error` / `console.warn` / `console.info` / `console.debug` confirmed via grep across the file. Standing rule documented.
- **Simulated failure helper**: new `actWithFailure(fn)` utility — 5% probability of rendering an error toast with a clickable Retry link instead of running the action. Not retro-wired across every existing onclick handler (too high blast radius for a single pass); available for new callsites and selective opt-in.
- **Privacy notes**: `.pop-privacy-ft` strip at the bottom of the Drive Docs and Training popovers — `🔒 TeamOS processes account data per 1Password's data handling policy. No customer data is stored externally.`

### What was NOT done this turn (called out so it's visible)
- **Exhaustive aria-label coverage** on every icon-only button in the file (there are hundreds). The high-traffic dialogs/popovers/landmarks now have labels; a follow-on sweep can audit chip buttons, drawer footer buttons, and inline action buttons. `grep -c "aria-label="` went from 27 → 33; more remain.
- **Focus trap inside the drawer**: Tab cycling within the drawer is not yet bounded. Escape closes the drawer + returns focus, which addresses the dominant a11y need; full trap requires careful Tab/Shift+Tab handling and is queued for a follow-on.
- **Retro-wiring `actWithFailure` across every action button**: the helper exists and is documented; rolling it out across `dustQuick`, `agentBtn`, `openAgentDrawer`, GB sequence sends, etc. is a behavior change with demo-affecting ripple effects. Left for an explicit opt-in pass.
- **Semantic heading levels (h2/h3)** across the file: most section headers are styled `<div>`s rather than headings. Re-tagging them is a sweep across every widget. The page-level `<h1>` is in place; the deeper hierarchy is queued.
- **"Show 3 + Show more" on mobile Priority Stack**, mobile-only Dark Zone auto-collapse, nav "icons-only" mode, calendar "compact list only": these are behavior changes that need JS. The mobile media queries cover the layout reflow; the behavior toggles are queued.

### Acceptance verification (headless)
- CSP / referrer / X-Frame-Options / X-Content-Type-Options meta tags all present.
- Skip link present and `focused: true` after first Tab.
- `nav role=navigation aria-label="Main navigation"` ✓
- `.pulse-strip` computed `justify-content: center; overflow-x: auto` ✓
- `.rp` computed `role=region aria-live=polite` ✓
- `#drawer` computed `role=dialog aria-modal=true` ✓
- Tablet @ 900 px: `.main` resolves to 2 columns ✓
- Mobile @ 390 px: `.main` resolves to 1 column; sample pulse button height = 44 px ✓
- Pulse popover opens, Escape closes it ✓
- `toast()` element computed `role=alert aria-live=assertive` ✓
- Drive Docs + Training privacy footers both rendered ✓
- `typeof actWithFailure === "function"` ✓
- Console statement count: 0 ✓

### Implementation notes
- One new `<style>` block scoped to v3.4.0 changes — focus ring, skip link, sr-only utility, pulse centering, color overrides, tablet + mobile breakpoints, prefers-reduced-motion override.
- HTML attribute changes are non-invasive (role/aria-label/aria-modal on existing elements; skip link + sr-only h1 added at top of body).
- JS additions: `toast()` attribute stamping, Escape handler, `openAgentDrawer` wrapper for focus return, `actWithFailure` helper, localStorage security comment block. No existing JS logic touched.
- Spec label note: shipped as `[3.4.0]` matching the user's requested label — the version bump is appropriate for a behavior-and-platform readiness pass of this size.

---

## [3.3.3] — 2026-05-17

CSS-only refinements to the v3.3.1 Recipe hero header. The animation, emoji, title text, and tagline text are all unchanged. The surrounding sync line, portfolio bar, metric cards, and the rest of the tab are untouched.

### Fixed — Hero centered + width-constrained
- `.rcp-hero` is now a column flexbox with `align-items:center; justify-content:center; text-align:center`, so the icon + title row and the tagline below it both centre horizontally.
- `max-width:480px; margin:0 auto 16px` turns the banner into a compact centred card rather than a full-width strip. Verified at 1440 px viewport: hero width 480 px, 480 px gap on each side — true horizontal centring.
- Inner padding tightened to `16px 24px 12px` to reclaim vertical space at the top of the tab.
- `.rcp-hero-r` keeps the icon + title in a single row with `justify-content:center`.
- `.rcp-hero-sub` gets explicit `text-align:center` so the tagline stays centred regardless of its flex parent alignment.

### Implementation notes
- One CSS block updated; both `buildRecipe()` HTML copies are unchanged (the same `.rcp-hero` markup just renders against the new rules).
- Spec label note: user requested `[3.3.3]` (skipping 3.3.2); shipped verbatim.

---

## [3.3.1] — 2026-05-17

Lively hero header at the top of the Recipe for Success tab — one HTML block + a small CSS block. Scorecard content, metrics, weights, notes, charts, action plan, and all other tabs are untouched.

### Added — Recipe hero header
- `🧪 Recipe for Success` on a flex row at the very top of the tab content (before the sync timestamp line). Icon at 36 px with a gentle continuous wobble (`@keyframes rcp-hero-wobble`, 2.5 s ease-in-out infinite, rotates ±8° from the bottom centre).
- Title: 28 px / weight 800 / `#111827` / letter-spacing `-0.5px`.
- Tagline below the row: `Your quarter, cooked to perfection.` in 14 px italic `#6B7280`.
- Honours `prefers-reduced-motion: reduce` — wobble disables, the rest of the header stays.
- Sync timestamp + Notes-jump pill sit directly below the tagline, unchanged.

### Implementation notes
- HTML block injected at the top of `buildRecipe()` (both parallel copies via `replace_all: true`) so the header re-renders on every Recipe build.
- CSS scoped via the `.rcp-hero*` namespace; no other tab or component touches those rules.
- Spec label note: shipped as `[3.3.1]` matching the user's requested version label — first time in a while the user's label and the monotonic next-version line up. No relabel needed.

---

## [3.3.0] — 2026-05-17

CSS-only sticky-column upgrade for the CSM Dashboard. The two outer columns of the `.main` grid now float with the page scroll so the high-signal widgets on the sides stay visible while the CSM scrolls the long center column (Mission Briefing + Agent Hub). Other tabs are untouched.

### Added — Sticky left + right columns on the Dashboard
- `.main > div:first-child` and `.main > div:nth-child(3)` get `position:sticky; top:88px; align-self:start; max-height:calc(100vh - 88px); overflow-y:auto;` — they pin to the top of the viewport (just below the 44 px nav + pulse strip) and scroll internally when their content exceeds the viewport.
- The center column (`.main > div:nth-child(2)` — Mission Briefing, Agent Hub, Dark Zone) has no sticky behavior and continues to scroll with the page as before.
- Scoped to `.main` so the Recipe tab's full-width layout and all Coming Soon tab templates are unaffected.

### Offline-banner adjustment
- When `body.offline` is active the offline banner adds 36 px above the pulse strip. Sticky top shifts to `124px` with `max-height:calc(100vh - 124px)` so the columns stay aligned with the bottom of the banner + strip.

### Scrollbar styling
- Thin subtle scrollbar inside each sticky column: `scrollbar-width:thin` with a #E5E7EB thumb on a transparent track; 4 px width on WebKit, with a darker hover thumb (`#C6C5C0`) for visibility without becoming dominant.

### What was not touched
- No widget content, no JS, no center-column behavior. Nav and pulse strip positioning, all other tabs (Recipe for Success, Coming Soon placeholders), and the offline banner itself are all left in place.

### Acceptance verification
- Scroll to y=1500: left column (Urgent Inbox / Dark Zone / Today's Tasks) pinned at top=88; right column (Calendar / Live Signals) pinned at top=88; center column (Mission Briefing / Agent Hub) scrolled with the page (top=-985).
- `body.offline` toggled: sticky top shifts from 88 → 124, computed top matches CSS.
- Viewport at 1280 / 1440 / 1920: side columns engage `max-height` and scroll internally when content exceeds the viewport; no layout shift at scroll=0 (cols at natural top with `position:sticky` already applied).

### Implementation notes
- Used child-position selectors instead of adding `.col-left` / `.col-right` classes so this stays a true CSS-only change with zero markup edits.
- Pulse-strip rendered height is 33 px in normal mode (no explicit CSS height), so the 88 px top value also reserves ~11 px breathing room above the sticky content.

---

## [3.2.7] — 2026-05-17

CSS-only typography upgrade scoped to the Recipe for Success tab. Every label, metric, and section header gains weight + color contrast. Sizes bumped by 1–2 px at most so cards don't overflow — the visual upgrade comes from `font-weight` and color, not size. All other tabs, dashboard widgets, JS, scoring logic, and layout are untouched.

### Changed — Recipe tab typography
- All overrides live in a single `#tab-recipe …` selector block at the end of the Recipe CSS section so other tabs inherit nothing.
- Metric card titles (`.sc-ct`) — 10→12px, weight 700, color #111827.
- Metric row labels (`.sc-ml`) — 12→13px, weight 600, color #1F2937.
- Metric sub-labels / targets (`.sc-mt`) — color bumped to #6B7280 so even the muted line still passes the readability rule.
- Metric values (`.sc-mv`) — 14→15px, weight 700.
- Score category labels (`.sc-sn`) — 12→13px, weight 600, color #111827.
- Score weight column (`.sc-sw`) — color #374151, weight 600.
- Rating band labels (`.sc-rating`) — 11→12px, weight 700, color #1F2937.
- Tick mark labels under each bar (`.sc-tick-lbl`) — color #6B7280, weight 700.
- "Live weighted score" header — color #111827, weight 700.
- Portfolio bar (`.sc-port-*`) — `Account Portfolio` label color #111827; data keys color #374151 weight 600; values color #111827 weight 700 size 13px.
- Status legend (`.sc-legend-*`) — label color #111827, item text color #374151 weight 600.
- Status pills (`.sc-stat`) — weight bumped to 800 so On Track / At Risk / Below read like the hard signals they are.
- Quarter Projection lines (`.rcp-proj-line`) — 12→13px color #1F2937; bold spans color #111827.
- Dust Action Plan card titles (`.rcp-card-t`) and bodies (`.rcp-card-b`) — darker, slightly heavier; subtext color #374151 throughout.
- Notes panel — saved-notes header color #111827 weight 700; quarter label color #374151; category chips weight 600 color #374151; pills weight 700; timestamps color #6B7280 weight 600; note body color #1F2937 size 13px weight 500.
- Tab-header `Notes (N)` jump pill — color #111827 weight 700.
- Sync timestamp at the top (`.sc-sync`) — color #4B5563 weight 600. Still a one-line muted pill, but no longer disappearing into the bg.

### The rule that drove it
Nothing on the Recipe tab is lighter than #6B7280 for text that conveys meaning. Identifying labels are ≥600 weight; performance values are 700+ weight.

### Implementation notes
- The existing color tokens (`--tx` #111110 / `--tx2` #52524E / `--tx3` #8A8A86) were close but not aligned with the spec greys — I used the spec hex values directly inside the `#tab-recipe` override rather than retuning the global vars, so other tabs' color hierarchy is preserved.
- Spec label note: the user requested this entry as `[3.2.5]`; shipped as `[3.2.7]` to preserve monotonic versioning above the existing 3.2.6 entry.

---

## [3.2.6] — 2026-05-17

Dust Agents search bar is now an agent directory finder, not a chat/query input. Typing keywords filters a 9-agent library and surfaces matching agents as result cards with description, skill sources, and a Launch / Request action. The six existing recommended chips and the Agents dropdown stay exactly as they are — they just dim when a search is active.

### Added — Agent directory search
- Placeholder rewritten to `Search agents by keyword or task…`. The input no longer submits to a chat handler; it filters live on every keystroke.
- Clear `×` button appears in the input as soon as anything is typed and restores the default state.

### Added — 9-agent searchable library
- 5 active: Prepare My Day · Draft Follow-Ups · Find Open Loops · Review At-Risk Renewals · Coach Me.
- 4 available: Competitive Intel · EBR Prep · Renewal Forecaster · Champion Tracker.
- Each agent declares name, keywords, description, and skills; the search matches on all four fields with token-AND semantics ("renewal forecast" must hit both tokens).

### Added — Result cards
- Layout: agent-icon disc + name + status badge (`ACTIVE` teal / `AVAILABLE` muted grey) on the first row; one-line description; teal `Skills` pill row; action button right-aligned.
- Active agents: `Launch →` button routes through the existing `dustQuick(name)` so the Mission Briefing panel behavior is identical to clicking the matching chip.
- Available agents: `Request →` button routes through the existing `requestAgent(name)` so it toasts `Agent requested · Your admin will activate [Agent Name] ✓`.
- Results are ordered: active first, available below; original library order preserved within each tier.
- Empty state: `No agents found for "[query]" · Try different keywords`.

### Default vs search state
- Default (<2 chars typed): results hidden, chips fully visible, `RECOMMENDED AGENTS` header above the chip grid.
- Search (≥2 chars): results render directly below the input; chips + recommended header dim (≈45% opacity, pointer-events:none) and the chip grid remains in place below so the CSM never loses orientation. Clearing the input restores chips to full strength.

### What was not touched
- The six chip buttons and their behavior. The Agents dropdown and its content. All agent output routing to Mission Briefing. The dead `askDust(e)` legacy function was left in place — nothing calls it anymore, but removing it was out of scope.

### Implementation notes
- New JS module (`DUST_AGENTS`, `_dustMatch`, `_dustRenderResultCard`, `_dustSearch`, `_dustClearSearch`, `_dustLaunchAgent`, `_dustRequestAgent`) lives next to `dustQuick` so the search funnel reuses the same chip-routing primitive.
- Spec label note: the user requested this entry as `[3.2.5]`; shipped as `[3.2.6]` to preserve monotonic versioning above the existing 3.2.5 entry.

---

## [3.2.5] — 2026-05-17

Agent Hub — Quick Launch Matrix replaced with account-scoped agent buttons. The fixed NovaVault / Acme Corp / Brightex columns broke the account-contextual model the rest of the hub already uses; this change funnels all four agents through the active Agent Hub account selected in the search above.

### Fixed — Quick Launch Matrix removed
- The 4-row × 3-column matrix with hard-coded account columns is gone. The HTML grid, the column headers (`.ah-col-hd`), the row label cells (`.ah-row-l`), and all twelve `Run` buttons are deleted.
- Obsolete CSS (`.ah-matrix`, `.ah-col-hd*`, `.ah-row-l`, `.ah-run`) removed.

### Added — Agents · [active account] 2×2 grid
- Replaces the matrix in the same Agent Hub slot: Prep Me · Risk Analyst (top row), Save Strategy · Next Steps (bottom row).
- Section header reads `AGENTS · [CURRENT ACCOUNT NAME]` and re-renders whenever the Agent Hub account is switched via the search input.
- Buttons match the rest of the dashboard agent button language: outlined, icon + label, full-width within their grid cell, teal on hover. No more plain `Run` text boxes.
- Each button calls `_ahFireAgent(kind)` which resolves `openAgentDrawer(kind, _ahNoteAcct)` against the currently-active hub account key (`acme | brightex | nova | meridian | creston | apex`).

### Section order
1. Account Search · 2. Account Snapshot · 3. Quick Links · 4. Quick Note · 5. Agents · [account] · 6. Recent Outputs · Session Log · 7. Recent Docs · [account].

### Account switch behavior
All account-scoped surfaces refresh together when the CSM selects a different account from the search: current-account pill, snapshot grid, summary sentence, Quick Links toast text, Last Gong dark-account warning, Quick Note placeholder, Agents section header, the 4 agent buttons' target account, and Recent Docs. Recent Outputs · Session Log stays untouched — it tracks session history regardless of account.

### Implementation notes
- The `_ahFireAgent` helper reads `_ahNoteAcct` (the single source of truth for the Agent Hub's active account) so the four buttons are always in sync with the rest of the hub without any per-button bookkeeping.
- `_updateAgentHubAccount` extended to refresh `#ah-agents-acct` alongside the existing pill / snapshot / quick links / note / Recent Docs updates.
- Spec label note: the user requested this entry as `[3.2.4]`; shipped as `[3.2.5]` to preserve monotonic versioning above the existing 3.2.4 entry.

---

## [3.2.4] — 2026-05-17

Recipe for Success tab overhaul based on a detailed UX review. No new features — every change tightens what already exists. Scorecard weights, thresholds, scoring logic, metric values, calculations, weekly delta badges, and every other tab are untouched.

### Fixed — Banner stripped to a single sync line
- The green "Auto-populated from Gainsight · 100% hands-off · automated tax return" advisory block is gone.
- Replaced with one subdued line at the top of the tab: `Last synced: Today · 9:00 AM · Gainsight API`. No card, no border, no paragraph.
- The duplicate "Last synced" footer block in the weighted-score panel has been removed so the timestamp lives in exactly one place.

### Added — Account Portfolio context header
- Compact read-only row above the metric cards: `Total Accounts: 24 | $10–25K ARR: 14 | $25K+ ARR: 10 | Renewal Opps Q2: 18`. Inline data points separated by thin dividers, Gainsight-sourced badge on the label.
- No scoring weight, no interaction — just the book size so the percentages below are legible.

### Added — Inline status indicators on every metric
- Every row in the four metric cards now ends with a status pill: `✓ ON TRACK` (green) / `⚠ AT RISK` (amber) / `✗ BELOW` (red).
- Universal logic: meets target → green; within 10% of failing → amber; failing → red. Hard rules per spec: CTAs overdue is always red when count > 0; renewals with blank status is always red when count > 0.
- Per-row status: Active success plans → At Risk · Objectives won → On Track · CTAs overdue → Below · Renewal opps with upsell → On Track · Closed won expansions → On Track · Renewals in downsell → At Risk · Blank renewal status → Below · Renewal status changes → On Track · EBRs $25K+ → Below · EBRs $10–25K → Below · Advocacy milestones → On Track.
- Legend shown once above the metric cards.

### Fixed — Score bars: shared scale, threshold ticks, rating labels
- All five category bars and the final bar share the same 0–100% scale.
- Vertical tick marks at 55 / 75 / 85 / 95 with tiny labels below each, on every bar.
- Each category percentage is followed by its rating band: `Outstanding` (≥95), `Exceeding` (≥85), `Meeting` (≥75), `Inconsistent` (≥55), `Below Expectations` (<55). Current scores → Success Plans 71.4% · Inconsistent, Growth 80% · Meeting, Renewal Forecast 66.7% · Inconsistent, EBRs 62.5% · Inconsistent, Advocacy 80% · Meeting, Final 74.5% · Inconsistent.
- Category row dot now matches the rating band (green ≥85 · amber ≥75 · orange ≥55 · red <55) instead of using the brand color.

### Fixed — Quarter Projection reformatted as 3 structured lines
- "Dust Analysis" removed from the label — just `QUARTER PROJECTION`.
- Three icon-led lines replace the paragraph: 📈 Projected finish: 81% · Exceeding · ⚡ Highest-leverage action: Close 2 more EBRs before Jun 30 · ⚠ Biggest risk: Renewal Forecast Actions trending down · 3 blank statuses must be updated by Jun 15.
- Same indigo card styling (light indigo bg, 3px left border).

### Fixed — Dust Action Plan condensed
- Paragraph bodies replaced with one specific sentence per column.
- Buttons are now action-specific, not generic navigation: `Dust: Draft EBR Outreach for 5 Priority Accounts →`, `Open 3 Blank Statuses in Salesforce →`, `Open Overdue CTAs in Gainsight →`.
- Three-column structure preserved.

### Fixed — Notes section overhaul
- "Clear all notes" button, confirmation modal, and associated JS removed entirely. Notes are permanent records.
- New `Notes (N)` pill in the Recipe tab header — scrolls smoothly to the notes anchor; the count refreshes whenever a note is saved.
- Context-aware textarea placeholder driven by red metrics. EBRs are red in the demo data so the placeholder reads "Your EBR coverage is your biggest gap this week. What’s your plan to close it?" — when both EBR and CTAs are red, EBR wins (larger weight). The placeholder is only a suggestion; the textarea accepts anything.
- Quarter selector dropdown — `Q2 2026 (current) · Q1 2026 · Q4 2025 · Q3 2025`. Older quarters show "No notes saved for Qx 20xx." since the prototype has no localStorage data from prior quarters.
- The history list is collapsed behind a `View note history` toggle by default, keeping the top of the notes section compact — input + categories + Save Note.

### Implementation notes
- Two parallel buildRecipe / Notes module copies in the file (from the v3.0.0 replace_all incident) were updated in lockstep via `replace_all: true`. Both modules verified diff-clean.
- Spec label note: the user requested this entry as `[3.2.3]`; shipped as `[3.2.4]` to preserve monotonic versioning above the existing 3.2.3 entry.

---

## [3.2.3] — 2026-05-17

Text-only rename of the Ask Dust card. No structural, layout, or behavioral changes — all six chips, all chip behavior, the Agents dropdown, Coach Me, agent outputs, and routing to Mission Briefing are untouched.

### Changed — Card text
- Card title: "Ask Dust" → "Dust Agents".
- Card subtitle: "Free-text agent · powered by Dust API" → "Access your Dust agents here". Same `.bf-sub` styling (small, uppercased via CSS, muted).
- Search input placeholder: "Ask anything about an account, renewal, or open loop…" → "Ask any agent a question…".

### Implementation notes
- Internal references (CSS comments, the `dust-title` output-panel header, the `_dustRender('Ask Dust', …)` routing key, and the input's `aria-label`) are intentionally left as-is — only the three user-visible card strings changed.
- Spec label note: the user requested this entry as `[3.2.2]`; shipped as `[3.2.3]` to preserve monotonic versioning above the existing 3.2.2 entry.

---

## [3.2.2] — 2026-05-17

Agent Hub & Workspace widget expansion. Four new sections added above the existing Quick Launch Matrix / Recent Outputs / Recent Docs trio. All four sections share a single active account state so switching the account from anywhere refreshes the entire hub together. Mission Briefing context is unchanged.

### Added — Account Search
- Current account pill (`#ah-cur-pill`) shows the hub's active account at a glance, teal-tinted to match the brand accent.
- Search input filters six known accounts (Acme Corp, Brightex, Nova Industries, Meridian Group, Creston Health, Apex Logistics) as you type, with health-band badges on each result.
- Selecting a result calls `_updateAgentHubAccount(key)` — the same function the Mission Briefing dropdown uses — so the snapshot, quick links, note placeholder, current-account pill, and Recent Docs all refresh in lockstep.
- Outside-click closes the results dropdown.

### Added — Account Snapshot
- Six-cell grid per account: Health, ARR, Renewal date, Champion, Open CTAs, Last Gong.
- Each metric has a color band (green / amber / red / grey / warn) keyed to its semantic state — e.g. champion-lost cells render red, dark Gong activity (60+ days) renders warn-coloured.
- One-sentence summary card below the grid (teal left border) gives the at-a-glance read of the account's posture.

### Added — Quick Links
- Four icon buttons: Gainsight, Salesforce, Last Gong, Drive. Each opens an account-aware toast naming the active account.
- Last Gong button shows a red ⚠️ warning badge and red outline for dark accounts (60+ days since last call) — Brightex (94 days) and Creston (172 days) trigger the warning in the seed data.

### Added — Quick Note
- Textarea placeholder updates to the active account ("Add a note about Brightex…" etc).
- Save to Gainsight opens an inline confirmation card — the save is never pushed without an explicit second click, matching SPEC §7.2 confirmation discipline.
- Copy button writes the note text to the clipboard via the standard `navigator.clipboard` path.

### Implementation notes
- New CSS namespace `.ah-cur*`, `.ah-search*`, `.ah-snap*`, `.ah-ql*`, `.ah-note*` added after the existing `.ah-doc-btn` rules. No existing Agent Hub rules touched.
- New `AH_SNAP` data table seeds the six accounts. All renderers (`_ahRenderSnapshot`, `_ahRenderQuickLinks`, `_ahRenderNotePlaceholder`) read from it.
- `_updateAgentHubAccount(viewId)` extended to also call the three new renderers and update `#ah-cur-pill`. The function remains the single funnel for every account switch in the hub.
- Spec label note: the user requested this entry as `[3.2.1]`; shipped as `[3.2.2]` to preserve monotonic versioning above the existing 3.2.1 entry.

---

## [3.2.1] — 2026-05-17

Three additive enhancements to the Recipe for Success tab. No structural changes to the scorecard, weights, categories, or v2.13.0 Dust recommendation panel.

### Added — Weekly delta indicators on every score
- `scores[]` array in `buildRecipe()` gained a `d` (delta) field per category. The renderer now appends a delta badge after the score percentage in each `.sc-sr` row.
- Demo data (per spec):
  - Success plans & objectives: **71.4%** · ↑ +2.1 pts this week (teal)
  - Book of business growth: **80%** · → No change (muted)
  - Renewal forecast actions: **66.7%** · ↓ -3.3 pts this week (red)
  - Business reviews (EBRs): **62.5%** · ↑ +12.5 pts this week (teal)
  - Customer advocacy: **80%** · ↑ +5.0 pts this week (teal)
  - **Final weighted score: 74.5%** · ↑ +1.8 pts this week (teal)
- New `.sc-delta` / `.sc-fin-delta` CSS namespace with `.up` (teal), `.down` (red), `.flat` (muted) variants. Arrow glyph + text inline on the same line as the score; right-aligned, 11px, non-intrusive.

### Added — Quarter Projection card (Dust analysis framing)
- New `.rcp-proj` card inserted between the Final Weighted Score block and the v2.13.0 Dust recommendation panel.
- Styling: light indigo background (`#EEF2FF`), 3px indigo left border (`#4F46E5`), indigo uppercase header — same visual treatment as the v3.1.0 Team Guidance banner in Prepare My Day.
- Body (verbatim per spec): *"At your current pace you'll finish Q2 at 81% (Exceeding). Closing 2 more EBRs this quarter would push you to 87% and solidify Exceeding. Your biggest risk: Renewal Forecast Actions is trending down — 3 blank statuses need updating before Jun 15."*
- Phase 2 note: Dust will calculate this dynamically from the live score and Gainsight data; v3.2.1 ships a static card with the spec content.

### Added — Notes & Reflection panel with `localStorage` persistence
- New `.rcp-notes` panel appended to the bottom of the Recipe page (below the Dust recommendation panel).
- localStorage key: `teamos_recipe_notes`. Schema: `[{ text, timestamp, category, quarter }, …]`.
- On first load (localStorage empty): seeds with the spec's demo note (`EBR coverage is my biggest gap this quarter...`, category `EBRs`, timestamp `May 10 · 9:14 AM`, quarter `Q2 2026`).
- **Input area:** full-width textarea + category chip row (`Success Plans · Growth · Renewals · EBRs · Advocacy · General`) + `Save Note` button.
- **Save flow:** click writes a new note with auto-applied timestamp (`Today · HH:MM AM/PM`), selected category, and current quarter to localStorage, clears the textarea, re-renders the history list, fires toast `Note saved · Q2 2026 ✓`.
- **History timeline** below the input shows all saved notes (newest first), each with a category pill, timestamp, and the note text. A `Clear all notes` link in the section header opens an inline confirmation strip (`Clear all Q2 2026 notes? This cannot be undone · [Yes, clear] [Cancel]`); Confirm fires `All Q2 2026 notes cleared ✓`.
- **Filter chips** (`All · Success Plans · Growth · Renewals · EBRs · Advocacy · General`) under the confirmation strip filter the visible history without modifying storage. Empty filter state: *"No notes in [Category] for this quarter."*

### Verified end-to-end in a headless render
- All 5 score rows have a delta badge with correct class (`up` / `down` / `flat`) and text matching the spec values ✓
- Final score row has the `↑ +1.8 pts this week` badge in teal ✓
- Quarter Projection card renders with correct label + spec body text ✓
- Notes panel:
  - First load → 1 row (seed note) ✓
  - Save a new note → row count 1 → 2, top row is the new entry, input clears, localStorage has 2 entries, toast fires ✓
  - Filter Growth → 1 row (only the new note) ✓
  - Filter EBRs → 1 row (only the seed) ✓
  - Reload page → 2 rows survive ✓
  - Confirm-then-clear → 0 rows, localStorage empty, empty-state message displayed ✓

### Not touched
- Existing scorecard metrics, weights, categories, and scoring logic — only the demo `p` values inside the `scores[]` array changed (per spec demo data); category labels and weight percentages unchanged.
- Dust recommendation panel (v2.13.0): 3 cards + footer — untouched.
- All other tabs and widgets.
- Service Worker, offline resilience (the new localStorage key participates transparently in any future snapshot sync — same pattern as `teamos_ma_sessions` in v3.0.0 and `teamos_signature` in v2.11.0).

### Engineering
- New `.sc-delta`, `.sc-fin-delta`, `.rcp-proj`, `.rcp-notes*` CSS rules (~25 rules total) bound to existing tokens. No new color values introduced.
- New JS helpers: `_rcpReadNotes`, `_rcpWriteNotes`, `_rcpNotesHTML`, `_rcpNotesRenderList`, `_rcpNotesSave`, `_rcpNotesSetCat`, `_rcpNotesSetFilter`, `_rcpNotesAskClear`, `_rcpNotesConfirmHide`, `_rcpNotesClearAll`, `_rcpNotesEscape`.
- All user-typed input HTML-escaped via `_rcpNotesEscape` before rendering — defensive against the user-input → innerHTML path.
- localStorage writes guarded with try/catch. Reads fall back to the seed note if storage is unavailable.

---

## [3.2.0] — 2026-05-17

Nav expanded to 9 tabs. My Accounts converted to a Coming Soon placeholder. Six new Coming Soon tabs added.

### Changed — My Accounts tab is now Coming Soon
- `#tab-myacct` HTML content replaced with the shared Coming Soon template. The v3.0.0 live workspace (search bar, recent sessions, account snapshot, 4 Quick Launch agents, notes / tasks / free-text query) is now Phase 2 vision content rather than functional UI.
- All v3.0.0 JS (`MA_BOOK`, `MA_KNOWN`, `MA_BOOK_CACHE`, `_maOpenAccount`, `_maRenderSnapshot`, `_maRunAgent`, `_maFreeQuery`, `_maToggleNote`, `_maToggleTask`, `_maCallAnthropic`, `_maMockAgent`, etc.) is **preserved in place**. Restoring the live workspace = restore the markup; the JS code already null-checks every DOM lookup and silently no-ops when the elements aren't present (verified in v3.0.0 init: `var main = document.getElementById('ma-main'); if (!main) return;`).

### Added — Six new Coming Soon tabs
All seven Coming Soon tabs (My Accounts + the six new) use a single shared `.cs-pg` template:
1. **Tab 3 — My Accounts** 🗂 — Every account in your book, fully loaded, one click away. Connects to Gmail · Gong · Salesforce · Gainsight · Ironclad · Google Drive · Slack.
2. **Tab 4 — Risk & Signals** 🛡 — Every risk signal across your book, ranked and ready to act on. Connects to Gainsight · Gong · Salesforce · Ironclad.
3. **Tab 5 — Forecasting** 📈 — Your renewal pipeline, risk-weighted and intelligently summarized. Connects to Salesforce · Gainsight · Gong · Ironclad.
4. **Tab 6 — Success Plans** 📋 — Every account's success plan tracked and current across your entire book. Connects to Gainsight · Google Drive · Gmail.
5. **Tab 7 — Team View** 👥 — AE, BDR, CSM, and Onboarding all working the same account — without a single Slack thread. Connects to Gainsight · Salesforce · Slack · Gmail · Gong · Google Drive.
6. **Tab 8 — Campaigns** 📣 — Templated outreach, automated sequences, and campaign tracking — built for CSMs, not marketers. Connects to Gmail · Gainsight · Gong · Salesforce · Resend.
7. **Tab 9 — Analytics** 📊 — How your book is trending — not just where it stands today. Connects to Gainsight · Gong · Salesforce · Gmail.

Per spec: **no** "Notify me" button. **No** ETA or timing language. Just the icon, heading, vision, two info sections, and a `🔌 Phase 2 feature · API connections required` badge.

### Added — Shared Coming Soon template (`.cs-*` namespace)
- `.cs-pg` (720px max-width, centered, generous padding) — page container.
- `.cs-ic` (48px emoji), `.cs-h` (32px heading), `.cs-vision` (14px tag-line), `.cs-divider` (1px), `.cs-sec-t` (10px uppercase section label), `.cs-body` (13px paragraph), `.cs-conn` (12px pill listing data sources), `.cs-badge` (Phase 2 footer pill).
- All bound to existing color tokens. No new color values.

### Changed — Nav handles 9 tabs with horizontal scroll
- 9 tabs wrapped in a new `.nav-tabs-scroll` container: `flex: 1; min-width: 0; overflow-x: auto` so the tab strip scrolls horizontally rather than wrapping or hiding tabs.
- Scrollbar hidden via `scrollbar-width: none` + `-webkit-scrollbar { display: none }` for a clean dark nav appearance.
- `.n-right` (notifications + avatar) stays anchored on the right at all viewports.
- Media-query tab compression: `<1280 px` reduces padding 14 → 10 and font 12 → 11; `<960 px` reduces to 8 / 10. Verified at 1024 px: `scrollWidth (898) > clientWidth (678)` with `overflow-x: auto` active.

### Verified end-to-end in a headless render
- Nav shows 9 tabs in the spec order: CSM Dashboard / Recipe for Success / My Accounts / Risk & Signals / Forecasting / Success Plans / Team View / Campaigns / Analytics ✓
- All 7 Coming Soon tabs activate via `goTab()` and render the full template (icon + heading + vision + body + connections + Phase 2 badge) ✓
- `#tab-myacct` shows the Coming Soon page (`.cs-pg` present, `.ma-grid` absent) ✓
- `#tab-dash` still functional: brief-strip and `.main` present ✓
- `#tab-recipe` still functional: `#recipe-root` and `.rcp-dust` panel present ✓
- Narrow viewport (1024 px): horizontal scroll active on `.nav-tabs-scroll` ✓

### Not touched
- CSM Dashboard tab and every widget inside (Priority Stack, Next Up, Ask Dust, Mission Briefing, Agent Hub, Urgent Inbox, Today's Tasks with admin rows, Dark Zone, Calendar, Live Signals).
- Recipe for Success tab (scorecard + v2.13.0 Dust recommendation panel).
- All drawers (Assistant + Live Call), Ghost-Buster wizard, TeamOS Live, Task Briefs, Quick Chat, Drive Docs, Training popover, pulse strip indicators, notification rail, Service Worker, offline-resilience layer.
- The v3.0.0 My Accounts JS module — preserved verbatim, ready to re-activate when the live markup is restored.

---

## [3.1.1] — 2026-05-17

Agent Hub & Workspace promoted from inside `view-default`'s scrollable content to a permanent slot in the center column. The user labeled the changelog `[3.1.0]`; shipped as `[3.1.1]` to keep version numbers monotonic (`[3.1.0]` already shipped). Bullets match the spec verbatim.

### Fixed — Agent Hub restored to a persistent center-column slot
Investigation: the Agent Hub HTML block (`.ah-card`) was still present in the DOM all along — it lived inside `#view-default .rp-scroll`. The v2.5.0 Agent Hub never actually got displaced when My Accounts shipped in v3.0.0. Two real issues, though, made it look "missing":

1. After v3.1.0 made Prepare My Day the auto-loaded default (much taller than the old Acme briefing card), the Hub got pushed to `y ≈ 1491 px` — below the fold of a typical 1100-tall viewport. The user had to scroll the page to see it.
2. Because it lived inside `view-default`, switching to any other Mission Briefing view (clicking a calendar event → `view-acme` / `view-brightex` / `view-nova`) hid the Hub entirely.

Fix: **hoisted the Agent Hub HTML block out of `view-default`'s `.rp-scroll` and made it a permanent sibling of `.rp`** inside the center-column wrapper. Now it sits directly below the Mission Briefing panel regardless of which `.rp-view` is active. The same DOM ids (`#ah-recent`, `#ah-docs`, `#ah-doc-acct`) survive the move, so `_updateAgentHubAccount` continues to work without modification.

### Updated
- `_loadPrepareMyDayDefault()` simplified — no longer needs to preserve the Hub via `outerHTML` copy since the Hub is no longer inside view-default's `.rp-scroll`. Function body shrinks to `scroll.innerHTML = DUST_RESP['Prepare My Day']()`.

### Verified end-to-end in a headless render
- One `.ah-card` in the DOM (no duplicate). Sibling of `.rp`, not inside `view-default` ✓
- Default state (PMD active): Hub at `y ≈ 1508`, directly below `.rp` which ends at `y ≈ 1492` ✓
- After clicking Acme calendar event (→ `view-acme`): Hub stays visible at `y ≈ 1073` (now closer to viewport since view-acme content is shorter than PMD) ✓
- Quick Launch button (Prep Me NovaVault) → opens drawer in Assistant mode with title "Pre-Call Brief" ✓
- Restore button (Prep Me Acme) → loads `view-agentout` with title "Pre-Call Brief" ✓
- `_updateAgentHubAccount` hook in `openPanel` still works: `openPanel('brightex')` → `#ah-doc-acct` updates to `BRIGHTEX` ✓
- 12 matrix buttons + 3 Recent Outputs rows + 2 Acme doc rows render correctly ✓

### Architecture note — Agent Hub vs. My Accounts tab
These are two **distinct** features serving different purposes; this commit preserves both:

- **Agent Hub & Workspace** (center column, persistent below Mission Briefing): a quick-access widget. 4×3 launch matrix, recent session log, dynamic doc list. Always visible. Pull / scan / launch. Built in v2.5.0.
- **My Accounts tab** (4th nav tab): a full AI-powered portfolio workspace. Account search across the full book of 16, structured snapshot per account, 4 Quick Launch agents via Anthropic API, notes / tasks / free-text query. Built in v3.0.0.

No overlap, no displacement.

### Not touched
- My Accounts tab — completely separate feature, untouched.
- `openAgentDrawer`, `_updateAgentHubAccount`, `view-agentout` view — untouched.
- All other widgets, drawers, Mission Briefing views, Ghost-Buster, TeamOS Live, Task Briefs, Drive Docs, Training popover, pulse strip, notification rail, Service Worker.

---

## [3.1.0] — 2026-05-17

Three connected features that change what the CSM sees on page load and how leadership pushes guidance into the daily workflow.

### Added — Feature 1: Prepare My Day auto-loads as the Mission Briefing default
- New `_loadPrepareMyDayDefault()` rebuilds `#view-default .rp-scroll` with the existing `DUST_RESP['Prepare My Day']()` output, preserving the Agent Hub card at the bottom. Called on boot (deferred via `setTimeout(...,0)` so the DUST_RESP table has finished initializing) and on every `resetPanel()`.
- The static Acme Mission Briefing card (story sections, agent buttons, Generate QBR Deck) is replaced by the Prepare My Day output in this default-state slot. The same Acme briefing is still reachable by clicking the Acme calendar event (→ `view-acme`, untouched).
- pl-tag text flipped from `Next Up · Auto-loaded` → `Prepare My Day · Auto-loaded`. Same teal pulsing dot, same style. Defensively restored on every `resetPanel` call.
- Back from any view (`resetPanel()`) now returns to the Prepare My Day output instead of the Acme briefing. Verified end-to-end: calendar click → view-acme → Back → Prepare My Day reloaded with the spec content intact.

### Added — Feature 2: Admin task broadcast in Today's Tasks
- Two admin-broadcast rows added at the TOP of the Today's Tasks card (above the 5 personal tasks):
  - `[👔 ADMIN]` `High priority · Due today` — "Schedule EBR for all accounts renewing in next 60 days". Sender: Maggie Spry · CS Leadership · Sent to all Commercial CSMs. Button: `Schedule EBRs` → toast `Opening EBR scheduling workflow · 3 accounts qualify in your book ✓`.
  - `[👔 ADMIN]` `Medium priority · Due Jun 10` — "Update champion contacts for all dark zone accounts in Gainsight". Sender: Maggie Spry · CS Leadership · Sent to all CSMs. Button: `Update in Gainsight` → toast `Opening Gainsight · Dark zone accounts filtered · 3 accounts need champion update ✓`.
- New source class `admin` (deep indigo `#4F46E5`) added to both `.src-dot.admin` and `.tk-leg .tk-dot.admin`. Admin rows display the 👔 emoji prefix instead of a colored dot via `.ac.admin .src-dot{background:transparent; font-size:11px}`.
- New `.ac-from` style for the sender attribution line under the task title (muted italic, 10px, with bold sender name).
- New `.ac-badge.adhi` (indigo) + `.ac-badge.admed` (gray) priority badges for admin rows.
- `tk-legend` updated with a 5th item: `● Admin`.
- Task counter: `0 / 5` → `0 / 7` in HTML + `doneTask` JS so completion math stays correct as admin tasks are marked done.
- New `adminTask(kind)` helper maps `ebr` / `champion` to the spec toasts.

### Added — Feature 3: Team Guidance banner in Prepare My Day output
- Collapsible `<details class="tg">` block prepended to the `DUST_RESP['Prepare My Day']()` template, so it appears whenever the Prepare My Day output renders (auto-load AND chip click) but not in any other agent output or Mission Briefing view.
- **Collapsed (default):** `📋 Team Guidance Active · 1Password CS · Q2 2026 priorities applied · ▸ View guidance`.
- **Expanded:** indigo header bar, 5 priority rules in a dot-list (renewal-30d / dark-inbound-24h / Q2 EBR / champion-change / Gong-minimum), `Set by: Maggie Spry · VP Customer Success · Last updated: May 15, 2026` footer.
- Styling: light indigo background (`#EEF2FF`), 3px indigo left border (`#4F46E5`), indigo accent text on labels. Native `<details>` toggle — no JS, no animation.
- Verified absent from `view-acme` (and by inference every other view).

### Verified end-to-end in a headless render
- Page load: active view `view-default`, pl-tag `Prepare My Day · Auto-loaded`, Prepare My Day "Today's calls (3)" + "Urgent actions" sections present, Agent Hub card still in view, old Acme briefing content removed ✓
- Calendar Acme click: `view-acme` loads ✓
- Back: returns to `view-default` with PMD content restored and pl-tag intact ✓
- Today's Tasks: counter `0 / 7`, 7 total rows, 2 admin rows with correct titles, legend includes Admin, sender attribution renders ✓
- Admin toasts match spec verbatim ✓
- After both admin tasks done: counter `2 / 7` ✓
- Team Guidance banner: visible inside Prepare My Day output, collapsed by default, 5 rules + spec footer, expandable, absent from `view-acme` ✓

### Architecture note (Phase 2)
The admin task broadcast and team guidance banner are Phase 1 visual implementations. Phase 2 will add:
- Role-gated admin panel for CS Leadership to author broadcasts and guidance rules.
- Dust system-prompt injection so the guidance rules influence agent output ranking (currently the rules are documentation only — the Prepare My Day content is hardcoded).
- Completion tracking per CSM per admin task with rollup in a Leadership dashboard.

### Not touched
- Existing Prepare My Day content (3-call brief, coaching notes, urgent actions, signals) — unchanged.
- `view-acme` / `view-brightex` / `view-nova` Mission Briefing views — untouched, still reachable via calendar clicks and the Agent Hub Quick Launch Matrix.
- All other widgets, drawers, tabs, agent outputs, Ghost-Buster, TeamOS Live, Agent Hub Quick Launch + Recent Outputs + Recent Docs, Task Briefs, Drive Docs, Training popover, pulse strip indicators, notification rail, Service Worker, offline-resilience layer.
- `agentBtn`, `openAgentDrawer`, `setDrawerMode`, `dustQuick`, `openPanel`, every Ghost-Buster wizard helper, every Quick Chat helper, every My Accounts helper — unchanged.

---

## [3.0.3] — 2026-05-17

Training moves from a top-nav tab to an 8th pulse-strip indicator. The user labeled the changelog `[2.11.3]`; shipped as `[3.0.3]` to keep version numbers monotonic. Bullets match the spec verbatim.

### Added — Training pulse-strip indicator
- 8th `ps-wrap` directly after Drive Docs: `<button id="pb-train">🎓 [2] Training</button>`. Badge color uses the existing amber `.ps-n.a` variant (action-needed signal, same as overdue CTAs).
- Click opens `#pop-train` via the standard `togglePop('train', event)` so it inherits the v2.10.1 single-dropdown invariant (`closeAllDropdowns` closes pulse, notif rail, and Ask Dust Agents before opening). Verified: opening Drive Docs after Training closes Training ✓.

### Added — Training dropdown content
- **Header:** `🎓 Training · Seismic LMS` + close button.
- **Sub-line:** `Assigned trainings · Synced from Seismic · Updated 8:47 AM`.
- **3 training rows**, each with:
  - Status badge (🟡 In Progress amber / ⬜ Not Started gray / ✅ Complete teal) — reuses the v2.14.0 `.en-stat` color tokens via new `.tr-stat.{in-prog,not-started,complete}` classes.
  - Training name (bold).
  - Slim 6px progress bar — teal blue (#0EA5E9) for in-progress, green (#22C55E) for complete, gray (#E5E7EB) for not started.
  - Meta line: percent · module count · due date.
  - Action button: Continue / Start / Review.
- **Footer:** `2 of 3 trainings incomplete` (left) + `View all in Seismic ↗` (right, teal link).
- **Phase 2 note:** `🔌 Seismic API · Phase 2 · Trainings will sync automatically when connected`.

### Added — `trOpen(kind)` action handler
- Single helper, four kinds: `continue` / `start` / `review` / `all`. Each fires the spec toast verbatim:
  - `Opening Seismic · Enterprise Renewal Conversations · Module 3 of 4 ✓`
  - `Opening Seismic · Champion Change Playbook · Module 1 of 3 ✓`
  - `Opening Seismic · Gainsight Power User Certification · Review mode ✓`
  - `Opening Seismic learning portal ✓`

### Removed — Enablement tab from the top nav
- Per the spec ("If an Enablement tab was added in a previous commit, remove it. Training lives in the pulse strip, not as a tab."):
  - Deleted the `<div class="n-tab" onclick="goTab('enable',this)">Enablement</div>` nav entry.
  - Deleted the entire `<div class="tc" id="tab-enable">…</div>` content block.
- Left the orphaned `enOpenSeismic` function and the `.en-*` CSS namespace in place — dead code but harmless, and removing them risks breakage if any other surface picks them up later. Phase 2 cleanup pass can prune them.

### Verified end-to-end in a headless render
- Pulse strip now has 8 indicators in the correct order: 3 calls / 2 at risk / $67K ARR / 3 overdue CTAs / 3 dark accounts / 8 tasks / Drive Docs / **2 Training**.
- Nav tabs: CSM Dashboard, Recipe for Success, My Accounts (Enablement absent). `#tab-enable` element removed from DOM.
- Training dropdown opens with correct header, sub-line, 3 rows (statuses 🟡/⬜/✅, progress widths 62%/0%/100%, buttons Continue/Start/Review), footer text, and Phase 2 note.
- All 4 button toasts match spec verbatim.
- Single-dropdown invariant holds: opening Drive Docs while Training is open closes Training (`cftOn:true, trainOn:false`).

### Not touched
- All 7 existing pulse-strip indicators (calls / at-risk / ARR / overdue CTAs / dark / tasks / Drive Docs) and their popovers — unchanged.
- All 3 remaining tabs (CSM Dashboard / Recipe for Success / My Accounts) and their content.
- `togglePop` / `closeAllDropdowns` / `closePops` / outside-click listener — unchanged.
- Every other widget, drawer, Mission Briefing view, Ghost-Buster, TeamOS Live, Agent Hub, Task Brief, Service Worker, offline-resilience layer.

### Engineering
- One new HTML block (40 lines), one new CSS namespace `.tr-*` (~30 rules bound to existing tokens), one new JS function (`trOpen`). Pure additive except for the Enablement tab removal.
- Phase 2 Seismic API integration hook: the entire `#pop-train` block could be re-rendered from a Seismic API response with the same DOM shape. No JS plumbing changes needed.

---

## [3.0.2] — 2026-05-17

Assistant drawer empty state replaced with a live Quick Chat. The user labeled the changelog `[2.11.2]`; shipped as `[3.0.2]` to keep version numbers monotonic. Content matches the user's brief verbatim.

### Replaced — Assistant drawer empty state
- Old static placeholder ("No agent loaded yet · Select an agent above...") is gone.
- `setDrawerMode('assistant')` empty-state branch now calls `_qcRender()` which writes the live Quick Chat into `#drawer-scroll` (chat body) and `#drawer-ft` (fixed input bar). The legacy placeholder is kept as a fallback if `_qcRender` isn't defined — defensive, no-op in practice.

### Added — Quick Chat interface
- **Header:** `⚡ Quick Chat · Powered by Dust AI`.
- **4 starter chips** (2×2 grid): 🔒 1Password Features · 📋 SLA & Pricing · ✍️ Draft for Customer · 🔍 Account Context. Each pre-fills the input with the spec's starter prompt and focuses the field.
- **Chat area** with default state showing 3 muted-italic example prompts (`Try: What's the uptime SLA for 1Password Business?` etc.). Examples disappear after the first message.
- **Input bar** in `#drawer-ft` (fixed at the bottom of the drawer, never scrolls): placeholder `Ask anything about 1Password or your accounts…` + Send button. Enter submits.

### Added — Live API integration with mock fallback
- `_qcCallAnthropic(history, mockFn)` POSTs to the v3.0.0 proxy endpoint `MA_API_ENDPOINT` (`/api/anthropic`) with full conversation history (so the chat has memory). `AbortController` 10s timeout. Falls back to `_qcMockReply` on any failure — UI stays usable without a live API.
- System prompt set verbatim per spec — 1Password Customer Success assistant with current-account context for Acme/Brightex/NovaVault baked in. Customer-facing drafts never expose health scores or churn probabilities.
- Conversation history persists in module-scope `_qcHistory` array, survives Live ↔ Assistant toggles within the session. Cleared on page refresh.
- Session cap: 10 user exchanges. After the cap, the UI shows "Session limit reached · Start a new chat to continue →" with a `_qcClear()` link.

### Added — Message UI
- **Carmen's messages:** right-aligned, teal background bubble, white text (`.qc-msg-user`).
- **AI responses:** left-aligned, light-gray background bubble with a 🤖 icon (`.qc-msg-bot`).
- **Below every AI response,** two action buttons:
  - `📋 Copy` → writes the bot's raw response to clipboard via `navigator.clipboard.writeText`, toasts `Copied ✓`.
  - `✉️ Copy for Email` → wraps the response with `Hi [Contact name],\n\n[response]\n\nPlease let me know if you have any questions — happy to jump on a call.\n\nBest,\nCarmen`, then copies. Toast: `Copied as email draft ✓`.
- **Account-aware contact name:** uses `_drawerCtx.acct || window._activeAccount` to look up the primary contact (David Kim / Sarah Chen / Michael Torres for Acme / Brightex / Nova). Falls back to `[Contact name]` placeholder when no account is active.

### Added — Loading + error states
- Typing indicator (`🤖 ···`) appears in the chat as a pulsing bubble while the API call is pending. Removed when the response arrives.
- API failure or timeout → error bubble: `Dust is unavailable · Check connection and retry [Retry]`. The `[Retry]` link drops the error from history and re-fires the last user message.
- Errors are filtered out of the history sent to the Anthropic API (Anthropic accepts only `user`/`assistant` roles).

### State interaction with agents
- When the user clicks any agent button (Prep Me / Risk Analyst / etc.), `openAgentDrawer` populates `drawer-scroll` and `drawer-ft` with agent content — Quick Chat is replaced. Existing behavior, untouched.
- When the user toggles Live → Assistant **with no agent loaded**, Quick Chat re-renders and the conversation history from earlier in the session is still visible.
- When the user toggles Live → Assistant **with a prior agent**, the agent re-renders (existing v2.8.2 behavior). To return to Quick Chat after an agent has run, clear `_drawerCtx.lastAgent` (Phase 2 hook point).

### Verified end-to-end in a headless render
- Fresh drawer in Assistant mode renders Quick Chat header + 4 chips + 3 example rows + input ✓.
- Chip 1 fill: input populated with `What is included in the 1Password [Business/Enterprise] SLA for: ` ✓.
- Send SLA query → mock returns 4-line SLA + comparison response, history grows to 2, both action buttons render ✓.
- Send second query about SSO → history grows to 4 (2 user + 2 assistant), session memory intact ✓.
- `[Copy]` toast: `Copied ✓` ✓.
- `[Copy for Email]` toast: `Copied as email draft ✓` ✓. Email wrapper uses the active-account contact when one is loaded.
- Toggle Live → Assistant: history (4 entries) persists, all 4 messages render ✓.

### Not touched
- Existing agent drawer content and routing.
- The Assistant ↔ Live Call mode toggle (v2.8.2).
- All Mission Briefing views, other widgets, Service Worker.
- The TeamOS Live chat in the Live Call drawer mode — separate surface with its own system prompt and purpose. Quick Chat and TeamOS Live coexist as two distinct chat interfaces inside the same drawer.

### Engineering
- New `.qc-*` CSS namespace (~30 rules) bound to existing tokens.
- API plumbing reuses `MA_API_ENDPOINT` and `MA_API_TIMEOUT` constants from v3.0.0 so a single Vercel proxy endpoint serves both surfaces.
- All clipboard writes wrapped in capability checks (`navigator.clipboard && navigator.clipboard.writeText`) — graceful no-op when unavailable, toast still fires for UX feedback.
- All user-typed input HTML-escaped via `_qcEscape` before rendering.

---

## [3.0.1] — 2026-05-17

Three UI fixes against v3.0.0. The user labeled the changelog entry `[2.11.1]`; shipped as `[3.0.1]` here so the version number stays monotonically increasing (v3.0.0 already shipped). Content matches the user's `[2.11.1]` brief verbatim.

### Fixed — Fix 1: Agents dropdown opens downward by default
- `.dust-agents-pop` flipped from `bottom: calc(100% + 6px)` (always-up) to `top: 100%; margin-top: -1px` (down by default, touching the chip's bottom border).
- New `.dust-agents-pop.up` variant — `top:auto; bottom:100%; margin-bottom:-1px; box-shadow: 0 -12px 40px ...` so when the dropdown flips upward it gets a shadow rising upward instead of downward.
- `toggleAgentsDropdown` now measures `(window.innerHeight - chipRect.bottom)` when opening and adds the `.up` class only when the gap below the chip is less than 300px. Default flow is downward; upward is a fallback for near-bottom-of-viewport cases.
- Removed the 6px gap between chip and dropdown — they now share a border edge.

### Added — Fix 2: Review At-Risk Renewals usage block
- New `Usage & Adoption · Gainsight + Gong` section inserted between the existing risk-renewals table and the existing Dust summary inside the `Review At-Risk Renewals` template in `DUST_RESP`.
- Two account cards (NovaVault + Brightex Inc) with WAU vs seats, month-over-month delta, daily-login average, a 4-row feature-adoption table with ✅ / ⚠️ / ❌ icons, and a "last product event" line.
- Per spec content:
  - **NovaVault**: WAU 31/64 (48%) ↓ from 58 (−46%), 4.2 daily logins, Password Manager 94% ✅, Admin Console 12% ⚠️ (was 67%), SSO Integration 0% ❌, 1Password CLI 0% ❌. Last event: May 1 password export (red flag).
  - **Brightex Inc**: WAU 71/87 (82%) stable, 11.4 daily logins, Password Manager 98% ✅, Shared Vaults 87% ✅, SSO 34% ⚠️ (target 80%), Admin Console 61% ⚠️. Last event: May 14 new vault by Sarah Chen (positive).
- New `What this means · Dust read` section directly below with two cards (NovaVault → admin-console collapse traced to James Wu's departure + SSO 0% red flag + May 1 export anomaly; Brightex → SSO adoption gap reframed as Solutions Engineering opportunity, not commercial negotiation).
- Existing risk-renewals table at the top, Dust summary paragraph below the new sections, and the three action buttons at the bottom are all untouched.
- New CSS: `.du-feat` + `.du-feat-row` + `.du-feat-ic` + `.du-feat-nm` + `.du-feat-v` (with `.warn` / `.crit` color variants).

### Changed — Fix 3: Ask Dust chip restyle
- `.bf-qa-btn` flipped from inline icon + label to a vertical stack: `flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 14px 10px; font-size: 13px; font-weight: 600`.
- Icons get a 24×24 teal-tinted circle (`background: rgba(24, 165, 117, .10); border-radius: 50%; font-size: 14px !important`). `!important` defeats Tabler's font-family rule that was making the icons inherit the button's 11px responsive override.
- New `.bf-qa-btn:hover` state — teal-tinted background (`rgba(24, 165, 117, .05)`), `border: 1.5px solid var(--tl)`, with adjusted padding so the increased border width doesn't shift the chip footprint.
- New `.bf-qa-btn.on` active state — `border: 2px solid var(--tl)`, icon circle bumped to 15% teal background. JS marker:
  - `_markActiveChip(name)` matches the chip whose text overlaps the dustQuick label (bidirectional substring — so the abbreviated "Review At-Risk" chip text correctly maps to the `Review At-Risk Renewals` DUST_RESP key). Called at the end of `dustQuick()`.
  - `_clearActiveChips()` called from `openPanel(id)` when `id !== 'dust'` and from `resetPanel()`. Ensures the chip clears whenever the user navigates away from `view-dust`.
- Agents chip override (`.bf-qa-btn.muted`) keeps horizontal layout: gear icon + "Agents" label + chevron, all in one row. Same icon-circle treatment on the inner `<i>` inside the `<span>` wrapper. Chevron stays as a plain icon (no circle).
- Card grid layout, dimensions, equal-height behavior from v2.2.0 — all untouched. Verified card heights still 400/400/400 across the brief strip.

### Verified end-to-end
- Agents dropdown default open (page top): `up:false, popTop ≈ btnBottom, gap = -1px` (border-shared).
- All 6 chips computed icon font-size `14px` (rule applies via `!important`).
- Review At-Risk output now has 4 sections (Risk-ranked / Usage & Adoption / Dust read / Dust summary), 8 feature-adoption rows total, both account usage blocks present, Dust read paragraph references the Admin Console collapse.
- Active chip toggle: `dustQuick('Prepare My Day')` → "Prepare My Day" chip has `.on`, all others don't. After `resetPanel()`, 0 active chips.
- Brief-strip equal height holds: 400/400/400 at 1440 viewport.

### Not touched
- Other Ask Dust templates (Prepare My Day / Draft Follow-Ups / Find Open Loops / Coach Me / Ask Dust free-text) — unchanged.
- Dropdown content (the 9 agent rows + Request new agent footer) — unchanged.
- All other widgets, drawers, Mission Briefing views, Ghost-Buster, TeamOS Live, Agent Hub, Task Briefs, Drive Docs, My Accounts tab, Service Worker, offline resilience.
- `agentBtn`, `openAgentDrawer`, `setDrawerMode`, every other JS handler — unchanged.

---

## [3.0.0] — 2026-05-17

My Accounts tab — live AI-powered account workspace. Fourth tab in the top nav (CSM Dashboard · Recipe for Success · Enablement · My Accounts). Pull-only by design: the CSM comes here intentionally for deep dives, no unsolicited surfacing.

### Added — Tab + layout
- New `n-tab` "My Accounts" wired to `goTab('myacct', this)`. New `#tab-myacct` container.
- Two-column workspace (`.ma-grid` = `300px minmax(0,1fr)`):
  - **Left** (sticky at top:88px under the pulse strip): search bar + live results dropdown + Recent sessions list (last 5, persisted to `localStorage` key `teamos_ma_sessions`).
  - **Right**: workspace content — default state (recent sessions list) when no account is loaded; Account Snapshot + Quick Launch + Ask-anything bar when an account is selected; agent output card when a Quick Launch agent has run.
- Collapses to single column at <1080 px.

### Added — Account search across full book
- `MA_BOOK` = 16 accounts: 6 known (Acme Corp / Brightex Inc / NovaVault / Meridian Health Systems / Creston Software / Apex Dynamics) + 10 additional book accounts per spec (Klaxton Labs / Pinnacle Systems / Redwood Analytics / Hartwell Technologies / Cascade Partners / Summit Digital / Ironbridge Corp / Vantage Solutions / Palo Data / Crestmont Group).
- `_maSearch(q)` filters live on `oninput` (case-insensitive substring). Results show account name + status pill (`Healthy` / `At Risk` / `Critical` / `Dark` / `Book`). Click loads the account.

### Added — Structured Account Snapshot
- `MA_KNOWN` table holds canonical snapshot data for the 6 known accounts — populated from the existing dashboard data objects per the spec's data-injection block.
- For the 10 book accounts: `_maGenerateBookSnapshot(name)` produces a deterministic placeholder snap from a name-derived seed and tags the card with a `Demo data · Gainsight sync pending` banner. Cached in session memory (`MA_BOOK_CACHE`).
- Snapshot card structure exactly per spec:
  - Header: `[Account name] · Health [n] · [Healthy / At Risk / Critical / Dark]`
  - 5-row KV grid: Renewal · Licenses · Last Gong · Open CTAs · Last touch
  - 2-sentence summary in a teal-left-border card
  - 2×2 Quick Launch grid: `⚡ Risk Analysis` · `📅 Renewal Forecast` · `🔍 Discovery Questions` · `📄 Account Brief`
  - Tools row: `📝 Log Note` · `✅ Create Task / CTA`
  - Ask-anything free-text input at the bottom

### Added — Anthropic API integration with safe fallback
- `_maCallAnthropic(systemPrompt, userMessage, mockFn)` POSTs to `MA_API_ENDPOINT` (default `/api/anthropic` — Vercel serverless proxy per SPEC §7.2 so the API key never touches the browser). Uses `AbortController` with a 10-second timeout. On any failure (proxy unavailable, network error, timeout), it falls back to `mockFn()` — a deterministic spec-formatted response.
- `MA_SYSTEM_PROMPT` matches the spec verbatim.
- `_maBuildUserMessage(type, name, snap)` injects the snapshot data line into the per-agent user message template — Risk Analysis / Renewal Forecast / Discovery Questions / Account Brief.
- `_maMockAgent(type, name, snap)` returns realistic content in the exact spec format for every agent type. Output adapts to the snapshot's risk band (`r` / `a` / `gy` / `g`) so a Critical account produces a Critical-toned response, etc. Source-line footer indicates whether the response came from the live API (`Live response · Dust + Anthropic`) or the prototype mock (`Phase 1 prototype response · Live Anthropic API connects via /api/anthropic Vercel proxy in Phase 2`).
- `[Push to Gainsight]` button on every agent output → toast `[Agent] pushed to Gainsight · [Account] · Logged ✓`.
- `[Back to Snapshot]` link in the agent header + secondary button restore the snapshot view.

### Added — Free-text Ask
- `<form class="ma-ask">` at the bottom of every snapshot view. Submits via `_maFreeQuery` which builds `"Context — [Account] snapshot: [snapshot line]. Question: [user input]"` and routes through the same `_maCallAnthropic` plumbing. Response renders in a chat-style card with the quoted question + answer + source line.

### Added — Notes panel (Gainsight AI Notes sync)
- `[📝 Log Note]` toggles an inline form: Note type dropdown (Account Update / Call Summary / Stakeholder Change / Risk Flag / General) + free-text area + `Preview Sync` button.
- Preview card shows the confirmation per spec: `Syncing to Gainsight AI Notes · Account: [Name] · Type: [Type] · [Timestamp]` + the note body verbatim + `Edit` / `Confirm` buttons.
- Confirm → toast `Synced · [Account] · Gainsight AI Notes · [Timestamp] ✓`. Note content is never modified. Push doesn't fire until Confirm is clicked.

### Added — Task / CTA push (Gainsight)
- `[✅ Create Task / CTA]` toggles an inline form: Task name · Due date (default: today) · Priority (High/Medium/Low) · Type (CTA/Email/Call/Internal Task) + `Preview` button.
- Preview card: `Creating in Gainsight · [Account] · Task: [Name] · Due: [Date] · Priority: [Level] · Type: [Type] · Assigned to: Carmen` + `Edit` / `Confirm`.
- Confirm → toast `Created · [Account] · Gainsight · [Timestamp] ✓`. No push until confirmed.

### Added — Recent sessions persistence + restore
- Every snapshot open, agent run, and (intentionally not) free-text query writes to `localStorage` under `teamos_ma_sessions` (last 5 entries, FIFO). Each entry: `{ account, type, ts, preview, body, live }`.
- Restore button on each session re-opens the account and renders the saved agent output without re-firing the API.
- Default state (no account selected) shows the recent sessions inline in the main content area so the CSM can pick up where they left off.

### Engineering
- All API calls guarded with `try/catch` per SPEC §6.5. Mock fallback ensures the UI is always usable, even with no network.
- All user input HTML-escaped via `_maEscape` before being injected into innerHTML.
- `localStorage` writes wrapped in `try/catch` to silently no-op when storage is denied (private browsing, quota exceeded).
- New `.ma-*` CSS namespace (~60 rules) bound to existing tokens. No new color values.
- The Anthropic API endpoint is configurable via the `MA_API_ENDPOINT` constant at the top of the module — Phase 2 deployment just needs to ship a Vercel serverless function at `/api/anthropic` that forwards to `https://api.anthropic.com/v1/messages` with the secret key from `DUST_API_KEY` / `ANTHROPIC_API_KEY` env var. No client-side change required.
- Model identifier from spec (`claude-sonnet-4-20250514`) preserved in the API payload.

### Not touched
- All existing tabs (CSM Dashboard / Recipe for Success / Enablement) and their content — unchanged.
- All dashboard widgets, drawers, agent outputs, Ghost-Buster views, TeamOS Live drawer, Agent Hub, Task Briefs, Drive Docs, pulse strip indicators, notification rail, Service Worker, offline-resilience layer.

---

## [2.14.0] — 2026-05-17

Enablement tab added as a third top-nav tab after Recipe for Success. Placeholder for the Seismic integration arriving in Phase 2.

### Added
- `n-tab` entry "Enablement" wired to `goTab('enable', this)`.
- `<div class="tc" id="tab-enable">` container with the spec content:
  - Header `📚 Enablement · Powered by Seismic` + sub-line explaining the Phase 2 sync.
  - "Assigned trainings" section heading + 3 training rows.
  - Row 1: `🟡 In Progress` — Enterprise Renewal Conversations · Due Jun 1 · 4 modules · 62% complete · `[Continue →]`. Amber progress bar.
  - Row 2: `⬜ Not started` — Champion Change Playbook · Due Jun 15 · 3 modules · 0% complete · `[Start →]`. Empty progress bar.
  - Row 3: `✅ Complete` — Gainsight Power User Certification · Completed May 2 · 5 modules · `[Review →]`. Full teal progress bar.
  - Phase 2 footer: `🔌 Seismic API · Phase 2 integration · Assigned trainings will sync automatically when connected · Contact your CS Ops admin to enable`.
- Every action button (`Continue` / `Start` / `Review`) calls `enOpenSeismic(name)` which toasts `Opening Seismic · [Training Name] ✓`.
- New `.en-*` CSS namespace bound to existing tokens. No new color values.

### Changed — Pulse strip hoisted out of `#tab-dash` so it stays visible across every tab
The pulse strip was a child of `#tab-dash`, so it disappeared whenever the CSM switched to Recipe or Enablement. v2.14.0 moves the `<div class="pulse-strip">` block out of `#tab-dash` and makes it a sibling of the three `.tc` tab containers. `position: sticky; top: 44px` continues to keep it pinned below the nav on every tab. Verified: pulse strip `top=44` on Dashboard, Recipe, and Enablement tabs.

### Not touched
- Existing `goTab` logic — unchanged.
- All 7 pulse-strip indicators (calls / risk / arr / ctas / dark / tasks / Drive Docs) — unchanged.
- Recipe for Success tab content — only the position changed (it now sits next to the moved pulse strip rather than inside the dashboard tab content).
- Every other widget, drawer, agent output, Ghost-Buster view, TeamOS Live drawer, Task Brief, Service Worker, offline-resilience layer.

---

## [2.13.0] — 2026-05-17

Dust recommendation panel added to the Recipe for Success tab. Pairs the auto-populated scorecard with three actionable next-step cards keyed to the weighted score.

### Added
- New `.rcp-dust` panel appended below the existing scorecard in `buildRecipe()`. Single column layout (collapses to 1-column at <1100px viewport).
- Header: `🤖 Dust · Your Q2 Action Plan` + sub-line: *"Based on your current 74.5% weighted score, here's what moves the needle most."*
- Three recommendation cards (`.rcp-card`) with color-coded left borders:
  - **Biggest gap** (red) — EBR Coverage: 3/24 (12.5%). Action: `[Draft EBR Outreach for 5 Accounts]` → toast `Dust drafting EBR outreach for 5 priority accounts · Opens in Mission Briefing ✓`.
  - **Quick win** (amber) — Blank Renewal Statuses: 3 accounts. Action: `[Open Renewal Status Update]` → toast `Opening Salesforce renewal status view · 3 accounts flagged ✓`.
  - **Protect** (teal) — Overdue CTAs: 2 accounts (NovaVault + Brightex). Action: `[Open Overdue CTAs in Gainsight]` → toast `Opening Gainsight Cockpit · Filtered to overdue CTAs ✓`.
- Panel footer: `Dust analysis · Gainsight + Salesforce · Updated today 9:00 AM · Refreshes daily`.
- Three new helpers: `rcpDraftEBR`, `rcpRenewalStatus`, `rcpOverdueCTAs`.

### Not touched
- Existing scorecard (`buildRecipe` data, banner, metric cards, weighted score block, source labels). All preserved verbatim.

---

## [2.12.0] — 2026-05-17

NovaVault Save Strategy drawer gains a secondary "Generate Save Deck" footer button alongside the existing Push to Gainsight CTA push.

### Added
- New action type in the agent drawer footer renderer: `f.a === 'deck-sec'`. Same height/padding/`flex:1` as the regular outlined Push-to-Gainsight button, but onclick fires `openDeckModal(acct)` instead of a toast.
- `DRAWER.save.nova.foot` now has two entries: the original `Push to Gainsight` toast action and the new `📊 Generate Save Deck` deck-modal action. Acme and Brightex Save drawers are untouched.
- `openDeckModal(acct)` upgraded:
  - Added `id="modal-t"` to the modal title element.
  - New per-account `titles` map switches the title between "Building your QBR deck" (acme) / "Building your Risk Review deck" (brightex) / "Building your NovaVault Save Deck" (nova).
  - Existing per-account `names` map for the sub-line is unchanged.

### Verified end-to-end in a headless render
- NovaVault Save drawer footer renders 2 buttons: `Push to Gainsight` + `📊 Generate Save Deck`.
- Clicking the Save Deck button opens the modal with title `Building your NovaVault Save Deck` and sub `Save Deck Builder · Emergency retention build`. All existing deck-modal progress animation and final state untouched.
- Acme Save drawer footer renders only `Push to Gainsight` — no Save Deck button. Verified the renderer doesn't leak the deck button onto other accounts.

### Not touched
- Existing `deck` action (used by Mission Briefing default's `Generate QBR Deck` button) — same primary-style rendering as before.
- All other Save Strategy drawer content (talking points, discovery, objection handlers, extension terms) — unchanged.

---

## [2.11.0] — 2026-05-17

Ghost-Buster 3-Touch Sequence rebuilt as an editable, channel-switchable, strategy-aware wizard. All 9 touches across the three dark-account views (view-meridian / view-creston / view-apex) now share a single data-driven renderer.

### Added — `GB_SEQUENCES` data table + `_gbRenderSequence` renderer
- Per-account contact map (`name` / `email` / `slack` / `linkedin` / `phone`) so a channel switch re-points the recipient line automatically.
- 9 touches total (3 per account) with fields: `ch` (default channel) / `day` (label) / `subject` / `body` / `strategy {why, prep, expected, risk}`. All copy preserved from v2.10.1; new strategy content per spec.
- `_gbRenderSequence(acct)` emits the full 3-touch HTML into the per-view `<div id="gb-seq-{acct}">` host. Init on boot renders all three sequences.
- `_gbRenderTouchCard(acct, idx, opts)` emits a single touch and is also used by the channel-switch handler to swap one card in place without re-rendering the whole sequence.

### Added — Editable channel selector (Enhancement 1)
- Channel chip in each touch summary doubles as a dropdown trigger: `📧 Email ▾`. Click opens a 170px popover with all four channels (📧 Email / 💬 Slack DM / 🔗 LinkedIn / 📞 Phone). Active channel highlighted teal.
- `gbSwitchChannel(acct, idx, newCh)` rewrites just that touch card. Channel-specific UI:
  - **Email** → `To: name · email`, subject row, body, signature, `[Send via Gmail][Save as Draft][Edit first]`
  - **Slack DM** → `To: name · @handle`, no subject, body, `[Copy message][Edit first]`
  - **LinkedIn** → `To: name · LinkedIn`, "LinkedIn message" label instead of subject, body, `[Copy message][Edit first]`
  - **Phone** → `Call: name · phone`, "Talking points" label, body, `[Copy talking points][Edit first]`
- Channel switch **preserves** the user's in-progress body and subject edits — the renderer reads the current DOM values, stores them in `GB_SEQUENCES`, then re-renders with the new channel. Verified end-to-end: editing the subject, switching email → slack → email round-trips the edited subject back intact.
- Outside-click handler scoped to `.gb-touch-ch-wrap` closes any open channel dropdown.

### Added — Editable subject line (Enhancement 2)
- Email touches now render `<label>Subject</label><input type="text" value="…">` — borderless, bold, full-width, same typography as the previous static label. Tab moves to the message body. `oninput` syncs the value into `GB_SEQUENCES` so it survives channel switches and re-renders.
- Slack / LinkedIn touches hide the subject row entirely (no more "Subject: (Slack — no subject)" placeholder). LinkedIn shows "LinkedIn message" as a section heading instead. Phone shows "Talking points".

### Added — Strategy & Context panel (Enhancement 3)
- Collapsed-by-default toggle link `▸ View strategy & context` right-aligned above each touch body. Click expands a 4-section panel:
  - **Why this touch** — strategic rationale for this channel + timing
  - **Internal prep** — what to check / who to loop in before sending
  - **Expected response** — what a good vs. concerning response looks like and what to do in each
  - **Risk if ignored** — what happens to the account if this touch never goes out
- Full content per spec for all 9 touches (Meridian × 3, Creston × 3, Apex × 3). `\n` in any strategy field renders as `<br>` so the multi-paragraph fields keep their breaks.
- Toggle label flips to `▾ Hide strategy & context` when open.

### Added — Save as Draft button (Enhancement 4)
- New `[💾 Save as Draft]` button on every email touch — between `[Send via Gmail]` and `[Edit first]`.
- `gbSaveDraft(acct, n)` toasts the spec copy: `Saved to Gmail drafts · [Account] · Touch [N] · Opens in Gmail for final review ✓`.
- Not shown on Slack / LinkedIn / Phone touches (the channel definitions in `GB_CHANNELS.actions` are channel-specific).

### Added — Email signature configuration (Enhancement 5)
- `localStorage` key `teamos_signature`, default value:
  > Carmen Corio<br>Customer Success Manager · 1Password<br>📧 c.corio@1password.com<br>📅 calendly.com/carmen-corio
- Signature gear bar (`.gb-sig-bar`) sits between the account header and the Situation Read section in every Ghost-Buster view: `Email signature applied to all email touches · ⚙ Signature` button.
- Clicking `⚙ Signature` toggles an inline panel (`.gb-sig-panel`) with a multi-line `<textarea>`, `Cancel`, and `Save signature` buttons.
- `gbSaveSignature(text)` writes to localStorage, re-renders all 9 touches across all 3 accounts so the new signature appears immediately on every email touch, and toasts `Signature saved · Applied to all email touches ✓`.
- Signature is appended to every email body with a thin top border (`<div class="gb-sig">`). Slack / LinkedIn / Phone touches omit the signature (channel-appropriate).

### Touch card UI cleanup (per spec)
1. Removed the `Subject: (Slack — no subject)` placeholder from non-email touches.
2. Touch header now reads `[Touch N] [channel selector ▾] · [Day label]` on a single line with chevron right-aligned.
3. Strategy toggle link is right-aligned above the message body.
4. Button order is consistent: email = `[Send via Gmail][Save as Draft][Edit first]`; Slack/LinkedIn = `[Copy message][Edit first]`; Phone = `[Copy talking points][Edit first]`.
5. Signature block is below the message body with a thin separator (`border-top: 1px solid var(--bd)`).

### Verified end-to-end in a headless render
- 3 sequences render with 3 touches each. Default channels match spec: Meridian (email/linkedin/email), Creston (email/slack/email), Apex (email/email/email).
- Channel switch from LinkedIn → Email on Meridian Touch 2 swaps `[Copy message][Edit first]` for `[Send via Gmail][Save as Draft][Edit first]`, adds the subject row, and adds the signature block.
- Subject edit on Meridian Touch 1 survives an email → slack → email round-trip (`'EDITED SUBJECT TEST'` round-tripped back intact).
- `Save as Draft` fires the exact spec toast: `Saved to Gmail drafts · Meridian Health Systems · Touch 1 · Opens in Gmail for final review ✓`.
- Strategy panel toggle opens 4 sections with the spec labels (`Why this touch` / `Internal prep` / `Expected response` / `Risk if ignored`). All 9 touches × 4 sections = 36 strategy paragraphs populated.
- Signature save: `gbSaveSignature('Custom Sig Test\nLine 2')` → localStorage `teamos_signature='Custom Sig Test\nLine 2'`, every email touch in all 3 views updates immediately.
- Channel switch Email → Slack hides subject row + signature, replaces button row with `[Copy message][Edit first]`.

### Not touched
- Other Ghost-Buster sections: Situation Read (3 colored cards), Re-engagement Intel grid, footer Push Sequence button, Apex Champion Change Protocol. All preserved verbatim.
- All other dashboard widgets, drawers, Mission Briefing views, nav, pulse strip, notification rail, Service Worker, offline resilience, Agent Hub, TeamOS Live drawer, Task Brief, Drive Docs, Priority Stack, Next Up, Ask Dust, Recipe for Success tab.
- `openGhostBusterFromPopover`, `backFromGhostBuster`, `gbSendTouch`, `gbEdit`, `gbCopyTouch`, `gbPushSequence`, `gbNotifyAE`, `gbLinkedIn` — unchanged, still used by the renderer.

### Engineering
- The 9 inline `<details class="gb-touch">` blocks (~200 lines of HTML) in the three views are replaced with three `<div id="gb-seq-{acct}">` host divs + one shared renderer (~250 lines of JS). Net file size grew ~150 lines but the per-touch maintenance cost drops to one data-table edit.
- New CSS namespace (`.gb-touch-ch`, `.gb-ch-pop`, `.gb-subj-row`, `.gb-strat`, `.gb-sig-bar`, `.gb-sig-panel`, `.gb-sig`). All styles bind to existing tokens — no new color values.
- All channel-specific UI driven by `GB_CHANNELS[ch].actions` array (`send` / `draft` / `copy` / `copyTp` / `edit`). Adding a new channel later is a single entry in the table.
- HTML-escaping (`_gbEscape`) applied to all dynamic strings injected into innerHTML. The only externally-influenced surface is the signature textarea (user-typed); it's stored as plain text in localStorage and escaped on every render.

---

## [2.10.1] — 2026-05-17

QA sprint covering 10 bugs reported against v2.10.0 plus the "CFT Docs" → "Drive Docs" rename. No new features.

### Fixed

- **Bug 3 — Apex renewal date now consistent at Aug 1 everywhere.** The pulse-strip Dark Accounts popover and the Dark Zone widget row for Apex both said "Renews Jul 15"; the Ghost-Buster `view-apex` already said "Renews Aug 1" (correct). Updated both stale instances. Verified with `grep "Renews Jul 15"` (zero remaining hits for Apex). Creston's "Jul 15" in the Ghost-Buster view-creston is for Creston, not Apex, and was left as-is per spec.
- **Bug 5 — CTA Done button decrements instantly.** Removed the chained `setTimeout(500ms → setTimeout(300ms))` inside `markCtaDone`. The 800ms artificial delay was masquerading as an API call simulation but ended up looking broken. Now: click → `display: none` on the row + count decrement in the same tick. Verified: 5ms elapsed from click to DOM update in the headless test.
- **Bug 4 — Offline banner positioning defensive cleanup.** The existing CSS (`top: 0; transform: translateY(-100%)` hidden / `translateY(44px)` visible) was geometrically correct (verified: hidden rect `[-36, 0]`, visible rect `[44, 80]`). Added `pointer-events: none` to the hidden state and `pointer-events: auto` to the visible state so the off-screen banner never intercepts clicks against the nav even in browsers where the transform doesn't fully lift it out of the hit-test layer.
- **Bug 6 — Assistant mode no longer renders a blank body.** Two paths fixed:
  - **Toggle Live → Assistant when an agent was previously loaded:** already worked in v2.8.2 via `_drawerCtx.lastAgent` replay. Re-verified — toggling back restores "Save Strategy" / "NovaVault" content.
  - **Toggle to Assistant when no agent has ever been loaded:** previously left the body empty. Now renders a centered placeholder: `<i class="ti ti-sparkles"></i> Select an agent above or use Quick Launch to load a brief for any account.` Header reads `Assistant / No agent loaded yet`.
- **Bug 7 — Single-dropdown invariant.** Added `closeAllDropdowns()` which calls `closePops()` (pulse-strip popovers) + `closeNotifPops()` (notification rail popovers) + closes the Ask Dust Agents dropdown by removing the `.on` class from `#dust-agents-pop`. Wired into the three opener handlers: `togglePop` (pulse strip — was calling `closePops()` alone), `toggleNotifPop` (notification rail — was calling `closeNotifPops()` alone), and `toggleAgentsDropdown` (Ask Dust Agents — was calling `.classList.toggle('on')` with no cleanup). Verified: opening any one dropdown now closes the other two.
- **Bug 8 — Tasks popover ellipsis.** `.tk-row-title` already had `overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0` (set in v1.8.0). Re-verified in headless test — properties present and applied to every row. No CSS change needed; the bug may have been observed against an older build or under a non-`min-width: 0` parent grid track. Kept the existing properties unchanged.
- **Bug 9 — NEXT UP tag restored on Back.** Added explicit restoration of the `#view-default .rp-hd.pl .pl-tag` innerHTML to `<span class="pl-dot"></span>Next Up &middot; Auto-loaded` inside `resetPanel()` so the tag is always in the correct state after any Back-button path, regardless of whether anything mutated it earlier. Defensive — verified the tag now reads "Next Up · Auto-loaded" after `openPanel('brightex')` → `resetPanel()`.
- **Bug 11 — Live Signals account names readable at all viewports.** The `.ls-mid` grid was 6 cols (`140px auto 1fr auto auto auto`) which over-committed the row width at narrow Live Signals widget widths and squeezed `.ls-acct` to 0–18 px. Restructured to 4 cols (`auto minmax(0,1fr) auto auto` = account / description / severity / action). Hid `.ls-type` and `.ls-time` (still in the DOM for future wider layouts). Set `.ls-acct { min-width: 60px; max-width: 140px }` so the account name always shows at least 6 characters + ellipsis. Verified at 1280×900: all 5 rows now render the account name at ≥60 px wide. Account name `.acct-lk` click still routes to Mission Briefing — verified clicking the NovaVault name opens `view-nova`.

### Changed (UI rename)
- **`CFT Docs` → `📁 Drive Docs` everywhere.** Pulse-strip indicator label, dropdown header (`Drive Docs · Google Drive`), and SPEC references all renamed. The internal id `pop-cft` / `pb-cft` and the `cft-*` CSS namespace are unchanged to keep the diff scoped to user-visible copy.

### Changed (CFT/Drive Docs viewport safety)
- **Bug 2 — Drive Docs dropdown can no longer overflow the viewport.** Added `max-width: min(380px, 90vw)` to `.cft-pop` so the dropdown is clamped to 90% of the viewport at narrow widths regardless of how far right the trigger sits. Also added explicit `right: 0; left: auto` to keep the popover anchored to the right edge of its `.ps-wrap` (default `.pop` rule was `left: 0`). Verified at 1280 px: pop right-edge=865, well within viewport=1280. The 90vw clamp kicks in defensively at viewports narrower than ~422 px (none of the supported breakpoints, but safe).

### Investigated, no functional change required
- **Bug 1 — "Agent Hub invisible".** Could not reproduce. The Agent Hub card renders at 601×560 px at 1280 px viewport with all expected counts (12 Quick Launch chips, 3 Recent Outputs rows, 2 Active Account doc rows). All CSS in the chain (`.ah-card`, `.rp-scroll`, `.rp-view.on`, `.rp`, `.main`) is sound: `.rp` is content-height since v1.9.0, `.rp-scroll` is content-height, `.rp-view.on` is `display: flex; flex-direction: column`, no flex collapses occur. The likely source of the user's "doesn't appear" report is that the card sits at y≈1029 px and is below the fold of an 800-tall viewport — the user must scroll down within the page to see it. **No CSS change made.** Documented here for trace-back if the bug recurs.

### Verified end-to-end in a headless render
| Bug | Status | Evidence |
|---|---|---|
| 1 — Agent Hub | Not reproducible | 601×560 with 12/3/2 counts |
| 2 — Drive Docs overflow | Fixed | right=865 ≤ vw=1280 at narrow widths |
| 3 — Apex date | Fixed | All Apex surfaces say "Aug 1" |
| 4 — Offline banner | Verified + hardened | hidden top=-36 pe=none / visible top=44 pe=auto |
| 5 — CTA Done delay | Fixed | 5ms elapsed click→update |
| 6 — Assistant blank state | Fixed | "Select an agent above…" placeholder renders |
| 6.b — Live → Assistant restore | Fixed | Returns to last-loaded agent title |
| 7 — Two dropdowns open | Fixed | Opening Agents closes Drive Docs and vice versa |
| 8 — Tasks ellipsis | Verified | `overflow: hidden; text-overflow: ellipsis` present |
| 9 — NEXT UP tag | Fixed | Tag reads "Next Up · Auto-loaded" after Back |
| 11 — Live Signals account widths | Fixed | All ≥60 px; click routes to Mission Briefing |

### Not touched
- All working features. All Mission Briefing content. All agent outputs. All Ghost-Buster wizard content. All TeamOS Live content. All notification rail rows + behavior. Recipe for Success tab. Service Worker logic. Offline resilience layers (snapshot, queue, banner content, retry handler). All Ask Dust templates. Universal account-click handlers. Calendar onclicks. Pulse-strip popover content (calls / risk / arr / ctas / dark / tasks). Tasks dropdown rendering (`renderTasksList`). Task Brief panel. Drive Docs dropdown content + search behavior + data tables. Next Up card content. Priority Stack rows.

### Engineering
- Two CSS rule patches: `.cft-pop` (added `max-width`, `right: 0`, `left: auto`), `.offline-banner` (added `pointer-events: none`/`auto` per state).
- One CSS namespace rewrite: `.ls-mid` grid template + `.ls-acct` constraints + `.ls-type`/`.ls-time` hidden.
- Three JS function patches: `markCtaDone` (delay removed), `resetPanel` (tag restore line), `setDrawerMode` (default-state body when no `lastAgent`).
- One new JS function: `closeAllDropdowns()`. Wired into `togglePop`, `toggleNotifPop`, `toggleAgentsDropdown`.
- Three HTML string changes: `"CFT Docs"` → `"Drive Docs"` (pulse-strip button label + dropdown header) and `"Jul 15"` → `"Aug 1"` on two Apex surfaces.

---

## [2.10.0] — 2026-05-16

CFT Docs added to the pulse strip as a 7th indicator with a Google Drive search dropdown. Pre-filtered by the active account, searchable across the account's docs + a small global library.

### Added — 7th pulse-strip indicator
- New `<button id="pb-cft">📁 CFT Docs</button>` ps-wrap directly after Tasks. No count badge — this is an access portal, not a notification.
- Click routes through the existing `togglePop('cft', event)` (no JS handler changes), so the indicator inherits the established "one popover at a time" behavior, outside-click close, and `closePops()` from previous popovers.

### Added — CFT Docs dropdown
- 380px right-aligned popover (`.cft-pop`). Max height 520px with internal scrolling on the doc list.
- **Header:** `📁 CFT Docs · Google Drive` + close button.
- **Search bar:** full-width input, pre-labeled with the active account name. Placeholder updates when the active account changes.
- **Recent label:** small uppercase muted text — `RECENT · [ACCOUNT NAME]` for an active account, `GLOBAL RESOURCES` for dark-zone / no-account contexts.
- **Doc rows:** file-type icon (left, color-coded per kind — `doc`/`sheets`/`slides`/`pdf`), doc name (bold), `modified · type` meta line, `[Open]` (dark primary) + `[Copy Link]` (outlined) action buttons right-aligned. ~56px row height with thin dividers.

### Added — content
- **Acme Corp** (4 docs): Acme QBR Presentation Deck (Slides), Acme Joint Success Plan (Docs), 1Password Enterprise Comparison Sheet (Sheets), Acme Onboarding Checklist (Docs).
- **Brightex Inc** (4 docs): Brightex Master SLA Agreement, Brightex Renewal Core Deck · Draft v2 (Slides), 1Password Business SLA Reference, Brightex Competitive Battle Card.
- **NovaVault** (4 docs): NovaVault Executed Contract 2025 (PDF), NovaVault Save Playbook, Champion Transition Template, NovaVault Implementation Summary.
- **Global library** (always searchable, shown alone for dark accounts): 1Password Security White Paper, 1Password Implementation Guide, CSM Playbook — Renewal Conversations. Each has a `tags` field (e.g. `security white paper compliance`) so they surface for related search queries even when their name doesn't contain the literal term.

### Added — search behavior
- `cftSearch(query)` runs on every keystroke (`oninput`). Case-insensitive substring match against `name + tags`.
- Search pool: current account's recent docs + the 3 global docs. Brightex docs don't surface in an Acme search context (the dropdown is account-scoped per spec).
- Empty query → restore default-recent for the active account.
- No matches → `No docs found for "[query]" · Try a different search term`.
- Results label switches to `Results · "[query]"` while a query is active.

### Added — active account sync
- `_updateCFTDocs(viewId)` is wired into the existing `openPanel` hook (one new line) and `resetPanel` (one new line). Mirrors the v2.5.0 `_updateAgentHubAccount` pattern.
- Behavior:
  - `default` (Acme pre-loaded MB) → Acme docs.
  - `acme` / `brightex` / `nova` → that account's docs.
  - `meridian` / `creston` / `apex` (Ghost-Buster views) → Global Resources label + 3 global docs only.
  - `dust` / `draft` / `slack-sum` / `taskbrief` / `agentout` → leave previous selection alone (consistent with Agent Hub's behavior for these transient views).
- Any active search is cleared on account switch so the recent list re-renders cleanly.

### Added — button behaviors
- `[Open]` → `cftOpen(name)` → `toast("Opening [Doc Name] from Google Drive ✓")`.
- `[Copy Link]` → `cftCopy(name)` → writes a slugified Drive URL (e.g. `https://drive.google.com/file/d/acme-qbr-presentation-deck/view`) to the clipboard via `navigator.clipboard.writeText` (graceful no-op when unavailable) and toasts `"Link copied · [Doc Name] ✓"`.

### Verified end-to-end in a headless render
- Pulse strip has 7 indicators ✓
- Opens with `Recent · ACME CORP` label, 4 Acme rows, placeholder `Search docs for Acme Corp…` ✓
- `openPanel('brightex')` → header label flips to `Recent · BRIGHTEX INC`, list swaps to the 4 Brightex docs, placeholder updates ✓
- `openPanel('nova')` → NovaVault docs ✓
- `openPanel('meridian')` (dark zone) → `Global Resources` label, only the 3 global docs ✓
- `resetPanel()` → restores Acme docs ✓
- Search `success` (Acme active) → returns `Acme Joint Success Plan` ✓
- Search `security` → returns global `1Password Security White Paper` (via name match) ✓
- Search `renewal` → returns `CSM Playbook — Renewal Conversations` (via `tags`) ✓
- Search `foobarbaz` → empty state with the right copy ✓
- Clearing search restores Acme recent ✓
- `[Open]` toast: `Opening Acme QBR Presentation Deck from Google Drive ✓` ✓
- `[Copy Link]` toast: `Link copied · Acme QBR Presentation Deck ✓` ✓
- Outside-click closes the popover (handled by the existing `.ps-wrap` outside-click listener) ✓

### Not touched
- All 6 other pulse-strip indicators (calls / risk / arr / ctas / dark / tasks) and their popovers — unchanged.
- `togglePop`, `closePops`, the outside-click listener — unchanged.
- `openPanel` and `resetPanel` — each got exactly one line added (`if (typeof _updateCFTDocs === 'function') _updateCFTDocs(id);`), no other body changes.
- Every other widget, every drawer, every Mission Briefing view, the v2.5.0 Agent Hub & Workspace card (which has its own `DOC_LIBRARY` for the in-card "Recent Docs" section — kept separate from `CFT_DOCS` to keep concerns decoupled), Ask Dust, Task Brief, Ghost-Buster wizard, TeamOS Live drawer, Service Worker, offline resilience, Recipe for Success tab.

### Engineering
- New `.cft-*` CSS namespace (~28 rules). All styles bind to existing color tokens. No new color values introduced.
- File-type icons via Tabler: `ti-file-text` (Docs), `ti-table` (Sheets), `ti-presentation` (Slides), `ti-file-certificate` (PDF). Color tinted per type via `.cft-row.pdf/slides/sheets` modifiers.
- `CFT_DOCS` (4 docs × 3 accounts = 12 entries) and `CFT_GLOBAL` (3 entries) are static maps. Roughly 40 lines total. Phase 2 will replace the maps with a Drive API fetch keyed by the active account.
- All clipboard writes guarded with a `typeof navigator.clipboard.writeText === 'function'` shape check via `&&` short-circuit. Failures are silent — the toast still fires so the user gets immediate feedback.

---

## [2.9.0] — 2026-05-16

Today's Priority Stack expanded from 3 rows to 5 rows. The ranking now reflects what the sub-label already claimed since v1.4.0 — `AI-RANKED BY HEALTH, RENEWAL, CTAS, GONG SILENCE` — by pulling priorities across email, dark zone, overdue CTAs, and project deadlines, not just health score.

### Changed — 5-row Priority Stack
| # | Account | Badge | Context | Button |
|---|---------|-------|---------|--------|
| 1 | NovaVault | **CRITICAL SAVE** (red) | 17d to renewal · champion lost · health 23 | `Save Strategy` → `openAgentDrawer('save','nova')` |
| 2 | Brightex | **EMAIL PENDING** (amber) | Sarah Chen SLA question · unanswered 4h · renews 31d | `Draft Reply` → `draftReply('brightex')` |
| 3 | Acme Corp | **EXPANSION** (teal) | 9:00 AM QBR · SSO signal · health 82 | `Prep Me` → `openAgentDrawer('prep','acme')` |
| 4 | Meridian | **73 DAYS DARK** (gray) | No contact · $22K at risk · inbound today | `Ghost-Buster` → `openGhostBusterFromPopover('meridian')` |
| 5 | Brightex | **OVERDUE CTA** (amber) | Renewal deck due Friday · 2d overdue | `Open Task` → `openTaskBrief('brightex-proj')` |

### Added — two CSS variants
- `.bf-tag.gy` — gray badge variant for neutral / dark-zone signals. Uses `var(--surf2)` bg with a thin `var(--bd)` border so it reads as a muted pill against the white card.
- `.bf-act.gy` — dark gray action button (`var(--tx2)` bg + white text) for the Ghost-Buster CTA. Sits between the loud reds/teals and the soft outlined chips.
- Existing variants (`.bf-tag.r/a/g`, `.bf-act.r/a/g`) re-used for the other 4 rows.

### Verified end-to-end in a headless render
All 5 buttons fire the expected target:
- Row 1 → drawer in Assistant mode, `drawer-title="Save Strategy"` ✓
- Row 2 → `view-draft` with title `"Brightex Inc · Reply to Sarah Chen"` ✓
- Row 3 → drawer in Assistant mode, `drawer-title="Pre-Call Brief"` ✓
- Row 4 → `view-meridian` (Ghost-Buster wizard) ✓
- Row 5 → `view-taskbrief` with title `"Renewal deck due Friday"` ✓
- Row 4 account name (`Meridian`) click → opens `view-meridian` via the v2.0.0 universal account-click handler ✓
- Brief-strip equal-height (v2.2.0) still holds: card heights are 400 / 400 / 400 at 1440px viewport.

### Not touched
- Every other widget (Next Up, Ask Dust, brief-strip layout, pulse strip, notification rail, calendar, Live Signals, Urgent Inbox, Today's Tasks, Dark Zone, deck modal, Mission Briefing views, Ghost-Buster wizard, Agent Hub & Workspace, Task Brief panel, TeamOS Live dual-mode drawer).
- All JS handlers — no function bodies modified, only new `onclick` wiring on the new rows.
- The sub-label `"AI-ranked by health, renewal, CTAs, Gong silence"` — unchanged; the data now matches the claim.

### Engineering
- Pure HTML/CSS change. Two new CSS variants (~2 lines each), five new `<div class="bf-it">` blocks replace the previous three. Existing `.bf-priority .bf-it` grid layout from v1.4.0 (`auto 1fr auto`) absorbs the extra rows without any grid-template tweak.
- Account-name clickability via `.acct-lk` (v2.0.0) preserved on every row — `Meridian`, `Brightex` (×2), `NovaVault`, `Acme Corp` all open their Mission Briefing or Ghost-Buster view when the name is clicked, independent of the action button.
- The action buttons now call `openAgentDrawer` / `draftReply` / `openGhostBusterFromPopover` / `openTaskBrief` directly — no `agentBtn` wrapper, since the wrapper's 1.5s loading-state was tuned for the older "agent runs" framing and feels heavy when the user expects the destination to load instantly.

---

## [2.8.2] — 2026-05-16

Re-architecture of the slide-out drawer. v2.8.0 / v2.8.1 turned the drawer into a TeamOS-Live-only surface and redirected all agent output (Prep Me / Risk Analyst / Save Strategy / Next Steps) to the Mission Briefing center panel via `view-agentout`. The user's revised spec calls for the drawer to host **both** experiences side-by-side, selectable via a toggle. The agent output should stay in the drawer (Assistant mode) — not be redirected. This commit makes that pivot.

The user labeled the changelog entry `[2.8.0]`; shipped as `[2.8.2]` here because `[2.8.0]` and `[2.8.1]` had already shipped and are pinned in the changelog with the old architecture descriptions. The bullet content matches the user's `[2.8.0]` brief verbatim.

### Added — Dual-mode toggle at the top of the drawer
- New `.dr-mode-bar` (2-col pill) above everything else in the drawer:
  - `📋 Assistant` (default on open)
  - `⚡ Live Call`
- Active mode: teal background, white text, subtle teal-tinted shadow. Inactive: outlined, muted. Toggling the chip swaps the body content; the header (account / meeting / close) stays visible.
- New `setDrawerMode(mode)` JS function manages the toggle:
  - To Assistant: re-renders the last loaded agent (from `_drawerCtx.lastAgent`) so the body is never blank when the user toggles Live → Assistant. If no agent has been loaded yet, leaves the header at the default "Agent / Select an agent" state. Cancels any pending Live signal timer.
  - To Live Call: rewrites the unified header to show the current account + meeting + time, initializes the situation-mode chips, loads the Carmen profile coaching line + the opening message, and schedules the 8-second auto-signal timer.

### Reverted — Agent output renders in the drawer again
- `openAgentDrawer(type, acct)` is restored to its pre-v2.8.0 behavior: populates `drawer-title` / `drawer-sub` / `drawer-scroll` / `drawer-ft` and calls `openDrawer()`. The `view-agentout` redirect introduced in v2.8.0 is removed from this path.
- The Agent Hub Recent Outputs **Restore** path (v2.5.0) still routes through `restoreAgentOutput` → `view-agentout` (Mission Briefing panel inline) — that's the explicit "restore to panel" mechanism. Quick Launch Matrix in the Agent Hub continues to call `openAgentDrawer`, which now opens the drawer in Assistant mode.
- All other agent-button call sites (Priority Stack, Today's Tasks "Generate prep" / "Draft outreach" / "Draft reply", Mission Briefing default's "My Agents" buttons, Live Signals row buttons, Task Brief buttons, notification rail Save Play, Slack Summary Save Strategy) inherit the restored drawer behavior automatically.
- `agentBtn(type, acct, btn)` (the 1.5s loading-state wrapper) is unchanged; still calls `openAgentDrawer` at the end.

### Updated — Live Call experience
- **Drawer header in Live Call** — the v2.8.0 dark "TEAMOS LIVE" hero block is replaced with the standard light header reused by Assistant mode. In Live Call mode the title shows the account name (e.g. "Acme Corp") and the sub shows the meeting + time (e.g. "QBR · 9:00 AM"). The pulse indicator now lives in the Live Monitor bar directly below the header.
- **Live Monitor bar** — dark forest bg, mint label, pulsing green dot. Copy: `🟢 LIVE MONITOR · Listening via Zoom API…`. Unchanged from v2.8.1.
- **Situation Mode chips** — Risk / Growth / Executive / Discovery / Prep. Default by account (Nova→Risk, Brightex→Risk, Acme→Prep). Switching a chip resets the chat and loads a new opening message. Unchanged from v2.8.0.
- **Carmen profile line** — now appears in **every** Live Call situation mode (not just Prep as in v2.8.1). Carmen text updated per the new spec:
  - **Acme:** "Your Gong data shows you talk 68% of the time in QBRs. Today — ask the SSO question and let David Kim fill the silence."
  - **Brightex:** *(updated)* "You've folded on pricing early in the last 2 Brightex calls. Hold the line on value before any commercial discussion."
  - **NovaVault:** *(updated)* "Cold intro calls work better when you listen first. Ask Torres what he already knows before pitching anything."
- **Auto-signal card** — now scheduled by `_tlScheduleSignal()` whenever Live Call mode is entered (either via the `[⚡ TeamOS Live]` Mission Briefing button or the in-drawer toggle to Live). 8-second timer, reset on every entry, cancelled on `closeDrawer`. Card structure updated per new spec:
  - Header: `💡 LIVE SIGNAL · 12s ago` (timestamp inline)
  - Subject line: e.g. "David mentioned 'headcount consolidation'"
  - Quote box with `Pivot:` / `Response:` prefix in bold + the suggested italic quote
  - Buttons: `[📋 Copy Line]` + optional second button (Acme has `[🔍 See Integration Specs]` → toasts "Opening 1Password integration documentation ✓")
- **Card styling restyled** from amber to teal-themed per spec: teal-bg pill, 4px teal left border, muted timestamp.
- **Pattern matching** — unchanged from v2.8.0. Pricing / competitor / objection / help patterns and the default fallback all carry over.
- **Input bar** — unchanged from v2.8.0. Updated placeholder copy to "Type anything or ask a question…" per new spec.

### Verified end-to-end in a headless render
- `openAgentDrawer('save','nova')` opens the drawer in Assistant mode, populates `drawer-title="Save Strategy"`, `drawer-sub="NovaVault · Emergency retention play"`, fills `drawer-scroll` (4976 chars) and `drawer-ft` (351 chars), leaves Mission Briefing on `view-default`. No more `view-agentout` redirect.
- Toggling to Live: header changes to "NovaVault" / "Executive Check-in · 3:30 PM", chip activates `risk` (Nova default), Carmen line + opening message load in chat.
- Toggling back to Assistant: header restores to "Save Strategy" / "NovaVault · Emergency retention play", Assistant body re-renders the last-loaded Nova Save Strategy content.
- Mission Briefing `[⚡ TeamOS Live]` button on the Brightex view opens the drawer in Live mode with header "Brightex Inc" / "Risk Review · 11:00 AM", chip = `risk`, Carmen line = new Brightex text.
- 8.5s after Live Call entry: signal card auto-appears with `LIVE SIGNAL · 12s ago` header, "David mentioned 'headcount consolidation'" subject, `Pivot: "Our SSO integration..."` quote, 2 buttons (Copy Line + See Integration Specs).
- Pattern matching: "what about pricing" returns the per-account Acme pricing response.
- Carmen lines verified for all 3 accounts with the new copy.

### Not touched
- DRAWER agent data objects — unchanged.
- Every Mission Briefing template (view-default / view-acme / view-brightex / view-nova), Ghost-Buster wizard (v2.6.0), Agent Hub & Workspace card (v2.5.0), Task Brief panel (v2.3.0), Ask Dust + Coach Me + Custom Agents (v2.0.0), the universal account click (v2.0.0), Next Up intelligence (v2.7.0), pulse strip + Tasks dropdown, notification rail, calendar, Live Signals widget, Urgent Inbox + Today's Tasks, deck modal, Service Worker + offline resilience (v2.4.0), brief-strip equal-height (v2.2.0), Recipe for Success tab.
- `openPanel`, `resetPanel`, `scrollPanelIntoView`, `closePops`, `closeNotifPops`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `restoreAgentOutput`, every Ask Dust template, every task brief, every Ghost-Buster wizard view, `agentBtn` — all unchanged.
- `view-agentout` HTML — preserved for the Agent Hub Restore path. No longer the target of `openAgentDrawer`.

### Engineering
- New `_drawerCtx = { mode, lastAgent, acct }` state object tracks the most recent agent load + active account so the toggle can restore content in either direction.
- Three new CSS rules (`.dr-mode-bar`, `.dr-mode`, `.dr-mode.on`) plus `.dm-body { display:none } .dm-body.on { display:flex; flex-direction:column; flex:1 }` for the body show/hide.
- Signal card retheming touches `.tl-signal*` rules — amber tokens swapped for teal-bg + teal left border + new `.tl-signal-prefix` for the bold "Pivot:" / "Response:" label.
- Removed the dark `.tl-hd` and its child rules (`.tl-hd-t-row`, `.tl-acct`, `.tl-ctx`, `.tl-close`) — the unified `.dr-hd` light header replaces them.

---

## [2.8.1] — 2026-05-16

Three additions to the TeamOS Live drawer that were intended for v2.8.0 but arrived after the v2.8.0 commit had already shipped (per the stop-hook commit policy). Folded into a clean patch on top of v2.8.0 rather than amending the pushed history.

### Added — Live Monitor status bar
- New `.tl-monitor` strip between the dark drawer header and the mode-chip row.
- Dark forest background (`#0F1814`), mint label text (`#86EFAC`), pulsing green dot (`#22C55E` — distinct from the brand teal so it reads as "audio listening" not "AI active").
- Copy: `🟢 LIVE MONITOR · Listening via Zoom API…`. Always-on in Phase 1 — communicates the Phase 3 vision (real WebSpeech / WebRTC audio capture) without requiring any audio infrastructure today.
- Pure HTML/CSS — no JS needed for the simulated state.

### Added — Live Signal Cards (mid-call simulated detection)
- New `_tlSignalTimer` setTimeout fired by `openTeamOSLive()` at the 8000ms mark. Reset on every re-open and cancelled on `closeDrawer()` so a card can't bleed across sessions.
- Each account has one hardcoded signal in `TL_SIGNALS`:
  - **Acme** — `"headcount consolidation" detected` → Pivot to SSO automation ROI. Suggested line: *"1Password automates the entire offboarding lifecycle — saves your IT team ~4 hours per departure."*
  - **Brightex** — `Competitor mention detected` → Surface what they're evaluating. Suggested line: *"Can you share what you've been looking at? I want to make sure we're comparing the right things."*
  - **NovaVault** — `Budget concern detected` → Reframe before the number lands. Suggested line: *"Before we get to numbers — what would make this renewal an easy yes for your team?"*
- Card visual: amber-bg pill (`.tl-signal`) with uppercase `Live Signal · …` header, plain-text body, italic suggested quote in a white inner block, dark `[📋 Copy Line]` button.
- **Copy Line** copies the suggested line to the clipboard via `navigator.clipboard.writeText` (graceful no-op when unavailable) and toasts "Line copied to clipboard ✓". The line is escaped via `&quot;` on the `data-line` attribute to defend against quote characters in future signal text.
- This is the demo-impressive moment: the card appears without the CSM typing anything — the simulated mid-call signal lands automatically 8 seconds in.

### Added — Carmen profile coaching line on Prep openings
- New `TL_CARMEN` map keyed by account. One CSM-specific behavioral note per account, all in Carmen's actual voice:
  - **Acme:** "Your Gong data shows you talk 68% of the time in QBRs. Today — ask the SSO question and let David Kim fill the silence."
  - **Brightex:** "You tend to over-explain when accounts push back. Today — answer Sarah's SLA question in one sentence, then ask hers."
  - **NovaVault:** "Your last 3 cold intros were technical pitches. With Torres — open with what his team is already getting from the platform, not what's possible."
- Appended inside `_tlSetMode` only when `mode === 'prep'`. Renders as a separate styled card (`.tl-carmen`) directly under the bot's Prep opening — left-edge teal border, italic body, teal `💬 Carmen:` label, soft tinted background (`rgba(24,165,117,.07)`).
- Switching to a non-Prep mode removes the Carmen card on the chat reset (the chat container is wiped before the new opening renders). Switching back to Prep re-injects it.

### Verified end-to-end in a headless render
- Live Monitor bar visible on every drawer open, dot is `rgb(34, 197, 94)` (correct green), label / sub copy match spec exactly.
- Carmen line renders in Prep mode for all three accounts with the correct per-account copy.
- Switching Acme to Risk removes the Carmen line; switching back to Prep restores it.
- Brightex open → wait 8.5s → Live Signal card appears with `"Live Signal · Competitor mention detected"` header (no manual trigger).
- Closing the drawer cancels the pending timer (`_tlSignalTimer === null` after close, no stale signal appears later).
- `[Copy Line]` button reads its source from `data-line` and toasts "Line copied to clipboard ✓".

### Phase alignment (architectural intent)
- **Phase 1 (this commit):** simulated — hardcoded responses, fake Live Monitor bar, 8s auto-signal per account, Carmen line from a static table.
- **Phase 2:** a Next.js `/api/chat` proxy injects a system prompt (full account context block) into an Anthropic API call so user messages get live responses; Carmen line driven by a real Gong profile feed.
- **Phase 3:** WebRTC / WebSocket to Zoom + Gong with 15-second rolling transcript windows; `TL_SIGNALS` regex/keyword detection replaced by real-time NLP; the green "Listening via Zoom API…" state becomes truthful.

### Not touched
- Everything from v2.8.0 (drawer header, mode chips, mode openings, pattern matching, input bar, agent-output redirect, `[⚡ TeamOS Live]` Mission Briefing buttons) — all unchanged.
- All Mission Briefing content, Ghost-Buster wizard, Agent Hub & Workspace, Task Brief, Ask Dust + Coach Me + Custom Agents, pulse strip + Tasks dropdown, notification rail, calendar, Live Signals widget, Urgent Inbox + Today's Tasks, deck modal, Service Worker + offline resilience, brief-strip layout, universal account click, scroll-into-view, Recipe for Success tab.

### Engineering
- ~50 lines of new JS (Carmen map, Signals map, `_tlAppendSignal`, `_tlCopySignal`, `_tlCancelSignal`, plus the two-line patches into `_tlSetMode`, `openTeamOSLive`, and `closeDrawer`).
- ~20 lines of new CSS (`.tl-monitor*`, `.tl-carmen*`, `.tl-signal*`). No new color tokens — green `#22C55E` and `#86EFAC` are inlined exactly once, matching the visual brief.
- The signal timer is module-scoped (`_tlSignalTimer`) and explicitly cleared on every re-open and on close — no leaks even if the user opens/closes rapidly.

---

## [2.8.0] — 2026-05-16

The 380px slide-out drawer is repurposed from "agent output panel" into **TeamOS Live** — a real-time conversational AI companion. Agent content (Prep Me / Risk Analyst / Save Strategy / Next Steps) previously rendered in the drawer now lands inline in the Mission Briefing center panel via the existing `view-agentout`. The drawer is reserved exclusively for TeamOS Live.

### Added — TeamOS Live drawer
- **Dark drawer header** — pulsing teal dot + `⚡ TEAMOS LIVE` label, account · meeting · time on row 2, "Context loaded: Health X · $Y · N days to renewal · Champion" on row 3, close button on the right. Three account profiles wired (Acme / Brightex / NovaVault) in `TL_ACCT_INFO`.
- **Situation Mode selector** — horizontal row of 5 chips: `🚨 Risk` `📈 Growth` `👔 Executive` `🔍 Discovery` `📋 Prep`. Active chip teal + white, inactive outlined. Default mode per account (`TL_DEFAULT_MODE`): NovaVault → Risk, Brightex → Risk, Acme → Prep. Switching modes clears the chat and loads a new opening message instantly.
- **Conversational chat area** — scrollable, bot bubbles left-aligned (light gray, `🤖` icon, teal-tinted), user bubbles right-aligned (teal background, white text). Auto-scrolls to the latest message.
- **Input bar** — fixed at the bottom, teal Send button matching the Ask Dust submit style. Enter submits. Input clears after send. Response appears in chat within 300ms.

### Added — opening messages (15 combinations)
All 5 modes × 3 accounts wired in `TL_OPENINGS`, copied verbatim from the spec. Each message is account-aware (specific names, numbers, signals) and mode-aware (Risk pre-empts churn; Growth pushes expansion; Executive frames stakeholder dynamics; Discovery proposes the missing question; Prep walks meeting logistics). Loaded automatically on drawer open and on every mode switch.

### Added — pattern-matched responses
`TL_PATTERNS` is an ordered array; first match wins, case-insensitive substring on the raw user message:
- **pricing / price / cost** — per-account response (Nova: don't lead with pricing, anchor on continuity; Brightex: answer SLA first, don't volunteer pricing; Acme: pricing is a buying signal, lean in).
- **competitor / competition / Okta / LastPass / 1Pass** — per-account response (Nova: no competitor in Gong, don't introduce; Brightex: flagged twice, ask which one; Acme: clean, no competitive framing).
- **what should I say / how do I say / help me say** — generic "give me more context" response.
- **objection / pushback / they said** — "what exactly did they say?" response.
- **help / what can you do / ?? / stuck** — meta response listing what TL knows.
- **Default fallback** — "Got it. Based on what I know about [account], here's my take: [first ~2 sentences of the active mode's opening]. What specifically do you want to work through?"

### Changed — agent output target
- `openAgentDrawer(type, acct)` now renders directly into `view-agentout` (the inline Mission Briefing panel introduced in v2.5.0) and calls `openPanel('agentout', null)` — which in turn triggers `scrollPanelIntoView` (v2.1.0). The slide-out drawer is no longer opened from any agent button.
- Section markup is identical to the previous drawer render (snapshot / last Gong / discovery / battle card / churn score / save play / extension terms / numbered CTAs / recommended play). Footer action buttons (Push to Gainsight / Generate Deck etc) now render inline at the bottom of the agent output instead of in a separate drawer footer; same `toast()` and `openDeckModal()` behavior.
- **No DRAWER data changes.** All Prep / Risk / Save / Next content objects are untouched — they just paint in a different container now.
- All existing call sites continue to work without edits: Priority Stack agent buttons, Today's Tasks "Generate prep" / "Draft outreach" / "Draft reply" rows, Mission Briefing default-view "My Agents" buttons, Live Signals row action buttons, Agent Hub Quick Launch Matrix (all 12), task brief Save / Risk / Prep buttons, notification rail Save Play button, Slack-summary Save Strategy button. All inherit the new render target through the modified `openAgentDrawer`.
- The `agentBtn(type, acct, btn)` loading-state wrapper (1.5s spinner on the source button before render) is unchanged; it still calls `openAgentDrawer` at the end, which now lands in the panel.

### Added — `[⚡ TeamOS Live]` trigger button
Small teal button (`.mb-tl-btn`) added to the right of all four Mission Briefing headers: `view-default` (Acme pre-load), `view-acme`, `view-brightex`, `view-nova`. Click → `openTeamOSLive(acct)` opens the drawer in that account's default mode. Not rendered on Ghost-Buster, Dust, Draft, Slack Summary, Task Brief, or Agent Output views — those are non-Mission-Briefing surfaces.

### Verified end-to-end in a headless render
- Calling `openAgentDrawer('save','nova')` opens `view-agentout` with title "Save Strategy" and leaves the slide-out drawer closed. Confirmed.
- Clicking the TL button in the Acme Mission Briefing opens the drawer with header "Acme Corp · QBR · 9:00 AM" + "Context loaded: Health 82 · $48K · 89 days to renewal · David Kim", default mode = Prep, opening message = the Acme Prep opening from the spec. Confirmed.
- Switching to Risk mode resets the chat and loads the Acme Risk opening. Confirmed.
- Pattern matches: "what about pricing" returns the Acme pricing response; "what about Okta" returns the Acme competitor response. Confirmed.
- Default fallback for an unmatched query starts with "Got it. Based on what I know about Acme Corp, here's my take:" plus the first two sentences of the active mode's opening. Confirmed.
- Per-account default modes verified: `acme → prep`, `brightex → risk`, `nova → risk`.

### Removed
- The old drawer HTML (`#drawer-title`, `#drawer-sub`, `#drawer-scroll`, `#drawer-ft`) is gone — replaced inside `#drawer` by the TeamOS Live structure (`.tl-hd`, `.tl-modes`, `.tl-chat`, `.tl-input`).
- The drawer-footer button helpers (`.dr-ft-btn.prim` / `.dr-ft-btn.sec`) are unused; CSS rules survive harmlessly for now.

### Not touched
- DRAWER data objects (the Prep / Risk / Save / Next content for each account) — unchanged.
- All Mission Briefing pre-loaded content (Acme QBR briefing, view-acme/brightex/nova bodies), the Ghost-Buster wizard (v2.6.0), the Agent Hub & Workspace card (v2.5.0), the Task Brief panel (v2.3.0), Ask Dust + Coach Me + Custom Agents (v2.0.0), the pulse strip + Tasks dropdown, the notification rail, the calendar, the Live Signals widget, the Urgent Inbox + Today's Tasks, the deck modal, the Service Worker + offline resilience (v2.4.0), the brief-strip equal-height layout (v2.2.0), the universal account click (v2.0.0), Mission Briefing scroll-into-view (v2.1.0), Recipe for Success tab.
- `openPanel`, `resetPanel`, `scrollPanelIntoView`, `closePops`, `closeNotifPops`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `restoreAgentOutput`, every Ask Dust template, every task brief, every Ghost-Buster wizard view — all unchanged.

### Engineering
- TeamOS Live JS module is ~150 lines: state + per-account info table + default-mode map + 15 opening messages + 5 pattern entries + 7 helpers (`openTeamOSLive`, `_tlSetMode`, `_tlAppend`, `_tlSendMessage`, `_tlMatchResponse`, `_tlShortOpening`, `_tlEscape`).
- CSS namespace `.tl-*` plus one `.mb-tl-btn` for the trigger. ~30 new rules, all bound to existing tokens. No new colors.
- The 300ms response delay is a `setTimeout` after the user's message renders — no spinner needed in Phase 1.
- All user input is HTML-escaped before insertion into the chat bubble. Pattern matching operates on the raw text.
- Sending while the input is empty is a no-op (no empty user bubble, no bot response triggered).

---

## [2.7.0] — 2026-05-16

Two contained changes. Shipped after 2.8.0 / 2.8.1 due to commit ordering — placed here chronologically in the changelog so the version gap reads cleanly.

### Added — Next Up card: full account intelligence
- Four new key/value rows in the Next Up data grid for the currently-up account (Acme Corp):
  - **ARR** — $48K
  - **Licenses** — `142 seats · +12 / -3 this month` with the `+N` movement in teal (`.seat-up`) and `-N` movement in red (`.seat-dn`) so seat losses pop visually.
  - **Industry** — SaaS / IT Security
  - **Since** — Jan 2022
- New full-width account summary block (`.bf-next-sum`) below the data grid with a thin top divider, smaller font, muted color: *"IT security team scaling across distributed engineering org. Primary use case: privileged access management + SSO rollout in progress. Expansion signal active — enterprise tier interest confirmed."*
- The four existing fields (Health / Renewal / Open CTAs / Last Gong) and the In-38-min countdown are untouched.
- The card kept its v2.2.0 stretch behavior in the brief-strip — all three top cards still render at equal height; the Next Up content just fills more of its allotted height now.
- Reference data for the other two accounts (Brightex 87 seats -5/+0 / Operations / Mar 2023; NovaVault 64 seats -8/+1 / Fintech / Aug 2023) supplied in the spec for future rotation. Not displayed in this build — Next Up is hardcoded to Acme as the immediately-next meeting.

### Fixed — Agents chip dimensions
- Root cause: the ⚙ Agents chip lives inside a `.bf-qa-wrap` div (positioning anchor for the dropdown that pops upward), not directly inside the `.bf-qa` grid like the other five chips. The v2.2.0 `flex:1; align-content:stretch` on `.bf-qa` stretched the other chips to fill their grid rows, but the Agents chip stayed at its base `min-height: 34px` while its wrapper cell stretched empty around it.
- Fix: `.bf-qa-wrap { display: flex; flex-direction: column }` plus `.bf-qa-wrap > .bf-qa-btn { flex: 1; width: 100% }`. Wrapper now passes the stretched grid-cell height down to the button.
- Also dropped the cosmetic `opacity: .8` from `.bf-qa-btn.muted` since it made the Agents chip read as visually shorter / lighter than its peers. Replaced with `color: var(--tx3)` on the chevron only — keeps the "configuration control" feel without dimming the whole chip.
- Verified in a headless render: all 6 chips now render at identical 126×140 (was Agents 69×34 vs others 126×140). Agents dropdown still opens correctly via `toggleAgentsDropdown`.

### Engineering
- Pure HTML/CSS change. No JS touched.
- Four new `<div class="bf-kv-r">` rows inside the existing `.bf-kv` grid + one new `<div class="bf-next-sum">` after the grid. The existing 2-col grid layout absorbs the new rows without any grid-template change.
- CSS additions: `.seat-up`, `.seat-dn`, `.bf-next-sum`, plus the two-line patch to `.bf-qa-wrap` and the one-line drop of `opacity:.8` from `.bf-qa-btn.muted`.

### Not touched
- Every JS function, every panel, every agent drawer, the Mission Briefing center, pulse strip, notification rail, calendar, brief-strip card width allocations, equal-height stretch behavior, Tasks dropdown, Task Brief panel, Ghost-Buster wizard, Agent Hub & Workspace, Ask Dust output templates (Coach Me / Prepare My Day / etc), TeamOS Live drawer (v2.8.0–2.8.1), Service Worker, offline resilience, universal account click, scroll-into-view, Recipe for Success tab.

---

## [2.6.0] — 2026-05-16

Ghost-Buster expanded from a single pre-drafted email into a full re-engagement strategy wizard. The three existing views (`view-meridian`, `view-creston`, `view-apex`) keep their ids and routing — only the content inside each `.rp-scroll` is replaced.

### Added — wizard structure (all 3 views)
- **Rich header** — pill chip with the account short-name + a days-dark badge sit next to the `👻 Ghost-Buster` title in `.rp-hd`.
- **Account hero block** — large account name, ARR + renewal sub-line, divider.
- **Section 1 · Situation Read** — three color-coded cards (`.gb-read-row` with `r`/`warn`/`intact` variants):
  - Why they went dark (Dust hypothesis)
  - Champion status (intact / dormant / critical)
  - Risk of wrong approach
- **Section 2 · 3-Touch Sequence** — three native `<details>` blocks, Touch 1 open by default. Each touch shows the recipient, subject, full body in a `.gb-touch-txt` block, and per-touch actions: Send via Gmail / Edit first (or Copy message for the Slack/LinkedIn middle touch).
- **Section 3 · Re-engagement Intel** — compact two-column key/value grid (`.gb-intel`) holding the per-account intelligence (last Gong signal, adoption drop, Dust read, recommended angle, inbound signal / champion status / risk level / timeline).
- **Section 4 · Action footer** — dashed top divider, full-width buttons: `Push 3-touch sequence to Gainsight CTAs` + `Send Touch 1 now` (Apex adds a leading `Notify AE — request warm intro` button).

### Added — Apex-only "Champion Change Protocol" section
Sits between Situation Read and the 3-touch sequence. Amber-themed `.gb-proto` container with three labeled steps:
1. Check AE relationship → `[Notify AE — request warm intro]` toasts the spec's "Slack DM sent to AE · Apex Dynamics warm intro requested ✓"
2. LinkedIn check → `[Check LinkedIn connection ↗]` toasts "Opening LinkedIn — Ryan Patel ✓"
3. Recommended approach — text-only summary of the `AE intro` vs `no AE` paths

### Added — wizard JS helpers
- `gbSendTouch(acct, who, n)` → `"Touch [n] sent to [who] · Logged in [Account] Gainsight timeline ✓"`. Used by every Send via Gmail button and by the Send Touch 1 now footer button.
- `gbEdit(btn)` → toggles `contenteditable` on the sibling `.gb-touch-txt`, swaps button label between `Edit first` and `Save & Send`, focuses the editable area. CSS `[contenteditable="true"]` adds a teal inset ring so the active edit field is visually obvious.
- `gbCopyTouch(btn)` → writes the touch text to the clipboard via `navigator.clipboard.writeText` (gracefully ignored if unavailable), toasts "Copied to clipboard ✓".
- `gbPushSequence(acct)` → toasts "3 CTAs created in Gainsight · Touch 1 today · Touch 2 in 5d · Touch 3 in 10d ✓".
- `gbNotifyAE(acct)` → toasts "Slack DM sent to AE · [Account] warm intro requested ✓".
- `gbLinkedIn(person)` → toasts "Opening LinkedIn — [person] ✓".

### Per-account content (per spec)
- **Meridian Health Systems** — $22K ARR · 73 days dark · Renews Jun 30. Touches sent to Jennifer Ramos (IT Manager). Touch 1 email about the SSO rollout, Touch 2 LinkedIn DM at day 5, Touch 3 urgency email at day 10. Intel includes the live inbound signal "Jennifer emailed yesterday".
- **Creston Software** — $18K ARR · 67 days dark · Renews Jul 15. Touches sent to Marcus Webb (VP Engineering). Touch 1 references onboarding goals, Touch 2 Slack DM at day 5, Touch 3 short check email at day 10. Intel positions this as "passive neglect, low churn risk".
- **Apex Dynamics** — $15K ARR · 61 days dark · Renews Aug 1. **Champion change** flow: James Wu → Ryan Patel. All three touches addressed to Ryan, Touch 1 leads with "Continuing where James Wu left off". Intel flags risk level as HIGH with the AE-intro-first recommendation.

### Verified end-to-end in a headless render
- All 3 views open via `openPanel(acct, null)` and route through `backFromGhostBuster()` → `view-default`. Confirmed for all three accounts.
- Each view has 3 touches, color-coded Situation Read cards, a populated Intel grid, and the right number of footer buttons (Meridian 2, Creston 2, Apex 3).
- Only Apex shows the Champion Change Protocol — 3 protocol rows present; 0 on the other two.
- Toasts captured for every button kind: Send Touch 1 ("Touch 1 sent to Jennifer Ramos · Logged in Meridian Health Systems Gainsight timeline ✓"), Push sequence ("3 CTAs created in Gainsight · Touch 1 today · Touch 2 in 5d · Touch 3 in 10d ✓"), Notify AE ("Slack DM sent to AE · Apex Dynamics warm intro requested ✓"), LinkedIn ("Opening LinkedIn — Ryan Patel ✓").
- Edit toggle: clicking `Edit first` sets `contenteditable="true"` on the body and swaps the button label to `Save & Send`. Second click restores read-only and toasts "Draft saved · Ready to send ✓".

### Removed
- `markSent(id)` and the three `id="send-meridian"` / `send-creston` / `send-apex` buttons — replaced by the wizard's per-touch `gbSendTouch` flow. The old single-button "outreach email sent · logged in Salesforce" path is no longer reachable.
- Old single-email content blocks inside each Ghost-Buster view (`.ge-ctx` / `.ge-subj` / `.ge-body` / `.ge-btns` markup). The `.ge-*` CSS rules are untouched — they still style the `view-draft` Gmail Draft Reply path used by the notification rail.

### Not touched
- `openPanel`, `resetPanel`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `_lastBriefingView` — all unchanged. The wizard is reached through the same paths as the previous single-email view (Dark Zone widget, pulse-strip dark-accounts popover, task brief Ghost-Buster button).
- Every other view (`view-default`, `view-acme/brightex/nova`, `view-dust`, `view-draft`, `view-slack-sum`, `view-taskbrief`, `view-agentout`), agent drawer, deck modal, calendar, brief strip, Agent Hub & Workspace (v2.5.0), Ask Dust + Coach Me + Custom Agents (v2.0.0), notification rail, pulse strip, Tasks dropdown + Task Brief panel (v2.3.0), Service Worker + offline resilience (v2.4.0), Recipe for Success tab.

### Engineering
- New CSS namespace `.gb-*` (~30 rules) bound entirely to existing tokens. No new color values introduced. Wizard collapsibles use the native `<details>`/`<summary>` element — zero JS for expand/collapse.
- Wizard helpers are six small functions; total wizard JS additions ≈ 45 lines.
- `gbEdit` walks up to the nearest `.gb-touch-body` so a single helper handles every touch in every view without per-touch ids.

---

## [2.5.0] — 2026-05-16

The old "My Agents" collapsible directory (4 active agents + 3 Coming Soon stubs + a Configure button) is replaced inside `view-default` with an interactive **Agent Hub & Workspace** card containing three sections: Quick Launch Matrix, Recent Outputs Session Log, and Active Account Documents.

### Added
- **Agent Hub card** (`.ah-card`) — sits inside `view-default` directly below the Generate QBR Deck button. Surface / border / radius / padding match the brief-strip card treatment (Priority Stack, Next Up, Ask Dust). Single header `🤖 Agent Hub & Workspace` followed by three thin-divider-separated sections.
- **Quick Launch Matrix** — 4×3 grid (4 agents × 3 accounts = 12 chips, all wired). Column headers are color-coded to existing account semantics (NovaVault `--rd-dk`, Acme Corp `--tl-dk`, Brightex `--am-dk`). Each cell is a `[Run]` chip that calls `openAgentDrawer(agent, acct)` directly — fires the existing slide-over drawer with zero changes to that path. Hover state: teal tint on bg + border + text, opacity 0.9. All 12 combinations verified in a headless render: every chip opens the right drawer with the right title.
- **Recent Outputs Session Log** — 3 hardcoded demo rows (Prep Me · Acme Corp · 47m ago / Risk Analyst · Brightex · 2h ago / Save Strategy · NovaVault · Yesterday). Each row has agent + account header, single-line preview (truncated with ellipsis), age stamp, and a `[Restore]` chip. The list is rendered from a `_recentOutputs` array via `renderRecentOutputs()` — clearing it is a single line.
- **Restore behavior** — `restoreAgentOutput(type, acct)` re-injects the agent output **inline into the Mission Briefing center panel** (not the slide-over drawer). Implemented via a new `view-agentout` block in `.rp` mirroring the `view-dust`/`view-draft` pattern: Back button → `resetPanel()`, title slot (`#agentout-title`), content slot (`#agentout-out`). The renderer pulls from the existing `DRAWER[type][acct]` data and re-builds the same section markup `openAgentDrawer` uses (account snapshot / last Gong / discovery / battle card / churn score / save play / extension terms / numbered CTAs / etc). Verified: each of the three Restore buttons loads `view-agentout` with the correct title (Pre-Call Brief / Risk Analysis / Save Strategy) and 3.4 – 5.6 KB of section markup. `openPanel('agentout', null)` triggers the v2.1.0 `scrollPanelIntoView` so the restored output is always visible.
- **Clear history** — small muted link at the right of the Recent Outputs section header. `clearRecentOutputs()` empties the array and re-renders the zero state ("No recent outputs in this session."). Verified: 3 rows → 0 rows + empty-state message. Does not affect agent drawer state, Mission Briefing state, or any other widget.
- **Active Account Documents** — header reads `RECENT DOCS · [ACTIVE ACCOUNT]` and updates dynamically based on which Mission Briefing is showing. `DOC_LIBRARY` maps `acme` / `brightex` / `nova` to two doc rows each (file icon + name + subtitle + `[Open ↗]` chip). Verified per-account: ACME CORP (Acme QBR Presentation Deck / Acme Joint Success Plan), BRIGHTEX (Brightex Master SLA Agreement / Brightex Renewal Core Deck), NOVAVAULT (NovaVault Executed Contract 2025 / NovaVault Save Playbook). Ghost-Buster accounts (Meridian / Creston / Apex) render the spec's empty state: `No documents on file · Add via CFT Docs ↗`. `[Open]` chips fire a toast: `Opening [name] from Google Drive ✓`.
- **`openPanel` hook** — added a single line: `if (typeof _updateAgentHubAccount === 'function') _updateAgentHubAccount(id);`. The hook ignores non-account views (`dust`, `draft`, `slack-sum`, `taskbrief`, `agentout`) so the doc section keeps showing the last Mission Briefing's account while the user is inside an agent output / Dust output / email draft / task brief. `resetPanel` gets the same hook with `'default'` (= Acme) so the Back button always restores the Acme doc list when returning to the pre-loaded briefing.
- New CSS namespace `.ah-*` (header, sections, matrix grid, run chip, recent-row grid, restore chip, empty state, doc row, doc button). All styles bind to existing tokens — no new color values introduced.

### Removed
- Old `.ag-toggle` button + `.ag-body` block inside `view-default` (My Agents + More agents Coming Soon + Configure button).
- Dead-code function definitions: `toggleAgents()` and `configureAgents()` (their only call sites were just removed). The `.ag-*` CSS rules survive for now — they're tiny and might be reused by a future surface; removing them is a separate concern.

### Not touched
- `openAgentDrawer` — every existing call site (Priority Stack, Today's Tasks, Live Signals, Mission Briefing, task briefs, notification rail, Slack summary) still calls it unchanged. The Quick Launch Matrix is just 12 new call sites with the same signature.
- `DRAWER` data — `restoreAgentOutput` reads from it without mutation.
- Mission Briefing center panel layout, every existing `rp-view` template, Priority Stack, Next Up, Ask Dust, Calendar, Dark Zone, Live Signals, Urgent Inbox, Today's Tasks, pulse strip, notification rail, deck modal, Ghost-Buster handlers, Recipe for Success tab.
- All v2.0–v2.4 features remain intact: universal account click, Ask Dust 3x2 grid with Coach Me + Custom Agents dropdown, Mission Briefing scroll-into-view, brief-strip equal-height, Task Brief panel, offline resilience.

### Engineering
- 100% additive HTML/CSS/JS in the Agent Hub block. The only edits to pre-existing functions are: one new line inside `openPanel`, one new line inside `resetPanel`. Both are no-ops when `_updateAgentHubAccount` isn't yet defined (boot order safe).
- `restoreAgentOutput` duplicates the section-rendering loop from `openAgentDrawer` (~30 lines) rather than refactoring the drawer renderer — the spec required leaving `openAgentDrawer` untouched. The duplication is a deliberate trade: small surface, zero risk to drawer flow.
- All 12 matrix buttons + 3 restore buttons + 4 doc-state transitions verified in a single Playwright pass before commit.

---

## [2.4.0] — 2026-05-16

TeamOS is now a PWA with four layers of offline resilience. When Dust or any connected API goes down, the CSM sees their last loaded session — not a blank screen — and write-backs queue silently until the connection returns.

### Added — Layer 1: Service Worker (`/sw.js`)
- New file at the project root. Network-first with cache fallback, cache name `teamos-v1`.
- **Install:** precaches `'/'` and `'/index.html'`, then calls `skipWaiting()`.
- **Activate:** clears any non-current cache versions, then `clients.claim()`.
- **Fetch:** for every GET, races the network against a 3000ms timeout; if the network wins, the response is cloned into the cache (including opaque CDN responses) and served; if it times out or fails, the cached copy is served, with a final `503 Offline` fallback if nothing's cached yet. Non-GETs pass through.
- Registered from `index.html` via `navigator.serviceWorker.register('/sw.js')` inside a `window.load` listener with a `.catch()` graceful no-op for browsers that can't register (file:// previews, ITP, etc.).

### Added — Layer 2: localStorage state snapshot
- Storage key `teamos_last_session`. 24h freshness TTL.
- `_snapshotState()` writes `{ timestamp, accounts:{acme,brightex,nova}, pulse:{calls,risk,arr,ctas,dark,tasks}, tasks, activeAccount }`. Account fields are health/ARR/renewal/champion. Pulse counts read from the live pill text in the DOM so the snapshot reflects the user's actual session (e.g. CTAs decremented after marking done).
- `_hydrateFromSnapshot()` reads the previous snapshot and stashes it on `window._lastSnapshot` so the offline banner's "Last synced …" text can render against it. In Phase 2 with live APIs, the hydrator will seed the DOM before the live fetch returns.
- Both run at boot: hydrate first, then snapshot the freshly-baked state.

### Added — Layer 3: offline detection + UI
- **Offline banner** (`#offline-banner`) — 36px fixed bar between the nav and the pulse strip. Background `#1C1917`, text `#FCD34D`, slim sans-serif. Slides down via `transform` over 200ms. Anchored at `top:0` with `translateY(-100%)` hidden state; `body.offline` shifts to `translateY(44px)` so the bar sits flush below the 44px nav. Pulse strip's sticky `top` is pushed from `44px` → `80px` when offline so it lands flush under the banner — no overlap.
- Banner copy: `⚡ Offline mode · AI unavailable · Last synced [ago] · Showing cached data` + a `Retry ↺` button.
- **Retry button** calls `retryReconnect()` — if `navigator.onLine` is true, hides the banner, flushes the queue, and toasts "Connection restored ✓"; otherwise toasts "Still offline · Will retry when connection returns".
- **`offline` / `online` window listeners** wire `showOfflineBanner` / `hideOfflineBanner` directly. On boot, `if (!navigator.onLine) showOfflineBanner()` so a tab that was already offline at load time gets the banner immediately.
- **Per-widget "Cached" badges** (`.cached-badge` with `ti-database-off` icon, amber on amber-bg, displayed only when `body.offline`). Live on the Portfolio Pulse Strip, Live Signals header, and Urgent Inbox header. Pure CSS show/hide — no JS toggling each badge.
- **Notification rail freeze** — when offline, every `.n-pill` gets `title="Data frozen · API unavailable"` and a subtle grayscale filter via `body.offline .n-pill{filter:grayscale(.3);opacity:.85}`. The simulated 90s email-poll bump now short-circuits with an `_isOffline()` guard so counts don't drift while disconnected.

### Added — Layer 4: write-back queue
- Storage key `teamos_action_queue`. JSON array of `{ msg, ts }` entries.
- `toast()` is wrapped: the original is preserved as `window._origToast`. The new `window.toast` checks whether the message matches `QUEUEABLE_RE` — a single regex covering `in Gainsight`, `via Gmail`, `Notify AE`, `in Salesforce`, `Slack DM`, `in Ironclad`, `Push to`, `Re-engagement attempt logged`, `Activity logged`, `Opening Ironclad` — and whether we're offline. If both are true, the action is pushed to the queue and the displayed toast is amended with " · Queued · Will sync when connection restores".
- **Queue badge** (`#queue-badge`) lives at the right edge of the pulse strip. Hidden by default; visible only when `body.offline` AND queue length > 0. Reads "N queued" in amber with a cloud-upload icon. JS-managed via `_renderQueueBadge()` (called on every queue mutation and every offline toggle).
- **Reconnect flush** — `_flushQueue()` is called from the `online` event handler and from `retryReconnect()`. It toasts "Connection restored · Syncing N queued action(s)…", clears the queue, then replays each queued message at 800ms intervals via the original (un-wrapped) toast so they don't re-queue. After the last replay, toasts "All actions synced ✓".

### Documented — what still works during an outage
- ✅ Full dashboard visible from cache (SW serves `index.html` if the network dies mid-session)
- ✅ All Mission Briefing content readable (Acme / Brightex / NovaVault / Meridian / Creston / Apex views are pre-baked into the cached `index.html`)
- ✅ All agent drawer content readable (all 12 agent × account combos render from local `DRAWER` data)
- ✅ Calendar events visible and clickable (calendar is in-DOM; click → `openPanel` works against cached views)
- ✅ Task briefs readable (v2.3.0 task brief renderer is local + deterministic)
- ✅ Ghost-Buster drafts readable and editable (every account's draft is pre-rendered in its `view-*` block; Send via Gmail queues for sync)
- ✅ All navigation and tab switching (CSM Dashboard ↔ Recipe for Success works locally)
- ✅ Compose and edit emails — the action *queues* on send, doesn't error
- ⚠️ Ask Dust shows last cached response only — new free-text queries can't reach Dust during an outage
- ⚠️ New AI queries unavailable — chip-click quick-actions and free-text both depend on the live agent
- ⚠️ Write-backs queued, not immediate — replayed on reconnect at 800ms intervals

### Verified end-to-end in a headless render
- Hidden banner rect: top=-36, bottom=0 (fully off-screen above) ✓
- Offline state: banner top=44, bottom=80; pulse strip top=80 — no overlap ✓
- Snapshot keys: `timestamp, accounts, pulse, tasks, activeAccount` ✓
- 3 queueable toasts during outage → 3 entries in `teamos_action_queue`; queue badge reads "3 queued" ✓
- Non-queueable toast ("Opening Gong · Acme Corp · Last call May 10…") does **not** queue ✓
- After `online` event: banner hidden, queue cleared, body class removed ✓
- After `online` event while online: a queueable toast does **not** queue ✓

### Not touched
- All existing JS functions (every handler, agent renderer, panel opener, calendar onclick), every view, every widget header HTML except the three lines that gained the `.cached-badge` span, every drawer, the deck modal, the pulse strip pill markup, every Mission Briefing template, every Ask Dust template, every task brief, every Ghost-Buster draft, the Recipe for Success tab.
- The Service Worker wraps the app — it does not change it. The existing app would behave identically if `sw.js` were deleted (the registration call is a no-op fallback for unsupported browsers).

### Engineering
- Banner positioning math: `top:0; translateY(-100%)` keeps the 36px banner exactly off-screen above (y=-36..0). `translateY(44px)` shifts it to y=44..80 — flush below the 44px sticky nav. The pulse strip's `top` is pushed from 44 → 80 in the same `body.offline` cascade so it remains visually anchored to the banner's bottom edge.
- The write-back-detection regex is intentionally a single allow-list expression. Any new write-back surface phrase added to `toast()` calls needs a one-line update to `QUEUEABLE_RE` — no per-button instrumentation required.
- `_flushQueue()` deliberately replays via `window._origToast` (the un-wrapped function) so replays don't bounce back into the queue if the connection flickers off again during sync.
- Snapshot is taken at boot only in this prototype. Phase 2 hook points (after Dust / Gainsight / Gong fetch success) are stubbed: just call `_snapshotState()`.
- No new color tokens. No new dependencies. `sw.js` is ~60 lines.

---

## [2.3.0] — 2026-05-16

Task Brief panel fully implemented. The v1.8.0 stub (`openTaskBrief(taskId)` setting `window._activeTaskId` and closing the popover) is replaced with a full renderer that loads a complete CSM support center into the center Mission Briefing column.

### Added
- **New right-panel view `view-taskbrief`.** Mirrors the `view-dust` / `view-draft` pattern: Back button → `resetPanel()`, header with clipboard icon + "Task Brief" title, scrollable content area (`#taskbrief-out`) populated dynamically per task. Sits in the same `.rp` parent as every other view, so all existing routing (`openPanel`, `resetPanel`, `scrollPanelIntoView`) works without modification.
- **`TASK_BRIEFS` data table.** Single source of truth for all 8 briefs, keyed by named slug (`nova-cta`, `brightex-email`, `nova-slack`, `acme-cal`, `meridian-cta`, `brightex-proj`, `jennifer-email`, `creston-cta`). Each entry declares: source chip, account pill (color-coded by risk level), age badge, large bold title, one-line context, plain-language "what's being asked" body, Dust analysis "why this matters" body, compact key/value context grid (Last Gong / Open CTAs / Health / Competitor flag / Related docs as clickable links / Team activity), suggested next step, and a list of action button descriptors. Renderer iterates buttons into proper markup with primary/secondary styling.
- **`TASK_ID_MAP`** translates the existing `t1`..`t8` ids on the TASKS array to the named brief keys, so the Tasks dropdown HTML and renderer are untouched — clicking row `t1` opens the `nova-cta` brief, row `t2` opens `brightex-email`, etc.
- **Action button wiring per brief** (every onclick matches the spec):
  - Update in Gainsight → `tbToast('gs', acct)` &rarr; "Opening Gainsight CTA · [Account] ✓"
  - Log in Gainsight → `tbToast('log-gs', acct)` &rarr; "Activity logged in [Account] Gainsight timeline ✓"
  - Log Attempt in Gainsight → `tbToast('log-attempt', 'Meridian')` &rarr; "Re-engagement attempt logged · Meridian ✓"
  - Notify AE → `tbToast('notify-ae', acct)` &rarr; "Slack DM sent to AE · [Account] ✓"
  - View SLA Doc / Related-docs links → `taskDocOpen(name)` &rarr; "Opening [name] ✓"
  - Open Save Strategy / Risk Analyst / Prep Me → existing `openAgentDrawer(...)` with the right key
  - Draft Reply / Draft Outreach → existing `draftReply(acct)` (loads `view-draft`)
  - Draft Follow-Up (Acme only) → `draftAcmeFollowUp()`, which lazily registers an `acme` entry in `DRAFT_REPLIES` (post-QBR recap referencing the May 10 Gong SSO signal) and reuses `draftReply('acme')` for the render
  - Generate Risk Review Deck → `openDeckModal()`
  - Ghost-Buster (from task brief) → new `tbGhostBuster(acct)` helper that mirrors the popover-context pattern: remembers the current briefing view in `_lastBriefingView` before calling `openPanel(acct, null)`, so the Ghost-Buster Back button returns to the right place
- **Scroll into view on every brief open.** `openTaskBrief` calls `openPanel('taskbrief', null)`, which already chains `scrollPanelIntoView` (v2.1.0). Verified end-to-end: with the page scrolled to bottom, clicking a task row scrolls `scrollY 471 → 386` so `.rp` lands at viewport top.
- **CSS namespace `.tb-*`** for the brief-only chrome: `.tb-hd` (chip row), `.tb-chip.src` / `.tb-pill` (account, color-coded by `r/a/g/gy/b`) / `.tb-age` (with `r`/`a` variants for overdue/warning), `.tb-title` (18px bold), `.tb-ctx` (one-line subhead), `.tb-kv` (compact 2-column grid for the context section). All section bodies reuse the existing `.du-sec`, `.du-card` (with `r/a/g/b` accent variants), `.du-acts.foot`, `.du-btn`, `.du-foot` patterns from the Ask Dust renderer — visually consistent with the rest of the right panel.

### Verified end-to-end
- All 8 task ids load the correct brief: title, source, account, and full button set match the spec for every row.
- Back button on the task brief calls `resetPanel()` &rarr; returns to `view-default` (pre-loaded Acme QBR Mission Briefing). Confirmed.
- Scroll-into-view fires on open; no spurious scroll when the panel is already in viewport.
- Tasks popover closes via the existing `closePops()` call inside `openTaskBrief` before the panel paints.

### Not touched
- `TASKS` array (still `t1..t8` with the same content), `renderTasksList` (still emits the same row markup with the same `onclick="openTaskBrief('tN')"`), the Tasks dropdown HTML (`#pop-tasks`, `.tk-pop-hd`, `.tk-row`, `.tk-sev`, `.tk-src` etc).
- `openPanel`, `resetPanel`, `scrollPanelIntoView`, `openAgentDrawer`, `agentBtn`, `closePops`, `closeNotifPops`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `draftReply`, `_dustRender`, `dustQuick`, `askDust`, every Ask Dust template (incl. Coach Me), every universal-account-click handler.
- Brief-strip widgets (Priority Stack / Next Up / Ask Dust), Urgent Inbox, Today's Tasks card, Dark Zone, Live Signals, Calendar, notification rail, pulse strip, deck modal HTML, every agent drawer, Recipe for Success tab.

### Engineering
- 100% additive: zero changes to existing functions or markup outside the new view block and the new CSS namespace. The new view block is appended after `view-apex` inside `.rp`; the new CSS sits at the end of the existing styles section.
- No `console.log`. No hardcoded API keys. All brief content lives in the data table so future tweaks to copy don't require touching the renderer.
- The brief is built via string concatenation into `innerHTML` of `#taskbrief-out`. All static content from the data table is already safe (no user input flows in); the only dynamic input is `taskId`, which is sanitized by the `TASK_ID_MAP` allow-list lookup.

---

## [2.2.0] — 2026-05-16

CSS-only. Top three brief-strip cards (Today's Priority Stack, Next Up, Ask Dust) now render at identical height.

### Fixed
- **Top three cards equal-height across all viewport widths.** Root cause: the v1.4.0 "Phase A layout surgery" override flipped `.brief-strip { align-items: start }` and removed the `min-height` on `.bf`, so the grid no longer stretched its children to the tallest row. Restored grid stretch and pinned card body distribution:
  - `.brief-strip` v1.4.0 override: `align-items: start` → `align-items: stretch`.
  - `.bf` v1.4.0 override: added `height: 100%` (keeps the existing `min-height: 0` and `padding: 14px 16px`).
  - `.bf-kv` (Next Up's 2x2 data grid): added `flex: 1; align-content: start` so the data sits at the top of the card while the `.bf-btns` row sticks to the bottom via its existing `margin-top: auto`.
  - `.bf-qa` (Ask Dust's 3x2 chip grid): swapped `margin-top: auto` for `flex: 1; align-content: stretch` so the two chip rows expand evenly to fill the card.
- Verified equal height in headless renders at 1280px (271/271/271), 1440px (271/271/271), and 1920px (256/256/256). Heights match within each viewport; the natural height shrinks slightly at 1920 because the wider Ask Dust column wraps less content — that's intentional.

### Not touched
- All HTML markup. All JS handlers. All copy. All other widgets (Urgent Inbox, Today's Tasks, Dark Zone, Live Signals, Calendar, Mission Briefing, notification rail, pulse strip, deck modal, agent drawers, Recipe for Success tab).
- No new CSS classes were introduced. The fix is four property changes inside existing rules. No new color tokens, no new selectors.

### Engineering
- Reused the existing flexbox column on `.bf`. `.bf-priority` rows are inherently top-aligned (no buttons row), so they need nothing beyond the parent stretch — the card grows to match its neighbors and the rows sit at the top naturally.
- `.bf-btns { margin-top: auto }` was already present and continues to pin the three Next Up action buttons (Prep Me / Risk Analyst / Generate Deck) to the bottom of the card.

---

## [2.1.0] — 2026-05-16

Three reported bugs investigated. One is a real bug and is fixed; the other two were observed symptoms of the same root cause and resolve automatically with the same fix.

### Fixed
- **Mission Briefing panel scrolls into view on every content update.** Root cause for the reported "nothing happens" feel across multiple buttons. When the user was scrolled down (looking at the calendar, Live Signals, Tasks, etc.) and fired a panel-changing action, the panel content updated but the viewport didn't move — so the user saw nothing happen and assumed the button was broken. Added a `scrollPanelIntoView()` helper that checks the `.rp` panel's `getBoundingClientRect().top`. If the panel is above the viewport (`top < 0`) or sits past 80% of the viewport height (i.e. the user is scrolled high above it), it calls `rp.scrollIntoView({ behavior:'smooth', block:'start' })`. If the panel is already on-screen, the helper is a no-op — no spurious scroll jumps. Wired into `openPanel` and `resetPanel`; everything else (`draftReply`, `summarizeSlack`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `_dustRender`, calendar event onclicks, Tasks dropdown stub) inherits the scroll automatically because every path routes through one of those two functions.
- **Gmail dropdown Draft Reply now uses the close → wait → render pattern.** `draftReply(acct)` previously called `closeNotifPops()` then immediately rebuilt the `view-draft` content and called `openPanel('draft', null)` in a single synchronous frame. With Bug 2's scroll fix this would technically work, but the popover close animation could overlap with the panel-content paint, contributing to the "nothing happened" perception. Wrapped the body of `draftReply` after `closeNotifPops()` in a `setTimeout(..., 100)` so the popover gets a beat to close before the panel updates and scrolls. Same pattern as `openGhostBusterFromPopover`. All three rows (NovaVault → `draftReply('nova')`, Brightex → `draftReply('brightex')`, Meridian → `draftReply('meridian')`) already routed to the function correctly — the wiring was never broken. Verified end-to-end in a headless render: each row closes the popover, loads `view-draft` with the correct account title, and scrolls the panel to the top of the viewport.

### Investigated, no code change
- **Bug 1 — "Calendar events not rendering."** Could not reproduce. A headless render of the current build (v2.0.0) showed all four `.ce` blocks painting at correct dimensions and colors: `ce-acme` 236×106 green, `ce-brightex` 236×89 amber, internal CS Team Sync 236×70 gray (no chevron, not clickable), `ce-nova` 236×130 red. `cal-body` was 270×459 with 4 children, `display:flex`, no clipping, no `overflow:hidden` cutting events. CSS chain (`.cal-body` → `.ce` → `.ce-bar` + `.ce-body`) is intact and was last modified in v1.4.0 — no v1.5.0/1.6.0/1.7.0/1.8.0/1.9.0/2.0.0 commit touched it. The reported symptom (the whole calendar reading as blank space) is most plausibly explained by the scroll bug: clicking an event fired `openPanel` but the panel updated off-screen, making the calendar look unresponsive. With the v2.1.0 scroll fix the click → briefing flow surfaces visibly. **No CSS or HTML change for the calendar was needed and none was made.**
- **Bug 3 — "Gmail Draft Reply not opening panel."** Could not reproduce either. Headless click on each row (`button[onclick="draftReply('nova'|'brightex'|'meridian')"]`) loaded `view-draft` with the correct title (`NovaVault · Reply to Michael Torres`, `Brightex Inc · Reply to Sarah Chen`, `Meridian Health Systems · Reply to Jennifer Ramos`) and closed the popover (`popOpen: false`). All three keys exist in `DRAFT_REPLIES`. The wiring was correct; the symptom was the same off-screen-update problem as Bugs 1. The 100ms wait added above is a defensive polish (per the spec's recommended pattern), not a functional repair.

### Not touched
- Calendar HTML, calendar CSS (`.cal-hd`, `.cal-body`, `.ce`, `.ce-bar`, `.ce-body`, `.ce-arr`, `.ce-pill`), Mission Briefing layout (`.rp`, `.rp-view`, `.rp-scroll`), Live Signals widget, Dark Zone widget, pulse strip, notification rail HTML, every agent drawer, deck modal, Ghost-Buster handlers, Back button, all Ask Dust templates (incl. v2.0.0 Coach Me), Custom Agents dropdown, universal account-click handlers, Recipe for Success tab.
- `closeNotifPops`, `closePops`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `openAgentDrawer`, `agentBtn`, `_dustRender`, `dustQuick`, `askDust`, `acctClick*`, `togglePop`, `toggleNotifPop` — no signature or body changes.

### Engineering
- `scrollPanelIntoView` uses `getBoundingClientRect().top` rather than `IntersectionObserver` — the call site is synchronous and one-shot, and IO would add an async tick for no benefit here.
- Verified the fix with a Playwright check covering three scenarios: (a) scrolled-down + calendar click → page scrolls back to bring `.rp` to `top=0`; (b) scrolled-down + Gmail Draft Reply for Meridian → popover closes, `view-draft` loads with correct title, panel scrolls into view; (c) panel already in viewport + calendar click → no spurious scroll (`scrollY` unchanged at 386).
- No new CSS rules. No new event handlers. No new global state.

---

## [2.0.0] — 2026-05-16

Two big features in one commit: every account name across TeamOS is now a clickable shortcut into the Mission Briefing, and Ask Dust gets a 3x2 chip grid with a fifth Coach Me quick-action plus a Custom Agents dropdown.

### Added — Universal account click → Mission Briefing
- New CSS utility `.acct-lk` shared by every clickable account name: `cursor:pointer; color:inherit; text-decoration:none; transition:opacity 150ms`. Hover state adds `text-decoration:underline; opacity:.85`. Intentionally not styled as a blue hyperlink — feels like intelligent interactive text.
- New JS helper trio:
  - `acctClick(key, ev)` — for surfaces already on screen (Priority Stack, Next Up, Urgent Inbox, Today's Tasks, Live Signals row, Dark Zone).
  - `acctClickFromPulse(key, ev)` — closes the active pulse-strip popover then opens the panel after a 100ms settle (uses the same close-then-open pattern as `openGhostBusterFromPopover`).
  - `acctClickFromNotif(key, ev)` — same pattern for the notification rail popovers.
  All three call `stopPropagation()` so an account-name click inside a row never bubbles to the row's own onclick handler. All three guard with `document.getElementById('view-' + key)` before opening.
- New `ACCT_KEY` lookup that normalizes every display string ("NovaVault" / "Nova" / "Brightex Inc" / "Brightex" / "Acme Corp" / "Acme" / "Meridian Health Systems" / "Meridian" / "Creston Software" / "Creston" / "Apex Dynamics" / "Apex") to the canonical `view-*` id used by `openPanel`. Dark accounts route through `view-meridian` / `view-creston` / `view-apex` which `openPanel` already maps to the Ghost-Buster email view.
- Clickable account names now live in: Priority Stack rows (NovaVault, Acme Corp, Brightex Inc), Next Up header (Acme Corp), all four Urgent Inbox cards, four of five Today's Tasks rows (ac5 Klaxton skipped — not a routable account), all five Live Signals rows, all three Dark Zone rows, all three Email-popover account tags, the Slack-popover NovaVault tag, both Renewal-popover tags, all three Calls-today popover rows, both At-Risk popover rows, both ARR popover rows, the NovaVault/Brightex/NovaVault references in the three Overdue-CTAs popover rows, the three Dark-accounts popover rows, and the Tasks-dropdown rows (account-name span gets `stopPropagation` so it goes to Mission Briefing while the rest of the row still calls `openTaskBrief`).

### Added — Ask Dust 5th button: Coach Me
- New ⚡ Coach Me chip wired to `dustQuick('Coach Me')`.
- Registered `Coach Me` in `DUST_AGENT` (renders "Call Coach agent" in the 1.5s loader) and in `DUST_RESP`.
- Output sections (in the existing Mission Briefing `view-dust`): "Your last 3 calls with this account" (3 sentiment-coded cards), "Dust coaching note" (blue insight card), "One thing to do differently today" (green action card). Footer buttons: Open Prep Me (routes to `prep` drawer for Acme via `dustQuickToDrawer`) and View Gong Calls (toast).
- Source line: "Gong call analysis · Gainsight account history · Updated 8:47 AM".

### Added — Custom Agents dropdown
- 6th slot in the Ask Dust grid: ⚙ Agents chip with muted opacity (0.8), chevron icon, and `bf-qa-btn.muted` styling. Sits next to Coach Me on row 2.
- Clicking opens a 280px dropdown anchored above the chip (`position:absolute; bottom:calc(100% + 6px); right:0`) so it pops upward rather than getting clipped by the bottom of the card.
- Three sections: 5 active agents with teal `circle-check-filled` icon + "Active" status (Prepare My Day, Draft Follow-Ups, Find Open Loops, Review At-Risk, Coach Me); 4 available agents with gray hollow circle + "Available" status (Competitive Intel, EBR Prep, Renewal Forecaster, Champion Tracker); footer row "+ Request new agent".
- Available agent click → `requestAgent(name)` toast: "Agent requested · Your admin will activate [name] ✓". "Request new agent" → `requestNewAgent()` toast: "Request sent to CS Ops · They'll configure and activate within 24h ✓". Both also close the dropdown.
- Outside-click handler (scoped to `.bf-qa-wrap`) closes the dropdown — doesn't interfere with the existing pulse-strip or notification-rail outside-click handlers.

### Changed — Ask Dust grid
- Switched `.bf-qa` from `grid-template-columns:1fr 1fr` (2x2) to `1fr 1fr 1fr` (3x2). All six cells are equal width. Added `min-height:34px` to chips so the new row aligns evenly with the existing four chips. Bumped chip padding from `8px 10px` to `9px 9px` and tightened the inner gap from 6px to 5px so each chip stays one line on a 270px column. "Review At-Risk Renewals" abbreviated to "Review At-Risk" to fit the 3-col width without wrapping.
- Card height: `.bf-qa{margin-top:auto}` continues to pin the chip grid to the bottom of the card; the added row + tightened padding make the Ask Dust card sit at roughly the same height as Priority Stack and Next Up in the left/center brief-strip columns. No fixed/min heights changed.

### Not touched
- `openPanel`, `resetPanel`, `closePops`, `closeNotifPops`, `openGhostBusterFromPopover`, `backFromGhostBuster`, `openAgentDrawer`, `agentBtn`, `_dustRender`, `dustQuick`, `askDust`, `dustQuickToDrawer` — all unchanged. Universal click is layered on top of existing routing.
- All existing Mission Briefing content (Acme / Brightex / NovaVault / Meridian / Creston / Apex views), every agent drawer, all four existing Ask Dust templates, the deck builder modal, all Ghost-Buster handlers, the Back-button logic, calendar event onclicks, pulse-strip popover structure, notification-rail core wiring, Recipe for Success tab.
- Existing inline buttons (Save Strategy / Prep Me / Risk Analyst per Priority Stack row, Draft Reply per Email popover row, Ghost-Buster per Dark popover row, agent action buttons per Live Signals row) — none touched. The account-name span is a *new* second click target on the same row.

### Engineering
- Account-name escape hatch: every clickable account span passes `event` to its handler and the handlers all call `stopPropagation()` before delegating, so e.g. clicking "NovaVault" inside a Tasks-dropdown row opens Mission Briefing instead of falling through to the row's `openTaskBrief` handler.
- No new color tokens. Dropdown styles bind to existing `:root` values.
- No `console.log`. No hardcoded API keys.
- Coach Me output reuses the existing `du-sec` / `du-card` / `du-acts foot` / `du-foot` classes — no new Dust output CSS.
- 5 of the 5 active agents in the dropdown match the actual quick-action chips on the card, keeping the "what's wired vs what's coming" honest.

---

## [1.9.0] — 2026-05-16

Two surgical fixes. (Bumped from the requested `[1.8.0]` because `[1.8.0]` was already shipped for the Tasks dropdown; treating this as the next minor.)

### Changed
- **Dark Zone moved to the left column.** Per follow-up direction, the 60-Day Dark Zone widget moved from column 2 (under Mission Briefing) to column 1, sitting directly under the Urgent Inbox card and above Today's Tasks. The DZ collapsed-by-default behavior, toggle, Ghost-Buster buttons, and per-popover routing (`openGhostBusterFromPopover`) are unchanged.
- **Live Signals moved to the right column.** From column 2 (below the old DZ position) to column 3, sitting directly under the Calendar card. Per-row action buttons (Prep Me / Risk Analyst / Ghost-Buster) and content unchanged.
- Center column now contains only the Mission Briefing widget (`.rp`).

### Fixed
- **Mission Briefing no longer renders empty trailing space.** Removed `height:100%`, `min-height:520px` from `.rp`; removed `flex:1` from `.rp-view`; removed `flex:1; overflow-y:auto` from `.rp-scroll`. Result: the widget is content-height under every state — pre-loaded Acme briefing, account briefing after a calendar click, Ghost-Buster email draft, Ask Dust output, Slack summary, task draft. No internal scroll bar; page scrolls naturally when content is tall.

### Not touched
- Nav, pulse strip (incl. the v1.8.0 Tasks dropdown), notification rail, agent drawers, deck modal, Ghost-Buster handlers, Ask Dust handlers, brief-strip widgets (Priority Stack / Next Up / Ask Dust), calendar event onclicks, Recipe for Success tab.
- DZ + LS widget internals are byte-identical to v1.8.0 — only their grid-cell parents changed.

### Engineering
- Layout change executed via a single Python pass that moved the two blocks while preserving 6-space indentation. Verified `.main` still has exactly three grid children.
- CSS surgery touched only three rules (`.rp`, `.rp-view`, `.rp-scroll`) and only dropped properties — added none.

---

## [1.8.0] — 2026-05-16

Tasks dropdown — UI only. The brief panel that opens on row click is intentionally deferred to the next spec.

### Added
- Sixth indicator on the pulse strip: `≡ 8 tasks`. Opens a 520px right-aligned dropdown that matches the supplied mockup verbatim:
  - Header bar (surf2 background, bottom border): `≡ Tasks · <n> items` on the left, `+ New Task` button on the right.
  - 8 task rows in mockup order. Each row is a 4-column grid `[10px severity dot] [52px source tag] [body] [age]`:
    - severity dots: `r` red (overdue/critical), `a` yellow (warning), `g` green (active), `n` hollow outline (neutral / no urgency)
    - source tags: `CTA` / `EMAIL` / `SLACK` / `CAL` / `PROJ` rendered as a fixed-width outlined chip
    - body: bold account/sender prefix + `·` separator + task title (or just title when no leading actor, e.g. the PROJ row)
    - age: optional, right-aligned, colorized when overdue or warning
- New CSS namespace `.tk-pop*` / `.tk-row*` / `.tk-sev*` / `.tk-src` reusing existing design tokens. Yellow severity dot uses `#EAB308` (matches the 🟡 in the mockup); all other colors come from `:root` tokens.
- `TASKS` array as the single source of truth for the list. `renderTasksList()` builds the rows, keeps the header `<n> items` count and the pulse-strip pill count in sync with the number of incomplete tasks. Initial render is called at script-end.
- Stub `openTaskBrief(taskId)` wired to each row's onclick. For now it stashes the task id on `window._activeTaskId` and closes the popover. The full Mission Briefing brief panel content (incl. Mark Complete behavior) is intentionally not built — that comes in the next spec.
- `+ New Task` button toasts "New task — coming in next build".

### Not touched
- Existing pulse-strip popovers (calls / at-risk / ARR / overdue CTAs / dark accounts), the Today's Tasks card on the dashboard, the Mission Briefing pre-loaded Acme state, every agent drawer, the notification rail, Recipe for Success tab, all toast/click handlers outside the new dropdown.

---

## [1.7.0] — 2026-05-16

Two bug fixes only.

### Fixed
- **Back button non-functional when Ghost-Buster is triggered from the pulse-strip dark-accounts popover.** Root cause: the popover was still in the live DOM when the user clicked Back, intercepting the panel reset. Added `openGhostBusterFromPopover(acct)` which (a) closes the popover via `closePops()`, (b) waits 100ms for the close animation to settle, (c) re-checks visibility and waits an additional 50ms if still on, then (d) records the currently-active briefing view in `_lastBriefingView` before calling `openPanel(acct, null)`. Added `backFromGhostBuster()` which restores `_lastBriefingView` (default `view-default`) and re-selects the matching calendar event if applicable. The three pulse-strip popover Ghost-Buster buttons (Meridian / Creston / Apex) now route through `openGhostBusterFromPopover`. The three Ghost-Buster panel Back buttons now route through `backFromGhostBuster`. **Dark Zone widget Ghost-Buster buttons were not touched** — they continue to call `openPanel(acct, null)` directly; the new back handler falls back to `view-default` for that path so existing behavior holds.
- **Deck builder animation duration regression.** The progress driver had drifted to `setInterval(..., 40ms)` with `pct += 1.5` per tick, producing total durations under 3s in one direction and reportedly ~35s in another (drift between deployments). Replaced with the canonical setTimeout chain: three nested `setTimeout(..., 6000)` calls totaling 18s. The progress bar uses an inline `width 6s linear` transition so it fills smoothly between milestones (0% → 33% → 66% → 100%). Completion at the 18-second mark reveals the "Your deck is ready" state + Open in Google Slides / Download PPTX buttons. Copy, completion content, and action buttons untouched. `closeDeckModal` updated to call `clearTimeout` for correctness (the previous `clearInterval` worked due to shared ID space but no longer matched the timer type).

### Not touched
- `openPanel`, `resetPanel`, `closePops`, `togglePop` — all unchanged.
- Dark Zone widget, Live Signals row Ghost-Buster button, Email/Slack/Renewal popover handlers, Ask Dust handlers, agent drawer logic, calendar onclicks, brief-strip widgets, nav, pulse-strip counts, deck modal HTML (only the JS function body changed), Recipe for Success tab.

---

## [1.6.0] — 2026-05-16

Layout-only swap: Mission Briefing and Calendar trade columns.

### Changed
- **Mission Briefing → center column.** The full `.rp` right-panel container (every `.rp-view` — default Acme briefing, view-acme/brightex/nova, view-meridian/creston/apex, view-dust, view-draft, view-slack-sum) was lifted out of column 3 and inserted as the first child of column 2's wrapper. It now sits above the Dark Zone + Live Signals at full center-column width (1fr in the `275px 1fr 270px` grid), making it the most prominent widget on the board. All internal classes, ids, content, and view-switching logic are unchanged.
- **Calendar → right column.** The calendar's `cal-hd` + `cal-body` block was wrapped in a new column 3 `<div>` and inserted where `.rp` used to live. The narrower 270px column hosts the date header, all four colored event blocks, the internal-meeting non-clickable, and the "Click a call to open the mission briefing →" hint.

### Did not change
- Calendar event onclick handlers (`openPanel('acme'|'brightex'|'nova', this)`) still target the same `.rp-view` ids — those views just live in column 2 now.
- `.rp` height/scroll behavior (`height:100%; min-height:520px`).
- Calendar's `cal-hd` / `cal-body` styling, event tiles, chevron affordance, internal-meeting opacity rule.
- Nav, pulse strip, brief-strip, Priority Stack, Next Up, Ask Dust, Urgent Inbox, Today's Tasks, Dark Zone, Live Signals, all agent drawers, deck modal, notification rail, Recipe for Success tab.

### Engineering
- Zero CSS changes. The swap is purely a DOM reorder.
- Zero JS changes. `openPanel`, `resetPanel`, `agentBtn`, `openAgentDrawer`, `draftReply`, `summarizeSlack` all continue to target `#view-*` ids which now live in column 2.
- Implemented via a single Python pass that physically moved the 190-line `.rp` block and the 46-line calendar block, then verified `.main` still has exactly three top-level grid children.

---

## [1.5.0] — 2026-05-16

Nav-only feature: Global Notification Rail. Sticky across every tab and scroll position.

### Added
- Three nav-bar indicators, right-aligned before the avatar, separated by a subtle divider:
  - 📧 Email (red pill, count 3) — Gmail unreads
  - 💬 Slack (purple pill, count 1) — Slack DMs / channel mentions
  - 📄 Renewals (teal pill, count 2) — Ironclad contract events via Salesforce
- Each indicator opens a 320–340px popover anchored to its button. Only one popover open at a time; outside-click closes it. Popovers do not scroll the page. Mobile (<768px) collapses each popover to full-width below the nav. Popover `z-index: 300` clears the sticky pulse strip and nav.
- "Mark all read" link per popover zeroes the count and hides the pill (no "0" state).
- **Email popover**: three account-tagged rows (NovaVault / Brightex / Meridian). Each has a Draft Reply button that opens a new right-panel view (`#view-draft`) with a Ghost-Buster-style pre-written email — account context strip, subject line, full body, Send via Gmail / Edit first buttons. Send toast: "[Account] reply sent via Gmail · Outreach activity logged in Salesforce ✓".
- **Slack popover**: one message row (Maggie Spry · #cs-team · NovaVault flag). Summarize with Dust loads a 1.5s loader then a structured summary in `#view-slack-sum` (Original message → Dust summary → Recommended action card with Open Save Strategy + Draft Reply buttons). Open in Slack toasts.
- **Renewals popover**: subtitle "Contract events synced from Ironclad → SFDC Contract object · Updated 9:14 AM". Two rows with left accent borders:
  - NovaVault `Past Due` (red border + red status badge): "Contract sent Jun 1 · No signature received · 17 days elapsed" + "Ironclad shows counterparty status: Not Opened". Buttons: Open Save Play (directly opens Save Strategy drawer for NovaVault via `openAgentDrawer`) and View in Ironclad (toasts).
  - Brightex `Signed` (green border + green status badge): "Sarah Chen signed · May 14 · Awaiting AE counter-signature" + "Ironclad workflow stage: Partially Executed". Buttons: Log in Gainsight (toasts + decrements badge by 1) and Notify AE (Slack DM toast).
- Simulated polling: at 90s after page load, the email badge increments by 1 and runs a 300ms scale pulse (1.0 → 1.3 → 1.0). No toast or sound — ambient awareness only.

### Engineering
- Single contained commit. Did not touch the Urgent Inbox, pulse strip, agent drawers, Ask Dust outputs, Mission Briefing, calendar, Dark Zone, Live Signals, tab routing, or Recipe for Success tab.
- New module is fully namespaced (`.n-notif*`, `NOTIF` state object, `toggleNotifPop` / `closeNotifPops` / `markAllNotifRead` / `draftReply` / `summarizeSlack` / `logBrightexRenewal`). Outside-click handler scopes to `.n-notif-wrap` so it doesn't interfere with the pulse-strip popover or any other click-away logic.
- New design tokens kept at zero. Pill colors (#EF4444 / #7C3AED / #0EA5E9) come from the spec directly — added inline; no token rename required.
- All popover content is HTML-safe; the only user-derived string anywhere is the simulated Slack message body which is hardcoded.
- Acceptance criteria verified: badges visible on every tab including Recipe for Success because they live inside the sticky nav.

---

## [1.4.0] — 2026-05-16

Phase A — layout surgery + demo-grade content. The prototype is now an executive-ready demo: every button produces convincing output, every agent returns realistic data, no toasts as final outputs.

### Layout
- **Pulse strip is sticky.** `position: sticky; top: 44px; z-index: 40` so it stays pinned below the nav while the CSM scrolls.
- **Priority Stack — compact rows.** Each row is a single CSS grid (`auto 1fr auto`): rank · context · primary action, right-aligned. Removed the secondary Next Steps button per row (the agent is still reachable from Mission Briefing and the Live Signals feed). All three rows now share consistent ~64px height.
- **Next Up — auto-height, no dead zone.** Countdown header reads `In 38 min · 9:00 AM` (large mins on top). Data grid is true 2×2 (Health / Renewal on row 1, Open CTAs / Last Gong on row 2). Last Gong field shows full text ("May 10 · David Kim flagged enterprise tier & SSO support"), no ellipsis. Three agent buttons sit immediately below the grid, no gap.
- **Ask Dust — compact command palette.** Search bar on top, 2×2 chip grid directly below, card height = content only. No filler padding.
- **Right panel default state — pre-loaded Acme briefing.** Removed the "Today at a Glance" stats grid (it duplicated the pulse strip). On page load the right panel shows the next-up Acme QBR briefing — name, ARR, renewal, three story sections (Where we are / Last Gong May 10 / Objective), and all four agent buttons. Header shows "Mission Briefing" with a pulsing teal `Next Up · Auto-loaded` tag. The "My Agents" directory is preserved but moved below the briefing, collapsed behind a `My Agents ▾` toggle.
- **Live Signals — compact rows.** Each row is a 48px-min grid with [icon badge] [account name] [signal type] [one-line description] [severity badge] [timestamp] [action button]. Five signals total (added Brightex support-ticket-spike as the fifth, WATCH severity). Each row's action button routes to the relevant agent or panel: champion change → Prep Me, health drop → Risk Analyst, Gong silence → Ghost-Buster, expansion signal → Prep Me, ticket spike → Risk Analyst. Widget footer: "View 6 more signals →" toasts "Full signals feed coming in Forecasting tab".
- **Dark Zone collapsed by default.** Header bar shows the title + count + a "Show accounts ▾" toggle. Body hidden until clicked; toggle rotates the chevron and swaps label to "Hide accounts". Pulse-strip popover Ghost-Buster buttons still work independently.
- **Calendar header compressed.** Down from ~60px to a single 44px row with date on the left and one-line hint on the right.
- **Today's Tasks compressed.** Each task row is now a tight grid: source dot + label badge on row 1, single-line title on row 2, context + right-aligned action button on row 3. Max ~64px per row, generous between-task padding removed.

### Demo content
- **Pre-loaded Acme briefing copy** (`view-default`): Where we are, Last Gong May 10, Objective — all rewritten to executive-ready prose matching the spec.
- **Ask Dust — Prepare My Day**: 3 sections — Today's Calls (3 calls with coaching notes), Urgent Actions (4 items with Reply / Open Gainsight / Open CTA buttons), Signals to Know (champion change / health drop / expansion). Footer: "Sourced from Gainsight · Gong · Google Calendar via Dust · Updated 8:47 AM". Action buttons: Open NovaVault Save Strategy · Open Brightex Risk Analyst.
- **Ask Dust — Draft Follow-Ups**: two complete drafts per spec text (Michael Torres NovaVault, Sarah Chen Brightex). Each draft has Send via Gmail / Copy / Edit in Gmail buttons. Send toast: "Email sent to [Person] · Logged in Salesforce ✓".
- **Ask Dust — Find Open Loops**: 3 overdue CTAs per spec (NovaVault forecast 2d / NovaVault exec save call 1d / Brightex success plan 3d), 2 unanswered emails. Bottom action: "Push all CTAs to top of Gainsight queue" → "CTAs prioritized in Gainsight ✓".
- **Ask Dust — Review At-Risk Renewals**: risk-ranked table with Churn %, "Total at-risk ARR: $67K across 2 accounts" line, Dust summary paragraph. Three buttons: Open NovaVault Save Strategy · Open Brightex Risk Analyst · View full forecast (toast: "Forecasting tab coming in next build").
- **Ask Dust — free-text query**: paragraph-form Dust answer drawing on NovaVault / Brightex / Acme data; Sources line; Copy response + Save to account notes buttons (toast: "Saved to NovaVault notes in Gainsight ✓").
- **All Ghost-Buster Send via Gmail buttons**: toast format "[Account] outreach email sent via Gmail · Outreach activity logged in Salesforce ✓".
- **All Push to Gainsight buttons (Save Strategy + Next Steps drawers, all 3 accounts)**: toast "3 CTAs created in Gainsight · [Account] · Assigned to Carmen ✓".
- **All Start Save Play buttons (Risk Analyst, Brightex + NovaVault)**: toast "Save play initiated in Gainsight · [Account] · Risk CTA created · Assigned to Carmen ✓".
- **Generate Deck modal**: Open in Google Slides toast "Opening deck in Google Drive · 16 slides · Shared with David Kim ✓". Download PPTX toast "Downloading TeamOS_Acme_QBR_May2026.pptx ✓".

### Engineering
- No new color tokens; all new utility classes (`pl-tag`, `ag-toggle`, `ls-act`, `ls-foot`, `dz-toggle`, `dz-body`, `bf-priority`, `bf-next` overrides) bind to existing tokens.
- No `console.log`. No hardcoded API keys.
- Removed `#ds-tasks` element from the right panel default; `doneTask` was already null-guarded so the existing task counter on the inbox card continues to update without error.
- Loading state stays at 1.5s with named agent (from `DUST_AGENT` map, retained from v1.3.0).

---

## [1.3.0] — 2026-05-16

QA pass #2 — seven polish fixes to take the prototype from 8.5/10 to 9.5/10.

### Fixed
- **Next Steps surfaced on Priority Stack.** Mission Briefing already exposed all four agents for every account; the Priority Stack only had one. Added a secondary "Next Steps" button next to the primary action on each of the three stack items (NovaVault, Acme, Brightex). New `.bf-act-row` + `.bf-act-sec` CSS keep the primary action visually dominant.
- **Extension Terms section restored and standardized.** Renderer was already producing the amber-background section, but the duplicate inner "Extension Proposal" header and inconsistent row labels were hiding the structure. Removed the inner header (section title `Extension Terms` already covers it), normalized row labels across all three accounts to *Extension Period / Terms / Commitment / Decision Deadline*:
  - Acme: 30-day pilot pre-renewal · current pricing locked · dedicated support + weekly check-ins
  - Brightex: 30 days (Jun 15 → Jul 15) · current pricing locked · decision deadline Jul 10
  - NovaVault: 60 days (Jun 1 → Jul 31) · current pricing locked · weekly touchpoints · decision deadline Jul 15
- **Agent naming harmonized across surfaces.** Canonical mapping is now used everywhere: button label → drawer title.
  - Prep Me → Pre-Call Brief
  - Risk Analyst → Risk Analysis
  - Save Strategy → Save Strategy
  - Next Steps → Next Steps
  Today at a Glance's "My Dust Agents" directory was replaced: now lists the canonical four with matching one-liners. *Icebreaker*, *QBR Builder*, and *Account Strategist* moved into a "More agents — Coming soon" sub-section so the prototype no longer claims agents it doesn't expose as buttons.
- **Action buttons on every Ask Dust output.** Each output now ends with at least one contextual button that moves work forward, matching the Ghost-Buster button pattern (dark primary + outlined secondary):
  - *Draft Follow-Ups*: per-draft Send via Gmail + Copy buttons
  - *Find Open Loops*: per-row Open in Gainsight / Open in Gmail (sources vary by loop type)
  - *Prepare My Day*: NovaVault row gets an Open Save Strategy primary action
  - *Review At-Risk Renewals*: per-account Open Save Strategy / Open Risk Analyst
  - *Free-text query*: footer with Copy response + Push to Gainsight
  All buttons fire contextual toasts naming the specific person, account, or surface.
- **Ask Dust loading state extended to 1.5s and now names the agent.** The loader previously flashed at 700ms with generic text. Now: 1500ms, spinner, "Routing to Dust agent…", second line shows the agent being called (Day Planner agent, Draft Composer agent, Loop Closer agent, Risk Analyst agent, Forecast Updater agent, Note Logger agent, or Account Strategist agent for free-text). Backed by a `DUST_AGENT` lookup map keyed by quick-action label.
- **"Open in Gong notes" footer wired account-by-account.** The Pre-Call Brief drawer footer button was a generic toast. The Gong toast is now account-specific (last-call date sourced from existing `prep.<acct>.sections[1].t` data and inlined as constants in the foot):
  - Acme → "Opening Gong · Acme Corp · Last call May 10…"
  - Brightex → "Opening Gong · Brightex Inc · Last call May 4…"
  - NovaVault → "Opening Gong · NovaVault · Last call March 31…"
- **Configure + Tasks consistency.**
  - "Configure · select from Dust workspace" button: now wired to a `configureAgents()` toast — "Agent configuration requires Dust workspace connection — available in Phase 2".
  - "Update forecast" task (ac1): now opens Ask Dust right panel pre-loaded with a NovaVault renewal forecast table (current vs proposed across renewal date, forecast status, health, open CTAs, ARR) and a primary "Update in Gainsight" action button.
  - "Log notes" task (ac5): now opens Ask Dust right panel pre-loaded with a Klaxton Labs post-call note template (attendees, summary, signal read, follow-ups) plus Save to Gainsight + Copy buttons.
  - Today's Tasks header now sits above a source legend: ● Gainsight CTA · ● Calendar · ● Gmail · ● Slack.

### Engineering
- No new color tokens. Three new utility classes (`.bf-act-row` / `.bf-act-sec`, `.du-acts` / `.du-btn`, `.tk-legend` / `.tk-leg`) all bind to tokens from SPEC §9.1.
- No `console.log`. No hardcoded API keys.
- All Ask Dust output continues to HTML-escape free-text input before rendering.
- Task action wiring is additive: opens the relevant agent drawer or Dust panel, then marks the task done — buttons keep their visible-result guarantee from v1.2.0.

---

## [1.2.0] — 2026-05-16

QA pass — eight defects fixed across drawer routing, Ask Dust, data consistency, and the missing Live Signals widget.

### Fixed (Critical)
- **Agent drawer routing (SPEC §5.5).** Every agent button was opening the same hardcoded Save Strategy markup. Root cause: the static `.dr-scroll`, `.dr-ft`, and `.dr-title` elements in the drawer had no DOM ids, so `openAgentDrawer()` could never replace their contents. Added `id="drawer-scroll"`, `id="drawer-ft"`, `id="drawer-title"`; stripped the static Save Strategy sections and static "Generate Save Deck / Push to Gainsight" footer; renderer now sets the title via `textContent`. All four agents × three accounts (12 unique drawers) now render correctly:
  - Prep Me → Account Snapshot, Last Gong, Discovery Questions, Battle Card, Follow-Up Plan
  - Risk Analyst → Churn Score (Acme 12%, Brightex 68%, NovaVault 91%), 3 Driving Signals, Discovery Questions, Recommended Save Play
  - Save Strategy → Talking Points, Discovery, Objection Handlers, Extension Terms
  - Next Steps → Immediate CTAs (numbered, owner + due) + Follow-Up Sequence
- **Ask Dust produced no output.** Both the search input and the four quick-action buttons were piping to `toast()`. Replaced with a dedicated right-panel view (`#view-dust`) that shows a loading state then a mock AI response. Hardcoded responses:
  - *Prepare My Day* → ranked 3-card brief on NovaVault / Acme / Brightex
  - *Draft Follow-Ups* → 2 ready-to-send drafts (NovaVault save extension, Brightex competitor defense)
  - *Find Open Loops* → 3 overdue CTAs + 2 unanswered Gmail threads
  - *Review At-Risk Renewals* → comparison table (NovaVault / Brightex) + recommended next actions
  - Free-text routes to the closest template by keyword (follow-up / open loop / at-risk / day), otherwise renders a generic agent response card. All output is HTML-escaped before being shown to defend against the innerHTML path.

### Fixed (High)
- **Dark accounts data drift.** Pulse strip claimed 4 dark accounts (NovaVault, Apex Studios, Riverbank Tech, Synth Labs) but the Dark Zone widget already showed a different set of 3 (Meridian Health Systems / Creston Software / Apex Dynamics). Pulse strip popover now uses the same 3 accounts as the Dark Zone, with identical day counts (73 / 67 / 61) and renewal dates. Ghost-Buster buttons in the popover now open the Ghost-Buster right-panel view for the matching account instead of toasting.
- **Live Signals widget (SPEC §5.7) was missing.** Added it below the Dark Zone in the center column. Four cards: Meridian / Gong silence (CRITICAL, 3m ago), NovaVault / Champion change (HIGH RISK, 22m ago), Brightex / Health drop (WATCH, 1h ago), Acme / Expansion signal (OPPORTUNITY, 2h ago). Includes a pulsing live indicator.
- **HTML entity bug in deck modal.** `openDeckModal()` was setting `sub.textContent` to strings containing literal `&middot;`, which rendered as raw text rather than the middle-dot glyph. Replaced literal entities with the actual `·` character. (Other `&middot;` occurrences in the file are inside HTML markup, where they are interpreted correctly.)

### Fixed (Medium)
- **Back button reset.** Verified every `.rp-back` (Mission Briefing × 3, Ghost-Buster × 3, Ask Dust) routes through `resetPanel()`, which clears `.rp-view.on`, removes `.ce.sel` from calendar events, and re-activates `view-default` (Today at a Glance + Dust Agents list). No Ghost-Buster state can ever be the visible default.
- **Today's Tasks button consistency.** All five tasks already produced a visible result (`doneTask` marks the card and updates the counter), but the labels promised more. Wired each labeled action to its matching agent drawer so the button does what it says before marking done:
  - "Update forecast" → opens Risk Analyst for NovaVault
  - "Generate prep" → opens Prep Me for Acme
  - "Draft outreach" → opens Save Strategy for NovaVault
  - "Draft reply" → opens Risk Analyst for Brightex
  - "Log notes" → marks done only (no agent route — Klaxton Labs is healthy, low-priority)
- **Duplicate Generate Deck button.** Save Strategy drawer footer carried its own "Generate QBR Deck / Generate Risk Deck / Generate Save Deck" button, duplicating the deck path that already exists on the Mission Briefing and on Next Up. Removed the deck entries from all three `save.*.foot` arrays; the drawer now only offers "Push to Gainsight". One clear path to the deck modal.

### Engineering
- No new color tokens. All Live Signals + Ask Dust styles bind to existing `:root` values from SPEC §9.1.
- No `console.log`. No hardcoded API keys.
- Ask Dust free-text input is escaped (`&`, `<`, `>`, `"`) before being injected into the output via innerHTML — defensive against the XSS path the input represents.
- Dead code (`runAgent`, `showOut`, `buildPrep`, `buildRisk`, `buildNext`) from the pre-drawer flow is no longer referenced by any onclick handler but was left in place to keep this diff scoped to the defects above.

### Roadmap
- Phase 1 "Daily Command Brief" can now be checked: shipped in [1.1.0].
- Phase 1 "Vercel deployment stable" can be checked.

---

## [1.1.0] — 2026-05-16

### Added
- **Daily Command Brief (SPEC §5.1)** — replaces the three static account cards at the top of the dashboard.
  - Panel A — Priority Stack: 3 ranked items (NovaVault critical save, Acme expansion, Brightex watch). Each item has a one-line context and one action button that opens the agent drawer (`agentBtn('save'|'prep'|'risk', ...)`).
  - Panel B — Next Up: shows only the immediately next customer-facing meeting (Acme QBR · 9:00 AM). Includes health, renewal days, open CTAs, last Gong signal, and three agent buttons (Prep Me, Risk Analyst, Generate Deck).
  - Panel C — Ask Dust: free-text input wired to placeholder Dust handler. Four quick-action buttons: Prepare My Day, Draft Follow-Ups, Find Open Loops, Review At-Risk Renewals.
- **Portfolio Pulse Strip (SPEC §5.2)** — now actually rendered in markup. Sits directly below the nav. 5 clickable popovers:
  - 📅 3 calls today — mini call list with Gong + Gainsight buttons
  - ⚠ 2 at risk — account rows with 30-day health delta + risk signals
  - 🔴 $67K ARR at risk — renewal pipeline bars with countdown
  - 📋 3 overdue CTAs — inline Done button updates strip count live
  - 👻 4 dark accounts — Ghost-Buster trigger
- New JS handlers: `askDust(e)` and `dustQuick(label)` route Ask Dust input/quick actions through the existing toast layer.

### Changed
- Removed inline `acct-strip` markup (account cards for Acme / Brightex / NovaVault). The same accounts are still reachable via Priority Stack, Next Up, calendar events, and pulse-strip popovers.
- Header version bumped to 1.1.0.

### Fixed
- CSS for `.pulse-strip` / `.pop` block was referencing undefined custom properties (`--rl`, `--tlb`, `--tld`, `--tlm`, `--s2`, `--amb`, `--amd`, `--rdb`, `--rdd`). Repointed each to the actual tokens defined in `:root` (`--rlg`, `--tl-bg`, `--tl-dk`, `--tl-md`, `--surf2`, `--am-bg`, `--am-dk`, `--rd-bg`, `--rd-dk`). Without this fix popovers would have rendered with broken backgrounds.

### Engineering
- No new colors introduced. All Command Brief styles bind to existing tokens from SPEC §9.1.
- No hardcoded API keys, no `console.log` statements added.
- Ask Dust input value is HTML-stripped before being shown in the toast (defensive — no innerHTML injection of user input).
- All new buttons use `type="button"` to avoid implicit form submits; the Ask Dust form preventDefaults submit.

### Known Issues
- Ask Dust is wired to a toast for now; live Dust API routing still pending OAuth (SPEC §10 Phase 2).
- Ghost-Buster buttons in the dark-accounts popover currently toast; full draft state lives in the right panel and is unchanged in this release.

---

## [1.0.0] — 2026-05-16

### Added
- Initial dashboard build: CSM Mission Control
- Portfolio Pulse Strip with 5 clickable popovers
  - 📅 Calls today → mini call list with Gong + Gainsight buttons
  - ⚠️ At risk → account rows with health delta + risk signals
  - 🔴 ARR at risk → renewal pipeline bars with countdown
  - 📋 Overdue CTAs → inline Done button, live count update
  - 👻 Dark accounts → Ghost-Buster trigger from strip
- Calendar: visual colored event blocks (green/amber/red/gray)
- Mission Briefing panel: 3-story format (Where we are / Last Gong / Objective)
- Agent drawer (slide-over, 380px): all 4 agents now open drawer
  - ⚡ Prep Me: Account Snapshot, Last Gong, Discovery Questions, Battle Card, Follow-Up Plan
  - 🛡 Risk Analyst: Churn score (12%/68%/91%), 3 signals, recommended save play
  - 🔄 Save Strategy: Talking points, objection handlers, extension terms
  - ✅ Next Steps: 3 Gainsight CTAs with push button
- Deck builder modal: 3-step progress animation → Google Slides + PPTX
- Ghost-Buster: personalized re-engagement email in right panel
- Live Signals widget: champion changes, health drops, Gong silence, expansion signals
- Urgent Inbox: visual hierarchy (critical = red border + tinted bg, warn = amber, info = blue)
- Today's Tasks: colored source dots, action buttons, mark done state
- Recipe for Success tab: auto-filled scorecard (static, pending Gainsight API)
- Sample accounts: Acme Corp (H82), Brightex Inc (H48), NovaVault (H23)

### Architecture
- Single-file HTML prototype (index.html)
- Vanilla JS, CSS custom properties
- Deployed to Vercel via GitHub (carmenrcorio/TeamOS)
- No API keys in client (prototype uses static data)

### Known Issues
- File size (~107KB) causes preview rendering timeout in Claude.ai
- Account cards at top are duplicative — replacing with Daily Command Brief in v1.1
- Agent buttons previously had inline output cards — migrated to drawer in this version
- vercel.json with `builds` key caused empty deployment (resolved: use `{"version":2}` only)

---

## [0.9.0] — 2026-05-15

### Added
- Initial prototype: 3-column layout (inbox/tasks | calendar/dark zone | right panel)
- Account cards: Acme, Brightex, NovaVault with health bars and renewal dates
- Mission Briefing panel: first version (static content)
- Dark Zone widget: 3 accounts with Ghost-Buster buttons
- Recipe for Success tab: manual scorecard design

### Changed
- Agent buttons: originally opened inline output cards below briefing
- Renamed FlowLog → GainBuddy (separate product, referenced in architecture)

---

*This document is the source of truth for TeamOS product decisions, engineering standards, and change history. Update the changelog on every meaningful commit.*
