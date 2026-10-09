import {defineConfig} from '@playwright/test';
const port=Number(process.env.TRINITY_DEV_PORT??5173);
export default defineConfig({testDir:'tests/browser',timeout:60000,workers:1,use:{channel:'msedge',headless:true,viewport:{width:1440,height:900},baseURL:`http://127.0.0.1:${port}`,screenshot:'only-on-failure',launchOptions:{args:['--enable-unsafe-webgpu']}},webServer:{command:`npm run dev -- --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:true,timeout:30000}});
