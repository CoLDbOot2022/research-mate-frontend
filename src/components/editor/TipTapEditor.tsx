"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { CommentMark } from './extensions/CommentMark';
import { MathNode } from './extensions/MathNode';
import { PaginationPlus } from 'tiptap-pagination-plus';
import { useEffect, useState } from 'react';
import { MessageSquarePlus, Bold, Italic, Heading1, Heading2 } from 'lucide-react';

export type CommentData = {
  id: string;
  text: string;
  quote: string;
  createdAt: number;
};

interface TipTapEditorProps {
  initialContent: string;
  editable?: boolean;
  onChange?: (html: string) => void;
  onCommentCreated?: (comment: CommentData) => void;
  onCommentClick?: (commentId: string) => void;
  comments?: CommentData[];
}

export function TipTapEditor({
  initialContent,
  editable = true,
  onChange,
  onCommentCreated,
  onCommentClick,
  comments = [],
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      MathNode,
      CommentMark,
      PaginationPlus.configure({
        // Standard A4 dimensions
        pageWidth: 794,
        pageHeight: 1123,
        // Standard report margins (top/bottom: ~20mm, left/right: ~30mm)
        marginTop: 80,
        marginBottom: 80,
        marginLeft: 113,
        marginRight: 113,
        footerLeft: "",
        footerRight: "- {page} -", // Center formatting handled by CSS
      }),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none font-sans focus:outline-none min-h-[500px] prose-p:text-[14.5px] prose-p:leading-[1.65] prose-p:my-2.5 prose-headings:font-normal prose-h1:text-[24pt] prose-h2:text-[18pt] prose-h3:text-[14pt] prose-headings:text-slate-900 prose-headings:mt-6 prose-headings:mb-3 prose-li:text-[14.5px] prose-ul:my-2 prose-ol:my-2',
      },
      handleClick: (view, pos, event) => {
        if (!onCommentClick) return false;
        
        const target = event.target as HTMLElement;
        const commentSpan = target.closest('span[data-comment-id]');
        
        if (commentSpan) {
          const id = commentSpan.getAttribute('data-comment-id');
          if (id) {
            onCommentClick(id);
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync editable prop → editor instance whenever it changes (TipTap ignores re-renders)
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent && !editor.isFocused) {
      // Small workaround to prevent losing cursor position if editing
      // Usually you don't overwrite content while typing, so we check focus
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  // Update local variables for true A4 page lengths
  useEffect(() => {
    if (!editor) return;
    const updateHeight = () => {
      const dom = editor.view.dom as HTMLElement;
      // Count how many dividers the plugin has inserted
      const breaks = dom.querySelectorAll('.rm-page-break').length;
      const pages = breaks + 1;
      // Each A4 page is 1123px, each gap is 40px
      const targetHeight = (pages * 1123) + (breaks * 40);
      dom.style.minHeight = `${targetHeight}px`;
    };

    updateHeight();
    
    // Listen for DOM changes since text typing can cause the plugin to inject a new break
    editor.on('transaction', updateHeight);
    
    // Also use a ResizeObserver as a fallback
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(editor.view.dom);

    return () => {
      editor.off('transaction', updateHeight);
      observer.disconnect();
    };
  }, [editor]);

  if (!mounted || !editor) {
    return <div className="min-h-[300px] animate-pulse bg-slate-100 rounded-xl" />;
  }

  const handleAddComment = () => {
    if (!editor.state.selection.empty && onCommentCreated) {
      const { from, to } = editor.state.selection;
      const quote = editor.state.doc.textBetween(from, to, ' ');
      const text = prompt("코멘트를 입력하세요:");
      if (!text) return;

      const id = "comment-" + Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      editor.chain().focus().setComment(id).run();

      const newComment: CommentData = {
        id,
        text,
        quote,
        createdAt: Date.now(),
      };
      onCommentCreated(newComment);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2 mb-4 sticky top-0 bg-white z-10 transition-colors">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600'}`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-300 mx-1" />
          <button
            onClick={handleAddComment}
            disabled={editor.state.selection.empty}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            코멘트 달기
          </button>
        </div>
      )}
      
      <div className="flex-grow pt-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
