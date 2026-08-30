'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CheckCircle2Icon,
  CheckIcon,
  CircleIcon,
  DatabaseIcon,
  FileTextIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { db, seedDexieShowcase, type Contact } from '@/lib/dexie-db';
import { cn } from '@/lib/utils';

type AppKey = 'tasks' | 'contacts' | 'notes';
type TaskFilter = 'all' | 'active' | 'done';

const tabs: { key: AppKey; label: string; icon: typeof CheckCircle2Icon }[] = [
  { key: 'tasks', label: 'Tasks', icon: CheckCircle2Icon },
  { key: 'contacts', label: 'Contacts', icon: UsersIcon },
  { key: 'notes', label: 'Notes', icon: FileTextIcon },
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

  const tasks = useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray(), [], []);
  const contacts = useLiveQuery(() => db.contacts.orderBy('name').toArray(), [], []);
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [], []);

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
  }, [selectedNote]);

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
      () => db.contacts.add({
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
    await runDatabaseAction(() => db.notes.delete(selectedNoteId), 'Note deleted locally');
    setSelectedNoteId(null);
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className="flex flex-col gap-10">
      <section className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary"><DatabaseIcon data-icon="inline-start" />Local lab · Dexie.js</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Your browser, now with memory.</h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Three small apps, one local database. Make a change, close the tab, and come back later—your data stays here.
          </p>
        </div>
        <Alert>
          <DatabaseIcon />
          <AlertTitle>IndexedDB connected</AlertTitle>
          <AlertDescription>DexieShowcaseDatabase · 3 tables · no network</AlertDescription>
        </Alert>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Local data workspace</CardTitle>
          <CardDescription>Pick an example and edit the browser database in real time.</CardDescription>
          <CardAction>
            <Button variant="outline" onClick={() => void handleNewNote()}>
              <PlusIcon data-icon="inline-start" />New note
            </Button>
          </CardAction>
        </CardHeader>

        {databaseError && (
          <div className="px-(--card-spacing)">
            <Alert variant="destructive">
              <AlertTitle>Database error</AlertTitle>
              <AlertDescription>{databaseError}</AlertDescription>
              <AlertAction>
                <Button variant="ghost" size="icon-xs" onClick={() => setDatabaseError(null)} aria-label="Dismiss error"><XIcon /></Button>
              </AlertAction>
            </Alert>
          </div>
        )}
        {actionMessage && (
          <div className="px-(--card-spacing)" aria-live="polite">
            <Alert><CheckCircle2Icon /><AlertTitle>{actionMessage}</AlertTitle></Alert>
          </div>
        )}

        <CardContent>
          <Tabs value={activeApp} onValueChange={(value) => setActiveApp(value as AppKey)}>
            <TabsList className="grid h-auto w-full grid-cols-3">
              {tabs.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key}>
                  <Icon data-icon="inline-start" />
                  {label}
                  <Badge variant="secondary">{key === 'tasks' ? tasks.length : key === 'contacts' ? contacts.length : notes.length}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="tasks">
              <section className="flex flex-col gap-6 pt-4" aria-labelledby="tasks-heading">
                <SectionIntro
                  id="tasks-heading"
                  title="A to-do list that never phones home"
                  description="Add, complete, filter, and delete records with a reactive Dexie query."
                  metric={`${completedTasks}/${tasks.length}`}
                  metricLabel="completed"
                />

                <form onSubmit={handleAddTask}>
                  <FieldGroup className="sm:flex-row">
                    <Field>
                      <FieldLabel htmlFor="new-task" className="sr-only">New task title</FieldLabel>
                      <Input id="new-task" value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="What needs doing?" />
                    </Field>
                    <Button type="submit" disabled={!taskDraft.trim()}>
                      <PlusIcon data-icon="inline-start" />Add task
                    </Button>
                  </FieldGroup>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <ToggleGroup
                    value={[taskFilter]}
                    onValueChange={(value) => value[0] && setTaskFilter(value[0] as TaskFilter)}
                    variant="outline"
                    size="sm"
                  >
                    {(['all', 'active', 'done'] as TaskFilter[]).map((filter) => (
                      <ToggleGroupItem key={filter} value={filter}>{filter[0].toUpperCase() + filter.slice(1)}</ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <span className="text-sm text-muted-foreground">{filteredTasks.length} showing</span>
                </div>

                <div className="flex flex-col gap-2">
                  {filteredTasks.length ? filteredTasks.map((task) => (
                    <Card key={task.id} size="sm">
                      <CardContent className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void runDatabaseAction(
                            () => db.tasks.update(task.id, { completed: !task.completed }),
                            task.completed ? 'Task reopened' : 'Task completed',
                          )}
                          aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                        >
                          {task.completed ? <CheckCircle2Icon /> : <CircleIcon />}
                        </Button>
                        <span className={cn('flex-1', task.completed && 'text-muted-foreground line-through')}>{task.title}</span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">{dateLabel(task.createdAt)}</span>
                        <Button variant="ghost" size="icon-sm" onClick={() => void runDatabaseAction(() => db.tasks.delete(task.id), 'Task deleted')} aria-label={`Delete ${task.title}`}><Trash2Icon /></Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon"><SparklesIcon /></EmptyMedia>
                        <EmptyTitle>Nothing here yet</EmptyTitle>
                        <EmptyDescription>Try adding a task above.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="contacts">
              <section className="flex flex-col gap-6 pt-4" aria-labelledby="contacts-heading">
                <SectionIntro
                  id="contacts-heading"
                  title="A pocket-sized address book"
                  description="Search an indexed collection, edit a record, or keep favorite people close."
                  metric={String(contacts.filter((contact) => contact.favorite).length)}
                  metricLabel="favorites"
                />

                <form onSubmit={handleAddContact}>
                  <FieldGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_auto]">
                    <Field>
                      <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                      <Input id="contact-name" value={contactDraft.name} onChange={(event) => setContactDraft({ ...contactDraft, name: event.target.value })} placeholder="Ada Lovelace" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                      <Input id="contact-email" type="email" value={contactDraft.email} onChange={(event) => setContactDraft({ ...contactDraft, email: event.target.value })} placeholder="ada@example.com" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="contact-company">Company</FieldLabel>
                      <Input id="contact-company" value={contactDraft.company} onChange={(event) => setContactDraft({ ...contactDraft, company: event.target.value })} placeholder="Analytical Engines" />
                    </Field>
                    <Button type="submit" className="self-end" disabled={!contactDraft.name.trim()}><PlusIcon data-icon="inline-start" />Add</Button>
                  </FieldGroup>
                </form>

                <InputGroup>
                  <InputGroupAddon><SearchIcon /></InputGroupAddon>
                  <InputGroupInput value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search name, email, or company" aria-label="Search contacts" />
                  <InputGroupAddon align="inline-end"><InputGroupText>{filteredContacts.length} matches</InputGroupText></InputGroupAddon>
                </InputGroup>

                <div className="flex flex-col gap-2">
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
                        const saved = await runDatabaseAction(() => db.contacts.update(contact.id, editContactDraft), 'Contact updated locally');
                        if (saved) setEditingContactId(null);
                      }}
                    />
                  )) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon"><UsersIcon /></EmptyMedia>
                        <EmptyTitle>No matching contacts</EmptyTitle>
                        <EmptyDescription>Try another search or add someone new.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="notes">
              <section className="flex flex-col gap-6 pt-4" aria-labelledby="notes-heading">
                <SectionIntro
                  id="notes-heading"
                  title="Thoughts, kept close"
                  description="Write freely. The editor saves to IndexedDB after a short pause."
                  metric={saveState === 'saving' ? 'Saving' : 'Saved'}
                  metricLabel="locally"
                />

                <div className="grid min-h-96 overflow-hidden rounded-xl border lg:grid-cols-[15rem_minmax(0,1fr)]">
                  <aside className="flex flex-col gap-2 border-b bg-muted/30 p-3 lg:border-r lg:border-b-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">{notes.length} notes</span>
                      <Button variant="ghost" size="icon-sm" onClick={() => void handleNewNote()} aria-label="Create new note"><PlusIcon /></Button>
                    </div>
                    {notes.map((note) => (
                      <Button
                        key={note.id}
                        variant={selectedNoteId === note.id ? 'secondary' : 'ghost'}
                        className="h-auto justify-start"
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">{note.title || 'Untitled note'}</span>
                        <Badge variant="outline">{dateLabel(note.updatedAt)}</Badge>
                      </Button>
                    ))}
                  </aside>

                  <div className="flex min-w-0 flex-col gap-4 p-5">
                    {selectedNote ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="secondary">{saveState === 'saving' ? 'Saving locally' : 'Saved locally'}</Badge>
                          <Button variant="ghost" size="icon-sm" onClick={() => void handleDeleteNote()} aria-label="Delete selected note"><Trash2Icon /></Button>
                        </div>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="note-title" className="sr-only">Note title</FieldLabel>
                            <Input id="note-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="note-body" className="sr-only">Note body</FieldLabel>
                            <Textarea id="note-body" className="min-h-56 resize-y" value={draftBody} onChange={(event) => setDraftBody(event.target.value)} placeholder="Start writing..." />
                          </Field>
                        </FieldGroup>
                      </>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon"><FileTextIcon /></EmptyMedia>
                          <EmptyTitle>Your notes live here</EmptyTitle>
                          <EmptyDescription>Create a note to start writing.</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent><Button onClick={() => void handleNewNote()}><PlusIcon data-icon="inline-start" />Create note</Button></EmptyContent>
                      </Empty>
                    )}
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-6" aria-labelledby="why-dexie">
        <div className="flex max-w-3xl flex-col gap-2">
          <Badge variant="outline">The practical bit</Badge>
          <h2 id="why-dexie" className="text-3xl font-semibold tracking-tight">Why Dexie?</h2>
          <p className="text-muted-foreground">Dexie is a comfortable layer over the browser database you already have.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comparison.map((item, index) => (
            <Card key={item.label}>
              <CardHeader>
                <Badge variant={index === 2 ? 'default' : 'secondary'}>{item.label}</Badge>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
                {index === 2 && <CardAction><Badge variant="outline">Best fit</Badge></CardAction>}
              </CardHeader>
            </Card>
          ))}
        </div>
        <Alert>
          <SparklesIcon />
          <AlertTitle>Where it fits</AlertTitle>
          <AlertDescription>Choose Dexie for offline-first drafts, private local data, and fast local search. Keep shared, cross-device truth on the server.</AlertDescription>
        </Alert>
      </section>
    </div>
  );
}

