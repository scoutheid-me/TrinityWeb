import {defineConfig} from '@playwright/test';
const live=process.env.TRINITY_URL;
export default defineConfig({testDir:'tests/hosting',outputDir:'test-results/hosting',timeout:90000,workers:1,use:{channel:process.env.CI?undefined:'msedge',headless:true,viewport:{width:1440,height:900},baseURL:live??'http://127.0.0.1:4180/TrinityWeb/'},webServer:live?undefined:{command:'node node_modules/vite/bin/vite.js preview --outDir dist-pages --base=/TrinityWeb/ --host 127.0.0.1 --port 4180',url:'http://127.0.0.1:4180/TrinityWeb/',reuseExistingServer:true}});
