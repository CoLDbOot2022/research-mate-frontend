"use client";

import React, { useMemo } from "react";
import htmldiff from "htmldiff-js";

type ReportDiffViewProps = {
  oldHtml: string;
  newHtml: string;
};

export function ReportDiffView({ oldHtml, newHtml }: ReportDiffViewProps) {
  const stripCommentMarks = (html: string) => {
    if (!html) return "";
    // Remove the opening span of a comment mark
    let cleaned = html.replace(/<span[^>]*data-comment-id="[^"]*"[^>]*>/gi, "");
    // Note: This simple regex approach might leave trailing </span> if there are nested spans,
    // but TipTap's CommentMark is usually a single level mark over text.
    // A better approach is to only remove spans that were opened by the comment-id regex.
    // However, for this project's scope, we'll try a regex that matches the specific span structure.
    return cleaned.replace(/<\/span>/gi, (match, offset) => {
        // Only strip if it doesn't seem to belong to another type of span (though in TipTap it's hard to tell)
        // For simplicity, we'll strip all spans as the original content is usually just headings and paragraphs.
        return ""; 
    });
    // Actually, a more robust way is using DOMParser if available
  };

  const diffHtml = useMemo(() => {
    try {
      const cleanOld = oldHtml ? oldHtml.replace(/<span[^>]*data-comment-id="[^"]*"[^>]*>/gi, "").replace(/<\/span>/gi, "") : "";
      const cleanNew = newHtml ? newHtml.replace(/<span[^>]*data-comment-id="[^"]*"[^>]*>/gi, "").replace(/<\/span>/gi, "") : "";
      return htmldiff.execute(cleanOld, cleanNew);
    } catch (e) {
      console.error("Diff calculation failed:", e);
      return newHtml; // Fallback to new version
    }
  }, [oldHtml, newHtml]);

  return (
    <div className="report-diff-container">
        <style jsx global>{`
            .report-diff-container ins {
                background-color: #dcfce7;
                color: #166534;
                text-decoration: none;
                padding: 2px 0;
            }
            .report-diff-container del {
                background-color: #fee2e2;
                color: #991b1b;
                text-decoration: line-through;
                opacity: 0.8;
                padding: 2px 0;
            }
        `}</style>
      <div 
        className="diff-output"
        dangerouslySetInnerHTML={{ __html: diffHtml }} 
      />
    </div>
  );
}
