import React from 'react';

export const PrivacyPolicyContent = () => (
  <div className="space-y-6 text-[13px] md:text-sm text-slate-500 leading-relaxed font-sans">
    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">1. Comprehensive Overview & Commitment</h3>
      <p>Welcome to ChatBubble (referred to herein as "the Platform", "we", "us", or "our"). We are dedicated to delivering a seamless, secure, and fully anonymous digital corridor for individuals worldwide. This Privacy Policy outlines our transparent, strict data-handling practices, your privacy rights, and how global regulations safeguard your interaction details when accessing our services.</p>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">2. Data Architecture & Minimalist Collection Principles</h3>
      <p>By architectural design, ChatBubble is a zero-registration, non-profile social space. We do not demand, collect, or store personal identifiers such as your legal name, physical address, mobile contact numbers, credentials, or email addresses. Your connection parameters are treated under the following strict categories:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li><strong>Temporary Technical Logs:</strong> We temporarily ingest standard browser headers, device parameters, and your current IP address. This processing is performed solely under our legitimate interest to enforce platform security, regulate rate limits, and block spam, automated bots, or abusive behaviors.</li>
        <li><strong>Ephemeral Session Data:</strong> All message transcripts shared during conversations run via random transient WebSockets in random-access memory (RAM). Transcripts are permanently destroyed the moment you or your chat partner disconnects or skips the session. No message backlogs are ever written onto our physical storage discs.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">3. Advertising Disclosures, Cookies, & Third-Party Integrations</h3>
      <p>To support the high-capacity websocket infrastructure required to operate ChatBubble at zero cost to our global audience, we collaborate with recognized third-party publishing and advertising agencies (including Google AdSense, Adsterra, and regional network providers). These advertising entities may deploy diagnostic cookies, web beacons, or tracking pixels to serve hyper-granular, contextual, or personalized banner ads directly within your browser window.</p>
      <div className="mt-3 bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
        <p><strong>Google DoubleClick DART Cookies:</strong> Google, as a premium third-party vendor, leverages cookies to deliver advertisements on ChatBubble. Google's use of DART cookies allows it and its partner platforms to serve ads based on your chronological visits to this Platform and other destinations operating on the wider World Wide Web.</p>
        <p><strong>Your Opt-Out Autonomy:</strong> You can completely opt-out of personalized DART cookie targeting by directly visiting the official <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-bold">Google Ad Settings portal</a>. Additionally, you can systematically manage third-party advertising cookies by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-bold">www.aboutads.info</a> or adjusting your browser's local cookie-filtering parameters.</p>
      </div>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">4. Global Regulatory Compliance (GDPR, CCPA & CCPA Do-Not-Sell)</h3>
      <p>We respect international privacy frames. Depending on your geopolitical domicile, you enjoy specific legal guarantees:</p>
      <ul className="list-disc pl-6 mt-2 space-y-2">
        <li><strong>European Union (GDPR / ePrivacy):</strong> Under the General Data Protection Regulation, our lawful basis for handling technical logs is Art. 6(1)(f) GDPR (Legitimate Interests). Because we do not run user databases, we cannot associate requests with specific individuals unless you provide your technical IP address. Please contact support to initiate query requests.</li>
        <li><strong>California Consumer Privacy Act (CCPA):</strong> California residents hold the right to know what categories of data are distributed. We do not sell or lease your personal identifiers to marketing brokers. The passive placement of tracking cookies by external advertising vendors can fall under CCPA's broad interpretation of "data sharing". To execute your opt-out triggers, please utilize standard cookie block functions.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">5. Children's Privacy Shield</h3>
      <p>Our virtual communication rooms are designed exclusively for a mature, adult target demographic. ChatBubble does not authorize usage, nor do we knowingly collect technical metadata, from minors under the legal age of 18. If you are a parent or legal guardian and discover your ward has accessed our platform lobby, please alert our technical support desk to block the corresponding connection parameters instantly.</p>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">6. Security Measures & Safe Chat Guidelines</h3>
      <p>We maintain state-of-the-art secure socket layers (SSL/TLS), real-time DDoS protection algorithms, and automated firewalls to safeguard our server environments. However, no communication system over the internet holds a 100% security guarantee. We strongly advise users to avoid sharing personal accounts or credentials inside the public chat rooms.</p>
    </section>
  </div>
);

