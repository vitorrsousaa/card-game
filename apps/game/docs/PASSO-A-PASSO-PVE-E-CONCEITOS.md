# Passo a passo PvE e conceitos — Guia completo

Este documento responde às suas dúvidas, explica cada conceito e lista **tudo** que vamos fazer, em ordem, para você não se sentir perdido. Leia com calma; cada seção constrói a próxima.

---

# PARTE 1 — Respondendo suas perguntas (conceitos)

## 1. O que é a session?

**Session** = **uma partida em andamento**. É o “container” que guarda tudo que acontece numa única jogada PvE (ou PvP no futuro).

- **Quando começa:** quando o jogador chama `POST /sessions` (ou “iniciar partida” no app).
- **O que ela guarda:** um **identificador único** (ex.: `sessionId`) e o **estado completo do jogo** naquele momento (turno, fase, vida, mana, mão, tabuleiro, etc.).
- **Quem é dono do estado:** a **engine Lua** é a **fonte da verdade** do estado da partida. O server (Node) não decide regras; ele só persiste e repassa o que a Lua devolve.
- **Onde fica “salva”:** hoje a session existe só na resposta do `POST /sessions`. No próximo passo vamos **persistir** (banco ou cache) para o jogador poder continuar a partida depois (ex.: `GET /sessions/:id` e `POST /sessions/:id/step`).

Resumindo: **session = uma partida; sessionId = o ID dessa partida; o estado da partida vive na engine Lua e pode ser guardado no server.**

---

## 2. Como criamos a session?

**Fluxo atual (já implementado):**

1. Cliente (app ou Postman) chama **`POST /sessions`** com body opcional (ex.: `{ "userId": "..." }`).
2. O **server (Node)** recebe, chama o **CreateSessionService**.
3. O service chama **`engineBridge.run({ type: "init", payload: { options: { userId } } })`**.
4. A **engine (Lua)** recebe esse JSON pelo stdin, trata como comando **init**, cria um estado inicial (sessionId, turn 1, phase "play", players vazios), e devolve **uma linha JSON** pelo stdout com `{ ok: true, state: {...}, events: [...] }`.
5. O server pega esse resultado e responde ao cliente com um array tipo **`[{ id: sessionId, state: {...}, events: [...] }]`**.

Ou seja: **criar session = mandar “init” para a Lua; a Lua inventa o sessionId e o estado inicial; o server só repassa.**

O próximo passo é: além de devolver na resposta, **guardar** essa session em algum lugar (ex.: tabela Sessions no banco ou em Redis) e depois permitir **recuperar** por `GET /sessions/:id` e **avançar** a partida com `POST /sessions/:id/step`.

---

## 3. De onde vêm as cartas do usuário?

No MVP, as cartas podem vir de dois “lugares”:

- **Catálogo (definições):** uma lista fixa de cartas que existem no jogo (ID, nome, custo de mana, ataque, vida, efeito, etc.). Isso pode ficar:
  - no **server** (arquivo JSON ou banco), ou
  - embutido na **engine Lua** (tabela de cartas).
  Recomendação para MVP: **um JSON no server ou no monorepo** (ex.: `packages/engine/data/cards.json` ou em `apps/game`) que a Lua **recebe no init** ou que o server envia como parte do `payload.options`. Assim você não mistura “dados do jogo” com “regras”.

- **Deck do jogador (quais cartas ele usa na partida):** no PvE simples, pode ser um **deck fixo de teste** (ex.: 6 cartas definidas por ID). Quem escolhe esse deck pode ser:
  - o **server** (ao criar a session: “use o deck padrão”), ou
  - o **cliente** (envia “quero jogar com estes IDs de carta”).  
  No init, o server pode enviar algo como `payload.options.deckIds` ou `payload.options.deck = [id1, id2, ...]`. A **Lua** usa isso para montar o deck inicial e a mão (ex.: 6 cartas iniciais).

Resumindo: **definições das cartas** = catálogo (server ou Lua); **quais cartas o jogador usa** = deck (decidido no init e enviado para a Lua).

---

## 4. Como enviamos os dados das cartas?

- **Para a engine:** no **init**, você pode enviar no `payload.options` algo como:
  - `deck: ["card_1", "card_2", ...]` (IDs do catálogo), e/ou
  - `catalog: { "card_1": { mana: 1, attack: 2, health: 3 }, ... }` (se o catálogo for enviado em tempo de execução).
  A Lua então usa isso para montar o estado (deck, mão, etc.). Em cada **step**, o cliente envia **ações** (ex.: `play_card`, `attack`), e a Lua já tem o estado (incluindo as cartas) em memória; não precisa reenviar o catálogo a cada step.

- **Para o cliente (UI):** o server devolve o **state** que a Lua retornou. Esse state deve conter, por exemplo, `players[0].hand`, `players[0].board`, com cada elemento tendo pelo menos um **id** que referencia o catálogo. O cliente (ou o server) usa o catálogo para saber nome, arte, custo, ataque, vida, etc. Ou seja: **state = IDs + estado de jogo; catálogo = dados estáticos das cartas.**

---

## 5. Onde gerenciamos a mana do usuário?

A **mana** é parte do **estado da partida** e das **regras** (quanto sobe por turno, quando reseta, custo das cartas). Por isso:

- **Quem gerencia:** a **engine Lua**. No estado (ex.: `players[0]`) a Lua guarda algo como `mana = 1`, `maxMana = 1` (ou o que fizer sentido pro seu jogo). A cada início de turno a Lua atualiza; ao jogar carta, a Lua verifica se tem mana e debita.
- **Server/Lambda:** **não** gerenciam mana; só repassam o estado que a Lua devolve. O cliente **exibe** a mana que vem em `state.players[0].mana` (ou similar).

