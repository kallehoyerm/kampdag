# Kampdag

En statisk dansk fodboldquiz uden konto, backend, tracking eller reklamer.

## Åbn spillet

Åbn `index.html` direkte i en moderne browser. Der er ingen buildproces eller installation. Alternativt kan mappen udgives direkte på GitHub Pages, Netlify eller et andet statisk webhotel.

## Spørgsmål og data

Redigér `data.js`. Hvert spørgsmål har et `id`, en `tekst`, 25–50 `answers` og en kort `trivia`. Hvert svar skal have `navn`, `aliaser` (en liste) og `grad` fra 1 til 5. Graderne giver henholdsvis 10, 30, 60, 85 og 100 point. `game.js` indeholder brugerfladens danske tekster og spilregler.

Kontrollér data med `node validate-data.js`. Kør spilfunktionernes tests med `node test.js`.

## Dagsvalg og gemt spil

Datoen beregnes i tidszonen Europe/Copenhagen. En seedet shuffle vælger dagens syv forskellige spørgsmål. Algoritmen afviser en 7-spørgsmåls-kombination, der allerede blev brugt inden for de foregående 30 datoer. Med 40 spørgsmål er det matematisk umuligt at undgå at gentage enkelte spørgsmål i 30 dage (der bruges 210 pladser på 40 spørgsmål); derfor gælder 30-dages-reglen for hele quizkombinationen. Samme dato giver samme kombination hos alle, og lokal lagring gemmer svar, score og starttid for den aktive runde.

## Bemærkning om startdata

De 40 startkategorier genbruger ti brede, stabile puljer. Svarenes sjældenhedsgrader er foreløbige redaktionelle skøn, ikke målinger af spilleradfærd. Gennemgå og redigér puljer og grader, før quizzen bruges som en faktatjekket offentlig udgivelse.
