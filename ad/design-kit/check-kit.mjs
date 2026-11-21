import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const files=[];function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())walk(p);else if(p.endsWith('.md'))files.push(p);}}walk(root);
const failures=[];
for(const file of files){const content=readFileSync(file,'utf8');for(const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const target=match[1].split('#')[0];if(!target||/^(https?:|mailto:)/.test(target))continue;if(!existsSync(resolve(dirname(file),target)))failures.push('Broken link: '+file+' -> '+target);}}
const css=readFileSync(join(root,'tokens/tokens.css'),'utf8');const tokens=Object.fromEntries([...css.matchAll(/(--ac-[\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]]));
const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05);};
for(const [a,b,min] of [['--ac-ink','--ac-surface',4.5],['--ac-muted','--ac-bg',4.5],['--ac-text-subtle','--ac-surface',4.5],['--ac-on-primary','--ac-primary',4.5],['--ac-primary','--ac-primary-soft',4.5],['--ac-attention','--ac-attention-soft',4.5],['--ac-danger','--ac-danger-soft',4.5],['--ac-success','--ac-success-soft',4.5],['--ac-control-border','--ac-surface',3]]){const ratio=contrast(tokens[a],tokens[b]);console.log(a+' on '+b+': '+ratio.toFixed(2)+':1');if(ratio<min)failures.push('Insufficient contrast '+a+' / '+b);}
console.log('Checked '+files.length+' Markdown documents.');if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('Links and declared contrast pairs pass. Rendered accessibility still needs review.');
