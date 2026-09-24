# Rails and ActiveRecord adapter

`rubydb-activerecord` registers `adapter: rubydb` with Rails. It exposes model queries, transactions, migrations, schema inspection, and pooling over RubyDB's tested feature set. The adapter is not a SQLite or PostgreSQL compatibility layer.

## Install

The adapter README documents Ruby 3.3+, ActiveRecord 7.1–8.0, RubyDB 0.1.7, and adapter 0.1.3. Pin a combination tested by your application:

```ruby
# Gemfile
gem "rubydb", "~> 0.1.7"
gem "rubydb-activerecord", "~> 0.1.3"
```

```sh
bundle install
```

## Local, single owner

```yaml
# config/database.yml
development:
  adapter: rubydb
  embedded: true
  database: <%= Rails.root.join("tmp/development.rdb") %>

test:
  adapter: rubydb
  embedded: true
  database: <%= Rails.root.join("tmp/test.rdb") %>
```

Run `bin/rails db:migrate` and a real model query. Keep web, console, and background job processes from opening that same embedded path at once.

## Production, multiple processes

```yaml
production:
  adapter: rubydb
  embedded: false
  url: <%= ENV.fetch("RUBYDB_URL") %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", "5") %>
  timeout: <%= ENV.fetch("RUBYDB_TIMEOUT", "30") %>
```

The URL must use RubyDB's own scheme. Use `rubydbs://` with peer verification and a trusted CA, injected by a secret manager. Build it from your server's private hostname, port, configured username/password, required database-name component, and the CA file path on the Rails host; see the [URL walkthrough](../tutorials/rails-production-app.md#8-connect-rails-to-the-server). Size total connections across all web and worker processes. The server owns persistent storage; Rails never opens its data path.

Before release, test migrations and rollback, schema dump/load, joins, eager loading, callbacks, generated SQL, and a populated staging database against the exact versions. Continue with the [full Rails tutorial](../tutorials/rails-production-app.md), [configuration reference](../rails/database-yml.md), and [adapter source guide](https://github.com/aldanedev-create/rubydb/blob/main/adapters/activerecord/README.md).
