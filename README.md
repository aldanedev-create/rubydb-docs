# RubyDB Documentation Site

**Live site:** https://aldanedev-create.github.io/rubydb-docs/

Static HTML, CSS, and JavaScript documentation site for [RubyDB](https://github.com/aldanedev-create/rubydb). The source reference was RubyDB commit `cbd28f11c02e572cb7bde5f0d30eb391e24fc574`; the learning path in `content/docs/learn/` was added for this site.

## Edit and build

Edit Markdown under `content/`. Run `node build.mjs` to regenerate `dist/pages.json`. The renderer is vendored under `vendor/` with its license, so the build has no package installation step. Edit layout and interactions in `dist/index.html`, `dist/style.css`, and `dist/app.js`. Serve `dist/` with any static HTTP server to preview it.

The built site lives in `dist/`; commit both Markdown and generated JSON after content changes. The site uses hash routes so deep links work on static hosting without server rewrites.

When syncing updated files from upstream RubyDB, review examples and version references, then rebuild and check links. Production guidance describes validation required for a workload; it does not claim universal SQL compatibility.
