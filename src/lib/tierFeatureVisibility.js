import { useCallback, useEffect, useState } from 'react';
import { canTierAccessNavKey, normalizeExchangeTier, EXCHANGE_TIERS } from '@/lib/exchangeTiers';

const STORAGE_KEY = 'preview-tier-feature-visibility-v1';
const EVENT_NAME = 'preview-tier-feature-visibility-changed';

function readVisibility() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function isTierFeatureVisible(tier, featureKey, visibility = {}) {
  if (featureKey === 'dashboard' || featureKey === 'settings') return true;
  const tierId = normalizeExchangeTier(tier);
  const tierOverrides = visibility?.[tierId] || {};
  if (Object.prototype.hasOwnProperty.call(tierOverrides, featureKey)) {
    return tierOverrides[featureKey] === true;
  }
  return canTierAccessNavKey(tierId, featureKey);
}

export default function useTierFeatureVisibility() {
  const [visibilityByTier, setVisibilityByTier] = useState(readVisibility);

  useEffect(() => {
    const refresh = () => setVisibilityByTier(readVisibility());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const setFeatureVisibility = useCallback((tier, featureKey, enabled) => {
    const tierId = normalizeExchangeTier(tier);
    if (featureKey === 'dashboard' || featureKey === 'settings') return;
    const next = {
      ...readVisibility(),
      [tierId]: {
        ...(readVisibility()[tierId] || {}),
        [featureKey]: Boolean(enabled),
      },
    };
    setVisibilityByTier(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch {
      // Keep the current in-memory preview setting if storage is unavailable.
    }
  }, []);

  const resetTierVisibility = useCallback((tier) => {
    const tierId = normalizeExchangeTier(tier);
    const next = { ...readVisibility() };
    delete next[tierId];
    setVisibilityByTier(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch {
      // Keep the current in-memory preview setting if storage is unavailable.
    }
  }, []);

  return { visibilityByTier, setFeatureVisibility, resetTierVisibility };
}

export { EXCHANGE_TIERS };
