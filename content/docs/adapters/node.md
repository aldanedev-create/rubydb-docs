# Node.js and TypeScript client

`rubydb-node` connects to a RubyDB server. It does not open embedded database files.

```sh
npm install rubydb-node
```

```ts
import { connect } from "rubydb-node";

const db = await connect(process.env.RUBYDB_URL!);
try {
  const result = await db.query(
    "SELECT id, name FROM users WHERE active = ? ORDER BY id",
    [true],
  );
  console.log(result.rows);
} finally {
  await db.close();
}
```

## Transactions

Connections default to `autocommit: false`. Commit or roll back the whole operation, and close the connection:

```ts
const db = await connect(process.env.RUBYDB_URL!);
try {
  await db.query("INSERT INTO audit_events (event_name) VALUES (?)", ["task.created"]);
  await db.commit();
} catch (error) {
  await db.rollback();
  throw error;
} finally {
  await db.close();
}
```

For concurrent workers, use one bounded pool per process. A timeout during a write can leave its outcome uncertain; use an idempotency key before retrying. In production use verified `rubydbs://` TLS and test against a real server. See the [Node adapter source guide](https://github.com/aldanedev-create/rubydb/blob/main/adapters/node/README.md) for prepared statements and pool examples.
