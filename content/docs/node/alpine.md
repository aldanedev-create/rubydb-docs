# Alpine.js + RubyDB through Node

Alpine.js adds behavior to an HTML page. It does **not** open RubyDB from the browser. Follow [Node setup](index.md), initialize the table, and run the [shared Node API](api.md).

Save this as `index.html` **next to** `server.mjs`. The shared Node API serves it at `http://127.0.0.1:3001/`, so the page and `/api/notes` use one origin:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RubyDB notes</title>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
</head>
<body>
  <main x-data="notesApp()" x-init="load()">
    <h1>Notes</h1>
    <p x-show="message" x-text="message" role="alert"></p>
    <form @submit.prevent="add()">
      <label for="title">New note</label>
      <input id="title" x-model="title" maxlength="200" required>
      <button type="submit">Add note</button>
    </form>
    <ul>
      <template x-for="note in notes" :key="note.id">
        <li x-text="note.title"></li>
      </template>
    </ul>
  </main>
  <script>
    function notesApp() {
      return {
        notes: [], title: "", message: "",
        async load() {
          try {
            const response = await fetch("/api/notes");
            if (!response.ok) throw new Error("Could not load notes");
            this.notes = (await response.json()).notes;
          } catch (error) { this.message = error.message; }
        },
        async add() {
          if (!this.title.trim()) return;
          try {
            const response = await fetch("/api/notes", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ title: this.title.trim() }),
            });
            if (!response.ok) throw new Error("Could not save note");
            this.title = "";
            this.message = "";
            await this.load();
          } catch (error) { this.message = error.message; }
        },
      };
    }
  </script>
</body>
</html>
```

Run `node server.mjs` and open `http://127.0.0.1:3001/`. `x-text` displays a title as text instead of treating user data as HTML. The `@submit.prevent` handler keeps the page from reloading. Opening the file directly with `file://` will not reach the API.

## Production

Pin and self-host the Alpine.js script or use a reviewed versioned CDN asset. Serve HTML and `/api` from the same HTTPS origin, with the API behind the reverse proxy. Keep the RubyDB URL and credentials only in Node, add authentication before exposing writes, and complete the [API production checks](api.md#shared-node-notes-api).
