# Test Coverage Analysis

## Current State

The project had **zero tests** and **no testing infrastructure** before this analysis. It consists of a single `index.html` file containing embedded CSS and JavaScript.

## Testing Infrastructure Added

- **Framework**: Jest + jsdom for DOM testing
- **Test files**: 3 test suites, 50 total tests
- **Run**: `npm test` (verbose) or `npm run test:coverage`

## Test Suites Created

### 1. `__tests__/html-structure.test.js` — 24 tests
Covers HTML document structure, accessibility, product card markup, and CSS.

| Area | Tests | Status |
|------|-------|--------|
| DOCTYPE, lang, charset, viewport, title | 5 | All pass |
| Semantic header/footer, single h1 | 3 | All pass |
| Form labels, required attributes, input types | 4 | All pass |
| Product image alt/aria-label (accessibility) | 1 | **Expected failure** |
| Skip navigation link | 1 | **Expected failure** |
| Main landmark element | 1 | **Expected failure** |
| Product card structure (title, desc, price, status) | 6 | All pass |
| CSS grid, media queries, style tag | 3 | All pass |

### 2. `__tests__/form-logic.test.js` — 16 tests
Covers the contact form DOM elements and JavaScript submission logic.

| Area | Tests | Status |
|------|-------|--------|
| Form element existence and fields | 7 | All pass |
| Submit handler, mailto format, alert, preventDefault | 6 | All pass |
| Inline error messages for invalid inputs | 1 | **Expected failure** |
| Message textarea maxlength | 1 | **Expected failure** |
| Input sanitization (HTML tag stripping) | 1 | **Expected failure** |

### 3. `__tests__/content-consistency.test.js` — 10 tests
Covers product data integrity and placeholder detection.

| Area | Tests | Status |
|------|-------|--------|
| Available products match dropdown options | 1 | Pass |
| Sold products excluded from dropdown | 1 | Pass |
| Prices are valid positive numbers | 1 | Pass |
| Dropdown prices match card prices | 1 | Pass |
| Unique product titles | 1 | Pass |
| Placeholder text in title/intro | 2 | **Expected failure** |
| Placeholder email address | 1 | **Expected failure** |
| Copyright year is current | 1 | **Expected failure** |

---

## Areas That Need Improvement

The `test.failing()` tests above document concrete gaps. Here is a prioritized breakdown:

### Priority 1: Content Placeholders (3 tests failing)
**Files**: `index.html:6`, `index.html:227`, `index.html:376`

The page still contains template placeholder text:
- `[Your Kid's Name]` in the page title
- `[Your Name]` in the intro paragraph
- `your-email@example.com` in the JavaScript mailto handler and alert

**Impact**: The site is non-functional for real use until these are replaced with actual values.

### Priority 2: Accessibility (3 tests failing)
**Files**: `index.html:81-90` (product images), entire document (landmarks)

Missing accessibility features:
- **Product images lack `alt` or `aria-label`**: The `.product-image` divs use emoji as visual placeholders but provide no text alternative for screen readers.
- **No skip navigation link**: Users relying on keyboard navigation cannot skip past the header to the main content.
- **No `<main>` landmark element**: The page content is wrapped in a generic `<div class="container">` rather than a `<main>` element, making it harder for assistive technology to identify the primary content region.

**Impact**: The site fails basic WCAG 2.1 Level A requirements.

### Priority 3: Form Validation & Security (3 tests failing)
**Files**: `index.html:356-379` (JavaScript)

- **No inline error messages**: The form relies entirely on HTML5 `required` attributes. When validation fails, there are no visible `.error-message` elements or `role="alert"` regions. Users get only the browser's default tooltip.
- **No `maxlength` on message textarea**: The textarea at `index.html:342` has no character limit, meaning extremely long input could generate a malformed `mailto:` URL that exceeds browser URL length limits.
- **No input sanitization**: User input is passed through `encodeURIComponent()` but raw HTML (e.g., `<script>` tags) is not stripped before being encoded into the mailto body. While `encodeURIComponent` prevents URL injection, the decoded email body will contain raw HTML.

### Priority 4: Outdated Copyright Year (1 test failing)
**File**: `index.html:352`

The footer says `© 2024` but should reflect the current year (2026), or ideally be generated dynamically with JavaScript.

---

## Recommended Next Steps

1. **Replace all placeholder content** with real values (name, email)
2. **Add accessibility attributes**:
   - Add `role="img"` and `aria-label` to `.product-image` divs
   - Add a `<a class="skip-link" href="#main">Skip to content</a>` before the header
   - Change `<div class="container">` to `<main class="container">`
3. **Improve form validation**:
   - Add `maxlength="1000"` to the message textarea
   - Add JavaScript-driven inline error messages with `role="alert"`
   - Strip HTML tags from input before encoding into the mailto body
4. **Fix the copyright year** or generate it dynamically
5. **Consider extracting CSS/JS** into separate files for better testability and maintainability
