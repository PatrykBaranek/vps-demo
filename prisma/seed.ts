import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/vps_demo";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const defaultSources = [
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

async function main() {
  console.log('Seeding RSS sources...');

  // Delete all existing sources first
  await prisma.rssSource.deleteMany({});

  // Create gaming sources
  for (const source of defaultSources) {
    await prisma.rssSource.create({
      data: source,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });