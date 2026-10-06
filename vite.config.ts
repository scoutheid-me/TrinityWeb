import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins:[{name:'trinity-version',generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify({revision:process.env.VITE_BUILD_REVISION??'local'})});}}],
  server: { port: 5173, strictPort: true },
  test: { include: ['tests/**/*.test.ts'] },
  build: { chunkSizeWarningLimit: 2500 },
});
