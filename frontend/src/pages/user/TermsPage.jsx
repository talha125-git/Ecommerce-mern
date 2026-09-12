import { FileText, Scale, ShieldCheck, Mail, Phone } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function TermsPage() {
  const { settings } = useSettings();

  const storeName = settings.storeName || "BloomShop";
  const supportEmail = settings.supportEmail || "support@bloomshop.com";
  const supportPhone = settings.supportPhone || "+92 347 6722423";
  const rawTerms = settings.termsConditions || "";

  // Split by double newlines into paragraphs if plain text
  const paragraphs = rawTerms
    ? rawTerms.split(/\n\n+/).filter((p) => p.trim().length > 0)
    : [
        `Welcome to ${storeName}. By accessing and using our website, you accept and agree to be bound by the terms and provisions of this agreement.`,
        "All orders placed through our website are subject to product availability and acceptance. We reserve the right to cancel or refuse any order at any time.",
        "We offer a 30-day return policy for most unworn products in their original condition and packaging."
      ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Please read these terms carefully before shopping with {storeName}. By using our website and placing orders, you agree to these terms.
          </p>
          <p className="text-xs text-muted-foreground">
            Current Version • Managed by {storeName} Administration
          </p>
        </div>

        {/* Dynamic Terms Content Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Official Store Terms</h2>
              <p className="text-xs text-muted-foreground">Updated and enforced by {storeName}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="bg-muted/20 p-4 rounded-xl border border-border/40 text-foreground/90 font-medium">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Contact Support Footer Box */}
        <div className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-foreground">Questions about our Terms?</p>
            <p>Our customer service team is here to help with any inquiries.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
            >
              <Mail className="w-3.5 h-3.5" /> {supportEmail}
            </a>
            {supportPhone && (
              <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> {supportPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
