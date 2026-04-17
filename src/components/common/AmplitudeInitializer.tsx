"use client";

import { useEffect } from "react";
import * as amplitude from '@amplitude/unified';

export const AmplitudeInitializer = () => {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

    if (!apiKey) {
      console.warn("Amplitude API Key is missing. Analytics will not be initialized.");
      return;
    }

    // Only initialize once on the client
    amplitude.initAll(apiKey, {
      analytics: {
        autocapture: true,
      },
      sessionReplay: {
        sampleRate: 1,
      },
    });
  }, []);

  return null;
};
