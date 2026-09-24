# About RubyDB

RubyDB is a Ruby-native relational database created by Aldane Hutchinson. It includes an embedded engine, a client/server mode, a Ruby client, and an ActiveRecord adapter.

## What RubyDB is for

RubyDB is useful for learning, local development, tests, internal tools, controlled embedded workloads, and smaller independently operated services. In embedded mode, one Ruby process owns the database path. In server mode, multiple application processes connect to one RubyDB server.

![A ruby-red gemstone above a dark database stack, with subtle data grids.](assets/rubydb-overview.png)

Its implemented surface includes tables, CRUD, joins, grouping and aggregates, transactions, constraints, indexes, durable storage and WAL recovery, plus Rails integration. See the [SQL compatibility reference](../sql/compatibility.md) for the exact supported subset.

## Current status

**RubyDB is alpha.** It is not a drop-in replacement for SQLite, PostgreSQL, or MySQL. A production workload needs its own query, concurrency, security, backup, restore, and failure validation. For a large shared application or a workload requiring mature managed services, the project recommends PostgreSQL as the primary system of record. Read [production readiness](../production-readiness.md) before relying on RubyDB for important data.

## Ecosystem

RubyDB's official integrations include the direct Ruby API, a Ruby server client, ActiveRecord for Rails, and Python and Node.js clients. Community adapters should use the documented [server protocol](../server/protocol.md); the embedded `.rdb` format is an internal implementation detail.

## Where to go next

- New to RubyDB? Follow the [eight-lesson learning path](../learn/index.md).
- Building a Rails app? Read [Rails installation](../rails/installation.md).
- Learning the available clients? Compare the [adapter guides](../adapters/index.md).
- Running multiple processes? Start with [server deployment](../server/deployment.md).
- Interested in the internals? Explore [architecture](../architecture/overview.md).
- Want to help? Read [Contribute](contribute.md).

The [source repository](https://github.com/aldanedev-create/rubydb) contains the engine, adapters, tests, and project governance.
