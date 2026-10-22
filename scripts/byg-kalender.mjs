import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendDates } from '../shared/calendar-core.js';
import { questionCategory } from '../shared/game-core.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const seed=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h|=0;h=h+0x6D2B79F5|0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};};
const shuffle=(a,rng)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const utcDate=d=>d.toISOString().slice(0,10), day=(s,n)=>{const d=new Date(`${s}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return utcDate(d);};
async function main(){const {QUESTIONS}=await import(path.join(ROOT,'data.js'));if(QUESTIONS.length<7)throw Error('Mindst 7 spørgsmål kræves for kalenderen');
const file=path.join(ROOT,'kalender.js');let calendar={};try{const src=await fs.readFile(file,'utf8'),m=src.match(/export const DAGLIG_KALENDER\s*=\s*(\{[\s\S]*\});?/);if(m)calendar=JSON.parse(m[1]);}catch{}
const today=utcDate(new Date()), existing=Object.keys(calendar).sort().at(-1), start=existing?day(existing,1):day(today,-1), finish=day(today,365);
const updated=appendDates(calendar,start,finish,(date,prior)=>{const rng=seed(`kampdag-${date}`),recent=Object.keys(prior).filter(d=>d<date).sort().slice(-39),blocked=new Set(recent.flatMap(d=>prior[d]||[])),pool=shuffle(QUESTIONS.filter(q=>!blocked.has(q.id)),rng),chosen=[],cats={},dk=shuffle(pool.filter(q=>q.fokus_dansk),rng);
for(const q of dk){const category=questionCategory(q);if(chosen.filter(x=>x.fokus_dansk).length>=2)break;if(chosen.every(x=>x.id!==q.id)&&((cats[category]||0)<2)){chosen.push(q);cats[category]=(cats[category]||0)+1;}}
for(const q of pool){const category=questionCategory(q);if(chosen.length===7)break;if(chosen.some(x=>x.id===q.id)||((cats[category]||0)>=2))continue;chosen.push(q);cats[category]=(cats[category]||0)+1;}
if(chosen.filter(q=>q.fokus_dansk).length<2)throw Error(`Mangler to unikke danske spørgsmål på ${date}; datagrundlaget kan ikke overholde 40-dagesreglen.`);if(chosen.length<7)throw Error(`Puljen kan ikke lave syv unikke spørgsmål med kategorigrænser ${date}`);return chosen.map(q=>q.id);});
calendar=updated;
await fs.writeFile(file,`// AUTOGENERERET; eksisterende offentliggjorte datoer bevares.\nexport const DAGLIG_KALENDER = ${JSON.stringify(calendar)};\n`);console.log(`Kalenderen dækker ${Object.keys(calendar).length} datoer til og med ${Object.keys(calendar).sort().at(-1)}.`);}
main().catch(e=>{console.error(e);process.exit(1)});
