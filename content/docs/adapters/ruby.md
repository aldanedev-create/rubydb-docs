# Ruby API

Use the core `rubydb` gem directly. Embedded mode is the shortest path for a local script with one owner; server mode is for several processes.

## Embedded: one process

```sh
gem install rubydb -v 0.1.7
mkdir -p tmp
```

```ruby
require "rubydb"

db = RubyDB.open("tmp/notes.rdb")
begin
  db.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, body TEXT NOT NULL)")
  db.execute("INSERT INTO notes (id, body) VALUES (1, 'First note')")
  p db.query("SELECT id, body FROM notes ORDER BY id")
ensure
  db.close
end
```

Run this once; a second run tries to insert id 1 again. The database persists, so adjust the id or use a new practice path. Do not let a web process, worker, and console independently open the same embedded path.

## Server: multiple processes

```ruby
require "rubydb"

client = RubyDB::Client::Client.new(url: ENV.fetch("RUBYDB_URL"))
begin
  p client.query("SELECT 1")
ensure
  client.disconnect
end
```

In production inject a `rubydbs://` URL from a secret manager, verify the server certificate, and keep traffic on a private network. Use the client binding API for external values; never concatenate user input into SQL. See [server authentication](../server/authentication.md) and the [Ruby adapter source guide](https://github.com/aldanedev-create/rubydb/blob/main/adapters/ruby/README.md).
