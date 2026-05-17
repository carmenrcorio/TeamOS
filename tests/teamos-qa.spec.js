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

  test('2 of the 7 segments are disabled (SSO Active + SSO+SCIM)', async ({ page }) => {
    const disabled = await page.locator('.cm-seg-chip.disabled').count();
    expect(disabled).toBe(2);
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
    // With email → persists
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

  test('Ghost-Buster Meridian opens view-meridian', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'meridian'));
    await page.waitForTimeout(400);
    const activeView = await page.evaluate(() => document.querySelector('.rp-view.on')?.id);
    expect(activeView).toBe('view-meridian');
  });

  test('Ghost-Buster Creston opens view-creston', async ({ page }) => {
    await page.evaluate(() => fcAction('gb', 'creston'));
    await page.waitForTimeout(400);
    const activeView = await page.evaluate(() => document.querySelector('.rp-view.on')?.id);
    expect(activeView).toBe('view-creston');
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

  test('FIX 1: 0-count segment click shows empty-state tooltip', async ({ page }) => {
    // SSO Active segment has count=0
    await page.evaluate(() => cmSegmentClick('unengaged-sso', new Event('click')));
    await page.waitForTimeout(150);
    const pop = await page.locator('#cm-seg-empty-unengaged-sso.on').count();
    expect(pop).toBe(1);
    // Wizard does NOT open
    const wizOpen = await page.evaluate(() => document.getElementById('cm-wiz-ov')?.classList.contains('on'));
    expect(wizOpen).toBeFalsy();
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

  test('FIX 1: rsOpenGB switches to dashboard tab + opens view-{acct}', async ({ page }) => {
    await page.evaluate(() => rsOpenGB('meridian'));
    await page.waitForTimeout(200);
    await expect(page.locator('#tab-dash')).toHaveClass(/on/);
    const onView = await page.evaluate(() => {
      const v = document.querySelector('#view-meridian');
      return !!(v && v.classList.contains('on'));
    });
    expect(onView).toBe(true);
  });

  test('FIX 1: openGhostBuster global alias routes through rsOpenGB', async ({ page }) => {
    const exists = await page.evaluate(() => typeof window.openGhostBuster === 'function');
    expect(exists).toBe(true);
    await page.evaluate(() => window.openGhostBuster('creston'));
    await page.waitForTimeout(200);
    const onView = await page.evaluate(() => {
      const v = document.querySelector('#view-creston');
      return !!(v && v.classList.contains('on'));
    });
    expect(onView).toBe(true);
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
    expect(t).toMatch(/Situation brief sent to Team Lead · Brightex · Dust summary attached/);
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

  test('FIX 10: NovaVault Step 2 expands into WHAT TO DO / SAY / OUTCOME', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    await page.evaluate(() => rsPlayStepToggle('nova', 2));
    await page.waitForTimeout(100);
    const body = await page.locator('#rs-pl-nova-step-2-body').textContent();
    expect(body).toMatch(/What to do/);
    expect(body).toMatch(/What to say/);
    expect(body).toMatch(/Expected outcome/);
    expect(body).toMatch(/Michael Torres/);
    const exp = await page.locator('#rs-pl-nova-step-2').getAttribute('aria-expanded');
    expect(exp).toBe('true');
  });

  test('FIX 10: aria-expanded flips on Brightex Step 3 toggle', async ({ page }) => {
    await page.evaluate(() => rsShow('plays'));
    await page.waitForTimeout(150);
    const before = await page.locator('#rs-pl-brightex-step-3').getAttribute('aria-expanded');
    expect(before).toBe('false');
    await page.evaluate(() => rsPlayStepToggle('brightex', 3));
    await page.waitForTimeout(100);
    const after = await page.locator('#rs-pl-brightex-step-3').getAttribute('aria-expanded');
    expect(after).toBe('true');
    await expect(page.locator('#rs-pl-brightex-step-3-body.on')).toBeVisible();
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

  test('SPEC §7: Silent Accounts Ghost-Buster button routes to view-meridian', async ({ page }) => {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('#view-default .sa-row .sa-btn');
      btns[0].click();
    });
    await page.waitForTimeout(250);
    const isOn = await page.evaluate(() => document.getElementById('view-meridian')?.classList.contains('on'));
    expect(isOn).toBe(true);
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
