'use client'

import { ReactNode } from 'react'
import { ConvexReactClient, ConvexProvider } from 'convex/react'

// Initialize the client outside the component to avoid re-creations
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
