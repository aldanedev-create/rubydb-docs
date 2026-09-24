# Node.js: local to production

`rubydb-node` is a Node.js/TypeScript **server client**. It connects to a RubyDB server using RubyDB's protocol; it cannot open an embedded `.rdb` file, and a web browser cannot use it directly.

![A browser calls a Node server route; that server connects to RubyDB on a private network.](assets/rubydb-server.svg)

## Start a local RubyDB server

Use the repository's [server guide](../server/configuration.md) to start RubyDB on `127.0.0.1`. The [SvelteKit example](https://github.com/aldanedev-create/rubydb/tree/main/examples/sveltekit_app) demonstrates running the source server and client together. Install the published Node client in your app:

```sh
npm install rubydb-node
```

Set `RUBYDB_URL` in the **server process** to your local `rubydb://` URL. Do not put it in frontend variables such as `VITE_*` or `NEXT_PUBLIC_*`. Initialize the table once with `init-db.mjs`:

```js
import { connect } from "rubydb-node";

const db = await connect(process.env.RUBYDB_URL);
db.isAutocommit = true;
try {
  await db.query(
    "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL)",
  );
  console.log("Notes table ready");
} finally {
  await db.close();
}
```

```sh
node init-db.mjs
```

The examples use `isAutocommit = true` for one-statement operations, following the repository's SvelteKit example. For a multi-statement unit of work, keep one connection and explicitly `commit()` or `rollback()`.

## Choose an app

- [Vue + Node API](vue.md): Vue runs in the browser; a Node API owns the RubyDB connection.
- [Alpine.js + Node API](alpine.md): small HTML page calling that same API.
- [SvelteKit](sveltekit.md): RubyDB in `+server.ts`, never in a browser component.
- [Next.js](nextjs.md): RubyDB in a Node runtime Route Handler.

## Production boundary

Deploy RubyDB separately on persistent storage. Give the Node server a private network path and a verified `rubydbs://` URL via its secret manager. Run schema setup as a release step, not from each request. Size a bounded pool for the total number of Node processes, test client/server version compatibility, and rehearse backup and restore. Static-only hosting cannot run the Node RubyDB client: the backend must support Node TCP networking. See [server deployment](../server/deployment.md) and [Node adapter reference](../adapters/node.md).
