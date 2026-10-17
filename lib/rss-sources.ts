// Shared between the browser (Dexie seed in `lib/app-db.ts`) and the server,
// which summarizes these same feeds once for every user.
export const defaultRssSources = [
  {
    name: 'Eurogamer',
    url: 'https://www.eurogamer.net/feed',
    description: 'Video game news, reviews, and features',
  },
  {
    name: 'IGN',
    url: 'https://feeds.ign.com/ign/all',
    description: 'Video game news, reviews, and walkthroughs',
  },
  {
    name: 'PC Gamer',
    url: 'https://www.pcgamer.com/rss/',
    description: 'PC gaming news, reviews, and hardware',
  },
  {
    name: 'GameSpot',
    url: 'https://www.gamespot.com/feeds/news/',
    description: 'Game reviews, news, and videos',
  },
  {
    name: 'Kotaku',
    url: 'https://kotaku.com/rss',
    description: 'Gaming culture and video game news',
  },
];
