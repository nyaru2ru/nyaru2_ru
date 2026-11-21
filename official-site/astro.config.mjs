
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://nyaru2ru.github.io',
    base: '/nyaru2_ru',

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
