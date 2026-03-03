# Semantic Versioning Policy

Use `MAJOR.MINOR.PATCH`.

- `PATCH`: bug fixes and non-breaking performance changes.
- `MINOR`: backward-compatible features.
- `MAJOR`: breaking API changes.

## Release checklist
1. Run `npm run check`.
2. Bump version: `npm version patch|minor|major`.
3. Push tags: `git push --follow-tags`.
4. Publish: `npm publish --access public`.

Or use the GitHub `Release` workflow (manual trigger).
