# PRD — BusinessOS

> **Product Requirements Document**
> Projeto: **BusinessOS** — "Pra quem está começando do zero"
> Versão: 1.0 (MVP) · Data: 2026-07-11 · Status: Draft

---

## 1. Objetivo do produto e resumo

O **BusinessOS** é um web app que funciona como a **inteligência e a camada de tomada de decisão de um negócio** para um founder solo que está começando do zero. Em vez de espalhar decisões, hipóteses e números por planilhas, notas soltas e conversas de chat, o founder centraliza tudo em uma estrutura de negócio clara, organizada em **quatro pilares** (Founder, Direção, Validação, Caixa). Cada informação é escrita e salva na interface como um **Card** em Markdown com frontmatter YAML, o que torna o mesmo conteúdo simultaneamente **editável por pessoas** e **legível por agentes de IA e skills**. O resultado é um "sistema operacional do negócio": um lugar único onde o founder pensa, registra suas decisões e, no futuro, colabora com IA que enxerga exatamente o mesmo contexto que ele.

---

## 2. Persona(s) e Jobs-To-Be-Done

### 2.1 Persona primária — "O founder solo começando do zero"

| Atributo | Descrição |
|---|---|
| Quem é | Empreendedor(a) individual, sem sócios e sem time, dando os primeiros passos em um negócio. |
| Contexto | Tem uma ideia (ou várias hipóteses), pouco ou nenhum cliente, orçamento apertado e tempo limitado. |
| Dores | Informação fragmentada; falta de clareza sobre direção; medo de gastar dinheiro/tempo com a coisa errada; não sabe por onde começar nem o que priorizar. |
| Nível técnico | Confortável com ferramentas web modernas; não precisa ser programador. |
| O que valoriza | Simplicidade, clareza visual, sensação de progresso, e não ter que aprender uma ferramenta complexa. |

### 2.2 Jobs-To-Be-Done (JTBD)

- **JTBD-1** — Quando estou começando do zero, quero **organizar tudo que sei e decido sobre o negócio em um só lugar**, para parar de perder informação e ganhar clareza.
- **JTBD-2** — Quando estou inseguro sobre a direção, quero **estruturar mercado, cliente ideal e oferta**, para tomar decisões com menos achismo.
- **JTBD-3** — Quando tenho hipóteses, quero **registrar e acompanhar o que estou validando**, para saber o que já foi testado e o que falta.
- **JTBD-4** — Quando o dinheiro é curto, quero **enxergar meu caixa e meu runway**, para saber quanto tempo tenho e o que posso gastar.
- **JTBD-5** — Quando vou usar IA para me ajudar, quero que a IA **enxergue o mesmo contexto que eu escrevi**, para receber ajuda relevante e não genérica.

### 2.3 User stories

- Como founder, quero **criar um card** em qualquer página e escrever livremente em Markdown, para registrar uma ideia ou decisão.
- Como founder, quero **marcar o status** de cada card (vazio, rascunho, em andamento, revisão, feito), para saber o que já está maduro e o que ainda é hipótese.
- Como founder, quero **ver de relance quanto de cada pilar já preenchi**, para sentir progresso e saber onde focar.
- Como founder, quero **alternar entre visão em Grade e em Lista**, para ler meus cards do jeito que preferir no momento.
- Como founder, quero **navegar rapidamente pelos 4 pilares** na sidebar, para pular entre áreas do negócio sem me perder.
- Como founder, quero que meu conteúdo fique salvo **em arquivos que a IA consegue ler**, para no futuro trabalhar junto com agentes.

---

## 3. Sitemap / Arquitetura de Informação completa

### 3.1 Todas as rotas

