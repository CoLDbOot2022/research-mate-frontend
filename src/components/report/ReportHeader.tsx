"use client";

import {
  Bookmark,
  BookmarkCheck,
  Download,
  Loader2,
  Pencil,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ReportHeaderProps = {
  title: string;
  reportType: "general" | "premium";
  status: string;
  isBookmarked: boolean;
  editMode: boolean;
  saving: boolean;
  disabled: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
  onDownloadPdf: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  awaiting_review: "멘토 리뷰 대기 중",
  completed: "생성 완료",
  generating: "생성 중",
  failed: "생성 실패",
};

export function ReportHeader({
  title,
  reportType,
  status,
  isBookmarked,
  editMode,
  saving,
  disabled,
  onBack,
  onToggleBookmark,
  onDownloadPdf,
  onToggleEdit,
  onSave,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6 no-print">
      {/* Left: title + status */}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate max-w-[480px]">
            {title}
          </h1>
          {reportType === "premium" && (
            <span className="inline-flex items-center text-[10px] bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 uppercase font-black tracking-widest leading-none shrink-0">
              ✦ Premium
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : status === "awaiting_review"
                ? "bg-indigo-100 text-indigo-700"
                : status === "failed"
                ? "bg-red-100 text-red-600"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <Button variant="outline" size="sm" onClick={onBack} className="rounded-full px-4">
          목록
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleBookmark}
          className="rounded-full px-4"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
          )}
          {isBookmarked ? "저장됨" : "북마크"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadPdf}
          className="rounded-full px-4"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          PDF
        </Button>

        {!editMode && status !== "awaiting_review" && (
          <Button
            variant="default"
            size="sm"
            onClick={onToggleEdit}
            disabled={disabled}
            className="rounded-full px-4 bg-slate-900 hover:bg-slate-800 text-white transition-all"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            수정 모드
          </Button>
        )}

        {editMode && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || disabled}
            className="rounded-full px-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200/50 transition-all"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            저장
          </Button>
        )}
      </div>
    </div>
  );
}
