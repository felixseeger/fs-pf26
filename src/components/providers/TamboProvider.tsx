"use client";

import { TamboProvider as TamboProviderBase } from "@tambo-ai/react";
import { components } from "@/lib/tambo";
import { useEffect, useState } from "react";

interface TamboProviderProps {
  children: React.ReactNode;
}

/**
 * TamboProvider wrapper for registering components with Tambo AI.
 *
 * Tambo's ThreadSyncManager injects `data-cursor-ref` attributes into DOM
 * elements client-side. Rendering it during SSR produces a server/client
 * mismatch that triggers React's hydration warning. We gate the real provider
 * behind a `useEffect` (client-only) so the server and first client paint both
 * see a plain React.Fragment, and Tambo only activates after hydration.
 */
export function TamboProvider({ children }: TamboProviderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!mounted) {
    // During SSR and the initial client render: pass children straight through
    // so React can hydrate without any Tambo-injected attribute mismatches.
    return <>{children}</>;
  }

  return (
    <TamboProviderBase
      apiKey={apiKey || ""}
      components={components}
    >
      {children}
    </TamboProviderBase>
  );
}
