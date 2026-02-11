import { h } from '@stencil/core';
import { test, expect } from 'webrun-testing';

test.describe('WcButton Component', () => {
  test('should render a basic button', async ({ render }) => {
    const { container } = await render(<wc-button>Click Me</wc-button>);

    await expect(container).toBeVisible();
    await expect(container).toContainText('Click Me');
  });

  test('should render primary variant', async ({ render }) => {
    const { container } = await render(<wc-button variant="primary">Primary</wc-button>);

    const button = container.getByRole('button', { name: 'Primary' });

    await expect(button).toHaveClass(/button--primary/);
  });

  test('should render secondary variant', async ({ render }) => {
    const { container } = await render(<wc-button variant="secondary">Secondary</wc-button>);

    const button = container.getByRole('button', { name: 'Secondary' });

    await expect(button).toHaveClass(/button--secondary/);
  });

  test('should render danger variant', async ({ render }) => {
    const { container } = await render(<wc-button variant="danger">Danger</wc-button>);

    const button = container.getByRole('button', { name: 'Danger' });

    await expect(button).toHaveClass(/button--danger/);
  });

  test('should handle disabled state', async ({ render }) => {
    const { container } = await render(<wc-button disabled>Disabled</wc-button>);

    const button = container.getByRole('button', { name: 'Disabled' });

    await expect(button).toBeDisabled();
  });

  test('should emit wcClick event on click', async ({ render }) => {
    const { container } = await render(<wc-button>Click Me</wc-button>);

    const getWcClickEvents = await container.spyOn('wcClick');

    await container.click();

    const events = await getWcClickEvents();
    expect(events).toHaveLength(1);
  });

  test('should not emit wcClick event when disabled', async ({ render }) => {
    const { container } = await render(<wc-button disabled>Click Me</wc-button>);

    const getWcClickEvents = await container.spyOn('wcClick');

    // Try to click (should not work since disabled)
    const button = container.getByRole('button', { name: 'Click Me' });
    await button.click({ force: true });

    const events = await getWcClickEvents();
    expect(events).toHaveLength(0);
  });

  test('should have correct button type', async ({ render }) => {
    const { container } = await render(<wc-button type="submit">Submit</wc-button>);

    const button = container.getByRole('button', { name: 'Submit' });

    await expect(button).toHaveAttribute('type', 'submit');
  });
});
