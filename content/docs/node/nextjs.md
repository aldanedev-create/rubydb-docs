# Next.js + RubyDB: local to production

Use an App Router **Route Handler** in the Node.js runtime. `rubydb-node` needs a server with TCP access to RubyDB; it cannot run in a browser, a static export, or an incompatible Edge runtime.

## Local setup

Follow [Node setup](index.md), set a local `RUBYDB_URL` in the server environment, and run `node init-db.mjs` once. In an App Router project:

```sh
npm install rubydb-node
```

`app/api/notes/route.ts`:

```ts
import { connect } from "rubydb-node";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function withDatabase<T>(run: (db: Awaited<ReturnType<typeof connect>>) => Promise<T>) {
  const db = await connect(process.env.RUBYDB_URL!);
  db.isAutocommit = true;
  try { return await run(db); }
  finally { await db.close(); }
}

export async function GET() {
  try {
    const result = await withDatabase(db =>
      db.query("SELECT id, title FROM notes ORDER BY id"),
    );
    return Response.json({ notes: result.rows });
  } catch {
    return Response.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const title = payload && typeof payload === "object" ? payload.title : null;
  if (typeof title !== "string" || !title.trim() || title.length > 200) {
    return Response.json({ error: "title must be 1–200 characters" }, { status: 400 });
  }
  try {
    const result = await withDatabase(db =>
      db.query("INSERT INTO notes (title) VALUES (?)", [title.trim()]),
    );
    return Response.json(
      { note: { id: result.insertId, title: title.trim() } },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "database unavailable" }, { status: 503 });
  }
}
```

`app/page.tsx` uses the API without accessing the database URL:

```tsx
"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Note = { id: number; title: string };
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch("/api/notes");
    if (!response.ok) throw new Error("Could not load notes");
    setNotes((await response.json()).notes);
  }
  useEffect(() => { load().catch(error => setMessage(error.message)); }, []);
  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Could not save note");
      setTitle("");
      await load();
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    }
  }
  return <main>
    <h1>Notes</h1>
    {message && <p role="alert">{message}</p>}
    <form onSubmit={add}>
      <label htmlFor="title">New note</label>
      <input id="title" value={title} onChange={e => setTitle(e.target.value)}
        maxLength={200} required />
      <button>Add note</button>
    </form>
    <ul>{notes.map(note => <li key={note.id}>{note.title}</li>)}</ul>
  </main>;
}
```

Run `npm run dev`, then test a create/read cycle. Use a server-only `RUBYDB_URL`, **never** a `NEXT_PUBLIC_` variable.

## Production

Deploy a Next.js **Node runtime** that permits outbound TCP to a private RubyDB server. Build and run the app with verified `rubydbs://` injected through the platform secret manager; test that the chosen host supports the required TCP connection before launch. Run schema setup as a separate release step, add authentication/authorization for writes, bound connection use across instances, observability, backup and restore drills, and a recovery plan. A static GitHub Pages deployment cannot host this backend. See [Node production setup](index.md#production-boundary).
