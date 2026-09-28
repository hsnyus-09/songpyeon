# Security Policy

## Reporting vulnerabilities

Privately contact the maintainers with reproduction steps and the scope of impact. If no private contact method is available, leave only the scope of impact and a way to contact you in a public issue. Do not disclose exploitable inputs or attack code publicly.

## SVG generation

Seed and label lengths and XML character validity are checked, and text inserted into the SVG is XML-escaped. Any new shape or text output path must also pass through the existing checks.

The library and playground do not use server-side storage, accounts, or analytics scripts.
