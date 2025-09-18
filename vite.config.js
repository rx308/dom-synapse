import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {

    if (mode === 'all') {

        return {

            build: {
                outDir: 'dist',
                lib: {
                    entry: resolve(__dirname, 'src/index.js'),
                    name: 'DomSynapse',
                    formats: ['es', 'umd'],
                    fileName: (format) => {
                        if (format === 'es') return 'dom-synapse.all.js';
                        if (format === 'umd') return 'dom-synapse.all.umd.js';
                    }
                },
                rollupOptions: {
                    external: [],
                    output: {
                        exports: 'named',
                    }
                }
            },
            resolve: {
                dedupe: ['swiper']
            },

            server: {
                open: '/demo/',
                port: 5173
            },
        
            preview: {
                port: 4173
            },
        
            esbuild: {
                target: 'es2022'
            }

        }

    }

    if (mode === 'core') {

        return {

            build: {
                outDir: 'dist',
                emptyOutDir: true,
                lib: {
                    entry: resolve(__dirname, 'src/dom-synapse.js'),
                    name: 'DomSynapse',
                    formats: ['es', 'umd'],
                    fileName: (format) => `dom-synapse.${format}.js`
                },
                rollupOptions: {
                    output: {
                        exports: 'named'
                    }
                },
                minify:true
            }

        }

    }

    return {

        server: {
            open: '/demo/',
            port: 5173
        },
        
        preview: {
            port: 4173
        },
        
        esbuild: {
            target: 'es2022'
        }

    }
});