# 1. Install and open a database

**Goal:** create a persistent local database with one Ruby process. You need Ruby 3.3 or newer. This lesson uses the documented `rubydb` 0.1.7 release.

## Install

```sh
ruby --version
gem install rubydb -v 0.1.7
rubydb --help
```

Make a project directory. Keep generated database files outside source control.

```sh
mkdir rubydb-notes
cd rubydb-notes
mkdir tmp
```

Save this as `hello.rb`:

```ruby
require "rubydb"

db = RubyDB.open("tmp/notes.rdb")
begin
  db.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL)")
  puts db.query("SELECT id, body FROM notes ORDER BY id").inspect
ensure
  db.close
end
```

Run `ruby hello.rb`. The first result is an empty collection; `tmp/notes.rdb` contains your database. Run it again and the table still exists because `IF NOT EXISTS` prevents a duplicate-table error.

**Why close it?** The embedded engine owns its storage while open. The `ensure` block closes it even if a query raises an error. Keep the database and its related WAL and lock files together.

**Next:** [insert your first rows](02-create-data.md). If installation fails, check [troubleshooting](../troubleshooting.md).
