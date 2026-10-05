/**
 * Smart Universal Math Formatter & Parser for BPSC Mathematics Portal
 * Powered by KaTeX + Universal Mathematical Auto-Detector
 * 
 * Automatically formats:
 * - Natural typing: (1/5)^(3x), (0.25)^x, (0.03125)^(2/5), (-343 × 512)^(1/3)
 * - Polynomials & multiple powers: 5x^2yz^2, 25x^3y^2z, 125x^2yz^2
 * - Nth roots & unicode roots: ⁵√(3125x¹⁰y⁵z¹⁰), ^{5}√(5^{5}...), sqrt(x), \sqrt[3]{x}
 * - Tall bracket fractions: (1/5)^(3x) -> \left(\frac{1}{5}\right)^{3x}
 * - Fractional exponents: base^(a/b) -> base^{\frac{a}{b}}
 * - Equations & proofs: (0.2)^(3x) = 0.008 = (0.2)^3 => 3x = 3 => x = 1
 * - Unicode math & superscripts: ˣ, ³, ², ¹, ⅕, ⅖, ×, ÷, ±, ≤, ≥, ≠
 * - Middle dot: · -> \cdot
 * - Auto-heals broken double-superscripts from OCR / previous imports
 * - LaTeX syntax: \frac{a}{b}, \( ... \), \[ ... \], $ ... $, $$ ... $$
 * - Seamless integration with Hindi & English text
 */

import katex from 'katex';

const UNICODE_SUPERSCRIPTS: Record<string, string> = {
  '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4',
  '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
  '⁺': '^+', '⁻': '^-', '⁼': '^=', '⁽': '^(', '⁾': '^)',
  'ᵃ': '^a', 'ᵇ': '^b', 'ᶜ': '^c', 'ᵈ': '^d', 'ᵉ': '^e',
  'ᶠ': '^f', 'ᵍ': '^g', 'ʰ': '^h', 'ⁱ': '^i', 'ʲ': '^j',
  'ᵏ': '^k', 'ˡ': '^l', 'ᵐ': '^m', 'ⁿ': '^n', 'ᵒ': '^o',
  'ᵖ': '^p', 'ʳ': '^r', 'ˢ': '^s', 'ᵗ': '^t', 'ᵘ': '^u',
  'ᵛ': '^v', 'ʷ': '^w', 'ˣ': '^x', 'ʸ': '^y', 'ᶻ': '^z'
};

const UNICODE_FRACTIONS: Record<string, string> = {
  '½': '\\frac{1}{2}', '⅓': '\\frac{1}{3}', '⅔': '\\frac{2}{3}',
  '¼': '\\frac{1}{4}', '¾': '\\frac{3}{4}', '⅕': '\\frac{1}{5}',
  '⅖': '\\frac{2}{5}', '⅗': '\\frac{3}{5}', '⅘': '\\frac{4}{5}',
  '⅙': '\\frac{1}{6}', '⅚': '\\frac{5}{6}', '⅛': '\\frac{1}{8}',
  '⅜': '\\frac{3}{8}', '⅝': '\\frac{5}{8}', '⅞': '\\frac{7}{8}'
};

/**
 * Normalizes input text during parsing or pasting so power fractions are clean
 */
export function normalizeMathSyntax(raw: string): string {
  if (!raw) return '';
  let str = raw;

  // 1. Normalize Unicode fractions
  for (const [k, v] of Object.entries(UNICODE_FRACTIONS)) {
    str = str.split(k).join(v);
  }

  // 2. Handle unicode root indices like ⁵√ or ³√ BEFORE general superscripts
  // ⁵√(expr) -> \sqrt[5]{expr}
  str = str.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*(?:√|\\sqrt)\s*(?:\(([^()]+)\)|\{([^{}]+)\}|([a-zA-Z0-9]+))/g, (_, supDigits, p1, p2, p3) => {
    let num = '';
    for (const ch of supDigits) {
      if (UNICODE_SUPERSCRIPTS[ch]) num += UNICODE_SUPERSCRIPTS[ch].replace('^', '');
      else num += ch;
    }
    const body = p1 || p2 || p3;
    return `\\sqrt[${num}]{${body}}`;
  });

  // 3. Normalize Unicode superscripts
  for (const [k, v] of Object.entries(UNICODE_SUPERSCRIPTS)) {
    str = str.split(k).join(v);
  }

  // 4. Merge consecutive numeric superscripts e.g. ^1^0 -> ^{10}
  str = str.replace(/\^(\d+)(?:\^(\d+))+/g, (match) => {
    return '^{' + match.replace(/\^/g, '') + '}';
  });

  // 5. Normalize common unicode math operators and middle dot
  str = str
    .replace(/[·•]/g, ' \\cdot ')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/±/g, ' \\pm ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≈/g, ' \\approx ')
    .replace(/∞/g, ' \\infty ')
    .replace(/π/g, ' \\pi ')
    .replace(/θ/g, ' \\theta ')
    .replace(/°/g, '^\\circ ');

  return str;
}

