"use client";

import { useEffect } from "react";
import * as amplitude from '@amplitude/unified';

export const AmplitudeInitializer = () => {
  useEffect(() => {
    // Only initialize once on the client
    amplitude.initAll('bea0f4b9e4ebbcf77413dfe115ada002', {
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
