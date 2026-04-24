import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Shield, Users, CheckCircle2, X, 
  ChevronRight, MessageCircle, Globe
} from 'lucide-react';
import { Gender } from './types';

interface EntryScreenProps {
  onJoin: (nickname: string, gender: Gender) => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onJoin }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLegalPopup, setShowLegalPopup] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [agreedLegal, setAgreedLegal] = useState(false);
  const [isAdult, setIsAdult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && gender && agreedLegal && isAdult) {
      onJoin(nickname, gender as Gender);
    }
  };

  const isFormValid = nickname.trim().length > 0 && gender !== '' && agreedLegal && isAdult;

  return (
    <div className="min-h-screen bg-[#1a1625] text-white flex flex-col relative font-sans">
      {/* Background Stylings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6b46c1]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9f7aea]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Landing View */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[#9f7aea] to-[#63b3ed] bg-clip-text text-transparent">Meet Someone New.</span><br />
            Start a Conversation.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Connect with interesting people from around the world. <br className="hidden md:block" /> No signup, no hassle — just real conversations.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#d53f8c' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-[#d53f8c] text-white px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(213,63,140,0.3)] transition-all"
          >
            <MessageCircle size={24} /> Join Now
          </motion.button>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full mt-24">
          <FeatureCard 
            icon={<Users className="text-[#9f7aea]" size={28} />}
            title="Live Chat Rooms"
            desc="Join city-based or interest-based rooms and meet like-minded people"
          />
          <FeatureCard 
            icon={<MessageSquare className="text-[#9f7aea]" size={28} />}
            title="Private Messages"
            desc="Start one-on-one conversations with anyone you connect with"
          />
          <FeatureCard 
            icon={<Shield className="text-[#9f7aea]" size={28} />}
            title="100% Anonymous"
            desc="No signup required. Your privacy is our priority"
          />
        </div>

        {/* Global Rooms Preview */}
        <div className="mt-32 w-full max-w-6xl">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="text-left">
                 <h2 className="text-3xl font-bold mb-2">Explore Global Rooms</h2>
                 <p className="text-gray-400 font-medium">Join thousands of people chatting right now</p>
              </div>
              <div className="flex items-center gap-2 bg-[#9f7aea]/10 text-[#9f7aea] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 1,248 People Online
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Lobby', 'Bangalore', 'Delhi', 'Music', 'Tech', 'Movies'].map((room) => (
                <div key={room} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group hover:-translate-y-1">
                   <div className="text-xs font-black uppercase tracking-widest text-[#9f7aea] mb-2">#{room}</div>
                   <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                      <Users size={12} /> {Math.floor(Math.random() * 100) + 10}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with App Name Ghosted Behind */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center overflow-hidden"
            >
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.05 }}
                className="text-[18vw] font-black uppercase tracking-tighter select-none pointer-events-none"
              >
                ChatBubble
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#2d2438] border border-white/5 rounded-[40px] p-10 shadow-2xl z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-pink-500/20 text-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe size={24} />
                </div>
                <h2 className="text-3xl font-bold mb-2">Create Profile</h2>
                <p className="text-sm text-gray-400">All fields are mandatory</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Nickname</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Enter your nickname"
                    className="w-full bg-[#1a1625] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f7aea]/50 transition-all font-medium"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Gender</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-[#1a1625] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#9f7aea]/50 transition-all appearance-none cursor-pointer font-medium"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                    >
                      <option value="" disabled>Select your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 py-4 border-y border-white/5">
                   <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreedLegal ? 'bg-[#9f7aea] border-[#9f7aea]' : 'border-white/10'}`}>
                         <input 
                            type="checkbox" 
                            className="hidden" 
                            required
                            checked={agreedLegal}
                            onChange={(e) => setAgreedLegal(e.target.checked)}
                          />
                         {agreedLegal && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        I accept <button type="button" onClick={() => setShowLegalPopup(true)} className="text-[#9f7aea] font-bold hover:underline">Terms of Use & Privacy Policy</button>
                      </span>
                   </label>

                   <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAdult ? 'bg-[#9f7aea] border-[#9f7aea]' : 'border-white/10'}`}>
                         <input 
                            type="checkbox" 
                            className="hidden" 
                            required
                            checked={isAdult}
                            onChange={(e) => setIsAdult(e.target.checked)}
                          />
                         {isAdult && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        I confirm that I am 18+ years old
                      </span>
                   </label>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full bg-gradient-to-r from-[#d53f8c] to-[#97266d] disabled:from-white/10 disabled:to-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#d53f8c]/20 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                >
                  Enter Chat <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legal Popup */}
      <AnimatePresence>
        {showLegalPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#2d2438] rounded-3xl p-8 max-h-[85vh] overflow-y-auto relative shadow-2xl border border-white/5"
            >
              <button 
                onClick={() => setShowLegalPopup(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/5 pb-4">Terms & Privacy</h3>
              
              <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
                <section>
                  <h4 className="font-bold text-[#9f7aea] mb-2 uppercase tracking-widest text-[10px]">1. Anonymity & Safety</h4>
                  <p>ChatBubble values your privacy. No phone numbers or emails are ever requested. Users are expected to maintain respect. Harassment or hate speech is strictly prohibited.</p>
                </section>
                
                <section>
                  <h4 className="font-bold text-[#9f7aea] mb-2 uppercase tracking-widest text-[10px]">2. Moderation Rules</h4>
                  <p>Our system uses an automated threshold. If 5 unique reporters flag your account, you will be automatically restricted for 6 hours. Temporary IP tracking is used for this purpose only.</p>
                </section>
                
                <section>
                  <h4 className="font-bold text-[#9f7aea] mb-2 uppercase tracking-widest text-[10px]">3. Data Policy</h4>
                  <p>Messages are transient and not permanently stored on our servers. Your nickname and gender are temporary for the session only. We do not store any personal history.</p>
                </section>

                <section>
                  <h4 className="font-bold text-[#9f7aea] mb-2 uppercase tracking-widest text-[10px]">4. Age Requirements</h4>
                  <p>You must be 18 years of age or older to use this service. By entering, you confirm you meet this requirement.</p>
                </section>
              </div>

              <button 
                onClick={() => {
                  setAgreedLegal(true);
                  setShowLegalPopup(false);
                }}
                className="w-full mt-10 bg-brand py-4 rounded-2xl font-bold hover:bg-brand-light transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
              >
                I Accept
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-white/5 px-6 text-center relative z-10">
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} ChatBubble. Made for meaningful anonymous connections.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] text-center hover:bg-white/10 transition-all group cursor-default">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-[#9f7aea]/10 transition-all duration-500 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-brand-light transition-colors">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed font-medium">{desc}</p>
  </div>
);
