# Python DB-API client

`rubydb-python` connects Python applications to a RubyDB **server**. It does not open embedded `.rdb` files.

## Connect and query

```sh
python -m pip install rubydb-python
```

```python
import os
import rubydb

with rubydb.connect(os.environ["RUBYDB_URL"]) as db:
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id, name FROM users WHERE active = ? ORDER BY id",
            [True],
        )
        for row in cursor.fetchall():
            print(row)
```

The `?` placeholder binds a value separately from SQL. The client supports transactions, prepared statements when advertised by the server, timeouts, cancellation, and a bounded connection pool. See the [Python adapter source guide](https://github.com/aldanedev-create/rubydb/blob/main/adapters/python/README.md) for those examples.

## Local server option

The optional `rubydb-python[local]==0.1.1` package requires the matching platform runtime wheel **after both are published**. It can start a bundled local server; the ordinary Python client still connects to a separately managed server. Follow the [local-runtime lesson](https://github.com/aldanedev-create/rubydb/blob/main/lessons/13-python-local-runtime.md) before choosing this path.

For production use `rubydbs://`, verified TLS, a private network, a secret manager, and a pool limit that fits the RubyDB server. Test against a real server, not just protocol fixtures.
