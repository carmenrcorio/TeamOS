// v4.6.0 — TeamOS QA suite. Covers the major feature surfaces shipped in
// v4.0–v4.5 across all 9 tabs. Browser-agnostic (no UA sniffing). Each test
// starts on a fresh page so localStorage state doesn't leak between cases.
const { test, expect } = require('/opt/node22/lib/node_modules/playwright/test');

test.beforeEach(async ({ page, context }) => {
  // Clear any persisted state from previous runs (templates, notes, etc.).
  await context.clearCookies();
  await page.goto('/index.html');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(200);
});

// ════════════════════════════════════════════════════════════════════════════
// CORE — page load, nav, pulse strip, accessibility primitives
// ════════════════════════════════════════════════════════════════════════════
test.describe('Core', () => {
  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/TeamOS/);
  });

  test('nav has 9 tabs', async ({ page }) => {
    const tabs = await page.locator('.n-tab').allTextContents();
    expect(tabs).toContain('CSM Dashboard');
    expect(tabs).toContain('Recipe for Success');
    expect(tabs).toContain('Risk & Signals');
    expect(tabs).toContain('Forecasting');
    expect(tabs).toContain('Campaigns');
    expect(tabs.length).toBeGreaterThanOrEqual(9);
  });

  test('CSM Dashboard is the default active tab', async ({ page }) => {
    await expect(page.locator('#tab-dash')).toHaveClass(/on/);
  });

  test('pulse strip is centered and has 8 indicators', async ({ page }) => {
    const justify = await page.evaluate(() => getComputedStyle(document.querySelector('.pulse-strip')).justifyContent);
    expect(justify).toBe('center');
    const count = await page.locator('.pulse-strip .ps-wrap').count();
    expect(count).toBeGreaterThanOrEqual(7); // 8 designed; allow slight drift
  });

  test('skip link is the first focusable element', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('skip-link'));
    expect(focused).toBe(true);
  });

  test('nav has role=navigation and aria-label', async ({ page }) => {
    const role = await page.locator('nav.nav').getAttribute('role');
    expect(role).toBe('navigation');
    const label = await page.locator('nav.nav').getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('Service Worker registers', async ({ page }) => {
    // Wait briefly for the SW boot path to fire.
    await page.waitForTimeout(400);
    const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(hasSW).toBe(true);
  });

  test('toast container gets role=alert when fired', async ({ page }) => {
    await page.evaluate(() => toast('Test toast'));
    await page.waitForTimeout(100);
    const role = await page.locator('#toast-el').getAttribute('role');
    expect(role).toBe('alert');
    const live = await page.locator('#toast-el').getAttribute('aria-live');
    expect(live).toBe('assertive');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RECIPE FOR SUCCESS
// ════════════════════════════════════════════════════════════════════════════
test.describe('Recipe for Success', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('recipe', document.querySelector('[onclick*="goTab(\'recipe\'"]')));
    await page.waitForTimeout(200);
  });

  test('hero header renders with title + animated icon', async ({ page }) => {
    await expect(page.locator('.rcp-hero-t')).toHaveText('Recipe for Success');
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.rcp-hero-ic')).animationName);
    expect(anim).toBe('rcp-hero-wobble');
  });

  test('4 metric cards render', async ({ page }) => {
    const cards = await page.locator('.sc-card').count();
    expect(cards).toBe(4);
  });

  test('every metric row has a status pill', async ({ page }) => {
    const rows = await page.locator('.sc-card .sc-row').count();
    const pills = await page.locator('.sc-card .sc-row .sc-stat').count();
    expect(pills).toBe(rows);
  });

  test('legend renders with 3 status keys', async ({ page }) => {
    const dots = await page.locator('.sc-legend-d').count();
    expect(dots).toBe(3);
  });

  test('notes save persists to localStorage', async ({ page }) => {
    await page.fill('#rcp-notes-ta', 'qa-test-note-v4.6');
    await page.click('.rcp-notes-save');
    await page.waitForTimeout(200);
    const persisted = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('teamos_recipe_notes') || '[]').some(n => /qa-test-note-v4.6/.test(n.text))
    );
    expect(persisted).toBe(true);
  });

  test('notes jump button is wired to rcpJumpNotes', async ({ page }) => {
    const onclick = await page.locator('.sc-notes-jump').getAttribute('onclick');
    expect(onclick).toContain('rcpJumpNotes');
  });

  test('history toggle reveals saved-notes section', async ({ page }) => {
    await page.click('#rcp-history-toggle');
    await page.waitForTimeout(120);
    await expect(page.locator('#rcp-history-body')).toHaveClass(/on/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS — sub-nav + segmentation + 3 demo campaigns
// ════════════════════════════════════════════════════════════════════════════
test.describe('Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(200);
  });

  test('sub-nav has 4 tabs', async ({ page }) => {
    const count = await page.locator('.cm-subnav-btn').count();
    expect(count).toBe(4);
  });

  test('Campaigns is default sub-section', async ({ page }) => {
    await expect(page.locator('#cm-tab-campaigns')).toHaveClass(/on/);
    await expect(page.locator('#cm-campaigns')).toHaveClass(/on/);
  });

  test('Contacts sub-tab switches section', async ({ page }) => {
    await page.click('#cm-tab-contacts');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-contacts')).toHaveClass(/on/);
  });

  test('Templates sub-tab switches section', async ({ page }) => {
    await page.click('#cm-tab-templates');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-templates')).toHaveClass(/on/);
  });

  test('Analytics sub-tab switches section', async ({ page }) => {
    await page.click('#cm-tab-analytics');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-analytics')).toHaveClass(/on/);
  });

  test('3 demo campaigns render', async ({ page }) => {
    const count = await page.locator('#cm-campaigns .cm-camp-card').count();
    expect(count).toBe(3);
  });

  test('AI Segmentation panel renders with 7 chips', async ({ page }) => {
    await expect(page.locator('#cm-seg-panel')).toBeVisible();
    const chips = await page.locator('.cm-seg-chip').count();
    expect(chips).toBe(7);
  });

  test('2 of the 7 segments carry the empty marker (SSO Active + SSO+SCIM)', async ({ page }) => {
    // v4.12.0 — 0-count chips no longer use the native `disabled` attribute
    // (they must remain clickable so the FIX 7 wizard-with-banner flow can
    // fire). They carry the .empty class instead.
    const empty = await page.locator('.cm-seg-chip.empty').count();
    expect(empty).toBe(2);
  });

  test('clicking At-Risk segment opens wizard at Step 2 with filters', async ({ page }) => {
    await page.evaluate(() => cmSegmentClick('at-risk'));
    await page.waitForTimeout(250);
    const state = await page.evaluate(() => ({
      stepLabel: document.querySelector('.cm-wiz-step-l')?.textContent,
      health: CM_WIZ?.filterHealth,
      renewal: CM_WIZ?.filterRenewal,
      contacts: CM_WIZ?.contacts.length,
      template: CM_WIZ?.template
    }));
    expect(state.stepLabel).toContain('Step 2');
    expect(state.health).toBe('critical');
    expect(state.renewal).toBe('60');
    expect(state.contacts).toBe(2);
    expect(state.template).toBe('t3');
  });

  test('Analytics time period filter binds to real datasets', async ({ page }) => {
    await page.evaluate(() => cmShowSection('analytics'));
    await page.waitForTimeout(150);
    const q = await page.locator('.cm-sum-v').first().textContent();
    expect(q).toBe('847');
    await page.evaluate(() => cmSetAnalyticsPeriod('week'));
    await page.waitForTimeout(120);
    const w = await page.locator('.cm-sum-v').first().textContent();
    expect(w).toBe('48');
    await page.evaluate(() => cmSetAnalyticsPeriod('alltime'));
    await page.waitForTimeout(120);
    const all = await page.locator('.cm-sum-v').first().textContent();
    expect(all).toBe('1,204');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGN MANAGER — drawers, modals, wizard
// ════════════════════════════════════════════════════════════════════════════
test.describe('Campaign Manager actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(200);
  });

  test('View button opens right-side drawer with stat tiles + sequence + contacts', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(250);
    await expect(page.locator('#cm-cv-drawer')).toHaveClass(/on/);
    expect(await page.locator('#cm-cv-drawer .cm-stat-tile').count()).toBe(4);
    expect(await page.locator('#cm-cv-drawer .cm-view-seq-row').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('#cm-cv-drawer .cm-cnt-tbl tbody tr').count()).toBeGreaterThanOrEqual(3);
  });

  test('Escape closes the View drawer', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(250);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const isOn = await page.evaluate(() => document.getElementById('cm-cv-drawer')?.classList.contains('on'));
    expect(isOn).toBe(false);
  });

  test('Duplicate creates a new DRAFT card', async ({ page }) => {
    const before = await page.evaluate(() => CM_CAMPAIGNS.length);
    await page.evaluate(() => cmCampDuplicate('cmp1'));
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => CM_CAMPAIGNS.length);
    expect(after).toBe(before + 1);
    const firstName = await page.evaluate(() => CM_CAMPAIGNS[0].name);
    expect(firstName).toMatch(/^Copy of/);
    const firstStatus = await page.evaluate(() => CM_CAMPAIGNS[0].status);
    expect(firstStatus).toBe('draft');
  });

  test('Archive shows confirm strip, then sets status to archived', async ({ page }) => {
    await page.evaluate(() => cmCampArchive('cmp1'));
    await page.waitForTimeout(150);
    const confirmOn = await page.locator('.cm-camp-card[data-id="cmp1"] .cm-card-confirm.on').count();
    expect(confirmOn).toBe(1);
    await page.evaluate(() => cmCampArchiveConfirm('cmp1'));
    await page.waitForTimeout(450);
    const status = await page.evaluate(() => CM_CAMPAIGNS.find(c => c.id === 'cmp1').status);
    expect(status).toBe('archived');
  });

  test('Add Contact modal opens with required Email field', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    await expect(page.locator('#cm-ac-em')).toBeVisible();
    const required = await page.locator('#cm-ac-em').getAttribute('aria-required');
    expect(required).toBe('true');
  });

  test('Add Contact save validates required Email then persists', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    // No email → validation error
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(100);
    await expect(page.locator('#cm-ac-em-err')).toHaveClass(/on/);
    // With email + first name (both required as of v4.11.0) → persists
    await page.fill('#cm-ac-fn', 'QA');
    await page.fill('#cm-ac-em', 'qa-test@example.com');
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(150);
    const exists = await page.evaluate(() => CM_CONTACTS.some(c => c.email === 'qa-test@example.com'));
    expect(exists).toBe(true);
  });

  test('Template Builder modal opens with variable picker', async ({ page }) => {
    await page.evaluate(() => cmShowSection('templates'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmNewTemplate());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    await expect(page.locator('#cm-tb-nm')).toBeVisible();
    await expect(page.locator('.cm-tb-vars-wrap')).toBeVisible();
  });

  test('Add to Campaign requires explicit picker selection', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.evaluate(() => cmAddToCampaign('c1'));
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    const items = await page.locator('.cm-pick-item').count();
    expect(items).toBeGreaterThanOrEqual(2);
  });

  test('Schedule wizard opens date/time/timezone picker', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name = 'QA'; CM_WIZ.type = 'renewal'; CM_WIZ.contacts = ['c3']; CM_WIZ.template = 't3'; CM_WIZ.step = 5; cmWizRender(); });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSchedule());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-sch-date')).toBeVisible();
    await expect(page.locator('#cm-sch-time')).toBeVisible();
    await expect(page.locator('#cm-sch-tz')).toBeVisible();
  });

  test('Send opens confirmation modal with reviewable recipient list', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='QA'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3','c4']; CM_WIZ.template='t3'; CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(150);
    // v4.18.0 — pre-fill per-contact drafts so cmFindWizardUnfilled finds no
    // unfilled placeholders (template t3 carries {{value_delivered}} which
    // expands to a bracketed placeholder by default).
    await page.evaluate(() => {
      CM_WIZ.drafts = {
        c3: { subject:'Sarah subject', body:'Sarah body — fully filled.' },
        c4: { subject:'Marcus subject', body:'Marcus body — fully filled.' }
      };
    });
    await page.evaluate(() => cmWizSend());
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    const rows = await page.locator('.cm-send-row').count();
    expect(rows).toBe(2);
  });

  test('AI Draft generator produces editable preview for first contact', async ({ page }) => {
    await page.evaluate(() => cmSegmentClick('at-risk'));
    await page.waitForTimeout(250);
    await page.evaluate(() => { CM_WIZ.step = 3; cmWizRender(); });
    await page.waitForTimeout(150);
    await page.click('#cm-ai-gen-btn');
    await page.waitForTimeout(1800);
    await expect(page.locator('#cm-ai-draft')).toHaveClass(/on/);
    const subj = await page.locator('#cm-ai-subj').textContent();
    expect(subj).toMatch(/renewal/i);
    await expect(page.locator('#cm-ai-body')).toBeVisible();
  });

  test('Wizard Step 2 health filter narrows contact list', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; cmWizRender(); });
    await page.evaluate(() => cmWizNext());
    await page.waitForTimeout(200);
    const allCount = await page.locator('.cm-wiz-ov.on .cm-wiz-cnt-item').count();
    expect(allCount).toBeGreaterThanOrEqual(10);
    await page.evaluate(() => cmWizSetFilter('filterHealth', 'critical'));
    await page.waitForTimeout(150);
    const critCount = await page.locator('.cm-wiz-ov.on .cm-wiz-cnt-item').count();
    expect(critCount).toBeLessThan(allCount);
    expect(critCount).toBeGreaterThanOrEqual(1);
  });

  test('Wizard Step 2 groups contacts by account', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; cmWizRender(); });
    await page.evaluate(() => cmWizNext());
    await page.waitForTimeout(200);
    const groups = await page.locator('.cm-wiz-grp').count();
    expect(groups).toBeGreaterThanOrEqual(2);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// RISK & SIGNALS