Ou seja: **mana = estado + regras → tudo na Lua; server só persiste e repassa.**

---

## 6. Onde gerenciamos a vida do usuário? Fica na Lambda ou no server?

- **Vida** também é **estado da partida** e **regra** (dano, cura, condição de vitória/derrota). Então:
  - **Quem gerencia:** a **engine Lua**. Ex.: `players[0].life = 30`, `players[1].life = 30` (inimigo). A Lua aplica dano, verifica se alguém morreu e pode emitir eventos (`player_damaged`, `game_over`).
- **Server:** só persiste o estado (que já inclui vida) e repassa ao cliente. Não calcula dano nem vida.
- **Lambda:** no nosso desenho atual, **não** entra na partida. Lambda costuma ser usada para coisas como: auth, matchmaking, tarefas assíncronas. O “servidor da partida” é o **server Node** (apps/game) que fala com a Lua. Então: **vida fica na Lua; o server só guarda e envia o state; Lambda não gerencia vida.**

---

## 7. Como criar 6 cartas iniciais para testar o MVP?

Passos objetivos:

1. **Definir um catálogo mínimo:** por exemplo um JSON com 6 cartas, cada uma com `id`, `name`, `manaCost`, `attack`, `health` (ou só o que seu jogo usar). Ex.: `cards.json` em `packages/engine/data/` ou em `apps/game/data/`.
2. **Definir o deck inicial do jogador:** por exemplo “sempre começa com as 6 cartas do catálogo” (ou 2 cópias de 3 cartas, etc.). Isso pode ser uma lista de IDs: `["card_1", "card_2", ...]`.
3. **No init da Lua:** ao receber `payload.options.deck` (ou `deckIds`), a Lua monta o deck, embaralha (com `seed` se quiser determinístico), e coloca por exemplo **6 cartas na mão** do jogador (ou 3, conforme sua regra). O resto fica no deck.
4. **Estado inicial:** a Lua devolve `state.players[0].hand = [ {...}, ... ]` (com id da carta e talvez cópia dos stats atuais). O cliente usa o catálogo para desenhar cada carta.

Assim você já tem “6 cards iniciais” para começar a testar: catálogo fixo + deck fixo no init + Lua que monta mão e deck.

---

## 8. Como é a comunicação durante a partida (HTTP no PvE)?

Fluxo típico:

1. **Iniciar partida:** `POST /sessions` → server chama Lua **init** → Lua devolve estado inicial → server responde com `{ id, state, events }` e (quando tiver persistência) guarda a session.
2. **Durante a partida:** o cliente mantém o **state** em memória (ou sempre busca do server). Quando o jogador faz uma ação (jogar carta, atacar, passar turno):
   - Cliente envia **`POST /sessions/:sessionId/step`** com body **`{ state: <state atual>, action: { type: "play_card", cardId: "...", target?: "..." } }`**.
   - O server **opcionalmente** carrega o state do banco (ou confia no state enviado pelo cliente; para PvE sem trapaça, muitas vezes se confia no client e a Lua valida).
   - Server chama **`engineBridge.run({ type: "step", state, action })`**.
   - Lua processa a ação, atualiza estado (mana, vida, mão, tabuleiro), gera eventos e devolve **`{ ok: true, state: novoState, events: [...] }`**.
   - Server persiste o novo state (se tiver persistência), responde ao cliente com **`{ state, events }`**.
3. **Cliente** atualiza a UI com o novo `state` e anima os `events`.

Ou seja: **HTTP request/response por ação;** a cada ação um round-trip: client → server → Lua → server → client. No futuro, WebSocket pode enviar só os eventos em tempo real, mas a lógica é a mesma (Lua continua sendo a fonte da verdade).

---

## 9. O que é o state machine da Lua?

**State machine (máquina de estados)** aqui = o conjunto de **estados** (ex.: fases do turno) e **transições** (quando e como mudar de fase) que a engine Lua usa para controlar o jogo.

- **Estados (exemplo):** `start_turn` → `play` → `combat` → `end_turn`. O campo `state.phase` (ou `state.turnPhase`) guarda em qual fase estamos.
- **Transições:** por exemplo:
  - De `play` para `combat`: quando o jogador escolhe “ir para combate” (ação `end_phase` ou `start_combat`).
  - De `combat` para `end_turn`: quando o jogador termina o combate (ação `end_phase`).
  - De `end_turn` para `start_turn`: fim do turno do jogador; a Lua pode virar para o turno do inimigo (PvE) ou do outro jogador (PvP).
- **Por que na Lua:** as regras (“só pode jogar carta na fase play”, “só pode atacar na fase combat”) e a atualização de fase são **lógica do jogo**. A Lua concentra essa lógica; o server não precisa saber o que é “play” ou “combat”.

Em código Lua, você pode ter uma tabela de “qual ação é permitida em qual fase” e uma função que, ao receber uma ação, verifica a fase atual e chama a função correta (aplicar carta, aplicar ataque, avançar fase, etc.). Isso **é** a state machine da Lua.

---

# PARTE 2 — Quem faz o quê (resumo)

