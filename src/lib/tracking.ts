declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

function fbq(event: string, params?: object) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
}

// Module-scope Set — persists for the entire browser session, resets on full page refresh.
const firedEvents = new Set<string>();

const fireOnce = (key: string, fn: () => void) => {
  if (firedEvents.has(key)) return;
  firedEvents.add(key);
  fn();
};

export const track = {
  // No guard — every page navigation should fire.
  pageView: () => {
    fbq('PageView');
  },

  // Guarded — once per session. Going back and reselecting gender won't retrigger.
  quizStart: () => {
    fireOnce('quiz_start', () => fbq('Lead', { content_name: 'Body Reset Quiz' }));
  },

  // Guarded — once per session. Remounting or refreshing the result page won't double-fire.
  viewOffer: () => {
    fireOnce('view_offer', () => {
      fbq('ViewContent', {
        content_name: 'Body Reset Offer',
        content_ids: ['body-reset'],
        content_type: 'product',
        value: 29,
        currency: 'USD',
      });
    });
  },

  // No guard — multiple clicks are intentional signals for Meta's algorithm.
  initiateCheckout: (location: string) => {
    fbq('InitiateCheckout', {
      content_name: 'Body Reset',
      content_ids: ['body-reset'],
      value: 29,
      currency: 'USD',
      num_items: 1,
      content_category: location,
    });
  },
};
