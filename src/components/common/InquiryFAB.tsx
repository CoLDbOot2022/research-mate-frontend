"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAccessToken } from "@/lib/auth";

export function InquiryFAB() {
  const router = useRouter();

  const handleClick = () => {
    if (getAccessToken()) {
      router.push("/support");
    } else {
      router.push("/login?redirect=/support");
    }
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-shadow hover:shadow-blue-200/50 group"
      aria-label="Support and Feedback"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="absolute -top-10 right-0 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg group-hover:block sm:inline-block">
        문의 및 피드백
        <div className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-slate-900" />
      </span>
    </motion.button>
  );
}
