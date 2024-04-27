# Community Rules

This repository contains the LinkSanitizer rules created by the community.

Find the app at [LinkSanitizer](https://linksanitizer.com).

The rules here expect a catch all rule of

```yaml
matcher:
  type: "all"
operations:
  - type: "resolve"
    mode:
      type: "http"
  - type: "strip-params"
    mode:
      type: "all"
  - type: "rematch"
```

## Contributing

Add your rules to [`rules.yaml`](./rules.yaml). See [`schema.ts`](./schema.ts) for the schema.
