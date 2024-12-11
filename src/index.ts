import { instrument } from "@fiberplane/hono-otel";
import { drizzle } from "drizzle-orm/d1";
import type { NearTextType } from "../types";
import { Hono } from "hono";
import * as schema from "./db/schema";
import weaviate, { type WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { env } from "hono/adapter";

type Bindings = {
  DB: D1Database;
  WCD_KEY_DEMO: string;
  WCD_URL_DEMO: string;
  WCD_KEY_BOOK: string;
  WCD_URL_BOOK: string;
  OPENAI_API_KEY: string;

};


const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc from above! ☁️🪿");
});


app.post("/book-recommendation", async (c) => {
  // DemoCollection Cluster
const wcdUrl = c.env.WCD_URL_DEMO;
const wcdApiKey = c.env.WCD_KEY_DEMO;

// BookRecs Cluster
// const wcdUrl = c.env.WCD_URL_BOOK;
// const wcdApiKey = c.env.WCD_KEY_BOOK;


const { topic } = await c.req.json();

const headers: { [key: string]: string } = {};
//headers['X-OpenAI-Api-Key'] = c.env.OPENAI_API_KEY;
headers['X-Weaviate-Api-Key'] = wcdApiKey;
headers['Content-Type'] = "application/json";
headers['X-Weaviate-Cluster-Url'] = wcdUrl;
const client: WeaviateClient = weaviate.client({
  scheme: 'https',
  host: wcdUrl,
  apiKey: new ApiKey(wcdApiKey), //READONLY API Key, ensure the environment variable is an Admin key to support writing
  headers: headers,
});

const nearText: NearTextType = {
  concepts: [],
}

nearText.certainty = .6
nearText.concepts = topic;

const recDataBuilder = client.graphql
  .get()
  .withClassName('DemoCollection')
  .withFields(
    'title description'
  )
  .withNearText(nearText)
  .withLimit(3);

  const recData = await recDataBuilder.do();

console.log(recData);




return c.json(recData);


});



export default instrument(app);
