# Relatório de Atividades — DB-03: Banco de Dados, Autenticação e API de Tickets

**Projeto:** Antonio Neres  
**Área:** Backend — Banco de Dados, Autenticação e API REST  
**Tecnologias:** Next.js, PostgreSQL, Docker, Prisma ORM e Better Auth  
**Atualização:** 19/11/2026

## 1. Objetivo

Foi realizada a configuração do ambiente de backend do projeto Antonio Neres, incluindo PostgreSQL via Docker, Prisma ORM e autenticação administrativa com Better Auth.

Posteriormente, foram implementadas as operações de cadastro, consulta, edição, movimentação e exclusão lógica de tickets, destinadas à integração com o painel administrativo Kanban.

O fluxo de pagamento anteriormente integrado ao Mercado Pago foi descontinuado. Atualmente, o formulário público realiza o cadastro diretamente no banco de dados, sem depender de checkout ou confirmação de pagamento.

## 2. Instalação das dependências

Foram utilizadas as dependências necessárias para a integração entre Prisma, PostgreSQL e Better Auth:

```bash
npm install
npm install @better-auth/prisma-adapter
npm install @prisma/adapter-pg pg
npm install -D tsx
```

O `tsx` foi incluído para permitir a execução do script `create-admin.ts` diretamente pelo ambiente Node.js.

## 3. Configuração do PostgreSQL

Para disponibilizar o banco de dados localmente, sem exigir a instalação direta do PostgreSQL no sistema operacional, foi utilizado Docker.

Criação do container:

```bash
docker run --name antonio-neres-db -e POSTGRES_USER=antonio_neres_app -e POSTGRES_PASSWORD=antonio_neres_dev -e POSTGRES_DB=antonio_neres -p 5432:5432 -d postgres:17
```

Verificação dos containers:

```bash
docker ps
```

Inicialização de um container já existente:

```bash
docker start antonio-neres-db
```

Acesso ao PostgreSQL:

```bash
docker exec -it antonio-neres-db psql -U antonio_neres_app -d antonio_neres
```

**Observação:** as credenciais apresentadas são destinadas exclusivamente ao ambiente local de desenvolvimento.

## 4. Configuração do Prisma

A variável `DATABASE_URL` foi configurada no arquivo `.env`, permitindo a conexão com o PostgreSQL executado pelo Docker.

Foram utilizados os seguintes comandos:

**Validar o schema:**

```bash
npx prisma validate
```

**Formatar o schema:**

```bash
npx prisma format
```

**Criar e aplicar uma migration:**

```bash
npx prisma migrate dev --name nome_da_migration
```

**Aplicar migrations pendentes:**

```bash
npx prisma migrate dev
```

**Verificar o histórico de migrations:**

```bash
npx prisma migrate status
```

**Gerar o Prisma Client:**

```bash
npx prisma generate
```

**Verificar erros de TypeScript:**

```bash
npx tsc --noEmit
```

As migrations passaram a controlar a evolução do banco, incluindo os modelos de autenticação, tickets e observações administrativas.

## 5. Configuração do acesso ao banco

Foi criado o cliente Prisma em:

`src/lib/prisma.ts`

A implementação utiliza `PrismaPg` para estabelecer a conexão com o PostgreSQL.

Essa configuração centraliza o acesso ao banco e permite que as rotas do Next.js realizem consultas e alterações utilizando o Prisma ORM.

## 6. Configuração do Better Auth

Foi criado o arquivo:

`src/lib/auth/index.ts`

O Better Auth foi configurado para utilizar o Prisma como adapter, com autenticação por e-mail e senha.

Também foi configurada a variável `BETTER_AUTH_SECRET` no ambiente, utilizada nos mecanismos internos de autenticação.

O comando utilizado para verificar a estrutura esperada pelo Better Auth foi:

```bash
npx auth@latest generate
```

A geração automática do schema foi interrompida para evitar alterações não planejadas na estrutura existente.

### Modelos de autenticação

| Modelo | Responsabilidade |
|---|---|
| `User` | Dados dos administradores |
| `Session` | Sessões autenticadas |
| `Account` | Credenciais e provedores de autenticação |
| `Verification` | Registros utilizados nos processos de verificação |

Atualmente, todos os usuários cadastrados em `User` são considerados administradores do sistema, não existindo diferenciação de permissões por cargo.

## 7. Cadastro do administrador

Foi utilizado o `tsx` para executar o script de criação do administrador inicial:

```bash
npx tsx create-admin.ts
```

O cadastro utiliza o fluxo de autenticação do Better Auth, mantendo o tratamento da senha sob responsabilidade da biblioteca.

