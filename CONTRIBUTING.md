# Contributing

## Development

```bash
npm ci
npm run dev
```

## Before submitting

```bash
npx playwright install chromium
npm run check
npm run test:e2e
npm run pack:smoke
```

## Change guidelines

- Preserve the behavior that the same seed and options produce the same SVG.
- When adding an option, update the types, input validation, tests, and README options table together.
- User-provided text must pass the existing XML validation and escaping.
- Check keyboard navigation and mobile layouts in the playground.

Describe the scope of your changes and the tests you ran in your PR. If behavior changes, update the tests and documentation as well.
