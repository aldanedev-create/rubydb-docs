import fs from 'node:fs';
import path from 'node:path';
import { marked } from './vendor/marked.esm.js';
const source = path.resolve('content');
const out = path.resolve('dist');
const docs = fs.readdirSync(path.join(source, 'docs'), { recursive: true }).filter(f => f.endsWith('.md')).sort();
const files = ['README.md', ...docs.map(f => `docs/${f}`)];
const titleOf = text => text.match(/^#\s+(.+)$/m)?.[1]?.replace(/[`*_]/g, '') || 'Untitled';
const entries = files.map(file => {
  const raw = fs.readFileSync(path.join(source, file), 'utf8');
  const route = file === 'README.md' ? 'overview' : file.slice(5, -3);
  return { file, route, title: titleOf(raw), raw };
});
const routeByFile = new Map(entries.map(e => [e.file, e.route]));
const renderer = new marked.Renderer();
renderer.link = function(token) {
  const href = token.href || '';
  let url = href;
  if (!/^(https?:|mailto:|#)/.test(href)) {
    const [relative, fragment] = href.split('#');
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(this.currentFile || ''), relative));
    url = routeByFile.has(target) ? `#/${routeByFile.get(target)}${fragment ? `?section=${encodeURIComponent(fragment)}` : ''}` : `https://github.com/aldanedev-create/rubydb/blob/main/${target}${fragment ? `#${fragment}` : ''}`;
  }
  const external = /^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${url.replaceAll('"', '&quot;')}"${external}>${this.parser.parseInline(token.tokens)}</a>`;
};
const pages = entries.map(e => {
  renderer.currentFile = e.file;
  const html = marked.parse(e.raw, { renderer, gfm: true });
  return { route: e.route, title: e.title, html, text: e.raw.replace(/[#*`_>|]/g, ' ').slice(0, 4500) };
});
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'pages.json'), JSON.stringify(pages));
console.log(`Generated ${pages.length} documentation pages`);
