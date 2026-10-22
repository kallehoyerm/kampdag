global.window = {};
require('./data.js');
const questions = window.SPOERGSMAAL;
const normalize = value => String(value).toLocaleLowerCase('da-DK').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'a').replace(/[^a-z0-9]/g,'');
let errors = 0;
if (questions.length !== 40) { console.error(`Forventede 40 spørgsmål; fandt ${questions.length}.`); errors++; }
for (const q of questions) {
  if (!Array.isArray(q.answers) || q.answers.length < 25 || q.answers.length > 50) { console.error(`${q.id}: forventede 25–50 svar.`); errors++; continue; }
  const seen = new Map();
  for (const answer of q.answers) {
    if (!answer.navn || !Array.isArray(answer.aliaser) || !Number.isInteger(answer.grad) || answer.grad < 1 || answer.grad > 5) { console.error(`${q.id}: ugyldigt/manglende svar, aliasliste eller grad: ${answer.navn}`); errors++; continue; }
    for (const value of [answer.navn,...answer.aliaser]) {
      const key=normalize(value), previous=seen.get(key);
      if (!key || (previous && previous!==answer.navn)) { console.error(`${q.id}: alias-/navnekonflikt '${value}' (${previous} / ${answer.navn}).`); errors++; }
      seen.set(key,answer.navn);
    }
  }
}
if (errors) process.exitCode=1; else console.log(`Data OK: ${questions.length} spørgsmål, ${questions.reduce((n,q)=>n+q.answers.length,0)} svarregistreringer.`);