| Rota | Pilar | Página |
|---|---|---|
| `/` | — | Visão geral (dashboard) |
| `/founder/objetivo` | Founder | Objetivo |
| `/founder/estilo-de-vida` | Founder | Estilo de vida |
| `/direcao/mapa-do-mercado` | Direção | Mapa do Mercado |
| `/direcao/ima-de-problemas` | Direção | Ímã de Problemas |
| `/direcao/perfil-ideal-de-cliente` | Direção | Perfil Ideal de Cliente |
| `/direcao/tese-de-valor` | Direção | Tese de Valor |
| `/direcao/oferta` | Direção | Oferta |
| `/validacao/oferta` | Validação | Oferta |
| `/validacao/primeiros-clientes` | Validação | Primeiros clientes |
| `/caixa/fluxo-de-caixa` | Caixa | Fluxo de Caixa |
| `/caixa/erp` | Caixa | ERP |

> Convenção de rotas: **kebab-case**, com **namespace por pilar** (`/<pilar>/<pagina>`). A página inicial vive na raiz `/`.

### 3.2 Propósito e cards de cada página de conteúdo

#### Pilar 1 — Founder

**`/founder/objetivo` — Objetivo**
Propósito: definir para onde o founder quer levar o negócio e o que significa "dar certo". É a bússola pessoal do projeto.
Exemplos de cards:
- **Objetivo de 12 meses** — a meta principal do próximo ano.
- **Definição de sucesso** — o que precisa ser verdade para o founder considerar o negócio um sucesso.
- **Visão de longo prazo (3–5 anos)** — onde o negócio deveria estar no futuro.
- **Por que este negócio** — a motivação pessoal por trás da escolha.
- **Metas trimestrais** — desdobramento do objetivo anual em marcos.

**`/founder/estilo-de-vida` — Estilo de vida**
Propósito: alinhar o negócio à vida que o founder quer ter (renda desejada, horas de trabalho, liberdade). Evita construir um negócio que não cabe na vida.
Exemplos de cards:
- **Renda-alvo mensal** — quanto o founder precisa/quer retirar por mês.
- **Horas de trabalho desejadas** — carga semanal sustentável.
- **Limites e inegociáveis** — o que não abre mão (ex.: fins de semana livres).
- **Localização / modo de trabalho** — remoto, presencial, nômade.
- **Tolerância a risco** — quanto de incerteza e capital está disposto a arriscar.

#### Pilar 2 — Direção

**`/direcao/mapa-do-mercado` — Mapa do Mercado**
Propósito: enxergar o território onde o negócio vai atuar — quem já está lá, tendências e tamanho aproximado.
Exemplos de cards:
- **Concorrentes diretos** — quem já resolve o problema.
- **Alternativas / substitutos** — o que os clientes usam hoje (inclusive "não fazer nada").
- **Tendências do mercado** — movimentos que ajudam ou ameaçam.
- **Tamanho e segmentação** — nichos, faixas e potencial estimado.
- **Referências e inspirações** — negócios admirados dentro ou fora do setor.

**`/direcao/ima-de-problemas` — Ímã de Problemas**
Propósito: colecionar e priorizar os problemas reais e dores que o mercado sente — a matéria-prima de qualquer oferta.
Exemplos de cards:
- **Lista de dores** — problemas observados/relatados.
- **Dor prioritária** — o problema mais agudo e frequente.
- **Evidências / falas de clientes** — citações e sinais que comprovam a dor.
- **Gravidade x frequência** — matriz simples para priorizar.
- **Gatilhos** — o que faz a dor aparecer ou piorar.

**`/direcao/perfil-ideal-de-cliente` — Perfil Ideal de Cliente (ICP)**
Propósito: descrever com precisão quem é o cliente ideal, para direcionar mensagem, oferta e canais.
Exemplos de cards:
- **Perfil demográfico/firmográfico** — quem é (pessoa ou empresa).
- **Dores e desejos do ICP** — o que sente e o que busca.
- **Onde encontrá-lo** — canais e comunidades onde ele está.
- **Critérios de "bom cliente"** — quem vale a pena atender.
- **Anti-persona** — quem NÃO é cliente (para dizer não).

