import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXCHANGE_TIERS,
  normalizeExchangeTier,
  getExchangeTier,
  canTierAccessNavKey,
  getTierForUser,
} from './exchangeTiers.js';
import {
  normalizeRole,
  getRoleLevel,
  canAccessRoute,
  getAllowedNavItems,
  SARRAAF_NAV_BY_ROLE,
  HOME_BY_ROLE,
} from './rbac.js';
import {
  FEATURE_CATALOG,
  getFeatureStatus,
  isFeatureEnabled,
} from './features.js';
import { MODULE_WORKSPACE_SCHEMAS } from './moduleWorkspaceSchemas.js';
import { isWorkspaceFeatureEnabled } from './useWorkspaceModules.js';
import { isIsolatedPreview, isPreviewLocalOnly } from './previewIsolation.js';
import { buildFxExchangeLines } from './accountingLineBuilders.js';

test('only the three canonical exchange tiers are enumerable', () => {
  assert.deepEqual(Object.keys(EXCHANGE_TIERS), ['basic', 'professional', 'enterprise']);
  assert.equal(EXCHANGE_TIERS.standard, EXCHANGE_TIERS.professional);
  assert.equal(normalizeExchangeTier('standard'), 'professional');
  assert.equal(normalizeExchangeTier('pro'), 'professional');
  assert.equal(normalizeExchangeTier('special'), 'enterprise');
});

test('tier access is cumulative and unknown tiers fail back to Basic', () => {
  assert.equal(getExchangeTier('unknown').id, 'basic');
  assert.equal(canTierAccessNavKey('basic', 'dashboard'), true);
  for (const coreKey of ['cash', 'bank', 'journal_entry', 'journal', 'general_ledger', 'chart_of_accounts', 'trial_balance', 'income_expense']) {
    assert.equal(canTierAccessNavKey('basic', coreKey), true, `Basic tier is missing core accounting feature: ${coreKey}`);
  }
  assert.equal(canTierAccessNavKey('basic', 'treasury'), false);
  assert.equal(canTierAccessNavKey('professional', 'treasury'), true);
  assert.equal(canTierAccessNavKey('enterprise', 'data_governance'), true);
  assert.equal(getTierForUser({ id: 'preview-user', workspace_tier: 'pro' }, null), 'professional');
});

test('every tier navigation key is represented in the sarraaf role contract', () => {
  for (const tier of Object.values(EXCHANGE_TIERS)) {
    for (const key of tier.navKeys) {
      assert.ok(SARRAAF_NAV_BY_ROLE.sarraaf.includes(key), `Missing RBAC navigation key: ${key}`);
    }
  }
});

test('exchange role aliases are normalized consistently and unknown routes stay closed', () => {
  assert.equal(normalizeRole('exchange'), 'sarraaf');
  assert.equal(getRoleLevel('exchange'), getRoleLevel('sarraaf'));
  assert.equal(HOME_BY_ROLE.exchange, '/dashboard');
  assert.equal(canAccessRoute('exchange', '/dashboard'), true);
  assert.equal(canAccessRoute('sarraaf', '/transfers/send'), true);
  assert.equal(canAccessRoute('sarraaf', '/transfers/wrong-direction'), false);
  assert.equal(canAccessRoute('exchange', '/builder'), false);
  assert.equal(canAccessRoute('employee', '/cash'), true);
  assert.equal(canAccessRoute('employee', '/bank'), false);
  assert.equal(canAccessRoute('employee', '/settings'), false);
  assert.equal(canAccessRoute('customer', '/dashboard'), false);
  assert.equal(canAccessRoute('user', '/assistant'), true);
  assert.equal(canAccessRoute('customer', '/assistant'), true);
  assert.equal(canAccessRoute('sarraaf', '/route-that-does-not-exist'), false);
  const items = [{ featureKey: 'dashboard' }, { featureKey: 'cash' }];
  assert.deepEqual(getAllowedNavItems('exchange', items), items);
});

