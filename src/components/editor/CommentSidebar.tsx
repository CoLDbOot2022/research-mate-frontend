"use client";

import { CommentData } from './TipTapEditor';
import { MessageSquare, Trash2 } from 'lucide-react';

interface CommentSidebarProps {
  comments: CommentData[];
  activeCommentId: string | null;
  onCommentClick?: (id: string) => void;
  onCommentDelete?: (id: string) => void;
  editable?: boolean;
}

export function CommentSidebar({ comments, activeCommentId, onCommentClick, onCommentDelete, editable }: CommentSidebarProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 h-full">
        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">아직 작성된 멘토 코멘트가 없습니다.</p>
        {editable && <p className="text-xs mt-1">본문을 드래그하여 코멘트를 추가해보세요.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-2 pb-10">
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 sticky top-0 bg-white/90 backdrop-blur py-2 z-10">
        <MessageSquare className="w-4 h-4 text-slate-600" />
        멘토 피드백 목록 ({comments.length})
      </h3>
      
      {comments.map((comment) => {
        const isActive = activeCommentId === comment.id;
        
        return (
          <div 
            key={comment.id}
            onClick={() => onCommentClick?.(comment.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
              isActive 
                ? 'bg-slate-50 border-slate-300 shadow-md ring-2 ring-slate-100' 
                : 'bg-white border-slate-200 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-serif italic text-slate-500 bg-slate-100 p-2 rounded border-l-2 border-slate-300 mb-3 line-clamp-2">
              "{comment.quote}"
            </div>
            
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {comment.text}
            </p>
            
            <div className="mt-3 text-[10px] text-slate-400 flex justify-between items-center">
              <span>{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
            </div>

            {editable && onCommentDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentDelete(comment.id);
                }}
                className={`absolute top-2 right-2 p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50`}
                title="코멘트 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
