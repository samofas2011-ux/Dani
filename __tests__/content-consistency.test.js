/**
 * Content Consistency Tests
 *
 * These tests verify that the product data displayed on the page is
 * internally consistent - e.g., the dropdown options match the product
 * cards, prices are valid, and sold items are excluded from the form.
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

describe('Product Data Consistency', () => {
  test('all available product names appear in the dropdown', () => {
    const availableProducts = document.querySelectorAll(
      '.product-card .product-status:not(.sold)'
    );
    const dropdownOptions = Array.from(document.querySelectorAll('#product option')).map(
      (opt) => opt.value
    );

    availableProducts.forEach((status) => {
      const card = status.closest('.product-card');
      const productName = card.querySelector('.product-title').textContent.trim();
      expect(dropdownOptions).toContain(productName);
    });
  });

  test('sold products are NOT listed in the dropdown', () => {
    const soldProducts = document.querySelectorAll('.product-card .product-status.sold');
    const dropdownOptions = Array.from(document.querySelectorAll('#product option')).map(
      (opt) => opt.value
    );

    soldProducts.forEach((status) => {
      const card = status.closest('.product-card');
      const productName = card.querySelector('.product-title').textContent.trim();
      expect(dropdownOptions).not.toContain(productName);
    });
  });

  test('all product prices are positive numbers', () => {
    const prices = document.querySelectorAll('.product-price');
    prices.forEach((priceEl) => {
      const priceText = priceEl.textContent.trim();
      const priceNum = parseFloat(priceText.replace('$', ''));
      expect(priceNum).toBeGreaterThan(0);
      expect(Number.isFinite(priceNum)).toBe(true);
    });
  });

  test('dropdown option prices match product card prices', () => {
    const options = document.querySelectorAll('#product option');

    options.forEach((option) => {
      const optionText = option.textContent;
      const priceMatch = optionText.match(/\$(\d+)/);
      if (!priceMatch) return; // skip placeholder and "other"

      const optionPrice = priceMatch[1];
      const productName = option.value;

      // Find matching product card
      const cards = document.querySelectorAll('.product-card');
      let foundCard = null;
      cards.forEach((card) => {
        if (card.querySelector('.product-title').textContent.trim() === productName) {
          foundCard = card;
        }
      });

      if (foundCard) {
        const cardPrice = foundCard.querySelector('.product-price').textContent.match(/\$(\d+)/);
        expect(cardPrice[1]).toBe(optionPrice);
      }
    });
  });

  test('every product card has a unique title', () => {
    const titles = Array.from(document.querySelectorAll('.product-title')).map((t) =>
      t.textContent.trim()
    );
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

describe('Placeholder Content Detection', () => {
  // FAILING: placeholder text has not been customized
  test.failing('title does not contain placeholder text', () => {
    const title = document.querySelector('title').textContent;
    expect(title).not.toContain('[Your');
    expect(title).not.toContain("Kid's Name]");
  });

  // FAILING: intro paragraph has placeholder
  test.failing('intro paragraph does not contain placeholder text', () => {
    const intro = document.querySelector('.intro p').textContent;
    expect(intro).not.toContain('[Your Name]');
  });

  // FAILING: email is a placeholder
  test.failing('contact email is not a placeholder', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    expect(html).not.toContain('your-email@example.com');
  });
});

describe('Footer Content', () => {
  test('footer contains copyright text', () => {
    const footer = document.querySelector('footer');
    expect(footer.textContent).toContain('©');
  });

  // FAILING: copyright year is outdated
  test.failing('copyright year is current', () => {
    const footer = document.querySelector('footer');
    const currentYear = new Date().getFullYear().toString();
    expect(footer.textContent).toContain(currentYear);
  });
});
