import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env";

/** Error monitoring in the browser. Off unless NEXT_PUBLIC_SENTRY_DSN is set; never sends what a person typed. */
if (publicEnv.sentryDsn) {
  Sentry.init({
    dsn: publicEnv.sentryDsn,
    tracesSampleRate: 0,
    beforeSend(event) {
      delete event.request;
      delete event.user;
      return event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
