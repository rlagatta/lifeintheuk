/** Gating only around paid actions — paywall is a screen, not a redirect. */
import { hasPass, FREE_LIMITS } from '../entitlement/index.js';

export function canStartMock(index) {
  return hasPass() || index <= FREE_LIMITS.maxMockIndex;
}

export function canTimed() {
  return hasPass() || FREE_LIMITS.timed;
}

export function canCustom(n) {
  return hasPass() || n <= FREE_LIMITS.customMaxQ;
}

export function canFocus(focusCountToday) {
  return hasPass() || focusCountToday < FREE_LIMITS.focusPerDay;
}