**`/direcao/tese-de-valor` — Tese de Valor**
Propósito: articular por que o negócio entrega valor único e por que o cliente escolheria você. É a hipótese central de posicionamento.
Exemplos de cards:
- **Proposta de valor** — a promessa central em uma frase.
- **Diferencial competitivo** — por que você e não o concorrente.
- **Ganhos para o cliente** — resultados concretos entregues.
- **Prova / credibilidade** — o que sustenta a promessa.
- **Riscos da tese** — o que precisa ser verdade para a tese se sustentar.

**`/direcao/oferta` — Oferta (planejada)**
Propósito: desenhar a oferta que materializa a tese de valor — o que se vende, como e por quanto (do ponto de vista estratégico).
Exemplos de cards:
- **O que está sendo vendido** — produto/serviço em uma frase.
- **Estrutura de preço** — modelo e faixa de preço planejados.
- **Entregáveis e escopo** — o que o cliente recebe.
- **Oferta irresistível** — bônus, garantias e ancoragem.
- **Canais de venda** — como a oferta chega ao cliente.

#### Pilar 3 — Validação

**`/validacao/oferta` — Oferta (validação)**
Propósito: registrar os testes reais da oferta no mercado e o que os resultados dizem. É a Oferta da Direção confrontada com a realidade.
Exemplos de cards:
- **Experimentos de oferta** — testes feitos (landing page, pré-venda, DM, etc.).
- **Resultados e métricas** — respostas, taxas de conversão, objeções.
- **Feedback qualitativo** — o que ouviram dos potenciais clientes.
- **Aprendizados / ajustes** — o que mudar na oferta.
- **Decisão: pivotar ou seguir** — conclusão do ciclo de validação.

**`/validacao/primeiros-clientes` — Primeiros clientes**
Propósito: acompanhar as primeiras pessoas reais que compraram ou demonstraram intenção — os primeiros sinais de tração.
Exemplos de cards:
- **Lista de leads/prospects** — nomes e status de contato.
- **Primeiras vendas** — quem comprou, quanto e quando.
- **Depoimentos / casos** — provas sociais iniciais.
- **Objeções mais comuns** — o que trava a compra.
- **Canais que funcionaram** — de onde vieram os primeiros clientes.

#### Pilar 4 — Caixa

**`/caixa/fluxo-de-caixa` — Fluxo de Caixa**
Propósito: dar visibilidade do dinheiro entrando e saindo e de quanto tempo o negócio tem para sobreviver.
Exemplos de cards:
- **Entradas** — receitas e fontes de entrada de caixa.
- **Saídas** — custos e despesas fixas e variáveis.
- **Saldo atual** — quanto há em caixa hoje.
- **Runway** — por quantos meses o caixa dura no ritmo atual.
- **Ponto de equilíbrio** — quanto precisa faturar para não ter prejuízo.

**`/caixa/erp` — ERP**
Propósito: reunir a "papelada" e os cadastros operacionais do negócio — a base administrativa mínima.
Exemplos de cards:
- **Cadastro do negócio** — CNPJ/MEI, razão social, regime tributário.
- **Ferramentas e assinaturas** — softwares contratados e custos.
- **Contas e acessos** — bancos, gateways, contas essenciais (referências, sem senhas).
- **Fornecedores** — parceiros e prestadores.
- **Obrigações e prazos** — impostos, notas, datas importantes.

---

## 4. Página de Visão Geral (`/`)

A rota `/` é o **dashboard** e o ponto de entrada do app. Ela responde: "como está meu negócio hoje e por onde continuo?".

Deve mostrar:

- **Resumo dos 4 pilares** — um bloco/card por pilar (Founder, Direção, Validação, Caixa) com nome e uma breve descrição.
- **Status de preenchimento** — por pilar e/ou por página, um indicador visual de progresso (ex.: "3 de 5 cards preenchidos", barra ou contagem por status). Ajuda o founder a ver onde há lacunas.
- **Atalhos** — links diretos para as 12 páginas de conteúdo, agrupados por pilar, para acesso rápido.
- **Continue de onde parou** (desejável) — atalho para os cards atualizados mais recentemente.
- **Chamada para ação de estado inicial** — quando quase nada foi preenchido, orientar o founder a começar pelo pilar Founder.

