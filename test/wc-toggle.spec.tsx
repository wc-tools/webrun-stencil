import { test, expect } from '@wc-tools/webrun';
import { h } from '@stencil/core';

test.describe('WcToggle Component', () => {
  test('should render a basic toggle', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    await expect(container).toBeVisible();
  });

  test('should render with label', async ({ render }) => {
    const { container } = await render(<wc-toggle label="Enable feature" />);

    const label = container.getByText('Enable feature');

    await expect(label).toBeVisible();
    await expect(label).toContainText('Enable feature');
  });

  test('should have correct initial unchecked state', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).not.toHaveClass(/toggle--checked/);
  });

  test('should have correct initial checked state', async ({ render }) => {
    const { container } = await render(<wc-toggle checked />);

    const toggle = container.getByRole('switch');

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveClass(/toggle--checked/);
  });

  test('should toggle on click', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    // Initially unchecked
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Click to check
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveClass(/toggle--checked/);

    // Click to uncheck
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).not.toHaveClass(/toggle--checked/);
  });

  test('should emit wcToggle event on toggle', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');
    const getWcToggleEvents = await container.spyOn('wcToggle');

    await toggle.click();
    await toggle.click();

    const events = await getWcToggleEvents();
    expect(events.map(e => e.detail)).toEqual([true, false]);
  });

  test('should handle disabled state', async ({ render }) => {
    const { container } = await render(<wc-toggle disabled />);

    const toggle = container.getByRole('switch');

    await expect(toggle).toBeDisabled();
  });

  test('should not toggle when disabled', async ({ render }) => {
    const { container } = await render(<wc-toggle disabled />);

    const toggle = container.getByRole('switch');
    const getWcToggleEvents = await container.spyOn('wcToggle');

    // Try to click (should not work since disabled)
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click({ force: true });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    const events = await getWcToggleEvents();
    expect(events).toHaveLength(0);
  });

  test('should toggle with Enter key', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    await toggle.focus();
    await toggle.press('Enter');

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should toggle with Space key', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    await toggle.focus();
    await toggle.press('Space');

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should have correct ARIA role', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    await expect(toggle).toHaveAttribute('role', 'switch');
  });

  test('should update checked property programmatically', async ({ render }) => {
    const { container } = await render(<wc-toggle />);

    const toggle = container.getByRole('switch');

    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await container.setProperty('checked', true);

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveClass(/toggle--checked/);
  });
});
