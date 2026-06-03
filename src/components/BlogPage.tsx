import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  ChevronRight, 
  Sparkles, 
  Shield, 
  MessageCircle, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { Logo } from './Logo';
import { BLOG_POSTS, BlogPost } from '../constants/blogData';
import { AdUnit } from './AdUnit';

interface BlogPageProps {
  currentBlogSlug: string | null;
  onNavigateHome: () => void;
  onNavigateBlog: (slug: string | null) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ 
  currentBlogSlug, 
  onNavigateHome, 
  onNavigateBlog 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, callback: () => void) => {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    callback();
  };

  const activePost = BLOG_POSTS.find(p => p.slug === currentBlogSlug);

  useEffect(() => {
    if (activePost) {
      document.title = `${activePost.title} - ChatBubble Blog`;
    } else {
      document.title = 'Safety & Communication Blog - ChatBubble';
    }
    // Smooth scroll to top when changing route
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentBlogSlug, activePost]);

  // Sort posts latest first (descending timestamp order)
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });

  // Filter posts based on search query
  const filteredPosts = sortedPosts.filter(post => {
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.introduction.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-screen overflow-y-auto bg-bg text-text-muted flex flex-col selection:bg-brand/20 select-text">
      {/* Top Page Header Ad Banner */}
      <div className="w-full flex-shrink-0 flex justify-center py-2 bg-surface/50 border-b border-border relative z-30">
        <div className="hidden md:block">
          <AdUnit format="728x90" position="header" />
        </div>
        <div className="block md:hidden">
          <AdUnit format="320x50" position="header" />
        </div>
      </div>

      {/* Blog Sticky Header */}
      <header className="w-full py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <a href="/" onClick={(e) => handleLinkClick(e, onNavigateHome)} className="cursor-pointer">
            <Logo size="md" />
          </a>
          <div className="flex items-center gap-3">
            {currentBlogSlug && (
              <a
                href="/blog"
                onClick={(e) => handleLinkClick(e, () => onNavigateBlog(null))}
                className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-surface border border-transparent hover:border-border rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center"
              >
                All Articles
              </a>
            )}
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, onNavigateHome)}
              className="flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/15 text-brand rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              <ArrowLeft size={14} />
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Wrapper with Left & Right Skyscrapers */}
      <div className="flex-1 flex flex-row relative w-full justify-center">
        
        {/* Left Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="left" className="rounded-2xl" />
        </div>

        {/* Center Content Container */}
        <div className="flex-1 max-w-5xl flex flex-col items-center relative overflow-x-hidden min-w-0 w-full">
          
          {/* Main Container */}
          <main className="flex-1 w-full px-6 py-12 relative">
        {/* Visual Blur Accents */}
        <div className="absolute top-12 left-1/4 w-72 h-72 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {activePost ? (
          // === INDIVIDUAL BLOG ARTICLE PANE ===
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-3 gap-8 relative z-10"
          >
            {/* Left Column: Post Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Post Meta Header */}
              <div className="space-y-4">
                <a
                  href="/blog"
                  onClick={(e) => handleLinkClick(e, () => onNavigateBlog(null))}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                >
                  <ArrowLeft size={12} />
                  Back to All Articles
                </a>

                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-brand uppercase tracking-wider">
                  <span className="px-2.5 py-1 bg-brand/10 rounded-lg">{activePost.category}</span>
                  <span className="text-text-muted/40">•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {activePost.readTime}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text leading-tight">
                  {activePost.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-text-muted/70 font-medium">
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-brand" />
                    <span>By {activePost.author}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{activePost.date}</span>
                  </div>
                </div>
              </div>

              {/* Substantial Article Body */}
              <article className="prose max-w-none bg-surface border border-border p-8 md:p-12 rounded-3xl shadow-sm text-text-muted text-sm md:text-base leading-relaxed space-y-8">
                {/* Introduction */}
                <p className="text-text font-medium text-base md:text-lg border-l-4 border-brand pl-4 leading-relaxed italic">
                  {activePost.introduction}
                </p>

                {/* Sections */}
                {activePost.sections.map((sec, i) => (
                  <div key={i} className="space-y-3 pt-4">
                    <h2 className="text-xl md:text-2xl font-bold text-text tracking-tight">
                      {sec.title}
                    </h2>
                    <p className="text-text-muted leading-relaxed">
                      {sec.content}
                    </p>

                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-2 mt-3 pl-2">
                        {sec.bulletPoints.map((bp, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-brand/70 mt-2.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm leading-relaxed text-text-muted/95 font-medium">
                              {bp}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Conclusion */}
                <div className="border-t border-border/80 pt-6 mt-6 space-y-2">
                  <h3 className="text-base font-bold text-text uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-brand" />
                    Summary Guidelines
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {activePost.conclusion}
                  </p>
                </div>
              </article>

              {/* Navigation Footer Inside Article */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                <a
                  href="/blog"
                  onClick={(e) => handleLinkClick(e, () => onNavigateBlog(null))}
                  className="px-5 py-2.5 bg-surface border border-border hover:border-border/80 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center"
                >
                  View All Blog Articles
                </a>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick(e, onNavigateHome)}
                  className="px-6 py-3 bg-brand text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand/90 transition-all shadow-md shadow-brand/10 text-center"
                >
                  Launch Anonymous Chat
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Sidebar Panel */}
            <div className="space-y-6">
              {/* Sidebar Display Ad Banner */}
              <div className="flex justify-center border border-border bg-surface p-4 rounded-3xl overflow-hidden shadow-sm">
                <AdUnit format="300x250" />
              </div>

              {/* Platform Info Widget */}
              <div className="bg-gradient-to-br from-brand/5 to-indigo-500/5 border border-brand/20 p-6 rounded-3xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Shield size={12} />
                  Safe Zone Area
                </div>
                <h3 className="text-base font-bold text-text">Welcome to ChatBubble</h3>
                <p className="text-xs leading-relaxed text-text-muted/90">
                  We match thousands of people globally without storing chat records. Experience instant connection safely, 
                  and discover perspectives from around the globe.
                </p>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick(e, onNavigateHome)}
                  className="w-full py-2.5 bg-brand text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand/90 transition-all text-center block"
                >
                  Start Chatting Now
                </a>
              </div>

              {/* Other Popular Articles */}
              <div className="bg-surface border border-border p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-brand" />
                  Popular Resources
                </h3>
                
                <div className="space-y-3">
                  {BLOG_POSTS.filter(p => p.slug !== currentBlogSlug).map((post, i) => (
                    <a
                      key={i}
                      href={`/blog/${post.slug}`}
                      onClick={(e) => handleLinkClick(e, () => onNavigateBlog(post.slug))}
                      className="w-full text-left p-3 hover:bg-bg/50 border border-transparent hover:border-border/50 rounded-2xl group transition-all space-y-1 block"
                    >
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{post.category}</span>
                      <h4 className="text-xs font-bold text-text group-hover:text-brand leading-snug line-clamp-2 transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-[10px] text-text-muted/60">{post.readTime}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // === BLOG LISTINGS GRID ===
          <div className="space-y-10 relative z-10">
            {/* Header Column */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-heavy uppercase tracking-widest">
                <BookOpen size={12} />
                Knowledge Corridor
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text">
                ChatBubble Media Hub
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Unlock communication strategies, safety guides, and technological walkthroughs to enhance your anonymous social experience.
              </p>
            </div>

            {/* Interactive Filters Area Container - Centered and Search-only */}
            <div className="bg-surface border border-border p-4 rounded-2.5xl flex items-center justify-center">
              {/* Custom Search Box */}
              <div className="relative w-full max-w-lg">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50" />
                <input
                  type="text"
                  placeholder="Search articles by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-bg border border-border focus:border-brand/40 hover:border-border/80 rounded-2xl outline-none text-text text-sm leading-relaxed font-semibold transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Articles Grid Listing */}
            {filteredPosts.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Articles List */}
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                  {filteredPosts.map((post, i) => (
                    <motion.a
                      key={i}
                      href={`/blog/${post.slug}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      onClick={(e) => handleLinkClick(e, () => onNavigateBlog(post.slug))}
                      className="group bg-surface border border-border p-6 rounded-[2rem] hover:shadow-premium transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                    >
                      {/* Hover Glow Edge decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-brand uppercase tracking-wider">
                          <span>{post.category}</span>
                          <span className="flex items-center gap-1 text-text-muted/50">
                            <Clock size={11} />
                            {post.readTime}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-text leading-snug group-hover:text-brand transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-text-muted text-xs leading-relaxed font-semibold line-clamp-3">
                            {post.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-border/60 text-xs text-text-muted/60">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{post.date}</span>
                        </div>

                        <span className="flex items-center gap-1 font-bold text-brand group-hover:translate-x-1 transition-transform uppercase text-[10px] tracking-wider">
                          Read Article
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>

                {/* Right Column: Sidebar Display Ad and Widgets */}
                <div className="space-y-6">
                  {/* Sidebar Display Ad Banner (300x250) */}
                  <div className="flex flex-col items-center justify-center border border-border bg-surface p-4 rounded-[2rem] overflow-hidden shadow-sm">
                    <span className="text-[9px] font-bold text-text-muted/40 uppercase tracking-widest mb-2">Advertisement</span>
                    <AdUnit format="300x250" />
                  </div>

                  {/* Platform Protection Widget */}
                  <div className="bg-gradient-to-br from-brand/5 to-indigo-500/5 border border-brand/20 p-6 rounded-[2rem] space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <Shield size={12} />
                      Safe Corridor
                    </div>
                    <h3 className="text-base font-bold text-text">Incognito Social Space</h3>
                    <p className="text-xs leading-relaxed text-text-muted/90">
                      Connect instantly with real users worldwide in our fully encrypted and temporary chat corridor. Read our safety guides to stay anonymous.
                    </p>
                    <a
                      href="/"
                      onClick={(e) => handleLinkClick(e, onNavigateHome)}
                      className="w-full py-2.5 bg-brand text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand/90 text-center block transition-all"
                    >
                      Enter Lounge Chat
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-surface border border-border rounded-[2rem] space-y-4">
                <HelpCircle size={36} className="mx-auto text-text-muted/40" />
                <h3 className="text-lg font-bold text-text">No articles match your search</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  We couldn't find any articles matching your search query. Try searching for "Safety", "Anonymity", or "Icebrew".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-brand text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-brand/95 transition-all"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </main>

          {/* Bottom Footer Ad Banner */}
          <div className="w-full max-w-5xl px-6 mb-8 mt-4 flex items-center justify-center relative z-10 flex-shrink-0">
            <div className="hidden md:block">
              <AdUnit format="728x90" position="footer" />
            </div>
            <div className="block md:hidden">
              <AdUnit format="320x50" position="footer" />
            </div>
          </div>

          {/* Blog Screen Footer */}
          <footer className="w-full py-8 border-t border-border bg-surface/20">
            <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-muted/50 font-medium">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-brand" />
                <span>ChatBubble — Free Anonymous Chat Corridor</span>
              </div>
              <div>
                © {new Date().getFullYear()} ChatBubble. All rights reserved.
              </div>
            </div>
          </footer>

        </div> {/* End of Center Content Container */}

        {/* Right Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="right" className="rounded-2xl" />
        </div>

      </div> {/* End of Main Wrapper with Left & Right Skyscrapers */}

    </div>
  );
};
