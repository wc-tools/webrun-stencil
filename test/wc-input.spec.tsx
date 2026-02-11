import { test, expect, spyOn } from '@wc-tools/webrun';
import { h } from '@stencil/core';

test.describe('WcInput Component', () => {
  test('should render a basic input', async ({ render }) => {
    const { container } = await render(<wc-input placeholder="Enter text" />);

    await expect(container).toBeVisible();
  });

  test('should render with label', async ({ render }) => {
    const { container } = await render(<wc-input label="Username" />);

    const label = container.getByText('Username');

    await expect(label).toContainText('Username');
  });

  test('should show required indicator', async ({ render }) => {
    const { container } = await render(<wc-input label="Email" required />);

    const requiredSpan = container.getByText('*');

    await expect(requiredSpan).toBeVisible();
    await expect(requiredSpan).toContainText('*');
  });

  test('should handle different input types', async ({ render }) => {
    const { container } = await render(<wc-input type="email" placeholder="Email" />);

    const input = container.getByPlaceholder('Email');

    await expect(input).toHaveAttribute('type', 'email');
  });

  test('should set initial value', async ({ render }) => {
    const { container } = await render(<wc-input value="initial value" placeholder="Text" />);

    const input = container.getByPlaceholder('Text');

    await expect(input).toHaveValue('initial value');
  });

  test('should handle user input', async ({ render }) => {
    const { container } = await render(<wc-input placeholder="Text" />);

    const input = container.getByPlaceholder('Text');

    await input.fill('test text');

    await expect(input).toHaveValue('test text');
  });

  test('should emit wcInput event on input', async ({ render }) => {
    const { container } = await render(<wc-input placeholder="Text" />);

    const input = container.getByPlaceholder('Text');
    const getWcInputEvents = await container.spyOn('wcInput');

    await input.fill('hello');

    const events = await getWcInputEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[events.length - 1]?.detail).toBe('hello');
  });

  test('should emit wcChange event on change', async ({ render }) => {
    const { container } = await render(<wc-input placeholder="Text" />);

    const input = container.getByPlaceholder('Text');
    const getWcChangeEvents = await container.spyOn('wcChange');

    await input.fill('hello');
    await input.blur();

    const events = await getWcChangeEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[events.length - 1]?.detail).toBe('hello');
  });

  test('should display error message', async ({ render }) => {
    const { container } = await render(<wc-input error="This field is required" />);

    const errorMessage = container.getByText('This field is required');

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('This field is required');
  });

  test('should apply error styling', async ({ render }) => {
    const { container } = await render(<wc-input error="Error" placeholder="Text" />);

    const input = container.getByPlaceholder('Text');

    await expect(input).toHaveClass(/input--error/);
  });

  test('should handle disabled state', async ({ render }) => {
    const { container } = await render(<wc-input disabled placeholder="Text" />);

    const input = container.getByPlaceholder('Text');

    await expect(input).toBeDisabled();
  });

  test('should update value programmatically', async ({ render }) => {
    const { container } = await render(<wc-input placeholder="Text" />);

    await container.setProperty('value', 'programmatic value');

    const input = container.getByPlaceholder('Text');
    await expect(input).toHaveValue('programmatic value');
  });
});