function SectionIntro({ id, title, description, metric, metricLabel }: { id: string; title: string; description: string; metric: string; metricLabel: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-1">
        <h2 id={id} className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="text-right"><strong className="block text-2xl">{metric}</strong><span className="text-sm text-muted-foreground">{metricLabel}</span></div>
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
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <Avatar><AvatarFallback>{initials(contact.name)}</AvatarFallback></Avatar>
        {editing ? (
          <FieldGroup className="grid flex-1 gap-2 sm:grid-cols-3">
            <Field><FieldLabel className="sr-only" htmlFor={`edit-name-${contact.id}`}>Name</FieldLabel><Input id={`edit-name-${contact.id}`} value={editDraft.name} onChange={(event) => onEditChange({ ...editDraft, name: event.target.value })} /></Field>
            <Field><FieldLabel className="sr-only" htmlFor={`edit-email-${contact.id}`}>Email</FieldLabel><Input id={`edit-email-${contact.id}`} value={editDraft.email} onChange={(event) => onEditChange({ ...editDraft, email: event.target.value })} /></Field>
            <Field><FieldLabel className="sr-only" htmlFor={`edit-company-${contact.id}`}>Company</FieldLabel><Input id={`edit-company-${contact.id}`} value={editDraft.company} onChange={(event) => onEditChange({ ...editDraft, company: event.target.value })} /></Field>
          </FieldGroup>
        ) : (
          <div className="min-w-0 flex-1">
            <strong className="block truncate">{contact.name}</strong>
            <span className="block truncate text-sm text-muted-foreground">{contact.company || 'Independent'} · {contact.email || 'No email yet'}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant={contact.favorite ? 'secondary' : 'ghost'} size="icon-sm" onClick={onToggleFavorite} aria-label={contact.favorite ? `Unfavorite ${contact.name}` : `Favorite ${contact.name}`}><HeartIcon fill={contact.favorite ? 'currentColor' : 'none'} /></Button>
          {editing ? (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => void onSaveEdit()} aria-label="Save contact"><CheckIcon /></Button>
              <Button variant="ghost" size="icon-sm" onClick={onCancelEdit} aria-label="Cancel editing"><XIcon /></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" onClick={onStartEdit} aria-label={`Edit ${contact.name}`}><PencilIcon /></Button>
              <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${contact.name}`}><Trash2Icon /></Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
