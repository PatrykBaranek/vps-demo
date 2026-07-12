import type { Metadata } from 'next';

import DexieShowcaseClient from './dexie-showcase-client';

export const metadata: Metadata = {
  title: 'Dexie Showcase · VPS demo',
  description: 'Small local-first apps built with Dexie.js and IndexedDB.',
};

export default function DexieShowcasePage() {
  return <DexieShowcaseClient />;
}
