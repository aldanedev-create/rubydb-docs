# Flask + RubyDB: local to production

Build a small JSON notes API. Follow [Python local setup](index.md) first, set `RUBYDB_URL`, and run `python init_db.py` once. RubyDB is a separate server even when it is started by the optional local Python runtime.

```sh
python -m pip install Flask rubydb-python
```

Save `app.py`:

```python
import os
import rubydb
from flask import Flask, request

app = Flask(__name__)

@app.get("/notes")
def list_notes():
    with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, title FROM notes ORDER BY id")
            return {"notes": cursor.fetchall()}

@app.post("/notes")
def create_note():
    payload = request.get_json(silent=True)
    title = payload.get("title") if isinstance(payload, dict) else None
    if not isinstance(title, str) or not title.strip() or len(title) > 200:
        return {"error": "title must be 1–200 characters"}, 400
    with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
        with db.cursor() as cursor:
            cursor.execute("INSERT INTO notes (title) VALUES (?)", [title.strip()])
            note_id = cursor.lastrowid
    return {"note": {"id": note_id, "title": title.strip()}}, 201
```

```sh
python -m flask --app app run --debug
curl http://127.0.0.1:5000/notes
curl -X POST http://127.0.0.1:5000/notes -H 'Content-Type: application/json' -d '{"title":"Study RubyDB"}'
```

`?` binds the title separately from SQL, protecting query structure. Each request closes its connection and a successful write commits. Add tests for missing/long titles and a server outage; return a controlled 503 rather than a traceback to users.

## Production handoff

Install a pinned Flask, `rubydb-python`, and a production WSGI server compatible with your deployment OS. Run behind a reverse proxy with HTTPS for **visitors**, and use verified `rubydbs://` TLS from Flask to RubyDB. Inject `RUBYDB_URL` from a secret manager, never enable Flask debug mode, and keep database traffic on a private network. Size a bounded connection pool for all web workers, and run `init_db.py` or a reviewed migration exactly once before accepting traffic. Rehearse backup and restore against representative data; see [Python production setup](index.md#move-to-production).

The repository also contains a [tested Flask example](https://github.com/aldanedev-create/rubydb/tree/main/examples/python_flask) with a health route and live-server tests.