| O quê                | Onde fica        | Motivo |
|----------------------|------------------|--------|
| Estado da partida    | Engine (Lua)     | Fonte da verdade; regras e validações |
| Vida, mana, mão, deck, tabuleiro | Lua (no state) | Parte do estado e das regras |
| Definições das cartas (catálogo) | Server ou Lua (dados) | Dados; pode ser JSON no repo ou na Lua |
| Criar session        | Server chama Lua init | Server orquestra; Lua gera estado |
| Persistir session    | Server (DB/cache) | Lua é stateless por request; server guarda state entre requests |
| HTTP, rotas, auth    | Server (Node)    | Infraestrutura |
| Comunicação client↔partida | HTTP (e depois WS) | Server expõe API; Lua não fala com cliente |
| Lambda               | Fora do loop da partida | Auth, matchmaking, etc.; não gerencia estado do jogo |

---

# PARTE 3 — Ordem do trabalho (o que fazer antes de quê)

Você está certo: algumas coisas fazem sentido **antes** de fechar a comunicação server↔Lua. Abaixo está uma ordem sugerida.

---

## Fase 0 — Modelo de dados (cartas, jogador, estado)

**Objetivo:** deixar claro o formato de “carta”, “jogador” e “estado” para todo o resto.

- **Cartas (catálogo):** ex. `{ id, name, manaCost, attack, health }` (ou só o que for usar).
- **Jogador em estado:** ex. `{ id, life, maxLife, mana, maxMana, hand: [{ cardId, ... }], board: [...], deck: [...] }`.
- **Inimigo (PvE):** mesmo formato ou um simplificado (só life, board, deck).
- **Estado global:** `{ sessionId, turn, phase, currentPlayerId, players: [player, enemy] }`.

Isso pode ser um documento (markdown) ou tipos TypeScript + comentários em Lua. Não precisa estar em código ainda; é o “contrato” que a Lua e o server vão seguir.

---

## Fase 1 — Catálogo (JSON fixo) e deck mockado no server

- **Catálogo:** por enquanto um **JSON fixo** (ex.: 2 cartas de exemplo; no futuro virá do banco + app admin). Onde esse JSON fica no MVP: **no server (apps/game)** — ver PARTE 6 (catálogo no server vs Lua) e exemplos de cartas.
- **Deck do jogador:** inicialmente **mockado no server** (ex.: lista fixa de IDs no código). No futuro o server busca o deck no DB pelo `userId` antes de chamar o init.
- Criar **um arquivo** (ex. `apps/game/data/cards.json`) com pelo menos 2 cartas de exemplo; o server lê e envia no init (catálogo e/ou deckIds) para a Lua conforme a decisão “só IDs vs catálogo completo” (PARTE 6).

---

## Fase 2 — sessionId na Lua + Session e persistência (DB)

- **sessionId gerado pela Lua:** a engine Lua já gera o `sessionId` no **init** (ex.: `sess-<timestamp>-<random>`). O server **não** inventa o ID; ele usa o que a Lua devolve em `result.state.sessionId`. Assim o ID nasce junto do estado e evita colisão.
- **Persistir no server:** após o init, o server precisa **salvar** a session em algum lugar para permitir `GET /sessions/:id` e `POST /sessions/:id/step`. O que salvar: `id` (= `result.state.sessionId`), `state` (JSON completo), `userId`, `createdAt` (e talvez `updatedAt`).
- **Onde persistir:** há várias opções (Dynamo direto pelo game server, API Lambda, Redis, etc.). Ver **PARTE 6** para decisão: Dynamo direto vs game server chamando API Lambda, e se vale usar Redis.
- **Recuperar session:** `GET /sessions/:id` → buscar state no banco → devolver `{ state, events: [] }` (sem chamar Lua).
- Assim o cliente pode “continuar” uma partida e depois enviar steps.

---

## Fase 3 — State machine na Lua (fases do turno)

- Na Lua: manter `state.phase` (ex. `"play"`, `"combat"`, `"end_turn"`).
- Implementar **transições:** por exemplo ação `end_phase` avança play → combat → end_turn → próximo turno.
- **Validação:** em cada `step`, verificar se a ação é permitida na fase (ex. `play_card` só em `play`).
- Ainda não precisa de “inimigo inteligente”; só o fluxo de fases e turnos.

---

## Fase 4 — Dados do jogador na Lua (vida, mana, mão, deck)

- No **init:** inicializar `players[0]` (jogador) e `players[1]` (inimigo) com life, mana, hand (6 cartas do deck inicial), deck (restante), board vazio.
- Na **step:** ao jogar carta, debitar mana, mover carta de hand para board, etc. Ao atacar, reduzir life do alvo.
- Mana: por exemplo +1 por turno, reset no início do turno (tudo na Lua).

---

## Fase 5 — Rota de step no server

- **`POST /sessions/:id/step`** com body `{ state?, action }`.  
  - Se tiver persistência: carregar state do banco por `id` e usar esse state (em vez do body) para evitar trapaça.  
  - Chamar `engineBridge.run({ type: "step", state, action })` e devolver `{ state, events }`.
- Persistir o novo state no banco (se tiver).
- Cliente usa isso para enviar “jogar carta”, “atacar”, “fim de fase”.

---

## Fase 6 — MVP jogável (fim de jogo, UI mínima)

- Lua: detectar quando `life <= 0` e emitir evento `game_over` (winner/loser).
- Cliente: tratar `game_over` e mostrar vitória/derrota.
- Ter pelo menos: criar session, ver mão, jogar carta, passar fase/turno, atacar (se fizer sentido), e condição de vitória/derrota.

---

# PARTE 4 — Outros pontos importantes para o PvE

