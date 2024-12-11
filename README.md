## 🪿 HONC
[Weaviate](https://weaviate.io/) meets [HONC](https://honc.dev)

This project was created using the `create-honc-app D1 template`. However, the current example does not yet store anything in the database (Work in Progress).

The application integrates Weaviate with a vector model containing a book vector database. It leverages the [Weaviate TypeScript client](https://weaviate.io/developers/weaviate/client-libraries/typescript/typescript-v2) for semantic search, providing results based on specific topics input by the user.


*Side note:* The project uses the Weaviate client library v2 due to the Cloudflare integration. The Weaviate client v3 depends on the gRPC protocol, which requires HTTP/2, a feature not supported by Cloudflare. This issue is already documented in an. There is already an [open issue on the Weaviate client (v3) library](https://github.com/weaviate/typescript-client/issues/145) descriping this problem

## Getting started
In order to run the application you need to provide your Weaviate credentials. 
Create a `dev.vars` file at the root of the proejct and include the `WCD_URL_DEMO` and the `WCD_KEY_DEMO`. 
You can get your Weaviate URL to your model and the [API key](https://weaviate.io/developers/weaviate/connections/connect-cloud) in the Weaviate Dashboard.


### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── .dev.vars.example # Example .dev.vars file
├── .prod.vars.example # Example .prod.vars file
├── drizzle.config.ts # Drizzle configuration
├── package.json
├── tsconfig.json # TypeScript configuration
└── wrangler.toml # Cloudflare Workers configuration
```


### Commands for local development

Run the development server:

```sh
npm run dev
```

Spin up Fiberplane next to the application to start sending requests

```sh
npm run fiberplane
```

### Adding D1 as a database

[D1](https://developers.cloudflare.com/d1/) is Cloudflare's serverless SQL database. Running HONC with a D1 database involves two key steps: first, setting up the project locally, and second, deploying it in production. You can spin up your D1 database locally using Wrangler. If you're planning to deploy your application for production use, ensure that you have created a D1 instance in your Cloudflare account.

As you iterate on the database schema, you'll need to generate a new migration file and apply it like so:

```sh
npm run db:generate
npm run db:migrate
```

## Commands for deployment

Before deploying your worker to Cloudflare, ensure that you have a running D1 instance on Cloudflare to connect your worker to.

You can create a D1 instance by navigating to the `Workers & Pages` section and selecting `D1 SQL Database.`

Alternatively, you can create a D1 instance using the CLI:

```sh
npx wrangler d1 create <database-name>
```

After creating the database, update the `wrangler.toml` file with the database id.

```toml
[[d1_databases]]
binding = "DB"
database_name = "honc-d1-database"
database_id = "<database-id-you-just-created>"
migrations_dir = "drizzle/migrations"
```

Include the following information in a `.prod.vars` file:

```sh
CLOUDFLARE_D1_TOKEN="" # An API token with D1 edit permissions. You can create API tokens from your Cloudflare profile
CLOUDFLARE_ACCOUNT_ID="" # Find your Account id on the Workers & Pages overview (upper right)
CLOUDFLARE_DATABASE_ID="" # Find the database ID under workers & pages under D1 SQL Database and by selecting the created database
```

If you haven’t generated the latest migration files yet, run:
```shell
npm run db:generate
```

Afterwards, run the migration script for production:
```shell
npm run db:migrate:prod
```

Change the name of the project in `wrangler.toml` to something appropriate for your project:

```toml
name = "my-d1-project"
```

Finally, deploy your worker

```shell 
npm run deploy
```


