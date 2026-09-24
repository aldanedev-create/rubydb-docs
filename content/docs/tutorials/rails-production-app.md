# Build a Rails task app: local to production

This tutorial builds a small Rails task app with RubyDB. You will make a local embedded database, add a model and page, test real reads and writes, then move the **application** to a separately managed RubyDB server. The [repository's runnable Rails example](https://github.com/aldanedev-create/rubydb/tree/main/examples/rails_app) uses the same model and controller shape.

**Level:** beginner to intermediate · **Target:** Ruby 3.3+, Rails 7.2, RubyDB 0.1.7, `rubydb-activerecord` 0.1.3. Pin and test the exact versions you install. RubyDB is alpha, so the production section is a release procedure to validate, not a guarantee that every workload is safe.

## 1. Create the Rails project

Install Rails 7.2, then generate a conventional app. Rails may generate SQLite configuration by default; replace it in the next steps.

```sh
gem install rails -v '~> 7.2.0'
rails new taskboard -d sqlite3
cd taskboard
```

In `Gemfile`, remove the `sqlite3` gem and add:

```ruby
gem "rubydb", "~> 0.1.7"
gem "rubydb-activerecord", "~> 0.1.3"
```

```sh
bundle install
```

The adapter registers under `rubydb` when Bundler loads it. You do not need Go installed: the RubyDB gem includes its optional accelerator binaries.

## 2. Configure local development

Replace `config/database.yml` with separate paths for development and test:

```yaml
development:
  adapter: rubydb
  embedded: true
  database: <%= Rails.root.join("tmp/taskboard_development.rdb") %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", "5") %>

test:
  adapter: rubydb
  embedded: true
  database: <%= Rails.root.join("tmp/taskboard_test.rdb") %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", "5") %>

production:
  adapter: rubydb
  embedded: false
  url: <%= ENV.fetch("RUBYDB_URL") %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", "5") %>
  timeout: <%= ENV.fetch("RUBYDB_TIMEOUT", "30") %>
```

Keep `tmp/` out of Git. An embedded path has **one process owner**. Close a Rails console before starting another process against the same path; multiple web or job workers need server mode. The production block deliberately uses a different connection topology.

## 3. Add the task table

```sh
bin/rails generate model Task title:string completed:boolean
```

Edit the generated migration so its `change` method has the following body. Keep your generated timestamp and Rails migration class name:

```ruby
def change
  create_table :tasks do |t|
    t.string :title, null: false
    t.boolean :completed, null: false, default: false
    t.timestamps
  end

  add_index :tasks, :completed
end
```

```sh
bin/rails db:migrate
```

The title is required by the database and `completed` defaults to false. Inspect the generated `db/schema.rb`; it should agree with the migration. If it does not, investigate and test a fresh schema load before releasing. The upstream example's checked-in schema and migration currently differ on the completed default, which is exactly the kind of mismatch this check should catch.

## 4. Add model, routes, controller, and page

`app/models/task.rb`:

```ruby
class Task < ApplicationRecord
  validates :title, presence: true
  scope :open, -> { where(completed: false) }
end
```

`config/routes.rb`:

```ruby
Rails.application.routes.draw do
  root "tasks#index"
  resources :tasks, only: %i[index create update]
end
```

`app/controllers/tasks_controller.rb`:

```ruby
class TasksController < ApplicationController
  def index
    @tasks = Task.order(created_at: :desc)
    @task = Task.new
  end

  def create
    @task = Task.new(task_params)
    if @task.save
      redirect_to root_path, notice: "Task created"
    else
      @tasks = Task.order(created_at: :desc)
      render :index, status: :unprocessable_entity
    end
  end

  def update
    task = Task.find(params[:id])
    task.update!(completed: true)
    redirect_to root_path, notice: "Task completed"
  end

  private

  def task_params
    params.require(:task).permit(:title)
  end
end
```

`app/views/tasks/index.html.erb`:

```erb
<h1>Tasks</h1>
<p><%= notice %></p>

<% if @task.errors.any? %>
  <div role="alert"><%= @task.errors.full_messages.to_sentence %></div>
<% end %>

<%= form_with model: @task, local: true do |form| %>
  <%= form.label :title, "New task" %>
  <%= form.text_field :title, required: true %>
  <%= form.submit "Add task" %>
<% end %>

<ul>
  <% @tasks.each do |task| %>
    <li>
      <%= task.title %> — <%= task.completed? ? "Done" : "Open" %>
      <% unless task.completed? %>
        <%= button_to "Complete", task_path(task), method: :patch %>
      <% end %>
    </li>
  <% end %>
</ul>
```

Rails escapes task titles in ERB by default. Strong parameters limit the posted fields; the browser cannot set `completed` through the create action.

## 5. Run and test locally

```sh
bin/rails server
```

Open `http://127.0.0.1:3000`, add a task, refresh, and mark it complete. A refresh should preserve both the task and its state.

In a **separate run while the server is stopped**, smoke-test the model through Rails:

```sh
bin/rails runner 't = Task.create!(title: "Smoke test"); raise "read failed" unless Task.find(t.id).title == "Smoke test"; t.update!(completed: true); raise "write failed" unless Task.find(t.id).completed?; puts "RubyDB smoke test passed"'
```

Add request/model tests for empty titles, valid creates, updates, and the order of listed tasks. Run `bin/rails test`, then run the RubyDB adapter suite and representative Rails operations on your pinned versions. Test a fresh database separately from one populated by earlier migrations.

## 6. Understand the production change

Local development is one Rails process opening `tmp/taskboard_development.rdb`. In production, several Rails processes connect over verified TLS to **one RubyDB server**, which owns its data directory:

![Several Rails processes connect through a private TLS network to one RubyDB server and its persistent database path.](assets/rubydb-server.svg)

Do not copy the local `.rdb` file into a live server directory. Deploy the same migrations to create the production schema and import any needed data through a validated export/import workflow. A local practice database does not need to become production data.

The upstream `examples/rails_app` is a **development example**: its production block is still embedded and its application config includes a hard-coded development secret and development-friendly error behavior. Do not deploy those settings. A newly generated Rails app provides normal environment-specific configuration; keep secrets in Rails credentials or your deployment secret manager, and review its production environment settings. Rails recommends leaving `config.secret_key_base` unset in code and supplying it through credentials.

## 7. Prepare a RubyDB server

Provision a dedicated service account, a private network, a persistent data volume, protected TLS keys, and an off-host backup destination. Pin the same RubyDB version you validated. Start from the repository's [production config template](https://github.com/aldanedev-create/rubydb/blob/main/config/production.yml); set `RUBYDB_USERNAME`, `RUBYDB_PASSWORD`, TLS certificate/key/CA paths, data and log paths, and connection/resource limits through protected configuration.

```sh
gem install rubydb -v 0.1.7
rubydb --config /etc/rubydb/production.yml --env production start
rubydb --config /etc/rubydb/production.yml --env production status --json
rubydb --config /etc/rubydb/production.yml --env production doctor --json
```

Run the service under systemd or another supervisor, not a transient shell. Bind only to a private network and require authentication and verified TLS. Test from the application network. See the [production operations guide](../operations/production-guide.md) for permissions, supervision, and monitoring.

## 8. Connect Rails to the server

**Where does the URL come from?** In this self-hosted example, you assemble it from the server you deployed in step 7. RubyDB does not generate the example URL for you. Your infrastructure/DNS setup supplies the private hostname, the RubyDB server configuration supplies the port and username, your secret manager supplies the password, and your certificate authority supplies a CA certificate that the **Rails machine** can read.

```text
rubydbs://app_rw:URL_ENCODED_PASSWORD@db.internal.example:7432/app?verify_peer=true&ca_file=%2Fetc%2Frubydb%2Ftls%2Fca.crt
```

| URL part | Where you get it |
| --- | --- |
| `rubydbs://` | RubyDB's TLS-enabled client scheme |
| `app_rw` | The username set as `RUBYDB_USERNAME` in the server's protected configuration |
| `URL_ENCODED_PASSWORD` | The matching `RUBYDB_PASSWORD` from your secret manager, percent-encoded for a URL |
| `db.internal.example` | A private DNS name or host for **your** RubyDB server, also present in its TLS certificate; this sample name is not a real service |
| `7432` | The server's listening port, from `RUBYDB_PORT` |
| `/app` | The required database-name component of a RubyDB client URL; it is **not** a filesystem path |
| `verify_peer=true` | Require certificate validation instead of accepting an unverified peer |
| `ca_file=%2Fetc%2Frubydb%2Ftls%2Fca.crt` | URL-encoded absolute path to the trusted CA file **on the Rails host** (`/etc/rubydb/tls/ca.crt`) |

For practice, a password like `demo@pass:word` becomes `demo%40pass%3Aword`. Ruby can encode a **non-secret example** with `URI.encode_www_form_component("demo@pass:word")`. Do not print your real URL or place a real password in a shell command, repository, log, screenshot, or support ticket.

The server's `storage.data_dir` controls where RubyDB actually stores data. The current server implementation opens `rubydb.rdb` inside that directory; changing the URL's `/app` segment does **not** choose a different `.rdb` file. The URL parser requires a database name, while the current server tracks that name as part of the session.

Inject the assembled `RUBYDB_URL` into the Rails process from a secret manager. The URL is RubyDB-specific, not PostgreSQL's `DATABASE_URL`. Keep the hostname in the server certificate, verify the CA and peer, and never commit or print the URL. The `production` block from step 2 reads it automatically.

**Pool sizing example:** 2 web processes × pool 5 + 1 worker process × pool 5 = up to 15 Rails connections. Leave additional capacity for migrations, administration, and monitoring within the server limit. Count actual concurrency in your deployment.

## 9. Rehearse a release on restored staging data

Before changing live data:

1. Restore a verified backup to a separate staging directory.
2. Run `RAILS_ENV=production bin/rails db:migrate` against **staging's** server URL.
3. Run `RAILS_ENV=production bin/rails db:schema:dump`, inspect defaults and indexes, then test schema load on another disposable database.
4. Run `RAILS_ENV=production bin/rails runner 'puts Task.limit(1).pluck(:id).inspect'` plus create/update/read tests through the network path.
5. Run realistic concurrent requests, a restart, backup/restore, and the rollback path.

Do not use a live production URL for a staging rehearsal. A migration can change existing data; rehearse it on representative populated data and keep an intact pre-migration backup.

## 10. Release, observe, and recover

Take and verify a backup immediately before the production migration. Stop writes or take the documented migration lock. Run migrations from one deployment job, then start the web and worker processes and perform the authenticated read/write smoke test.

```sh
rubydb backup --dir /var/lib/rubydb/backups
rubydb restore --latest --dry-run --dir /var/lib/rubydb/backups
RAILS_ENV=production bin/rails db:migrate
RAILS_ENV=production bin/rails runner 'puts ActiveRecord::Base.connection.select_value("SELECT 1")'
```

These are separate environment-specific commands: the backup runs with the server's protected backup configuration, while Rails runs with the injected production URL. A dry-run restore is not a substitute for a scheduled **real restore drill** to an isolated destination.

Monitor readiness, request errors and latency, connection pool waits, WAL/checkpoint health, disk space, and backup verification. Define an acceptable data-loss window and recovery time, then measure both. If a release fails, stop writes, follow the [production runbook](../operations/production-runbook.md), restore or roll back using the **tested** procedure, and preserve the failed data directory for investigation. A code rollback alone may not undo a schema migration.

## What to learn next

- [ActiveRecord adapter](../adapters/rails.md) and [supported SQL](../sql/compatibility.md)
- [Rails production guidance](../rails/production.md) and [migration guide](../rails/migrations.md)
- [Backups](../operations/backups.md), [restore](../operations/restore.md), and [disaster recovery](../operations/disaster-recovery.md)
- [Runnable source example](https://github.com/aldanedev-create/rubydb/tree/main/examples/rails_app)
