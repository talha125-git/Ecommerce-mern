import { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  MailCheck,
  Clock,
  Search,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Send,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Calendar,
} from "lucide-react";

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'verified' | 'pending'
  const [actionLoading, setActionLoading] = useState(null); // id of item being modified
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "", link: "" });
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/subscribers`);
      if (res.data) {
        setSubscribers(res.data.subscribers || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      showStatus("error", "Failed to load newsletter subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const showStatus = (type, text, link = "") => {
    setStatusMsg({ type, text, link });
    setTimeout(() => setStatusMsg({ type: "", text: "", link: "" }), 6000);
  };

  const handleDeleteSubscriber = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove "${email}" from the newsletter list?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await axios.delete(`${API_URL}/api/admin/subscribers/${id}`);
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
      // update stats locally
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      showStatus("success", `Subscriber "${email}" has been successfully removed.`);
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      showStatus("error", "Failed to delete subscriber.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendVerification = async (id, email) => {
    setActionLoading(id);
    try {
      const res = await axios.post(`${API_URL}/api/admin/subscribers/resend/${id}`);
      showStatus(
        "success",
        `Verification email resent to ${email}!`,
        res.data.previewUrl || ""
      );
    } catch (err) {
      console.error("Error resending email:", err);
      showStatus("error", "Failed to resend verification email.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const res = await axios.patch(`${API_URL}/api/admin/subscribers/${id}/toggle-status`);
      if (res.data && res.data.subscriber) {
        const updated = res.data.subscriber;
        setSubscribers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: updated.status } : s))
        );
        showStatus("success", `Status updated to ${updated.status}.`);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      showStatus("error", "Failed to update subscriber status.");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text, id = null) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
      showStatus("success", "All verified subscriber emails copied to clipboard!");
    }
  };

  const handleCopyAllVerified = () => {
    const verifiedEmails = subscribers
      .filter((s) => s.isVerified && s.status === "subscribed")
      .map((s) => s.email)
      .join(", ");

    if (!verifiedEmails) {
      showStatus("info", "No verified subscribers available to copy.");
      return;
    }

    copyToClipboard(verifiedEmails);
  };

  // Filter and search
  const filteredSubscribers = subscribers.filter((sub) => {
    // Tab filter
    if (filterTab === "verified" && (!sub.isVerified || sub.status !== "subscribed")) return false;
    if (filterTab === "pending" && sub.isVerified && sub.status === "subscribed") return false;

    // Search query
    if (!searchQuery) return true;
    return (sub.email || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MailCheck className="w-6 h-6 text-slate-900" /> Newsletter Subscribers
          </h1>
          <p className="text-xs text-gray-500">
            Real-time subscriber audience, verified emails, and email confirmation requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyAllVerified}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            title="Copy all verified email addresses"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? "Emails Copied!" : "Copy Verified List"}</span>
          </button>

          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards - 2 Columns on Mobile, 3 Columns on Tablet/Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Subscribers */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Subscribers
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1">
              {stats.total || subscribers.length}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">All captured emails</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-slate-100 text-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold shrink-0">
            <Mail className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Verified Subscribed */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Verified & Active
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 sm:mt-1">
              {stats.verified}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-600/80 mt-0.5">
              Confirmed via email
            </p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Pending Confirmation - Spans 2 columns on mobile */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200 rounded-2xl p-3 sm:p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
              Pending Confirmation
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 sm:mt-1">
              {stats.pending}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amber-600/80 mt-0.5">Awaiting link click</p>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-center justify-between gap-3 ${statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : statusMsg.type === "info"
                ? "bg-blue-50 text-blue-900 border-blue-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>

          {statusMsg.link && (
            <a
              href={statusMsg.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 shrink-0"
            >
              <ExternalLink className="w-3 h-3" /> View Preview Email
            </a>
          )}
        </div>
      )}

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscriber email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${filterTab === "all"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
              }`}
          >
            All ({subscribers.length})
          </button>
          <button
            onClick={() => setFilterTab("verified")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${filterTab === "verified"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-gray-500 hover:text-emerald-700"
              }`}
          >
            Verified ({stats.verified})
          </button>
          <button
            onClick={() => setFilterTab("pending")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${filterTab === "pending"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-gray-500 hover:text-amber-700"
              }`}
          >
            Pending ({stats.pending})
          </button>
        </div>
      </div>

      {/* Subscribers Table / List */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-500">Loading newsletter subscribers...</p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Subscribers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {subscribers.length === 0
              ? "No one has subscribed to your newsletter yet. When store visitors submit their email in the footer, they will appear here in real-time."
              : "No subscribers match your search filter."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Box Cards */}
          <div className="md:hidden space-y-3">
            {filteredSubscribers.map((sub) => {
              const isVerified = sub.isVerified && sub.status === "subscribed";
              const isUnsubscribed = sub.status === "unsubscribed";

              return (
                <div
                  key={sub._id}
                  className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  {/* Top: Avatar, Email, Copy, and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shadow-xs uppercase shrink-0 ${isVerified
                            ? "bg-emerald-600 text-white"
                            : isUnsubscribed
                              ? "bg-gray-400 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                      >
                        {sub.email ? sub.email.charAt(0) : "N"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-xs truncate max-w-[170px] sm:max-w-[220px]" title={sub.email}>
                            {sub.email}
                          </span>
                          <button
                            onClick={() => copyToClipboard(sub.email, sub._id)}
                            className="text-gray-400 hover:text-slate-900 p-0.5 rounded transition shrink-0"
                            title="Copy email address"
                          >
                            {copiedId === sub._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          ID: {sub._id.slice(-6)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Verified
                        </span>
                      ) : isUnsubscribed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Date & Action Buttons */}
                  <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>
                        {sub.subscribedAt
                          ? new Date(sub.subscribedAt).toLocaleDateString()
                          : new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isVerified && (
                        <button
                          onClick={() => handleResendVerification(sub._id, sub.email)}
                          disabled={actionLoading === sub._id}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Resend verification email"
                        >
                          <Send className="w-3 h-3" /> Resend
                        </button>
                      )}

                      {isVerified && (
                        <button
                          onClick={() => handleToggleStatus(sub._id)}
                          disabled={actionLoading === sub._id}
                          className="p-1.5 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                          title="Toggle Subscribed / Unsubscribed"
                        >
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                        disabled={actionLoading === sub._id}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Subscriber</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Subscription Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.map((sub) => {
                    const isVerified = sub.isVerified && sub.status === "subscribed";
                    const isUnsubscribed = sub.status === "unsubscribed";

                    return (
                      <tr key={sub._id} className="hover:bg-gray-50/80 transition">
                        {/* Email & Avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shadow-xs uppercase shrink-0 ${isVerified
                                  ? "bg-emerald-600 text-white"
                                  : isUnsubscribed
                                    ? "bg-gray-400 text-white"
                                    : "bg-amber-500 text-white"
                                }`}
                            >
                              {sub.email ? sub.email.charAt(0) : "N"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{sub.email}</span>
                                <button
                                  onClick={() => copyToClipboard(sub.email, sub._id)}
                                  className="text-gray-400 hover:text-slate-900 p-0.5 rounded transition"
                                  title="Copy email address"
                                >
                                  {copiedId === sub._id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                ID: {sub._id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Verified & Subscribed
                            </span>
                          ) : isUnsubscribed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Unsubscribed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending Verification
                            </span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-5 py-3.5 text-gray-500">
                          <div>
                            <span>
                              {sub.subscribedAt
                                ? new Date(sub.subscribedAt).toLocaleDateString()
                                : new Date(sub.createdAt).toLocaleDateString()}
                            </span>
                            <p className="text-[10px] text-gray-400">
                              {isVerified ? "Verified" : "Sign-up Requested"}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Resend Verification Button (for pending) */}
                            {!isVerified && (
                              <button
                                onClick={() => handleResendVerification(sub._id, sub.email)}
                                disabled={actionLoading === sub._id}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Resend verification link to user"
                              >
                                <Send className="w-3 h-3" /> Resend Link
                              </button>
                            )}

                            {/* Toggle Active / Unsubscribed */}
                            {isVerified && (
                              <button
                                onClick={() => handleToggleStatus(sub._id)}
                                disabled={actionLoading === sub._id}
                                className="p-1.5 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                title="Toggle Subscribed / Unsubscribed"
                              >
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                              </button>
                            )}

                            {/* Delete Subscriber */}
                            <button
                              onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                              disabled={actionLoading === sub._id}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                              title="Delete Subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
