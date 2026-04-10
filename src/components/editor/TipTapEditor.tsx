"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { CommentMark } from './extensions/CommentMark';
import { MathNode } from './extensions/MathNode';
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
  showCommentControls?: boolean;
  hideComments?: boolean;
}

export function TipTapEditor({
  initialContent,
  editable = true,
  onChange,
  onCommentCreated,
  onCommentClick,
  comments = [],
  showCommentControls = true,
  hideComments = false,
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      MathNode,
      CommentMark,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onSelectionUpdate: () => setTick(t => t + 1),
    onTransaction: () => setTick(t => t + 1),
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:mb-2 prose-h2:text-2xl prose-p:leading-relaxed prose-headings:font-bold',
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
    if (!editor || !initialContent) return;
    
    const currentHTML = editor.getHTML();
    // Only update if content is fundamentally different and editor isn't focused
    // or if the editor is completely empty but we have content
    if (currentHTML !== initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  if (!mounted || !editor) {
    return <div className="min-h-[300px] animate-pulse bg-slate-100 rounded-xl" />;
  }

  const handleAddComment = () => {
    if (editor.state.selection.empty) {
      alert("코멘트를 달 본문의 텍스트를 먼저 드래그하여 선택해 주세요.");
      return;
    }

    if (onCommentCreated) {
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
    <div className={`w-full flex flex-col ${hideComments ? 'hide-comments' : ''}`}>
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
          {showCommentControls && (
            <button
              onClick={handleAddComment}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors ml-auto"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              코멘트 달기
            </button>
          )}
        </div>
      )}
      
      <div className="flex-grow">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
