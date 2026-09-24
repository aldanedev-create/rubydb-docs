# Vue + RubyDB through Node

Vue renders notes in the browser. The [shared Node API](api.md) connects to RubyDB; the browser never receives a database URL.

## Local setup

Follow [Node setup](index.md), run `node init-db.mjs`, and start the [API server](api.md) on port 3001. Create a Vue app using Vue's current project generator, then add a Vite development proxy for `/api`:

```sh
npm create vue@latest
cd your-vue-project
npm install
```

`vite.config.js` (merge `server` with any generated Vue plugin config):

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { proxy: { "/api": "http://127.0.0.1:3001" } },
});
```

Replace `src/App.vue`:

```vue
<script setup>
import { onMounted, ref } from "vue";
const notes = ref([]);
const title = ref("");
const message = ref("");

async function load() {
  const response = await fetch("/api/notes");
  if (!response.ok) throw new Error("Could not load notes");
  notes.value = (await response.json()).notes;
}
async function add() {
  const value = title.value.trim();
  if (!value) return;
  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: value }),
    });
    if (!response.ok) throw new Error("Could not save note");
    title.value = "";
    await load();
    message.value = "";
  } catch (error) {
    message.value = error.message;
  }
}
onMounted(() => load().catch(error => { message.value = error.message; }));
</script>

<template>
  <main>
    <h1>Notes</h1>
    <p role="alert" v-if="message">{{ message }}</p>
    <form @submit.prevent="add">
      <label for="title">New note</label>
      <input id="title" v-model="title" maxlength="200" required />
      <button>Add note</button>
    </form>
    <ul><li v-for="note in notes" :key="note.id">{{ note.title }}</li></ul>
  </main>
</template>
```

Run `npm run dev`, open the Vite URL, add a note, and refresh. The proxy is for **development only**.

## Production

Run `npm run build` and serve the built Vue assets through HTTPS. Configure the reverse proxy to forward same-origin `/api/*` requests to the Node API. Run the API and RubyDB as separately supervised services; keep `RUBYDB_URL` only on Node, never in `VITE_*`. Add authentication and test writes, failures, backup/restore, and the proxy path. See the [API production steps](api.md#shared-node-notes-api) and [server deployment](../server/deployment.md).
