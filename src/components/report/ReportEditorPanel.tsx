"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { TipTapEditor, CommentData } from "@/components/editor/TipTapEditor";
import { CommentSidebar } from "@/components/editor/CommentSidebar";

type ReportEditorPanelProps = {
  editorHtml: string;
  editMode: boolean;
  comments: CommentData[];
  activeCommentId: string | null;
  failed?: boolean;
  failureInfo?: string;
  onChange: (html: string) => void;
  onCommentClick: (id: string) => void;
};

export function ReportEditorPanel({
  editorHtml,
  editMode,
  comments,
  activeCommentId,
  failed,
  failureInfo,
  onChange,
  onCommentClick,
}: ReportEditorPanelProps) {
  const hasComments = comments.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start print:block print:overflow-visible">
      {/* Main Editor Area */}
      <div className="lg:col-span-3 space-y-0 w-full print:block print:overflow-visible">
        {/* Edit mode indicator bar */}
        {editMode && (
          <div className="flex items-center gap-2 mb-3 px-1 no-print">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <p className="text-xs font-semibold text-indigo-600">
              수정 모드 — 본문을 직접 편집할 수 있습니다.
            </p>
          </div>
        )}

        {/* Paper wrapper */}
        <div
          className={`relative w-full rounded-2xl transition-all duration-300 print:static print:block print:overflow-visible ${
            editMode
              ? "ring-2 ring-indigo-300 ring-offset-2 shadow-lg shadow-indigo-100"
              : "shadow-sm"
          }`}
        >
          <div
            id="report-paper"
            className="print-area w-full max-w-[850px] mx-auto transition-all"
          >
            <div className="max-w-[850px] mx-auto space-y-8 bg-white rounded-2xl overflow-hidden">
              {/* Failure banner */}
              {failed && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mx-6 mt-6">
                  <p className="font-semibold mb-1">생성 실패</p>
                  <p>{failureInfo}</p>
                </div>
              )}

              {/* Editor or loader */}
              {editorHtml ? (
                <TipTapEditor
                  initialContent={editorHtml}
                  editable={editMode}
                  onChange={onChange}
                  comments={comments}
                  onCommentClick={onCommentClick}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">콘텐츠를 불러오는 중입니다...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Sidebar */}
      <div className="lg:col-span-1 no-print">
        <div className="sticky top-6">
          {hasComments ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-700">
                  코멘트 {comments.length}개
                </span>
              </div>
              <CommentSidebar
                comments={comments}
                activeCommentId={activeCommentId}
                onCommentClick={onCommentClick}
                editable={false}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                멘토 코멘트가 달리면
                <br />
                여기서 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
