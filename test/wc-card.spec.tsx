import { test, expect } from 'webrun-testing';
import { h } from '@stencil/core';

test.describe('WcCard Component', () => {
  test('should render a basic card', async ({ render }) => {
    const { container } = await render(
      <wc-card>
        <p>Card content</p>
      </wc-card>
    );

    await expect(container).toBeVisible();
    await expect(container).toContainText('Card content');
  });

  test('should render with heading', async ({ render }) => {
    const { container } = await render(<wc-card heading="Card Title">Content</wc-card>);

    const cardTitle = container.getByRole('heading', { name: 'Card Title' });

    await expect(cardTitle).toBeVisible();
    await expect(cardTitle).toContainText('Card Title');
  });

  test('should render with subtitle', async ({ render }) => {
    const { container } = await render(
      <wc-card heading="Title" subtitle="This is a subtitle">
        Content
      </wc-card>
    );

    const cardSubtitle = container.getByText('This is a subtitle');

    await expect(cardSubtitle).toBeVisible();
    await expect(cardSubtitle).toContainText('This is a subtitle');
  });

  test('should render with image', async ({ render }) => {
    const { container } = await render(<wc-card>Content</wc-card>);

    await container.setProperty('imageUrl', 'https://via.placeholder.com/400x200');
    await container.setProperty('imageAlt', 'Placeholder');

    const cardImage = container.locator('.card-image img');

    await expect(cardImage).toBeVisible();
    await expect(cardImage).toHaveAttribute('src', 'https://via.placeholder.com/400x200');
    await expect(cardImage).toHaveAttribute('alt', 'Placeholder');
  });

  test('should not render image when imageUrl is not provided', async ({ render }) => {
    const { container } = await render(<wc-card>Content</wc-card>);

    const cardImage = container.locator('.card-image');

    await expect(cardImage).not.toBeVisible();
  });

  test('should render default slot content', async ({ render }) => {
    const { container } = await render(
      <wc-card>
        <p>This is body content</p>
        <span>More content</span>
      </wc-card>
    );

    await expect(container).toContainText('This is body content');
    await expect(container).toContainText('More content');
  });

  test('should render footer slot', async ({ render }) => {
    const { container } = await render(`
      <wc-card>
        Content
        <div slot="footer">Footer content</div>
      </wc-card>
    `);

    // Check if the slotted content exists in light DOM
    const slottedFooter = container.locator('[slot="footer"]');
    await expect(slottedFooter).toBeVisible();
    await expect(slottedFooter).toContainText('Footer content');
  });

  test('should not show footer when slot is empty', async ({ render }) => {
    const { container } = await render(<wc-card>Content</wc-card>);

    const cardFooter = container.locator('.card-footer');

    // Footer exists but should not be visible due to :empty CSS
    const footerCount = await cardFooter.count();
    expect(footerCount).toBe(1);
  });

  test('should render complete card with all props', async ({ render }) => {
    const { container } = await render(<wc-card heading="Complete Card" subtitle="With all features">
      <p>Body content here</p>
      <div slot="footer">
        <button>Action</button>
      </div>
    </wc-card>);

    await container.setProperty('imageUrl', 'https://via.placeholder.com/400x200');
    await container.setProperty('imageAlt', 'Test image');

    await expect(container.locator('.card-title')).toContainText('Complete Card');
    await expect(container.locator('.card-subtitle')).toContainText('With all features');
    await expect(container.locator('.card-image img')).toBeVisible();
    await expect(container).toContainText('Body content here');
    // Check slotted footer content exists
    await expect(container.locator('[slot="footer"]')).toContainText('Action');
  });
});
