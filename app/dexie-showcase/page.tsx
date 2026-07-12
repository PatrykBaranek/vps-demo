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

import styles from './dexie-showcase.module.css';

type AppKey = 'tasks' | 'contacts' | 'notes';
type TaskFilter = 'all' | 'active' | 'done';

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
    <div className={styles.page}>
      <div className={styles.paperTexture} aria-hidden="true" />
      <section className={styles.hero}>
        <div>
          <div className={styles.kicker}>
            <span className={styles.kickerMark} /> Local lab / Dexie.js
          </div>
          <h1 className={styles.title}>
            Your browser,
            <br />
            <span>now with memory.</span>
          </h1>
          <p className={styles.intro}>
            Three small apps, one local database. Make a change, close the tab, come back later —
            your data stays right here.
          </p>
        </div>
        <div className={styles.heroNote}>
          <div className={styles.heroNoteTop}>
            <Database size={17} strokeWidth={1.8} />
            <span>IndexedDB connected</span>
            <span className={styles.liveDot} />
          </div>
          <strong>DexieShowcaseDatabase</strong>
          <span>3 tables · local-first · no network</span>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <div>
            <span className={styles.sectionLabel}>The collection</span>
            <h2>Pick a tiny app to explore.</h2>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => void handleNewNote()}>
            <Plus size={16} /> New note
          </button>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Dexie examples">
          {tabs.map(({ key, label, eyebrow, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeApp === key}
              aria-controls={`${key}-panel`}
              className={`${styles.tab} ${activeApp === key ? styles.activeTab : ''}`}
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
          <div className={styles.error} role="alert">
            <span>{databaseError}</span>
            <button type="button" onClick={() => setDatabaseError(null)} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        {actionMessage && <div className={styles.actionMessage} aria-live="polite">{actionMessage}</div>}

        <div className={styles.panel} role="tabpanel" id={`${activeApp}-panel`} aria-busy={!tasks && !contacts && !notes}>
          {activeApp === 'tasks' && (
            <section className={styles.appPanel} aria-labelledby="tasks-heading">
              <div className={styles.panelIntro}>
                <div>
                  <span className={styles.panelNumber}>01 / 03</span>
                  <h3 id="tasks-heading">A to-do list that never phones home.</h3>
                  <p>Add, complete, filter, and delete records. The list is powered by a reactive Dexie query.</p>
                </div>
                <div className={styles.statBlock}>
                  <strong>{completedTasks}<span>/{tasks.length}</span></strong>
                  <small>done today</small>
                </div>
              </div>

              <form className={styles.addRow} onSubmit={handleAddTask}>
                <input
                  value={taskDraft}
                  onChange={(event) => setTaskDraft(event.target.value)}
                  placeholder="What needs doing?"
                  aria-label="New task title"
                />
                <button type="submit" className={styles.primaryButton} disabled={!taskDraft.trim()}>
                  <Plus size={17} /> Add task
                </button>
              </form>

              <div className={styles.listToolbar}>
                <div className={styles.filterGroup} aria-label="Task filters">
                  {(['all', 'active', 'done'] as TaskFilter[]).map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={taskFilter === filter ? styles.selectedFilter : ''}
                      onClick={() => setTaskFilter(filter)}
                    >
                      {filter[0].toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                <span className={styles.mutedMeta}>{filteredTasks.length} showing</span>
              </div>

              <div className={styles.taskList}>
                {filteredTasks.length ? (
                  filteredTasks.map((task) => (
                    <div className={`${styles.taskRow} ${task.completed ? styles.completedTask : ''}`} key={task.id}>
                      <button
                        type="button"
                        className={styles.checkButton}
                        onClick={() => void runDatabaseAction(
                          () => db.tasks.update(task.id, { completed: !task.completed }),
                          task.completed ? 'Task reopened' : 'Task completed',
                        )}
                        aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                      >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.rowDate}>{dateLabel(task.createdAt)}</span>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => void runDatabaseAction(() => db.tasks.delete(task.id), 'Task deleted')}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <Sparkles size={20} />
                    <strong>Nothing here yet.</strong>
                    <span>Try adding a task above.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeApp === 'contacts' && (
            <section className={styles.appPanel} aria-labelledby="contacts-heading">
              <div className={styles.panelIntro}>
                <div>
                  <span className={styles.panelNumber}>02 / 03</span>
                  <h3 id="contacts-heading">A pocket-sized address book.</h3>
                  <p>Search an indexed collection, edit a record, or keep a few favorite people close.</p>
                </div>
                <div className={styles.statBlock}>
                  <strong>{contacts.filter((contact) => contact.favorite).length}</strong>
                  <small>favorites</small>
                </div>
              </div>

              <form className={styles.contactForm} onSubmit={handleAddContact}>
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
                <button type="submit" className={styles.primaryButton} disabled={!contactDraft.name.trim()}>
                  <Plus size={17} /> Add
                </button>
              </form>

              <div className={styles.searchRow}>
                <Search size={17} />
                <input
                  value={contactSearch}
                  onChange={(event) => setContactSearch(event.target.value)}
                  placeholder="Search name, email, or company"
                  aria-label="Search contacts"
                />
                <span>{filteredContacts.length} matches</span>
              </div>

              <div className={styles.contactList}>
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
                  <div className={styles.emptyState}>
                    <UserRound size={20} />
                    <strong>No matching contacts.</strong>
                    <span>Try a different search or add someone new.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeApp === 'notes' && (
            <section className={styles.appPanel} aria-labelledby="notes-heading">
              <div className={styles.panelIntro}>
                <div>
                  <span className={styles.panelNumber}>03 / 03</span>
                  <h3 id="notes-heading">Thoughts, kept close.</h3>
                  <p>Write freely. The editor saves a quiet copy to IndexedDB as you type.</p>
                </div>
                <div className={styles.saveStatus} aria-live="polite">
                  <span className={saveState === 'saving' ? styles.savingDot : styles.savedDot} />
                  {saveState === 'saving' ? 'Saving locally' : 'Saved locally'}
                </div>
              </div>

              <div className={styles.notesLayout}>
                <div className={styles.noteRail}>
                  <div className={styles.noteRailHeader}>
                    <span>{notes.length} notes</span>
                    <button type="button" className={styles.miniButton} onClick={() => void handleNewNote()} aria-label="Create new note">
                      <Plus size={15} />
                    </button>
                  </div>
                  {notes.map((note) => (
                    <button
                      type="button"
                      key={note.id}
                      className={`${styles.noteCard} ${styles[`note${note.color}`]} ${selectedNoteId === note.id ? styles.selectedNote : ''}`}
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <span>{note.title || 'Untitled note'}</span>
                      <small>{dateLabel(note.updatedAt)}</small>
                    </button>
                  ))}
                </div>

                <div className={styles.noteEditor}>
                  {selectedNote ? (
                    <>
                      <div className={styles.editorToolbar}>
                        <span className={styles.editorLabel}>Editing locally</span>
                        <button type="button" className={styles.iconButton} onClick={() => void handleDeleteNote()} aria-label="Delete selected note">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <input
                        className={styles.noteTitleInput}
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        aria-label="Note title"
                      />
                      <textarea
                        className={styles.noteBodyInput}
                        value={draftBody}
                        onChange={(event) => setDraftBody(event.target.value)}
                        placeholder="Start writing..."
                        aria-label="Note body"
                      />
                      <div className={styles.editorFooter}>
                        <span>Autosaves after a short pause</span>
                        <ChevronRight size={15} />
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyEditor}>
                      <FileText size={24} />
                      <strong>Your notes live here.</strong>
                      <button type="button" className={styles.textButton} onClick={() => void handleNewNote()}>
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

      <section className={styles.whySection}>
        <div className={styles.whyHeading}>
          <div>
            <span className={styles.kicker}><span className={styles.kickerMark} /> The practical bit</span>
            <h2 id="why-dexie">Why Dexie?</h2>
          </div>
          <p>
            Dexie is not a replacement for every database. It is a small, comfortable layer over the browser database you already have.
          </p>
        </div>
        <div className={styles.comparisonGrid}>
          {comparison.map((item, index) => (
            <article className={`${styles.comparisonCard} ${index === 2 ? styles.dexieCard : ''}`} key={item.label}>
              <span className={styles.cardLabel}>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {index === 2 && <span className={styles.bestFit}>Best fit for this lab</span>}
            </article>
          ))}
        </div>
        <div className={styles.whyBottomLine}>
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
    <div className={styles.contactRow}>
      <div className={styles.avatar}>{initials(contact.name)}</div>
      {editing ? (
        <div className={styles.editContactForm}>
          <input value={editDraft.name} onChange={(event) => onEditChange({ ...editDraft, name: event.target.value })} aria-label="Edit contact name" />
          <input value={editDraft.email} onChange={(event) => onEditChange({ ...editDraft, email: event.target.value })} aria-label="Edit contact email" />
          <input value={editDraft.company} onChange={(event) => onEditChange({ ...editDraft, company: event.target.value })} aria-label="Edit contact company" />
        </div>
      ) : (
        <div className={styles.contactIdentity}>
          <strong>{contact.name}</strong>
          <span>{contact.company || 'Independent'}</span>
          <small>{contact.email || 'No email yet'}</small>
        </div>
      )}
      <div className={styles.rowActions}>
        <button type="button" className={`${styles.iconButton} ${contact.favorite ? styles.favorite : ''}`} onClick={onToggleFavorite} aria-label={contact.favorite ? `Unfavorite ${contact.name}` : `Favorite ${contact.name}`}>
          <Heart size={16} fill={contact.favorite ? 'currentColor' : 'none'} />
        </button>
        {editing ? (
          <>
            <button type="button" className={styles.iconButton} onClick={() => void onSaveEdit()} aria-label="Save contact"><Check size={16} /></button>
            <button type="button" className={styles.iconButton} onClick={onCancelEdit} aria-label="Cancel editing"><X size={16} /></button>
          </>
        ) : (
          <>
            <button type="button" className={styles.iconButton} onClick={onStartEdit} aria-label={`Edit ${contact.name}`}><Pencil size={16} /></button>
            <button type="button" className={styles.iconButton} onClick={onDelete} aria-label={`Delete ${contact.name}`}><Trash2 size={16} /></button>
          </>
        )}
      </div>
    </div>
  );
}
