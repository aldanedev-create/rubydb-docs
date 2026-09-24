# RubyDB adapters

An adapter connects an application or framework to RubyDB. Choose by language and by **who owns the database file**. The embedded path belongs to one Ruby process. Python and Node clients connect to a RubyDB server; they do not read `.rdb` files directly.

| Integration | Package or API | Embedded | Server | Start here |
| --- | --- | --- | --- | --- |
| Ruby | `rubydb` | Yes, one process | Yes | [Ruby API](ruby.md) |
| Rails / ActiveRecord | `rubydb-activerecord` + `rubydb` | Yes, one process | Yes | [Rails adapter](rails.md) |
| Python DB-API 2.0 | `rubydb-python` | No | Yes | [Python client](python.md) |
| Node.js / TypeScript | `rubydb-node` | No | Yes | [Node client](node.md) |
| Sequel | Not yet a distributable adapter | No documented package | Use Ruby client meanwhile | [Sequel status](sequel.md) |

![Embedded Ruby owns a database path, while server clients connect to one RubyDB server that owns storage.](assets/rubydb-modes.svg)

## What every production adapter must preserve

The [server protocol](../server/protocol.md) is the integration boundary. A production client must handle bound parameters, transaction ownership, request deadlines and cancellation, TLS hostname and CA verification, bounded frames, error details, and clean shutdown. A thin function that sends SQL strings is not enough.

All examples use the [documented RubyDB SQL subset](../sql/compatibility.md). Do not assume PostgreSQL, MySQL, or SQLite protocol or SQL compatibility. Pin client and server versions, run live integration tests, and validate backup, restore, concurrency, and failures for the application.

For a complete application, follow [Build a Rails task app: local to production](../tutorials/rails-production-app.md).
For other frameworks, follow [Python: local to production](../python/index.md) or [Node.js: local to production](../node/index.md).
