'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Database,
  FileText,
  Heart,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import { db, seedDexieShowcase, type Contact, type Note, type Task } from '@/lib/dexie-db';


type AppKey = 'tasks' | 'contacts' | 'notes';
type TaskFilter = 'all' | 'active' | 'done';


const ui = {
  page: 'relative isolate min-h-screen w-full overflow-hidden pb-24 pt-8 text-[#e7edf8] sm:pt-16',
  paperTexture: 'absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#172342_0%,#0b1018_48%,#090c12_100%)]',
  hero: 'relative z-10 mx-auto mb-10 grid w-full max-w-[1080px] items-end gap-8 sm:mb-20 lg:grid-cols-[minmax(0,1fr)_260px]',
  kicker: 'inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#78a6ff]',
  kickerMark: 'inline-block size-2 rotate-12 rounded-[2px] bg-[#b8e986] shadow-[0_0_0_3px_rgba(184,233,134,0.18)]',
  title: 'mb-5 mt-5 max-w-[680px] text-[clamp(3.4rem,8.5vw,7.8rem)] font-medium leading-[0.84] tracking-[-0.095em]',
  intro: 'm-0 max-w-[480px] text-[clamp(1rem,1.7vw,1.18rem)] leading-[1.55] text-[#91a0b5]',
  heroNote: 'mt-6 grid rotate-2 gap-2 rounded-[4px_20px_4px_20px] border border-[#304261] bg-[#111722]/75 p-5 shadow-[8px_9px_0_rgba(20,36,70,0.5)] lg:mt-0',
  heroNoteTop: 'flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-[#78a6ff]',
  liveDot: 'ml-auto inline-block size-[7px] rounded-full bg-[#8ed38a] shadow-[0_0_0_4px_rgba(142,211,138,0.14)]',
  workspace: 'relative z-10 mx-auto w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-[#27354c] bg-[#101722]/90 shadow-[0_30px_70px_rgba(0,0,0,0.35)]',
  workspaceHeader: 'flex flex-col items-start justify-between gap-6 p-5 sm:flex-row sm:items-end sm:px-12 sm:pt-9 [&_h2]:m-0 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-[-0.055em]',
  sectionLabel: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#78a6ff]',
  secondaryButton: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#2b3b56] bg-[#151e2c] px-4 py-3 text-xs font-extrabold text-[#dce7f7] transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[#78a6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  primaryButton: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#78a6ff] bg-[#78a6ff] px-4 py-3 text-xs font-extrabold text-[#08101d] shadow-[4px_4px_0_rgba(120,166,255,0.18)] transition motion-safe:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  tabs: 'grid border-y border-[#27354c] bg-[#0d131d] sm:grid-cols-3',
  tab: 'grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#27354c] bg-transparent px-5 py-4 text-left text-[#8e9bb0] transition hover:bg-[#151e2c] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#78a6ff] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-[#dce7f7] [&_small]:text-[0.66rem] [&_small]:text-[#718096] [&_b]:grid [&_b]:size-6 [&_b]:place-items-center [&_b]:rounded-full [&_b]:bg-[#1a263a] [&_b]:text-[0.66rem] [&_b]:font-extrabold [&_b]:text-[#91a0b5]',
  activeTab: 'bg-[#151e2c] text-[#78a6ff] [&_b]:bg-[#263c67] [&_b]:text-[#b9d0ff]',
  panel: 'min-h-[390px]',
  appPanel: 'p-5 sm:p-12',
  panelIntro: 'mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row [&_h3]:m-0 [&_h3]:mt-3 [&_h3]:max-w-[600px] [&_h3]:text-[clamp(1.55rem,3vw,2.25rem)] [&_h3]:font-medium [&_h3]:leading-none [&_h3]:tracking-[-0.065em] [&_p]:m-0 [&_p]:max-w-[560px] [&_p]:text-[0.93rem] [&_p]:leading-[1.55] [&_p]:text-[#8e9bb0]',
  panelNumber: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#718096]',
  statBlock: 'min-w-[90px] border-l-0 pl-0 text-left sm:border-l sm:border-[#27354c] sm:pl-5 sm:text-right [&_strong]:block [&_strong]:text-[2.2rem] [&_strong]:font-medium [&_strong]:leading-[0.9] [&_strong]:tracking-[-0.08em] [&_strong]:text-[#78a6ff] [&_small]:text-[0.7rem] [&_small]:text-[#718096]',
  addRow: 'mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] [&_input]:min-h-[42px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#2b3b56] [&_input]:bg-[#0d131d] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-[#e7edf8] [&_input]:outline-none [&_input]:placeholder:text-[#718096] [&_input]:focus:border-[#78a6ff] [&_input]:focus:ring-4 [&_input]:focus:ring-[#78a6ff]/10',
  listToolbar: 'mb-3 flex items-center justify-between gap-4',
  filterGroup: 'flex gap-1 [&_button]:rounded-md [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:text-[#8e9bb0] [&_button]:hover:bg-[#151e2c] [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-[#78a6ff]',
  selectedFilter: 'bg-[#1e355d] text-[#b9d0ff] font-extrabold',
  mutedMeta: 'text-[0.7rem] text-[#718096]',
  taskList: 'border-t border-[#27354c]',
  taskRow: 'flex min-h-16 items-center gap-3 border-b border-[#27354c]',
  taskTitle: 'flex-1 text-sm text-[#dce7f7] transition',
  completedTask: 'text-[#65748c] line-through',
  rowDate: 'text-[0.68rem] text-[#65748c] max-sm:hidden',
  checkButton: 'grid shrink-0 place-items-center border-0 bg-transparent p-0 text-[#78a6ff] transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  iconButton: 'grid shrink-0 place-items-center border-0 bg-transparent p-1.5 text-[#718096] transition hover:-translate-y-px hover:text-[#78a6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  rowActions: 'ml-auto flex gap-0.5',
  emptyState: 'grid min-h-[190px] place-items-center gap-2 p-8 text-center text-[#8e9bb0] [&_strong]:text-[#b5c2d5] [&_span]:text-xs',
  emptyEditor: 'grid min-h-[240px] place-items-center gap-3 text-center text-[#8e9bb0]',
  contactForm: 'grid items-end gap-3 sm:grid-cols-[1.1fr_1.2fr_1.1fr_auto] [&_label]:grid [&_label]:gap-2 [&_label>span]:text-[0.67rem] [&_label>span]:font-extrabold [&_label>span]:uppercase [&_label>span]:tracking-[0.08em] [&_label>span]:text-[#718096] [&_input]:min-h-[42px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#2b3b56] [&_input]:bg-[#0d131d] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-[#e7edf8] [&_input]:outline-none [&_input]:placeholder:text-[#718096] [&_input]:focus:border-[#78a6ff] [&_input]:focus:ring-4 [&_input]:focus:ring-[#78a6ff]/10',
  contactList: 'border-t border-[#27354c]',
  contactRow: 'flex items-center gap-3 border-b border-[#27354c] py-3 max-sm:items-start',
  avatar: 'grid size-9 shrink-0 place-items-center rounded-full bg-[#1e355d] text-[0.65rem] font-extrabold text-[#b9d0ff]',
  contactIdentity: 'grid min-w-0 flex-1 gap-0.5 [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-sm [&_strong]:text-[#dce7f7] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:text-xs [&_span]:text-[#8e9bb0] [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:text-[0.7rem] [&_small]:text-[#65748c]',
  editContactForm: 'grid flex-1 gap-2 sm:grid-cols-3 [&_input]:min-h-[34px] [&_input]:rounded-[8px] [&_input]:border [&_input]:border-[#2b3b56] [&_input]:bg-[#0d131d] [&_input]:px-2 [&_input]:py-1.5 [&_input]:text-xs [&_input]:text-[#e7edf8] [&_input]:outline-none [&_input]:focus:border-[#78a6ff]',
  searchRow: 'my-5 flex items-center gap-3 rounded-[10px] border border-[#2b3b56] bg-[#0d131d] px-3 py-2 text-[#78a6ff] [&_input]:min-h-0 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-1 [&_input]:text-sm [&_input]:text-[#e7edf8] [&_input]:outline-none [&_input]:placeholder:text-[#718096]',
  favorite: 'text-[#ff91a3]',
  notesLayout: 'grid min-h-[330px] overflow-hidden rounded-[14px] border border-[#27354c] bg-[#0d131d] lg:grid-cols-[220px_minmax(0,1fr)]',
  noteRail: 'grid grid-cols-2 gap-2 border-b border-[#27354c] p-3 lg:block lg:border-b-0 lg:border-r',
  noteRailHeader: 'col-span-full mb-2 flex items-center justify-between px-1 text-[0.7rem] font-extrabold uppercase tracking-[0.05em] text-[#8e9bb0] lg:mb-2',
  miniButton: 'grid place-items-center rounded-md border-0 bg-transparent p-1 text-[#718096] transition hover:-translate-y-px hover:text-[#78a6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  noteCard: 'mb-0 grid w-full gap-1 rounded-[9px] border border-transparent p-3 text-left transition hover:translate-x-0.5 hover:border-[#78a6ff]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:text-sm [&_span]:font-extrabold [&_small]:text-[0.65rem] [&_small]:text-[#718096] lg:mb-2',
  noteYellow: 'bg-[#40361a] text-[#f5d98a]',
  noteBlue: 'bg-[#1c365f] text-[#b9d0ff]',
  notePink: 'bg-[#45253b] text-[#ffb7d0]',
  selectedNote: 'border-[#78a6ff]/50 shadow-[3px_3px_0_rgba(120,166,255,0.14)]',
  noteEditor: 'flex min-w-0 flex-col bg-[#111722] p-5 sm:p-6',
  editorToolbar: 'mb-5 flex items-center justify-between gap-4',
  editorLabel: 'text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#718096]',
  noteTitleInput: 'mb-3 w-full border-0 border-b border-transparent bg-transparent px-0 py-0 text-[clamp(1.5rem,3vw,2.1rem)] font-medium tracking-[-0.06em] text-[#e7edf8] outline-none placeholder:text-[#718096] focus:border-[#78a6ff] focus-visible:outline-0',
  noteBodyInput: 'min-h-[180px] flex-1 resize-y border-0 bg-transparent px-0 py-2 text-sm leading-[1.7] text-[#b7c3d4] outline-none placeholder:text-[#718096] focus-visible:outline-0',
  editorFooter: 'flex items-center gap-2 text-[0.68rem] text-[#718096]',
  textButton: 'inline-flex items-center gap-1 border-0 bg-transparent p-1 text-xs font-extrabold text-[#78a6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78a6ff]',
  saveStatus: 'flex items-center gap-2 text-xs text-[#8e9bb0]',
  savedDot: 'inline-block size-[7px] rounded-full bg-[#8ed38a] shadow-[0_0_0_4px_rgba(142,211,138,0.14)]',
  savingDot: 'inline-block size-[7px] rounded-full bg-[#e7b86c] shadow-[0_0_0_4px_rgba(231,184,108,0.14)]',
  whySection: 'relative z-10 mx-auto w-full max-w-[1080px] pt-20 sm:pt-32',
  whyHeading: 'grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_340px] [&_h2]:m-0 [&_h2]:mt-2 [&_h2]:text-[clamp(2.4rem,6vw,4.7rem)] [&_h2]:font-medium [&_h2]:tracking-[-0.08em] [&_p]:m-0 [&_p]:text-sm [&_p]:leading-[1.6] [&_p]:text-[#8e9bb0]',
  comparisonGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
  comparisonCard: 'relative flex min-h-[210px] flex-col rounded-[14px] border border-[#27354c] bg-[#111722]/70 p-5 text-[#e7edf8] transition hover:-translate-y-1 hover:border-[#3d5478] hover:shadow-[5px_6px_0_rgba(0,0,0,0.24)] [&_h3]:mt-auto [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:tracking-[-0.04em] [&_p]:m-0 [&_p]:text-xs [&_p]:leading-[1.55] [&_p]:text-[#8e9bb0]',
  dexieCard: 'border-[#78a6ff] bg-[#78a6ff] text-[#08101d] lg:-translate-y-2 lg:hover:-translate-y-3 [&_p]:text-[#17315d]',
  cardLabel: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#718096]',
  bestFit: 'absolute right-4 top-4 rounded bg-[#b8e986] px-2 py-1 text-[0.58rem] font-extrabold uppercase text-[#1c2a17]',
  whyBottomLine: 'mx-auto mt-8 flex max-w-[700px] items-start gap-3 border-t border-[#27354c] px-5 py-4 text-[#78a6ff] [&_p]:m-0 [&_p]:text-xs [&_p]:leading-[1.6] [&_p]:text-[#8e9bb0]',
  error: 'mx-5 mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-[#6e3948] bg-[#26141a] px-3 py-3 text-xs text-[#ffb7c1] sm:mx-12',
  actionMessage: 'mx-5 mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-[#385638] bg-[#172417] px-3 py-3 text-xs text-[#b8e986] sm:mx-12',
} as const;

function noteColorClass(color: Note['color']) {
  return color === 'yellow' ? ui.noteYellow : color === 'blue' ? ui.noteBlue : ui.notePink;
}
const tabs: { key: AppKey; label: string; eyebrow: string; icon: typeof CheckCircle2 }[] = [
  { key: 'tasks', label: 'Tasks', eyebrow: 'CRUD + live queries', icon: CheckCircle2 },
  { key: 'contacts', label: 'Contacts', eyebrow: 'Indexes + updates', icon: Users },
  { key: 'notes', label: 'Notes', eyebrow: 'Autosave + offline', icon: FileText },
];

const comparison = [
  {
    label: 'localStorage',
    title: 'Tiny key/value cache',
    body: 'Simple, but synchronous and awkward for structured collections or indexed queries.',
  },
  {
    label: 'IndexedDB',
    title: 'Powerful browser primitive',
    body: 'Async and durable, but its native API is verbose for everyday app code.',
  },
  {
    label: 'Dexie',
    title: 'A calmer IndexedDB layer',
    body: 'Typed tables, readable queries, schema versions, transactions, and live React updates.',
  },
  {
    label: 'Server database',
    title: 'Shared source of truth',
    body: 'Best for accounts and collaboration, with the cost of a backend, network, auth, and sync.',
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function dateLabel(timestamp: number) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(timestamp),
  );
}

export default function DexieShowcasePage() {
  const [activeApp, setActiveApp] = useState<AppKey>('tasks');
  const [taskDraft, setTaskDraft] = useState('');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [contactDraft, setContactDraft] = useState({ name: '', email: '', company: '' });
  const [contactSearch, setContactSearch] = useState('');
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [editContactDraft, setEditContactDraft] = useState({ name: '', email: '', company: '' });
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const tasks = useLiveQuery(
    () => db.tasks.orderBy('createdAt').reverse().toArray(),
    [],
    [],
  );
  const contacts = useLiveQuery(
    () => db.contacts.orderBy('name').toArray(),
    [],
    [],
  );
  const notes = useLiveQuery(
    () => db.notes.orderBy('updatedAt').reverse().toArray(),
    [],
    [],
  );

  useEffect(() => {
    void seedDexieShowcase().catch(() => {
      setDatabaseError('This browser could not open local storage for the showcase.');
    });
  }, []);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  useEffect(() => {
    if (!notes.length) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !notes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (!selectedNote) return;
    setDraftTitle(selectedNote.title);
    setDraftBody(selectedNote.body);
    setSaveState('saved');
  }, [selectedNote?.id]);

  useEffect(() => {
    if (!selectedNoteId || !selectedNote) return;
    if (draftTitle === selectedNote.title && draftBody === selectedNote.body) {
      setSaveState('saved');
      return;
    }

    setSaveState('saving');
    const timeout = window.setTimeout(async () => {
      try {
        await db.notes.update(selectedNoteId, {
          title: draftTitle.trim() || 'Untitled note',
          body: draftBody,
          updatedAt: Date.now(),
        });
        setSaveState('saved');
      } catch {
        setDatabaseError('Your note could not be saved locally.');
        setSaveState('idle');
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [draftBody, draftTitle, selectedNote, selectedNoteId]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'active') return tasks.filter((task) => !task.completed);
    if (taskFilter === 'done') return tasks.filter((task) => task.completed);
    return tasks;
  }, [taskFilter, tasks]);

  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.company].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [contactSearch, contacts]);

  async function runDatabaseAction(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      setDatabaseError(null);
      setActionMessage(message);
      window.setTimeout(() => setActionMessage(''), 1800);
      return true;
    } catch {
      setDatabaseError('That local database action did not complete. Please try again.');
      return false;
    }
  }

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskDraft.trim();
    if (!title) return;

    const added = await runDatabaseAction(
      () => db.tasks.add({ title, completed: false, createdAt: Date.now() }),
      'Task added locally',
    );
    if (added) setTaskDraft('');
  }

  async function handleAddContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = contactDraft.name.trim();
    if (!name) return;

    const added = await runDatabaseAction(
      () =>
        db.contacts.add({
          name,
          email: contactDraft.email.trim(),
          company: contactDraft.company.trim(),
          favorite: false,
        }),
      'Contact added locally',
    );
    if (added) setContactDraft({ name: '', email: '', company: '' });
  }

  async function handleNewNote() {
    const id = await db.notes.add({
      title: 'Untitled note',
      body: '',
      updatedAt: Date.now(),
      color: 'pink',
    });
    setSelectedNoteId(id);
    setActiveApp('notes');
    setActionMessage('New note ready');
  }

  async function handleDeleteNote() {
    if (!selectedNoteId) return;
    await runDatabaseAction(
      () => db.notes.delete(selectedNoteId),
      'Note deleted locally',
    );
    setSelectedNoteId(null);
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className={ui.page}>
      <div className={ui.paperTexture} aria-hidden="true" />
      <section className={ui.hero}>
        <div>
          <div className={ui.kicker}>
            <span className={ui.kickerMark} /> Local lab / Dexie.js
          </div>
          <h1 className={ui.title}>
            Your browser,
            <br />
            <span className="font-normal italic text-[#78a6ff]">now with memory.</span>
          </h1>
          <p className={ui.intro}>
            Three small apps, one local database. Make a change, close the tab, come back later —
            your data stays right here.
          </p>
        </div>
        <div className={ui.heroNote}>
          <div className={ui.heroNoteTop}>
            <Database size={17} strokeWidth={1.8} />
            <span>IndexedDB connected</span>
            <span className={ui.liveDot} />
          </div>
          <strong>DexieShowcaseDatabase</strong>
          <span>3 tables · local-first · no network</span>
        </div>
      </section>

      <section className={ui.workspace}>
        <div className={ui.workspaceHeader}>
          <div>
            <span className={ui.sectionLabel}>The collection</span>
            <h2>Pick a tiny app to explore.</h2>
          </div>
          <button type="button" className={ui.secondaryButton} onClick={() => void handleNewNote()}>
            <Plus size={16} /> New note
          </button>
        </div>

        <div className={ui.tabs} role="tablist" aria-label="Dexie examples">
          {tabs.map(({ key, label, eyebrow, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeApp === key}
              aria-controls={`${key}-panel`}
              className={`${ui.tab} ${activeApp === key ? ui.activeTab : ''}`}
              onClick={() => setActiveApp(key)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>
                <strong>{label}</strong>
                <small>{eyebrow}</small>
              </span>
              <b>{key === 'tasks' ? tasks.length : key === 'contacts' ? contacts.length : notes.length}</b>
            </button>
          ))}
        </div>

        {databaseError && (
          <div className={ui.error} role="alert">
            <span>{databaseError}</span>
            <button type="button" onClick={() => setDatabaseError(null)} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        {actionMessage && <div className={ui.actionMessage} aria-live="polite">{actionMessage}</div>}

        <div className={ui.panel} role="tabpanel" id={`${activeApp}-panel`} aria-busy={!tasks && !contacts && !notes}>
          {activeApp === 'tasks' && (
            <section className={ui.appPanel} aria-labelledby="tasks-heading">
              <div className={ui.panelIntro}>
                <div>
                  <span className={ui.panelNumber}>01 / 03</span>
                  <h3 id="tasks-heading">A to-do list that never phones home.</h3>
                  <p>Add, complete, filter, and delete records. The list is powered by a reactive Dexie query.</p>
                </div>
                <div className={ui.statBlock}>
                  <strong>{completedTasks}<span>/{tasks.length}</span></strong>
                  <small>done today</small>
                </div>
              </div>

              <form className={ui.addRow} onSubmit={handleAddTask}>
                <input
                  value={taskDraft}
                  onChange={(event) => setTaskDraft(event.target.value)}
                  placeholder="What needs doing?"
                  aria-label="New task title"
                />
                <button type="submit" className={ui.primaryButton} disabled={!taskDraft.trim()}>
                  <Plus size={17} /> Add task
                </button>
              </form>

              <div className={ui.listToolbar}>
                <div className={ui.filterGroup} aria-label="Task filters">
                  {(['all', 'active', 'done'] as TaskFilter[]).map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={taskFilter === filter ? ui.selectedFilter : ''}
                      onClick={() => setTaskFilter(filter)}
                    >
                      {filter[0].toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                <span className={ui.mutedMeta}>{filteredTasks.length} showing</span>
              </div>

              <div className={ui.taskList}>
                {filteredTasks.length ? (
                  filteredTasks.map((task) => (
                    <div className={`${ui.taskRow} ${task.completed ? ui.completedTask : ''}`} key={task.id}>
                      <button
                        type="button"
                        className={ui.checkButton}
                        onClick={() => void runDatabaseAction(
                          () => db.tasks.update(task.id, { completed: !task.completed }),
                          task.completed ? 'Task reopened' : 'Task completed',
                        )}
                        aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                      >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <span className={ui.taskTitle}>{task.title}</span>
                      <span className={ui.rowDate}>{dateLabel(task.createdAt)}</span>
                      <button
                        type="button"
                        className={ui.iconButton}
                        onClick={() => void runDatabaseAction(() => db.tasks.delete(task.id), 'Task deleted')}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={ui.emptyState}>
                    <Sparkles size={20} />
                    <strong>Nothing here yet.</strong>
                    <span>Try adding a task above.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeApp === 'contacts' && (
            <section className={ui.appPanel} aria-labelledby="contacts-heading">
              <div className={ui.panelIntro}>
                <div>
                  <span className={ui.panelNumber}>02 / 03</span>
                  <h3 id="contacts-heading">A pocket-sized address book.</h3>
                  <p>Search an indexed collection, edit a record, or keep a few favorite people close.</p>
                </div>
                <div className={ui.statBlock}>
                  <strong>{contacts.filter((contact) => contact.favorite).length}</strong>
                  <small>favorites</small>
                </div>
              </div>

              <form className={ui.contactForm} onSubmit={handleAddContact}>
                <label>
                  <span>Name</span>
                  <input
                    value={contactDraft.name}
                    onChange={(event) => setContactDraft({ ...contactDraft, name: event.target.value })}
                    placeholder="Ada Lovelace"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={contactDraft.email}
                    onChange={(event) => setContactDraft({ ...contactDraft, email: event.target.value })}
                    placeholder="ada@example.com"
                  />
                </label>
                <label>
                  <span>Company</span>
                  <input
                    value={contactDraft.company}
                    onChange={(event) => setContactDraft({ ...contactDraft, company: event.target.value })}
                    placeholder="Analytical Engines"
                  />
                </label>
                <button type="submit" className={ui.primaryButton} disabled={!contactDraft.name.trim()}>
                  <Plus size={17} /> Add
                </button>
              </form>

              <div className={ui.searchRow}>
                <Search size={17} />
                <input
                  value={contactSearch}
                  onChange={(event) => setContactSearch(event.target.value)}
                  placeholder="Search name, email, or company"
                  aria-label="Search contacts"
                />
                <span>{filteredContacts.length} matches</span>
              </div>

              <div className={ui.contactList}>
                {filteredContacts.length ? filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    editing={editingContactId === contact.id}
                    editDraft={editingContactId === contact.id ? editContactDraft : contact}
                    onToggleFavorite={() => void runDatabaseAction(
                      () => db.contacts.update(contact.id, { favorite: !contact.favorite }),
                      contact.favorite ? 'Removed from favorites' : 'Saved to favorites',
                    )}
                    onDelete={() => void runDatabaseAction(() => db.contacts.delete(contact.id), 'Contact deleted')}
                    onStartEdit={() => {
                      setEditingContactId(contact.id);
                      setEditContactDraft({ name: contact.name, email: contact.email, company: contact.company });
                    }}
                    onCancelEdit={() => setEditingContactId(null)}
                    onEditChange={setEditContactDraft}
                    onSaveEdit={async () => {
                      const saved = await runDatabaseAction(
                        () => db.contacts.update(contact.id, editContactDraft),
                        'Contact updated locally',
                      );
                      if (saved) setEditingContactId(null);
                    }}
                  />
                )) : (
                  <div className={ui.emptyState}>
                    <UserRound size={20} />
                    <strong>No matching contacts.</strong>
                    <span>Try a different search or add someone new.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeApp === 'notes' && (
            <section className={ui.appPanel} aria-labelledby="notes-heading">
              <div className={ui.panelIntro}>
                <div>
                  <span className={ui.panelNumber}>03 / 03</span>
                  <h3 id="notes-heading">Thoughts, kept close.</h3>
                  <p>Write freely. The editor saves a quiet copy to IndexedDB as you type.</p>
                </div>
                <div className={ui.saveStatus} aria-live="polite">
                  <span className={saveState === 'saving' ? ui.savingDot : ui.savedDot} />
                  {saveState === 'saving' ? 'Saving locally' : 'Saved locally'}
                </div>
              </div>

              <div className={ui.notesLayout}>
                <div className={ui.noteRail}>
                  <div className={ui.noteRailHeader}>
                    <span>{notes.length} notes</span>
                    <button type="button" className={ui.miniButton} onClick={() => void handleNewNote()} aria-label="Create new note">
                      <Plus size={15} />
                    </button>
                  </div>
                  {notes.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      className={`${ui.noteCard} ${noteColorClass(note.color)} ${selectedNoteId === note.id ? ui.selectedNote : ''}`}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <span>{note.title || 'Untitled note'}</span>
                      <small>{dateLabel(note.updatedAt)}</small>
                    </button>
                  ))}
                </div>

                <div className={ui.noteEditor}>
                  {selectedNote ? (
                    <>
                      <div className={ui.editorToolbar}>
                        <span className={ui.editorLabel}>Editing locally</span>
                        <button type="button" className={ui.iconButton} onClick={() => void handleDeleteNote()} aria-label="Delete selected note">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <input
                        className={ui.noteTitleInput}
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        aria-label="Note title"
                      />
                      <textarea
                        className={ui.noteBodyInput}
                        value={draftBody}
                        onChange={(event) => setDraftBody(event.target.value)}
                        placeholder="Start writing..."
                        aria-label="Note body"
                      />
                      <div className={ui.editorFooter}>
                        <span>Autosaves after a short pause</span>
                        <ChevronRight size={15} />
                      </div>
                    </>
                  ) : (
                    <div className={ui.emptyEditor}>
                      <FileText size={24} />
                      <strong>Your notes live here.</strong>
                      <button type="button" className={ui.textButton} onClick={() => void handleNewNote()}>
                        Create a note <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <section className={ui.whySection}>
        <div className={ui.whyHeading}>
          <div>
            <span className={ui.kicker}><span className={ui.kickerMark} /> The practical bit</span>
            <h2 id="why-dexie">Why Dexie?</h2>
          </div>
          <p>
            Dexie is not a replacement for every database. It is a small, comfortable layer over the browser database you already have.
          </p>
        </div>
        <div className={ui.comparisonGrid}>
          {comparison.map((item, index) => (
            <article className={`${ui.comparisonCard} ${index === 2 ? ui.dexieCard : ''}`} key={item.label}>
              <span className={ui.cardLabel}>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {index === 2 && <span className={ui.bestFit}>Best fit for this lab</span>}
            </article>
          ))}
        </div>
        <div className={ui.whyBottomLine}>
          <Sparkles size={18} />
          <p>
            Choose Dexie for offline-first drafts, private local data, fast local search, and less network dependency. Keep shared, cross-device truth on the server — the two work beautifully together.
          </p>
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  contact,
  editing,
  editDraft,
  onToggleFavorite,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSaveEdit,
}: {
  contact: Contact;
  editing: boolean;
  editDraft: { name: string; email: string; company: string };
  onToggleFavorite: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: { name: string; email: string; company: string }) => void;
  onSaveEdit: () => Promise<void>;
}) {
  return (
    <div className={ui.contactRow}>
      <div className={ui.avatar}>{initials(contact.name)}</div>
      {editing ? (
        <div className={ui.editContactForm}>
          <input value={editDraft.name} onChange={(event) => onEditChange({ ...editDraft, name: event.target.value })} aria-label="Edit contact name" />
          <input value={editDraft.email} onChange={(event) => onEditChange({ ...editDraft, email: event.target.value })} aria-label="Edit contact email" />
          <input value={editDraft.company} onChange={(event) => onEditChange({ ...editDraft, company: event.target.value })} aria-label="Edit contact company" />
        </div>
      ) : (
        <div className={ui.contactIdentity}>
          <strong>{contact.name}</strong>
          <span>{contact.company || 'Independent'}</span>
          <small>{contact.email || 'No email yet'}</small>
        </div>
      )}
      <div className={ui.rowActions}>
        <button type="button" className={`${ui.iconButton} ${contact.favorite ? ui.favorite : ''}`} onClick={onToggleFavorite} aria-label={contact.favorite ? `Unfavorite ${contact.name}` : `Favorite ${contact.name}`}>
          <Heart size={16} fill={contact.favorite ? 'currentColor' : 'none'} />
        </button>
        {editing ? (
          <>
            <button type="button" className={ui.iconButton} onClick={() => void onSaveEdit()} aria-label="Save contact"><Check size={16} /></button>
            <button type="button" className={ui.iconButton} onClick={onCancelEdit} aria-label="Cancel editing"><X size={16} /></button>
          </>
        ) : (
          <>
            <button type="button" className={ui.iconButton} onClick={onStartEdit} aria-label={`Edit ${contact.name}`}><Pencil size={16} /></button>
            <button type="button" className={ui.iconButton} onClick={onDelete} aria-label={`Delete ${contact.name}`}><Trash2 size={16} /></button>
          </>
        )}
      </div>
    </div>
  );
}
