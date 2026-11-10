# Contributing

## Branching workflow

- `main` contains release-ready code.
- `develop` integrates completed changes before release.
- Create a focused branch from the latest `develop` for each feature, fix, or maintenance task.
- Open a pull request into `develop` and review its changes before merging.
- When the integrated work is ready for release, open a pull request from `develop` into `main`.

Use descriptive branch names, such as `feature/photo-stream`, `fix/photo-loading`, or `docs/project-setup`.

## Development

For behavior changes, use test-driven development where practical:

1. Write a test describing the expected behavior.
2. Run it and confirm that it fails for the expected reason.
3. Implement the smallest change that makes it pass.
4. Refactor while keeping the tests passing.

Keep changes focused, follow the project’s Angular and TypeScript conventions, and consider accessibility. Update documentation when setup or behavior changes.

Documentation-only changes should be reviewed for accuracy and formatting; they do not require new unit tests.

## Commits

Make small, focused commits with clear messages. Use Conventional Commit prefixes where appropriate:

- `feat: add photo stream`
- `fix: handle photo loading errors`
- `test: cover empty favorites`
- `docs: describe project setup`
- `chore: update development tooling`

## Pull requests

Describe what changed, why it changed, and how it was verified. Include screenshots for visible UI changes when useful.

Before merging application changes, run:

```bash
npm test -- --watch=false
npm run build
```

Review the diff and address any failures or feedback before merging.