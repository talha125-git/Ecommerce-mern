import { FileText, Scale, AlertTriangle, ShoppingBag } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using the BloomShop website, you accept and agree to be bound by the terms and provisions of this agreement.",
        "If you do not agree to abide by these terms, please do not use our services."
      ]
    },
    {
      icon: ShoppingBag,
      title: "Orders & Purchases",
      content: [
        "All orders placed through our website are subject to product availability and acceptance.",
        "We reserve the right to refuse or cancel any order at any time for reasons including product unavailability, errors in pricing or product description, or if we suspect fraudulent activity.",
        "Prices for our products are subject to change without notice. We do our best to ensure accuracy, but errors may occur."
      ]
    },
    {
      icon: Scale,
      title: "Returns & Refunds",
      content: [
        "We offer a 30-day return policy for most products. Items must be returned in their original condition, unworn, and with all original packaging and tags intact.",
        "Refunds will be processed within 5-10 business days after we receive and inspect the returned item.",
        "Shipping costs for returns are the responsibility of the customer unless the return is due to our error."
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "BloomShop shall not be held liable for any indirect, incidental, special, or consequential damages arising out of the use or inability to use our services.",
        "Our total liability for any claim shall not exceed the amount paid by you for the product or service giving rise to the claim.",
        "We do not guarantee that our website will be uninterrupted, timely, secure, or error-free."
      ]
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using BloomShop. By using our website, you agree to these terms.
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
          For questions regarding these Terms & Conditions, please contact us at <a href="mailto:hello@bloomshop.com" className="font-bold text-primary hover:underline">hello@bloomshop.com</a>.
        </div>
      </div>
    </div>
  );
}