export const AboutUsContent = () => (
  <div className="space-y-6 text-[13px] md:text-sm text-slate-500 leading-relaxed font-sans">
    <section>
      <h2 className="text-slate-900 font-black text-2xl mb-4 tracking-tight">The Philosophy of Ephemeral Connection</h2>
      <p>At ChatBubble, we believe that the modern internet has grown overly structured, permanent, and stage-managed. Every social media comment, profile image, and relationship update on centralized networks is cataloged, searched, and associated with an immutable online footprint. This constant pressure to "perform" has stifled organic communication, leading to surface-level interactions and elevated social anxiety.</p>
      <p className="mt-3">Our platform was created to re-establish the absolute freedom of ephemerality. We provide a clean, high-performance portal where users can speak openly, share their thoughts without bias, and explore authentic perspectives from around the globe without registering, creating passwords, or building complex profiles.</p>
    </section>
    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">Bridging Global Horizons</h3>
      <p>ChatBubble operates as a virtual gathering square connecting thousands of active users across 150+ countries. By facilitating random pairing sequences, we break down geographical borders, linguistic divisions, and cultural assumptions. Our rooms have hosted intellectual debates, late-night heart-to-hearts, lighthearted linguistic exchanges, and dynamic casual dialogues, showing that genuine human connection is universal.</p>
    </section>
    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">An Absolute Commitment to Privacy</h3>
      <p>Our architectural blueprint is simple: <strong>if we do not collect your information, we cannot lose it, misuse it, or be forced to sell it.</strong> ChatBubble operates with zero tracking logs, zero persistent storage of chats, and zero marketing profiles. Our servers maintain maximum performance purely to route raw message strings over memory layers, bringing back the humble, unmonetized spirit of the early web.</p>
    </section>
  </div>
);

export const ContactUsContent = () => (
  <div className="space-y-6 text-[13px] md:text-sm text-slate-500 leading-relaxed font-sans">
    <section>
      <h2 className="text-slate-900 font-black text-2xl mb-4 tracking-tight">Technical and Editorial Assistance Desk</h2>
      <p>Whether you want to deliver technical feedback, report platform vulnerabilities, submit bug logs, or appeal community moderation actions, our specialized team is available round-the-clock.</p>
    </section>
    
    <div className="grid gap-4 mt-6">
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <h4 className="text-slate-900 font-bold mb-1">Administrative & Technical Queries</h4>
        <p className="text-brand font-black text-lg">support@chatbubble.fun</p>
        <p className="text-[11px] mt-2 text-slate-400 leading-relaxed">Drop our operations team a message regarding API access, cooperation layouts, server health metrics, or sitemap indexing details.</p>
      </div>

      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <h4 className="text-slate-900 font-bold mb-1">Moderation & Enforcement Appeal Box</h4>
        <p className="text-brand font-black text-lg">appeals@chatbubble.fun</p>
        <p className="text-[11px] mt-2 text-slate-400 leading-relaxed">If your residential connection was flagged by our automated filtering daemon or community guides, provide your technical IP address and connection timestamp for an audit.</p>
      </div>
    </div>

    <section className="bg-slate-100/50 p-5 rounded-2xl border border-slate-200/50 mt-4 text-xs">
      <h5 className="font-bold text-slate-800 mb-1">Response Time SLA</h5>
      <p className="text-slate-500">We analyze and respond to technical support messages within 24 to 48 business hours. Please ensure your emails specify your client browser parameters to facilitate diagnostic speeds.</p>
    </section>
  </div>
);

export const TermsOfServiceContent = () => (
  <div className="space-y-6 text-[13px] md:text-sm text-slate-500 leading-relaxed font-sans">
    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">1. Formal Agreement of Use</h3>
      <p>By entering, browsing, or participating in the community chat rooms hosted at ChatBubble.fun, you explicitly acknowledge that you have read, understood, and agreed to remain fully bound by these Terms of Service, all applicable regional laws, and cyber safety regulations. If you do not agree to these structural boundaries, you are strictly prohibited from accessing our Platform corridors.</p>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">2. Strict Age Requirements</h3>
      <p>Due to the mature nature of real-time random communication matching and to satisfy strict child protection policies, you must be at least **18 years of age** (or the age of legal majority in your country of residence) to enter the chat rooms. Minors found interacting on our platform will receive immediate, permanent connection blocks, and their corresponding IP addresses will be blacklisted.</p>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">3. Prohibited Conduct and Moderation Decrees</h3>
      <p>To preserve a secure, welcoming, and high-value room environment for all legitimate participants, you agree to speak with respect. You are explicitly forbidden from performing the following activities:</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li><strong>Commercial Spamming:</strong> Blasting the chat interface with repetitive links, automated marketing materials, affiliate codes, crypto referrals, or promotional pitches.</li>
        <li><strong>Abusive Conduct:</strong> Engaging in hate speech, discriminatory statements, sexual harassment, explicit verbal advances, threat profiles, or defamatory interactions.</li>
        <li><strong>Unsolicited Link Sharing:</strong> Uploading or pointing users to phishing nodes, dynamic viruses, third-party software download invitations, or malicious executable links.</li>
        <li><strong>Identity Spoofing:</strong> Falsely representing yourself as an administrative official, server guide, or moderator of ChatBubble to harvest credentials or cause distress.</li>
      </ul>
      <p className="mt-3">We delegate real-time string audits and algorithmic detection systems to review room logs, automatically flag violative strings, and immediately enforce temporary or permanent IP bans.</p>
    </section>

    <section>
      <h3 className="text-slate-900 font-bold text-lg mb-2">4. Disclaimers and Absolute Limitation of Liability</h3>
      <p>The services offered on ChatBubble are delivered strictly on an "AS IS" and "AS AVAILABLE" basis. We offer no warranties, explicit or implied, regarding the continuous availability, safety, or accuracy of responses or individuals met within our lobbies. ChatBubble shall hold absolutely zero liability for any damages, personal grievances, financial losses, or security compromises arising out of your session interactions or off-site transitions.</p>
    </section>
  </div>
);
