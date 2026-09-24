# 3. Find the rows you need

**Goal:** learn to filter, order, limit, and join results. Open `rubydb shell --database tmp/queries.rdb` and enter the statements below. The shell accepts SQL; end each statement with a semicolon.

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  body TEXT NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO notes (id, body, category) VALUES (1, 'Buy tea', 'personal');
INSERT INTO notes (id, body, category) VALUES (2, 'Ship release', 'work');
INSERT INTO notes (id, body, category) VALUES (3, 'Review tests', 'work');
```

## Filter, sort, and limit

```sql
SELECT id, body FROM notes WHERE category = 'work' ORDER BY id DESC LIMIT 2;
```

Expect the work notes in descending id order: “Review tests” followed by “Ship release.” A `SELECT` does not modify rows. Try changing `LIMIT 2` to `LIMIT 1`.

## Group and count

```sql
SELECT category, COUNT(*) FROM notes GROUP BY category ORDER BY category;
```

Expect one personal note and two work notes. Aggregates turn many rows into a summary; `GROUP BY` chooses the grouping key.

## Join two tables

```sql
CREATE TABLE categories (name TEXT PRIMARY KEY, label TEXT NOT NULL);
INSERT INTO categories (name, label) VALUES ('work', 'At work');
INSERT INTO categories (name, label) VALUES ('personal', 'At home');
SELECT notes.body, categories.label
FROM notes
INNER JOIN categories ON notes.category = categories.name
ORDER BY notes.id;
```

The join adds each category's label to its note. Use qualified column names when two tables share a column name. Consult [joins](../sql/joins.md), [functions](../sql/functions.md), and [SQL compatibility](../sql/compatibility.md) before relying on a SQLite-specific operator or function.

**Next:** [design your schema](04-schema.md).
