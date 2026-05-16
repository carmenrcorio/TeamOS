# TeamOS — Product Specification
**Version:** 1.6.0
**Owner:** Carmen Corio
**Status:** Active Development
**Last Updated:** May 16, 2026

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
