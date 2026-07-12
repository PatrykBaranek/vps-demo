import { Dexie, type EntityTable } from 'dexie';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  favorite: boolean;
}

export interface Note {
  id: number;
  title: string;
  body: string;
  updatedAt: number;
  color: 'yellow' | 'blue' | 'pink';
}

const db = new Dexie('DexieShowcaseDatabase') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
  contacts: EntityTable<Contact, 'id'>;
  notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
  tasks: '++id, completed, createdAt',
  contacts: '++id, name, email, favorite',
  notes: '++id, updatedAt, color',
});

const taskSeeds: Omit<Task, 'id'>[] = [
  { title: 'Sketch the offline flow', completed: true, createdAt: 1710000000000 },
  { title: 'Try a live query', completed: false, createdAt: 1710086400000 },
  { title: 'Ship the local-first demo', completed: false, createdAt: 1710172800000 },
];

const contactSeeds: Omit<Contact, 'id'>[] = [
  { name: 'Maya Chen', email: 'maya@northstar.studio', company: 'Northstar Studio', favorite: true },
  { name: 'Jon Bell', email: 'jon@fieldnotes.co', company: 'Field Notes Co.', favorite: false },
  { name: 'Priya Shah', email: 'priya@arcade.fm', company: 'Arcade FM', favorite: true },
];

const noteSeeds: Omit<Note, 'id'>[] = [
  {
    title: 'A small idea',
    body: 'Local data feels instant because it is already here. Dexie makes the browser database feel like a normal app model.',
    updatedAt: 1710172800000,
    color: 'yellow',
  },
  {
    title: 'Things to remember',
    body: 'Use indexes for the queries users repeat. Keep the server for shared truth, and let the client own the offline moment.',
    updatedAt: 1710086400000,
    color: 'blue',
  },
];

export async function seedDexieShowcase() {
  await db.transaction('rw', db.tasks, db.contacts, db.notes, async () => {
    if ((await db.tasks.count()) === 0) await db.tasks.bulkAdd(taskSeeds);
    if ((await db.contacts.count()) === 0) await db.contacts.bulkAdd(contactSeeds);
    if ((await db.notes.count()) === 0) await db.notes.bulkAdd(noteSeeds);
  });
}

export { db };
