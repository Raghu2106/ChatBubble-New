import React from 'react';

export const PrivacyPolicyContent = () => (
  <div className="space-y-6 text-text-muted leading-relaxed">
    <section>
      <h3 className="text-text font-bold text-lg mb-2">1. Introduction</h3>
      <p>Welcome to ChatBubble. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website, regardless of where you visit it from, and tell you about your privacy rights and how the law protects you.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">2. The Data We Collect</h3>
      <p>ChatBubble is designed to be an anonymous platform. We do not require registration, email addresses, or personal identification. We may collect your IP address solely for the purpose of preventing spam and abuse (moderation) and to ensure compliance with our terms of service.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">3. Advertising and Cookies</h3>
      <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use cookies and web beacons in connection with advertising on this site to serve ads based on your prior visits. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
      <p className="mt-2 text-sm italic">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">www.aboutads.info</a>.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">4. Data Security</h3>
      <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">5. Children's Privacy</h3>
      <p>Our service is not intended for use by anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</p>
    </section>
  </div>
);

export const AboutUsContent = () => (
  <div className="space-y-6 text-text-muted leading-relaxed">
    <section>
      <h2 className="text-text font-black text-2xl mb-4 tracking-tight">Mission & Purpose</h2>
      <p>ChatBubble was built on the principle that the best conversations happen when people can be themselves without the weight of a digital identity. In an age of permanent records, we provide a ephemeral space for genuine human connection.</p>
    </section>
    <section>
      <h3 className="text-text font-bold text-lg mb-2">Global Connectivity</h3>
      <p>With thousands of users from over 150 countries, ChatBubble serves as a bridge across cultures. Whether you're looking for local friends in Mumbai or curious about life in New York, our platform makes the world feel a little smaller.</p>
    </section>
    <section>
      <h3 className="text-text font-bold text-lg mb-2">Privacy by Design</h3>
      <p>We don't want your data. We don't want your followers. We just want you to have a great conversation. Our architecture is built to ensure that no chat logs are permanently stored and no user tracking profiles are built.</p>
    </section>
  </div>
);

export const ContactUsContent = () => (
  <div className="space-y-6 text-text-muted leading-relaxed">
    <section>
      <h2 className="text-text font-black text-2xl mb-4 tracking-tight">Get in Touch</h2>
      <p>Have questions, feedback, or need to report a bug? We're here to help.</p>
    </section>
    <div className="grid gap-4">
      <div className="p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-text font-bold mb-1">Email Support</h4>
        <p className="text-brand font-black">support@chatbubble.me</p>
        <p className="text-[11px] mt-1 text-text-muted/60">Average response time: 24-48 hours</p>
      </div>
      <div className="p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-text font-bold mb-1">Moderation Appeals</h4>
        <p className="text-brand font-black">appeals@chatbubble.me</p>
        <p className="text-[11px] mt-1 text-text-muted/60">Include your nickname and reason for appeal.</p>
      </div>
    </div>
  </div>
);

export const TermsOfServiceContent = () => (
  <div className="space-y-6">
    <section>
      <h3 className="text-text font-bold text-lg mb-2">1. Terms of Use</h3>
      <p>By accessing ChatBubble, you agree to be bound by these terms of service and all applicable laws and regulations.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">2. User Conduct & Moderation</h3>
      <p>To keep ChatBubble safe, you agree NOT to:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Post or transmit any unlawful, threatening, abusive, libelous, defamatory, obscene, vulgar, pornographic, or indecent information.</li>
        <li>Post or transmit any information that constitutes or encourages conduct that would constitute a criminal offense.</li>
        <li>Harass, threaten or intentionally embarrass or cause distress to another participant.</li>
      </ul>
      <p className="mt-2">Violation of these terms may result in immediate access restriction without notice.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">3. Disclaimer</h3>
      <p>The materials on ChatBubble are provided on an 'as is' basis. ChatBubble makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
    </section>
    
    <section>
      <h3 className="text-text font-bold text-lg mb-2">4. Age Restriction</h3>
      <p>You must be at least 18 years of age (or the age of majority in your jurisdiction) to use this service.</p>
    </section>
  </div>
);
