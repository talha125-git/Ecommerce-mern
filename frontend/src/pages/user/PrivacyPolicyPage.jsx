import { ShieldCheck, Lock, Eye, Cookie } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "We collect information you provide directly to us, such as your name, email address, postal address, phone number, and payment information when you make a purchase, register for an account, or contact us.",
        "We also automatically collect certain information about your device, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our website."
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "We use the information we collect to process your orders and provide customer support.",
        "We use your data to personalize your shopping experience, send promotional communications (with your consent), and improve our products and services.",
        "We may also use your information to detect, prevent, and address technical issues, fraud, or other harmful activities."
      ]
    },
    {
      icon: ShieldCheck,
      title: "Data Protection & Security",
      content: [
        "We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        "All payment transactions are encrypted using SSL technology. We never store your complete credit card information on our servers."
      ]
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        "We use cookies and similar tracking technologies to track activity on our website and hold certain information to enhance your experience.",
        "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our website may not function properly without cookies."
      ]
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Your privacy matters to us. This policy outlines how BloomShop collects, uses, and protects your personal information.
          </p>
          <p className="text-xs text-muted-foreground">Last Updated: September 2, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-3 pl-12">
                  {section.content.map((text, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@bloomshop.com" className="font-bold text-primary hover:underline">hello@bloomshop.com</a>.
        </div>
      </div>
    </div>
  );
}