- **Inimigo (IA):** no MVP pode ser só um “alvo” com life e board, sem decisões. Depois você adiciona na Lua uma função “escolher jogada do inimigo” e chama após o turno do jogador (ou em fase específica).
- **Seed determinístico:** o `init` já pode receber `payload.seed`; use para `math.randomseed(seed)` na Lua. Assim você reproduz a mesma partida (útil para testes e replay).
- **Eventos:** use `events` para a UI animar (ex. `card_played`, `damage_dealt`, `phase_changed`). O cliente não precisa adivinhar; a Lua diz o que aconteceu.
- **Trapaça:** em PvE, se o state for sempre carregado do server (e não do cliente), o server + Lua garantem que ninguém altera vida/mana no client. Para MVP, confiar no state enviado pelo client é aceitável; depois você passa a carregar state do banco no server antes de cada step.

---

# PARTE 6 — Decisões de arquitetura (persistência, Redis, catálogo, deck, IDs vs catálogo)

Esta parte responde às perguntas sobre **onde salvar a session**, **Dynamo vs Lambda API**, **Redis**, **catálogo (JSON agora, DB depois)**, **deck mockado** e **mandar só IDs vs catálogo completo para a Lua**. Serve para decidirmos como seguir e como evoluir.

---

## 6.1 sessionId gerado pela Lua e onde persistir a session

- **Quem gera o sessionId:** a **engine Lua** no comando **init**. O server usa o valor que vem em `result.state.sessionId` e não gera outro ID. Assim o estado e o ID nascem juntos e a Lua continua sendo a fonte da verdade.
- **O que precisamos fazer:** após receber a resposta do init, o **server (apps/game)** deve **persistir** a session em algum armazenamento para:
  - permitir **GET /sessions/:id** (recuperar partida);
  - permitir **POST /sessions/:id/step** (carregar state do banco, chamar Lua, salvar novo state).
- **Campos a persistir (mínimo):** `id` (= sessionId), `state` (JSON), `userId`, `createdAt`; opcional `updatedAt`.

**Onde persistir: opções**

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|--------|
| **A) Game server escreve direto no DynamoDB** | apps/game usa AWS SDK e tabela Dynamo (ex.: `Sessions`). PK = `id` (sessionId). | Uma única aplicação fala com o Dynamo para sessões; baixa latência; sem hop extra. | Game server precisa de permissões IAM / credenciais para Dynamo; você gerencia tabelas (Serverless/Terraform) para o game também. |
| **B) Game server chama API Lambda que persiste no Dynamo** | apps/game faz HTTP (ou SDK) para a **API (apps/api)**; uma rota tipo `POST /internal/sessions` ou `PUT /sessions/:id` que a Lambda usa para gravar no Dynamo. | Centraliza acesso ao Dynamo nas Lambdas; reutiliza a API e contratos; game server não precisa de acesso direto ao Dynamo. | Latência extra (game → API → Dynamo); você precisa de um endpoint “interno” ou exposto; cuidado com cold start se a Lambda for só para isso. |
| **C) Game server usa Redis (ou outro cache) e depois sincroniza com Dynamo** | Session fica em Redis para leitura/escrita rápida; job assíncrono ou Lambda periodicamente (ou ao fechar partida) persiste no Dynamo para histórico. | Leitura/escrita muito rápida durante a partida; Dynamo como histórico/analytics. | Dois sistemas para manter; consistência e TTL a desenhar. |

**Recomendação para decidir:**

- Se você quer **simplicidade agora** e já tem Dynamo na API (Lambdas): **B** (game server chama API Lambda para criar/atualizar session) deixa o Dynamo só nas Lambdas e o game server stateless em termos de infra de dados. Você precisará de rotas como `POST /sessions` (criação pode ser: game chama Lua, depois chama API para salvar) ou a própria criação já na API (API chama… não, a Lua está no game server). Então: **game server chama Lua → obtém state com sessionId → game server chama API (Lambda) para “salvar session” (POST ou PUT)**; em step, game server chama API para “buscar session” (GET) e “atualizar session” (PUT). Assim o Dynamo continua apenas atrás da API.
- Se você quer **menor latência** e não se importa em dar ao game server acesso ao Dynamo: **A** (game server escreve direto no Dynamo) é mais simples em número de hops e evita cold start da Lambda em cada step.
- **Redis:** ver seção 6.2; pode ser um complemento (cache na frente do Dynamo) ou, se a partida for só em memória/Redis, Dynamo só para histórico.

---

## 6.2 Vale a pena adicionar Redis no API server (game server)?

**Contexto:** “API server” aqui = **apps/game** (servidor Node da partida), não as Lambdas.

**Quando Redis vale a pena:**

- **Cache do state da partida:** em vez de ler/escrever no Dynamo a cada step, o game server guarda (e lê) o state em Redis (key = sessionId). Reduz latência e carga no Dynamo. Ao criar session, grava no Redis (e opcionalmente no Dynamo para durabilidade); ao fazer step, lê/atualiza Redis; ao terminar partida ou após TTL, pode persistir no Dynamo.
- **Sessões de conexão WebSocket:** se no futuro cada cliente mantiver uma conexão WebSocket, você pode guardar em Redis o mapeamento `userId` / `connectionId` ↔ `sessionId` para rotear mensagens.
- **Rate limit / filas:** Redis é útil para limitar requisições por usuário ou para fila de matchmaking (opcional).

**Quando não vale (ou pode esperar):**

