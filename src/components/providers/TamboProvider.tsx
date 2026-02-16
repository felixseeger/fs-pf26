"use client";

import { TamboProvider as TamboProviderBase } from "@tambo-ai/react";
import { components } from "@/lib/tambo";

interface TamboProviderProps {
  children: React.ReactNode;
}

/**
 * TamboProvider wrapper for registering components with Tambo AI
 * 
 * This provider registers React components that Tambo can generate on-demand.
 * Components are defined in @/lib/tambo and registered here.
 * 
 * The Tambo script is loaded via the script tag in layout.tsx using the project ID.
 * This provider handles component registration for generative UI.
 * 
 * If NEXT_PUBLIC_TAMBO_API_KEY is set, it will be used. Otherwise, Tambo
 * will use the project ID from the script tag for initialization.
 */
export function TamboProvider({ children }: TamboProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  // If no API key, still register components (Tambo may use project ID from script tag)
  if (!apiKey) {
    return (
      <TamboProviderBase components={components}>
        {children}
      </TamboProviderBase>
    );
  }

  return (
    <TamboProviderBase
      apiKey={apiKey}
      components={components}
    >
      {children}
    </TamboProviderBase>
  );
}
