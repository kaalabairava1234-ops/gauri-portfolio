import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type ErrorComponentProps,
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { type ReactNode } from "react";

import { ABOUT_SHORT, NAME, OG_IMAGE } from "../lib/seo";
import { withBase } from "../lib/utils";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-gradient text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The thread doesn't lead here. The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// Cloudflare Web Analytics: cookie-free page views. Paste your own site token
// from Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site.
// Left empty, nothing loads; it also stays off in local dev so tests don't count.
const CLOUDFLARE_ANALYTICS_TOKEN = "";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${NAME} — Marketing Strategy, Media & Growth` },
      { name: "description", content: ABOUT_SHORT },
      { name: "author", content: NAME },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: NAME },
      { property: "og:locale", content: "en_GB" },
      { property: "og:image", content: OG_IMAGE },
      { name: "theme-color", content: "#10131F" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Instrument+Serif:ital@1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: withBase("favicon.svg"), type: "image/svg+xml" },
      { rel: "icon", href: withBase("favicon-32.png"), type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: withBase("apple-touch-icon.png") },
    ],
    scripts:
      CLOUDFLARE_ANALYTICS_TOKEN && import.meta.env.PROD
        ? [
            {
              src: "https://static.cloudflareinsights.com/beacon.min.js",
              defer: true,
              "data-cf-beacon": JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN }),
            },
          ]
        : [],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
        {/* Without JS nothing would ever mark reveals as shown, so show them all. */}
        <noscript>
          <style>{".reveal{opacity:1!important;filter:none!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* Vercel Web Analytics: cookie-free page views, sent only from the live
          site. The GitHub Pages build switches it off (it only works on Vercel). */}
      {import.meta.env["VITE_DISABLE_ANALYTICS"] !== "1" && <Analytics />}
    </QueryClientProvider>
  );
}
