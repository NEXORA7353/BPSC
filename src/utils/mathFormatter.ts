/**
 * Smart Math Text Formatter & Parser for BPSC Mathematics Portal
 * Converts LaTeX math expressions, caret powers, fractional exponents,
 * square roots, and fractions into clean, styled HTML for instant rendering.
 * 
 * Supports:
 * - LaTeX \frac{a}{b}, ^{\frac{a}{b}} (fractional exponents)
 * - Caret notation: x^(2/5), x^2, x^{10}
 * - Square roots: \sqrt{x}, \sqrt[3]{x}, sqrt(x)
 * - Subscripts: x_{1}, x_n
 * - Greek letters: \pi, \theta, \alpha, \beta
 * - Operators: \times, \div, \pm, \le, \ge, \neq
 * - Unicode math: ², ³, ×, ÷
 * - Mixed Hindi + Math content
 */

export function renderMathToHtml(text: string): string {
  if (!text) return '';

  let html = text;

  // Step 0: Extract and protect LaTeX delimiters before HTML escaping
  // Mark LaTeX blocks so HTML escaping doesn't destroy them
  const latexBlocks: string[] = [];
  
  // Protect \(...\) blocks
  html = html.replace(/\\\((.+?)\\\)/g, (_, content) => {
    const idx = latexBlocks.length;
    latexBlocks.push(content);
    return `%%LATEX_INLINE_${idx}%%`;
  });
  
  // Protect \[...\] blocks
  html = html.replace(/\\\[(.+?)\\\]/g, (_, content) => {
    const idx = latexBlocks.length;
    latexBlocks.push(content);
    return `%%LATEX_BLOCK_${idx}%%`;
  });
  
  // Protect $...$ blocks (but not $$)
  html = html.replace(/\$\$(.+?)\$\$/g, (_, content) => {
    const idx = latexBlocks.length;
    latexBlocks.push(content);
    return `%%LATEX_DISPLAY_${idx}%%`;
  });
  html = html.replace(/\$(.+?)\$/g, (_, content) => {
    const idx = latexBlocks.length;
    latexBlocks.push(content);
    return `%%LATEX_DOLLAR_${idx}%%`;
  });

  // Step 1: HTML-escape only in non-LaTeX text
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Step 2: Restore LaTeX blocks (they were protected from escaping)
  html = html.replace(/%%LATEX_INLINE_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx)]);
  html = html.replace(/%%LATEX_BLOCK_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx)]);
  html = html.replace(/%%LATEX_DISPLAY_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx)]);
  html = html.replace(/%%LATEX_DOLLAR_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx)]);

  // Step 3: Replace LaTeX command operators & symbols
  html = html
    .replace(/\\times\b/g, ' &times; ')
    .replace(/\\div\b/g, ' &divide; ')
    .replace(/\\pm\b/g, ' &plusmn; ')
    .replace(/\\mp\b/g, ' &#x2213; ')
    .replace(/\\le\b|\\leq\b/g, ' &le; ')
    .replace(/\\ge\b|\\geq\b/g, ' &ge; ')
    .replace(/\\neq\b|\\ne\b/g, ' &ne; ')
    .replace(/\\approx\b/g, ' &asymp; ')
    .replace(/\\infty\b/g, '&infin;')
    .replace(/\\degree\b/g, '&deg;')
    .replace(/\\circ\b/g, '&deg;')
    .replace(/\\pi\b/g, '&pi;')
    .replace(/\\theta\b/g, '&theta;')
    .replace(/\\alpha\b/g, '&alpha;')
    .replace(/\\beta\b/g, '&beta;')
    .replace(/\\gamma\b/g, '&gamma;')
    .replace(/\\delta\b/g, '&delta;')
    .replace(/\\sigma\b/g, '&sigma;')
    .replace(/\\lambda\b/g, '&lambda;')
    .replace(/\\mu\b/g, '&mu;')
    .replace(/\\omega\b/g, '&omega;')
    .replace(/\\phi\b/g, '&phi;')
    .replace(/\\epsilon\b/g, '&epsilon;')
    .replace(/\\rightarrow\b|\\to\b/g, ' &rarr; ')
    .replace(/\\leftarrow\b/g, ' &larr; ')
    .replace(/\\Rightarrow\b|\\implies\b/g, ' &rArr; ')
    .replace(/\\therefore\b/g, '&there4;')
    .replace(/\\because\b/g, '&because;')
    .replace(/\\forall\b/g, '&forall;')
    .replace(/\\exists\b/g, '&exist;')
    .replace(/\\in\b/g, ' &isin; ')
    .replace(/\\notin\b/g, ' &notin; ')
    .replace(/\\subset\b/g, ' &sub; ')
    .replace(/\\cup\b/g, ' &cup; ')
    .replace(/\\cap\b/g, ' &cap; ')
    .replace(/\\sum\b/g, '&sum;')
    .replace(/\\prod\b/g, '&prod;')
    .replace(/\\int\b/g, '&int;')
    .replace(/\\cdot\b/g, ' &middot; ')
    .replace(/\\ldots\b|\\dots\b/g, '&hellip;')
    .replace(/\\triangle\b/g, '&#9651;')
    .replace(/\\angle\b/g, '&#8736;')
    .replace(/\\perp\b/g, '&#8869;')
    .replace(/\\parallel\b/g, '&#8741;');

  // Step 4: Handle fractional exponents in LaTeX syntax: (base)^{\frac{n}{d}}
  html = html.replace(
    /(\([^)]*\)|[a-zA-Z0-9.\-]+)\^\{\\frac\{([^{}]+)\}\{([^{}]+)\}\}/g,
    (_, base, num, den) => {
      return `<span class="math-expr-inline">${base}<sup class="math-exponent-frac"><span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span></sup></span>`;
    }
  );

  // Step 5: Handle caret fractional exponents: (base)^(n/d)
  html = html.replace(
    /(\([^)]*\)|[a-zA-Z0-9.\-]+)\^\(\s*(-?[0-9a-zA-Z]+)\s*\/\s*([0-9a-zA-Z]+)\s*\)/g,
    (_, base, num, den) => {
      return `<span class="math-expr-inline">${base}<sup class="math-exponent-frac"><span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span></sup></span>`;
    }
  );

  // Step 6: Handle standard LaTeX fractions: \frac{a}{b}
  html = html.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    (_, num, den) => {
      return `<span class="math-frac-container"><span class="math-num">${num}</span><span class="math-den">${den}</span></span>`;
    }
  );

  // Step 7: Handle nth roots: \sqrt[n]{x}
  html = html.replace(
    /\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g,
    (_, nth, body) => {
      return `<span class="math-sqrt"><sup class="math-root-index">${nth}</sup><span class="math-sqrt-symbol">&radic;</span><span class="math-sqrt-body">${body}</span></span>`;
    }
  );

  // Step 8: Handle square roots: \sqrt{x} or sqrt(x)
  html = html.replace(
    /\\sqrt\{([^{}]+)\}/g,
    (_, body) => {
      return `<span class="math-sqrt"><span class="math-sqrt-symbol">&radic;</span><span class="math-sqrt-body">${body}</span></span>`;
    }
  );
  html = html.replace(
    /sqrt\(([^)]+)\)/g,
    (_, body) => {
      return `<span class="math-sqrt"><span class="math-sqrt-symbol">&radic;</span><span class="math-sqrt-body">${body}</span></span>`;
    }
  );

  // Step 9: Handle general superscripts: x^{expr} or x^2
  html = html.replace(
    /(\([^)]*\)|[a-zA-Z0-9.\-]+)\^\{([^{}]+)\}/g,
    '$1<sup>$2</sup>'
  );
  html = html.replace(
    /(\([^)]*\)|[a-zA-Z0-9.\-]+)\^([a-zA-Z0-9+\-]+)/g,
    '$1<sup>$2</sup>'
  );

  // Step 10: Handle subscripts: x_{expr} or x_n
  html = html.replace(
    /([a-zA-Z0-9]+)_\{([^{}]+)\}/g,
    '$1<sub>$2</sub>'
  );
  html = html.replace(
    /([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g,
    '$1<sub>$2</sub>'
  );

  // Step 11: Handle \text{} and \textbf{} commands
  html = html.replace(/\\textbf\{([^{}]+)\}/g, '<strong>$1</strong>');
  html = html.replace(/\\text\{([^{}]+)\}/g, '<span>$1</span>');

  // Step 12: Handle \left( and \right) - just render as parentheses
  html = html.replace(/\\left\s*([(\[{])/g, '$1');
  html = html.replace(/\\right\s*([)\]}])/g, '$1');

  // Step 13: Handle \overline{x} (used for repeating decimals)
  html = html.replace(
    /\\overline\{([^{}]+)\}/g,
    '<span style="text-decoration:overline">$1</span>'
  );

  // Step 14: Handle \bar{x}
  html = html.replace(
    /\\bar\{([^{}]+)\}/g,
    '<span style="text-decoration:overline">$1</span>'
  );

  // Step 15: Clean up remaining backslashes from LaTeX commands that were not matched
  html = html.replace(/\\(?:quad|;|,|!|\s)/g, ' ');

  return html;
}

/**
 * Normalizes input text during parsing or pasting so power fractions are clean
 */
export function normalizeMathSyntax(raw: string): string {
  if (!raw) return '';
  return raw
    // Normalize unicode superscripts
    .replace(/⁰/g, '^0')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    // Normalize unicode fractions
    .replace(/½/g, '\\frac{1}{2}')
    .replace(/⅓/g, '\\frac{1}{3}')
    .replace(/⅔/g, '\\frac{2}{3}')
    .replace(/¼/g, '\\frac{1}{4}')
    .replace(/¾/g, '\\frac{3}{4}')
    .replace(/⅕/g, '\\frac{1}{5}')
    .replace(/⅖/g, '\\frac{2}{5}')
    .replace(/⅗/g, '\\frac{3}{5}')
    // Normalize unicode subscripts
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3')
    .replace(/₄/g, '_4')
    .replace(/₅/g, '_5')
    .replace(/₆/g, '_6')
    .replace(/₇/g, '_7')
    .replace(/₈/g, '_8')
    .replace(/₉/g, '_9')
    // Normalize unicode operators
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/±/g, '\\pm ')
    .replace(/≤/g, '\\leq ')
    .replace(/≥/g, '\\geq ')
    .replace(/≠/g, '\\neq ')
    .replace(/≈/g, '\\approx ')
    .replace(/∞/g, '\\infty ')
    .replace(/π/g, '\\pi ')
    .replace(/θ/g, '\\theta ')
    .replace(/α/g, '\\alpha ')
    .replace(/β/g, '\\beta ')
    .replace(/√/g, '\\sqrt')
    // Normalize arrow symbols
    .replace(/→/g, '\\rightarrow ')
    .replace(/⇒/g, '\\Rightarrow ')
    .replace(/∴/g, '\\therefore ')
    .replace(/∵/g, '\\because ');
}
