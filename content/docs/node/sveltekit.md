# SvelteKit + RubyDB: local to production

SvelteKit has server routes, so no separate Node API project is needed. RubyDB stays in `src/lib/server/` and `+server.ts`; the browser calls `/api/notes`. The RubyDB repository includes a [runnable SvelteKit example](https://github.com/aldanedev-create/rubydb/tree/main/examples/sveltekit_app) with a real-server smoke test.

## Local setup

Follow [Node setup](index.md), set the local `RUBYDB_URL`, and initialize the notes table. In a SvelteKit project using a **Node-capable** adapter, install `rubydb-node`:

```sh
npm install rubydb-node
```

`src/lib/server/database.ts`:

```ts
import { connect, type Connection } from "rubydb-node";
import { env } from "$env/dynamic/private";

export async function withDatabase<T>(run: (db: Connection) => Promise<T>): Promise<T> {
  const db = await connect(env.RUBYDB_URL);
  db.isAutocommit = true;
  try { return await run(db); }
  finally { await db.close(); }
}
```

`src/routes/api/notes/+server.ts`:

```ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { withDatabase } from "$lib/server/database";

export const GET: RequestHandler = async () => {
  try {
    const result = await withDatabase(db =>
      db.query("SELECT id, title FROM notes ORDER BY id"),
    );
    return json({ notes: result.rows });
  } catch {
    return json({ error: "database unavailable" }, { status: 503 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.json().catch(() => null);
  const title = payload && typeof payload === "object" ? payload.title : null;
  if (typeof title !== "string" || !title.trim() || title.length > 200) {
    return json({ error: "title must be 1–200 characters" }, { status: 400 });
  }
  try {
    const result = await withDatabase(db =>
      db.query("INSERT INTO notes (title) VALUES (?)", [title.trim()]),
    );
    return json({ note: { id: result.insertId, title: title.trim() } }, { status: 201 });
  } catch {
    return json({ error: "database unavailable" }, { status: 503 });
  }
};
```

`src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  let notes: { id: number; title: string }[] = [];
  let title = "";
  let message = "";
  async function load() {
    const response = await fetch("/api/notes");
    if (!response.ok) throw new Error("Could not load notes");
    notes = (await response.json()).notes;
  }
  async function add() {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Could not save note");
      title = "";
      await load();
      message = "";
    } catch (error) { message = error instanceof Error ? error.message : "Request failed"; }
  }
  onMount(() => { load().catch(error => { message = error.message; }); });
</script>

<h1>Notes</h1>
{#if message}<p role="alert">{message}</p>{/if}
<form onsubmit={(event) => { event.preventDefault(); add(); }}>
  <label for="title">New note</label>
  <input id="title" bind:value={title} maxlength="200" required />
  <button>Add note</button>
</form>
<ul>{#each notes as note (note.id)}<li>{note.title}</li>{/each}</ul>
```

Run `npm run dev` and try a create/read cycle. The URL belongs in the **server** environment; `$env/dynamic/private` prevents exposing it in the browser bundle.

## Production

Use `@sveltejs/adapter-node` or another target that really supports the Node TCP client; **static export or an incompatible edge runtime will not work**. Build the app, run its Node server behind HTTPS, inject verified `rubydbs://`, and use a private database network. Run schema initialization as a release step and test a real HTTP create/read flow, concurrent traffic, a RubyDB restart, backups, and restore. Add app authentication before exposing writes. See the [SvelteKit example's production boundary](https://github.com/aldanedev-create/rubydb/blob/main/examples/sveltekit_app/README.md) and [Node production setup](index.md#production-boundary).
