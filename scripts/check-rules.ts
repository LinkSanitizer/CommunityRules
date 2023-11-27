import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { RuleSchema } from "../rule";

const rules = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../rules.yaml"), "utf8"),
);

function checkSchema() {
  rules.forEach((rule: any) => {
    RuleSchema.parse(rule);
  });
}

function checkId() {
  const ids = new Set<string>();
  rules.forEach((rule: any) => {
    if (ids.has(rule.id)) {
      throw new Error(`Duplicate ID in rule: ${rule.id}`);
    }
    ids.add(rule.id);
  });

  const operations = rules.flatMap((rule: any) => rule.operations);
  operations.forEach((operation: any) => {
    if (ids.has(operation.id)) {
      throw new Error(`Duplicate ID in operation: ${operation.id}`);
    }
    ids.add(operation.id);
  });
}

try {
  checkSchema();
  checkId();

  console.log("All rules are valid");
} catch (error) {
  console.error(error);
  process.exit(1);
}