Não é necessário inserir manualmente hashes de senha no PostgreSQL.

## 8. Estrutura do banco de dados

### 8.1. Modelo Ticket

O modelo `Ticket` armazena os dados enviados pelo formulário público e as informações necessárias ao gerenciamento pelo Kanban.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (UUID) | Identificador do ticket |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Última atualização |
| `updatedById` | String? | Administrador responsável pela última alteração |
| `city` | String | Cidade do cliente |
| `name` | String | Nome completo |
| `email` | String | E-mail |
| `address` | String | Endereço |
| `degree` | String | Escolaridade |
| `phone` | String | Telefone |
| `bundle` | String | Identificador do pacote |
| `amount` | Int | Valor do pacote em centavos |
| `motive` | String? | Motivo da inscrição |
| `indication` | String? | Indicação |
| `status` | TicketStatus | Coluna atual do Kanban |
| `position` | Int | Posição do ticket na coluna |
| `deleted` | Boolean | Indicador de exclusão lógica |
| `ticketNote` | TicketNote? | Observação administrativa associada |

### 8.2. Status dos tickets

O campo `status` utiliza o enum `TicketStatus`:

| Status | Significado |
|---|---|
| `TO_DO` | Ticket recebido, aguardando atendimento |
| `IN_PROGRESS` | Ticket em atendimento |
| `DONE` | Atendimento concluído |

O status padrão de novos tickets é `TO_DO`, conforme a migration mais recente.

### 8.3. Modelo TicketNote

O modelo `TicketNote` armazena a observação administrativa mais recente de cada ticket.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | String (UUID) | Identificador da observação |
| `ticketId` | String | Ticket associado, com restrição de unicidade |
| `comment` | String | Conteúdo da observação |
| `updatedById` | String? | Administrador responsável |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Última atualização |

Cada ticket possui, no máximo, uma observação armazenada.

Ao receber um novo comentário, o backend utiliza `upsert`, criando a observação quando inexistente ou substituindo o conteúdo anterior.

## 9. Catálogo de pacotes

Os pacotes foram centralizados no arquivo:

`src/lib/course-bundle.ts`

| Identificador | Nome | Valor | Centavos |
|---|---|---:|---:|
| `ONLINE` | Método AN On-line | R$ 299,00 | 29900 |
| `PRESENTIAL` | Método AN Presencial | R$ 599,00 | 59900 |
| `PRESENTIAL_PREMIUM` | Método AN Presencial Premium | R$ 899,00 | 89900 |

Os valores são armazenados como inteiros, representando centavos.

O frontend envia somente o identificador do pacote. O backend consulta o catálogo e determina o valor correspondente, impedindo que o cliente informe arbitrariamente o preço.

## 10. Endpoints implementados

### 10.1. Resumo das rotas

| Método | Endpoint | Autenticação | Operação |
|---|---|---|---|
| `POST` | `/api/tickets` | Pública | Criar ticket |
| `GET` | `/api/tickets` | Administrador | Listar tickets |
| `GET` | `/api/tickets/[id]` | Administrador | Consultar ticket |
| `PATCH` | `/api/tickets/[id]` | Administrador | Editar ticket e observação |
| `PATCH` | `/api/tickets/[id]/status` | Administrador | Movimentar ticket |
| `DELETE` | `/api/tickets/[id]` | Administrador | Excluir logicamente |

As rotas administrativas utilizam a sessão do Better Auth para verificar a autenticação do usuário.

### 10.2. POST /api/tickets

**Finalidade:** cadastrar um novo ticket a partir do formulário público.

**Campos recebidos:**

| Campo | Obrigatório |
|---|---|
| `city` | Sim |
| `name` | Sim |
| `email` | Sim |
| `address` | Sim |
| `degree` | Sim |
| `phone` | Sim |
| `bundle` | Sim |
| `motive` | Não |
| `indication` | Não |

**Campos definidos automaticamente:**

| Campo | Comportamento |
|---|---|
| `id` | UUID gerado pelo Prisma |
| `amount` | Preço consultado no catálogo |
| `status` | `TO_DO` |
| `position` | `0` |
| `deleted` | `false` |
| `createdAt` | Data de criação |
| `updatedAt` | Data de atualização |

**Resposta de sucesso:** HTTP `201 Created`.

O ticket é registrado diretamente no PostgreSQL, sem checkout ou webhook.

### 10.3. GET /api/tickets

**Finalidade:** recuperar os tickets disponíveis no Kanban.

**Campos consultados:**

