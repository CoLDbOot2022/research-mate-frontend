"use client";

import { useEffect, useRef, useState } from "react";

import { setAccessToken } from "@/lib/auth";

type Props = {
  onSuccess?: () => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    }
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleLoginButton({ onSuccess }: Props) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const loadScript = () => {
      const existing = document.getElementById("google-identity-script");
      if (existing) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = "google-identity-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Identity script"));
        document.body.appendChild(script);
      });
    };

    const init = async () => {
      try {
        await loadScript();
        if (!window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: GoogleCredentialResponse) => {
            if (!response.credential) return;
            try {
              setError("");
              const res = await fetch(`${BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: response.credential }),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data?.detail || "Google 로그인에 실패했습니다.");
              }
              if (data.access_token) {
                setAccessToken(data.access_token);
                onSuccess?.();
              }
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Google 로그인 실패");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
          text: "signin_with",
        });
      } catch {
        setError("Google 로그인 버튼을 불러오지 못했습니다.");
      }
    };

    init().catch(() => setError("Google 로그인 초기화 실패"));
  }, [onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    return <p className="text-xs text-slate-500">Google 로그인은 설정 후 활성화됩니다.</p>;
  }

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className="flex justify-center" />
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
