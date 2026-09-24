# Sequel integration status

The RubyDB repository documents a Sequel integration surface, but it currently **does not include a distributable Sequel adapter implementation**. Do not configure `adapter: rubydb` in Sequel and assume it will work.

Until an adapter package with live server integration tests is published, use RubyDB's Ruby client directly:

```ruby
require "rubydb"

client = RubyDB::Client::Client.new(url: ENV.fetch("RUBYDB_URL"))
begin
  p client.query("SELECT id, email FROM users WHERE id = ?", [1], timeout: 2).to_hash
ensure
  client.disconnect
end
```

A future Sequel adapter would need bind handling, schema introspection, transactions, pooling, migrations, and real-server tests. Read the [Sequel source guide](https://github.com/aldanedev-create/rubydb/blob/main/adapters/sequel/README.md) and [community adapter lesson](https://github.com/aldanedev-create/rubydb/blob/main/lessons/11-community-adapter.md) if you want to build it.
