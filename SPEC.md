# TeamOS — Product Specification
**Version:** 1.0.0
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
