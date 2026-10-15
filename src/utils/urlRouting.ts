/**
 * BPSC TRE 4.0 URL Routing & Deep-Linking Engine
 * Provides browser address-bar synchronization with pushState/popstate,
 * supporting browser Back/Forward navigation, bookmarking, and deep links
 * from WhatsApp, emails, and mobile push notifications.
 */

export type AppViewRoute =
  | 'intro'
  | 'testing'
  | 'results'
  | 'bank'
  | 'create-test'
  | 'bulk-import'
  | 'history'
  | 'progress';

export interface RouteState {
  view: AppViewRoute;
  testId?: string;
  reviewTestId?: string;
  resultId?: string;
  chapterId?: string;
  enableNotif?: boolean;
}

/**
 * Parses query params from current browser URL into RouteState
 */
export function parseUrlRoute(): RouteState {
  if (typeof window === 'undefined') {
    return { view: 'intro' };
  }

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const testId = params.get('testId') || params.get('test') || undefined;
  const reviewTestId = params.get('reviewTestId') || params.get('review') || undefined;
  const resultId = params.get('resultId') || undefined;
  const chapterId = params.get('chapter') || undefined;
  const enableNotif = params.get('enableNotif') === 'true' || params.get('notif') === 'open';

  let view: AppViewRoute = 'intro';
  if (viewParam === 'bank' || viewParam === 'question-bank') {
    view = 'bank';
  } else if (viewParam === 'create' || viewParam === 'create-test') {
    view = 'create-test';
  } else if (viewParam === 'import' || viewParam === 'bulk-import') {
    view = 'bulk-import';
  } else if (viewParam === 'history' || viewParam === 'results-history') {
    view = 'history';
  } else if (viewParam === 'progress' || viewParam === 'analytics') {
    view = 'progress';
  } else if (viewParam === 'test' || viewParam === 'testing' || (testId && params.get('start') === 'true')) {
    view = 'testing';
  } else if (viewParam === 'results' || reviewTestId) {
    view = 'results';
  } else if (testId) {
    view = 'intro';
  }

  return {
    view,
    testId,
    reviewTestId,
    resultId,
    chapterId,
    enableNotif
  };
}

/**
 * Constructs a clean URL string from a RouteState
 */
export function buildRouteUrl(route: RouteState): string {
  if (typeof window === 'undefined') return '/';
  const url = new URL(window.location.origin);
  const params = url.searchParams;

  if (route.view === 'bank') {
    params.set('view', 'bank');
  } else if (route.view === 'create-test') {
    params.set('view', 'create');
  } else if (route.view === 'bulk-import') {
    params.set('view', 'import');
  } else if (route.view === 'history') {
    params.set('view', 'history');
  } else if (route.view === 'progress') {
    params.set('view', 'progress');
  } else if (route.view === 'testing') {
    params.set('view', 'test');
    if (route.testId) params.set('testId', route.testId);
  } else if (route.view === 'results') {
    params.set('view', 'results');
    if (route.reviewTestId) params.set('reviewTestId', route.reviewTestId);
    if (route.resultId) params.set('resultId', route.resultId);
  } else {
    // intro view
    if (route.testId) {
      params.set('testId', route.testId);
    }
    if (route.chapterId) {
      params.set('chapter', route.chapterId);
    }
  }

  if (route.enableNotif) {
    params.set('enableNotif', 'true');
  }

  const searchStr = params.toString();
  return searchStr ? `${url.pathname}?${searchStr}` : url.pathname;
}

/**
 * Updates browser address bar seamlessly without refreshing the page
 */
export function updateBrowserUrl(route: RouteState, replace: boolean = false): void {
  if (typeof window === 'undefined') return;
  const newUrl = buildRouteUrl(route);
  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl === newUrl) return;

  try {
    if (replace) {
      window.history.replaceState({ ...route }, '', newUrl);
    } else {
      window.history.pushState({ ...route }, '', newUrl);
    }
  } catch (err) {
    console.warn('History API state update warning:', err);
  }
}
