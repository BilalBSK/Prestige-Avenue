"use client";

import { useEffect, useState } from "react";

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function loadCsrfToken() {
      const response = await fetch("/api/csrf", { cache: "no-store" });
      const data = (await response.json()) as { csrfToken?: string };
      if (mounted && data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    }
    void loadCsrfToken();
    return () => {
      mounted = false;
    };
  }, []);

  return csrfToken;
}
