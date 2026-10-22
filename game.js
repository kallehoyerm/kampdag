/* Alle synlige danske tekster samles her, så de er lette at rette. */
const TEKSTER = {
  rarity: {1:"Alle ved det",2:"Kendt",3:"Sjælden",4:"Meget sjælden",5:"Én ud af en million"},
  points: {1:10,2:30,3:60,4:85,5:100},
  ranks: [[100,"Tilskuer"],[220,"Bænkvarmer"],[350,"Divisionsspiller"],[480,"Superligaspiller"],[600,"Landsholdsspiller"],[701,"Legende"]],
  unknown:"Det svar kender vi ikke. Prøv et andet.", timeout:"Tiden er gået.",
  sharePrefix:"Kampdag", noAnswer:"Intet svar",
  triviaFallback:"Fodboldhistorien er fuld af overraskelser. Hvilket svar var dit?"
};

const STORAGE_KEY = "kampdag-v1";
const ROUND_SECONDS = 25;
const DAY_MS = 86400000;
const POINTS = TEKSTER.points;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function normalizeAnswer(value) {
  return String(value ?? "").toLocaleLowerCase("da-DK").trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g,"ae").replace(/ø/g,"o").replace(/å/g,"a")
    .replace(/[^a-z0-9]/g, "");
}
function levenshtein(a,b) {
  const prev = Array.from({length:b.length+1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    let diagonal=prev[0]; prev[0]=i;
    for (let j=1;j<=b.length;j++) { const old=prev[j]; prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diagonal+(a[i-1]===b[j-1]?0:1)); diagonal=old; }
  }
  return prev[b.length];
}
function fuzzyLimit(s) { return s.length>=9?2:s.length>=5?1:0; }
function matchAnswer(raw, answers) {
  const input=normalizeAnswer(raw); if(!input) return null;
  const candidates=[];
  for(const answer of answers) for(const value of [answer.navn,...(answer.aliaser||[])]) {
    const key=normalizeAnswer(value); if(!key) continue;
    if(key===input) candidates.push(answer);
    else if(key.length>=5 && input.length>=5 && levenshtein(input,key)<=fuzzyLimit(input)) candidates.push(answer);
  }
  if(!input.includes(" ")) for(const answer of answers) {
    const surname=normalizeAnswer(answer.navn.split(/\s+/).at(-1));
    if(surname===input)candidates.push(answer);
  }
  const unique=[...new Set(candidates)];
  return unique.length===1?unique[0]:null;
}
function pointsFor(answer) { return answer && POINTS[answer.grad] || 0; }
function mulberry32(seed) { return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
function hashString(s) { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function dailyQuestions(date, all=window.SPOERGSMAAL) {
  const make=(day,salt)=>{const rand=mulberry32(hashString(`${day}:${salt}`));const arr=[...all];for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr.slice(0,7);};
  const prior=new Set();
  for(let back=1;back<=30;back++)prior.add(make(shiftDate(date,-back),0).map(q=>q.id).sort((a,b)=>a-b).join(","));
  for(let salt=0;salt<100; salt++){const selected=make(date,salt),key=selected.map(q=>q.id).sort((a,b)=>a-b).join(",");if(!prior.has(key))return selected;}
  return make(date,101);
}
function shiftDate(date,days){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function copenhagenDate(now=new Date()) {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Copenhagen",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value])); return `${p.year}-${p.month}-${p.day}`;
}
function dayOrdinal(date) { return Math.floor(Date.parse(`${date}T12:00:00Z`)/DAY_MS); }
function rankFor(score) { return TEKSTER.ranks.find(([min])=>score<min)?.[1]||"Legende"; }

if (typeof module !== "undefined" && module.exports) module.exports={normalizeAnswer,levenshtein,fuzzyLimit,matchAnswer,pointsFor,mulberry32,hashString,dailyQuestions,copenhagenDate,rankFor,dayOrdinal};

if (typeof document !== "undefined") (()=>{
  const $=id=>document.getElementById(id), screens=["start-screen","question-screen","reveal-screen","result-screen","how-screen"].map($);
  let date=copenhagenDate(), questions=dailyQuestions(date), timerHandle=null, state=loadState();
  function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{games:{},streak:0,lastPlayed:null,history:[]};}catch{return {games:{},streak:0,lastPlayed:null,history:[]};}}
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}}
  function show(id){screens.forEach(s=>{s.classList.toggle("active",s.id===id);s.hidden=s.id!==id;});}
  function refreshDay(){const next=copenhagenDate();if(next!==date){date=next;questions=dailyQuestions(date);state=loadState();show("start-screen");paintHome();}}
  function paintHome(){ $("today-label").textContent=new Intl.DateTimeFormat("da-DK",{timeZone:"Europe/Copenhagen",weekday:"long",day:"numeric",month:"long"}).format(new Date()).toLocaleUpperCase("da-DK"); $("streak").textContent=state.streak||0; $("last-score").textContent=state.history?.[0]?`${state.history[0].score}/700`:"—"; const game=state.games[date]; $("played-note").textContent=game?.done?"Du har spillet i dag. Kom igen i morgen!":""; $("start-button").disabled=!!game?.done; $("start-button").textContent=game?.done?"Dagens quiz er spillet":"Spil dagens quiz →"; }
  function begin(){let game=state.games[date];if(game?.done){showResult(game);return;}if(!game){game={date,questions:questions.map(q=>q.id),index:0,score:0,results:[],roundStartedAt:Date.now(),done:false};state.games[date]=game;save();}showQuestion();}
  function currentGame(){return state.games[date];}
  function showQuestion(){clearInterval(timerHandle);const g=currentGame();if(!g||g.done){showResult(g);return;} if(g.index>=7){finish();return;} const q=window.SPOERGSMAAL[g.questions[g.index]]; $("round-count").textContent=`SPØRGSMÅL ${g.index+1}/7`;$("question-title").textContent=q.tekst;$("answer-input").value="";$("feedback").textContent="";show("question-screen");$("answer-input").focus({preventScroll:true});tick();timerHandle=setInterval(()=>{refreshDay();tick();},250); }
  function tick(){const g=currentGame();if(!g)return;const left=Math.max(0,ROUND_SECONDS-Math.floor((Date.now()-g.roundStartedAt)/1000));$("timer").textContent=left;$("timer").classList.toggle("low",left<=7);if(left<=0){clearInterval(timerHandle);record(null,TEKSTER.timeout);}}
  function submit(e){e.preventDefault();const g=currentGame();if(!g)return;const q=window.SPOERGSMAAL[g.questions[g.index]], raw=$("answer-input").value.trim(), found=matchAnswer(raw,q.answers);if(!found){$("feedback").textContent=TEKSTER.unknown;return;}record({name:found.navn,grade:found.grad,points:pointsFor(found)},null);}
  function record(answer,message){const g=currentGame();if(!g||g.results[g.index])return;clearInterval(timerHandle);const q=window.SPOERGSMAAL[g.questions[g.index]],points=answer?.points||0;g.score+=points;g.results[g.index]={answer:answer?.name||null,grade:answer?.grade||0,points,elapsed:Math.min(ROUND_SECONDS,Math.floor((Date.now()-g.roundStartedAt)/1000))};save();reveal(q,g.results[g.index],message);}
function reveal(q,r,message){$("reveal-count").textContent=`SPØRGSMÅL ${currentGame().index+1}/7`;$("earned-points").textContent=r.points;$("answer-result").textContent=r.answer||TEKSTER.noAnswer;$("rarity-label").textContent=r.grade?`${TEKSTER.rarity[r.grade]} · ${r.points} point`:message||"0 point";const rarer=r.answer?q.answers.filter(a=>a.grad>r.grade).sort((a,b)=>b.grad-a.grad).slice(0,3):q.answers.slice().sort((a,b)=>b.grad-a.grad).slice(0,3);$("rarer-copy").textContent=rarer.length?"Eksempler på sjældnere svar:":"Mulige svar i kategorien:";$("rarer-list").replaceChildren(...rarer.map(a=>{const li=document.createElement("li");li.textContent=a.navn;return li;}));$("trivia").textContent=q.trivia||TEKSTER.triviaFallback;$("moving-ball").style.left=`${8+Math.round(currentGame().score/700*76)}%`;
  $("next-button").textContent=currentGame().index===6?"Se dit resultat →":"Næste spørgsmål →";show("reveal-screen");}
  function next(){const g=currentGame();g.index++;if(g.index>=7){finish();return;}g.roundStartedAt=Date.now();save();showQuestion();}
  function finish(){clearInterval(timerHandle);const g=currentGame();if(!g)return;g.done=true;const last=state.lastPlayed;state.streak=last&&dayOrdinal(date)-dayOrdinal(last)===1?(state.streak||0)+1:1;state.lastPlayed=date;state.history=[{date,score:g.score},...(state.history||[]).filter(x=>x.date!==date)].slice(0,10);save();showResult(g);}
  function showResult(g){if(!g)return;$("result-date").textContent=date;$("total-score").textContent=g.score;$("rank-title").textContent=rankFor(g.score);$("result-ball").style.setProperty("--progress",`${Math.round(g.score/700*76)}%`);const history=$("history-list");history.replaceChildren(...(state.history||[]).map(x=>{const li=document.createElement("li");li.textContent=`${x.date} · ${x.score}/700`;return li;}));show("result-screen");}
  function shareText(){const g=currentGame(), emojis=g.results.map(r=>r.points>=90?"⚽":r.points>=60?"🟩":r.points>=30?"🟨":"🟥").join("");return `${TEKSTER.sharePrefix} #${dayOrdinal(date)%1000} · ${g.score}/700 · ${emojis}`;}
  async function share(){try{await navigator.clipboard.writeText(shareText());$("share-feedback").textContent="Resultatet er kopieret. Klar til at dele!";}catch{$("share-feedback").textContent=shareText();}}
  $("start-button").addEventListener("click",begin);$("answer-form").addEventListener("submit",submit);$("next-button").addEventListener("click",next);$("share-button").addEventListener("click",share);$("home-button").addEventListener("click",()=>{paintHome();show("start-screen");});$("how-button").addEventListener("click",()=>show("how-screen"));$("how-close").addEventListener("click",()=>{paintHome();show("start-screen");});
  const old=currentGame();paintHome();if(old&&!old.done&&old.results?.[old.index])reveal(window.SPOERGSMAAL[old.questions[old.index]],old.results[old.index]);else if(old?.done)showResult(old);
  setInterval(refreshDay,10000);
})();
