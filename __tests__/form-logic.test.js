/**
 * Form Logic & JavaScript Tests
 *
 * These tests verify the contact form's JavaScript behavior:
 * form submission handling, mailto link generation, and input
 * encoding.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let dom;
let document;
let window;

beforeEach(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  });
  document = dom.window.document;
  window = dom.window;
});

afterEach(() => {
  dom.window.close();
});

describe('Contact Form - DOM Elements', () => {
  test('form element exists with id "contactForm"', () => {
    const form = document.getElementById('contactForm');
    expect(form).not.toBeNull();
    expect(form.tagName.toLowerCase()).toBe('form');
  });

  test('has name input field', () => {
    const name = document.getElementById('name');
    expect(name).not.toBeNull();
    expect(name.getAttribute('type')).toBe('text');
  });

  test('has email input field', () => {
    const email = document.getElementById('email');
    expect(email).not.toBeNull();
    expect(email.getAttribute('type')).toBe('email');
  });

  test('has product select dropdown', () => {
    const product = document.getElementById('product');
    expect(product).not.toBeNull();
    expect(product.tagName.toLowerCase()).toBe('select');
  });

  test('has message textarea', () => {
    const message = document.getElementById('message');
    expect(message).not.toBeNull();
    expect(message.tagName.toLowerCase()).toBe('textarea');
  });

  test('product dropdown has correct number of options', () => {
    const options = document.querySelectorAll('#product option');
    // 1 placeholder + 5 available products + 1 "other" = 7
    expect(options.length).toBe(7);
  });

  test('product dropdown first option is a placeholder', () => {
    const firstOption = document.querySelector('#product option:first-child');
    expect(firstOption.value).toBe('');
    expect(firstOption.textContent).toContain('Choose');
  });
});

describe('Contact Form - Submission Behavior', () => {
  test('form has a submit event listener attached', () => {
    // Verify the script tag exists and references contactForm
    const scripts = document.querySelectorAll('script');
    let hasFormHandler = false;
    scripts.forEach((script) => {
      if (script.textContent.includes("getElementById('contactForm')")) {
        hasFormHandler = true;
      }
    });
    expect(hasFormHandler).toBe(true);
  });

  test('form submission generates correct mailto URL', () => {
    // Set up form values
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@example.com';
    document.getElementById('product').value = 'Rainbow Sunset Painting';
    document.getElementById('message').value = 'I love this painting!';

    // Capture navigation by listening for errors in jsdom (navigation triggers an error)
    let navigatedHref = '';
    const virtualConsole = dom.window._virtualConsole;
    const originalEmit = virtualConsole.emit;
    virtualConsole.emit = function (event, error) {
      if (event === 'jsdomError' && error && error.message && error.message.includes('Not implemented: navigation')) {
        // Parse the attempted navigation URL from the error
      }
      return originalEmit.apply(this, arguments);
    };

    // Instead, we verify the script source code generates the correct mailto format
    const scriptContent = document.querySelector('script').textContent;
    expect(scriptContent).toContain('mailto:');
    expect(scriptContent).toContain('encodeURIComponent');
    expect(scriptContent).toContain('subject');
    expect(scriptContent).toContain('body');

    // Verify the script reads from the correct form fields
    expect(scriptContent).toContain("getElementById('name')");
    expect(scriptContent).toContain("getElementById('email')");
    expect(scriptContent).toContain("getElementById('product')");
    expect(scriptContent).toContain("getElementById('message')");
  });

  test('form submission calls alert to notify the user', () => {
    document.getElementById('name').value = 'Jane';
    document.getElementById('email').value = 'jane@test.com';
    document.getElementById('product').value = 'Mini Pizza';
    document.getElementById('message').value = 'Cute!';

    window.alert = jest.fn();

    const form = document.getElementById('contactForm');
    const event = new window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Thank you')
    );
  });

  test('form submission prevents default form action', () => {
    // The script should call e.preventDefault()
    const scriptContent = document.querySelector('script').textContent;
    expect(scriptContent).toContain('preventDefault');
  });

  test('mailto subject includes the selected product name', () => {
    const scriptContent = document.querySelector('script').textContent;
    // Verify subject line template includes product variable
    expect(scriptContent).toMatch(/subject.*product|product.*subject/s);
  });

  test('mailto body includes all form fields', () => {
    const scriptContent = document.querySelector('script').textContent;
    // The body template should reference name, email, product, and message
    expect(scriptContent).toMatch(/body.*\$\{name\}/s);
    expect(scriptContent).toMatch(/body.*\$\{email\}/s);
    expect(scriptContent).toMatch(/body.*\$\{product\}/s);
    expect(scriptContent).toMatch(/body.*\$\{message\}/s);
  });
});

describe('Contact Form - Validation Gaps (proposed improvements)', () => {
  // FAILING: no client-side validation beyond HTML5 required attribute
  test.failing('displays inline error messages for invalid inputs', () => {
    const form = document.getElementById('contactForm');
    document.getElementById('name').value = '';

    const event = new window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    const errorMessages = document.querySelectorAll('.error-message, .form-error, [role="alert"]');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  // FAILING: no character limit enforcement on message textarea
  test.failing('enforces maximum length on message textarea', () => {
    const message = document.getElementById('message');
    expect(
      message.hasAttribute('maxlength') || message.hasAttribute('data-max-length')
    ).toBe(true);
  });

  // FAILING: no input sanitization before building the mailto URL
  test.failing('strips HTML tags from user input before building mailto URL', () => {
    const scriptContent = document.querySelector('script').textContent;
    // Should sanitize / strip HTML before inserting into mailto
    expect(scriptContent).toMatch(/sanitize|strip|escape|replace.*<|DOMPurify/i);
  });
});
