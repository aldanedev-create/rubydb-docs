# 5. Keep changes together

**Goal:** understand when several statements should succeed or fail together. Use `rubydb shell --database tmp/transactions.rdb`.

```sql
CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance INTEGER NOT NULL);
INSERT INTO accounts (id, balance) VALUES (1, 100);
INSERT INTO accounts (id, balance) VALUES (2, 20);
```

Move 30 units from account 1 to account 2:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 30 WHERE id = 1;
UPDATE accounts SET balance = balance + 30 WHERE id = 2;
COMMIT;
SELECT id, balance FROM accounts ORDER BY id;
```

Expect balances 70 and 50. If a statement fails **before** `COMMIT`, issue `ROLLBACK;` so the operation does not remain partly applied.

Try a rollback:

```sql
BEGIN;
UPDATE accounts SET balance = 0 WHERE id = 1;
ROLLBACK;
SELECT id, balance FROM accounts ORDER BY id;
```

The balance for account 1 remains 70. In a real transfer, check the debit succeeded and the balance cannot go negative before committing. Keep transactions short, and retry the whole business operation after a deadlock only when retrying is safe. RubyDB also supports savepoints; see [transaction reference](../sql/transactions.md).

**Next:** [use Rails](06-rails.md), or [connect multiple processes](07-server.md).
