import { defineConfig } from 'astro/config';

export default defineConfig({
    output: 'static',

    devToolbar: {
        enabled: false
    },

    vite: {
        build: {
            sourcemap: false
        },

        css: {
            devSourcemap: false
        }
    }
});