`id`, `name`, `city`, `email`, `phone`, `bundle`, `amount`, `status`, `position`, `createdAt` e `updatedAt`.

**Regras:**

- Retorna apenas tickets com `deleted = false`.
- Ordena por `position` e, em caso de empate, por `createdAt`.
- Exige sessão administrativa.
- Não modifica registros.

**Resposta de sucesso:** HTTP `200 OK`.

### 10.4. GET /api/tickets/[id]

**Finalidade:** consultar os detalhes completos de um ticket.

**Parâmetro:** `id` — identificador UUID do ticket.

**Dados retornados:**

Todos os campos do ticket, incluindo os relacionamentos:

- `updatedBy`: administrador responsável pela última atualização.
- `ticketNote`: observação administrativa mais recente.
- `ticketNote.updatedBy`: administrador responsável pela observação.

**Regras:**

- Exige sessão administrativa.
- Não retorna tickets excluídos logicamente.
- Retorna HTTP `404` quando o ticket não é encontrado.

**Resposta de sucesso:** HTTP `200 OK`.

### 10.5. PATCH /api/tickets/[id]

**Finalidade:** atualizar dados do cliente e sua observação administrativa.

**Campos atualizáveis:**

| Campo | Descrição |
|---|---|
| `name` | Nome completo |
| `email` | E-mail |
| `phone` | Telefone |
| `city` | Cidade |
| `address` | Endereço |
| `degree` | Escolaridade |
| `motive` | Motivo da inscrição |
| `indication` | Indicação |
| `comment` | Observação administrativa |

Todos os campos são opcionais na requisição, mas pelo menos um campo editável deve ser informado.

Os campos pessoais obrigatórios não podem receber valores vazios.

Os campos `motive` e `indication` podem ser limpos.

O campo `comment`, quando informado, deve conter texto não vazio.

**Campos afetados automaticamente:**

- `Ticket.updatedById`: recebe o identificador do administrador autenticado.
- `Ticket.updatedAt`: atualizado pelo Prisma.
- `TicketNote.comment`: criado ou sobrescrito.
- `TicketNote.updatedById`: recebe o administrador responsável pela observação.
- `TicketNote.updatedAt`: atualizado quando a observação é modificada.

A observação utiliza `upsert`, preservando somente o comentário mais recente.

**Resposta de sucesso:** HTTP `200 OK`.

### 10.6. PATCH /api/tickets/[id]/status

**Finalidade:** movimentar tickets entre as colunas do Kanban ou reorganizar sua posição na coluna atual.

**Campos recebidos:**

| Campo | Tipo | Descrição |
|---|---|---|
| `status` | TicketStatus | Coluna de destino |
| `position` | Integer | Posição de destino, iniciando em zero |

**Exemplo:**

```json
{
  "status": "IN_PROGRESS",
  "position": 0
}
```

**Campos afetados:**

| Campo | Comportamento |
|---|---|
| `status` | Atualizado no ticket movimentado |
| `position` | Atualizado no ticket movimentado e nos demais tickets afetados |
| `updatedById` | Registra o administrador que realizou a movimentação |
| `updatedAt` | Atualizado nos registros modificados |

A operação utiliza uma transação do Prisma para garantir a consistência das posições.

Ao mover um ticket entre colunas, o backend reorganiza as posições das colunas de origem e destino.

A transação utiliza isolamento `Serializable`. Conflitos de serialização identificados pelo Prisma são tratados com HTTP `409 Conflict`.

**Resposta de sucesso:** HTTP `200 OK`.

### 10.7. DELETE /api/tickets/[id]

**Finalidade:** realizar a exclusão lógica de um ticket.

**Parâmetro:** `id` — identificador UUID do ticket.

**Campos afetados:**

| Campo | Comportamento |
|---|---|
| `deleted` | Alterado para `true` |
| `updatedById` | Registra o administrador responsável |
| `updatedAt` | Atualizado pelo Prisma |
| `position` | Reorganizado nos tickets restantes da mesma coluna |

O ticket permanece armazenado no PostgreSQL, preservando seus dados.

Após a exclusão, os demais tickets da coluna são reorganizados sequencialmente, sem lacunas nas posições.

A operação é executada em uma transação com isolamento `Serializable`.

**Resposta de sucesso:** HTTP `200 OK`.

Uma nova tentativa de exclusão do mesmo ticket retorna HTTP `404`.

## 11. Tratamento de erros e autenticação

As rotas administrativas utilizam o Better Auth para validar a sessão do usuário.

Os principais códigos HTTP utilizados são:

| Código | Significado |
|---|---|
| `200` | Operação realizada com sucesso |
| `201` | Ticket criado |
| `400` | Dados inválidos |
| `401` | Usuário não autenticado |
| `404` | Ticket inexistente ou indisponível |
| `409` | Conflito de atualização concorrente |
| `500` | Erro interno do servidor |

As operações de movimentação e exclusão utilizam transações para evitar atualizações parcialmente aplicadas.

O tratamento avançado de concorrência entre administradores, incluindo tentativas automáticas e sincronização em tempo real, foi reservado para versões futuras.

## 12. Verificação do banco de dados

Acessar o PostgreSQL:

```bash
docker exec -it antonio-neres-db psql -U antonio_neres_app -d antonio_neres
```

Dentro do PostgreSQL, listar tabelas:

```sql
\dt
```

Consultar administradores:

```sql
SELECT id, name, email FROM "user";
```

Consultar tickets:

```sql
SELECT id, name, bundle, amount, status, position, deleted
FROM ticket
ORDER BY status, position;
```

Consultar tickets ativos:

```sql
SELECT id, name, status, position
FROM ticket
WHERE deleted = false
ORDER BY status, position;
```

Consultar tickets excluídos logicamente:

```sql
SELECT id, name, status, deleted
FROM ticket
WHERE deleted = true;
```

Consultar observações:

```sql
SELECT "ticketId", comment, "updatedById", "updatedAt"
FROM ticket_note;
```

## 13. Executar o projeto

Na pasta `frontend`:

```bash
npm install
npx prisma generate
npm run dev
```

O servidor local estará disponível, normalmente, em:

`http://localhost:3000`

Para verificar o TypeScript:

```bash
npx tsc --noEmit
```

Para verificar a compilação de produção:

```bash
npm run build
```

## 14. Disponibilizar acesso público para testes

Com o servidor Next.js em execução, abrir outro terminal e executar:

```bash
ngrok http 3000
```

O ngrok disponibiliza uma URL pública temporária para acessar a aplicação local.

Durante os testes anteriores, foi utilizado o endereço:

`https://carried-specked-navy.ngrok-free.dev/`

Esse endereço é apenas uma referência histórica e não deve ser considerado permanentemente ativo.

O acesso público depende da configuração do túnel e das origens permitidas pelo Next.js.

O ngrok não é necessário para o funcionamento local das APIs.

## 15. Alterações na integração de pagamentos

O fluxo anterior utilizava Mercado Pago Checkout Pro e notificações por webhook para criar tickets após a aprovação de pagamentos.

Esse comportamento foi substituído pelo cadastro direto.

**Fluxo anterior:**

Formulário → Checkout → Mercado Pago → Webhook → Ticket.

**Fluxo atual:**

Formulário → `POST /api/tickets` → PostgreSQL → Kanban.

As seguintes estruturas foram removidas ou deixaram de ser utilizadas no novo fluxo:

- Integração com o Mercado Pago.
- Endpoint de checkout.
- Endpoint de webhook.
- Modelo `CheckoutAttempt`.
- Campos `mercadoPagoId` e `payform` do modelo `Ticket`.

O campo `amount` permanece no banco, agora como inteiro representando centavos.

A limpeza definitiva de eventuais referências residuais, dependências e variáveis de ambiente deverá ser verificada antes da publicação.

## 16. Próximas etapas

As operações principais de tickets foram implementadas e testadas individualmente.

Permanecem previstas:

| Funcionalidade | Endpoint | Situação |
|---|---|---|
| Listagem de administradores | `GET /api/users` | Pendente |
| Administrador autenticado | `GET /api/users/me` | Pendente |
| Catálogo de pacotes | `GET /api/bundles` | Pendente |
| Consulta de pacote | `GET /api/bundles/[id]` | Pendente |
| Integração com o Kanban | Frontend + APIs | Pendente |
| Testes integrados e segurança | — | Pendente |
| CI/CD e publicação | — | Pendente |

## 17. Considerações finais

Foi estabelecida a infraestrutura de banco de dados e autenticação do Antonio Neres, juntamente com as principais operações necessárias ao gerenciamento administrativo dos tickets.

O backend permite cadastrar clientes, consultar registros, atualizar informações, registrar observações, movimentar tickets entre colunas e realizar exclusões lógicas.

A persistência é realizada pelo Prisma ORM no PostgreSQL, enquanto o Better Auth protege as operações administrativas.

Com a conclusão dessas funcionalidades, o projeto dispõe da base necessária para integrar o backend ao painel Kanban e avançar para os testes finais e a publicação.
