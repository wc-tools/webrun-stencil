import { defineConfig } from '@playwright/test';
import { withComponentTesting } from 'webrun-testing';

export default withComponentTesting({
  port: 3333,
  staticDir: './dist',
  scripts: ['/webrun-stencil/webrun-stencil.esm.js'],
  initialWaitForElement: '.hydrated',
  autoVrt: true,
})(defineConfig({
  testDir: './test',
  snapshotDir: './snaps',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
}));
