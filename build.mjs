import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const content=fs.readFileSync('worker/content.js','utf8').replaceAll('export const ','const ');
fs.writeFileSync('dist/server/index.js',content+'\n'+fs.readFileSync('worker/index.js','utf8').replace("import {HTML,BANK} from './content.js';",''));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
