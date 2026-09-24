# Shared Node notes API

Vue and Alpine.js are browser UIs. They call this Node API over HTTP; **only the Node process** sees `RUBYDB_URL`. Follow [Node local setup](index.md) and run `node init-db.mjs` first.

Save `server.mjs` in a Node project with `rubydb-node` installed:

```js
import http from "node:http";
import { readFile } from "node:fs/promises";
import { connect } from "rubydb-node";

async function withDatabase(operation) {
  const db = await connect(process.env.RUBYDB_URL);
  db.isAutocommit = true;
  try {
    return await operation(db);
  } finally {
    await db.close();
  }
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/" && req.method === "GET") {
    try {
      const html = await readFile(new URL("./index.html", import.meta.url));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch { return send(res, 404, { error: "index.html not found" }); }
  }
  if (pathname !== "/api/notes") {
    return send(res, 404, { error: "not found" });
  }
  try {
    if (req.method === "GET") {
      const result = await withDatabase(db =>
        db.query("SELECT id, title FROM notes ORDER BY id"),
      );
      return send(res, 200, { notes: result.rows });
    }
    if (req.method === "POST") {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 10_000) return send(res, 413, { error: "too large" });
      }
      let payload;
      try { payload = JSON.parse(raw); }
      catch { return send(res, 400, { error: "invalid JSON" }); }
      const title = payload?.title;
      if (typeof title !== "string" || !title.trim() || title.length > 200) {
        return send(res, 400, { error: "title must be 1–200 characters" });
      }
      const result = await withDatabase(db =>
        db.query("INSERT INTO notes (title) VALUES (?)", [title.trim()]),
      );
      return send(res, 201, { note: { id: result.insertId, title: title.trim() } });
    }
    return send(res, 405, { error: "method not allowed" });
  } catch (error) {
    console.error("notes request failed", error);
    return send(res, 503, { error: "database unavailable" });
  }
});

server.listen(3001, "127.0.0.1", () => console.log("API on port 3001"));
```

```sh
node server.mjs
curl http://127.0.0.1:3001/api/notes
curl -X POST http://127.0.0.1:3001/api/notes -H 'Content-Type: application/json' -d '{"title":"Hello from Node"}'
```

The API uses a separate connection per request for teaching clarity. A real service can use the client's bounded `ConnectionPool`. Add authentication/authorization, request limits, structured logs without secrets, and failure tests before publishing writes to the internet.

The optional `/` route serves an `index.html` next to `server.mjs` for the Alpine.js lesson. Vue uses its own Vite dev server and proxy instead.

**Production:** serve your built frontend and route `/api/*` to this supervised Node process under the same HTTPS origin. Bind the API to a private interface, inject a verified `rubydbs://` URL only into Node, and run the server on a host that can reach RubyDB over TCP. Test backup, restore, retries, and bounded connection use. See [production boundary](index.md#production-boundary).
