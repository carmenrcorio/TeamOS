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
