import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';
import { PrivacyPolicyContent, TermsOfServiceContent, AboutUsContent, ContactUsContent } from '../constants/policyContent';

interface PolicyPageProps {
  type: 'privacy' | 'terms';
  onNavigateHome: () => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type, onNavigateHome }) => {
  const isPrivacy = type === 'privacy';

  useEffect(() => {
    // Set document title dynamically for crawlers and tabs
    document.title = isPrivacy ? 'Privacy Policy - ChatBubble' : 'Terms of Service - ChatBubble';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [type, isPrivacy]);

  return (
    <div className="min-h-screen bg-bg text-text-muted flex flex-col selection:bg-brand/20 select-text">
      {/* Policy Page Header */}
      <header className="w-full py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="cursor-pointer" onClick={onNavigateHome}>
            <Logo size="md" />
          </div>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/15 text-brand rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16 relative">
        {/* Subtle decorative glows so the page feels professional but clean */}
        <div className="absolute top-12 left-1/4 w-72 h-72 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 space-y-10"
        >
          {/* Breadcrumb & Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-widest">
              {isPrivacy ? <Shield size={14} /> : <FileText size={14} />}
              <span>Official Document</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <p className="text-sm text-text-muted/70 font-medium">
              Last updated: June 3, 2026 • ChatBubble Anonymous Chat Platform
            </p>
          </div>

          {/* Quick Summary Card for User-Friendly UX */}
          <div className="p-6 bg-surface border border-border rounded-2.5xl shadow-sm">
            <h2 className="text-base font-bold text-text mb-2 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-brand" />
              Quick Summary for Our Users
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              We operate ChatBubble as a completely anonymous and ephemeral service. This means we do not ask you to register,
              provide an email address, or link personal profiles. Our temporary WebSocket connections do not log or store chat histories
              permanently. We present these guidelines to guarantee service compliance, safeguard participant privacy, and satisfy our automated
              moderation rules.
            </p>
          </div>

          {/* Main policy content */}
          <article className="prose prose-invert prose-brand max-w-none bg-surface/40 border border-border p-8 md:p-12 rounded-3xl shadow-sm">
            {isPrivacy ? <PrivacyPolicyContent /> : <TermsOfServiceContent />}
          </article>

          {/* Navigation helpers at the bottom */}
          <div className="pt-6 border-t border-border flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 text-xs font-bold">
              {isPrivacy ? (
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/terms');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:text-brand transition-colors text-text-muted/80 underline underline-offset-4"
                >
                  View Terms of Service
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/privacy');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:text-brand transition-colors text-text-muted/80 underline underline-offset-4"
                >
                  View Privacy Policy
                </button>
              )}
            </div>

            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-brand text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand/90 transition-all shadow-md shadow-brand/10 hover:shadow-brand/20"
            >
              Start Chatting Now
            </button>
          </div>
        </motion.div>
      </main>

      {/* Auxiliary Footer links to meet crawler criteria */}
      <footer className="w-full py-8 border-t border-border bg-surface/20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-muted/50 font-medium">
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-brand" />
            <span>ChatBubble — Free Anonymous Chatroom Corridor</span>
          </div>
          <div>
            © {new Date().getFullYear()} ChatBubble. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