- **MVP com poucos usuários e HTTP apenas:** se você só tem `POST /sessions` e `POST /sessions/:id/step` e pouca concorrência, ler/escrever direto no Dynamo (ou via Lambda) a cada request pode ser suficiente. Redis adiciona uma dependência e operação (deploy, TTL, persistência).
- **Partida curta e sem necessidade de “continuar depois”:** se a partida for sempre em memória e você não persistir entre restarts, Redis não é obrigatório.

**Resumo:** para **evoluir** sem se perder, faz sentido **não** adicionar Redis no MVP; persistir session no Dynamo (direto pelo game server ou via API Lambda). Quando você tiver mais tráfego ou WebSocket, **aí** introduzir Redis como cache do state (e opcionalmente Dynamo para histórico). Assim você mantém o passo a passo simples e adiciona Redis quando a necessidade aparecer.

---

## 6.3 O que precisamos para criar o catálogo de cartas? JSON fixo agora; DB + app admin no futuro

**O que precisamos para o catálogo:**

- **Definição por carta:** pelo menos `id`, `name`, e os atributos que a **regra** usa (ex.: `manaCost`, `attack`, `health`). Podem existir campos só para UI (ex.: `description`, `imageUrl`) que a Lua ignora.
- **Quem usa:** a **Lua** usa para validar custos, aplicar dano, etc.; o **cliente** usa para exibir nome, arte, texto. O **server** pode ser só o repositório (lê do arquivo ou do DB e envia no init).
- **Agora (MVP):** um **JSON fixo** com poucas cartas (ex.: 2 cartas de exemplo). No futuro: catálogo no **banco** (Dynamo ou outro) e uma **aplicação admin** para cadastrar/editar cartas.

**Onde o JSON fixo fica: no server ou na Lua?**

| Onde | Prós | Contras |
|------|------|--------|
| **No server (apps/game)** | Único lugar dos “dados do jogo” no início; fácil trocar depois por leitura no DB; mesmo arquivo (ou módulo) pode servir para enviar catálogo no init e para o cliente (se o client pedir catálogo via API). Lua recebe só o que o server manda (IDs ou catálogo completo). | O server precisa enviar no init (payload maior se for catálogo completo). |
| **Na Lua (tabela fixa)** | Init mais leve (server envia só deck IDs); Lua não depende do formato do payload para o catálogo. | Catálogo fica duplicado se o cliente também precisar (aí o server teria que ter uma cópia ou ler do mesmo JSON para expor GET /cards). Para evoluir para “catálogo no DB”, você teria que tirar da Lua e passar a enviar do server. |

**Recomendação:** **catálogo no server** (arquivo JSON em `apps/game/data/cards.json` ou similar). No init o server lê esse JSON e envia no `payload.options` (como `catalog` e/ou o deck como lista de IDs). Assim, quando no futuro o catálogo vier do DB, você só troca a leitura no server (de arquivo para repositório); a Lua continua recebendo o mesmo formato. O cliente pode receber o catálogo pela resposta do init (já vem no state ou em campo separado) ou por uma rota `GET /cards` que devolve o mesmo JSON.

**Exemplo de duas cartas (JSON fixo):**

```json
[
  {
    "id": "flux_strike",
    "name": "Golpe do Fluxo",
    "manaCost": 1,
    "attack": 2,
    "health": 1,
    "description": "Uma rajada de energia do fluxo."
  },
  {
    "id": "chrono_guard",
    "name": "Guarda Cronomante",
    "manaCost": 2,
    "attack": 1,
    "health": 3,
    "description": "Defensor do tempo."
  }
]
```

Esse array pode ficar em `apps/game/data/cards.json`. O **deck mockado** no server pode ser algo como `["flux_strike", "chrono_guard", "flux_strike", "chrono_guard", "flux_strike", "chrono_guard"]` (2 cartas, 3 cópias de cada) para ter 6 cartas na partida; a Lua monta o deck e a mão a partir disso.

---

## 6.4 Deck do jogador: mockado no server agora; no futuro pelo userId no DB

- **Agora (MVP):** o **deck** é **mockado no server** (ex.: constante ou função que retorna uma lista fixa de card IDs). Ao criar a session, o server chama o init com `payload.options.deckIds = getMockDeck()` (ou similar). Não usa `userId` para buscar nada ainda.
- **Futuro:** o server passa a buscar o deck do jogador no **DB** (via API Lambda ou direto Dynamo) usando o `userId` (ex.: tabela UserDecks ou perfil do usuário). O init recebe `payload.options.deckIds = await getDeckByUserId(userId)`. Assim a evolução é só trocar “de onde vêm os deckIds” no server; a Lua continua recebendo uma lista de IDs.

---

## 6.5 Diferença: mandar só os IDs das cartas para a Lua vs mandar o catálogo completo

**Opção 1 — Só IDs (e deck como lista de IDs):**  
O server envia no init algo como `payload.options.deckIds = ["flux_strike", "chrono_guard", ...]`. A Lua precisa **conhecer** os atributos de cada carta (manaCost, attack, health) para aplicar regras. Então a Lua teria que ter uma **tabela interna** com os dados das cartas (catálogo embutido na Lua) ou você duplica: catálogo no server (para o client) e catálogo na Lua (para as regras). Duplicação de fonte da verdade.

**Opção 2 — Catálogo completo no init:**  
O server envia `payload.options.catalog = { "flux_strike": { "manaCost": 1, "attack": 2, "health": 1 }, ... }` e `payload.options.deckIds = ["flux_strike", ...]`. A Lua **não** guarda definições de cartas em código; ela usa só o que veio no payload. Regras (custo, dano, vida) são calculadas a partir do `catalog[cardId]`. Uma única fonte da verdade (server/DB); quando você mudar uma carta no admin, só o server/DB muda; no próximo init a Lua já recebe o catálogo atualizado.

