import { newE2EPage } from '@stencil/core/testing';

describe('scroll-safe-slider', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<scroll-safe-slider></scroll-safe-slider>');
    const element = await page.find('scroll-safe-slider');
    expect(element).toHaveClass('hydrated');
  });
});
