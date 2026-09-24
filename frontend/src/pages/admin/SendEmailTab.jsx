import { useState, useEffect } from "react";
import axios from "axios";
import {
  Send,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Link as LinkIcon,
  RefreshCw,
  Loader2,
  HelpCircle,
  UserCheck,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SendEmailTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Form State
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("Shop The Collection");
  const [buttonLink, setButtonLink] = useState("");
  const [targetMode, setTargetMode] = useState("all"); // 'all' | 'custom'
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Submission State
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/subscribers`);
      const list = res.data?.subscribers || [];
      setSubscribers(list);
      const verified = list.filter((s) => s.isVerified && s.status === "subscribed");
      setVerifiedCount(verified.length);
      setSelectedEmails(verified.map((s) => s.email));
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 6000);
  };

  // Quick Preset Templates
  const handleApplyTemplate = (type) => {
    if (type === "sale") {
      setSubject("🔥 VIP Flash Sale: Up to 35% Off Selected Styles!");
      setHeading("Exclusive VIP Member Discount");
      setMessage(
        "Hey BloomShop Insider,\n\nWe are rewarding our VIP newsletter family with an exclusive 35% discount on all featured sneakers and streetwear.\n\nUse code: VIP35 at checkout to claim your savings. Offer ends Sunday midnight!"
      );
      setButtonText("Claim Your 35% Discount →");
      setButtonLink("/shop");
    } else if (type === "announcement") {
      setSubject("✨ Something Big Just Landed at BloomShop");
      setHeading("New Collection Launch");
      setMessage(
        "Hello!\n\nWe are thrilled to announce our all-new footwear lineup engineered with responsive cushioning and modern streetwear aesthetics.\n\nExplore the latest drops before public inventory sells out!"
      );
      setButtonText("Explore New Drops →");
      setButtonLink("/shop");
    } else if (type === "free-shipping") {
      setSubject("📦 Free Express Shipping on All Orders This Week!");
      setHeading("Free Shipping on Us");
      setMessage(
        "Great news!\n\nFor a limited time, enjoy 100% Free Nationwide Delivery on any order, no minimum spend required.\n\nTreat yourself or pick up gifts with zero shipping fees."
      );
      setButtonText("Shop With Free Delivery →");
      setButtonLink("/shop");
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim()) {
      showStatus("error", "Please provide an email subject line.");
      return;
    }
    if (!message.trim()) {
      showStatus("error", "Please write the email body message.");
      return;
    }

    const recipientsCount = targetMode === "all" ? verifiedCount : selectedEmails.length;
    if (recipientsCount === 0) {
      showStatus("error", "No verified recipients selected.");
      return;
    }

    if (
      !window.confirm(
        `Are you ready to send this broadcast email to ${recipientsCount} verified subscriber${
          recipientsCount === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    setSending(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const payload = {
        subject: subject.trim(),
        heading: heading.trim() || subject.trim(),
        message: message.trim(),
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        targetEmails: targetMode === "all" ? undefined : selectedEmails,
      };

      const res = await axios.post(`${API_URL}/api/admin/send-email`, payload);

      showStatus("success", res.data.message || "Email broadcast dispatched successfully!");
    } catch (err) {
      console.error("Failed to send broadcast:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to send email broadcast.";
      showStatus("error", errMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-slate-900" /> Send Subscriber Emails
          </h1>
          <p className="text-xs text-gray-500">
            Compose and broadcast custom announcements, discount alerts, and newsletter campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            {loadingSubs ? "Loading..." : `${verifiedCount} Verified Subscribers`}
          </span>
          <button
            onClick={fetchSubscribers}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Refresh subscriber count"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSubs ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-center gap-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Quick Preset Templates */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Campaign Templates
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyTemplate("sale")}
            className="px-3 py-1.5 bg-gray-50 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Flash Sale (35% Off)
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate("announcement")}
            className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> New Collection Drop
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate("free-shipping")}
            className="px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free Shipping Week
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Audience Recipients
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetMode("all")}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  targetMode === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                All Verified ({verifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setTargetMode("custom")}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  targetMode === "custom"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Custom Pick ({selectedEmails.length})
              </button>
            </div>

            {/* Custom Email Selection Drawer */}
            {targetMode === "custom" && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-40 overflow-y-auto space-y-1.5 text-xs">
                {subscribers
                  .filter((s) => s.isVerified && s.status === "subscribed")
                  .map((sub) => (
                    <label
                      key={sub._id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(sub.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmails([...selectedEmails, sub.email]);
                          } else {
                            setSelectedEmails(selectedEmails.filter((em) => em !== sub.email));
                          }
                        }}
                        className="rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-semibold text-gray-800">{sub.email}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Subject Line <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. VIP Alert: New Arrivals Just Dropped!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              This is the title recipients see in their Gmail inbox.
            </p>
          </div>

          {/* Heading Inside Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Heading / Banner Title
            </label>
            <input
              type="text"
              placeholder="e.g. Exclusive Weekend Drop"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Write your email body here. Line breaks are automatically preserved..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
            />
          </div>

          {/* Call to Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Button Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Shop The Drop Now"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Button Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /shop or full URL"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Send Broadcast Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSendBroadcast}
              disabled={sending || verifiedCount === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Dispatching Emails via Gmail...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-primary" />
                  <span>
                    Send Broadcast to{" "}
                    {targetMode === "all" ? `${verifiedCount} Subscribers` : `${selectedEmails.length} Selected`}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Email Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" /> Live Subscriber Inbox Preview
            </span>
            <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
              Real HTML Preview
            </span>
          </div>

          {/* Email Preview Card */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Mock Email Header */}
            <div className="bg-slate-900 p-4 text-center">
              <span className="text-lg font-black tracking-tight text-white">
                BLOOM<span className="text-primary">SHOP</span>
              </span>
            </div>

            {/* Mock Email Body */}
            <div className="p-6 space-y-4">
              <h2 className="text-base font-extrabold text-gray-900">
                {heading || subject || "Your Announcement Heading Here"}
              </h2>

              <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {message ||
                  "Your email announcement text will appear here. You can announce new sales, product arrivals, store news, or discount coupon codes."}
              </div>

              {buttonText && (
                <div className="pt-2 text-center">
                  <span className="inline-block px-6 py-2.5 bg-primary text-gray-950 font-bold text-xs rounded-xl shadow-xs">
                    {buttonText}
                  </span>
                </div>
              )}
            </div>

            {/* Mock Email Footer */}
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100 text-[10px] text-gray-400">
              You received this announcement because you are a verified BloomShop subscriber.
              <br />© {new Date().getFullYear()} BloomShop. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
