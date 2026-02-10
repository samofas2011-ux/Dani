/**
 * HTML Structure & Accessibility Tests
 *
 * These tests verify the structural integrity of the HTML page,
 * semantic correctness, accessibility attributes, and responsive
 * design considerations.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let dom;
let document;

beforeAll(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  dom = new JSDOM(html);
  document = dom.window.document;
});

describe('HTML Document Structure', () => {
  test('has valid DOCTYPE declaration', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    expect(html.trim().startsWith('<!DOCTYPE html>')).toBe(true);
  });

  test('has lang attribute on html element', () => {
    const htmlElement = document.querySelector('html');
    expect(htmlElement.getAttribute('lang')).toBe('en');
  });

  test('has charset meta tag', () => {
    const charset = document.querySelector('meta[charset]');
    expect(charset).not.toBeNull();
    expect(charset.getAttribute('charset')).toBe('UTF-8');
  });

  test('has viewport meta tag for responsive design', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toContain('width=device-width');
  });

  test('has a title element', () => {
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.textContent.length).toBeGreaterThan(0);
  });

  test('has exactly one h1 element', () => {
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  test('has a header element', () => {
    const header = document.querySelector('header');
    expect(header).not.toBeNull();
  });

  test('has a footer element', () => {
    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
  });
});

describe('Accessibility', () => {
  test('all form inputs have associated labels', () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      expect(id).toBeTruthy();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label).not.toBeNull();
    });
  });

  test('form inputs have required attribute where appropriate', () => {
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const productSelect = document.querySelector('#product');

    expect(nameInput.hasAttribute('required')).toBe(true);
    expect(emailInput.hasAttribute('required')).toBe(true);
    expect(productSelect.hasAttribute('required')).toBe(true);
  });

  test('email input has type="email" for validation', () => {
    const emailInput = document.querySelector('#email');
    expect(emailInput.getAttribute('type')).toBe('email');
  });

  test('submit button is a button element with type="submit"', () => {
    const submitBtn = document.querySelector('.submit-btn');
    expect(submitBtn).not.toBeNull();
    expect(submitBtn.tagName.toLowerCase()).toBe('button');
    expect(submitBtn.getAttribute('type')).toBe('submit');
  });

  // FAILING: images/visual placeholders lack alt text
  test.failing('product images have alt attributes', () => {
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach((img) => {
      expect(
        img.getAttribute('alt') || img.getAttribute('aria-label') || img.getAttribute('role')
      ).toBeTruthy();
    });
  });

  // FAILING: no skip navigation link exists
  test.failing('has a skip navigation link', () => {
    const skipLink = document.querySelector('a[href="#main"], a[href="#content"], .skip-link');
    expect(skipLink).not.toBeNull();
  });

  // FAILING: no landmark roles on key sections
  test.failing('main content area has role or uses main element', () => {
    const main = document.querySelector('main, [role="main"]');
    expect(main).not.toBeNull();
  });
});

describe('Product Cards Structure', () => {
  let productCards;

  beforeAll(() => {
    productCards = document.querySelectorAll('.product-card');
  });

  test('has 6 product cards', () => {
    expect(productCards.length).toBe(6);
  });

  test('each product card has a title', () => {
    productCards.forEach((card) => {
      const title = card.querySelector('.product-title');
      expect(title).not.toBeNull();
      expect(title.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  test('each product card has a description', () => {
    productCards.forEach((card) => {
      const desc = card.querySelector('.product-description');
      expect(desc).not.toBeNull();
      expect(desc.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  test('each product card has a price', () => {
    productCards.forEach((card) => {
      const price = card.querySelector('.product-price');
      expect(price).not.toBeNull();
      expect(price.textContent).toMatch(/\$\d+/);
    });
  });

  test('each product card has a status indicator', () => {
    productCards.forEach((card) => {
      const status = card.querySelector('.product-status');
      expect(status).not.toBeNull();
    });
  });

  test('sold items have the "sold" CSS class', () => {
    const soldItems = document.querySelectorAll('.product-status.sold');
    expect(soldItems.length).toBeGreaterThan(0);
    soldItems.forEach((item) => {
      expect(item.textContent.trim().toLowerCase()).toBe('sold');
    });
  });
});

describe('CSS and Styling', () => {
  test('has embedded style tag', () => {
    const styles = document.querySelectorAll('style');
    expect(styles.length).toBeGreaterThan(0);
  });

  test('includes responsive media query in styles', () => {
    const styleContent = document.querySelector('style').textContent;
    expect(styleContent).toContain('@media');
    expect(styleContent).toContain('max-width');
  });

  test('product grid uses CSS grid', () => {
    const styleContent = document.querySelector('style').textContent;
    expect(styleContent).toContain('display: grid');
    expect(styleContent).toContain('grid-template-columns');
  });
});
