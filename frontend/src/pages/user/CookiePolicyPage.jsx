import { Cookie, Settings, BarChart3, Shield } from "lucide-react";

export default function CookiePolicyPage() {
  const sections = [
    {
      icon: Cookie,
      title: "What Are Cookies?",
      content: [
        "Cookies are small text files that are stored on your device when you visit our website. They help us recognize your browser and remember certain information about your preferences.",
        "Cookies allow us to provide you with a personalized experience and make your use of our website smoother and more efficient."
      ]
    },
    {
      icon: Settings,
      title: "Types of Cookies We Use",
      content: [
        "Essential Cookies: Required for basic website functionality, such as adding items to your cart, secure login, and checkout. The website cannot function properly without these cookies.",
        "Analytics Cookies: Help us understand how visitors interact with our website by collecting anonymous usage information. This helps us improve our services.",
        "Preference Cookies: Remember your settings and choices (e.g., language, region, dark mode) to provide a more personalized experience."
      ]
    },
    {
      icon: BarChart3,
      title: "How We Use Cookie Data",
      content: [
        "We use cookie data to improve your browsing experience, analyze website traffic, and understand which pages are most popular.",
        "We never sell cookie data to third parties. Analytics data is used solely to improve our products and services."
      ]
    },
    {
      icon: Shield,
      title: "Managing Your Cookies",
      content: [
        "You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies.",
        "Please note that disabling cookies may affect the functionality of our website and limit your access to certain features like the shopping cart and user account.",
        "For more information about managing cookies, visit your browser's help documentation."
      ]
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            This policy explains how BloomShop uses cookies and similar technologies to enhance your browsing experience.
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
          Questions about our cookie practices? Email us at <a href="mailto:hello@bloomshop.com" className="font-bold text-primary hover:underline">hello@bloomshop.com</a>.
        </div>
      </div>
    </div>
  );
}