---

## 5. O Sistema de Cards (requisito central)

O **Card** é a unidade fundamental do BusinessOS. Cada card corresponde a **um arquivo Markdown** em `/content/<pilar>/<pagina>/*.md` e aparece na UI como um cartão editável.

### 5.1 Campos de um card

| Campo | Origem | Descrição |
|---|---|---|
| `id` | frontmatter | Identificador único do card. |
| `pillar` | frontmatter | `founder` \| `direcao` \| `validacao` \| `caixa`. |
| `page` | frontmatter | Slug da página (ex.: `objetivo`). |
| `title` | frontmatter · editável | Título exibido no cabeçalho do card. |
| `status` | frontmatter · editável | Estado do card (ver 5.2). |
| `tags` | frontmatter · editável | Lista de rótulos livres `[]`. |
| `order` | frontmatter | Número para ordenação dos cards na página. |
| `updated` | frontmatter · automático | Data da última atualização `YYYY-MM-DD`. |
| **corpo** | corpo do MD · editável | Conteúdo em Markdown escrito pelo founder. |

Cada card é, ao mesmo tempo, **campos editáveis na UI** (título, status, tags, corpo) e um **chunk de contexto legível por IA**.

### 5.2 Estados de status

| Status | Rótulo | Significado |
|---|---|---|
| `empty` | Vazio | Card criado mas sem conteúdo relevante. |
| `draft` | Rascunho | Primeira versão, ideias soltas. |
| `in-progress` | Em andamento | Sendo trabalhado ativamente. |
| `review` | Revisão | Pronto para uma revisão/segunda leitura. |
| `done` | Feito | Maduro e considerado concluído. |

O status é exibido no card (ex.: badge) e é filtrável/contável na visão geral.

### 5.3 Estado vazio (empty state) de uma página

Quando uma página **não tem nenhum card**, ela deve exibir um empty state claro, não uma tela em branco:

- Um título e uma frase explicando o **propósito da página**.
- **Sugestões de cards** típicos daquela página (ver seção 3.2) como ponto de partida.
- Um **botão primário "Criar card"** em destaque, centralizado com bastante espaço em branco.

### 5.4 Fluxos de criar / editar / salvar

**Criar card**
1. Founder clica em **"Criar card"** (no header da página ou no empty state).
2. Um novo card é criado com `status: empty`, `title` provisório, corpo vazio e `updated` = data atual.
3. O card aparece imediatamente na visualização atual (Grade ou Lista) e entra em modo de edição.

**Editar card**
1. Founder edita **título**, **status**, **tags** e **corpo (Markdown)** diretamente na UI.
2. As alterações são refletidas na interface.

**Salvar card**
1. Ao salvar, os campos editáveis são gravados no arquivo MD (frontmatter + corpo) e `updated` é atualizado para a data atual.
2. No MVP, a persistência é simplificada (ver seção 8).

---

## 6. Alternância de visualização — Grade vs Lista

Cada página de conteúdo oferece **duas visualizações** dos seus cards, alternadas por um controle **Select**:

- **Grade (Grid)** — cards dispostos em colunas responsivas; boa para varredura visual.
- **Lista (List)** — cards empilhados em largura total; boa para leitura sequencial e densidade de informação.

Comportamento:

- O controle **Select** fica no **header da página**, ao lado do botão "Criar card", alinhado à direita.
- A opção padrão é **Grade**.
- Alternar a opção re-renderiza os mesmos cards no novo layout, sem recarregar a página nem perder dados.
- (Desejável) A preferência pode ser lembrada durante a sessão.

---

## 7. Navegação / Sidebar

