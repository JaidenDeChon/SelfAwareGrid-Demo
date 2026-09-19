import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// The demo is published to https://jaidendechon.github.io/SelfAwareGrid-Demo/, so every asset URL needs the
// repository name as its base path. Dev and preview use the same base to keep the two environments honest.
export default defineConfig({
    base: '/SelfAwareGrid-Demo/',
    plugins: [vue(), tailwindcss()]
});
