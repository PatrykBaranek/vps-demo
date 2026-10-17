import { Dexie, type EntityTable } from 'dexie';

import { defaultRssSources } from './rss-sources';

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  createdAt: number;
}

export interface RssSource {
  id: number;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
}

export interface Bookmark {
  id: number;
  articleLink: string;
  articleTitle: string;
  articleSource: string;
  createdAt: number;
}

export interface AiSummary {
  id?: number;
  cacheKey: string;
  summary: string;
  createdAt: number;
}

const appDb = new Dexie('VpsDemoAppDatabase') as Dexie & {
  posts: EntityTable<Post, 'id'>;
  rssSources: EntityTable<RssSource, 'id'>;
  bookmarks: EntityTable<Bookmark, 'id'>;
  aiSummaries: EntityTable<AiSummary, 'id'>;
};

// Note: booleans (published / isActive) are intentionally NOT indexed —
// IndexedDB cannot use a boolean as a key. They are filtered in JS instead.
appDb.version(1).stores({
  posts: '++id, createdAt',
  rssSources: '++id, name, &url',
  bookmarks: '++id, &articleLink, createdAt',
});

appDb.version(2).stores({
  aiSummaries: '++id, &cacheKey, createdAt',
});

const postSeeds: Omit<Post, 'id'>[] = [
  {
    title: 'Going local-first with Dexie',
    excerpt: 'Why moving the database into the browser makes small apps feel instant.',
    content:
      'Local-first apps keep their data in the browser, so reads never wait on the network. Dexie wraps IndexedDB in a friendly, typed API that feels like a normal app model.\n\nInstead of a request/response round trip, the UI subscribes to the database and re-renders whenever the data changes. The result is an interface that responds the moment you interact with it.\n\nThe trade-off is that the data lives per-browser. For demos, drafts, and personal tools that is exactly what you want.',
    published: true,
    createdAt: 1710000000000,
  },
  {
    title: 'Reactive reads with useLiveQuery',
    excerpt: 'One hook keeps your React components in sync with IndexedDB.',
    content:
      'dexie-react-hooks ships a useLiveQuery hook that runs a query and re-runs it automatically whenever the underlying tables change.\n\nYou write the query once and Dexie handles the subscription. Add a row somewhere else in the app and every component reading that table updates on its own.\n\nWhile the first query resolves the hook returns undefined, which gives you a natural place to render a loading state.',
    published: true,
    createdAt: 1710086400000,
  },
  {
    title: 'Seeding a browser database',
    excerpt: 'Use the populate event to ship demo data on first run.',
    content:
      "Dexie fires a populate event the first time a database is created. It runs inside the creation transaction, so it is the ideal place to bulkAdd starter data.\n\nBecause it only runs once, you avoid the guard-and-count dance of seeding on every mount. Clear the IndexedDB database in DevTools and the seed runs again from scratch.\n\nThis post itself was planted by that populate handler.",
    published: true,
    createdAt: 1710172800000,
  },
  {
    title: 'A draft that never shipped',
    excerpt: 'This unpublished post proves the published filter works.',
    content:
      'You should not be able to reach this post from the list — it is stored with published: false and filtered out in the client query.',
    published: false,
    createdAt: 1710259200000,
  },
];

const rssSourceSeeds: Omit<RssSource, 'id'>[] = defaultRssSources.map((source) => ({
  ...source,
  isActive: true,
}));

appDb.on('populate', (tx) => {
  tx.table('posts').bulkAdd(postSeeds);
  tx.table('rssSources').bulkAdd(rssSourceSeeds);
});

export { appDb };
