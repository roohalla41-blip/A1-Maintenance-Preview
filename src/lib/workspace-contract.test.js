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
  canAccessRoute,
  getAllowedNavItems,
  SARRAAF_NAV_BY_ROLE,
} from './rbac.js';
import {
  FEATURE_CATALOG,
  getFeatureStatus,
  isFeatureEnabled,
} from './features.js';
import { MODULE_WORKSPACE_SCHEMAS } from './moduleWorkspaceSchemas.js';

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
  assert.equal(canAccessRoute('exchange', '/dashboard'), true);
  assert.equal(canAccessRoute('exchange', '/builder'), false);
  assert.equal(canAccessRoute('sarraaf', '/route-that-does-not-exist'), false);
  const items = [{ featureKey: 'dashboard' }, { featureKey: 'cash' }];
  assert.deepEqual(getAllowedNavItems('exchange', items), items);
});

test('notifications is registered and incomplete payment routes remain visibly guarded', () => {
  assert.ok(FEATURE_CATALOG.some(feature => feature.feature_key === 'notifications'));
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