// ════════════════════════════════════════════════════════════════════════════
test.describe('Risk & Signals', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.waitForTimeout(200);
  });

  test('sub-nav has 5 tabs', async ({ page }) => {
    expect(await page.locator('.rs-subnav-btn').count()).toBe(5);
  });

  test('Risk Matrix renders 6 account dots', async ({ page }) => {
    expect(await page.locator('.rs-mx-dot').count()).toBe(6);
  });

  test('clicking a matrix dot loads the snapshot panel', async ({ page }) => {
    await page.evaluate(() => rsMxSelect('nova'));
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-mx-detail .rs-mx-detail-nm')).toHaveText(/NovaVault/);
    expect(await page.locator('#rs-mx-detail .rs-mx-acts .rs-btn').count()).toBe(3);
  });

  test('All Signals lists 11 signals with title-case severity badges', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(200);
    expect(await page.locator('.rs-sev').count()).toBe(11);
    const first = await page.locator('.rs-sev').first().textContent();
    expect(first).toMatch(/Critical/);
  });

  test('Critical filter narrows to 3 signals', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(200);
    await page.evaluate(() => rsSigFilter('crit'));
    await page.waitForTimeout(150);
    expect(await page.locator('.rs-sig-row').count()).toBe(3);
  });

  test('Save Plays renders 2 cards with 5 steps each', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(200);
    expect(await page.locator('.rs-play-card').count()).toBe(2);
    expect(await page.locator('.rs-pl-step').count()).toBe(10);
  });

  test('Champion Tracker has Ryan Patel in Apex card', async ({ page }) => {
    await page.evaluate(() => rsShow('champions'));
    await page.waitForTimeout(200);
    const text = await page.locator('#rs-sec-champions').textContent();
    expect(text).toContain('Ryan Patel');
    expect(await page.locator('.rs-champ-card').count()).toBe(2);
  });

  test('Dark Zone has 3 cards with status selects', async ({ page }) => {
    await page.evaluate(() => rsShow('dark'));
    await page.waitForTimeout(200);
    expect(await page.locator('.rs-dark-card').count()).toBe(3);
    expect(await page.locator('#rs-sec-dark select').count()).toBe(3);
  });

  test('Meridian dark card flags the inbound signal', async ({ page }) => {
    await page.evaluate(() => rsShow('dark'));
    await page.waitForTimeout(200);
    expect(await page.locator('.rs-dark-card.inbound').count()).toBe(1);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// FORECASTING
// ════════════════════════════════════════════════════════════════════════════
test.describe('Forecasting', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('forecast', document.querySelector('[onclick*="goTab(\'forecast\'"]')));
    await page.waitForTimeout(200);
  });

  test('sub-nav has 4 tabs', async ({ page }) => {
    expect(await page.locator('.fc-subnav-btn').count()).toBe(4);
  });

  test('Pipeline table has 6 rows', async ({ page }) => {
    expect(await page.locator('.fc-pipe-tbl tbody tr').count()).toBe(6);
  });

  test('Forecast $ column is present by default', async ({ page }) => {
    const headers = await page.locator('.fc-pipe-tbl thead th').allTextContents();
    expect(headers.some(h => h.indexOf('Forecast ($)') !== -1)).toBe(true);
  });

  test('Forecast $ override persists to localStorage with Phase-2 shape', async ({ page }) => {
    await page.evaluate(() => fcSaveOverride('nova', '28000'));
    await page.waitForTimeout(150);
    const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('teamos_forecast_overrides')).nova);
    expect(rec.forecast_amount).toBe(28000);
    expect(rec.display_name).toBe('NovaVault');
    expect(rec.gainsight_renewal_id).toBe('PENDING_OAUTH');
    expect(rec.salesforce_opp_id).toBe('PENDING_OAUTH');
    expect(rec.quarter).toBe('Q2-2026');
    expect(typeof rec.updated_at).toBe('string');
  });

  test('Forecast Status change stamps a timestamp + 2s pending pulse', async ({ page }) => {
    await page.evaluate(() => fcSetStatus('acme', 'committed'));
    await page.waitForTimeout(100);
    expect(await page.locator('.fc-pipe-status-pending').count()).toBeGreaterThan(0);
    await page.waitForTimeout(2200);
    const meta = await page.locator('.fc-pipe-status-meta').first().textContent();
    expect(meta).toMatch(/\d+:\d+/);
  });

  test('Ghost-Buster Meridian opens the in-tab Ghost-Buster drawer', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'meridian'));
    await page.waitForTimeout(400);
    // v4.13.0 — Ghost-Buster now opens as a fixed right-side drawer (so the
    // CSM stays on the Forecasting tab) rather than navigating to the
    // dashboard's view-{acct} panel.
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/Meridian/);
    // Stayed on Forecasting tab.
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
  });

  test('Ghost-Buster Creston opens the in-tab Ghost-Buster drawer', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'creston'));
    await page.waitForTimeout(400);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/Creston/);
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
  });

  test('Champion Protocol Apex passes own account key (not Brightex)', async ({ page }) => {
    await page.evaluate(() => { window._captured = null; window.openAgentDrawer = (a,b) => { window._captured = [a,b]; }; });
    await page.evaluate(() => fcAction('champion', 'apex'));
    const captured = await page.evaluate(() => window._captured);
    expect(captured).toEqual(['save', 'apex']);
  });

  test('all 6 pipeline action buttons pass their own row key', async ({ page }) => {
    const onclicks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#fc-pipeline .fc-pipe-tbl tbody tr')).map(r =>
        r.querySelector('td:last-child button')?.getAttribute('onclick') || null
      )
    );
    expect(onclicks).toEqual([
      "fcAction('save','nova')",
      "fcAction('risk','brightex')",
      "fcAction('gb','meridian')",
      "fcAction('gb','creston')",
      "fcAction('champion','apex')",
      "fcAction('prep','acme')",
    ]);
  });

  test('Reply modal opens for Meridian with Jennifer template', async ({ page }) => {
    await page.evaluate(() => fcOpenReply('meridian'));
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    const body = await page.locator('#fc-reply-body').inputValue();
    expect(body).toMatch(/Jennifer/);
  });

  test('Timeline account link opens in-tab drawer (no page nav)', async ({ page }) => {
    await page.evaluate(() => fcShowSection('timeline'));
    await page.waitForTimeout(200);
    await page.evaluate(() => fcOpenAcctDrawer('nova'));
    await page.waitForTimeout(200);
    await expect(page.locator('#fc-acct-drawer')).toHaveClass(/on/);
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
  });

  test('Dust Forecast commit rollup renders with quota gap', async ({ page }) => {
    await page.evaluate(() => fcShowSection('dust'));
    await page.waitForTimeout(200);
    await expect(page.locator('.fc-rollup')).toBeVisible();
    expect(await page.locator('.fc-rollup-cell').count()).toBe(3);
    await page.evaluate(() => fcOpenQuotaForm());
    await page.waitForTimeout(100);
    await page.fill('#fc-quota-input', '150');
    await page.evaluate(() => fcSaveQuota());
    await page.waitForTimeout(150);
    const quotaSaved = await page.evaluate(() => parseInt(localStorage.getItem('teamos_forecast_quota'), 10));
    expect(quotaSaved).toBe(150000);
  });

  test('Pipeline column picker has 15 items', async ({ page }) => {
    await page.evaluate(() => fcColsTogglePop());
    await page.waitForTimeout(120);
    expect(await page.locator('.fc-cols-pop .fc-cols-item').count()).toBe(15);
  });

  test('toggling a hidden column adds it to the table', async ({ page }) => {
    const before = await page.locator('.fc-pipe-tbl thead th').count();
    await page.evaluate(() => fcColsToggle('tier'));
    await page.waitForTimeout(150);
    const after = await page.locator('.fc-pipe-tbl thead th').count();
    expect(after).toBe(before + 1);
  });

  // ─── v4.7.0 additions ──────────────────────────────────────────────────
  test('v4.7.0: FORECAST_STATUS_CROSSWALK constant exposes Gainsight mapping', async ({ page }) => {
    const map = await page.evaluate(() => FORECAST_STATUS_CROSSWALK);
    expect(map['Committed']).toBe('Commit');
    expect(map['On Track']).toBe('Best Case');
    expect(map['At Risk']).toBe('Pipeline');
    expect(map['Likely Churn']).toBe('Omitted');
    expect(map['Expansion Likely']).toBe('Best Case');
    expect(map['Pushed to Next Quarter']).toBe('Omitted');
    expect(map['Unknown']).toBe('Pipeline');
  });

  test('v4.7.0: legacy { key: number } overrides migrate to Phase-2 shape on read', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('teamos_forecast_overrides', JSON.stringify({ acme: 50000 }));
    });
    await page.reload();
    await page.evaluate(() => goTab('forecast', document.querySelector('[onclick*="goTab(\'forecast\'"]')));
    await page.waitForTimeout(300);
    const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem('teamos_forecast_overrides')).acme);
    expect(typeof migrated).toBe('object');
    expect(migrated.forecast_amount).toBe(50000);
    expect(migrated.gainsight_renewal_id).toBe('PENDING_OAUTH');
  });

  test('v4.7.0: Timeline card click navigates to Pipeline + highlights the row', async ({ page }) => {
    await page.evaluate(() => fcShowSection('timeline'));
    await page.waitForTimeout(200);
    await page.evaluate(() => fcJumpToPipelineRow('nova'));
    await page.waitForTimeout(250);
    await expect(page.locator('#fc-pipeline')).toHaveClass(/on/);
    const highlighted = await page.locator('.fc-pipe-tbl tbody tr.fc-row-highlight').count();
    expect(highlighted).toBe(1);
    // Highlight clears after ~2s
    await page.waitForTimeout(2100);
    const stillHighlighted = await page.locator('.fc-pipe-tbl tbody tr.fc-row-highlight').count();
    expect(stillHighlighted).toBe(0);
  });

  test('v4.7.0: ARR Trends account row click navigates to Pipeline', async ({ page }) => {
    await page.evaluate(() => fcShowSection('trends'));
    await page.waitForTimeout(200);
    // Click the second row (Brightex). Use evaluate to bypass timing.
    await page.evaluate(() => {
      const rows = document.querySelectorAll('#fc-arrtrends .fc-acct-tbl tbody tr');
      // Find the Brightex Inc row by label
      for (const r of rows) {
        if (/Brightex Inc/.test(r.textContent)) { r.click(); break; }
      }
    });
    await page.waitForTimeout(250);
    await expect(page.locator('#fc-pipeline')).toHaveClass(/on/);
    const highlighted = await page.locator('.fc-pipe-tbl tbody tr.fc-row-highlight').count();
    expect(highlighted).toBe(1);
  });

  test('v4.7.0: ARR Trends chart bars show a tooltip on hover', async ({ page }) => {
    await page.evaluate(() => fcShowSection('trends'));
    await page.waitForTimeout(200);
    // Trigger the May column via direct API call (avoids hover-rect timing flakes)
    await page.evaluate(() => {
      const col = document.querySelector('[data-month="May"]');
      const rect = col.getBoundingClientRect();
      fcTrendBarTip({ currentTarget: col }, 'May');
    });
    await page.waitForTimeout(150);
    await expect(page.locator('#fc-trend-tip')).toHaveClass(/on/);
    const txt = await page.locator('#fc-trend-tip').textContent();
    expect(txt).toContain('May');
    expect(txt).toMatch(/Healthy/);
    expect(txt).toMatch(/At risk/);
    expect(txt).toMatch(/Dark/);
  });

  test('v4.7.0: Copy Forecast Summary button generates dynamic clipboard text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(() => fcShowSection('dust'));
    await page.waitForTimeout(200);
    await expect(page.locator('#fc-copy-summary-btn')).toBeVisible();
    const summary = await page.evaluate(() => fcBuildForecastSummary());
    expect(summary).toContain('Q2 2026 Forecast');
    expect(summary).toContain('Carmen Corio');
    expect(summary).toMatch(/Commit: \$\d+K/);
    expect(summary).toMatch(/At Risk: \$\d+K/);
    expect(summary).toContain('NovaVault');
    expect(summary).toContain('Acme Corp');
  });

  test('v4.7.0: Pipeline action buttons audit — every row passes own accountKey', async ({ page }) => {
    // Same as the v4.6.0 audit but kept under v4.7.0 to flag any regression
    // if a future row hardcodes a different key.
    const onclicks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#fc-pipeline .fc-pipe-tbl tbody tr')).map(r =>
        r.querySelector('td:last-child button')?.getAttribute('onclick') || null
      )
    );
    const expected = ['nova', 'brightex', 'meridian', 'creston', 'apex', 'acme'];
    onclicks.forEach((click, i) => {
      expect(click).toContain("'" + expected[i] + "'");
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY — escape, focus, contrast (per v3.4.0/v4.5.0)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Accessibility', () => {
  test('Escape closes the cm modal overlay', async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(200);
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(100);
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const isOn = await page.evaluate(() => document.getElementById('cm-modal-ov')?.classList.contains('on'));
    expect(isOn).toBe(false);
  });

  test('Escape closes the campaign wizard', async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(200);
    await page.evaluate(() => cmOpenWizard());
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const isOn = await page.evaluate(() => document.getElementById('cm-wiz-ov')?.classList.contains('on'));
    expect(isOn).toBe(false);
  });

  test('Escape closes the forecasting account drawer', async ({ page }) => {
    await page.evaluate(() => goTab('forecast', document.querySelector('[onclick*="goTab(\'forecast\'"]')));
    await page.waitForTimeout(200);
    await page.evaluate(() => fcShowSection('timeline'));
    await page.waitForTimeout(100);
    await page.evaluate(() => fcOpenAcctDrawer('nova'));
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const isOn = await page.evaluate(() => document.getElementById('fc-acct-drawer')?.classList.contains('on'));
    expect(isOn).toBe(false);
  });

  test('CSP meta tag is present', async ({ page }) => {
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    expect(csp).toBe(1);
  });

  test('zero console errors during full nav sweep', async ({ page }) => {
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/CERT_AUTHORITY|frame-ancestors|X-Frame-Options/.test(m.text())) errs.push(m.text()); });
    for (const tab of ['recipe','myacct','risk','forecast','success','team','campaigns','analytics','dash']) {
      await page.evaluate((t) => {
        var el = document.querySelector('[onclick*="goTab(\'' + t + '\'"]');
        if (el) goTab(t, el);
      }, tab);
      await page.waitForTimeout(150);
    }
    expect(errs).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.8.0 — Campaign Manager follow-up
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.8.0 Campaign Manager fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(200);
  });

  test('FIX 1: 0-count segment chip carries hover tooltip + click opens wizard (v4.12.0)', async ({ page }) => {
    // The tooltip element is mounted in DOM with role=tooltip and is shown
    // on hover/focus through a pure CSS rule. The click handler now opens
    // the wizard with the empty-segment banner (v4.12.0 changed behavior
    // from tooltip-only → click opens wizard with banner).
    expect(await page.locator('#cm-seg-empty-unengaged-sso').count()).toBe(1);
    expect(await page.locator('#cm-seg-empty-unengaged-sso').getAttribute('role')).toBe('tooltip');
    await page.evaluate(() => cmSegmentClick('unengaged-sso', new Event('click')));
    await page.waitForTimeout(200);
    const wizOpen = await page.evaluate(() => document.getElementById('cm-wiz-ov')?.classList.contains('on'));
    expect(wizOpen).toBe(true);
    // Empty segments land at Step 1 so the CSM can name the future campaign
    // first; the banner shows in Step 2.
    const step = await page.evaluate(() => CM_WIZ && CM_WIZ.step);
    expect(step).toBe(1);
    expect(await page.evaluate(() => CM_WIZ && CM_WIZ.segmentEmpty)).toBe(true);
    // Advance to Step 2 and assert the banner.
    await page.evaluate(() => { CM_WIZ.step = 2; cmWizRender(); });
    await page.waitForTimeout(150);
    const banner = await page.locator('.cm-wiz-empty-banner').count();
    expect(banner).toBe(1);
    const txt = await page.locator('.cm-wiz-empty-banner').textContent();
    expect(txt).toMatch(/No matching accounts found yet/);
  });

  test('FIX 2: EBR Overdue chip surfaces filter context note in Step 2', async ({ page }) => {
    await page.evaluate(() => cmSegmentClick('ebr-overdue', new Event('click')));
    await page.waitForTimeout(250);
    await expect(page.locator('.cm-wiz-ctx-note')).toBeVisible();
    const note = await page.locator('.cm-wiz-ctx-note').textContent();
    expect(note).toMatch(/no EBR completed this quarter/i);
    await expect(page.locator('.cm-wiz-display-chip.ebr')).toBeVisible();
    const chipTxt = await page.locator('.cm-wiz-display-chip.ebr').textContent();
    expect(chipTxt).toMatch(/EBR Status/);
  });

  test('FIX 4: Pause shows inline confirm + on confirm sets PAUSED + Resume button', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(250);
    // Click Pause
    await page.evaluate(() => cmCampPause('cmp1'));
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-cv-drawer .cm-card-confirm.pause')).toBeVisible();
    // Confirm
    await page.evaluate(() => cmCampPauseConfirm('cmp1'));
    await page.waitForTimeout(200);
    const status = await page.evaluate(() => CM_CAMPAIGNS.find(c => c.id === 'cmp1').status);
    expect(status).toBe('paused');
    const btnText = await page.locator('#cm-cv-drawer .cm-drawer-foot button').first().textContent();
    expect(btnText).toMatch(/Resume Campaign/);
  });

  test('FIX 5: Archive from drawer shows confirm strip + on confirm closes drawer', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(250);
    await page.evaluate(() => cmCampArchive('cmp1'));
    await page.waitForTimeout(150);
    const strip = await page.locator('#cm-cv-drawer .cm-card-confirm').count();
    expect(strip).toBe(1);
    await page.evaluate(() => cmCampArchiveConfirm('cmp1'));
    await page.waitForTimeout(400);
    const drawerOpen = await page.evaluate(() => document.getElementById('cm-cv-drawer')?.classList.contains('on'));
    expect(drawerOpen).toBeFalsy();
    const status = await page.evaluate(() => CM_CAMPAIGNS.find(c => c.id === 'cmp1').status);
    expect(status).toBe('archived');
  });

  test('FIX 6: Export List builds a CSV with the right columns + row count', async ({ page }) => {
    // Stub URL.createObjectURL to capture the blob content
    const csv = await page.evaluate(async () => {
      var captured = null;
      var origCreate = URL.createObjectURL;
      URL.createObjectURL = function(blob){
        return new Promise(function(resolve){
          var r = new FileReader();
          r.onload = function(){ captured = r.result; resolve('blob:fake'); };
          r.readAsText(blob);
          // Synchronous fallback for test
        }).then ? 'blob:fake' : 'blob:fake';
      };
      // Direct text extraction via FileReader sync workaround
      var blobText = null;
      URL.createObjectURL = function(blob){
        blob.text().then(function(t){ window._csvCaptured = t; });
        return 'blob:fake';
      };
      cmCampExport('cmp1');
      await new Promise(function(r){ setTimeout(r, 200); });
      return window._csvCaptured;
    });
    expect(csv).toContain('Contact,Account,Email,Touch Reached,Status,Last Activity');
    const lines = csv.trim().split(/\r?\n/);
    expect(lines.length).toBeGreaterThanOrEqual(9); // header + 8 contacts
  });

  test('FIX 7: cmOpenAddContact alias opens the Add Contact modal', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(150);
    const t = await page.evaluate(() => typeof cmOpenAddContact);
    expect(t).toBe('function');
    await page.evaluate(() => cmOpenAddContact());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    await expect(page.locator('#cm-ac-em')).toBeVisible();
  });

  test('FIX 8: Active filter shows only enrolled / replied contacts', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmSetCntFilter('active'));
    await page.waitForTimeout(150);
    const count = await page.locator('#cm-cnt-list .cm-cnt-row').count();
    // Only 2 in-sequence contacts seeded (Sarah Chen, Michael Torres). No
    // "not enrolled" should appear.
    expect(count).toBe(2);
    const names = await page.locator('#cm-cnt-list .cm-cnt-nm').allTextContents();
    expect(names.some(n => /Sarah Chen/.test(n))).toBe(true);
    expect(names.some(n => /Michael Torres/.test(n))).toBe(true);
  });

  test('FIX 9: Analytics row click opens campaign detail drawer', async ({ page }) => {
    await page.evaluate(() => cmShowSection('analytics'));
    await page.waitForTimeout(200);
    await page.evaluate(() => cmAnalyticsRowClick('cmp1', new Event('click')));
    await page.waitForTimeout(250);
    await expect(page.locator('#cm-tab-campaigns')).toHaveClass(/on/);
    await expect(page.locator('#cm-cv-drawer')).toHaveClass(/on/);
    const nm = await page.locator('#cm-cv-drawer .cm-drawer-nm').textContent();
    expect(nm).toMatch(/June Renewal Push/);
  });

  test('FIX 10: Step 2 search debounce — full words filter correctly', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(200);
    // Type "jennifer" character by character via .fill (single set)
    await page.fill('#cm-wiz-search', 'jennifer');
    await page.waitForTimeout(250); // > 150ms debounce
    const rows = await page.locator('.cm-wiz-cnt-item').count();
    // Jennifer Ramos (Meridian) + Jennifer Moss (Klaxton) — both contain "jennifer"
    expect(rows).toBeGreaterThanOrEqual(2);
    // Also check the search input still has the full word
    const val = await page.locator('#cm-wiz-search').inputValue();
    expect(val).toBe('jennifer');
  });

  test('FIX 11: Step 3 + Step 5 render editable preview with contact switcher', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3','c4','c5']; CM_WIZ.template='t3'; CM_WIZ.step=3; cmWizRender(); });
    await page.waitForTimeout(200);
    // Step 3 has the switcher
    await expect(page.locator('.cm-prev-switcher').first()).toBeVisible();
    const count = await page.locator('.cm-prev-switcher-count').first().textContent();
    expect(count).toContain('1 of 3');
    // Body is editable
    await expect(page.locator('#cm-prev-body-s3')).toBeVisible();
    // Cycle to next contact
    await page.evaluate(() => cmCyclePreview(1));
    await page.waitForTimeout(150);
    const count2 = await page.locator('.cm-prev-switcher-count').first().textContent();
    expect(count2).toContain('2 of 3');
    // Edit the body — saves to CM_WIZ.drafts
    await page.evaluate(() => {
      var ta = document.getElementById('cm-prev-body-s3');
      ta.value = 'Custom edited body for c4';
      ta.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(100);
    const saved = await page.evaluate(() => CM_WIZ.drafts && CM_WIZ.drafts.c4 && CM_WIZ.drafts.c4.body);
    expect(saved).toContain('Custom edited body for c4');
    // Reset clears the draft
    await page.evaluate(() => cmResetDraft('c4'));
    await page.waitForTimeout(100);
    const cleared = await page.evaluate(() => !!(CM_WIZ.drafts && CM_WIZ.drafts.c4));
    expect(cleared).toBe(false);
    // Step 5 has the same switcher
    await page.evaluate(() => { CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-prev-body-s5')).toBeVisible();
  });

  test('FIX 11: drafts flush to localStorage on save/send/schedule', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name='QA Drafts'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3']; CM_WIZ.template='t3'; CM_WIZ.step=5;
      CM_WIZ.drafts = { c3: { subject:'Custom', body:'Custom body for Sarah' } };
      cmWizRender();
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSaveDraft());
    await page.waitForTimeout(200);
    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('teamos_campaign_drafts')); } catch (e) { return null; }
    });
    expect(stored).toBeTruthy();
    // The new campaign id is the newest one
    const newId = await page.evaluate(() => CM_CAMPAIGNS[0].id);
    expect(stored[newId]).toBeTruthy();
    expect(stored[newId].c3.body).toBe('Custom body for Sarah');
  });

  test('FEATURE: contact detail panel surfaces SSO / SCIM / ARR / last-active', async ({ page }) => {
    await page.evaluate(() => cmShowSection('contacts'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmSelectContact('c1')); // David Kim · Acme
    await page.waitForTimeout(150);
    const body = await page.locator('#cm-cnt-detail').textContent();
    expect(body).toMatch(/SSO Status/);
    expect(body).toMatch(/Deployed/);
    expect(body).toMatch(/SCIM Status/);
    expect(body).toMatch(/Active/);
    expect(body).toMatch(/\$48K/);
    expect(body).toMatch(/Last active in 1Password/);
    expect(body).toMatch(/May 15/);
  });

  test('FEATURE: wizard Step 2 group headers show SSO + ARR per account', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(200);
    const acmeMeta = await page.evaluate(() => {
      var groups = document.querySelectorAll('.cm-wiz-grp');
      for (var i = 0; i < groups.length; i++) {
        if (/ACME CORP/.test(groups[i].textContent)) {
          return groups[i].querySelector('.cm-wiz-grp-meta')?.textContent || null;
        }
      }
      return null;
    });
    expect(acmeMeta).toMatch(/SSO/);
    expect(acmeMeta).toMatch(/Deployed/);
    expect(acmeMeta).toMatch(/\$48K/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.9.0 — RISK & SIGNALS FOLLOW-UP FIXES (FIX 1–10)
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.9.0 Risk & Signals fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.waitForTimeout(150);
  });

  test('FIX 1: rsOpenGB opens the in-tab drawer without leaving Risk & Signals', async ({ page }) => {
    // v4.13.0 — Ghost-Buster now opens a fixed-position drawer overlay; the
    // CSM stays on the Risk & Signals tab.
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(200);
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/Meridian/);
  });

  test('FIX 1: openGhostBuster global alias routes through the drawer', async ({ page }) => {
    const exists = await page.evaluate(() => typeof window.openGhostBuster === 'function');
    expect(exists).toBe(true);
    await page.evaluate(() => window.openGhostBuster('creston'));
    await page.waitForTimeout(200);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/Creston/);
  });

  test('FIX 2: Brightex Draft Reply opens email compose modal', async ({ page }) => {
    await page.evaluate(() => rsDraftReplyBrightex());
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-modal-ov.on')).toBeVisible();
    const role = await page.locator('#cm-modal').getAttribute('role');
    expect(role).toBe('dialog');
    const aria = await page.locator('#cm-modal').getAttribute('aria-modal');
    expect(aria).toBe('true');
    const body = await page.locator('#cm-modal-body').textContent();
    expect(body).toContain('sarah.chen@brightex.com');
    expect(body).toContain('Re: SLA question — Brightex');
    expect(body).toContain('{{meeting_link}}');
    // 3 footer buttons: Cancel · Copy Draft · Mark as Sent
    expect(await page.locator('#cm-modal-foot button').count()).toBe(3);
  });

  test('FIX 2: Mark as Sent fires the spec toast + closes the modal', async ({ page }) => {
    await page.evaluate(() => rsDraftReplyBrightex());
    await page.waitForTimeout(150);
    await page.evaluate(() => rsMailMarkSent());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov.on')).toHaveCount(0);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Reply sent · Brightex · Gainsight logged/);
  });

  test('FIX 2: Escape closes the Brightex draft modal', async ({ page }) => {
    await page.evaluate(() => rsDraftReplyBrightex());
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov.on')).toHaveCount(0);
  });

  test('FIX 3: Add Note reveals inline textarea + Save adds a note row', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsPlayNote('nova'));
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-note-form-nova.on')).toBeVisible();
    await expect(page.locator('#rs-note-ta-nova')).toBeVisible();
    await page.evaluate(() => { document.getElementById('rs-note-ta-nova').value = 'QA note — Torres callback Tuesday'; });
    await page.evaluate(() => rsPlayNoteSave(null, 'nova'));
    await page.waitForTimeout(150);
    // Form collapsed
    await expect(page.locator('#rs-note-form-nova.on')).toHaveCount(0);
    // Note row appears
    const rows = await page.locator('.rs-play-card .rs-note-row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Note saved/);
    expect(t).toMatch(/Gainsight timeline/);
  });

  test('FIX 4: Escalate to TL fires the spec toast wording', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsPlayEscalate('brightex'));
    await page.waitForTimeout(100);
    const t = await page.locator('#toast-el').textContent();
    // v4.13.0 — wording updated from "Dust summary attached" to
    // "Escalation summary attached" per the spec.
    expect(t).toMatch(/Situation brief sent to Team Lead · Brightex · Escalation summary attached/);
  });

  test('FIX 5: clicking matrix dot does not tear down the detail panel buttons', async ({ page }) => {
    // Select NovaVault. Then assert the Open Save Play button is still present
    // in the SAME panel without an intervening render of the dots.
    await page.evaluate(() => rsMxSelect('nova'));
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => document.querySelector('#rs-mx-detail .rs-mx-acts').outerHTML);
    // Click immediately on the Save Play button (single click).
    await page.click('#rs-mx-detail .rs-mx-acts .rs-btn:has-text("Open Save Play")');
    await page.waitForTimeout(200);
    // The agent drawer should now be open.
    await expect(page.locator('#drawer.on')).toBeVisible();
    const titleEl = await page.locator('#drawer-title').textContent();
    expect(titleEl).toMatch(/Save Strategy|NovaVault/i);
    expect(before).toMatch(/Open Save Play/);
  });

  test('FIX 6: calls today KPI navigates to CSM Dashboard', async ({ page }) => {
    // Make sure we start somewhere else so the navigation is observable.
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.evaluate(() => rsKpiCalls());
    await page.waitForTimeout(150);
    await expect(page.locator('#tab-dash')).toHaveClass(/on/);
  });

  test('FIX 6: at-risk KPI opens Risk Matrix + pulses 2 bubbles', async ({ page }) => {
    await page.evaluate(() => goTab('dash', document.querySelector('[onclick*="goTab(\'dash\'"]')));
    await page.evaluate(() => rsKpiRisk());
    await page.waitForTimeout(200);
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
    await expect(page.locator('#rs-sec-matrix.on')).toBeVisible();
    expect(await page.locator('.rs-mx-dot.pulse-ring').count()).toBe(2);
  });

  test('FIX 6: ARR at risk KPI sets critHigh filter on All Signals', async ({ page }) => {
    await page.evaluate(() => rsKpiARR());
    await page.waitForTimeout(200);
    await expect(page.locator('#rs-sec-signals.on')).toBeVisible();
    const filter = await page.evaluate(() => RS_SIG_FILTER);
    expect(filter).toBe('critHigh');
    // critHigh = 3 critical + 6 high (after FIX 7 elevation) = 9 rows.
    expect(await page.locator('.rs-sig-row').count()).toBe(9);
  });

  test('FIX 6: overdue CTAs KPI opens slide-over with 3 rows + Mark complete', async ({ page }) => {
    await page.evaluate(() => rsKpiCTAs());
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-slide-ov.on')).toBeVisible();
    const role = await page.locator('#rs-slide').getAttribute('role');
    expect(role).toBe('dialog');
    const aria = await page.locator('#rs-slide').getAttribute('aria-modal');
    expect(aria).toBe('false');
    expect(await page.locator('#rs-slide-body .rs-slide-row').count()).toBe(3);
    await page.evaluate(() => rsCTAComplete('ovc-1'));
    await page.waitForTimeout(100);
    expect(await page.locator('#rs-slide-body .rs-slide-mc.done').count()).toBe(1);
  });

  test('FIX 6: dark accounts KPI navigates to Dark Zone', async ({ page }) => {
    await page.evaluate(() => goTab('dash', document.querySelector('[onclick*="goTab(\'dash\'"]')));
    await page.evaluate(() => rsKpiDark());
    await page.waitForTimeout(200);
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
    await expect(page.locator('#rs-sec-dark.on')).toBeVisible();
  });

  test('FIX 6: tasks KPI opens slide-over backed by TASKS data', async ({ page }) => {
    await page.evaluate(() => rsKpiTasks());
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-slide-ov.on')).toBeVisible();
    expect(await page.locator('#rs-slide-body .rs-slide-row').count()).toBe(8);
  });

  test('FIX 6: Escape closes the slide-over panel', async ({ page }) => {
    await page.evaluate(() => rsKpiTasks());
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-slide-ov.on')).toHaveCount(0);
  });

  test('FIX 7: signals 7, 9, 11 are HIGH (elevated from WATCH)', async ({ page }) => {
    const sevs = await page.evaluate(() => [7,9,11].map(id => RS_SIGNALS.find(s => s.id === id).sev));
    expect(sevs).toEqual(['high','high','high']);
  });

  test('FIX 7: signal 5 names Okta explicitly', async ({ page }) => {
    const desc = await page.evaluate(() => RS_SIGNALS.find(s => s.id === 5).desc);
    expect(desc).toMatch(/Okta/);
  });

  test('FIX 8: every signal has a source chip + last-updated timestamp', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(200);
    expect(await page.locator('.rs-sig-row').count()).toBe(11);
    expect(await page.locator('.rs-sig-src').count()).toBe(11);
    expect(await page.locator('.rs-sig-time').count()).toBe(11);
    // Refresh header
    const hd = await page.locator('#rs-sig-refresh').textContent();
    expect(hd).toMatch(/Last refreshed: Today · 9:00 AM · Gainsight API/);
  });

  test('FIX 8: source chips cover all 5 source systems', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(150);
    const labels = await page.locator('.rs-sig-src').allTextContents();
    const set = new Set(labels.map(s => s.trim()));
    ['GAINSIGHT','GONG','IRONCLAD','INBOX','ZENDESK'].forEach(k => expect(set.has(k)).toBe(true));
  });

  test('FIX 9: matrix bubbles render trend velocity arrows', async ({ page }) => {
    expect(await page.locator('.rs-mx-trend').count()).toBe(6);
    const novaTrend = await page.locator('.rs-mx-dot[data-acct="nova"] .rs-mx-trend').textContent();
    expect(novaTrend).toContain('↓↓');
    const acmeTrend = await page.locator('.rs-mx-dot[data-acct="acme"] .rs-mx-trend').textContent();
    expect(acmeTrend).toContain('↑');
  });

  test('FIX 9: Brightex bubble carries the warn-ring dashed border', async ({ page }) => {
    await expect(page.locator('.rs-mx-dot[data-acct="brightex"].warn-ring')).toHaveCount(1);
  });

  test('FIX 9: trend legend renders below the matrix', async ({ page }) => {
    await expect(page.locator('.rs-trend-key')).toBeVisible();
    const txt = await page.locator('.rs-trend-key').textContent();
    expect(txt).toMatch(/Improving/);
    expect(txt).toMatch(/Sharp decline/);
  });

  test('FIX 10: NovaVault Step 2 talk-track renders WHAT TO DO / SAY / OUTCOME', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    // v4.13.0 — Step 2 (in-progress) auto-expands on render, so the body is
    // already visible without a toggle.
    const body = await page.locator('#rs-pl-nova-step-2-body').textContent();
    expect(body).toMatch(/What to do/);
    expect(body).toMatch(/What to say/);
    expect(body).toMatch(/Expected outcome/);
    expect(body).toMatch(/Michael Torres/);
    const exp = await page.locator('#rs-pl-nova-step-2').getAttribute('aria-expanded');
    expect(exp).toBe('true');
  });

  test('FIX 10: aria-expanded toggles correctly on a non-auto-expanded step', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    // v4.13.0 — Brightex Step 3 is in-progress and auto-expands, so use
    // Step 4 (a pending step with a body) to test the manual toggle path.
    const before = await page.locator('#rs-pl-brightex-step-4').getAttribute('aria-expanded');
    expect(before).toBe('false');
    await page.evaluate(() => rsPlayStepToggle('brightex', 4));
    await page.waitForTimeout(100);
    const after = await page.locator('#rs-pl-brightex-step-4').getAttribute('aria-expanded');
    expect(after).toBe('true');
    await expect(page.locator('#rs-pl-brightex-step-4-body.on')).toBeVisible();
  });

  test('regression: All Signals still lists 11 signals + 11 severity badges', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(150);
    expect(await page.locator('.rs-sev').count()).toBe(11);
  });

  test('regression: Critical filter narrows to 3 signals', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsSigFilter('crit'));
    await page.waitForTimeout(100);
    expect(await page.locator('.rs-sig-row').count()).toBe(3);
  });

  test('regression: Save Plays still renders 2 cards with 5 steps each', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    expect(await page.locator('.rs-play-card').count()).toBe(2);
    expect(await page.locator('.rs-pl-step').count()).toBe(10);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.10.0 — CSM DASHBOARD UX OVERHAUL
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.10.0 Dashboard UX overhaul', () => {
  test('SPEC §1: standalone Dark Zone widget is gone from the left rail', async ({ page }) => {
    expect(await page.locator('#tab-dash .dz').count()).toBe(0);
    expect(await page.locator('#tab-dash .dz-acct').count()).toBe(0);
  });

  test('SPEC §1: Urgent Inbox renders 4 single-line rows with avatar + source chip', async ({ page }) => {
    const rows = await page.locator('#tab-dash .ii').count();
    expect(rows).toBe(4);
    expect(await page.locator('#tab-dash .ii .ii-av').count()).toBe(4);
    expect(await page.locator('#tab-dash .ii .ii-time').count()).toBe(4);
    expect(await page.locator('#tab-dash .ii .tb-src').count()).toBeGreaterThanOrEqual(4);
    expect(await page.locator('#tab-dash .ii .ii-body').count()).toBe(0);
  });

  test('SPEC §1: Today\'s Tasks renders 7 simple rows + 0 admin attribution cards', async ({ page }) => {
    expect(await page.locator('#tab-dash .ac').count()).toBe(7);
    expect(await page.locator('#tab-dash .ac-n').count()).toBe(7);
    expect(await page.locator('#tab-dash .ac-from').count()).toBe(0);
    expect(await page.locator('#tab-dash .tk-legend').count()).toBe(0);
  });

  test('SPEC §1: every task has exactly one source dot', async ({ page }) => {
    const rows = page.locator('#tab-dash .ac');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      expect(await rows.nth(i).locator('.src-dot').count()).toBe(1);
    }
  });

  test('SPEC §2: Priority Stack buttons all render at 28px and share base class', async ({ page }) => {
    const btns = page.locator('#tab-dash .bf-priority .bf-act');
    const total = await btns.count();
    expect(total).toBe(5);
    const heights = await page.evaluate(() => Array.from(document.querySelectorAll('#tab-dash .bf-priority .bf-act')).map(b => b.getBoundingClientRect().height));
    const max = Math.max(...heights);
    const min = Math.min(...heights);
    expect(max - min).toBeLessThan(2);
    expect(Math.round(max)).toBe(28);
  });

  test('SPEC §2 + §8: Priority Stack tags use the unified taxonomy classes', async ({ page }) => {
    expect(await page.locator('#tab-dash .bf-priority .bf-tag').count()).toBe(5);
    expect(await page.locator('#tab-dash .bf-priority .bf-tag.tb-crit').count()).toBe(1);
    expect(await page.locator('#tab-dash .bf-priority .bf-tag.tb-high').count()).toBe(2);
    expect(await page.locator('#tab-dash .bf-priority .bf-tag.tb-watch').count()).toBe(1);
    expect(await page.locator('#tab-dash .bf-priority .bf-tag.tb-opp').count()).toBe(1);
  });

  test('SPEC §3: Next Up summary renders signal chips, not prose', async ({ page }) => {
    expect(await page.locator('#bf-next-chips .bf-next-chip').count()).toBeLessThanOrEqual(3);
    expect(await page.locator('#bf-next-chips .bf-next-chip').count()).toBeGreaterThanOrEqual(1);
    const txt = await page.locator('#bf-next-chips').textContent();
    expect(txt).not.toMatch(/IT security team scaling/);
    expect(txt).toMatch(/SSO|Expansion|Champion/);
  });

  test('SPEC §4: Dust Agents shows All Agents link instead of chip-with-caret', async ({ page }) => {
    const link = page.locator('#dust-agents-btn');
    await expect(link).toBeVisible();
    const cls = await link.getAttribute('class');
    expect(cls).toContain('bf-qa-link');
    expect(cls).not.toContain('bf-qa-btn');
    const txt = await link.textContent();
    expect(txt).toMatch(/All Agents \(9\)/);
    await link.click();
    await page.waitForTimeout(150);
    await expect(page.locator('#dust-agents-pop.on')).toBeVisible();
  });

  test('SPEC §5: TeamOS Live demoted to subtle Live chip', async ({ page }) => {
    const btn = page.locator('#view-default .mb-tl-btn');
    await expect(btn).toBeVisible();
    const txt = await btn.textContent();
    expect(txt.trim()).toMatch(/^Live$/);
    const bg = await page.evaluate(() => {
      const el = document.querySelector('#view-default .mb-tl-btn');
      return el ? getComputedStyle(el).backgroundColor : null;
    });
    expect(bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent').toBe(true);
  });

  test('SPEC §6: Live Signals widget removed from right rail', async ({ page }) => {
    expect(await page.locator('#tab-dash .ls').count()).toBe(0);
    expect(await page.locator('#tab-dash .ls-row').count()).toBe(0);
  });

  test('SPEC §7: Prepare My Day output includes Silent Accounts section', async ({ page }) => {
    const body = await page.locator('#view-default .rp-scroll').textContent();
    expect(body).toMatch(/Silent accounts/);
    expect(body).toMatch(/3 accounts/);
    expect(body).toMatch(/\$55K ARR/);
    expect(body).toMatch(/Meridian Health/);
    expect(body).toMatch(/Creston Software/);
    expect(body).toMatch(/Apex Dynamics/);
    expect(await page.locator('#view-default .sa-row').count()).toBe(3);
  });

  test('SPEC §7: Silent Accounts Ghost-Buster button opens the in-tab drawer', async ({ page }) => {
    // v4.13.0 — Ghost-Buster from any caller (including Silent Accounts)
    // routes through rsOpenGB which now opens the drawer overlay.
    await page.evaluate(() => {
      const btns = document.querySelectorAll('#view-default .sa-row .sa-btn');
      btns[0].click();
    });
    await page.waitForTimeout(250);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/Meridian/);
  });

  test('SPEC §8: badge taxonomy — 5 filled classes applied across dashboard', async ({ page }) => {
    const counts = await page.evaluate(() => {
      const classes = ['tb-crit','tb-high','tb-watch','tb-opp','tb-admin'];
      return classes.map(c => document.querySelectorAll('#tab-dash .' + c).length);
    });
    expect(counts[0]).toBeGreaterThanOrEqual(1);
    expect(counts[1]).toBeGreaterThanOrEqual(1);
    expect(counts[2]).toBeGreaterThanOrEqual(1);
    expect(counts[3]).toBeGreaterThanOrEqual(1);
    expect(await page.locator('#tab-dash .tb-src').count()).toBeGreaterThanOrEqual(4);
  });

  test('SPEC §9: pulse strip swap — Drive Docs replaced by Renews This Month', async ({ page }) => {
    await expect(page.locator('#pb-renew')).toBeVisible();
    const t = await page.locator('#pb-renew').textContent();
    expect(t).toMatch(/\$89K/);
    expect(t).toMatch(/renews this month/i);
    await page.click('#pb-renew');
    await page.waitForTimeout(200);
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
  });

  test('SPEC §9: Training replaced by Expansion Pipeline', async ({ page }) => {
    await expect(page.locator('#pb-exp')).toBeVisible();
    const t = await page.locator('#pb-exp').textContent();
    expect(t).toMatch(/\$12K.*\$18K/);
    expect(t).toMatch(/expansion pipeline/i);
    const trainParentDisplay = await page.evaluate(() => {
      const btn = document.getElementById('pb-train');
      return btn ? getComputedStyle(btn.parentElement).display : null;
    });
    expect(trainParentDisplay).toBe('none');
  });

  test('SPEC §9: pulse strip still has at least 7 ps-wrap items', async ({ page }) => {
    expect(await page.locator('.pulse-strip .ps-wrap').count()).toBeGreaterThanOrEqual(7);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.11.0 — CAMPAIGN MANAGER ADD CONTACT INLINE + QUICK SEND
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.11.0 Campaign Manager features', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FEATURE 1: shared Add Contact modal ─────────────────────────────────
  test('FEATURE 1: shared Add Contact modal carries First name + Email as required', async ({ page }) => {
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    expect(await page.locator('#cm-ac-fn').getAttribute('aria-required')).toBe('true');
    expect(await page.locator('#cm-ac-em').getAttribute('aria-required')).toBe('true');
    // Role=dialog on the modal.
    expect(await page.locator('#cm-modal').getAttribute('role')).toBe('dialog');
    expect(await page.locator('#cm-modal').getAttribute('aria-modal')).toBe('true');
  });

  test('FEATURE 1: First name required + inline error fires on blank submit', async ({ page }) => {
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    await page.fill('#cm-ac-em', 'a@b.com');
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(100);
    await expect(page.locator('#cm-ac-fn-err')).toHaveClass(/on/);
    // No contact persisted while First name blank.
    const exists = await page.evaluate(() => CM_CONTACTS.some(c => c.email === 'a@b.com'));
    expect(exists).toBe(false);
  });

  test('FEATURE 1: save persists new contact to localStorage teamos_contacts', async ({ page }) => {
    await page.evaluate(() => cmAddContactPrompt());
    await page.waitForTimeout(150);
    await page.fill('#cm-ac-fn', 'Eva');
    await page.fill('#cm-ac-ln', 'Persisted');
    await page.fill('#cm-ac-em', 'eva.persisted@qa.test');
    await page.fill('#cm-ac-co', 'Persist Co');
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(150);
    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('teamos_contacts') || '[]'); } catch (e) { return []; }
    });
    expect(stored.some(c => c.email === 'eva.persisted@qa.test')).toBe(true);
    // Toast confirms.
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Eva Persisted added/);
  });

  test('FEATURE 1 · LOCATION 1: Step 2 audience picker carries Add contact link', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-wiz-body .cm-add-cnt-link .cm-add-cnt-btn')).toBeVisible();
    // Click it; modal opens with wizard origin context.
    await page.click('#cm-wiz-body .cm-add-cnt-link .cm-add-cnt-btn');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov')).toHaveClass(/on/);
    const ctxKind = await page.evaluate(() => CM_ADD_CONTACT_CTX && CM_ADD_CONTACT_CTX.kind);
    expect(ctxKind).toBe('wizard');
  });

  test('FEATURE 1 · LOCATION 1: Add contact from wizard pre-checks new contact in Step 2', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmAddContactPrompt({ kind:'wizard' }));
    await page.waitForTimeout(120);
    await page.fill('#cm-ac-fn', 'Wizard');
    await page.fill('#cm-ac-em', 'wizard@qa.test');
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(200);
    const inSel = await page.evaluate(() => {
      const c = CM_CONTACTS.find(x => x.email === 'wizard@qa.test');
      return c ? CM_WIZ.contacts.indexOf(c.id) !== -1 : false;
    });
    expect(inSel).toBe(true);
  });

  test('FEATURE 1 · LOCATION 3: campaign detail drawer carries Add contact link', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-cv-drawer .cm-add-cnt-link .cm-add-cnt-btn')).toBeVisible();
    const before = await page.evaluate(() => CM_CAMPAIGNS.find(x => x.id === 'cmp1').contactCount);
    await page.evaluate(() => cmAddContactPrompt({ kind:'campaign', cmpId:'cmp1' }));
    await page.waitForTimeout(120);
    await page.fill('#cm-ac-fn', 'Campaign');
    await page.fill('#cm-ac-em', 'cmp@qa.test');
    await page.evaluate(() => cmAddContactSave());
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => CM_CAMPAIGNS.find(x => x.id === 'cmp1').contactCount);
    expect(after).toBe(before + 1);
    const inIds = await page.evaluate(() => {
      const c = CM_CONTACTS.find(x => x.email === 'cmp@qa.test');
      return c ? CM_CAMPAIGNS.find(x => x.id === 'cmp1').contactIds.indexOf(c.id) !== -1 : false;
    });
    expect(inIds).toBe(true);
  });

  // ── FEATURE 2: Quick Send ───────────────────────────────────────────────
  test('FEATURE 2: Quick Send button visible next to New Campaign', async ({ page }) => {
    const btns = await page.locator('#cm-campaigns .cm-hd-acts button').count();
    expect(btns).toBe(2);
    const qsBtn = page.locator('#cm-campaigns .cm-hd-acts button[onclick="cmQuickSendOpen()"]');
    await expect(qsBtn).toBeVisible();
    const t = await qsBtn.textContent();
    expect(t).toMatch(/Quick Send/);
  });

  test('FEATURE 2: Quick Send opens modal with role=dialog + aria-modal=true', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov.on')).toBeVisible();
    expect(await page.locator('#cm-modal').getAttribute('role')).toBe('dialog');
    expect(await page.locator('#cm-modal').getAttribute('aria-modal')).toBe('true');
    await expect(page.locator('#cm-modal.qs')).toBeVisible();
    // Required fields exposed.
    expect(await page.locator('#cm-qs-subj').getAttribute('aria-required')).toBe('true');
    expect(await page.locator('#cm-qs-msg').getAttribute('aria-required')).toBe('true');
    // Submit button starts at "Send to 0 people".
    const ariaLbl = await page.locator('#cm-qs-submit').getAttribute('aria-label');
    expect(ariaLbl).toBe('Send to 0 people');
  });

  test('FEATURE 2: submit button label updates live as contacts are added', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.evaluate(() => cmQsPick('c1'));
    await page.waitForTimeout(80);
    const l1 = await page.locator('#cm-qs-submit').getAttribute('aria-label');
    expect(l1).toBe('Send to 1 person');
    await page.evaluate(() => cmQsPick('c3'));
    await page.evaluate(() => cmQsPick('c11'));
    await page.waitForTimeout(80);
    const l3 = await page.locator('#cm-qs-submit').getAttribute('aria-label');
    expect(l3).toBe('Send to 3 people');
    // 3 chips render.
    expect(await page.locator('#cm-qs-to-bx .cm-qs-chip').count()).toBe(3);
  });

  test('FEATURE 2: validation — empty TO + empty subject + short message fires inline errors', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.evaluate(() => cmQuickSendSubmit());
    await page.waitForTimeout(100);
    await expect(page.locator('#cm-qs-to-err')).toHaveClass(/on/);
    await expect(page.locator('#cm-qs-subj-err')).toHaveClass(/on/);
    await expect(page.locator('#cm-qs-msg-err')).toHaveClass(/on/);
  });

  test('FEATURE 2: send persists to localStorage + toasts and closes modal', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.evaluate(() => { cmQsPick('c1'); cmQsPick('c3'); });
    await page.fill('#cm-qs-subj', 'Renewal terms');
    await page.fill('#cm-qs-msg', 'Quick note about your upcoming renewal. Let me know a good time.');
    await page.evaluate(() => cmQuickSendSubmit());
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-modal-ov.on')).toHaveCount(0);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Sent to 2 contacts · Logged in Gainsight/);
    const stored = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('teamos_quick_sends') || '[]'); } catch (e) { return []; } });
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(stored[0].subject).toBe('Renewal terms');
    expect(stored[0].sent).toBe(2);
  });

  test('FEATURE 2: Analytics adds Quick Sends row after a send', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.evaluate(() => { cmQsPick('c1'); });
    await page.fill('#cm-qs-subj', 'QA');
    await page.fill('#cm-qs-msg', 'Quick note for QA verification.');
    await page.evaluate(() => cmQuickSendSubmit());
    await page.waitForTimeout(150);
    await page.evaluate(() => cmShowSection('analytics'));
    await page.waitForTimeout(200);
    const qsRow = page.locator('#cm-analytics .cm-perf-table tr.qs-row');
    await expect(qsRow).toBeVisible();
    const txt = await qsRow.textContent();
    expect(txt).toMatch(/Quick Sends/);
    expect(txt).toMatch(/1:1 \/ Quick Send/);
  });

  test('FEATURE 2: keyboard — Enter in subject moves focus to message', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.focus('#cm-qs-subj');
    await page.fill('#cm-qs-subj', 'Topic');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
    const focusedId = await page.evaluate(() => document.activeElement && document.activeElement.id);
    expect(focusedId).toBe('cm-qs-msg');
  });

  test('FEATURE 2: Escape closes the Quick Send modal', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-ov.on')).toHaveCount(0);
  });

  test('FEATURE 2: typeahead — typing filters CM_CONTACTS and Enter picks first', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(120);
    await page.fill('#cm-qs-to-input', 'sarah');
    await page.waitForTimeout(80);
    const opts = await page.locator('#cm-qs-to-pop .cm-qs-to-opt').count();
    expect(opts).toBeGreaterThanOrEqual(1);
    await page.focus('#cm-qs-to-input');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
    const picked = await page.evaluate(() => CM_QS && CM_QS.to.length);
    expect(picked).toBe(1);
  });

  test('FEATURE 1 · LOCATION 4: Quick Send TO field carries Add contact link', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(150);
    await expect(page.locator('#cm-modal-body .cm-add-cnt-link .cm-add-cnt-btn')).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.12.0 — CAMPAIGN MANAGER QA AUDIT FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.12.0 Campaign Manager audit fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: Step 1 Next button live re-evaluation ────────────────────────
  test('FIX 1: Step 1 Next button is disabled on open', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.waitForTimeout(150);
    const btn = page.locator('#cm-wiz-next-step1');
    await expect(btn).toBeVisible();
    expect(await btn.getAttribute('disabled')).not.toBeNull();
    expect(await btn.getAttribute('data-testid')).toBe('wiz-next-step1');
  });

  test('FIX 1: typing a name does not enable Next until a type is also picked', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.waitForTimeout(150);
    await page.fill('#cm-wiz-name', 'June Renewal Push');
    await page.waitForTimeout(80);
    // Still disabled because no type chosen yet.
    expect(await page.locator('#cm-wiz-next-step1').getAttribute('disabled')).not.toBeNull();
    // Pick a type → button enables on the spot (no re-render needed).
    await page.evaluate(() => cmWizStep1PickType('renewal', document.querySelector('.cm-wiz-type')));
    await page.waitForTimeout(80);
    expect(await page.locator('#cm-wiz-next-step1').getAttribute('disabled')).toBeNull();
  });

  test('FIX 1: type then name also unlocks Next without re-render', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizStep1PickType('renewal', document.querySelector('.cm-wiz-type')));
    await page.waitForTimeout(60);
    expect(await page.locator('#cm-wiz-next-step1').getAttribute('disabled')).not.toBeNull();
    await page.fill('#cm-wiz-name', 'Q3 Push');
    await page.waitForTimeout(80);
    expect(await page.locator('#cm-wiz-next-step1').getAttribute('disabled')).toBeNull();
    // And the name input keeps focus (the fix avoids re-rendering Step 1).
    const focusedId = await page.evaluate(() => document.activeElement && document.activeElement.id);
    expect(focusedId).toBe('cm-wiz-name');
  });

  // ── FIX 2: per-contact body edits (regression of v4.8.0 FIX 11) ─────────
  test('FIX 2: body overrides are per-contact, not shared', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name = 'QA'; CM_WIZ.type = 'renewal';
      CM_WIZ.contacts = ['c3', 'c5']; CM_WIZ.template = 't3'; CM_WIZ.step = 3;
      cmWizRender();
    });
    await page.waitForTimeout(180);
    // Edit body for contact #1 (Sarah Chen).
    await page.evaluate(() => {
      const ta = document.getElementById('cm-prev-body-s3');
      ta.value = 'Custom note for Sarah only';
      ta.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(120);
    // Cycle to contact #2 (Michael Torres).
    await page.evaluate(() => cmCyclePreview(1));
    await page.waitForTimeout(120);
    const torresBody = await page.evaluate(() => document.getElementById('cm-prev-body-s3').value);
    expect(torresBody).not.toContain('Custom note for Sarah only');
    // Cycle back; Sarah's edit must still be there.
    await page.evaluate(() => cmCyclePreview(-1));
    await page.waitForTimeout(120);
    const sarahBody = await page.evaluate(() => document.getElementById('cm-prev-body-s3').value);
    expect(sarahBody).toContain('Custom note for Sarah only');
  });

  // ── FIX 3 / FIX 4 / FIX 5: drawer footer flows (regressions of v4.8.0) ──
  test('FIX 3: Pause in drawer shows confirm strip + transitions to Resume', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(180);
    await page.evaluate(() => cmCampPause('cmp1'));
    await page.waitForTimeout(120);
    await expect(page.locator('#cm-cv-drawer .cm-card-confirm.pause')).toBeVisible();
    await page.evaluate(() => cmCampPauseConfirm('cmp1'));
    await page.waitForTimeout(180);
    const status = await page.evaluate(() => CM_CAMPAIGNS.find(x => x.id === 'cmp1').status);
    expect(status).toBe('paused');
    // Drawer re-renders with a Resume button now.
    const drawerTxt = await page.locator('#cm-cv-drawer').textContent();
    expect(drawerTxt).toMatch(/Resume Campaign/);
  });

  test('FIX 4: Archive in drawer routes through the same confirm strip', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(150);
    await page.evaluate(() => cmCampArchive('cmp1'));
    await page.waitForTimeout(120);
    // Drawer footer carries the confirm strip (not a duplicate handler).
    await expect(page.locator('#cm-cv-drawer .cm-card-confirm')).toBeVisible();
  });

  test('FIX 5: Export List builds CSV + drawer stays open', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(150);
    // Hook URL.createObjectURL so we can capture the Blob contents.
    const captured = await page.evaluate(() => new Promise(resolve => {
      const origCreate = URL.createObjectURL;
      URL.createObjectURL = function(blob) {
        blob.text().then(text => resolve(text));
        return origCreate.call(URL, blob);
      };
      cmCampExport('cmp1');
    }));
    expect(captured).toMatch(/^Contact,Account,Email,Touch Reached,Status,Last Activity/);
    // Drawer is still open.
    await expect(page.locator('#cm-cv-drawer.on')).toBeVisible();
  });

  // ── FIX 6: contact row inline sub-panel ─────────────────────────────────
  test('FIX 6: clicking a contact row opens an inline sub-panel (does not close drawer)', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(180);
    const firstRow = page.locator('#cm-cv-drawer .cm-cv-cnt-row').first();
    await firstRow.click();
    await page.waitForTimeout(150);
    // Drawer still open
    await expect(page.locator('#cm-cv-drawer.on')).toBeVisible();
    // A sub-panel row appears.
    await expect(page.locator('#cm-cv-drawer .cm-cv-sub-row:not([hidden])')).toHaveCount(1);
    const panel = page.locator('#cm-cv-drawer .cm-cv-sub').first();
    expect(await panel.getAttribute('role')).toBe('region');
    const aria = await panel.getAttribute('aria-label');
    expect(aria).toMatch(/contact details/);
  });

  test('FIX 6: only one sub-panel open at a time', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(180);
    const rows = page.locator('#cm-cv-drawer .cm-cv-cnt-row');
    await rows.nth(0).click();
    await page.waitForTimeout(100);
    await rows.nth(1).click();
    await page.waitForTimeout(120);
    await expect(page.locator('#cm-cv-drawer .cm-cv-sub-row:not([hidden])')).toHaveCount(1);
  });

  test('FIX 6: Send 1:1 Email button fires toast with Gainsight log', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(180);
    await page.locator('#cm-cv-drawer .cm-cv-cnt-row').first().click();
    await page.waitForTimeout(120);
    // Only the open (non-hidden) sub-panel's button. The other sub-panels
    // exist in DOM but are hidden — narrow to the visible one.
    await page.locator('#cm-cv-drawer .cm-cv-sub-row:not([hidden]) .cm-cv-sub .cm-btn.prim').click();
    await page.waitForTimeout(120);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/1:1 email sent/);
    expect(t).toMatch(/Logged in Gainsight/);
  });

  test('FIX 6: Close button collapses the sub-panel', async ({ page }) => {
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(180);
    await page.locator('#cm-cv-drawer .cm-cv-cnt-row').first().click();
    await page.waitForTimeout(120);
    // Click the inline Close (×) button.
    await page.locator('#cm-cv-drawer .cm-cv-sub-x').first().click();
    await page.waitForTimeout(120);
    await expect(page.locator('#cm-cv-drawer .cm-cv-sub-row:not([hidden])')).toHaveCount(0);
  });

  // ── FIX 7: 0-count chip hover tooltip + click opens wizard ──────────────
  test('FIX 7: empty chip carries role=tooltip + aria-describedby', async ({ page }) => {
    const chip = page.locator('.cm-seg-chip.empty').first();
    const describedby = await chip.getAttribute('aria-describedby');
    expect(describedby).toMatch(/^cm-seg-empty-/);
    const tip = page.locator('#' + describedby);
    expect(await tip.getAttribute('role')).toBe('tooltip');
    const txt = await tip.textContent();
    expect(txt).toMatch(/No accounts match this segment yet/);
  });

  test('FIX 7: hovering an empty chip surfaces the tooltip via CSS', async ({ page }) => {
    const chip = page.locator('.cm-seg-chip.empty').first();
    await chip.hover();
    await page.waitForTimeout(50);
    const visible = await page.evaluate(() => {
      const c = document.querySelector('.cm-seg-chip.empty');
      const tip = c && c.querySelector('.cm-seg-empty-pop');
      return tip ? getComputedStyle(tip).display : 'none';
    });
    expect(visible).toBe('block');
  });

  // ── FIX 8: AI Draft placeholder highlight ───────────────────────────────
  test('FIX 8: cmCollectPlaceholders extracts bracketed tokens from body text', async ({ page }) => {
    const tokens = await page.evaluate(() => cmCollectPlaceholders('Hi Sarah,\n\nThis is the [Account-specific value summary] line.\n\nThe [Feature name] is great.'));
    expect(tokens.length).toBe(2);
    expect(tokens[0].label).toBe('Account-specific value summary');
    expect(tokens[1].label).toBe('Feature name');
  });

  test('FIX 8: Step 3 renders a placeholder chip bar above the body textarea', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name = 'QA'; CM_WIZ.type = 'renewal'; CM_WIZ.contacts = ['c3'];
      CM_WIZ.template = 't3'; CM_WIZ.step = 3; cmWizRender();
    });
    await page.waitForTimeout(180);
    const chips = await page.locator('.cm-ph-bar .cm-ph-chip').count();
    expect(chips).toBeGreaterThanOrEqual(1);
    const txt = await page.locator('.cm-ph-bar .cm-ph-chip').first().textContent();
    expect(txt).toMatch(/Account-specific value summary/);
    const aria = await page.locator('.cm-ph-bar .cm-ph-chip').first().getAttribute('aria-label');
    expect(aria).toMatch(/^Required:/);
  });

  test('FIX 8: clicking a placeholder chip selects the matching text in the textarea', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name = 'QA'; CM_WIZ.type = 'renewal'; CM_WIZ.contacts = ['c3'];
      CM_WIZ.template = 't3'; CM_WIZ.step = 3; cmWizRender();
    });
    await page.waitForTimeout(180);
    await page.locator('.cm-ph-bar .cm-ph-chip').first().click();
    await page.waitForTimeout(60);
    const sel = await page.evaluate(() => {
      const ta = document.getElementById('cm-prev-body-s3');
      return ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : '';
    });
    expect(sel).toMatch(/Account-specific value summary/);
  });

  // ── FIX 9: send confirmation checkboxes live label + disabled ───────────
  test('FIX 9: send confirm submit button label updates as recipients toggle', async ({ page }) => {
    await page.evaluate(() => cmOpenSendConfirm({ source:'card', campaignId:'cmp1' }));
    await page.waitForTimeout(150);
    const before = await page.locator('#cm-send-confirm-btn').textContent();
    expect(before).toMatch(/Confirm & Send to \d+ (person|people)/);
    // Untick one
    const firstId = await page.evaluate(() => CM_SEND_SELECTED[0]);
    const startN = await page.evaluate(() => CM_SEND_SELECTED.length);
    await page.evaluate(id => cmSendToggleRecipient(id, false), firstId);
    await page.waitForTimeout(80);
    const txt2 = await page.locator('#cm-send-confirm-btn').textContent();
    expect(txt2).toContain('Confirm & Send to ' + (startN - 1));
    // aria-label also updated.
    const aria = await page.locator('#cm-send-confirm-btn').getAttribute('aria-label');
    expect(aria).toBe('Confirm & Send to ' + (startN - 1) + ' ' + (startN - 1 === 1 ? 'person' : 'people'));
  });

  test('FIX 9: untoggling all recipients disables the submit button', async ({ page }) => {
    await page.evaluate(() => cmOpenSendConfirm({ source:'card', campaignId:'cmp1' }));
    await page.waitForTimeout(150);
    await page.evaluate(() => CM_SEND_SELECTED.slice().forEach(id => cmSendToggleRecipient(id, false)));
    await page.waitForTimeout(80);
    expect(await page.locator('#cm-send-confirm-btn').getAttribute('disabled')).not.toBeNull();
    const tip = await page.locator('#cm-send-confirm-btn').getAttribute('title');
    expect(tip).toMatch(/Select at least 1 recipient/);
  });

  test('FIX 9: each recipient checkbox has an aria-label naming the contact', async ({ page }) => {
    await page.evaluate(() => cmOpenSendConfirm({ source:'card', campaignId:'cmp1' }));
    await page.waitForTimeout(150);
    const labels = await page.locator('.cm-send-row input[type=checkbox]').first().getAttribute('aria-label');
    expect(labels).toMatch(/^Send to /);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.13.0 — RISK & SIGNALS AUDIT FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.13.0 Risk & Signals audit fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: Ghost-Buster in-tab drawer ───────────────────────────────────
  test('FIX 1: gb-drawer mounts at body level with role=dialog + aria-modal=true', async ({ page }) => {
    expect(await page.locator('#gb-drawer').count()).toBe(1);
    expect(await page.locator('#gb-drawer').getAttribute('role')).toBe('dialog');
    expect(await page.locator('#gb-drawer').getAttribute('aria-modal')).toBe('true');
  });

  test('FIX 1: All Signals → Ghost-Buster opens drawer, stays on Risk & Signals', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(150);
    // Signal 3 is the NovaVault Gong silence row with action="gb".
    await page.evaluate(() => rsSigAction('gb', 'nova', 3));
    await page.waitForTimeout(220);
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/NovaVault/);
  });

  test('FIX 1: Champions → View Ghost-Buster (NovaVault) opens drawer in-tab', async ({ page }) => {
    await page.evaluate(() => rsShow('champions'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsOpenGB('nova'));
    await page.waitForTimeout(220);
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    const sub = await page.locator('#gb-drawer-sub').textContent();
    expect(sub).toMatch(/NovaVault/);
  });

  test('FIX 1: Dark Zone → Ghost-Buster opens drawer in-tab for each acct', async ({ page }) => {
    await page.evaluate(() => rsShow('dark'));
    await page.waitForTimeout(150);
    for (const acct of ['meridian','creston','apex']) {
      await page.evaluate(k => rsOpenGB(k), acct);
      await page.waitForTimeout(200);
      await expect(page.locator('#gb-drawer.on')).toBeVisible();
      const sub = await page.locator('#gb-drawer-sub').textContent();
      expect(sub.toLowerCase()).toContain(acct === 'meridian' ? 'meridian' : acct);
      await page.evaluate(() => gbDrawerClose());
      await page.waitForTimeout(150);
    }
  });

  test('FIX 1: Escape closes the Ghost-Buster drawer', async ({ page }) => {
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(180);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#gb-drawer.on')).toHaveCount(0);
  });

  test('FIX 1: drawer body carries the Ghost-Buster content (Situation Read)', async ({ page }) => {
    // v4.19.0 — Meridian now triggers inbound suppression (Jennifer emailed
    // yesterday). Creston has no inbound signal so it shows the regular
    // Situation Read sequence.
    await page.evaluate(() => rsOpenGB('creston'));
    await page.waitForTimeout(200);
    const body = await page.locator('#gb-drawer-body').textContent();
    expect(body).toMatch(/Situation Read/);
    expect(body).toMatch(/Creston Software/);
  });

  // ── FIX 2: Open Save Strategy in All Signals opens the agent drawer ─────
  test('FIX 2: All Signals "Open Save Strategy" opens the Save Strategy drawer', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(150);
    // Signal 1 is NovaVault champion-departed; action="save".
    await page.evaluate(() => rsSigAction('save', 'nova', 1));
    await page.waitForTimeout(220);
    // The agent drawer (#drawer) opens with the Save Strategy data.
    await expect(page.locator('#drawer.on')).toBeVisible();
    const title = await page.locator('#drawer-title').textContent();
    expect(title).toMatch(/Save|NovaVault/i);
    // Still on Risk & Signals.
    await expect(page.locator('#tab-risk')).toHaveClass(/on/);
  });

  // ── FIX 3: Escalate to TL wording ───────────────────────────────────────
  test('FIX 3: Escalate to TL fires the new "Escalation summary attached" toast', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsPlayEscalate('nova'));
    await page.waitForTimeout(120);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Situation brief sent to Team Lead/);
    expect(t).toMatch(/NovaVault/);
    expect(t).toMatch(/Escalation summary attached/);
    expect(t).not.toMatch(/Dust summary attached/);
  });

  // ── FIX 4: Risk Matrix snapshot slide-over ──────────────────────────────
  test('FIX 4: clicking a matrix dot opens a right-side snapshot slide-over', async ({ page }) => {
    await page.evaluate(() => rsMxSelect('nova'));
    await page.waitForTimeout(120);
    await expect(page.locator('#rs-mx-snap.on')).toBeVisible();
    expect(await page.locator('#rs-mx-snap').getAttribute('role')).toBe('region');
    // Matrix chart remains rendered (full-width — no inline detail column).
    expect(await page.locator('#rs-sec-matrix .rs-mx').count()).toBe(1);
    // Snapshot detail body carries the account name.
    const body = await page.locator('#rs-mx-detail .rs-mx-detail-nm').textContent();
    expect(body).toMatch(/NovaVault/);
  });

  test('FIX 4: Escape closes the matrix snapshot slide-over', async ({ page }) => {
    await page.evaluate(() => rsMxSelect('nova'));
    await page.waitForTimeout(120);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-mx-snap.on')).toHaveCount(0);
  });

  // ── FIX 5: Generate Save Deck distinct toast ────────────────────────────
  test('FIX 5: rsFireSaveDeckToast yields the Dust-deck wording (not Gainsight CTA)', async ({ page }) => {
    await page.evaluate(() => rsFireSaveDeckToast('nova'));
    await page.waitForTimeout(120);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Save deck generating/);
    expect(t).toMatch(/NovaVault/);
    expect(t).toMatch(/Dust is building your slides/);
    expect(t).not.toMatch(/CTAs created in Gainsight/);
  });

  // ── FIX 6: portfolio bar above the matrix ───────────────────────────────
  test('FIX 6: portfolio KPI bar renders ABOVE the matrix chart', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const portfolio = document.querySelector('#rs-sec-matrix .rs-portfolio');
      const matrix    = document.querySelector('#rs-sec-matrix .rs-mx-wrap');
      if (!portfolio || !matrix) return null;
      return {
        portfolioTop: portfolio.getBoundingClientRect().top,
        matrixTop:    matrix.getBoundingClientRect().top
      };
    });
    expect(positions).not.toBeNull();
    expect(positions.portfolioTop).toBeLessThan(positions.matrixTop);
  });

  // ── ENHANCEMENT: in-progress step auto-expands ──────────────────────────
  test('ENHANCEMENT: in-progress Save Play step auto-expands talk track on load', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(180);
    // NovaVault Step 2 is in-progress with a body — should be auto-expanded.
    const novaExp = await page.locator('#rs-pl-nova-step-2').getAttribute('aria-expanded');
    expect(novaExp).toBe('true');
    await expect(page.locator('#rs-pl-nova-step-2-body.on')).toBeVisible();
    // Brightex Step 3 is in-progress with a body — same.
    const brightexExp = await page.locator('#rs-pl-brightex-step-3').getAttribute('aria-expanded');
    expect(brightexExp).toBe('true');
    await expect(page.locator('#rs-pl-brightex-step-3-body.on')).toBeVisible();
    // Step 1 (done) should NOT be auto-expanded.
    expect(await page.locator('#rs-pl-nova-step-1').count()).toBe(0); // step 1 has no body, no toggle
  });

  test('ENHANCEMENT: manual collapse of the auto-expanded step is honored on re-render', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(180);
    // Collapse the auto-expanded NovaVault Step 2.
    await page.evaluate(() => rsPlayStepToggle('nova', 2));
    await page.waitForTimeout(100);
    // Trigger a re-render (e.g. via rsRenderPlays directly).
    await page.evaluate(() => rsRenderPlays());
    await page.waitForTimeout(120);
    // It should STAY collapsed — the auto-expand flag prevents re-opening.
    const exp = await page.locator('#rs-pl-nova-step-2').getAttribute('aria-expanded');
    expect(exp).toBe('false');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.14.0 — FORECASTING AUDIT FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.14.0 Forecasting audit fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('forecast', document.querySelector('[onclick*="goTab(\'forecast\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: stale-state account bug in shared drawer ─────────────────────
  test('FIX 1: closeDrawer clears title, content, and _drawerCtx.acct', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('risk', 'brightex'));
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => _drawerCtx.acct)).toBe('brightex');
    await page.evaluate(() => closeDrawer());
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => _drawerCtx.acct)).toBeNull();
    expect(await page.locator('#drawer-title').textContent()).toBe('');
    expect(await page.locator('#drawer-scroll').innerHTML()).toBe('');
  });

  test('FIX 1: opening drawer with missing data shows empty state for THAT account', async ({ page }) => {
    // openAgentDrawer('risk','apex') has no DRAWER.risk.apex entry registered
    // — previously this left the previous Brightex content on screen.
    await page.evaluate(() => openAgentDrawer('risk', 'brightex'));
    await page.waitForTimeout(120);
    await page.evaluate(() => closeDrawer());
    await page.waitForTimeout(100);
    await page.evaluate(() => openAgentDrawer('risk', 'apex'));
    await page.waitForTimeout(120);
    const sub = await page.locator('#drawer-sub').textContent();
    expect(sub).toMatch(/Apex Dynamics/);
    expect(sub).not.toMatch(/Brightex/);
    // _drawerCtx.acct reflects the new account, not the prior one.
    expect(await page.evaluate(() => _drawerCtx.acct)).toBe('apex');
  });

  test('FIX 1: every Pipeline action button passes its own account key', async ({ page }) => {
    const rows = await page.evaluate(() => FC_PIPELINE.map(r => ({ key:r.key, actionAcct:r.actionAcct })));
    rows.forEach(r => expect(r.actionAcct).toBe(r.key));
  });

  // ── FIX 2: Ghost-Buster from Pipeline opens drawer in-tab ───────────────
  test('FIX 2: Pipeline Ghost-Buster (Meridian) opens drawer + stays on Forecasting', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'meridian'));
    await page.waitForTimeout(220);
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    expect(await page.locator('#gb-drawer-sub').textContent()).toMatch(/Meridian/);
  });

  test('FIX 2: Pipeline Ghost-Buster (Creston) opens drawer + stays on Forecasting', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'creston'));
    await page.waitForTimeout(220);
    await expect(page.locator('#tab-forecast')).toHaveClass(/on/);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    expect(await page.locator('#gb-drawer-sub').textContent()).toMatch(/Creston/);
  });

  // ── FIX 3: Timeline cards clickable as whole units ──────────────────────
  test('FIX 3: every Timeline card is a clickable role=button with aria-label', async ({ page }) => {
    await page.evaluate(() => fcShow('timeline'));
    await page.waitForTimeout(150);
    const cards = page.locator('#fc-timeline .fc-tl-acct');
    const total = await cards.count();
    expect(total).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < total; i++) {
      const card = cards.nth(i);
      expect(await card.getAttribute('role')).toBe('button');
      expect(await card.getAttribute('tabindex')).toBe('0');
      const aria = await card.getAttribute('aria-label');
      expect(aria).toMatch(/view in Pipeline/i);
      const cursor = await card.evaluate(el => getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    }
  });

  test('FIX 3: clicking a Timeline card navigates to Pipeline + highlights the row', async ({ page }) => {
    await page.evaluate(() => fcShow('timeline'));
    await page.waitForTimeout(150);
    // First card in the Jun bucket is NovaVault (renewal Jun 1).
    await page.locator('#fc-timeline .fc-tl-acct').first().click();
    await page.waitForTimeout(220);
    await expect(page.locator('#fc-pipeline.on')).toBeVisible();
    // The Pipeline row carries the fc-row-highlight class for 2s.
    await expect(page.locator('#fc-pipeline .fc-pipe-tbl tbody tr.fc-row-highlight')).toHaveCount(1);
  });

  test('FIX 3: Enter on a focused Timeline card triggers navigation', async ({ page }) => {
    await page.evaluate(() => fcShow('timeline'));
    await page.waitForTimeout(150);
    await page.locator('#fc-timeline .fc-tl-acct').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(220);
    await expect(page.locator('#fc-pipeline.on')).toBeVisible();
  });

  // ── FIX 4: Recovery Path section ────────────────────────────────────────
  test('FIX 4: Recovery Path renders when quota is set and gap is negative', async ({ page }) => {
    // The current FC_PIPELINE commit total is below a high quota — set one
    // intentionally large so gap is negative.
    await page.evaluate(() => fcWriteQuota(500000));
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    await expect(page.locator('#fc-recovery')).toBeVisible();
    const role = await page.locator('#fc-recovery').getAttribute('role');
    expect(role).toBe('note');
    const txt = await page.locator('#fc-recovery').textContent();
    expect(txt).toMatch(/Recovery path/i);
    expect(txt).toMatch(/Acme Corp expansion signal/);
    expect(txt).toMatch(/\$12K.{0,3}\$18K/);
    expect(txt).toMatch(/David Kim/);
  });

  test('FIX 4: Recovery Path "Open Expansion Play" fires Prep Me for Acme', async ({ page }) => {
    await page.evaluate(() => fcWriteQuota(500000));
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    await page.evaluate(() => { window._captured = null; const orig = window.openAgentDrawer; window.openAgentDrawer = (t,a) => { window._captured = [t,a]; return orig.apply(this, arguments); }; });
    await page.locator('#fc-recovery .fc-recovery-act').click();
    await page.waitForTimeout(120);
    const cap = await page.evaluate(() => window._captured);
    expect(cap).toEqual(['prep', 'acme']);
  });

  test('FIX 4: positive-gap state shows above-quota message + upside reminder', async ({ page }) => {
    // Small quota → commit total is above quota → positive gap.
    await page.evaluate(() => fcWriteQuota(10000));
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    await expect(page.locator('#fc-recovery.positive')).toBeVisible();
    const txt = await page.locator('#fc-recovery').textContent();
    expect(txt).toMatch(/Above quota/);
    expect(txt).toMatch(/Acme expansion could add/);
  });

  test('FIX 4: Recovery Path is hidden when no quota is set', async ({ page }) => {
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    expect(await page.locator('#fc-recovery').count()).toBe(0);
  });

  // ── FEATURE: freeform notes in every drawer ─────────────────────────────
  test('FEATURE: notes section renders inside the agent drawer with aria-label', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    await expect(page.locator('#dr-note-ta-save-nova')).toBeVisible();
    const aria = await page.locator('#dr-note-ta-save-nova').getAttribute('aria-label');
    expect(aria).toMatch(/NovaVault Save Strategy notes/);
    const describes = await page.locator('#dr-note-ta-save-nova').getAttribute('aria-describedby');
    expect(describes).toBe('dr-note-cc-save-nova');
    const max = await page.locator('#dr-note-ta-save-nova').getAttribute('maxlength');
    expect(max).toBe('500');
  });

  test('FEATURE: note saves to localStorage and re-hydrates on re-open', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('risk', 'brightex'));
    await page.waitForTimeout(180);
    await page.fill('#dr-note-ta-risk-brightex', 'Champion sentiment is bouncing back — Maggie confirmed.');
    await page.evaluate(() => dr_NoteSave('risk', 'brightex'));
    await page.waitForTimeout(120);
    const stored = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('teamos_drawer_notes') || '{}'); } catch (e) { return {}; } });
    expect(stored['brightex_risk_analyst']).toMatch(/bouncing back/);
    // Toast fires.
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Note saved · Brightex Inc · Gainsight timeline updated/);
    // Close and reopen — note re-hydrates.
    await page.evaluate(() => closeDrawer());
    await page.waitForTimeout(100);
    await page.evaluate(() => openAgentDrawer('risk', 'brightex'));
    await page.waitForTimeout(180);
    const val = await page.locator('#dr-note-ta-risk-brightex').inputValue();
    expect(val).toMatch(/bouncing back/);
  });

  test('FEATURE: char counter updates on input', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    await page.fill('#dr-note-ta-save-nova', 'Hello');
    await page.waitForTimeout(80);
    const cc = await page.locator('#dr-note-cc-save-nova').textContent();
    expect(cc).toMatch(/^5 \/ 500/);
  });

  test('FEATURE: notes section also renders inside the Ghost-Buster drawer', async ({ page }) => {
    // v4.19.0 — switched from Meridian → Creston because Meridian now triggers
    // the inbound-suppression warning, which doesn't include the notes field.
    await page.evaluate(() => rsOpenGB('creston'));
    await page.waitForTimeout(220);
    await expect(page.locator('#dr-note-ta-gb-creston')).toBeVisible();
    const aria = await page.locator('#dr-note-ta-gb-creston').getAttribute('aria-label');
    expect(aria).toMatch(/Creston Software Ghost-Buster notes/);
  });

  // ── ENHANCEMENT: Copy Forecast Summary promoted ─────────────────────────
  test('ENHANCEMENT: Copy Forecast Summary is a full-width button below the stat tiles', async ({ page }) => {
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    const btn = page.locator('#fc-copy-summary-btn');
    await expect(btn).toBeVisible();
    const cls = await btn.getAttribute('class');
    expect(cls).toContain('fc-copy-summary-btn');
    const rect = await btn.evaluate(el => ({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));
    expect(rect.h).toBeGreaterThanOrEqual(38);
    // Width fills the rollup card minus padding — assert > 300 px on a desktop viewport.
    expect(rect.w).toBeGreaterThan(300);
  });

  // ── ENHANCEMENT: Risk Analysis attribution sentence ─────────────────────
  test('ENHANCEMENT: Risk Analysis drawer shows attribution sentence below the score', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('risk', 'brightex'));
    await page.waitForTimeout(180);
    const body = await page.locator('#drawer-scroll').textContent();
    expect(body).toMatch(/Based on health velocity, Gong sentiment trend, and champion engagement in the last 30 days/);
  });

  test('ENHANCEMENT: Save Strategy drawer does NOT carry the Risk attribution', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    const body = await page.locator('#drawer-scroll').textContent();
    expect(body).not.toMatch(/Based on health velocity, Gong sentiment trend/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.15.0 — CSM DASHBOARD PRIORITY STACK FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.15.0 CSM Dashboard fixes', () => {
  // Default tab is already the Dashboard so no beforeEach navigation needed.

  // ── FIX 1: Draft Reply opens compose drawer ─────────────────────────────
  test('FIX 1: Priority Stack row 2 wires Draft Reply through psComposeOpen', async ({ page }) => {
    const onclick = await page.locator('#tab-dash .bf-priority .bf-it').nth(1).locator('.bf-act').getAttribute('onclick');
    expect(onclick).toMatch(/psBtnAction/);
    expect(onclick).toMatch(/psComposeOpen\('brightex'\)/);
  });

  test('FIX 1: psComposeOpen("brightex") opens the compose drawer (role=dialog, aria-modal)', async ({ page }) => {
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(160);
    await expect(page.locator('#ps-compose.on')).toBeVisible();
    expect(await page.locator('#ps-compose').getAttribute('role')).toBe('dialog');
    expect(await page.locator('#ps-compose').getAttribute('aria-modal')).toBe('true');
    const aria = await page.locator('#ps-compose').getAttribute('aria-label');
    expect(aria).toMatch(/Sarah Chen.*Brightex/);
    // Pre-filled fields.
    const body = await page.locator('#ps-compose-body').textContent();
    expect(body).toMatch(/SLA question · 4h ago/);
    expect(body).toMatch(/sarah.chen@brightex.com/);
    const subj = await page.locator('#ps-compose-subj').inputValue();
    expect(subj).toBe('Re: SLA question — Brightex');
    const ta = await page.locator('#ps-compose-ta').inputValue();
    expect(ta).toMatch(/Hi Sarah/);
  });

  test('FIX 1: tone selector swaps body language (professional → direct → empathetic)', async ({ page }) => {
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(120);
    const pro = await page.locator('#ps-compose-ta').inputValue();
    expect(pro).toMatch(/Following up on your SLA question/);
    await page.evaluate(() => psComposeSetTone('direct'));
    await page.waitForTimeout(80);
    const direct = await page.locator('#ps-compose-ta').inputValue();
    expect(direct).toMatch(/still needs an answer/);
    expect(direct.length).toBeLessThan(pro.length);
    await page.evaluate(() => psComposeSetTone('empathetic'));
    await page.waitForTimeout(80);
    const emp = await page.locator('#ps-compose-ta').inputValue();
    expect(emp).toMatch(/I take responsibility/);
  });

  test('FIX 1: Mark as Sent fires Gainsight toast + closes drawer', async ({ page }) => {
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(120);
    await page.evaluate(() => psComposeMarkSent());
    await page.waitForTimeout(150);
    await expect(page.locator('#ps-compose.on')).toHaveCount(0);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Reply logged · Brightex · Gainsight timeline/);
  });

  test('FIX 1: Escape closes the compose drawer', async ({ page }) => {
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(120);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    await expect(page.locator('#ps-compose.on')).toHaveCount(0);
  });

  // ── FIX 2: Ghost-Buster opens in-tab drawer without crashing ───────────
  test('FIX 2: Priority Stack row 4 routes Meridian Ghost-Buster through openGhostBuster', async ({ page }) => {
    const onclick = await page.locator('#tab-dash .bf-priority .bf-it').nth(3).locator('.bf-act').getAttribute('onclick');
    expect(onclick).toMatch(/openGhostBuster\('meridian'\)/);
    expect(onclick).not.toMatch(/openGhostBusterFromPopover/);
  });

  test('FIX 2: Priority Stack Ghost-Buster opens the in-tab gb-drawer', async ({ page }) => {
    await page.locator('#tab-dash .bf-priority .bf-it').nth(3).locator('.bf-act').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    // Stayed on the Dashboard tab.
    await expect(page.locator('#tab-dash')).toHaveClass(/on/);
  });

  // ── FIX 3: Prep Me on Acme wired ────────────────────────────────────────
  test('FIX 3: Priority Stack row 3 Prep Me opens the agent drawer for Acme', async ({ page }) => {
    const onclick = await page.locator('#tab-dash .bf-priority .bf-it').nth(2).locator('.bf-act').getAttribute('onclick');
    expect(onclick).toMatch(/openAgentDrawer\('prep','acme'\)/);
    await page.locator('#tab-dash .bf-priority .bf-it').nth(2).locator('.bf-act').click();
    await page.waitForTimeout(220);
    await expect(page.locator('#drawer.on')).toBeVisible();
    const title = await page.locator('#drawer-title').textContent();
    expect(title).toMatch(/Pre-Call Brief/);
  });

  // ── FIX 4: loading states ───────────────────────────────────────────────
  test('FIX 4: every Priority Stack action button routes through psBtnAction', async ({ page }) => {
    const btns = page.locator('#tab-dash .bf-priority .bf-act');
    expect(await btns.count()).toBe(5);
    for (let i = 0; i < 5; i++) {
      const onclick = await btns.nth(i).getAttribute('onclick');
      expect(onclick).toMatch(/^psBtnAction\(this,/);
    }
  });

  test('FIX 4: clicking a Priority Stack button momentarily flips it to .ps-loading + aria-busy', async ({ page }) => {
    // Intercept the action so the loading state stays visible.
    await page.evaluate(() => { window._origOpenAgentDrawer = openAgentDrawer; window.openAgentDrawer = function(){ /* swallow */ }; });
    await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').click();
    await page.waitForTimeout(80);
    const cls = await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').getAttribute('class');
    expect(cls).toMatch(/ps-loading/);
    const busy = await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').getAttribute('aria-busy');
    expect(busy).toBe('true');
    const aria = await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').getAttribute('aria-label');
    expect(aria).toMatch(/Loading Save Strategy/);
    // Restore.
    await page.evaluate(() => { openAgentDrawer = window._origOpenAgentDrawer; });
  });

  test('FIX 4: loading state clears once the drawer mounts', async ({ page }) => {
    await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#drawer.on')).toBeVisible();
    const cls = await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-act').getAttribute('class');
    expect(cls).not.toMatch(/ps-loading/);
  });

  // ── FIX 5: company name clicks ──────────────────────────────────────────
  test('FIX 5: every Priority Stack name carries role=button + tabindex + aria-label', async ({ page }) => {
    const names = page.locator('#tab-dash .bf-priority .bf-nm');
    const total = await names.count();
    expect(total).toBe(5);
    for (let i = 0; i < total; i++) {
      expect(await names.nth(i).getAttribute('role')).toBe('button');
      expect(await names.nth(i).getAttribute('tabindex')).toBe('0');
      const aria = await names.nth(i).getAttribute('aria-label');
      expect(aria).toMatch(/^View .* in Agent Hub$/);
    }
  });

  test('FIX 5: clicking a Priority Stack name updates _activeAccount via Agent Hub jump', async ({ page }) => {
    await page.locator('#tab-dash .bf-priority .bf-it').nth(0).locator('.bf-nm').click();
    await page.waitForTimeout(200);
    const acct = await page.evaluate(() => window._activeAccount);
    expect(acct).toBe('nova');
  });

  test('FIX 5: Enter on a focused Priority Stack name triggers the same jump', async ({ page }) => {
    // Reset to default.
    await page.evaluate(() => resetPanel && resetPanel());
    await page.waitForTimeout(100);
    await page.locator('#tab-dash .bf-priority .bf-it').nth(1).locator('.bf-nm').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const acct = await page.evaluate(() => window._activeAccount);
    expect(acct).toBe('brightex');
  });

  // ── FIX 6: confirmation toasts on drawer actions ────────────────────────
  test('FIX 6: Save Strategy "Push to Gainsight" fires the spec toast', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    const btn = page.locator('#drawer-ft button').first();
    const label = await btn.textContent();
    expect(label).toMatch(/Push to Gainsight/);
    await btn.click();
    await page.waitForTimeout(150);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/3 CTAs created in Gainsight · NovaVault · Assigned to Carmen/);
  });

  test('FIX 6: Pre-Call Brief "Copy battle card" fires clipboard toast', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('prep', 'nova'));
    await page.waitForTimeout(180);
    // Find the Copy battle card button by label.
    const buttons = page.locator('#drawer-ft button');
    const total = await buttons.count();
    let hit = false;
    for (let i = 0; i < total; i++) {
      const txt = await buttons.nth(i).textContent();
      if (/Copy battle card/i.test(txt)) {
        await buttons.nth(i).click();
        await page.waitForTimeout(150);
        const t = await page.locator('#toast-el').textContent();
        expect(t).toMatch(/Battle card copied/);
        hit = true;
        break;
      }
    }
    expect(hit).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.16.0 — DRAWER MANAGER + URGENT INBOX REDESIGN
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.16.0 Drawer manager + Urgent Inbox', () => {
  // ── FIX 1: single-drawer-at-a-time invariant ────────────────────────────
  test('FIX 1: opening a second drawer closes the first', async ({ page }) => {
    // Open the agent drawer (Save Strategy / NovaVault).
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    await expect(page.locator('#drawer.on')).toBeVisible();
    expect(await page.evaluate(() => _openDrawer)).toBe('agent');
    // Open the Ghost-Buster drawer — agent drawer should close.
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(220);
    await expect(page.locator('#gb-drawer.on')).toBeVisible();
    await expect(page.locator('#drawer.on')).toHaveCount(0);
    expect(await page.evaluate(() => _openDrawer)).toBe('gb');
  });

  test('FIX 1: opening the Compose drawer closes the agent drawer', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(150);
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(220);
    await expect(page.locator('#ps-compose.on')).toBeVisible();
    await expect(page.locator('#drawer.on')).toHaveCount(0);
    expect(await page.evaluate(() => _openDrawer)).toBe('compose');
  });

  test('FIX 1: closeAllDrawers also clears the Account Snapshot sub-panel', async ({ page }) => {
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.waitForTimeout(150);
    // Open the matrix snapshot.
    await page.evaluate(() => rsMxSelect('nova'));
    await page.waitForTimeout(120);
    await expect(page.locator('#rs-mx-snap.on')).toBeVisible();
    // Open a full drawer — snapshot should close.
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(200);
    await expect(page.locator('#drawer.on')).toBeVisible();
    await expect(page.locator('#rs-mx-snap.on')).toHaveCount(0);
  });

  test('FIX 1: closeAllDrawers helper exists at window scope', async ({ page }) => {
    expect(await page.evaluate(() => typeof closeAllDrawers)).toBe('function');
    // Open + close cycles return _openDrawer to null.
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(180);
    expect(await page.evaluate(() => _openDrawer)).toBe('agent');
    await page.evaluate(() => closeDrawer());
    await page.waitForTimeout(120);
    expect(await page.evaluate(() => _openDrawer)).toBeNull();
  });

  test('FIX 1: Escape closes the topmost drawer (compose) without affecting others', async ({ page }) => {
    await page.evaluate(() => psComposeOpen('brightex'));
    await page.waitForTimeout(180);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(180);
    await expect(page.locator('#ps-compose.on')).toHaveCount(0);
    expect(await page.evaluate(() => _openDrawer)).toBeNull();
  });

  test('FIX 1: opening the Campaign view drawer closes the agent drawer', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(150);
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(180);
    await page.evaluate(() => cmCampView('cmp1'));
    await page.waitForTimeout(200);
    await expect(page.locator('#cm-cv-drawer.on')).toBeVisible();
    await expect(page.locator('#drawer.on')).toHaveCount(0);
  });

  // ── FIX 2: Urgent Inbox rows ────────────────────────────────────────────
  test('FIX 2: every Urgent Inbox row shows full first name + account, no truncation', async ({ page }) => {
    const rows = page.locator('#tab-dash .ii');
    expect(await rows.count()).toBe(4);
    const expected = [
      { nm:'Michael Torres', acct:'NovaVault' },
      { nm:'Maggie Spry',    acct:'CS Leadership' },
      { nm:'Sarah Chen',     acct:'Brightex' },
      { nm:'Jennifer Ramos', acct:'Meridian' }
    ];
    for (let i = 0; i < 4; i++) {
      const nm   = await rows.nth(i).locator('.ii-nm').textContent();
      const acct = await rows.nth(i).locator('.ii-acct').textContent();
      expect(nm.trim()).toBe(expected[i].nm);
      expect(acct.trim()).toBe(expected[i].acct);
    }
  });

  test('FIX 2: every row carries the expected status chip + source chip', async ({ page }) => {
    const rows = page.locator('#tab-dash .ii');
    const expected = [
      { status:'CRITICAL SAVE', statusCls:'tb-crit',  source:'GAINSIGHT', sourceCls:'gainsight' },
      { status:'DM',            statusCls:'tb-watch', source:'SLACK',     sourceCls:'slack'     },
      { status:'SLA OPEN',      statusCls:'tb-high',  source:'GMAIL',     sourceCls:'gmail'     },
      { status:'INBOUND',       statusCls:'tb-opp',   source:'GMAIL',     sourceCls:'gmail'     }
    ];
    for (let i = 0; i < 4; i++) {
      const row = rows.nth(i);
      const statusEl = row.locator('.tb').first();
      const statusTxt = (await statusEl.textContent()).trim();
      const statusCls = await statusEl.getAttribute('class');
      const sourceEl = row.locator('.tb-src');
      const sourceTxt = (await sourceEl.textContent()).trim();
      const sourceCls = await sourceEl.getAttribute('class');
      expect(statusTxt).toBe(expected[i].status);
      expect(statusCls).toContain(expected[i].statusCls);
      expect(sourceTxt).toBe(expected[i].source);
      expect(sourceCls).toContain(expected[i].sourceCls);
    }
  });

  test('FIX 2: row layout is two-line — Row 1 above Row 2 (chips wrapped below name)', async ({ page }) => {
    const row = page.locator('#tab-dash .ii').first();
    const r1Top = await row.locator('.ii-row1').evaluate(el => el.getBoundingClientRect().top);
    const r2Top = await row.locator('.ii-row2').evaluate(el => el.getBoundingClientRect().top);
    expect(r2Top).toBeGreaterThan(r1Top);
  });

  test('FIX 2: each row is keyboard-reachable (role=button + tabindex + aria-label)', async ({ page }) => {
    const rows = page.locator('#tab-dash .ii');
    for (let i = 0; i < 4; i++) {
      expect(await rows.nth(i).getAttribute('role')).toBe('button');
      expect(await rows.nth(i).getAttribute('tabindex')).toBe('0');
      const aria = await rows.nth(i).getAttribute('aria-label');
      expect(aria).toMatch(/[A-Z][a-z]+ [A-Z][a-z]+,/);
      expect(aria).toMatch(/h ago$/);
    }
  });

  test('FIX 2: Enter on a focused row triggers acctClick', async ({ page }) => {
    await page.locator('#tab-dash .ii').nth(2).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const acct = await page.evaluate(() => window._activeAccount);
    expect(acct).toBe('brightex');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.17.0 — FORECASTING WORKFLOW FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.17.0 Forecasting workflow fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('forecast', document.querySelector('[onclick*="goTab(\'forecast\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: auto-regen narrative ─────────────────────────────────────────
  test('FIX 1: fcScheduleRegen + fcRegenerateDust + aria-live span exist', async ({ page }) => {
    expect(await page.evaluate(() => typeof fcScheduleRegen)).toBe('function');
    expect(await page.evaluate(() => typeof fcRegenerateDust)).toBe('function');
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    expect(await page.locator('#fc-dust-gen').getAttribute('aria-live')).toBe('polite');
  });

  test('FIX 1: fcSaveOverride schedules a debounced regen', async ({ page }) => {
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(200);
    const before = await page.locator('#fc-dust-gen').textContent();
    // Fire the override save. The debounce delays the regen by 2s.
    await page.evaluate(() => fcSaveOverride('nova', '28000'));
    await page.waitForTimeout(150);
    const timerSet = await page.evaluate(() => _fcRegenTimer !== null);
    expect(timerSet).toBe(true);
    // After the 2s debounce + the 350ms internal handoff, the timestamp swaps.
    await page.waitForTimeout(2500);
    const after = await page.locator('#fc-dust-gen').textContent();
    // The text is either the "Updated just now" flash or the fresh timestamp;
    // either way it should differ from the original.
    expect(after).not.toBe(before);
  });

  test('FIX 1: fcSetStatus also schedules a regen', async ({ page }) => {
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(150);
    await page.evaluate(() => fcSetStatus('brightex', 'churn'));
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => _fcRegenTimer !== null)).toBe(true);
  });

  test('FIX 1: rapid edits collapse to a single regen (debounce holds)', async ({ page }) => {
    await page.evaluate(() => fcShow('dust'));
    await page.waitForTimeout(150);
    // Fire 3 saves in quick succession. Only the LAST one's timer should
    // remain pending (the earlier ones get cleared).
    await page.evaluate(() => {
      fcSaveOverride('nova', '20000');
      fcSaveOverride('nova', '25000');
      fcSaveOverride('nova', '28000');
    });
    await page.waitForTimeout(100);
    const stillPending = await page.evaluate(() => _fcRegenTimer !== null);
    expect(stillPending).toBe(true);
  });

  // ── FIX 2: Copy Forecast Summary attainment header ──────────────────────
  test('FIX 2: summary with quota set carries Attainment line first', async ({ page }) => {
    await page.evaluate(() => fcWriteQuota(150000));
    await page.waitForTimeout(100);
    const summary = await page.evaluate(() => fcBuildForecastSummary());
    expect(summary).toMatch(/^Q2 2026 Forecast/m);
    expect(summary).toMatch(/Attainment: \$\d+K of \$150K \(\d+% · [+−]\$\d+K vs target\)/);
    expect(summary).toMatch(/Commit: \$\d+K \| At Risk: \$\d+K \| Gap: [+−]\$\d+K/);
  });

  test('FIX 2: summary without quota nudges the CSM to set one', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.removeItem('teamos_forecast_quota'); } catch (e) {} });
    const summary = await page.evaluate(() => fcBuildForecastSummary());
    expect(summary).not.toMatch(/Attainment:/);
    expect(summary).toMatch(/Commit: \$\d+K \| At Risk: \$\d+K/);
    expect(summary).toMatch(/Set a quota target to see attainment %/);
  });

  // ── FIX 3: NovaVault Extension Terms give-get ───────────────────────────
  test('FIX 3: NovaVault Save Strategy extGroups has offers + needs', async ({ page }) => {
    const groups = await page.evaluate(() => {
      const ext = DRAWER.save.nova.sections.find(s => s.t === 'Extension Terms');
      return ext && ext.extGroups ? ext.extGroups.map(g => ({ tone:g.tone, label:g.label, count:g.rows.length })) : null;
    });
    expect(groups).not.toBeNull();
    expect(groups.length).toBe(2);
    expect(groups[0].tone).toBe('offer');
    expect(groups[0].label).toMatch(/What 1Password offers/);
    expect(groups[1].tone).toBe('need');
    expect(groups[1].label).toMatch(/What we need from NovaVault/);
  });

  test('FIX 3: drawer renders both give-get groups + aria-label on the needs region', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('save', 'nova'));
    await page.waitForTimeout(200);
    const body = await page.locator('#drawer-scroll').textContent();
    expect(body).toMatch(/What 1Password offers/);
    expect(body).toMatch(/60-day extension/);
    expect(body).toMatch(/What we need from NovaVault/);
    expect(body).toMatch(/Champion intro: Michael Torres/);
    expect(body).toMatch(/Exec sponsor/);
    expect(body).toMatch(/Evaluation commitment/);
    const region = page.locator('#drawer-scroll [role="region"][aria-label="What we need from NovaVault"]');
    await expect(region).toHaveCount(1);
  });

  // ── FIX 4: Prep Me Call Success ────────────────────────────────────────
  test('FIX 4: every Prep Me account carries a Call Success section', async ({ page }) => {
    for (const acct of ['acme','brightex','nova']) {
      const hasCS = await page.evaluate(a => {
        return DRAWER.prep[a].sections.some(s => s.callSuccess && s.callSuccess.win && s.callSuccess.acceptable && s.callSuccess.avoid);
      }, acct);
      expect(hasCS).toBe(true);
    }
  });

  test('FIX 4: Call Success section renders WIN/ACCEPTABLE/AVOID pills with role=note', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('prep', 'acme'));
    await page.waitForTimeout(200);
    const region = page.locator('#drawer-scroll [role="note"][aria-label*="Acme"]').first();
    await expect(region).toHaveCount(1);
    const txt = await region.textContent();
    expect(txt).toMatch(/WIN/);
    expect(txt).toMatch(/ACCEPTABLE/);
    expect(txt).toMatch(/AVOID/);
    expect(txt).toMatch(/David Kim/);
  });

  test('FIX 4: NovaVault Call Success carries the spec wording', async ({ page }) => {
    await page.evaluate(() => openAgentDrawer('prep', 'nova'));
    await page.waitForTimeout(200);
    const body = await page.locator('#drawer-scroll').textContent();
    expect(body).toMatch(/Michael Torres agrees to the extension/);
    expect(body).toMatch(/joins the kick-off call by June 8/);
    expect(body).toMatch(/decision date/);
    expect(body).toMatch(/renewal date passes/);
  });

  test('FIX 4: Call Success section sits between Account Snapshot and Last Gong', async ({ page }) => {
    const order = await page.evaluate(() => DRAWER.prep.acme.sections.map(s => s.t));
    expect(order[0]).toMatch(/Account Snapshot/);
    expect(order[1]).toMatch(/Call Success/);
    expect(order[2]).toMatch(/Last Gong/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.18.0 — CAMPAIGN MANAGER WORKFLOW FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.18.0 Campaign Manager workflow fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('campaigns', document.querySelector('[onclick*="goTab(\'campaigns\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: unfilled placeholder blocks send ─────────────────────────────
  test('FIX 1: cmFindWizardUnfilled returns per-contact placeholder labels', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3','c5']; CM_WIZ.template='t3'; });
    const offenders = await page.evaluate(() => {
      const pool = CM_WIZ.contacts.map(id => CM_CONTACTS.find(c => c.id === id));
      return cmFindWizardUnfilled(pool).map(o => ({ name:o.name, n:o.placeholderLabels.length }));
    });
    expect(offenders.length).toBe(2);
    expect(offenders[0].n).toBeGreaterThanOrEqual(1);
    expect(offenders[1].n).toBeGreaterThanOrEqual(1);
  });

  test('FIX 1: Send Now from wizard blocks when placeholders are unfilled', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3','c5']; CM_WIZ.template='t3'; CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSend());
    await page.waitForTimeout(200);
    // Warning modal opens; recipient list does NOT.
    const role = await page.locator('#cm-modal').getAttribute('role');
    expect(role).toBe('alertdialog');
    const aria = await page.locator('#cm-modal').getAttribute('aria-label');
    expect(aria).toMatch(/Unfilled placeholders detected/);
    const body = await page.locator('#cm-modal-body').textContent();
    expect(body).toMatch(/Unfilled placeholders detected/);
    expect(body).toMatch(/Sarah Chen/);
    expect(body).toMatch(/Michael Torres/);
    // Review Drafts button focused.
    const focusedId = await page.evaluate(() => document.activeElement && document.activeElement.id);
    expect(focusedId).toBe('cm-ph-warn-review');
  });

  test('FIX 1: Review Drafts jumps wizard to Step 3 on the first offender', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3','c5']; CM_WIZ.template='t3'; CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSend());
    await page.waitForTimeout(150);
    await page.evaluate(() => cmReviewUnfilled('c3'));
    await page.waitForTimeout(200);
    const step = await page.evaluate(() => CM_WIZ.step);
    expect(step).toBe(3);
    const previewIdx = await page.evaluate(() => CM_WIZ.previewIdx);
    expect(previewIdx).toBe(0);
  });

  test('FIX 1: Quick Send blocks when placeholders are in the message body', async ({ page }) => {
    await page.evaluate(() => cmQuickSendOpen());
    await page.waitForTimeout(150);
    await page.evaluate(() => { cmQsPick('c1'); });
    await page.fill('#cm-qs-subj', 'Hi');
    await page.fill('#cm-qs-msg', 'Hi David, here is the [Account-specific value summary]. — Carmen');
    await page.evaluate(() => cmQuickSendSubmit());
    await page.waitForTimeout(180);
    const role = await page.locator('#cm-modal').getAttribute('role');
    expect(role).toBe('alertdialog');
    const body = await page.locator('#cm-modal-body').textContent();
    expect(body).toMatch(/David/);
    expect(body).toMatch(/Account-specific value summary/);
  });

  test('FIX 1: wizard with clean drafts sends without blocking', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name='QA'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c3']; CM_WIZ.template='t3'; CM_WIZ.step=5;
      CM_WIZ.drafts = { c3: { subject:'Clean subject', body:'Clean body, no brackets at all.' } };
      cmWizRender();
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSend());
    await page.waitForTimeout(200);
    const role = await page.locator('#cm-modal').getAttribute('role');
    expect(role).toBe('dialog');
    const cnt = await page.locator('.cm-send-row').count();
    expect(cnt).toBe(1);
  });

  // ── FIX 2: Step 2 account header health + last touch ────────────────────
  test('FIX 2: account header carries Health badge + Last touch field', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(180);
    const acmeMeta = await page.evaluate(() => {
      var groups = document.querySelectorAll('.cm-wiz-grp');
      for (var i = 0; i < groups.length; i++) {
        if (/ACME CORP/.test(groups[i].textContent)) {
          return groups[i].querySelector('.cm-wiz-grp-meta')?.textContent || null;
        }
      }
      return null;
    });
    expect(acmeMeta).toMatch(/Health: \s*82/);
    expect(acmeMeta).toMatch(/Last touch: \s*May 10/);
  });

  test('FIX 2: health badge color maps to band (red/amber/teal/gray)', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(180);
    const bands = await page.evaluate(() => {
      const out = {};
      document.querySelectorAll('.cm-wiz-grp').forEach(g => {
        const hd = g.querySelector('.cm-wiz-grp-hd > span');
        const badge = g.querySelector('.cm-wiz-grp-health');
        if (hd && badge) {
          out[hd.textContent.trim()] = Array.from(badge.classList).filter(c => /^(r|a|g|gy)$/.test(c))[0] || '';
        }
      });
      return out;
    });
    expect(bands['ACME CORP']).toBe('g');          // 82 → ≥75 → teal
    expect(bands['BRIGHTEX INC']).toBe('r');       // 48 → <50 → red
    expect(bands['NOVAVAULT']).toBe('r');          // 23 → <50 → red
    expect(bands['KLAXTON LABS']).toBe('a');       // 65 → 50-74 → amber
    expect(bands['MERIDIAN HEALTH SYSTEMS']).toBe('gy'); // null → gray
  });

  test('FIX 2: health badge aria-label spells out status', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.step=2; cmWizRender(); });
    await page.waitForTimeout(180);
    const aria = await page.evaluate(() => {
      const groups = document.querySelectorAll('.cm-wiz-grp');
      for (const g of groups) {
        if (/NOVAVAULT/.test(g.textContent)) {
          return g.querySelector('.cm-wiz-grp-health')?.getAttribute('aria-label');
        }
      }
      return null;
    });
    expect(aria).toMatch(/Health score: 23, Critical/);
  });

  // ── FIX 3: per-touch template selector ──────────────────────────────────
  test('FIX 3: every touch row has a Template select with "Same as campaign" + 6 templates + new', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.touchCount=3; CM_WIZ.step=4; cmWizRender(); });
    await page.waitForTimeout(180);
    const selects = await page.locator('.cm-wiz-touch select[aria-label^="Template"]').count();
    expect(selects).toBe(3);
    const firstOptions = await page.evaluate(() => Array.from(document.querySelectorAll('.cm-wiz-touch select[aria-label^="Template"]')[0].options).map(o => o.value));
    expect(firstOptions[0]).toBe('same');
    expect(firstOptions[firstOptions.length - 1]).toBe('__new__');
    // 6 default templates exist in CM_TEMPLATES.
    expect(firstOptions.length).toBe(2 + 6);
  });

  test('FIX 3: changing a touch template updates CM_WIZ + per-touch summary', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.touchCount=2; CM_WIZ.step=4; cmWizRender(); });
    await page.waitForTimeout(180);
    await page.evaluate(() => cmWizSetTouchTpl(1, 't2'));
    await page.waitForTimeout(100);
    const tpl = await page.evaluate(() => CM_WIZ.touches[1].tpl);
    expect(tpl).toBe('t2');
    const sum = await page.locator('#cm-wiz-touch-sum-1').textContent();
    expect(sum).toMatch(/EBR Invitation/);
  });

  test('FIX 3: "+ New template" opens the template builder modal without changing state', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.touchCount=2; CM_WIZ.step=4; cmWizRender(); });
    await page.waitForTimeout(180);
    await page.evaluate(() => cmWizSetTouchTpl(0, '__new__'));
    await page.waitForTimeout(180);
    const tpl = await page.evaluate(() => CM_WIZ.touches[0].tpl);
    expect(tpl).toBe('same');
    // The generic modal is now showing the template builder (cmNewTemplate).
    await expect(page.locator('#cm-modal-ov.on')).toBeVisible();
  });

  test('FIX 3: Step 5 sequence summary surfaces per-touch templates', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c1']; CM_WIZ.template='t3'; CM_WIZ.touchCount=3; CM_WIZ.step=4; cmWizRender(); });
    await page.evaluate(() => { cmWizSetTouchTpl(1, 't2'); cmWizSetTouchTpl(2, 't5'); });
    await page.evaluate(() => { CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(200);
    const txt = await page.locator('.cm-wiz-summary').textContent();
    expect(txt).toMatch(/T1: Same as campaign/);
    expect(txt).toMatch(/T2: EBR Invitation/);
    expect(txt).toMatch(/T3: Champion Introduction/);
  });

  // ── FIX 4: Call task channel ────────────────────────────────────────────
  test('FIX 4: channel dropdown carries Call task as 4th option', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.touchCount=1; CM_WIZ.step=4; cmWizRender(); });
    await page.waitForTimeout(180);
    const opts = await page.evaluate(() => Array.from(document.querySelector('.cm-wiz-touch select[aria-label^="Channel"]').options).map(o => o.value));
    expect(opts).toEqual(['email','slack','linkedin','call']);
  });

  test('FIX 4: selecting Call task swaps summary to Gainsight CTA wording', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.touchCount=2; CM_WIZ.step=4; cmWizRender(); });
    await page.waitForTimeout(180);
    await page.evaluate(() => cmWizSetTouchField(1, 'c', 'call'));
    await page.waitForTimeout(100);
    const sum = await page.locator('#cm-wiz-touch-sum-1').textContent();
    expect(sum).toMatch(/Call task/);
    expect(sum).toMatch(/Gainsight CTA/);
  });

  test('FIX 4: Step 5 sequence shows mixed channels (Email → Call task → Email)', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => { CM_WIZ.name='X'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c1']; CM_WIZ.template='t3'; CM_WIZ.touchCount=3; CM_WIZ.step=4; cmWizRender(); });
    await page.evaluate(() => cmWizSetTouchField(1, 'c', 'call'));
    await page.evaluate(() => { CM_WIZ.step=5; cmWizRender(); });
    await page.waitForTimeout(200);
    const txt = await page.locator('.cm-wiz-summary').textContent();
    expect(txt).toMatch(/Email → Call task → Email/);
  });

  test('FIX 4: launching a campaign with a Call touch fires the Gainsight CTA toast', async ({ page }) => {
    await page.evaluate(() => cmOpenWizard());
    await page.evaluate(() => {
      CM_WIZ.name='QA Call'; CM_WIZ.type='renewal'; CM_WIZ.contacts=['c1']; CM_WIZ.template='t3'; CM_WIZ.step=5;
      CM_WIZ.touches = [{c:'email',d:'now',t:'',tpl:'same'},{c:'call',d:'5',t:'',tpl:'same'}];
      CM_WIZ.touchCount = 2;
      // Clean drafts so the send isn't blocked by the v4.18.0 placeholder check.
      CM_WIZ.drafts = { c1: { subject:'Clean', body:'Clean body, no brackets.' } };
      cmWizRender();
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => cmWizSendActual());
    // Wait long enough for the deferred call-toast (600 ms after the launch toast).
    await page.waitForTimeout(1000);
    const t = await page.locator('#toast-el').textContent();
    expect(t).toMatch(/Call task created · Gainsight CTA/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// v4.19.0 — RISK & SIGNALS WORKFLOW FIXES
// ════════════════════════════════════════════════════════════════════════════
test.describe('v4.19.0 Risk & Signals workflow fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => goTab('risk', document.querySelector('[onclick*="goTab(\'risk\'"]')));
    await page.waitForTimeout(150);
  });

  // ── FIX 1: Ghost-Buster inbound suppression ─────────────────────────────
  test('FIX 1: rsFindInboundSignal hits Meridian + Brightex, misses Creston/Apex/Nova', async ({ page }) => {
    const map = await page.evaluate(() => ({
      meridian: !!rsFindInboundSignal('meridian'),
      brightex: !!rsFindInboundSignal('brightex'),
      creston:  !!rsFindInboundSignal('creston'),
      apex:     !!rsFindInboundSignal('apex'),
      nova:     !!rsFindInboundSignal('nova')
    }));
    expect(map.meridian).toBe(true);
    expect(map.brightex).toBe(true);  // signal 6 src=INBOX (Sarah emailed 4h ago)
    expect(map.creston).toBe(false);
    expect(map.apex).toBe(false);
    expect(map.nova).toBe(false);
  });

  test('FIX 1: Meridian Ghost-Buster shows inbound suppression instead of sequence', async ({ page }) => {
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(220);
    const warn = page.locator('.gb-inbound-warn');
    await expect(warn).toBeVisible();
    expect(await warn.getAttribute('role')).toBe('alert');
    const body = await page.locator('#gb-drawer-body').textContent();
    expect(body).toMatch(/Inbound detected/);
    expect(body).toMatch(/Jennifer/);
    expect(body).toMatch(/Reply to Jennifer/);
    expect(body).not.toMatch(/Situation Read/);
  });

  test('FIX 1: Reply to Jennifer button routes to draftReply(meridian)', async ({ page }) => {
    await page.evaluate(() => { window._captured = null; const orig = window.draftReply; window.draftReply = function(a){ window._captured = a; if (typeof orig === 'function') return orig.apply(this, arguments); }; });
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(180);
    await page.click('#gb-inbound-reply');
    await page.waitForTimeout(200);
    const cap = await page.evaluate(() => window._captured);
    expect(cap).toBe('meridian');
  });

  test('FIX 1: "Launch Ghost-Buster anyway" bypasses suppression and shows the sequence', async ({ page }) => {
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(180);
    await page.evaluate(() => _gbDrawerOpenInternal('meridian', true));
    await page.waitForTimeout(220);
    await expect(page.locator('.gb-inbound-warn')).toHaveCount(0);
    const body = await page.locator('#gb-drawer-body').textContent();
    expect(body).toMatch(/Situation Read/);
  });

  test('FIX 1: Apex Ghost-Buster (no inbound) goes straight to the sequence', async ({ page }) => {
    await page.evaluate(() => rsOpenGB('apex'));
    await page.waitForTimeout(220);
    await expect(page.locator('.gb-inbound-warn')).toHaveCount(0);
    const body = await page.locator('#gb-drawer-body').textContent();
    expect(body).toMatch(/Situation Read/);
  });

  // ── FIX 2: Competitor flag in snapshot card ─────────────────────────────
  test('FIX 2: rsFindCompetitorFlag identifies Brightex + Okta + 2 calls', async ({ page }) => {
    const flag = await page.evaluate(() => rsFindCompetitorFlag('brightex'));
    expect(flag).not.toBeNull();
    expect(flag.name).toBe('Okta');
    expect(flag.calls).toBe(2);
  });

  test('FIX 2: Brightex snapshot card shows a Competitor row with Okta + ⚠', async ({ page }) => {
    await page.evaluate(() => rsMxSelect('brightex'));
    await page.waitForTimeout(150);
    const compRow = page.locator('#rs-mx-detail .rs-mx-comp');
    await expect(compRow).toBeVisible();
    const txt = await compRow.textContent();
    expect(txt).toMatch(/Okta flagged/);
    expect(txt).toMatch(/2 calls/);
    const aria = await compRow.getAttribute('aria-label');
    expect(aria).toMatch(/Competitor flag: Okta mentioned in 2 calls/);
  });

  test('FIX 2: Acme snapshot has no Competitor row (no competitor signal)', async ({ page }) => {
    await page.evaluate(() => rsMxSelect('acme'));
    await page.waitForTimeout(150);
    await expect(page.locator('#rs-mx-detail .rs-mx-comp')).toHaveCount(0);
  });

  // ── FIX 3: Dynamic dates in Save Play outcomes ──────────────────────────
  test('FIX 3: rsResolveDateTokens swaps {+Nbd} and {+Nd} tokens for real dates', async ({ page }) => {
    const result = await page.evaluate(() => rsResolveDateTokens('Touch 1 reply by {+2bd}. Touch 2 by {+5d}.'));
    // Output should have month-abbrev + day numerals; no leftover tokens.
    expect(result).not.toMatch(/\{\+/);
    expect(result).toMatch(/Touch 1 reply by [A-Z][a-z]{2} \d{1,2}/);
    expect(result).toMatch(/Touch 2 by [A-Z][a-z]{2} \d{1,2}/);
  });

  test('FIX 3: NovaVault Step 2 outcome renders dynamic dates (no May 18 hardcode)', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(180);
    // Step 2 auto-expands (v4.13.0 ENHANCEMENT). Read the rendered body.
    const body = await page.locator('#rs-pl-nova-step-2-body').textContent();
    expect(body).toMatch(/Touch 1 reply within 2 business days/);
    // The text should NOT carry an unresolved token.
    expect(body).not.toMatch(/\{\+/);
    // It should carry today + 2 business days, formatted "Mon DD".
    const expected = await page.evaluate(() => {
      function bd(date, n){ var d = new Date(date.getTime()); while (n>0){ d.setDate(d.getDate()+1); var dow = d.getDay(); if (dow!==0&&dow!==6) n--; } return d; }
      var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var t = bd(new Date(), 2);
      return m[t.getMonth()] + ' ' + t.getDate();
    });
    expect(body).toContain(expected);
  });

  test('FIX 3: rsAddBusinessDays skips weekends', async ({ page }) => {
    const out = await page.evaluate(() => {
      // Fri 2026-05-15 + 2 business days = Tue 2026-05-19 (skip Sat/Sun).
      var fri = new Date('2026-05-15T12:00:00Z');
      var d = rsAddBusinessDays(fri, 2);
      return d.getUTCDate();
    });
    expect(out).toBe(19);
  });

  // ── FIX 4: Signal staleness badges + sort ───────────────────────────────
  test('FIX 4: rsAgeBucket maps strings to NEW / FRESH / STALE', async ({ page }) => {
    const map = await page.evaluate(() => ({
      today:      rsAgeBucket('Today · 6:14 AM').bucket,
      hours:      rsAgeBucket('2h ago').bucket,
      yesterday:  rsAgeBucket('Yesterday').bucket,
      threeD:     rsAgeBucket('3d ago').bucket,
      sevenD:     rsAgeBucket('7d ago').bucket,
      fortyFive:  rsAgeBucket('45d ago').bucket
    }));
    expect(map.today).toBe('NEW');
    expect(map.hours).toBe('NEW');
    expect(map.yesterday).toBe('NEW');
    expect(map.threeD).toBe('FRESH');
    expect(map.sevenD).toBe('STALE');
    expect(map.fortyFive).toBe('STALE');
  });

  test('FIX 4: All Signals list carries NEW and STALE badges (FRESH carries none)', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(180);
    const counts = await page.evaluate(() => ({
      newCount:   document.querySelectorAll('.rs-sig-age.new').length,
      staleCount: document.querySelectorAll('.rs-sig-age.stale').length,
      anyFreshClass: document.querySelectorAll('.rs-sig-age.fresh').length
    }));
    expect(counts.newCount).toBeGreaterThanOrEqual(2);   // multiple "Today" + "Yesterday" + "Xh ago" entries
    expect(counts.staleCount).toBeGreaterThanOrEqual(2); // 17d ago, 45d ago, 67d ago at least
    expect(counts.anyFreshClass).toBe(0);
  });

  test('FIX 4: default "newest" sort puts NEW signals before STALE within each severity tier', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(180);
    // Compare positions of the 3 Critical signals: NovaVault champion (2h),
    // NovaVault contract not opened (17d → STALE), NovaVault Gong silence
    // (45d → STALE). The NEW one should render before the STALE pair.
    const order = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#rs-sec-signals .rs-sig-row.crit'));
      return rows.map(r => r.querySelector('.rs-sig-desc')?.textContent || '');
    });
    expect(order.length).toBe(3);
    expect(order[0]).toMatch(/Champion departed/); // 2h ago → NEW
    expect(order.slice(1).join(' ')).toMatch(/Contract not opened/);
    expect(order.slice(1).join(' ')).toMatch(/Gong silence/);
  });

  test('FIX 4: staleness aria-label spells out the age + bucket', async ({ page }) => {
    await page.evaluate(() => rsShow('signals'));
    await page.waitForTimeout(180);
    const stale = await page.locator('.rs-sig-age.stale').first().getAttribute('aria-label');
    expect(stale).toMatch(/Signal age: \d+ days ago, STALE/);
    const fresh = await page.locator('.rs-sig-age.new').first().getAttribute('aria-label');
    expect(fresh).toMatch(/, NEW$/);
  });
});
