import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// The site is published at https://jaidendechon.github.io/SelfAwareGrid-Demo/, so every asset URL needs the
// repository name as its base path. Pull-request previews sit one level deeper, under /pr-preview/pr-<number>/,
// and the preview workflow passes that path in through BASE_PATH.
const base = process.env.BASE_PATH || '/SelfAwareGrid-Demo/';

export default defineConfig({
    base,
    plugins: [vue(), tailwindcss()]
});
