import { z } from "zod";

// Match rule
const matcherSharedSchema = z.object({
  type: z.string(),
});

/**
 * Match rule for regex ignoring the protocol
 */
const regexMatcherSchema = matcherSharedSchema.extend({
  type: z.literal("regex"),
  content: z.string(),
  caseSensitive: z.boolean().optional().default(false),
});

/**
 * Match rule ignoring case and protocol
 * e.g. `example.com` will match `http://exAmple.com`, `https://example.com`, and `https://www.example.com`
 *      `example.com/path` will match `http://example.com/path`, `https://example.com/path`,
 *                                    `https://www.example.com/path`, `https://www.example.com/path/`, and
 *                                    `https://www.example.com/path/b`
 */
const containsMatcherSchema = matcherSharedSchema.extend({
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
const startsWithMatcherSchema = matcherSharedSchema.extend({
  type: z.literal("starts-with"),
  content: z.string(),
});

/**
 * Match rule for domain name including subdomains
 * e.g. `example.com` will match `http://example.com`, `https://example.com`, and `https://www.example.com`
 */
const domainMatcherSchema = matcherSharedSchema.extend({
  type: z.literal("domain"),
  content: z.string(),
});

/**
 * Match everything, can only be used as the last rule
 */
const allMatcherSchema = matcherSharedSchema.extend({
  type: z.literal("all"),
});

interface AndMatcher {
  type: "and";
  matchers: Matcher[];
}
const andMatcherSchema: z.ZodType<AndMatcher> = matcherSharedSchema.extend({
  type: z.literal("and"),
  matchers: z.lazy(() => z.array(matcherSchema)),
});

interface OrMatcher {
  type: "or";
  matchers: Matcher[];
}
const orMatcherSchema: z.ZodType<OrMatcher> = matcherSharedSchema.extend({
  type: z.literal("or"),
  matchers: z.lazy(() => z.array(matcherSchema)),
});

interface NotMatcher {
  type: "not";
  matcher: Matcher;
}
const notMatcherSchema: z.ZodType<NotMatcher> = matcherSharedSchema.extend({
  type: z.literal("not"),
  matcher: z.lazy(() => matcherSchema),
});

export const matcherSchema = z.union([
  regexMatcherSchema,
  containsMatcherSchema,
  startsWithMatcherSchema,
  domainMatcherSchema,
  allMatcherSchema,

  andMatcherSchema,
  orMatcherSchema,
  notMatcherSchema,
]);
export type Matcher = z.input<typeof matcherSchema>;

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

const ResolveOperationModeHttpSchema = z.object({
  type: z.literal("http"),
});
const ResolveOperationModeBrowserSchema = z.object({
  type: z.literal("browser"),
  delayMillis: z.number().optional().default(1000),
});
const ResolveOperationModeSchema = z.union([
  ResolveOperationModeHttpSchema,
  ResolveOperationModeBrowserSchema,
]);
const ResolveOperationSchema = OperationSharedSchema.extend({
  type: z.literal("resolve"),
  mode: ResolveOperationModeSchema.default({ type: "http" }),
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
export type Operation = z.input<typeof operationSchema>;

// Rule
export const RuleSchema = z.object({
  disabled: z.boolean().optional(),
  id: z.string().uuid().optional(),
  name: z.string(),
  matcher: matcherSchema,
  operations: z.array(operationSchema),
  notes: z.string().optional(),
});
export type Rule = z.input<typeof RuleSchema>;

// Rule list
export const RuleListSchema = z.object({
  version: z.literal("1"),
  rules: z.array(RuleSchema),
});
export type RuleList = z.input<typeof RuleListSchema>;

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
      mode: {
        type: "browser",
      },
    },
  ],
  notes: "This is another sample rule",
};
