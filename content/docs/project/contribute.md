# Contribute to RubyDB

RubyDB welcomes small, reviewable changes backed by tests and documentation. The project prioritizes data correctness. Contributions can improve a guide, reproduce a bug, add a regression test, or build an integration.

## Find a place to start

1. Read the [contributing guide](https://github.com/aldanedev-create/rubydb/blob/main/CONTRIBUTING.md), [governance](https://github.com/aldanedev-create/rubydb/blob/main/GOVERNANCE.md), and [code of conduct](https://github.com/aldanedev-create/rubydb/blob/main/CODE_OF_CONDUCT.md).
2. Search [existing issues](https://github.com/aldanedev-create/rubydb/issues) before opening a new one. Use the repository's bug, performance, or feature template and provide a small reproduction when possible.
3. For a docs improvement, identify the page and the exact confusing example or missing step. For engine or adapter work, read the [architecture overview](../architecture/overview.md) and [testing guide](../contributing/testing.md).

## Set up a development checkout

```sh
git clone https://github.com/aldanedev-create/rubydb.git
cd rubydb
bundle install
bundle exec rspec
bundle exec rubocop
```

Use a temporary database for tests. Never commit database files, credentials, private keys, coverage output, or release artifacts. See [local development](../developer/local-development.md) for repository-specific details.

## Make a focused change

Start from the smallest example that demonstrates the behavior. Add a regression test for parser, execution, storage, transaction, protocol, adapter, or operational changes. Update the [compatibility contract](../sql/compatibility.md) if behavior changes. Test the affected workload, and include backup/restore or security checks when the change touches those paths.

Storage format, WAL, recovery, transaction isolation, replication, authentication, protocol framing, and release automation need explicit operational-impact review. A simulated fault test does not prove physical power-loss or multi-host safety.

## Open a pull request

Explain the invariant being changed, the failure it prevents, and any rollback or compatibility impact. Include the commands you ran and relevant results. Use the [pull request template](https://github.com/aldanedev-create/rubydb/blob/main/.github/PULL_REQUEST_TEMPLATE.md).

For a security vulnerability, follow [private reporting instructions](https://github.com/aldanedev-create/rubydb/blob/main/SECURITY.md). Do not post an unpatched vulnerability or secrets in a public issue.

## Improve this documentation site

The docs site source lives in the separate [RubyDB docs repository](https://github.com/aldanedev-create/rubydb-docs). Edit Markdown under `content/`, run `node build.mjs` to regenerate `dist/pages.json`, and preview `dist/` with a static HTTP server. Include the updated Markdown and generated JSON in your pull request.
