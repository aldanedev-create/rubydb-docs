# 4. Design a small schema

**Goal:** make invalid records harder to store. Use a new practice database: `rubydb shell --database tmp/schema.rdb`.

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX tasks_project_idx ON tasks (project_id);
```

![The projects table has one-to-many relationship with tasks through tasks.project_id.](assets/rubydb-schema.svg)

Insert parent rows before dependent rows:

```sql
INSERT INTO projects (id, name) VALUES (1, 'Docs');
INSERT INTO tasks (id, project_id, title) VALUES (1, 1, 'Write a tutorial');
SELECT projects.name, tasks.title
FROM projects
INNER JOIN tasks ON tasks.project_id = projects.id;
```

**Primary key** identifies a row. **Unique** prevents duplicate project names. **Not null** requires a value. **Foreign key** describes the relationship. **Index** can make lookups by project faster, while costing storage and write work. Measure before adding indexes to every column.

Schema and constraint behavior depend on the documented RubyDB SQL subset. Test constraint failures and index plans on your version. See [data types](../sql/data-types.md), [indexes](../architecture/indexes.md), and [SQL compatibility](../sql/compatibility.md).

**Next:** [make multi-step changes safely](05-transactions.md).
