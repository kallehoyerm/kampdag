import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=path.join(root,'data.js');const {QUESTIONS}=await import(`${file}?v=${Date.now()}`);
const questions=QUESTIONS.map(q=>{let id;if(q.trivia?.startsWith('Holdperioden er udledt')){const decade=Number(q.tekst.match(/i (\d{4})'erne/)?.[1]);const kind=q.tekst.includes('begyndte hos')?'start':'end';if(!decade)throw Error(`Mangler periode i spørgsmål ${q.tekst}`);id=`periode:${q.kilde_id}:${kind}:${decade}`;}else{const prefix={klub:'klub',landshold:'landshold',liga:'liga',land:'land'}[q.kategori];if(!prefix)throw Error(`Ukendt spørgsmålstype ${q.kategori}`);id=`${prefix}:${q.kilde_id}`;}return {...q,id};});
if(new Set(questions.map(q=>q.id)).size!==questions.length)throw Error('Spørgsmåls-id er ikke unikt');await fs.writeFile(file,`// AUTOGENERERET fra Wikidata; stabile nøgler bevarer kalenderdatoer ved dataudvidelser.\nexport const QUESTIONS = ${JSON.stringify(questions)};\n`);console.log(`Stabiliserede ${questions.length} spørgsmål-id'er.`);