**Recomendação:** **mandar o catálogo completo no init (Opção 2)**. A Lua guarda em memória (para aquele processo) o catálogo e o deck; usa o catálogo para validar custos e aplicar efeitos. Assim o catálogo vive no server (arquivo agora, DB depois) e a Lua fica “burra” em relação a onde os dados vêm — só consome o que recebe. Para partidas longas ou muitos steps, o payload do init é um pouco maior uma vez; em troca você evita duplicar o catálogo na Lua e facilita evoluir para catálogo no DB e app admin.

---

## 6.6 Resumo da evolução (como seguir)

1. **sessionId:** Lua gera no init; server usa esse valor e persiste (6.10).
2. **Persistência no início:** usar **Redis (Docker)** como repositório de sessions (get/save state por sessionId); depois evoluir para Dynamo ou API Lambda quando for para produção (6.10).
3. **Catálogo:** JSON fixo no **server** (`apps/game/data/cards.json`); init envia **catálogo + deckIds**; no futuro catálogo no DB + app admin.
4. **Deck:** mockado no server (lista fixa de IDs); no futuro buscar do DB por `userId`.
5. **Lua:** contém **todas as regras**; recebe catálogo (dados) + deckIds no init para aplicar as regras sem hardcodar números (6.8.1).

Com isso, o documento fica alinhado às suas perguntas e às opções para você decidir (Redis Docker primeiro, depois Dynamo/Lambda; catálogo = dados, Lua = regras).

---

## 6.7 Escala numérica do jogo (10 vs 100 de mana, etc.)

**Pergunta:** Como definir se o jogo usa 10 de mana ou 100 de mana? Como analisar se vamos usar múltiplos maiores ou não?

**Resposta:**

- **Escala é decisão de design**, não técnica. A engine (Lua) só precisa de números consistentes: se você definir “mana máxima 10” ou “mana máxima 100”, a Lua usa o que vier no catálogo e nas regras (ex.: `maxMana = 10`, custos de 1 a 10).
- **Critérios para decidir:**
  - **Clareza na UI:** números menores (ex. 1–10) cabem melhor em cartas e contadores; 100 exige mais espaço ou abreviação.
  - **Granularidade:** 100 permite custos como 15, 23, 47; 10 força custos mais “redondos” (1, 2, 3…). Para um jogo estilo Hearthstone, 1–10 (ou 1–12) é o padrão.
  - **Balanceamento:** escalas menores tornam cada ponto de mana/dano mais impactante; escalas maiores permitem ajustes finos mas podem confundir o jogador.
- **Recomendação para Chronomancers:** começar com **escala baixa** (ex. vida 20–30, mana máxima 10, custos 0–10, ataque/dano 0–10). Você pode documentar isso no arquivo de definições do jogo (ex. `GAME-DEFINITIONS.md`). Se no futuro quiser “modo épico” com 100 de vida, basta alterar constantes e catálogo; a Lua já trabalha com números.

---

## 6.8 Catálogo no init: passamos “todas as cartas dos dois usuários”?

**Pergunta:** No init da engine passamos todas as cartas dos dois usuários que vão iniciar a partida?

**Resposta:**

- **Não** passamos “todas as cartas da coleção” de cada usuário. Passamos:
  1. **Catálogo (cópia única):** todas as **definições** de cartas do jogo (id, name, manaCost, attack, health, etc.). É um dicionário/objeto global: `catalog = { "flux_strike": {...}, "chrono_guard": {...}, ... }`. Serve para os **dois** lados: jogador e inimigo usam o mesmo catálogo para resolver custos e efeitos.
  2. **Deck do jogador (lista de IDs):** as cartas que o **jogador** leva para aquela partida (ex.: `deckPlayer = ["flux_strike", "chrono_guard", ...]`). A Lua monta o deck e a mão do jogador a partir dessa lista.
  3. **Deck do inimigo (lista de IDs ou “deck fixo”):** no PvE, o inimigo também tem um deck. Pode ser uma lista enviada no init (ex.: `deckEnemy = ["chrono_guard", ...]`) ou um deck fixo definido na Lua/engine para o modo PvE. O catálogo já contém as definições; as listas só dizem **quais** cartas cada um usa.

Resumindo: **init recebe 1 catálogo (todas as definições) + 1 deck do jogador (IDs) + 1 deck do inimigo (IDs ou fixo).** Não são “todas as cartas dos dois usuários” no sentido de coleção completa; são só os decks da partida e o catálogo para resolver os atributos.

---

## 6.8.1 Catálogo vs Lua: o que é dado e o que é regra? Para que serve a Lua?

**Dúvida:** Se o catálogo são as definições do jogo e a gente envia no começo, para que serve a Lua? Achei que todas as regras ficariam na Lua.

**Resposta:**

- **Catálogo = dados.** São as **definições** de cada carta: id, nome, manaCost, attack, health, descrição, etc. É informação que pode vir do server (JSON/DB) e que **não** é lógica. Servem para “olhar” os valores (quanto custa esta carta? quanto de dano ela dá?).

