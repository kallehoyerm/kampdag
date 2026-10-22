# Kampdag

Kampdag er fortsat en statisk dansk fodboldquiz på GitHub Pages. HTML/CSS/JS er bevaret; quizpuljen genereres fra åbne kilder, og en lille Cloudflare Worker kan levere anonym statistik.

## Kør lokalt

Installér Node.js 20 eller nyere, og kør:

```sh
npm run data
npm run calendar
npm run validate
npm test
```

`scripts/byg-data.mjs` henter spiller/hold-tilknytninger fra Wikidata og sjældenhedsdata fra Wikimedia Pageviews. `scripts/byg-perioder.mjs` føjer særskilte spørgsmål til, der bygger på daterede start-/slutdatoer for holdtilknytning. `scripts/stabiliser-spoergsmaals-id.mjs` laver stabile spørgsmålsnøgler, så en større pulje ikke flytter allerede offentliggjorte kalenderdatoer. `data.js` er genereret, ikke håndredigeret. Svar uden dansk eller engelsk Wikipedia-artikel markeres som svage kilder, og skjules i reveal-eksempler. Kilderapporten ligger i `data/kilderapport.md`.

`scripts/byg-kalender.mjs` føjer datoer til kalenderen uden at overskrive datoer, der allerede findes i `kalender.js`. Dagen beregnes i spillerens lokale tidszone; midnat håndterer sommertid.

## Statistik-backend

Den statiske side virker uden API. Statistik-API'en bruger Cloudflare Workers + D1: Worker genberegner alle syv point med `shared/game-core.js` og de samme genererede spørgsmål, og D1 gemmer kun dato, anonymt klient-id og point. Den gemmer ikke svartekst, IP-adresse eller personoplysninger. CORS er låst til `https://kallehoyerm.github.io`.

Cloudflares aktuelle gratisgrænser er op til 100.000 Worker-requests/dag og D1's gratisniveau har daglige læse-/skrivekvoter; overskridelse af D1-kvoten kan sætte forespørgsler på pause til næste UTC-døgn. Grænserne er passende til en lille hobbyquiz, men kan ændre sig: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) og [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

Opret en D1-database med `npx wrangler d1 create kampdag`, sæt det returnerede id i `wrangler.toml`, kør `npx wrangler d1 migrations apply kampdag --remote` og derefter `npx wrangler deploy`. Sæt derefter `meta[name="kampdag-api"]` i `index.html` til `https://kampdag-api.<dit-workers.dev-underdomæne>.workers.dev/api`. Worker-konfigurationen er klar i `worker/` og `wrangler.toml`; publicering kræver en Cloudflare-konto. Ingen Cloudflare-legitimationsoplysninger er lagt i klientkoden.

## Tests

`npm test` dækker den delte klient/server-scorer, lokal dato, 25 timers døgn ved vintertidsskiftet 25. oktober 2026, kalenderopslag og uforanderlighed for allerede publicerede datoer samt ugyldige backenddatoer. `npm run validate` fejler, hvis et svar mangler kildefelter.
