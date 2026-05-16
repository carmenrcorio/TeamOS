# TeamOS — Product Specification
**Version:** 2.8.1
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