- **Lua = regras (toda a lógica do jogo).** As **regras** são justamente o que a Lua faz:
  - **Validar:** “esta ação é permitida nesta fase?”; “o jogador tem mana suficiente?”; “o alvo é válido?”
  - **Aplicar efeitos:** “debitar mana”, “reduzir vida do alvo”, “mover carta da mão para o board”, “calcular dano”
  - **Controlar fluxo:** state machine (play → combat → end_turn), troca de turno, condição de vitória/derrota
  - **Emitir eventos:** “card_played”, “damage_dealt”, “game_over” para a UI animar

A Lua **não** inventa os números das cartas; ela **usa** o catálogo que recebeu no init para saber “quanto custa esta carta”, “quanto de ataque tem”. Ou seja: **enviamos o catálogo no começo para a Lua ter os dados; a Lua continua dona de todas as regras.** Sem o catálogo, a Lua teria que ter esses números fixos no código (e aí virariam “regras” misturadas com dados). Enviando o catálogo, a Lua só tem regras e usa os dados que recebeu.

Resumindo: **catálogo = dados das cartas (vêm do server); Lua = regras do jogo (validação, efeitos, fases, eventos).** As regras ficam todas na Lua; o catálogo é só a “tabela de consulta” que a Lua usa para aplicar essas regras.

---

## 6.9 A Lua persiste dados? Como não confunde duas partidas?

**Pergunta:** Como a Lua persiste os dados? Quando inicio uma session mandando todos os cards, como sei que a Lua não vai confundir duas partidas? Como ela guarda em memória?

**Resposta:**

- **A Lua não persiste nada entre requests.** Cada chamada ao processo Lua é **um processo novo**: o server (Node) faz `spawn("lua", ["main.lua"])`, envia **uma** linha (um comando `init` ou `step`), a Lua processa e devolve **uma** linha (estado + eventos). Depois o processo Lua **termina**. Não existe “Lua rodando em background” guardando várias partidas.
- **Quem persiste é o server.** Após o init, o server recebe `result.state` (com sessionId, players, etc.) e **grava** esse state no banco (Dynamo) ou em cache (Redis). Quando o cliente faz um step, o server **carrega** o state daquela session do banco, envia para a Lua no comando `step` junto com a ação; a Lua devolve o novo state; o server **grava de novo** o state atualizado. Ou seja: o state vive no **banco/cache**; a Lua só recebe o state atual da partida naquele request e devolve o próximo.
- **Não há confusão entre partidas** porque: (1) cada request de step é para **uma** sessionId; (2) o server busca do banco o state **dessa** session e só esse state é enviado à Lua; (3) a Lua não sabe de outras partidas — ela só vê o JSON que recebeu (um único state). O “isolamento” é garantido pelo server ao carregar/salvar por sessionId.

Em resumo: **Lua = stateless; state da partida = no server (DB/cache); cada step = server envia state daquela session + action → Lua devolve novo state → server persiste.**

---

## 6.10 Onde o state fica armazenado? DynamoDB? E faz sentido Redis (Docker) no início?

**Pergunta:** Como o server vai precisar persistir o state para aquele sessionId, isso vai ficar armazenado aonde? DynamoDB? Faz sentido implementar Redis com Docker como “banco” no início e só depois Dynamo ou API Lambda?

**Resposta:**

- **Onde o state fica:** no **server (apps/game)** ele não fica em memória entre requests (o processo pode reiniciar). Então o state **tem** que ser gravado em algum armazenamento externo. As opções que discutimos são:
  - **DynamoDB** — tabela Sessions (PK = sessionId), atributo `state` (JSON). Pode ser escrita direto pelo game server (com SDK da AWS) ou via **API Lambda** (game server chama a API, a Lambda grava no Dynamo).
  - **Redis** — key `session:{sessionId}`, value = JSON do state. Rápido, simples para desenvolvimento local (ex.: Redis em Docker).

- **Faz sentido Redis (Docker) no início e depois Dynamo/Lambda?** **Sim.** Para a fase em que tudo está mockado e você quer evoluir sem depender de AWS:
  1. **Agora:** usar **Redis em Docker** como o único repositório de sessions. O game server sobe com `REDIS_URL=redis://localhost:6379`; ao criar session, grava o state no Redis; ao fazer step, lê e grava no Redis. Não precisa de Dynamo nem de Lambda; qualquer dev roda `docker run redis` e já tem persistência.
  2. **Depois:** quando for para produção ou quando quiser durabilidade/histórico em AWS, você **adiciona** Dynamo (ou a comunicação com a API Lambda). Aí você pode:
     - **Opção A:** trocar o repositório de sessions no game server de Redis para Dynamo (ou cliente HTTP da API Lambda), mantendo a mesma interface (get/save por sessionId).
     - **Opção B:** manter Redis como cache e usar Dynamo como “fonte de verdade” (escrever nos dois, ler do Redis e repassar para Dynamo em background ou ao encerrar partida).

Assim você **não** precisa implementar Dynamo ou Lambda no dia um; Redis em Docker resolve “onde persistir o state” no início e deixa a porta aberta para evoluir para Dynamo/Lambda quando fizer sentido.

---

# PARTE 7 — Para o futuro (backlog de tópicos)

Estes itens não são necessários para o MVP; ficam documentados para quando formos evoluir.

---

## 7.1 Rodar partidas na Lua como teste de integração

**Objetivo:** automatizar testes que simulam uma partida inteira (init + vários steps) usando a engine Lua, sem passar pelo HTTP do server.

**Ideias:**

