import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, MessageCircle } from "lucide-react";
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
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
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
          <h2 className="text-xl font-bold text-foreground">Send Us a Message</h2>

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold">
              ✅ Message sent successfully! We'll get back to you shortly.
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
                required
                className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold py-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
