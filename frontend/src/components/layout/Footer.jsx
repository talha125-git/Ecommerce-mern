import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useSettings } from "@/context/SettingsContext";

// Brand SVG Icons for Storefront Footer
const InstagramIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterXIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.861 2.796.862h.005c3.179 0 5.767-2.586 5.768-5.766 0-1.541-.601-2.99-1.69-4.08-1.09-1.09-2.54-1.689-4.083-1.67zm0-2.172c4.418 0 8 3.582 8 8s-3.582 8-8 8c-1.42 0-2.753-.374-3.916-1.028l-4.115 1.028 1.054-3.987c-.742-1.214-1.173-2.645-1.173-4.013 0-4.418 3.582-8 8-8z" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'info'|'error', text: '', previewUrl: '' }
  const { settings: storeSettings } = useSettings();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await axios.post(`${API_URL}/api/newsletter/subscribe`, { email });

      if (res.data.alreadySubscribed) {
        setStatus({
          type: "info",
          text: res.data.message || "You're already subscribed to our newsletter!",
        });
      } else {
        setStatus({
          type: "success",
          text: res.data.message || "Verification email sent! Please check your inbox to confirm your subscription.",
          previewUrl: res.data.previewUrl,
        });
        setEmail("");
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to send verification email. Please try again.";
      setStatus({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const footerSections = [
    {
      title: "Shop",
      links: [
        { href: "/shop", label: "All Products" },
        { href: "/shop", label: "New Arrivals" },
        { href: "/shop", label: "Sale" },
        { href: "/shop", label: "Featured" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { href: "/contact", label: "Contact Us" },
        { href: "/contact", label: "Help Center" },
        { href: "/terms", label: "Shipping Info" },
        { href: "/terms", label: "Returns & Exchanges" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Careers" },
        { href: "/about", label: "Blog" },
        { href: "/about", label: "Press" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms & Conditions" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/privacy", label: "Accessibility" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 border-b border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Stay in the loop
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive offers, new arrivals,
              and style inspiration.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex max-w-md mx-auto gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
                disabled={submitting}
              />
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 min-w-[44px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>

            {/* Newsletter Subscription Status Feedback */}
            {status && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs font-medium max-w-md mx-auto flex items-start gap-2.5 text-left border transition-all ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : status.type === "info"
                    ? "bg-blue-50 text-blue-900 border-blue-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : status.type === "info" ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p>{status.text}</p>
                  {status.previewUrl && (
                    <a
                      href={status.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                    >
                      <ExternalLink className="w-3 h-3" /> View verification email (Test Inbox)
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <Link
                className="text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors inline-block mb-4 font-extrabold"
                to="/"
                aria-label="BloomShop Home"
              >
                BLOOM<span className="text-primary">SHOP</span>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                {storeSettings.storeTagline || "Discover unique products that inspire your lifestyle. Quality craftsmanship meets modern design."}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{storeSettings.storeAddress || "Shabqadar Charsadda, Peshawar, Pakistan"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{storeSettings.supportPhone || "+92 347 6722423"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>{storeSettings.supportEmail || "support@bloomshop.com"}</span>
                </div>
              </div>

              {/* Social Media Channels Icons */}
              <div className="flex items-center gap-2.5 mt-6">
                <a
                  href={storeSettings.socialInstagram || "https://instagram.com/bloomshop"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                  className="h-10 w-10 rounded-full bg-muted/80 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white flex items-center justify-center transition-all shadow-xs text-muted-foreground hover:scale-105 border border-border"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>

                <a
                  href={storeSettings.socialFacebook || "https://facebook.com/bloomshop"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  title="Facebook"
                  className="h-10 w-10 rounded-full bg-muted/80 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all shadow-xs text-muted-foreground hover:scale-105 border border-border"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>

                <a
                  href={storeSettings.socialTwitter || "https://twitter.com/bloomshop"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter X"
                  title="Twitter / X"
                  className="h-10 w-10 rounded-full bg-muted/80 hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-xs text-muted-foreground hover:scale-105 border border-border"
                >
                  <TwitterXIcon className="h-4 w-4" />
                </a>

                <a
                  href={`https://wa.me/${(storeSettings.socialWhatsapp || "923476722423").replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  title="WhatsApp"
                  className="h-10 w-10 rounded-full bg-muted/80 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all shadow-xs text-muted-foreground hover:scale-105 border border-border"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {footerSections.map((section, index) => (
              <div
                key={section.title}
                className={`${index >= 2 ? "lg:col-span-1" : ""}`}
              >
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2025 BloomShop™. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>All Rights Reserved.</span>
              <br />
            </div>
            <p className="text-sm text-muted-foreground">Developed by <a href="https://github.com/bloomtpl" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">Bloomtpl</a> • Distributed by <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">ThemeWagon</a></p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link to="/cookies"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
