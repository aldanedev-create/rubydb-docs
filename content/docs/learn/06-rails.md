# 6. Use RubyDB with Rails

**Goal:** migrate a model and read it through ActiveRecord. The repository includes a runnable example under `examples/rails_app`.

## Add the gems

```ruby
# Gemfile
gem "rubydb", "~> 0.1.7"
gem "rubydb-activerecord", "~> 0.1.3"
```

```sh
bundle install
```

## Configure local development

```yaml
# config/database.yml
development:
  adapter: rubydb
  database: tmp/development.rdb
  embedded: true

test:
  adapter: rubydb
  database: tmp/test.rdb
  embedded: true
```

Each database path must have one owning process. If Rails web, console, and workers access data simultaneously, use server mode instead.

## Migrate and use a model

Create a model with your normal Rails workflow, then migrate and try it in the console:

```sh
bin/rails generate model Note body:text
bin/rails db:migrate
bin/rails console
```

```ruby
Note.create!(body: "My first RubyDB record")
Note.order(:id).pluck(:id, :body)
```

The exact generated migration, Rails version, and adapter behavior must fit the [tested ActiveRecord surface](../rails/active-record.md). Run your app's tests and migration rollback against the version you deploy. For the repository's ready-made example, follow [Rails quick start](../getting-started/rails.md).

**Next:** [server mode](07-server.md) and the [production Rails guide](../rails/production.md).

For the entire task app, including model, page, deployment configuration, backup, and release checks, follow [Build a Rails task app: local to production](../tutorials/rails-production-app.md).
