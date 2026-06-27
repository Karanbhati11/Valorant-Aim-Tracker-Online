/**
 * Performance optimization utilities.
 * Provides code splitting, lazy loading, bundle size management,
 * and Core Web Vitals optimizations.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.8, 17.1, 17.2
 */

export {
  loadScript,
  loadExerciseCore,
  loadExerciseUI,
  preloadExerciseScripts,
  isExerciseEngineReady,
  resetScriptRegistry,
} from './dynamic-script-loader';

export {
  initLazyLoadObserver,
  observeElement,
  supportsNativeLazyLoading,
} from './lazy-load';

export {
  deferThirdPartyScripts,
  optimizeEventHandler,
  createStableContainer,
  FrameRateGuard,
  addPassiveEventListener,
  ensureFontStability,
  DOMBatcher,
  DEFERRED_THIRD_PARTY_SCRIPTS,
} from './web-vitals';

export type { DeferredScript } from './web-vitals';
