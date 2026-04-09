import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function flattenLists(html: string): string {
  if (!html) return '';
  return html
    .replace(/<ul>([\s\S]*?)<\/ul>/g, (match, inner) => {
      return inner.replace(/<li>([\s\S]*?)<\/li>/g, '<p style="margin-left: 20px;">• $1</p>');
    })
    .replace(/<ol>([\s\S]*?)<\/ol>/g, (match, inner) => {
      let index = 1;
      return inner.replace(/<li>([\s\S]*?)<\/li>/g, (m: any, p1: any) => `<p style="margin-left: 20px;">${index++}. ${p1}</p>`);
    });
}

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Replace display math $$...$$
  let processed = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
    return `<div class="math math-display" data-display="true" data-tex="${escapeHtml(tex.trim())}"></div>\n`;
  });
  
  // Replace inline math $...$
  processed = processed.replace(/\$([^\n$]+)\$/g, (match, tex) => {
    return `<span class="math math-inline" data-display="false" data-tex="${escapeHtml(tex.trim())}"></span>`;
  });

  // Parse markdown
  let rawHtml = marked.parse(processed, { async: false }) as string;
  
  // Flatten lists into paragraphs so TipTap's pagination can properly split them across pages.
  // Because TipTap treats <ul> as a single block, lists taller than a page will overflow infinitely.
  rawHtml = flattenLists(rawHtml);

  // Only purify in browser
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['span', 'div'],
      ADD_ATTR: ['data-tex', 'data-display', 'data-comment-id', 'style'], // Added style to retain flattened list padding
    });
  }
  return rawHtml;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
