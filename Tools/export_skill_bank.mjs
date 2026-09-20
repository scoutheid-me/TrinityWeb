import fs from 'node:fs';
import {arts} from '../src/data/arts.ts';
import {weapons} from '../src/data/weapons.ts';
fs.mkdirSync('public/data',{recursive:true});fs.writeFileSync('public/data/skill-bank.json',JSON.stringify({schemaVersion:1,location:'Guild Hall Training Room',town:'Town of Beginnings',timing:{perfectMs:55,goodMs:120,perfectMultiplier:1,goodMultiplier:.6,missMultiplier:0},notes:'Original Trinity balance. Damage is base damage before Strength; distances in meters. Arena boundaries can shorten travel.',weapons:Object.values(weapons),skills:Object.values(arts)},null,2)+'\n');

