import { QUESTIONS } from './data.js';
import { validateQuestions } from './shared/data-validation.js';
const errors=validateQuestions(QUESTIONS);if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`Data OK: ${QUESTIONS.length} spørgsmål, ${QUESTIONS.reduce((n,q)=>n+q.answers.length,0)} svarregistreringer.`);