/**
 * Converts natural math text / shorthand into clean, valid LaTeX for KaTeX
 */
export function toLatex(expr: string): string {
  if (!expr) return '';
  let s = expr.trim();

  // Normalize unicodes first
  s = normalizeMathSyntax(s);

  // 1. Arrows & Implication
  s = s.replace(/<=>|<==>/g, ' \\Leftrightarrow ');
  s = s.replace(/=>|==>/g, ' \\Rightarrow ');
  s = s.replace(/->|-->/g, ' \\rightarrow ');

  // 2. Comparisons & Relations
  s = s.replace(/<=/g, ' \\le ');
  s = s.replace(/>=/g, ' \\ge ');
  s = s.replace(/!=/g, ' \\neq ');
  s = s.replace(/\+-/g, ' \\pm ');

  // 3. Roots:
  // Root with index: ^5√(expr) or ^{5}√(expr) or \sqrt[5](expr)
  s = s.replace(/\^\{?(\d+)\}?\s*(?:√|\\sqrt)\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, (_, nth, p1, p2) => {
    return `\\sqrt[${nth}]{${p1 || p2}}`;
  });
  s = s.replace(/sqrt\[([^\]]+)\]\(([^()]+)\)/gi, '\\sqrt[$1]{$2}');
  s = s.replace(/sqrt\(([^()]+)\)/gi, '\\sqrt{$1}');
  s = s.replace(/cbrt\(([^()]+)\)/gi, '\\sqrt[3]{$1}');
  s = s.replace(/(?:√|\\surd)\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, (_, p1, p2) => `\\sqrt{${p1 || p2}}`);

  // 4. Heal broken/double superscripts (e.g. from OCR or past imports)
  // e.g. 5x^{2yz}^{2} -> 5x^{2} y z^{2}
  // e.g. 25x^{3y}^{2z} -> 25x^{3} y^{2} z
  s = s.replace(/([a-zA-Z])\^\{(\d+)([a-zA-Z])([a-zA-Z])\}\^\{(\d+)\}/g, '$1^{$2} $3 $4^{$5}');
  s = s.replace(/([a-zA-Z])\^\{(\d+)([a-zA-Z])\}\^\{(\d+)([a-zA-Z])\}/g, '$1^{$2} $3^{$4} $5');
  s = s.replace(/(\^\{[^{}]+\})\^\{([^{}]+)\}/g, '$1^{$2}');

  // 5. Multiplication operator: e.g. 2 * 3 or x * y -> \times
  s = s.replace(/(\d|[a-zA-Z\)])\s*\*\s*(\d|[a-zA-Z\(])/g, '$1 \\times $2');

  // 6. POWERS:
  // 6a. Caret with fractional parenthesized power: ^(a/b) or ^(-a/b)
  s = s.replace(/\^\s*\(\s*(-?[0-9a-zA-Z\.\+\-]+)\s*\/\s*([0-9a-zA-Z\.\+\-]+)\s*\)/g, '^{\\frac{$1}{$2}}');

  // 6b. Caret with parenthesized expression: ^(3x) or ^(n-1) or ^(-3)
  s = s.replace(/\^\s*\(\s*([^()]+)\s*\)/g, '^{$1}');

  // 6c. Bare numeric exponent: ^2, ^10, ^-1 (matches ONLY digits so adjacent variables y, z are preserved!)
  s = s.replace(/\^\s*(-?\d+)/g, '^{$1}');

  // 6d. Bare single variable exponent: ^x, ^y, ^n
  s = s.replace(/\^\s*([a-zA-Z])(?![a-zA-Z0-9])/g, '^{$1}');

  // 7. FRACTIONS in round brackets: (a/b) -> \left(\frac{a}{b}\right)
  s = s.replace(/\(\s*([0-9a-zA-Z\.\+\-]+)\s*\/\s*([0-9a-zA-Z\.\+\-]+)\s*\)/g, '\\left(\\frac{$1}{$2}\\right)');

  // 8. Standalone fractions: a/b (e.g. 1/5 or 25/16)
  s = s.replace(/(^|[\s=+\-*(\[])([0-9a-zA-Z]+)\/([0-9a-zA-Z]+)(?=[\s=+\-*)\],.;]|$)/g, '$1\\frac{$2}{$3}');

  return s;
}