- **Sidebar fixa à esquerda**, agrupada pelos **4 pilares** (Founder, Direção, Validação, Caixa), cada um com suas páginas como itens de navegação.
- Um item/atalho para a **Visão geral** (`/`) no topo.
- **Item ativo**: a página atual fica destacada (fundo/realce), refletindo a rota.
- **Hover**: itens têm hover com mudança de background e **cantos arredondados**.
- **Agrupamento visual**: cada pilar é um grupo com seu rótulo; os itens ficam recuados/agrupados sob o pilar.
- **Responsivo (básico)**: em telas largas a sidebar é sempre visível; em telas estreitas ela colapsa em um menu acionável (ex.: ícone/hambúrguer) que abre a navegação, mantendo o conteúdo principal utilizável.

---

## 8. Edição e persistência no MVP

- A **fonte de conteúdo** são arquivos Markdown em `/content/<pilar>/<pagina>/*.md`, com frontmatter YAML + corpo.
- A UI **lê** esses arquivos para renderizar cards e **grava** as edições de volta no arquivo MD correspondente (frontmatter + corpo), atualizando `updated`.
- **Sem banco de dados** e **sem login** no MVP: o app é **single-user** e trabalha diretamente sobre os arquivos.

O que é **stub / simplificado no MVP**:

- **Persistência**: gravação direta em arquivo (sistema de arquivos), sem camada de banco de dados; sem histórico de versões, sem undo/redo, sem sincronização em nuvem.
- **Concorrência**: assume um único usuário e uma única sessão; sem controle de edição simultânea.
- **Supabase**: previsto na arquitetura para fase futura, **não ativo** no MVP.
- **IDs e ordenação**: geração simples; reordenação pode ser básica/manual.
- **Autosave**: pode ser salvar explícito (botão) no MVP, com autosave como melhoria futura.

---

## 9. Requisito de contexto para IA

- A pasta `/content` **é o repositório de contexto compartilhado** entre o founder e futuros agentes/skills. O mesmo arquivo que o founder edita na UI é o que a IA lê.
- O **frontmatter YAML** (id, pillar, page, title, status, tags, order, updated) fornece **metadados estruturados** que permitem à IA filtrar, priorizar e localizar contexto (ex.: só cards `done` do pilar `direcao`).
- O **corpo em Markdown** é o conteúdo legível, já em formato amigável a modelos de linguagem — cada card é um **chunk de contexto** coeso.
- **Export de contexto** (previsto): uma capacidade de consolidar o conteúdo (por pilar, por página ou completo) em um pacote/arquivo de contexto que possa ser fornecido a um agente/skill. No MVP isso é apenas **intenção de arquitetura** — a estrutura de arquivos já é desenhada para viabilizá-lo, mas o agente ao vivo não é construído.

---

## 10. Requisitos funcionais

| ID | Requisito |
|---|---|
| **RF-01** | O app deve ter uma **página inicial** em `/` (Visão geral) com resumo dos 4 pilares, status de preenchimento e atalhos para as 12 páginas. |
| **RF-02** | O app deve prover as **12 rotas de conteúdo** em kebab-case com namespace por pilar, exatamente como especificado. |
| **RF-03** | Cada página de conteúdo deve **listar seus cards** lidos de `/content/<pilar>/<pagina>/*.md`. |
| **RF-04** | O usuário deve poder **criar** um novo card em qualquer página de conteúdo. |
| **RF-05** | O usuário deve poder **editar** título, status, tags e corpo (Markdown) de um card. |
| **RF-06** | O usuário deve poder **salvar** um card, persistindo frontmatter + corpo no arquivo MD e atualizando `updated`. |
| **RF-07** | Cada card deve exibir seu **status** com um dos cinco estados (`empty`, `draft`, `in-progress`, `review`, `done`). |
| **RF-08** | Cada página deve ter um **empty state** com propósito da página, sugestões de cards e ação de criar. |
| **RF-09** | Cada página deve permitir **alternar entre Grade e Lista** via controle Select no header, com Grade como padrão. |
| **RF-10** | A **sidebar** deve agrupar a navegação pelos 4 pilares, destacar o item ativo e ter hover arredondado. |
| **RF-11** | O conteúdo deve ser armazenado como **Markdown + frontmatter YAML** com os campos definidos (id, pillar, page, title, status, tags, order, updated). |
| **RF-12** | A **Visão geral** deve refletir o status de preenchimento por pilar/página com base nos cards existentes. |
| **RF-13** | A navegação deve ter **comportamento responsivo básico** (sidebar colapsável em telas estreitas). |
| **RF-14** | A estrutura de conteúdo deve ser **legível por IA** (frontmatter + corpo) para servir de contexto compartilhado. |
| **RF-15** | O app deve manter o campo `order` para **ordenar cards** dentro de uma página. |

