# 7. Connect multiple processes

**Goal:** understand the switch from an embedded path to a server. A database file has **one owner** in both modes. With server mode, that owner is the RubyDB server; applications connect over the RubyDB protocol.

![Multiple Ruby application processes connect through TLS to one RubyDB server, which owns persistent storage.](assets/rubydb-server.svg)

## Start a local server

Use the repository's [server configuration](../server/configuration.md) for the exact options on your installed version. A basic local example is:

```sh
rubydb-server --host 127.0.0.1 --port 7432 --database tmp/server.rdb
```

In another terminal, connect with the Ruby client:

```ruby
require "rubydb"

client = RubyDB::Client::Client.new(url: ENV.fetch("RUBYDB_URL"))
begin
  p client.query("SELECT 1")
ensure
  client.disconnect
end
```

Set `RUBYDB_URL` to the RubyDB URL for your local server and authentication setup. The scheme is `rubydb://` for the basic connection or `rubydbs://` for TLS; it is not a PostgreSQL URL. Do not paste a credential-bearing URL into source control or logs.

## What changes in production?

Bind to a private network, require authentication and verified TLS, configure connection and resource limits, and supervise the server. Connect every web and worker process to the same service. Do **not** also open the server's file with `RubyDB.open`. See [authentication](../server/authentication.md), [deployment](../server/deployment.md), and [connection pooling](../server/connection-pooling.md).

**Next:** [prepare the workload for production](08-production.md).