/**
 * Renders a single math expression using KaTeX with zero crash guarantee
 */
export function renderMathSegment(mathText: string, displayMode: boolean = false): string {
  if (!mathText || !mathText.trim()) return '';
  try {
    const latex = toLatex(mathText);
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: 'htmlAndMathml'
    });
  } catch {
    return `<span class="math-fallback">${mathText}</span>`;
  }
}

/**
 * Universal Master Renderer
 * Handles mixed Hindi, English, and Math with professional textbook typography
 */
export function renderMathToHtml(input: string): string {
  if (!input) return '';

  let text = normalizeMathSyntax(input);

  const placeholders: string[] = [];
  function savePlaceholder(html: string): string {
    const key = `@@MATH_BLOCK_${placeholders.length}@@`;
    placeholders.push(html);
    return key;
  }

  // 1. Process explicit LaTeX blocks:
  // Display math: $$...$$ or \[...\]
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => savePlaceholder(renderMathSegment(math, true)));
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => savePlaceholder(renderMathSegment(math, true)));

  // Inline math: \(...\) or $...$
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => savePlaceholder(renderMathSegment(math, false)));
  text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => savePlaceholder(renderMathSegment(math, false)));

  // 2. Process implicit math segments between Hindi text:
  // Non-Devanagari segments containing mathematical formulas or operations
  const nonHindiMathRegex = /([^\u0900-\u097F\n\r]+)/g;

  text = text.replace(nonHindiMathRegex, (segment) => {
    // If it already contains our placeholders, don't modify
    if (segment.includes('@@MATH_BLOCK_')) return segment;

    const trimmed = segment.trim();
    if (!trimmed) return segment;

    // Check if this segment contains mathematical indicators
    const hasMathIndicators = /[\^\\_=+*±×÷√≤≥≠⇒⇔→~·•]|\d+\s*\/\s*\d+|\(\s*[0-9a-zA-Z.\-+]+\s*\/\s*[0-9a-zA-Z.\-+]+\s*\)|(?:sqrt|cbrt|sin|cos|tan|log)\b/i.test(trimmed);

    // Exclude strings that are just labels or dates like "15/09/2020", "(a)", "(b)", etc.
    const isJustDate = /^\(?\d{1,2}\/\d{1,2}\/\d{2,4}\)?$/.test(trimmed);
    const isJustOptionLabel = /^\(?[a-eA-E1-5]\)?\.?$/.test(trimmed);

    if (hasMathIndicators && !isJustDate && !isJustOptionLabel) {
      // Preserve whitespace
      const leadingSpace = segment.match(/^\s*/)?.[0] || '';
      const trailingSpace = segment.match(/\s*$/)?.[0] || '';

      // Preserve leading punctuation from Hindi labels (e.g. "व्याख्या:" -> leading ":")
      let mathContent = trimmed;
      let leadingPunct = '';
      const leadPunctMatch = mathContent.match(/^[:\-\.,।]+/);
      if (leadPunctMatch) {
        leadingPunct = leadPunctMatch[0];
        mathContent = mathContent.slice(leadingPunct.length).trim();
      }

      // Preserve trailing punctuation (e.g. "?" or "." at sentence end)
      let trailingPunct = '';
      const trailPunctMatch = mathContent.match(/[:\-\?,\.।]+$/);
      if (trailPunctMatch && !/=\s*$/.test(mathContent)) {
        trailingPunct = trailPunctMatch[0];
        mathContent = mathContent.slice(0, -trailingPunct.length).trim();
      }

      if (!mathContent) return segment;

      const renderedHtml = renderMathSegment(mathContent, false);
      return leadingSpace + leadingPunct + (leadingPunct ? ' ' : '') + savePlaceholder(renderedHtml) + trailingPunct + trailingSpace;
    }

    return segment;
  });

  // 3. Restore all rendered KaTeX blocks
  placeholders.forEach((ph, i) => {
    text = text.replace(`@@MATH_BLOCK_${i}@@`, ph);
  });

  return text;
}
