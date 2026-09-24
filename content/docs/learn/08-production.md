# 8. Prepare for production

RubyDB is currently alpha. A production deployment is a **validated workload**, not a universal compatibility claim. PostgreSQL remains the safer default for large shared applications or workloads that need mature managed database services.

## 1. Freeze the exact build

Pin Ruby, RubyDB, the adapter, and the app dependencies. Run the application test suite and migration up/down path against that combination. Replay representative queries, including error cases and bound parameters, and compare expected row results.

## 2. Choose the topology

Use embedded mode only if one process owns the path and that availability model is acceptable. Use a supervised server on durable private storage for multiple application processes. Configure a private network, authenticated clients, verified TLS, bounded frames and connections, deadlines, and a secret manager. The [production operations guide](../operations/production-guide.md) has the deployment sequence.

![A production RubyDB server writes to persistent storage and sends verified backups to a separate destination; monitoring checks the service.](assets/rubydb-production.svg)

## Example: a Rails service with a RubyDB server

This is a reference layout for a small independently owned service. Replace paths and hostnames with your own private infrastructure and review the full [server configuration](../server/configuration.md).

1. Give the RubyDB service account a persistent data directory and a separate log directory. Keep its TLS private key and database credentials in your secret store.
2. Start one supervised server using the reviewed production configuration:

```sh
rubydb --config /etc/rubydb/production.yml --env production start
```

3. Configure Rails to use the network path. The connection URL comes from the secret manager:

```yaml
# config/database.yml
production:
  adapter: rubydb
  embedded: false
  url: <%= ENV.fetch("RUBYDB_URL") %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", "5") %>
```

Use a `rubydbs://` URL with peer verification and a trusted CA. Calculate total connections across **all** web and worker processes, then keep the number below the server limit with spare capacity for administration. The full options are in [Rails database configuration](../rails/database-yml.md).

4. From the application network, check service health and a real authenticated query:

```sh
rubydb --config /etc/rubydb/production.yml --env production status --json
rubydb --config /etc/rubydb/production.yml --env production doctor --json
```

```ruby
require "rubydb"
client = RubyDB::Client::Client.new(url: ENV.fetch("RUBYDB_URL"))
begin
  p client.query("SELECT 1")
ensure
  client.disconnect
end
```

Run migrations only after a verified backup. Smoke-test a create/read/update/delete transaction through the same network path the app uses. Keep a tested rollback plan; an old app version may not understand a new schema.

## 3. Prove backup and recovery

```sh
rubydb backup --dir /var/lib/rubydb/backups
rubydb restore --latest --dry-run --dir /var/lib/rubydb/backups
```

Schedule a real [restore drill](../operations/restore.md) to a new isolated directory and verify the schema and important row counts. Keep the backup and manifest off the database host. A replica is not a backup.

Write down the recovery point objective (acceptable data loss) and recovery time objective (acceptable outage). Time the restore on representative data; do not infer either target from a successful backup command.

## 4. Test failure, not just success

Run concurrency and load tests at expected and peak traffic. Exercise process restart, disk pressure, interrupted writes, connection exhaustion, and network loss. Record how long restore and failover take and what data loss is acceptable. Follow [monitoring](../operations/monitoring.md), [workload testing](../operations/workload-testing.md), and [disaster recovery](../operations/disaster-recovery.md).

## Release gate

| Check | Evidence to collect |
| --- | --- |
| Schema and query compatibility | Passing application and migration tests |
| Security | TLS verification, auth, permissions, private network |
| Performance | Representative workload results and resource headroom |
| Recoverability | Verified backup and timed isolated restore |
| Operations | Alerts, owner, runbook, rollback and incident drill |

Deploy only when your team accepts these results for this application. Keep a rollback path and test upgrades on restored staging data. Continue with the [production runbook](../operations/production-runbook.md) and [production readiness guide](../production-readiness.md).
