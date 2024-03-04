import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { RuleList, RuleListSchema } from "../schema.ts";

const list = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../rules.yaml"), "utf8"),
) as RuleList;

function checkSchema() {
  RuleListSchema.parse(list);
}

function checkIdDoesNotExist() {
  list.rules.forEach((rule: any) => {
    if ("id" in rule) {
      throw new Error(`ID in rule: ${rule.id}`);
    }
  });

  const operations = list.rules.flatMap((rule: any) => rule.operations);
  operations.forEach((operation: any) => {
    if ("id" in operation) {
      throw new Error(`ID in operation: ${operation.id}`);
    }
  });
}

try {
  checkSchema();
  checkIdDoesNotExist();

  console.log("All rules are valid");
} catch (error) {
  console.error(error);
  process.exit(1);
}
