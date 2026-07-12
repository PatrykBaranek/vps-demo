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
  page: 'relative isolate min-h-screen w-full overflow-hidden pb-24 pt-8 text-[#20221f] sm:pt-16',
  paperTexture: 'absolute inset-0 -z-10 bg-[#f7f3e8]',
  hero: 'relative z-10 mx-auto mb-10 grid w-full max-w-[1080px] items-end gap-8 sm:mb-20 lg:grid-cols-[minmax(0,1fr)_260px]',
  kicker: 'inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#1457d2]',
  kickerMark: 'inline-block size-2 rotate-12 rounded-[2px] bg-[#d9eb67] shadow-[0_0_0_3px_rgba(217,235,103,0.2)]',
  title: 'mb-5 mt-5 max-w-[680px] text-[clamp(3.4rem,8.5vw,7.8rem)] font-medium leading-[0.84] tracking-[-0.095em]',
  intro: 'm-0 max-w-[480px] text-[clamp(1rem,1.7vw,1.18rem)] leading-[1.55] text-[#62665d]',
  heroNote: 'mt-6 grid rotate-2 gap-2 rounded-[4px_20px_4px_20px] border border-[#1457d2]/20 bg-white/50 p-5 shadow-[8px_9px_0_rgba(20,87,210,0.08)] lg:mt-0',
  heroNoteTop: 'flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-[#1457d2]',
  liveDot: 'ml-auto inline-block size-[7px] rounded-full bg-[#54ad61] shadow-[0_0_0_4px_rgba(84,173,97,0.13)]',
  workspace: 'relative z-10 mx-auto w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-[#ded8ca] bg-[#fffdf7]/80 shadow-[0_30px_70px_rgba(38,35,25,0.13)]',
  workspaceHeader: 'flex flex-col items-start justify-between gap-6 p-5 sm:flex-row sm:items-end sm:px-12 sm:pt-9',
  sectionLabel: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#1457d2]',
  secondaryButton: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#ded8ca] bg-transparent px-4 py-3 text-xs font-extrabold transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  primaryButton: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#1457d2] bg-[#1457d2] px-4 py-3 text-xs font-extrabold text-white shadow-[4px_4px_0_rgba(20,87,210,0.16)] transition motion-safe:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  tabs: 'grid border-y border-[#ded8ca] bg-[#f1ede2]/60 sm:grid-cols-3',
  tab: 'grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#ded8ca] bg-transparent px-5 py-4 text-left text-[#76786e] transition hover:bg-[#fffdf7] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1457d2] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0',
  activeTab: 'bg-[#fffdf7] text-[#1457d2]',
  panel: 'min-h-[390px]',
  appPanel: 'p-5 sm:p-12',
  panelIntro: 'mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row',
  panelNumber: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] leading-none text-[#9c9c8f]',
  statBlock: 'min-w-[90px] border-l-0 pl-0 text-left sm:border-l sm:border-[#ded8ca] sm:pl-5 sm:text-right',
  addRow: 'mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]',
  listToolbar: 'mb-3 flex items-center justify-between gap-4',
  filterGroup: 'flex gap-1',
  selectedFilter: 'bg-[#e5edff] text-[#1457d2] font-extrabold',
  mutedMeta: 'text-[0.7rem] text-[#777a71]',
  taskList: 'border-t border-[#ded8ca]',
  taskRow: 'flex min-h-16 items-center gap-3 border-b border-[#ded8ca]',
  taskTitle: 'flex-1 text-sm transition data-[completed=true]:text-[#a3a59d] data-[completed=true]:line-through',
  completedTask: 'text-[#a3a59d] line-through',
  rowDate: 'text-[0.68rem] text-[#9b9d94] max-sm:hidden',
  checkButton: 'grid shrink-0 place-items-center border-0 bg-transparent p-0 text-[#1457d2] transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  iconButton: 'grid shrink-0 place-items-center border-0 bg-transparent p-1.5 text-[#a4a79d] transition hover:-translate-y-px hover:text-[#1457d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  rowActions: 'ml-auto flex gap-0.5',
  emptyState: 'grid min-h-[190px] place-items-center gap-2 p-8 text-center text-[#777a71]',
  emptyEditor: 'grid min-h-[240px] place-items-center gap-3 text-center text-[#777a71]',
  contactForm: 'grid items-end gap-3 sm:grid-cols-[1.1fr_1.2fr_1.1fr_auto]',
  contactList: 'border-t border-[#ded8ca]',
  contactRow: 'flex items-center gap-3 border-b border-[#ded8ca] py-3 max-sm:items-start',
  avatar: 'grid size-9 shrink-0 place-items-center rounded-full bg-[#e5edff] text-[0.65rem] font-extrabold text-[#1457d2]',
  contactIdentity: 'grid min-w-0 flex-1 gap-0.5',
  editContactForm: 'grid flex-1 gap-2 sm:grid-cols-3',
  searchRow: 'my-5 flex items-center gap-3 rounded-[10px] border border-[#ded8ca] bg-[#f1ede2]/50 px-3 py-2 text-[#1457d2]',
  favorite: 'text-[#dd6e69]',
  notesLayout: 'grid min-h-[330px] overflow-hidden rounded-[14px] border border-[#ded8ca] bg-[#f6f1e2]/55 lg:grid-cols-[220px_minmax(0,1fr)]',
  noteRail: 'grid grid-cols-2 gap-2 border-b border-[#ded8ca] p-3 lg:block lg:border-b-0 lg:border-r',
  noteRailHeader: 'col-span-full mb-2 flex items-center justify-between px-1 text-[0.7rem] font-extrabold uppercase tracking-[0.05em] text-[#777a71] lg:mb-2',
  miniButton: 'grid place-items-center rounded-md border-0 bg-transparent p-1 text-[#a4a79d] transition hover:-translate-y-px hover:text-[#1457d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  noteCard: 'mb-0 grid w-full gap-1 rounded-[9px] border border-transparent p-3 text-left transition hover:translate-x-0.5 hover:border-[#1457d2]/30 hover:shadow-[3px_3px_0_rgba(20,87,210,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2] lg:mb-2',
  noteYellow: 'bg-[#fff1a9]',
  noteBlue: 'bg-[#dce7ff]',
  notePink: 'bg-[#f7d6db]',
  selectedNote: 'border-[#1457d2]/30 shadow-[3px_3px_0_rgba(20,87,210,0.08)]',
  noteEditor: 'flex min-w-0 flex-col bg-[#fffdf7]/75 p-5 sm:p-6',
  editorToolbar: 'mb-5 flex items-center justify-between gap-4',
  editorLabel: 'text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#a1a397]',
  noteTitleInput: 'mb-3 w-full border-0 border-b border-transparent bg-transparent px-0 py-0 text-[clamp(1.5rem,3vw,2.1rem)] font-medium tracking-[-0.06em] outline-none focus:border-[#1457d2] focus-visible:outline-0',
  noteBodyInput: 'min-h-[180px] flex-1 resize-y border-0 bg-transparent px-0 py-2 text-sm leading-[1.7] outline-none focus-visible:outline-0',
  editorFooter: 'flex items-center gap-2 text-[0.68rem] text-[#a1a397]',
  textButton: 'inline-flex items-center gap-1 border-0 bg-transparent p-1 text-xs font-extrabold text-[#1457d2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1457d2]',
  saveStatus: 'flex items-center gap-2 text-xs text-[#777a71]',
  savedDot: 'inline-block size-[7px] rounded-full bg-[#54ad61] shadow-[0_0_0_4px_rgba(84,173,97,0.13)]',
  savingDot: 'inline-block size-[7px] rounded-full bg-[#df9c35] shadow-[0_0_0_4px_rgba(223,156,53,0.13)]',
  whySection: 'relative z-10 mx-auto w-full max-w-[1080px] pt-20 sm:pt-32',
  whyHeading: 'grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_340px]',
  comparisonGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4',
  comparisonCard: 'relative flex min-h-[210px] flex-col rounded-[14px] border border-[#ded8ca] bg-[#fffdf7]/60 p-5 transition hover:-translate-y-1 hover:shadow-[5px_6px_0_rgba(20,87,210,0.08)]',
  dexieCard: 'border-[#1457d2] bg-[#1457d2] text-white lg:-translate-y-2 lg:hover:-translate-y-3',
  cardLabel: 'text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#8c8f84]',
  bestFit: 'absolute right-4 top-4 rounded bg-[#d9eb67] px-2 py-1 text-[0.58rem] font-extrabold uppercase text-[#354019]',
  whyBottomLine: 'mx-auto mt-8 flex max-w-[700px] items-start gap-3 border-t border-[#ded8ca] px-5 py-4 text-[#1457d2]',
  error: 'mx-5 mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-[#e9b6aa] bg-[#fff0ed] px-3 py-3 text-xs text-[#9b3c2a] sm:mx-12',
  actionMessage: 'mx-5 mt-4 flex items-center justify-between gap-4 rounded-[10px] border border-[#c7df9c] bg-[#f4f9e7] px-3 py-3 text-xs text-[#4d7028] sm:mx-12',
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
            <span>now with memory.</span>
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
