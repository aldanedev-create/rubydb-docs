# Django + RubyDB client: local to production

**Important boundary:** the repository includes a Python DB-API client, **not a Django ORM database backend**. Do not put `rubydb` in Django's `DATABASES["default"]["ENGINE"]` or claim that `manage.py migrate` creates RubyDB tables. Keep Django's own auth, sessions, admin, and migrations on a supported database. Use the RubyDB client for a specific service-owned notes feature.

Follow [Python local setup](index.md), set `RUBYDB_URL`, and run `python init_db.py` separately. Then:

```sh
python -m pip install Django rubydb-python
django-admin startproject school
cd school
python manage.py startapp notes
```

Keep the generated `DATABASES` configuration for Django's own tables. Add `notes` to `INSTALLED_APPS`, then create `notes/views.py`:

```python
import json
import os
import rubydb
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "POST"])
def notes_api(request):
    if request.method == "POST":
        try:
            payload = json.loads(request.body)
        except (ValueError, UnicodeDecodeError):
            return JsonResponse({"error": "invalid JSON"}, status=400)
        title = payload.get("title") if isinstance(payload, dict) else None
        if not isinstance(title, str) or not title.strip() or len(title) > 200:
            return JsonResponse({"error": "title must be 1–200 characters"}, status=400)
        with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
            with db.cursor() as cursor:
                cursor.execute("INSERT INTO notes (title) VALUES (?)", [title.strip()])
                note_id = cursor.lastrowid
        return JsonResponse({"note": {"id": note_id, "title": title.strip()}}, status=201)

    with rubydb.connect(os.environ["RUBYDB_URL"], timeout=5) as db:
        with db.cursor() as cursor:
            cursor.execute("SELECT id, title FROM notes ORDER BY id")
            rows = cursor.fetchall()
    return JsonResponse({"notes": rows})
```

In `school/urls.py`, add `path("notes/", notes_api)` to `urlpatterns` and import `notes_api` from `notes.views`. Run Django's own migrations for its default database, then start local development:

```sh
python manage.py migrate
python manage.py runserver
curl http://127.0.0.1:8000/notes/
```

For browser form POSTs, retain Django's CSRF protection and include a CSRF token. For cross-origin API clients, add an explicit authentication and CSRF design; do not disable protections to make the example work. A production feature should also translate RubyDB outages into a controlled 503 response.

## Production handoff

Deploy Django with a supported production web server and its normal security settings, a supported Django ORM database for framework tables, and a separately managed RubyDB server for the notes feature. Inject verified `rubydbs://` from a secret manager and configure both databases' backups. Run Django migrations and RubyDB schema setup **as separate release steps**. Test the two failure paths independently and document which data belongs in which database. A full ORM integration would require a separately developed and tested Django backend.
