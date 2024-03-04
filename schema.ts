import { z } from "zod";

// Match rule
const matchRuleSharedSchema = z.object({
  type: z.string(),
});

/**
 * Match rule for regex ignoring the protocol
 */
const regexMatchRuleSchema = matchRuleSharedSchema.extend({
  type: z.literal("regex"),
  content: z.string(),
});

/**
 * Match rule ignoring case and protocol
 * e.g. `example.com` will match `http://exAmple.com`, `https://example.com`, and `https://www.example.com`
 *      `example.com/path` will match `http://example.com/path`, `https://example.com/path`,
 *                                    `https://www.example.com/path`, `https://www.example.com/path/`, and
 *                                    `https://www.example.com/path/b`
 */
const containsMatchRuleSchema = matchRuleSharedSchema.extend({
  type: z.literal("contains"),
  content: z.string(),
});

/**
 * Match rule ignoring case and protocol
 * e.g. `example.com` will match `http://exAmple.com`, `https://example.com`, and `https://www.example.com`
 *      `example.com/path` will match `http://example.com/path`, `https://example.com/path`,
 *                                    `https://www.example.com/path`, `https://www.example.com/path/`, and
 *                                    `https://www.example.com/path/b`
 */
const startsWithMatchRuleSchema = matchRuleSharedSchema.extend({
  type: z.literal("starts-with"),
  content: z.string(),
});

/**
 * Match rule for domain name including subdomains
 * e.g. `example.com` will match `http://example.com`, `https://example.com`, and `https://www.example.com`
 */
const domainMatchRuleSchema = matchRuleSharedSchema.extend({
  type: z.literal("domain"),
  content: z.string(),
});

/**
 * Match everything, can only be used as the last rule
 */
const allMatchRuleSchema = matchRuleSharedSchema.extend({
  type: z.literal("all"),
});

export const matchRuleSchema = z.union([
  regexMatchRuleSchema,
  containsMatchRuleSchema,
  startsWithMatchRuleSchema,
  domainMatchRuleSchema,
  allMatchRuleSchema,
]);
export type MatchRule = z.infer<typeof matchRuleSchema>;

// Operation
const OperationSharedSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string(),
});

const StripParamsOperationModeListSchema = z.object({
  type: z.enum(["allowlist", "blocklist"]),
  list: z.array(z.string()),
});
const StripParamsOperationModeAllSchema = z.object({
  type: z.literal("all"),
});
const StripParamsOperationModeSchema = z.union([
  StripParamsOperationModeListSchema,
  StripParamsOperationModeAllSchema,
]);
const StripParamsOperationSchema = OperationSharedSchema.extend({
  type: z.literal("strip-params"),
  mode: StripParamsOperationModeSchema,
});

const ResolveOperationSchema = OperationSharedSchema.extend({
  type: z.literal("resolve"),
});

/**
 * Rerun all rules besides the current one with the current URL
 */
const RematchOperationSchema = OperationSharedSchema.extend({
  type: z.literal("rematch"),
});

/**
 * Extract a parameter from the URL
 * e.g. `dest` will extract `https://example.com/path?dest=https%3A%2F%2Fexample.com%2Fpath%2Fb` to
 *     `https://example.com/path/b`
 */
const ExtractParamsOperationSchema = OperationSharedSchema.extend({
  type: z.literal("extract-param"),
  param: z.string(),
});

export const operationSchema = z.union([
  StripParamsOperationSchema,
  ResolveOperationSchema,
  RematchOperationSchema,
  ExtractParamsOperationSchema,
]);
export type Operation = z.infer<typeof operationSchema>;

// Rule
export const RuleSchema = z.object({
  disabled: z.boolean().optional(),
  id: z.string().uuid().optional(),
  name: z.string(),
  matcher: matchRuleSchema,
  operations: z.array(operationSchema),
  notes: z.string().optional(),
});
export type Rule = z.infer<typeof RuleSchema>;

// Rule list
export const RuleListSchema = z.object({
  version: z.literal("1"),
  rules: z.array(RuleSchema),
});
export type RuleList = z.infer<typeof RuleListSchema>;

const sampleRule1: Rule = {
  id: "7db222e8-76a7-42ac-978d-05af9b76fb8c",
  name: "Sample Rule 1",
  matcher: {
    type: "contains",
    content: "example.com",
  },
  operations: [
    {
      id: "11f0b9db-0e7e-4519-9307-f563b2d7b4d4",
      type: "resolve",
    },
    {
      id: "95ba30eb-1d0d-4959-bb1c-786db1adc761",
      type: "strip-params",
      mode: {
        type: "blocklist",
        list: ["utm_source", "utm_medium", "utm_campaign"],
      },
    },
  ],
  notes: "This is a sample rule",
};

const sampleRule2: Rule = {
  id: "3d7dde67-8f48-4983-b00a-aaf405924d1e",
  name: "Sample Rule 2",
  matcher: {
    type: "regex",
    content: "/^https?:\\/\\/example\\.com\\//i",
  },
  operations: [
    {
      id: "ef96155e-7fd3-4a15-b871-4e5fa8b83143",
      type: "resolve",
    },
  ],
  notes: "This is another sample rule",
};
