import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { RuleSchema } from "../schema.ts";

const rules = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../rules.yaml"), "utf8"),
);

function checkSchema() {
  rules.forEach((rule: any) => {
    RuleSchema.parse(rule);
  });
}

function checkIdDoesNotExist() {
  rules.forEach((rule: any) => {
    if ("id" in rule) {
      throw new Error(`ID in rule: ${rule.id}`);
    }
  });

  const operations = rules.flatMap((rule: any) => rule.operations);
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