---

## 11. Requisitos não-funcionais

- **RNF-01 · Design** — Visual **minimalista preto e branco**, fonte **Inter**, **cantos arredondados**, cards no lugar de tabelas, muito **espaço em branco**. Sidebar agrupada com hover de background e itens arredondados.
- **RNF-02 · Consistência de UI** — Componentes baseados em **shadcn/ui** e documentados no **Storybook**; padrões visuais consistentes entre páginas.
- **RNF-03 · Performance** — Carregamento rápido das páginas de conteúdo; renderização eficiente das listas de cards mesmo com dezenas de cards por página.
- **RNF-04 · Acessibilidade básica** — Contraste adequado (P&B ajuda), navegação por teclado nos controles principais (criar, editar, alternar visualização, navegar), rótulos/aria nos controles interativos e foco visível.
- **RNF-05 · Responsividade** — Layout utilizável em desktop e em telas estreitas; grade de cards responsiva e sidebar colapsável.
- **RNF-06 · Manutenibilidade** — Stack **Next.js (App Router) + TypeScript + Tailwind**; código tipado e organizado por pilar/página.
- **RNF-07 · Portabilidade de conteúdo** — Conteúdo em arquivos Markdown legíveis e versionáveis, independentes de banco de dados, facilitando backup e futura migração (Supabase).
- **RNF-08 · Deploy** — Implantável na **Vercel**.

---

## 12. Fora de escopo do MVP

- **Autenticação / login** e contas de usuário.
- **Banco de dados / Supabase ativo** (previsto apenas para fase futura).
- **Agentes de IA ao vivo** operando dentro do app (a integração é intenção de arquitetura, não funcionalidade construída).
- **Multiusuário / colaboração** (o app é single-user).
- Histórico de versões, undo/redo, sincronização em nuvem e edição concorrente.
- Permissões, compartilhamento e controles de acesso.

---

## 13. Critérios de aceite do MVP

- **CA-01** — Existem as 12 rotas de conteúdo especificadas mais a `/`, todas navegáveis pela sidebar.
- **CA-02** — A `/` mostra os 4 pilares, um indicador de status de preenchimento e atalhos que levam às páginas corretas.
- **CA-03** — Em qualquer página de conteúdo é possível **criar um card**, que aparece imediatamente na lista.
- **CA-04** — É possível **editar** título, status, tags e corpo de um card e **salvar**, refletindo no arquivo MD (frontmatter + corpo) e atualizando `updated`.
- **CA-05** — Um card exibe corretamente um dos cinco status, e o status escolhido é persistido.
- **CA-06** — Uma página sem cards mostra o **empty state** com propósito, sugestões e botão de criar.
- **CA-07** — O controle **Select** alterna entre **Grade** e **Lista** sem perder dados, com Grade como padrão.
- **CA-08** — A sidebar destaca o **item ativo**, agrupa por pilar e aplica hover arredondado.
- **CA-09** — O conteúdo lido/gravado está em **Markdown + frontmatter YAML** com todos os campos definidos.
- **CA-10** — O visual segue o padrão **minimalista P&B com Inter, cantos arredondados e bastante espaço em branco**.
- **CA-11** — A aplicação é **responsiva** o suficiente para uso em telas estreitas (sidebar colapsa) e faz **deploy na Vercel**.
- **CA-12** — Não há login, banco de dados ativo nem agentes ao vivo — o MVP é single-user sobre arquivos.

---

*Fim do PRD — BusinessOS v1.0 (MVP).*
