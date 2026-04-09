import * as amplitude from "@amplitude/unified";

// ── Naming Convention ──────────────────────────────────────────────────────
// Format: [Object] [Action] — Title Case, Past Tense
// Events: "Topic Recommended", "Report Generation Started", etc.
// Properties: snake_case (e.g., report_type, difficulty)

const t = (name: string, props?: Record<string, unknown>) => amplitude.track(name, props);

export const track = {
  // ── Landing Page ───────────────────────────────────────────────────────
  heroCtaClicked: (cta: "get_topic" | "open_chat") => {
    t("CTA Button Clicked", { location: "hero", button: cta });
  },
  bottomCtaClicked: (cta: "get_topic" | "open_chat") => {
    t("CTA Button Clicked", { location: "bottom", button: cta });
  },

  // ── Subject Page (주제 입력 폼) ─────────────────────────────────────────
  subjectSelected: (subject: string) => {
    t("Subject Selected", { subject });
  },
  unitSelected: (level: "large" | "medium" | "small", unit: string) => {
    t("Unit Selected", { level, unit });
  },
  difficultySelected: (difficulty: string) => {
    t("Difficulty Selected", { difficulty_label: difficulty });
  },
  reportTypeSelected: (report_type: string) => {
    t("Report Type Selected", { report_type });
  },
  topicFormSubmitted: (props: {
    subject: string;
    unit_large: string;
    difficulty: string;
    report_type: string;
    has_career: boolean;
  }) => {
    t("Topic Form Submitted", props);
  },

  // ── Topic Confirm Page (주제 확인) ─────────────────────────────────────
  topicRecommended: (props: { topic_title: string; difficulty: string; tags: string[] }) => {
    t("Topic Recommended", props as unknown as Record<string, unknown>);
  },
  topicRefreshClicked: () => {
    t("Topic Refresh Clicked");
  },
  reportGenerationStarted: (props: { topic_title: string; report_type: string }) => {
    t("Report Generation Started", props);
  },

  // ── Report Detail Page (보고서 상세) ───────────────────────────────────
  reportViewed: (props: { report_id: string; status: string; report_type: string }) => {
    t("Report Viewed", props);
  },
  reportBookmarked: (props: { report_id: string; is_bookmarked: boolean }) => {
    t("Report Bookmarked", props);
  },
  reportDownloaded: (props: { report_id: string }) => {
    t("Report Downloaded", props);
  },
  reportEditStarted: (props: { report_id: string }) => {
    t("Report Edit Started", props);
  },
  reportEditSaved: (props: { report_id: string }) => {
    t("Report Edit Saved", props);
  },
  reportTabChanged: (tab: string) => {
    t("Report Tab Changed", { tab });
  },
  reportReviewAccepted: (props: { report_id: string }) => {
    t("Report Review Accepted", props);
  },

  // ── My Reports Page (기록 페이지) ──────────────────────────────────────
  myReportsViewed: (count: number) => {
    t("My Reports Viewed", { report_count: count });
  },
  reportCardClicked: (props: { report_id: string; status: string }) => {
    t("Report Card Clicked", props);
  },

  // ── Credits / Payment Page (크레딧) ────────────────────────────────────
  creditsPageViewed: () => {
    t("Credits Page Viewed");
  },
  creditPurchaseInitiated: (props: { package_code: string; amount: number }) => {
    t("Credit Purchase Initiated", props);
  },
  creditPurchaseCompleted: (props: {
    package_code: string;
    amount: number;
    credits_added: number;
  }) => {
    t("Credit Purchase Completed", props);
  },

  // ── Auth ───────────────────────────────────────────────────────────────
  loginPageViewed: () => {
    t("Login Page Viewed");
  },
  loginAttempted: (method: "google") => {
    t("Login Attempted", { method });
  },
};
