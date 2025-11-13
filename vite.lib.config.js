import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.js',
      name: 'cms-filter-custom',
      fileName: () => 'main.js',
      formats: ['umd'],
    },
    outDir: 'dist-umd',
    emptyOutDir: true,
    minify: true,
  },
})
