const assert = require('node:assert/strict');
global.window = { SPOERGSMAAL: [] };
const {normalizeAnswer, matchAnswer, pointsFor, dailyQuestions, copenhagenDate} = require('./game.js');
require('./data.js');
const data = window.SPOERGSMAAL;
const names = data[0].answers;
assert.equal(normalizeAnswer('  ÆØÅ!  '), 'aeoa');
assert.equal(matchAnswer('Messi', data.find(q=>q.tekst.includes('La Liga')).answers)?.navn, 'Lionel Messi');
assert.equal(matchAnswer('Lionel Mesi', data.find(q=>q.tekst.includes('La Liga')).answers)?.navn, 'Lionel Messi');
assert.equal(matchAnswer('ukendt spiller', names), null);
assert.equal(pointsFor({grad:1}), 10);
assert.equal(pointsFor({grad:5}), 100);
assert.equal(pointsFor(null), 0);
assert.deepEqual(dailyQuestions('2026-10-22',data).map(q=>q.id), dailyQuestions('2026-10-22',data).map(q=>q.id));
assert.equal(dailyQuestions('2026-10-22',data).length,7);
const todaySet=dailyQuestions('2026-10-22',data).map(q=>q.id).sort().join(',');
for(let ago=1;ago<=30;ago++){
  const d=new Date('2026-10-22T12:00:00Z');d.setUTCDate(d.getUTCDate()-ago);
  const day=d.toISOString().slice(0,10), prior=dailyQuestions(day,data).map(q=>q.id).sort().join(',');
  assert.notEqual(todaySet,prior,`Spørgsmålsættet blev gentaget ${day}`);
}
assert.notEqual(copenhagenDate(new Date('2026-10-22T21:30:00Z')), copenhagenDate(new Date('2026-10-22T22:30:00Z')));
console.log('Alle spiltests bestået.');
