import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const MathNode = Node.create({
  name: 'math',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      tex: {
        default: '',
        parseHTML: element => element.getAttribute('data-tex') || element.textContent,
        renderHTML: attributes => {
          return {
            'data-tex': attributes.tex,
          };
        },
      },
      displayMode: {
        default: false,
        parseHTML: element => element.getAttribute('data-display') === 'true',
        renderHTML: attributes => {
          return {
            'data-display': attributes.displayMode,
          };
        },
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-tex]',
      },
      {
        tag: 'span.math.math-inline',
        getAttrs: node => {
          if (typeof node === 'string') return {};
          const el = node as HTMLElement;
          return { tex: el.textContent, displayMode: false };
        }
      },
      {
        tag: 'div.math.math-display',
        getAttrs: node => {
          if (typeof node === 'string') return {};
          const el = node as HTMLElement;
          return { tex: el.textContent, displayMode: true };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    try {
      const isDisplay = String(HTMLAttributes['data-display']) === 'true';
      const texString = HTMLAttributes['data-tex'] || '';
      
      const html = katex.renderToString(texString, {
        throwOnError: false,
        displayMode: isDisplay,
      });
      
      return ['span', mergeAttributes(HTMLAttributes, { class: 'tiptap-math render', dangerouslySetInnerHTML: { __html: html } })];
    } catch (e) {
      return ['span', HTMLAttributes, `$${HTMLAttributes['data-tex']}$`];
    }
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span');
      span.classList.add('tiptap-math');
      span.classList.add('select-all');
      
      try {
        katex.render(node.attrs.tex, span, {
          throwOnError: false,
          displayMode: node.attrs.displayMode,
        });
      } catch (err) {
        span.innerText = node.attrs.displayMode ? `$$${node.attrs.tex}$$` : `$${node.attrs.tex}$`;
      }
      
      return {
        dom: span,
      };
    };
  },
});
