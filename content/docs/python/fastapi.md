# FastAPI + RubyDB: local to production

RubyDB's Python DB-API client is synchronous. Use normal `def` route functions so FastAPI runs blocking database work outside the event loop. Follow [Python local setup](index.md), set `RUBYDB_URL`, and run `python init_db.py` once.

```sh
python -m pip install fastapi uvicorn rubydb-python
```

Save `app.py`:

```python
import os
import rubydb
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class NewNote(BaseModel):
    title: str = Field(min_length=1, max_length=200)

@app.get("/notes")
def list_notes():
    with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, title FROM notes ORDER BY id")
            return {"notes": cursor.fetchall()}

@app.post("/notes", status_code=201)
def create_note(note: NewNote):
    title = note.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="title cannot be blank")
    with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
        with db.cursor() as cursor:
            cursor.execute("INSERT INTO notes (title) VALUES (?)", [title])
            note_id = cursor.lastrowid
    return {"note": {"id": note_id, "title": title}}
```

```sh
uvicorn app:app --reload
curl http://127.0.0.1:8000/notes
curl -X POST http://127.0.0.1:8000/notes -H 'Content-Type: application/json' -d '{"title":"Learn FastAPI"}'
```

Check the interactive API docs at `http://127.0.0.1:8000/docs`. Add integration tests with a real RubyDB server, including invalid input and unavailable database behavior.

## Production handoff

Run an ASGI server/process manager without `--reload`. Inject a verified `rubydbs://` URL, keep the database private, and limit total connections across workers. Use synchronous endpoints or move DB-API work to a thread if you later add `async def` routes. Run schema setup separately, protect public endpoints with your app's authentication/authorization where needed, and rehearse backup/restore and failure handling. Follow the [Python production checklist](index.md#move-to-production).