- **Script Lua de teste:** um script (ex.: `packages/engine/spec/main_spec.lua` ou `test/match.lua`) que em Lua mesmo: chama a lógica de init (com catálogo e decks fixos), depois em loop chama a lógica de step com ações pré-definidas (jogar carta 1, jogar carta 2, atacar, end_turn…), e verifica no final que o state está como esperado (ex.: vida do inimigo reduzida, fase correta, game_over). Depende de você expor funções “puras” na engine (init e step como funções que recebem tabelas e retornam tabelas) em vez de só stdin/stdout.
- **Teste de integração em Node:** um teste (Jest/Vitest) no apps/game que spawna o processo Lua, envia várias linhas (init, step, step, …) e lê várias linhas, simulando uma partida; assertions no state final. Isso testa o protocolo JSON e o binário Lua juntos.
- **Replay determinístico:** com seed fixo no init, gravar uma sequência de ações; o teste reexecuta init + ações e verifica que o state final é idêntico (útil para regressão).

Quando formos implementar, vale criar uma seção em `packages/engine/README.md` ou em `apps/game/docs` descrevendo como rodar esses testes (ex.: `pnpm test:engine` ou `lua spec/match_spec.lua`).

---

## 7.2 Balanceamento de cartas (evitar cartas “apelonas”)

**Objetivo:** ter critérios e processo para balancear cartas para que nenhuma fique desproporcionalmente forte.

**Ideias (para o futuro):**

- **Curva de custo vs poder:** definir uma “fórmula” ou tabela esperada (ex.: custo X mana → expectativa de “poder” Y, onde poder = ataque + vida + efeito). Cartas que fugirem muito dessa curva podem ser revisadas.
- **Playtesting e métricas:** após ter um conjunto de cartas, rodar partidas (ou simulações) e medir win rate por deck/carta; cartas que aparecem em quase todas as vitórias ou que nunca são usadas podem ser ajustadas.
- **Limites de design:** ex.: nenhuma carta com custo 1 pode ter mais que 2 ataque + 2 vida somados; custo 2 não ultrapassa 4 de “stats totais”, etc. Documentar isso num “design bible” ou no GAME-DEFINITIONS.
- **Ferramentas:** planilha ou script que lê o catálogo (JSON) e calcula “poder” por custo; alertas para cartas fora da faixa. No futuro, o app admin pode mostrar esses indicadores ao cadastrar carta.

Não é complexo implementar “regras de ouro” no papel primeiro; a implementação em código (validação no admin, simulações) vem depois.

---

## 7.3 Complexidade de implementar Redis; o que precisamos

**Pergunta:** É muito complexo implementar Redis? O que vamos precisar?

**Resposta (resumida):**

- **Não é muito complexo** do ponto de vista de código: você usa um client Redis (ex.: `ioredis` no Node), conecta na inicialização do server (apps/game), e nas rotas de session você grava/lê com uma key tipo `session:{sessionId}` (valor = JSON do state). TTL opcional (ex.: 24h) para sessions abandonadas.
- **O que precisamos:**
  - **Serviço Redis:** instância Redis (AWS ElastiCache, Redis Cloud, ou Docker local para dev).
  - **Variáveis de ambiente:** `REDIS_URL` ou `REDIS_HOST` + `REDIS_PORT` (e senha se houver).
  - **No código (apps/game):** um módulo de repositório ou service que encapsula “get session”, “save session”; o CreateSessionService e o StepService usam esse módulo. Se quiser fallback, pode tentar Redis primeiro e, se falhar ou não existir, usar Dynamo (ou só Dynamo no MVP).
  - **Deploy e operação:** Redis precisa estar disponível e com backup/HA se for crítico; para MVP, um único nó ou serviço gerenciado é suficiente.

Quando formos adicionar Redis, vale documentar aqui: decisão (cache em frente ao Dynamo vs só Redis), formato da key, TTL, e como o server escolhe Redis vs Dynamo (feature flag ou env).

---

# PARTE 5 — Checklist “o que fazer agora” (resumido)

1. **Documentar** (ou desenhar) o modelo: carta, jogador, estado (Fase 0).
2. **Criar** catálogo JSON no **server** (`apps/game/data/cards.json`) com pelo menos 2 cartas; deck **mockado** no server (lista de IDs) (Fase 1). Ver PARTE 6 para exemplos de cartas e decisão catálogo/IDs.
3. **Implementar** na Lua: init que **gera sessionId**, recebe **catálogo + deckIds** no payload, monta estado com 2 jogadores, mão (ex. 6 cartas), vida e mana (Fase 4 parcial).
4. **Persistência:** implementar repositório de sessions no server (get/save por sessionId) usando **Redis em Docker** no início (6.10); depois evoluir para Dynamo ou API Lambda se precisar.
5. **Implementar** na Lua: state machine (fases) e validação de ações (Fase 3).
6. **Implementar** na Lua: ações concretas (play_card, end_phase, attack) e atualização de mana/vida (Fase 4).
7. **Adicionar** rota `POST /sessions/:id/step` no server; carregar state do banco (ou do body no MVP), chamar Lua, persistir novo state (Fases 2 e 5).
8. **Testar** fluxo completo: criar session (sessionId da Lua + salvar no DB) → step → game_over (Fase 6).
9. **Futuro:** trocar Redis por Dynamo (ou API Lambda) se for para produção; catálogo no DB + app admin; deck por userId no DB (PARTE 6).

Quando você tiver o modelo (Fase 0) e o catálogo no server (Fase 1), o próximo passo concreto é **implementar o init na Lua** que recebe `payload.options.catalog` e `payload.options.deckIds`, gera sessionId, monta os dois players e devolve o state. O server lê `apps/game/data/cards.json` e o deck mockado e envia tudo no init.
