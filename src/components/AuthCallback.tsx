import React, { useEffect } from 'react';

export function AuthCallback() {
  useEffect(() => {
    // This component is meant to be opened in a popup window
    // It captures the Supabase session details from the hash/URL
    // and sends a completion message to the parent window (the main app).
    
    const handleSuccess = () => {
      if (window.opener) {
        // Send message to parent window
        window.opener.postMessage({ type: 'SUPABASE_OAUTH_SUCCESS' }, window.location.origin);
        // Popup will be closed by the parent or itself
        setTimeout(() => window.close(), 100);
      } else {
        // Fallback for non-popup flow
        window.location.href = '/';
      }
    };

    // Check if we have the result in the URL (hash usually contains access_token)
    if (window.location.hash || window.location.search.includes('code=')) {
      handleSuccess();
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-text">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold">Completing authentication...</p>
      </div>
    </div>
  );
}
