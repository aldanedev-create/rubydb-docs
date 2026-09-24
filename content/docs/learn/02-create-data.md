# 2. Create and change rows

**Goal:** insert, read, update, and delete notes. Continue in the same `rubydb-notes` directory.

Replace `hello.rb` with the following. Recreating the table is safe because it uses `IF NOT EXISTS`; the rows persist across runs.

```ruby
require "rubydb"

db = RubyDB.open("tmp/notes.rdb")
begin
  db.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL)")
  db.execute("INSERT INTO notes (id, body) VALUES (1, 'Learn RubyDB')")
  db.execute("INSERT INTO notes (id, body) VALUES (2, 'Build a small app')")
  puts db.query("SELECT id, body FROM notes ORDER BY id").inspect

  db.execute("UPDATE notes SET body = 'Build a notes app' WHERE id = 2")
  db.execute("DELETE FROM notes WHERE id = 1")
  puts db.query("SELECT id, body FROM notes ORDER BY id").inspect
ensure
  db.close
end
```

Run `ruby hello.rb` **once**. The first output includes both rows; the second includes only note 2 with its new body. Running this exact script a second time tries to insert id 2 again and should fail its primary-key constraint. For repeatable experiments, use a fresh path such as `tmp/notes-v2.rdb` or remove the practice database while it is closed.

## The four basic operations

| Action | Statement | Meaning |
| --- | --- | --- |
| Create | `INSERT INTO notes ...` | Add a row |
| Read | `SELECT ... FROM notes` | Fetch rows |
| Update | `UPDATE notes ... WHERE id = 2` | Change matching rows |
| Delete | `DELETE FROM notes WHERE id = 1` | Remove matching rows |

The `WHERE` clause matters: omit it from `UPDATE` or `DELETE` and the statement can affect every row. Use [bound parameters through the client or adapter](../getting-started/first-query.md) when values come from a user; never splice input into SQL text.

**Next:** [filter and join data](03-query-data.md).