test('notifications is registered and incomplete payment routes remain visibly guarded', () => {
  assert.ok(FEATURE_CATALOG.some(feature => feature.feature_key === 'notifications'));
  assert.ok(FEATURE_CATALOG.some(feature => feature.feature_key === 'income_expense'));
  assert.equal(getFeatureStatus([], 'payment_gateway'), 'updating');
  assert.equal(isFeatureEnabled([], 'payment_gateway'), true);
});

test('every enterprise workspace schema has registers, forms, and workflow steps', () => {
  const entries = Object.entries(MODULE_WORKSPACE_SCHEMAS);
  assert.ok(entries.length >= 20, 'Expected the complete enterprise module schema set');
  for (const [moduleKey, schema] of entries) {
    assert.ok(Array.isArray(schema.registers) && schema.registers.length > 0, `${moduleKey}: missing registers`);
    assert.ok(Array.isArray(schema.forms) && schema.forms.length > 0, `${moduleKey}: missing form contract`);
    assert.ok(Array.isArray(schema.workflow) && schema.workflow.length > 0, `${moduleKey}: missing workflow`);
  }
});

test('workspace module switches hide module routes without disabling core navigation', () => {
  assert.equal(isWorkspaceFeatureEnabled('dashboard', { treasury: false }), true);
  assert.equal(isWorkspaceFeatureEnabled('settings', { governance: false }), true);
  assert.equal(isWorkspaceFeatureEnabled('cash', { treasury: false }), false);
  assert.equal(isWorkspaceFeatureEnabled('notifications', { governance: false }), false);
  assert.equal(isWorkspaceFeatureEnabled('assistant', { governance: false }), false);
  assert.equal(isWorkspaceFeatureEnabled('income_expense', { accounting: false }), false);
});

test('preview hosts remain isolated even when runtime config is missing', () => {
  assert.equal(isIsolatedPreview({}, { hostname: 'roohalla41-blip.github.io', pathname: '/A1-Maintenance-Preview/' }), true);
  assert.equal(isIsolatedPreview({}, { hostname: 'roohalla41-blip.github.io', pathname: '/another-project/' }), false);
  assert.equal(isIsolatedPreview({}, { hostname: 'timely-frangollo-ef7fde.netlify.app', pathname: '/' }), true);
  assert.equal(isIsolatedPreview({}, { hostname: 'main--timely-frangollo-ef7fde.netlify.app', pathname: '/' }), true);
  assert.equal(isIsolatedPreview({}, { hostname: 'unrelated-site.netlify.app', pathname: '/' }), false);
  assert.equal(isIsolatedPreview({ previewOnly: true }, { hostname: 'example.com', pathname: '/' }), true);
});

test('cross-currency journals balance independently in each currency', () => {
  const lines = buildFxExchangeLines({
    from_type: 'cash', from_id: 'AFN-CASH',
    to_type: 'bank', to_id: 'USD-BANK',
    from_currency: 'AFN', from_amount: 7000,
    to_currency: 'USD', to_amount: 100,
    rate: 70,
  });
  const totals = new Map();
  for (const line of lines) {
    const current = totals.get(line.currency) || { debit: 0, credit: 0 };
    current.debit += line.debit;
    current.credit += line.credit;
    totals.set(line.currency, current);
  }
  assert.equal(lines.length, 4);
  assert.deepEqual([...totals.entries()].sort(), [
    ['AFN', { debit: 7000, credit: 7000 }],
    ['USD', { debit: 100, credit: 100 }],
  ]);
});

test('cross-currency journal builder rejects invalid amounts and identical currencies', () => {
  assert.throws(() => buildFxExchangeLines({
    from_currency: 'AFN', from_amount: 0,
    to_currency: 'USD', to_amount: 10,
  }));
  assert.throws(() => buildFxExchangeLines({
    from_currency: 'AFN', from_amount: 10,
    to_currency: 'AFN', to_amount: 10,
  }));
});


test('isolated preview forces every demo role into local-only data mode', () => {
  const location = { hostname: 'roohalla41-blip.github.io', pathname: '/A1-Maintenance-Preview/' };
  assert.equal(isPreviewLocalOnly({ previewOnly: true }, location), true);
  assert.equal(isPreviewLocalOnly({}, location), true);
  assert.equal(isPreviewLocalOnly({ previewOnly: false }, { hostname: 'example.com', pathname: '/' }), false);
});
