/**
 * Smart Math Text Formatter & Parser for BPSC Mathematics Portal
 * Converts LaTeX math expressions, caret powers, fractional exponents,
 * square roots, and fractions into clean, styled HTML for instant rendering.
 */

export function renderMathToHtml(text: string): string {
  if (!text) return '';

  let html = text;

  // 1. Escape HTML special characters except existing safe formatting tags
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore inline math delimiters if present
  html = html
    .replace(/\\\(|\\\)/g, '$')
    .replace(/\\\[|\\\]/g, '$$');

  // Replace multiplication and division symbols
  html = html
    .replace(/\\times\b|\b\*([^\*\n]+)\*/g, ' &times; ')
    .replace(/\\div\b/g, ' &divide; ')
    .replace(/\\pm\b/g, ' &plusmn; ')
    .replace(/\\le\b|\\leq\b/g, ' &le; ')
    .replace(/\\ge\b|\\geq\b/g, ' &ge; ')
    .replace(/\\neq\b/g, ' &ne; ')
    .replace(/\\degree\b/g, '&deg;')
    .replace(/\\pi\b/g, '&pi;')
    .replace(/\\theta\b/g, '&theta;')
    .replace(/\\alpha\b/g, '&alpha;')
    .replace(/\\beta\b/g, '&beta;');

  // 2. Handle fractional exponents in LaTeX syntax: e.g. (0.03125)^{\frac{2}{5}} or (-343 \times 512)^{\frac{1}{3}}
  html = html.replace(
    /([\(\)a-zA-Z0-9\.\_\-\+]+|\([^)]+\))\^\{?\\frac\{([^{}]+)\}\{([^{}]+)\}\}?/g,
    (_, base, num, den) => {
      return `<span class="math-expr-inline">${base}<sup class="math-exponent-frac"><span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span></sup></span>`;
    }
  );

  // 3. Handle simple fractional exponents with caret notation: e.g. (0.03125)^(2/5) or (-343 * 512)^(1/3) or (x)^(a/b)
  html = html.replace(
    /([\(\)a-zA-Z0-9\.\_\-\+]+|\([^)]+\))\^\(\s*(-?\d+|[a-zA-Z]+)\s*\/\s*(\d+|[a-zA-Z]+)\s*\)/g,
    (_, base, num, den) => {
      return `<span class="math-expr-inline">${base}<sup class="math-exponent-frac"><span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span></sup></span>`;
    }
  );

  // 4. Handle standard LaTeX fractions: \frac{a}{b}
  html = html.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    (_, num, den) => {
      return `<span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span>`;
    }
  );

  // 5. Handle nth roots and square roots: \sqrt[3]{x} or \sqrt{x} or sqrt(x)
  html = html.replace(
    /\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g,
    (_, nth, body) => {
      return `<span class="math-sqrt"><sup class="math-root-index">${nth}</sup><span class="math-sqrt-symbol">&radic;</span><span class="math-sqrt-body">${body}</span></span>`;
    }
  );
  html = html.replace(
    /\\sqrt\{([^{}]+)\}|sqrt\(([^)]+)\)/g,
    (_, body1, body2) => {
      const body = body1 || body2;
      return `<span class="math-sqrt"><span class="math-sqrt-symbol">&radic;</span><span class="math-sqrt-body">${body}</span></span>`;
    }
  );

  // 6. Handle general superscripts: e.g. x^{10} or x^2 or (a+b)^3
  html = html.replace(
    /([\(\)a-zA-Z0-9\.\_\-]+)\^\{([^{}]+)\}/g,
    '$1<sup>$2</sup>'
  );
  html = html.replace(
    /([\(\)a-zA-Z0-9\.\_\-]+)\^([a-zA-Z0-9\+\-]+)/g,
    '$1<sup>$2</sup>'
  );

  // 7. Handle subscripts: e.g. x_{1} or x_n
  html = html.replace(
    /([a-zA-Z0-9]+)\_\{([^{}]+)\}/g,
    '$1<sub>$2</sub>'
  );
  html = html.replace(
    /([a-zA-Z0-9]+)\_([a-zA-Z0-9]+)/g,
    '$1<sub>$2</sub>'
  );

  // 8. Clean up dollar math delimiters ($...$)
  html = html.replace(/\$([^$]+)\$/g, '<span class="math-rendered">$1</span>');

  return html;
}

/**
 * Normalizes input text during parsing or pasting so power fractions are clean
 */
export function normalizeMathSyntax(raw: string): string {
  if (!raw) return '';
  return raw
    // Normalize unicode powers / fractions
    .replace(/¹\/₂/g, '^(1/2)')
    .replace(/¹\/₃/g, '^(1/3)')
    .replace(/²\/₃/g, '^(2/3)')
    .replace(/¹\/₄/g, '^(1/4)')
    .replace(/³\/₄/g, '^(3/4)')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ');
}
