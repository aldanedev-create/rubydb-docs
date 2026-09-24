# Python: local to production

Python applications use the `rubydb-python` **network client** in both environments. The Python client does not open `.rdb` files. For local development, an optional platform-specific runtime wheel can start a private RubyDB server; for production, deploy and operate the server separately.

![A Python web process connects to a RubyDB server that alone owns the database path.](assets/rubydb-server.svg)

## Pick a local setup

**Option A — portable local server, if matching wheels are available for your OS:** install the 0.1.1 client and local extra, which also needs a separately published `rubydb-server` platform wheel. Availability must be checked for your platform; the repository's [Lesson 13](https://github.com/aldanedev-create/rubydb/blob/main/lessons/13-python-local-runtime.md) shows installing two maintainer-built wheels before publication.

```sh
python -m venv .venv
# Activate the venv using your shell's normal command.
python -m pip install "rubydb-python[local]==0.1.1"
rubydb-python start --data-dir .rubydb
rubydb-python status --data-dir .rubydb
```

The local server binds to `127.0.0.1`, chooses an available port, and creates a password. Its URL command contains that password. Set `RUBYDB_URL` in your **current shell only** without printing it, and ignore `.rubydb/` in Git:

```sh
export RUBYDB_URL="$(rubydb-python url --data-dir .rubydb)"
```

On PowerShell, use `$env:RUBYDB_URL = python -m rubydb.server url --data-dir .rubydb` after activating the venv. If the wheel is not available, use **Option B**: install the client (`python -m pip install rubydb-python`), start a RubyDB server from the source checkout according to the [server guide](../server/configuration.md), and set its local `rubydb://` URL. Do not suggest that the client-only package includes a server.

## Shared database setup

All three examples below use a `notes` table. Run this **once** as `init_db.py` with the same `RUBYDB_URL` used by your app:

```python
import os
import rubydb

with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
    with db.cursor() as cursor:
        cursor.execute(
            "CREATE TABLE IF NOT EXISTS notes "
            "(id INTEGER PRIMARY KEY, title TEXT NOT NULL)"
        )
print("Notes table ready")
```

```sh
python init_db.py
```

The context manager commits on success, rolls back on failure, and closes the connection. Each framework route opens its own connection for the example. Larger workloads should use a **bounded** pool.

## Choose a framework

- [Flask notes API](flask.md): minimal synchronous routes.
- [FastAPI notes API](fastapi.md): synchronous route functions served in a worker thread.
- [Django notes API](django.md): use the RubyDB client in a view; Django's ORM remains on a supported separate database.

## Move to production

Run RubyDB as a separately supervised service with persistent storage, authentication, a private network, and TLS. Inject a verified `rubydbs://` URL into the Python process from a secret manager; the app's `rubydb.connect(os.environ["RUBYDB_URL"])` call stays the same. Do not start a local RubyDB server in **every** web worker. Run schema setup/migrations as a release step, not on each request or worker startup. Test queries, writes, concurrency, backup, isolated restore, and a server restart before accepting important data. See [production operations](../operations/production-guide.md) and [how to construct a TLS URL](../tutorials/rails-production-app.md#8-connect-rails-to-the-server).
