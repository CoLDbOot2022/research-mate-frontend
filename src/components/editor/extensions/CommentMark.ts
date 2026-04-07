import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment mark
       */
      setComment: (commentId: string) => ReturnType;
      /**
       * Unset a comment mark
       */
      unsetComment: (commentId: string) => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-yellow-200/60 border-b-2 border-yellow-400 cursor-pointer transition-colors hover:bg-yellow-300/80',
      },
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }

          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment: (commentId) => ({ commands }) => {
        return commands.setMark(this.name, { commentId });
      },
      unsetComment: (commentId) => ({ tr, dispatch }) => {
        if (!dispatch) return false;
        
        const { doc } = tr;
        let markRanges: { from: number; to: number }[] = [];
        
        doc.descendants((node, pos) => {
          node.marks.forEach(mark => {
            if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
              markRanges.push({ from: pos, to: pos + node.nodeSize });
            }
          });
        });

        markRanges.forEach(({ from, to }) => {
          tr.removeMark(from, to, this.type);
        });

        return true;
      },
    };
  },
});
