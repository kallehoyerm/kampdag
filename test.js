import assert from 'node:assert/strict';
import {POINTS,matchAnswer,scoreAnswers,totalScore,localDate,countdown,calendarQuestions,fallbackQuestions,questionCategory} from './shared/game-core.js';
import {appendDates} from './shared/calendar-core.js';
import {validateQuestions} from './shared/data-validation.js';
import {QUESTIONS} from './data.js';
import worker from './worker/index.js';
process.env.TZ='Europe/Copenhagen';
assert.equal(matchAnswer('N Golo Kante',[{navn:'N’Golo Kanté',aliaser:['Kante'],grad:4}]).grad,4);
const invalid=structuredClone(QUESTIONS[0]);delete invalid.answers[0].kilde_id;assert.ok(validateQuestions([invalid]).some(e=>e.includes('mangler kilde_id')));
const sample=QUESTIONS[0],qs=Array(7).fill(sample),raw=Array(7).fill(sample.answers[0].navn),client=scoreAnswers(qs,raw);assert.equal(totalScore(client),7*POINTS[sample.answers[0].grad]);
const actual=QUESTIONS.slice(0,7),cal={'2026-10-22':actual.map(q=>q.id)};assert.deepEqual(calendarQuestions('2026-10-22',actual,cal).map(q=>q.id),actual.map(q=>q.id));
assert.deepEqual(fallbackQuestions('2026-10-23',QUESTIONS).map(q=>q.id),fallbackQuestions('2026-10-23',QUESTIONS).map(q=>q.id));
const calendarData=(await import('./kalender.js')).DAGLIG_KALENDER,dates=Object.keys(calendarData).sort();for(let i=0;i<dates.length;i++){const qsToday=calendarData[dates[i]].map(id=>QUESTIONS.find(q=>q.id===id));assert.equal(qsToday.length,7);assert.ok(qsToday.filter(q=>q.fokus_dansk).length>=2,`to danske spørgsmål ${dates[i]}`);assert.ok(Object.values(qsToday.reduce((c,q)=>(c[questionCategory(q)]=(c[questionCategory(q)]||0)+1,c),{})).every(n=>n<=2),`maks 2 pr kategori ${dates[i]}`);const previous=new Set(dates.slice(Math.max(0,i-39),i).flatMap(d=>calendarData[d]));assert.ok(qsToday.every(q=>!previous.has(q.id)),`ingen gentagelse på 40 dage ${dates[i]}`);}
assert.equal(localDate(new Date('2026-10-25T00:30:00+02:00')),'2026-10-25');
assert.equal(countdown(new Date(2026,9,25,0,0,0)),25*60*60);
const old={...cal},added=appendDates(old,'2026-10-23','2026-10-24',d=>[d]);assert.deepEqual(added['2026-10-22'],cal['2026-10-22']);assert.deepEqual(old,cal);assert.deepEqual(added['2026-10-23'],['2026-10-23']);
// Worker and browser share the exact scorer, and reject stale/future dates and duplicate inserts.
const calls=[];let resultChanges=1;const db={prepare(sql){return {bind(...args){calls.push({sql,args});return {run:async()=>({meta:{changes:sql.includes('INSERT OR IGNORE INTO results')?resultChanges:1}}),all:async()=>({results:[{count:1}]})};}};}};
const env={DB:db};const goodDate=new Date().toISOString().slice(0,10),uuid='123e4567-e89b-12d3-a456-426614174000';
const req=(path,method,body)=>new Request(`https://x${path}`,{method,headers:{origin:'https://kallehoyerm.github.io','content-type':'application/json'},body:body?JSON.stringify(body):undefined});
// Use a request date present in the generated calendar, which covers today through one year.
const today=goodDate,ids=calendarData[today],serverQs=ids?.map(id=>QUESTIONS.find(q=>q.id===id)),answers=serverQs?.map(q=>q.answers[0].navn)||raw,expected=totalScore(scoreAnswers(serverQs,answers));
let response=await worker.fetch(req('/api/resultat','POST',{dato:today,klient:uuid,svar:answers}),env);assert.equal(response.status,201);assert.equal((await response.json()).total,expected);
resultChanges=0;response=await worker.fetch(req('/api/resultat','POST',{dato:today,klient:uuid,svar:answers}),env);assert.equal(response.status,409);
response=await worker.fetch(req('/api/resultat','POST',{dato:'1900-01-01',klient:uuid,svar:answers}),env);assert.equal(response.status,400);
console.log('Alle kerne- og backendtests bestået.');
