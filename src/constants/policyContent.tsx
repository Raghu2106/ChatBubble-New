import React from 'react';

export const PrivacyPolicyContent = () => (
  <div className="space-y-6">
    <section>
      <h3 className="text-text font-bold text-lg mb-2">1. Introduction</h3>
      <p>Welcome to ChatBubble. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">2. The Data We Collect</h3>
      <p>ChatBubble is designed to be an anonymous platform. We do not require registration or personal identification. We may collect your IP address solely for the purpose of preventing spam and abuse (moderation).</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">3. Advertising and Cookies</h3>
      <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use cookies and web beacons in connection with advertising on this site to serve ads based on your prior visits. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
      <p className="mt-2 text-sm italic">Note: You may opt out of personalized advertising by visiting Ads Settings.</p>
    </section>

    <section>
      <h3 className="text-text font-bold text-lg mb-2">4. Data Security</h3>
      <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>
    </section>
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
