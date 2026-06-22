import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield, Zap, MessageSquare, BookOpen, Sparkles, HelpCircle, Heart, AlertTriangle } from 'lucide-react';
import { PolicyModal } from './components/PolicyModal';
import { Logo } from './components/Logo';
import { AdUnit } from './components/AdUnit';
import { AdConfigModal } from './components/AdConfigModal';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  AboutUsContent, 
  ContactUsContent 
} from './constants/policyContent';

interface LandingPageProps {
  onStart: () => void;
  totalUsers?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, totalUsers = 0 }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'ads' | null>(null);
  const [activeTab, setActiveTab] = useState<'safety' | 'etiquette' | 'tips'>('safety');

  // Format totalUsers with comma if it's a large number
  const formattedUserCount = totalUsers.toLocaleString();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      {/* Top Page Header Ad Banner */}
      <div className="w-full flex-shrink-0 flex justify-center py-2 bg-white border-b border-slate-100 relative z-30">
        <div className="hidden md:block">
          <AdUnit format="728x90" position="header" />
        </div>
        <div className="block md:hidden">
          <AdUnit format="320x50" position="header" />
        </div>
      </div>

      {/* Main Wrapper with Left & Right Skyscrapers */}
      <div className="flex-1 flex flex-row relative w-full justify-center">
        
        {/* Left Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="left" className="rounded-2xl" />
        </div>

        {/* Center Content Container */}
        <div className="flex-1 max-w-5xl flex flex-col items-center relative overflow-x-hidden min-w-0">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-screen bg-brand/5 -skew-x-12 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-brand/5 skew-x-12 -translate-x-1/4 pointer-events-none" />

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12 w-full relative z-10">
        <div className="text-center max-w-5xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand rounded-full border border-brand/5 transform hover:scale-105 transition-transform cursor-default">
                <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Real-time anonymous chat</span>
              </div>
              
              {totalUsers > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/5 rounded-lg border border-slate-900/5">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs font-black text-slate-600 tracking-tight">
                    <span className="text-brand tabular-nums">{formattedUserCount}</span> USERS ONLINE
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter leading-[0.95] font-display text-slate-950">
              Connections <br />
              <span className="text-brand">Simplified.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed font-medium mb-10">
              Talk to anyone, anywhere, instantly. 
              An anonymous social experience built for authentic conversations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <button 
              onClick={onStart}
              className="group relative px-10 py-5 bg-slate-950 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-brand/20 hover:bg-brand transition-all flex items-center gap-4 active:scale-95"
            >
              Start Chatting
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <MessageCircle size={18} />
              </div>
            </button>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> Encrypted & Private
            </p>
          </motion.div>
        </div>

        {/* Feature Grid - REORGANIZED FOR SYMMETRY */}
        <div className="flex flex-col gap-4 w-full max-w-5xl px-4">

          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">The Best Platform for Stranger Chat</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Chat Without Signup</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  ChatBubble is built on the philosophy that social interaction should be completely friction-free, natural, and instantaneous. We provide a premium suite of **free chatrooms without registration**, specifically engineered to allow users around the world to bypass typical web bottlenecks. By avoiding registration forms, security questions, or personal email verifications, you can jump directly into genuine digital encounters. This ephemeral approach lets you discover new cultures, share random thoughts, or find casual digital companions with absolute ease.
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Secure & Anonymous</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  In an era dominated by invasive tracking, commercial data profiling, and permanent social footprints, ChatBubble serves as a secure digital sanctuary. Our specialized **anonymous chat rooms** guarantee that your personal identifiers remain entirely confidential. We employ transient, in-memory architectures to run our routing tables: we do not write temporary conversations to disk, we do not record IP addresses on databases, and we enforce a zero-log policy. Your browser fingerprint stays isolated, and every active session dissolves the moment you exit.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Global Communities</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Whether you are seeking custom **chat rooms in India**, connecting with friends in the United States, or engaging in dynamic group discussions across the United Kingdom, our network bridges geographical distances in milliseconds. The general lounge functions as a global town square where users from more than 150 countries exchange specialized views, practice foreign languages, and break down stereotypes. It is the ultimate digital environment to **talk to strangers** and experience authentic cultural dialogues.
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Moderated Experience</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  To ensure that ChatBubble remains a lighthearted, clean, and welcoming environment, we deploy state-of-the-art moderation logic inside our system corridors. Our servers leverage real-time keyword filters, automated spam detection daemons, and manual reporting mechanisms to filter out commercial advertisements, obscene behavior, and repetitive bot loops. This dual-layered verification system blocks unsolicited links and protects participants from harassment while fully preserving their personal anonymity.
                </p>
              </div>
            </div>
            
            <div className="mt-12 pt-12 border-t border-slate-100 grid sm:grid-cols-3 gap-8">
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">24/7 Availability</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Our backend nodes are strategically balanced across multiple Cloud Run instances, delivering 99.9% uptime uptime for our global community of thousands of active digital chatter. Enjoy zero-latency packet deliveries day or night.</p>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Mobile Optimized</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">Experience fluid chats across any browser or device viewport. Our high-performance styling works beautifully on iOS, Android, and tablets, fully integrating safe layout safe areas and touch target sizes for seamless tap and swipe play.</p>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Rich Features</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed">We support active filters, direct interest matchmaking, real-time typing indicators, clean emojis, and instant session skipping. ChatBubble delivers all the capability of high-scale social platforms without the tracking or bloated scripts.</p>
              </div>
            </div>
          </section>

          {/* Responsive Horizontal Ad Banner - SEO Footer Area */}
          <div className="w-full max-w-5xl my-6 flex items-center justify-center relative z-10 flex-shrink-0">
            <div className="hidden md:block">
              <AdUnit format="728x90" position="footer" />
            </div>
            <div className="block md:hidden">
              <AdUnit format="320x50" position="footer" />
            </div>
          </div>



          {/* Symmetrical Feature Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-brand/30 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight text-slate-950">Anonymous Chat Rooms</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                  Engage in specialized digital rooms and global chatter corridors. Connect based on shared interests or practice active listening with random stranger matches worldwide. Our infrastructure guarantees direct, low-latency client-to-client pipelines.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-brand text-white rounded-[2.5rem] shadow-xl flex flex-col justify-between group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Instant No Signup Chat</h3>
                <p className="text-white/80 text-sm leading-relaxed font-semibold">
                  Experience immediate random matchmaking with zero wait times. By avoiding registration walls, we keep all socket interactions completely private, making it exceptionally safe to connect and talk to strangers instantly under state-of-the-art secure standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Safety & Communication Resource Hub */}
        <div id="safety-resource-hub" className="w-full max-w-5xl px-4 relative z-10 mb-16">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand rounded-full mb-4">
                <BookOpen size={13} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Resource & Safety Center</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Safe Online Communication Handbook
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                We advocate for safe, respectful, and genuine stranger conversations. Read through our helpful guides, 
                privacy recommendations, and communication icebreakers to elevate your chatroom experience.
              </p>
            </div>

            {/* Tab selection buttons */}
            <div className="flex justify-center border-b border-slate-100 pb-4 mb-8">
              <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'safety'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Shield size={14} />
                  Safety First
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('etiquette')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'etiquette'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} />
                  Etiquette Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tips')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'tips'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={14} />
                  Icebreakers FAQ
                </button>
              </div>
            </div>

            {/* Tab content wrapper */}
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              {activeTab === 'safety' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Protect Personal Identifiers</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Never share highly specific identifiers such as your exact physical coordinates, workplace or school names, personal phone contacts, official email handles, or active visual profiles (such as private Instagram, Snapchat, or Discord handles) right away. Safe chatting is anchored on maintaining absolute anonymity until deep, reciprocal trust is systematically established. Guarding your background descriptors protects you from phishing scams and off-site cyberstalking.
                      </p>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold tracking-widest mt-4 uppercase">MINIMAL REVEAL PRINCIPLE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
                        <Shield size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Detect External Link Scams</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Strictly avoid clicking or copying unverified URLs, shortened links, or invitations to join third-party platforms, download customized plugins, or register for off-site communities. Malicious actors frequently attempt to lure chat participants into external web spaces to bypass ChatBubble's filter systems. All safe, authentic stranger chat sessions originate and run locally within this isolated browser window.
                      </p>
                    </div>
                    <span className="text-[10px] text-brand font-bold tracking-widest mt-4 uppercase">SAFE INTERFACES ZONE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Maintain Absolute Financial Security</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Be highly skeptical of any room participant who begins constructing highly emotional narratives, emergency scenarios, or business investment schemes designed to solicit cash transfers, digital gift cards, or cryptocurrency payments. ChatBubble is an entirely free social environment; we never request billing transactions, bank deposits, or identity verification fees to continue your chatter play.
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold tracking-widest mt-4 uppercase">FINANCIAL SHIELD</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-xl mb-4">
                        <Shield size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Master the Clean-Exit Protocol</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        You hold total control over your digital window. If a partner begins utilizing inappropriate language, steers the dialogue toward offensive topics, or violates web communication boundaries, simply click the 'Next' button or leave the chat lobby entirely. There is zero obligation to remain in a conversation that makes you feel uncomfortable, and skipping instantly repositions you in a clean queue.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-600 font-bold tracking-widest mt-4 uppercase">USER EMPOWERMENT</span>
                  </div>
                </>
              )}

              {activeTab === 'etiquette' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-xl mb-4">
                        <Heart size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Practice Empathy & Respect</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Anonymity is a powerful privilege that is most rewarding when paired with basic human respect. Always approach your chat counterpart with polite greeting hooks and welcoming, constructive questions. Treat each interaction as an opportunity to discover unique worldviews, keeping the online atmosphere friendly, intellectual, and thoroughly safe.
                      </p>
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold tracking-widest mt-4 uppercase">MATURE PARTICIPATION</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-rose-50 text-rose-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 font-sans">Zero Tolerance for Abuse</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Hate speech, explicit slurs, sexual harassment, or discriminatory remarks regarding any geopolitical background, culture, gender, or belief system are strictly banned on our servers. Our filters actively inspect room texts, and reporting is immediate. We enforce rigid IP bans against policy violators to ensure the platform remains secure and inviting.
                      </p>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-widest mt-4 uppercase">MODERATION CODE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-sky-50 text-sky-600 rounded-xl mb-4">
                        <MessageSquare size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Keep Chats Non-commercial</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Flooding the corridors with repetitive advertising copies, affiliate marketing schemes, or random promo URLs triggers immediate automated disconnection. ChatBubble is exclusively designed for organic, peer-to-peer conversations, human-to-human. Keeping the community free from spam ensures higher exchange quality for true users.
                      </p>
                    </div>
                    <span className="text-[10px] text-sky-600 font-bold tracking-widest mt-4 uppercase">ANTI-BOT LAWS</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4">
                        <Users size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Cultivate Intercultural Openness</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        With designated matching channels encompassing networks from the United States, Europe, India, and other global regions, you will regularly encounter diverse lifestyles and cultural paradigms. Embrace these moments to gain rich global wisdom, remain genuinely curious, and learn how people across different time zones navigate their daily challenges.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-widest mt-4 uppercase">GLOBAL COMMERCE</span>
                  </div>
                </>
              )}

              {activeTab === 'tips' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-yellow-50 text-yellow-600 rounded-xl mb-4">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Deploy Inspiring Warm-Ups</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Bypass the classic, dull ASL routine and start chat rooms with a creative question. Try asking: "If you could master any specialized skill over the course of one night, what would you choose?" or "What film or book completely altered how you view daily life?" Inspiring intros double your partner's staying time.
                      </p>
                    </div>
                    <span className="text-[10px] text-yellow-600 font-bold tracking-widest mt-4 uppercase">ICEBREAKING HANDBOOK</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-500 rounded-xl mb-4">
                        <MessageSquare size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Practice True Active Listening</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        A great digital dialogue is highly symmetrical and mutual. Avoid waiting for your turn to type a story; instead, pay close attention to your partner's sentences. Ask relevant, open-ended follow-up questions to demonstrate active interest, which encourages deeper sharing and makes the interaction memorable.
                      </p>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold tracking-widest mt-4 uppercase">FLOW METRICS</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-xl mb-4">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Radiate Lighthearted Optimism</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Optimism is incredibly infectious in a chat lobby. Discuss your hobbies, favorite pet animals, coding projects, cooking recipes, or latest outdoor travels. Structuring your conversations with positive, lighthearted framing draws people in and naturally filters out hostile exchanges.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-600 font-bold tracking-widest mt-4 uppercase">ATMOSPHERE DECREES</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between text-left">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-violet-50 text-violet-600 rounded-xl mb-4">
                        <Users size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Gracefully Accept the Next Button</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Anonymous chat sessions are fundamentally transient. If someone chooses to click 'Next' and skip your room, support their choice without taking it personally. Some users are searching for specific interest tags. Maintain a calm, positive mindset and warmly greet the next matched person.
                      </p>
                    </div>
                    <span className="text-[10px] text-violet-600 font-bold tracking-widest mt-4 uppercase">DETACHMENT GUIDE</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced FAQ System */}
        <div className="mt-16 w-full max-w-5xl px-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950 mb-10 text-center tracking-tight">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                {
                  q: "Is ChatBubble 100% free anonymous chat?",
                  a: "Yes, our anonymous chat is completely free for everyone. There are no registration forms, subscription tiers, premium locks, or hidden charges of any kind. You can join specialized global corridors, localized matchmaking rooms, and talk to strangers instantly without creating an account or providing email verification feeds. Our goal is to keep authentic, organic online chat accessible to any digital citizen with an active browser connection."
                },
                {
                  q: "How does the platform secure my browser safety and privacy?",
                  a: "We minimize data collection structurally and by design. ChatBubble does not record your IP address on durable database disks, nor do we store persistent chat history on physical servers. All messages are transmitted live using standard in-memory WebSockets that vanish from RAM the moment a chat room pair is skipped or closed. By avoiding permanent digital footprints, our users are protected from identity correlation and security leaks."
                },
                {
                  q: "Can I choose chat rooms by region, like India, USA, or Europe?",
                  a: "Yes! Our intelligent matching protocols allow you to connect randomly with users worldwide or align with localized chat rooms in major regions like India, the United States, United Kingdom, and Europe. This geographic flexibility provides a perfect blend of learning about diverse world cultures, practicing foreign languages, and engaging in regional, high-relevance dialogues in a smooth, high-speed interface."
                },
                {
                  q: "How does the real-time moderation engine handle bad players?",
                  a: "We deploy multi-layered automated keyword filters, spam-pattern detectors, and a simple peer reporting tool. If a participant presents commercial spam, explicit solicitations, or abusive speech, simply click the reporting triggers in the chat panel. This instantly alerts our automated moderation daemons to evaluate the connection metrics and enforce swift, programmatic IP bans against policy-violating clients."
                },
                {
                  q: "Why does ChatBubble not support video streaming or image uploads?",
                  a: "To maximize user safety, preserve browser bandwidth, and comply with strict clean-web policies, we intentionally keep our chat lobbies restricted to lightweight text interactions. This fully eliminates the risk of receiving malicious media file uploads, explicit visuals, or automated screen captures, maintaining a friendly, low-anxiety, and exceptionally cozy environment for all chatters."
                },
                {
                  q: "Do I need to install any custom extension to run ChatBubble?",
                  a: "Not at all. ChatBubble is built on open modern web standards that run natively across all updated versions of Chrome, Safari, Firefox, Edge, and mobile operating system browsers. There is zero bloat, zero background trackers, and no requirement to download separate plug-ins, files, or custom extensions. Your session starts instantly and cleanly with a simple button tap."
                },
                {
                  q: "Why does this platform show banner advertisements?",
                  a: "Operating thousands of simultaneous, zero-latency WebSockets globally requires significant high-end server resource allocations. To keep the service entirely free and performant without subscription walls, we partner with premium, clean advertising providers (including Google AdSense). These third-party ad blocks are integrated carefully to ensure they do not disrupt the chat interface or conflict with user safety."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                     <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0" />
                     <h4 className="text-base font-bold text-slate-950 leading-snug">{item.q}</h4>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium pl-4">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Ad Banner - Bottom Footer Area */}
      <div className="w-full max-w-5xl px-6 mb-8 mt-12 flex items-center justify-center relative z-10 flex-shrink-0">
        <div className="hidden md:block">
          <AdUnit format="728x90" position="footer" />
        </div>
        <div className="block md:hidden">
          <AdUnit format="320x50" position="footer" />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-200 bg-white text-slate-800 relative z-10 font-sans">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" />
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                ChatBubble is a premier anonymous social platform offering immediate, free stranger chats without registration. Experience private, safe communication tunnels designed for authentic interactions in 2026.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] uppercase tracking-wider">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Encrypted & Private</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">No Registration</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Global Match</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Popular Rooms</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li><span className="hover:text-brand cursor-default">General Corridor</span></li>
                <li><span className="hover:text-brand cursor-default">Global Stranger Lobby</span></li>
                <li><span className="hover:text-brand cursor-default">India Chat Lounge</span></li>
                <li><span className="hover:text-brand cursor-default">Interactive Arts & Tech</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Legal & Support</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-bold">
                <li>
                  <button onClick={() => setModalType('about')} className="hover:text-brand transition-colors text-left uppercase text-[10px] tracking-wider text-slate-600">About Us</button>
                </li>
                <li>
                  <button onClick={() => setModalType('contact')} className="hover:text-brand transition-colors text-left uppercase text-[10px] tracking-wider text-slate-600">Contact & Support</button>
                </li>
                <li>
                  <a 
                    href="/blog" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/blog');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/privacy');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/terms');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium pt-2">
            <p>© {new Date().getFullYear()} CHATBUBBLE Anonymous Communications. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 uppercase text-[10px] tracking-widest font-bold text-slate-400/80">
              <span>Made for Connection</span>
              <span>Secure WebSocket Core</span>
            </div>
          </div>
        </div>
      </footer>

        </div> {/* End of Center Content Container */}

        {/* Right Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="right" className="rounded-2xl" />
        </div>

      </div> {/* End of Main Wrapper with Left & Right Skyscrapers */}

      <PolicyModal 
        isOpen={modalType === 'about'} 
        onClose={() => setModalType(null)} 
        title="About ChatBubble"
      >
        <AboutUsContent />
      </PolicyModal>

      <PolicyModal 
        isOpen={modalType === 'contact'} 
        onClose={() => setModalType(null)} 
        title="Contact Us"
      >
        <ContactUsContent />
      </PolicyModal>

      <AdConfigModal 
        isOpen={modalType === 'ads'} 
        onClose={() => setModalType(null)} 
      />
    </div>
  );
};
