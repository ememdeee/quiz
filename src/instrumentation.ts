import * as Sentry from "@sentry/nextjs";
import { optionalServerEnv } from "@/lib/env";

/**
 * Error monitoring on the server (decision: Sentry, Phase 14). It only switches on when SENTRY_DSN is set. Nothing a person typed
 * (answers, emails, passwords) may be sent, so bodies, cookies and user details are removed before an error leaves.
 */
export async function register() {
  const { sentryDsn } = optionalServerEnv();
  if (!sentryDsn) return;
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
        delete event.request.query_string;
      }
      delete event.user;
      return event;
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
