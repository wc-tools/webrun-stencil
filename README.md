# Webrun Stencil Component Testing Example

This project demonstrates how to integrate [webrun](https://github.com/@web-tools/webrun) with Stencil web components to create a comprehensive component testing setup with automatic Visual Regression Testing (VRT).

## Overview

This example showcases component testing for Stencil web components using Playwright with automatic VRT screenshot capture, shadow DOM testing patterns, and CI/CD integration for VRT baseline management.

The project contains Stencil web components in the `src/components/` directory (wc-button, wc-card, wc-input, wc-toggle), component tests in the `test/` directory, and VRT baseline snapshots stored in the `snaps/` directory (git-ignored). The Stencil build output is in `dist/` and Playwright configuration is in `playwright-ct.config.ts`.

## Configuration

### Playwright Configuration

The key configuration in `playwright-ct.config.ts`:

```typescript
export default withComponentTesting({
  port: 3333,
  staticDir: './dist',
  scripts: ['/webrun-stencil/webrun-stencil.esm.js'],
  initialWaitForElement: '.hydrated',  // Wait for Stencil hydration
  autoVrt: true,                       // Enable automatic VRT
})(defineConfig({
  testDir: './test',
  snapshotDir: './snaps',              // VRT snapshots location
  // ... other Playwright config
}));
```

### Key Settings

`autoVrt: true` automatically captures screenshots after every visual assertion. The `snapshotDir: './snaps'` setting stores all VRT baseline images in the snaps directory. The `initialWaitForElement: '.hydrated'` setting ensures Stencil components are fully hydrated before testing begins, and `staticDir: './dist'` points to Stencil's build output.

## Writing Tests

### Testing Components with Shadow DOM

Playwright's accessible selectors (getByRole, getByText, etc.) automatically pierce shadow DOM, making tests more readable and maintainable:

```typescript
import { test, expect } from 'webrun-testing';

test('should render button', async ({ render }) => {
  const { container } = await render(<wc-button variant="primary">Click Me</wc-button>);

  // Use accessible selectors - they pierce shadow DOM automatically
  const button = container.getByRole('button', { name: 'Click Me' });

  // Visual assertions automatically capture screenshots
  await expect(button).toBeVisible();
  await expect(button).toHaveClass(/button--primary/);
});
```

### Setting Properties Dynamically

```typescript
test('should update component properties', async ({ render }) => {
  const { container } = await render(<wc-card>Content</wc-card>);

  // Set properties programmatically
  await container.setProperty('imageUrl', 'https://example.com/image.png');
  await container.setProperty('imageAlt', 'Example image');

  const image = container.getByRole('img', { name: 'Example image' });
  await expect(image).toBeVisible();
});
```

### Testing Slots

```typescript
test('should render slotted content', async ({ render }) => {
  const { container } = await render(
    <wc-card>
      <div slot="footer">Footer content</div>
    </wc-card>
  );

  // Verify slotted content - accessible selectors work in both light and shadow DOM
  const footer = container.getByText('Footer content');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('Footer content');
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:watch

# Update VRT baselines
npm test -- --update-snapshots

# Run specific test file
npm test -- test/wc-button.spec.tsx
```

## Automatic Visual Regression Testing

When `autoVrt: true` is enabled, the test framework automatically captures screenshots after every visual assertion:

```typescript
// Each of these assertions generates a VRT snapshot
await expect(container).toBeVisible();               // → snapshot-1.png
await expect(button).toHaveClass(/button--primary/); // → snapshot-2.png
await expect(input).toBeDisabled();                  // → snapshot-3.png
```

Snapshots are saved to `snaps/[test-file]-snapshots/` and compared on subsequent test runs.

## CI/CD Integration with VRT

### Publishing VRT Baselines to npm Registry

VRT baselines are published to an npm registry with commit IDs, enabling automatic comparison with the exact commit where branches diverged.

#### GitHub Actions Example

```yaml
name: Component Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch full history for merge base detection

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'

      - name: Install dependencies
        run: npm ci

      - name: Build components
        run: npm run build

      # Download baseline snapshots for PR (compare with branch point)
      - name: Download VRT baselines
        if: github.event_name == 'pull_request'
        continue-on-error: true
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Find the commit where this branch diverged from main
          MERGE_BASE=$(git merge-base origin/main HEAD)
          echo "Merge base commit: $MERGE_BASE"

          # Download baseline package for that commit
          PACKAGE_NAME="@${{ github.repository_owner }}/vrt-baselines"
          VERSION="0.0.0-$MERGE_BASE"

          npm pack ${PACKAGE_NAME}@${VERSION} || echo "No baseline found for $MERGE_BASE"

          # Extract snapshots if package exists
          if [ -f *.tgz ]; then
            tar -xzf *.tgz --strip-components=2 package/snaps
            rm *.tgz
          fi

      - name: Run component tests
        id: tests
        continue-on-error: true
        run: npm test

      # Check if VRT approval label is present for new tests
      - name: Check VRT approval
        if: github.event_name == 'pull_request' && steps.tests.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            const labels = context.payload.pull_request.labels.map(l => l.name);
            const isVrtApproved = labels.includes('vrt-approved');

            if (!isVrtApproved) {
              core.setFailed('VRT tests failed. Please review snapshots and add "vrt-approved" label if changes are intentional.');
            } else {
              core.notice('VRT tests failed but "vrt-approved" label is present. Proceeding with manual approval.');
            }

      # Fail the workflow if tests failed on main branch
      - name: Fail on test failure (main branch)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main' && steps.tests.outcome == 'failure'
        run: exit 1

      # Publish snapshots to npm registry on main branch merges
      - name: Publish VRT baselines
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Create package.json for baselines
          cat > package.json <<EOF
          {
            "name": "@${{ github.repository_owner }}/vrt-baselines",
            "version": "0.0.0-${{ github.sha }}",
            "description": "VRT baselines for commit ${{ github.sha }}",
            "private": false
          }
          EOF

          # Publish baselines to registry
          npm publish

      # Upload test results on failure
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
```

### VRT Workflow Strategy

#### 1. **Main Branch (Baseline Creation)**
- Tests run on every merge to `main`
- VRT snapshots are generated and published to npm registry
- Package version: `0.0.0-{COMMIT_SHA}` (e.g., `0.0.0-a1b2c3d4`)
- Each main commit has its own baseline package

#### 2. **Pull Request Pipelines (Automatic Comparison)**
- Pipeline detects the merge base (commit where branch diverged from main)
- Downloads baseline package for that specific commit: `@owner/vrt-baselines@0.0.0-{MERGE_BASE}`
- Runs tests comparing current changes against the exact baseline where you branched off
- If visual changes detected:
  - Tests fail
  - Diff images are generated in test report
  - Review visual changes before merging

#### 3. **Adding New Tests (Manual Approval Required)**
When new tests are added, the PR pipeline will fail because no baseline snapshots exist for comparison. This is expected behavior and requires manual review.

**Approval Process:**
1. PR pipeline runs and fails VRT checks for new tests
2. Review the test report artifacts to examine the generated snapshots
3. If snapshots look correct, add the `vrt-approved` label to the PR
4. The workflow detects the label and allows the PR to proceed despite VRT failures
5. After merge to main, new baselines are automatically published
6. Future PRs will compare against these new baselines

**Important:** The `vrt-approved` label should only be added after careful manual review of all new snapshots. When we add new tests
VRTs will fail in the pipeline since there is no baseline image.
Use vrt-approved to override this and generate new baseline images.

#### 4. **Updating Baselines**
When intentional visual changes are made:

```bash
# Locally update baselines to verify
npm test -- --update-snapshots

# Merge to main - new baselines are automatically published
# Next PR will compare against these new baselines
```

### Package.json Configuration

Configure your repository as an npm package to enable baseline publishing:

```json
{
  "name": "@your-org/your-component-library",
  "version": "1.0.0",
  "files": ["snaps/**/*"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "scripts": {
    "test": "playwright test --config=playwright-ct.config.ts",
    "test:ci": "playwright test --config=playwright-ct.config.ts --reporter=html,junit",
    "test:update-snapshots": "playwright test --update-snapshots",
    "test:headed": "playwright test --headed",
    "build": "stencil build"
  }
}
```

The `files` field ensures only snapshot files are included in the published baseline package.

## VRT Baseline Management Best Practices

The `snaps/` directory should not be committed to Git. Baselines are managed as npm packages published to the registry, keeping the repository clean and fast. Local developers generate their own baselines when running tests.

For npm registry retention, configure package retention policies to keep baseline packages for 30-90 days or based on commit age. Each baseline package is tagged with its commit SHA for precise version matching.

The visual change review process works as follows: failed VRT tests indicate visual changes that should be reviewed using diff images in the test report. The comparison is always made against the exact commit where your branch diverged from main. Intentional changes can be approved and merged, which automatically publishes new baselines. Unintentional changes should be fixed before merging.

Snapshots are platform-specific, indicated by suffixes like `-darwin` or `-linux`. Run VRT tests on the same OS in CI as your baseline generation. For multi-OS support, publish separate baseline packages per platform or include platform identifiers in package names.

## Benefits of This Approach

This approach provides zero-configuration VRT with screenshots automatically captured without extra code. Visual regressions are caught during PR reviews, providing fast feedback. Snapshots are stored as npm packages rather than in Git, avoiding repository bloat. Each merge to main updates the baseline automatically. PR pipelines automatically compare against the exact commit where the branch diverged, ensuring accurate visual diff detection without manual baseline management.

## Troubleshooting

### Snapshots not being generated
- Ensure `autoVrt: true` in config
- Verify tests use `await expect()` (not just `expect()`)
- Check that visual matchers are used (e.g., `toBeVisible`, `toHaveClass`)

### Elements not found
- Ensure components are hydrated (check `initialWaitForElement`)
- Verify Stencil build output is in `staticDir`
- Playwright's accessible selectors (getByRole, getByText, etc.) automatically pierce shadow DOM

### VRT tests failing in CI but passing locally
- Platform-specific rendering differences (fonts, anti-aliasing)
- Ensure CI uses same OS as baseline generation
- Consider using Docker for consistent environments

### VRT tests failing for new tests in PR
- This is expected when adding new tests without existing baselines
- Download and review the test report artifacts to examine generated snapshots
- If snapshots are correct, add the `vrt-approved` label to the PR
- After merge, new baselines will be automatically created for future comparisons
- Never add the `vrt-approved` label without reviewing the snapshots first

## Resources

- [webrun-testing Documentation](https://github.com/@web-tools/webrun)
- [Playwright Documentation](https://playwright.dev/)
- [Stencil Documentation](https://stenciljs.com/)

## License

ISC
