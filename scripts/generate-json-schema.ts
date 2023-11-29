import fs from "node:fs";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { RuleListSchema } from "../schema.ts";

const schema = zodToJsonSchema(RuleListSchema);
const schemaJsonString = JSON.stringify(schema, null, 2);

const schemaPath = path.resolve(__dirname, "../schema.json");

fs.writeFileSync(schemaPath, schemaJsonString);
