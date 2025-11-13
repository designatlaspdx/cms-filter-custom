import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: 'localhost',
    port: 3000,
    cors: true,
  },
    build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
  },
//   build: {
//     outDir: 'dist',
//     emptyOutDir: true,
//     minify: true,
//     rollupOptions: {
//       // Normal HTML build entry
//       input: './index.html',
//       // Extra output for a drop-in UMD version
//       output: [
//         // default output for HTML build
//         {
//           dir: 'dist',
//           entryFileNames: 'assets/[name]-[hash].js',
//           format: 'es',
//         },
//         // second output: standalone UMD bundle
//         {
//           file: 'dist/main.js',
//           format: 'umd',
//           name: 'FluidDisrupt', // global name when loaded via <script>
//           entryFileNames: 'main.js',
//           esModule: false,
//           compact: true,
//         },
//       ],
//     },
//   },
})
