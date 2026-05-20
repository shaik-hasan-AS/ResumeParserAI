"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";

export default function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId) {
      console.error(
        "❌ [GoogleOAuth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in your environment variables (.env.local). Please restart your development server after adding it."
      );
    } else if (clientId.includes("placeholder-client-id")) {
      console.warn(
        "⚠️ [GoogleOAuth] You are using a placeholder Google Client ID. Make sure to replace it with a valid one from Google Cloud Console."
      );
    }
  }, [clientId]);

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

