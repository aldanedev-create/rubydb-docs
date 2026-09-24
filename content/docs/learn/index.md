# Learn RubyDB

Start with one local database file and a small notes table. Each lesson builds on the last. You can follow the first five lessons with Ruby 3.3 or newer and the `rubydb` gem.

<div class="learning-grid">
<a class="learning-card" href="#/learn/01-install"><span class="lesson-number">01 · SETUP</span><strong>Install and open a database</strong><span>Make a database file in one Ruby process.</span></a>
<a class="learning-card" href="#/learn/02-create-data"><span class="lesson-number">02 · DATA</span><strong>Create and change rows</strong><span>Use a notes table for everyday SQL.</span></a>
<a class="learning-card" href="#/learn/03-query-data"><span class="lesson-number">03 · QUERIES</span><strong>Find the rows you need</strong><span>Filter, sort, limit, and join data.</span></a>
<a class="learning-card" href="#/learn/04-schema"><span class="lesson-number">04 · STRUCTURE</span><strong>Design a small schema</strong><span>Use keys, constraints, and indexes.</span></a>
<a class="learning-card" href="#/learn/05-transactions"><span class="lesson-number">05 · SAFETY</span><strong>Keep changes together</strong><span>Commit or roll back a unit of work.</span></a>
<a class="learning-card" href="#/learn/06-rails"><span class="lesson-number">06 · FRAMEWORK</span><strong>Use RubyDB with Rails</strong><span>Configure, migrate, and test a model.</span></a>
<a class="learning-card" href="#/learn/07-server"><span class="lesson-number">07 · MULTI-PROCESS</span><strong>Connect to a server</strong><span>Move from one owner to many clients.</span></a>
<a class="learning-card" href="#/learn/08-production"><span class="lesson-number">08 · OPERATIONS</span><strong>Prepare for production</strong><span>Validate workload, backups, and recovery.</span></a>
</div>

![A ruby-red gemstone above a dark database stack, with subtle data grids.](assets/rubydb-overview.png)

## Before you choose a mode

![Embedded mode has one Ruby process owning one database path. In server mode several clients connect to one RubyDB server, which owns the database path.](assets/rubydb-modes.svg)

**Embedded** feels close to the SQLite development experience: one process opens a local file. RubyDB's SQL and file format are its own, so SQLite-specific syntax and tools should not be assumed to work. **Server mode** gives multiple application processes one database owner. Read the [supported SQL surface](../sql/compatibility.md) before bringing an existing application over.

> **Current status: alpha.** Use these examples for learning and development. For important data, test your schema, queries, concurrency, security, backup, restore, and failure scenarios on the exact version you deploy. RubyDB is not a drop-in replacement for SQLite, PostgreSQL, or MySQL.

If you already know what you need, go directly to the [SQL reference](../sql/syntax.md), [Rails integration](../rails/installation.md), [server configuration](../server/configuration.md), or [operations guide](../operations/production-guide.md).
