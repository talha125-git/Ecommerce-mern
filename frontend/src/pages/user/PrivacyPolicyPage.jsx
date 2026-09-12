import { ShieldCheck, Lock, Eye, Cookie, Mail, Phone } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function PrivacyPolicyPage() {
  const { settings } = useSettings();

  const storeName = settings.storeName || "BloomShop";
  const supportEmail = settings.supportEmail || "support@bloomshop.com";
  const supportPhone = settings.supportPhone || "+92 347 6722423";
  const rawPrivacy = settings.privacyPolicy || "";

  // Split by double newlines into paragraphs
  const paragraphs = rawPrivacy
    ? rawPrivacy.split(/\n\n+/).filter((p) => p.trim().length > 0)
    : [
        `Your privacy is paramount to us at ${storeName}. This policy outlines how we collect, safeguard, and utilize your personal information.`,
        "We collect essential details such as name, email, phone number, and delivery address solely to fulfill orders and provide seamless shipping updates.",
        "We implement industry-standard 256-bit SSL encryption on all payment transactions and never sell or rent your personal information to unauthorized third parties."
      ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Customer Privacy
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Your trust is our priority. Learn how {storeName} respects and protects your sensitive data.
          </p>
          <p className="text-xs text-muted-foreground">
            Current Version • Managed by {storeName} Administration
          </p>
        </div>

        {/* Dynamic Privacy Content Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Data Protection & Privacy Policy</h2>
              <p className="text-xs text-muted-foreground">Official policy for {storeName}</p>
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
            <p className="font-bold text-foreground">Have privacy concerns or data requests?</p>
            <p>Reach out to our Data Protection & Customer Support Team.</p>
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
