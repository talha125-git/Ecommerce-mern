import { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Send, MessageSquare, MessageCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";

export default function ContactPage() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSubmitted(false);

    try {
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      if (res.data?.success) {
        setSubmitted(true);
        setSuccessMsg(res.data.message || "Message sent successfully! We will get back to you shortly.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setErrorMsg(res.data?.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Contact form submission error:", err);
      setErrorMsg(
        err.response?.data?.message ||
        "Failed to send your message. Please check your internet connection or reach out on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanWhatsapp = (settings.socialWhatsapp || "").replace(/[^0-9]/g, "");

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      detail: settings.storeAddress || "Shabqadar Charsadda, Peshawar, Pakistan",
      color: "text-blue-500 bg-blue-50",
      link: null
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: settings.supportPhone || "+92 347 6722423",
      color: "text-emerald-500 bg-emerald-50",
      link: `tel:${settings.supportPhone || "+923476722423"}`
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      detail: settings.socialWhatsapp || "+92 347 6722423",
      color: "text-green-600 bg-green-50",
      link: cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : null
    },
    {
      icon: Mail,
      title: "Email Us",
      detail: settings.supportEmail || "support@bloomshop.com",
      color: "text-purple-500 bg-purple-50",
      link: `mailto:${settings.supportEmail || "support@bloomshop.com"}`
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="h-4 w-4" />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Have a question, feedback, or need help with your order? We'd love to hear from you.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-card border border-border rounded-2xl p-5 text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Send Us a Message</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Your inquiry will be sent directly to our support team at <strong className="text-foreground">malikabutalharaheem@gmail.com</strong>.
            </p>
          </div>

          {submitted && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p>{successMsg}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-normal mt-0.5">
                  An email notification has been dispatched to <strong>malikabutalharaheem@gmail.com</strong> and an acknowledgement copy was sent to your inbox.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="How can we help?"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Message</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-60"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-bold py-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Message...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4 mr-1" />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
