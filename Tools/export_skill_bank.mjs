import fs from 'node:fs';
import {arts} from '../src/data/arts.ts';
import {skillBooks} from '../src/data/skillBooks.ts';
import {weapons} from '../src/data/weapons.ts';
fs.mkdirSync('public/data',{recursive:true});fs.writeFileSync('public/data/skill-bank.json',JSON.stringify({schemaVersion:2,location:'Training Room',town:'Town of Beginnings',timing:{perfectMs:55,goodMs:120,perfectMultiplier:1,goodMultiplier:.6,missMultiplier:0},notes:'Original Trinity balance. Node multiplier × equipped weapon base damage × Strength scaling gives Perfect damage; general forms trade lower coefficients for versatility; distances in meters. Arena boundaries can shorten travel.',weapons:Object.values(weapons),skillBooks,skills:Object.values(arts)},null,2)+'\n');

