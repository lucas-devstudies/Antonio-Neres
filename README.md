# Relatório de Atividades — DB-03: Banco de Dados e Autenticação

Foi realizada a configuração do ambiente de backend do projeto, incluindo PostgreSQL via Docker, Prisma ORM e a estrutura inicial de autenticação com Better Auth.

## 1. Instalação das dependências

Foram instaladas as dependências necessárias para integração entre Prisma, PostgreSQL e Better Auth:

```bash
npm install
npm install @better-auth/prisma-adapter
npm install @prisma/adapter-pg pg
npm install -D tsx
```

O `tsx` foi incluído para permitir a execução do script `create-admin.ts` diretamente pelo ambiente Node.js.

## 2. Configuração do PostgreSQL

Como o banco deveria funcionar localmente sem depender de uma instalação do PostgreSQL na máquina, foi utilizado Docker.

```bash
docker run --name antonio-neres-db -e POSTGRES_USER=antonio_neres_app -e POSTGRES_PASSWORD=antonio_neres_dev -e POSTGRES_DB=antonio_neres -p 5432:5432 -d postgres:17
```

A execução do container foi verificada com:

```bash
docker ps
```

O acesso ao banco também foi testado diretamente pelo PostgreSQL:

```bash
docker exec -it antonio-neres-db psql -U antonio_neres_app -d antonio_neres
```

## 3. Configuração do Prisma

O `DATABASE_URL` foi configurado no `.env` para utilizar o PostgreSQL executado pelo Docker.

O Prisma foi validado com:

```bash
npx prisma validate
```

Após a migration, o Prisma Client foi gerado:

```bash
npx prisma generate
```



## 4. Configuração do acesso ao banco

Foi criado o cliente Prisma em `src/lib/prisma.ts`, utilizando o `PrismaPg` para conexão com o PostgreSQL.

A configuração permite que as operações do backend utilizem o banco através do Prisma, mantendo o acesso ao PostgreSQL centralizado.

## 5. Configuração do Better Auth

Foi criado o arquivo `src/lib/auth/index.ts`, configurando o Better Auth para utilizar o Prisma como adapter e habilitando autenticação por e-mail e senha.

Também foi configurada uma chave `BETTER_AUTH_SECRET` no `.env`, utilizada pelo Better Auth para os mecanismos internos de autenticação.

O comando abaixo foi utilizado para verificar a estrutura esperada pelo Better Auth:

```bash
npx auth@latest generate
```

A geração automática do schema foi interrompida para evitar sobrescrever a estrutura existente antes de definir a relação entre `Administrator` e os modelos de autenticação do Better Auth.

## 6. Cadastro do administrador

Foi utilizado o `tsx` para executar o script responsável pelo cadastro de um administrador inicial:

```bash
npx tsx create-admin.ts
```

O cadastro foi realizado através do fluxo de autenticação do Better Auth, permitindo que o tratamento da senha fique sob responsabilidade da biblioteca, em vez de inserir a senha diretamente no banco.

## 7. Verificação do banco

Para consultar as tabelas existentes:

```bash
docker exec -it antonio-neres-db psql -U antonio_neres_app -d antonio_neres
```

Dentro do PostgreSQL:

após a criação das tabelas de autenticação do Better Auth:

```sql
SELECT * FROM user;
```

Com isso, foi estabelecido o ambiente local de banco de dados, a integração com Prisma e a base necessária para autenticação e cadastro de administradores.

## 8. Compilar Node

No terminal:

```bash
npm run dev
```

## 9. Conectar em link público

Em um novo terminal, com node em execução:

```bash
ngrok http 3000
```

Abrir no link público:

```bash
https://carried-specked-navy.ngrok-free.dev/
```
