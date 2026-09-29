import { useState, useEffect } from "react";
import axios from "axios";
import {
  History,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Eye,
  RotateCw,
  ExternalLink,
  Users,
  Filter,
  X,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailHistoryTab({ onCompose }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalPending: 0,
    deliveryRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'sent' | 'partial' | 'failed' | 'pending'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'broadcast' | 'product_alert'

  // Modal State
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [modalSearch, setModalSearch] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("all"); // 'all' | 'sent' | 'failed' | 'pending'

  // Actions Loading State
  const [resendingId, setResendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, typeFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await axios.get(`${API_URL}/api/admin/email-history`, { params });
      if (res.data?.success) {
        setHistory(res.data.history || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email history:", err);
      showStatus("error", "Failed to load email history.");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 6000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDeleteHistory = async (id, subject) => {
    if (!window.confirm(`Are you sure you want to delete the history log for "${subject}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await axios.delete(`${API_URL}/api/admin/email-history/${id}`);
      if (res.data?.success) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (selectedEmail?._id === id) {
          setSelectedEmail(null);
        }
        showStatus("success", "Email history record deleted successfully.");
      }
    } catch (err) {
      console.error("Failed to delete email history:", err);
      showStatus("error", "Failed to delete email history log.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to CLEAR ALL email history records? This cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/api/admin/email-history`);
      if (res.data?.success) {
        setHistory([]);
        setSelectedEmail(null);
        setStats({
          totalCampaigns: 0,
          totalDelivered: 0,
          totalFailed: 0,
          totalPending: 0,
          deliveryRate: 100,
        });
        showStatus("success", "All email history records have been cleared.");
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
      showStatus("error", "Failed to clear email history.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id, targetType = "failed", targetEmail = null) => {
    const targetLabel = targetEmail
      ? `subscriber "${targetEmail}"`
      : targetType === "all"
      ? "all recipients"
      : "failed/pending subscribers";

    if (!window.confirm(`Resend this email to ${targetLabel}?`)) {
      return;
    }

    setResendingId(id);
    try {
      const res = await axios.post(`${API_URL}/api/admin/email-history/${id}/resend`, {
        targetType,
        targetEmail,
      });

      if (res.data?.success) {
        showStatus("success", res.data.message || "Email re-transmission completed successfully!");
        if (res.data.history) {
          // Update in local state
          setHistory((prev) =>
            prev.map((item) => (item._id === id ? res.data.history : item))
          );
          if (selectedEmail?._id === id) {
            setSelectedEmail(res.data.history);
          }
        }
      }
    } catch (err) {
      console.error("Failed to resend email:", err);
      const msg = err.response?.data?.message || err.message || "Failed to resend email.";
      showStatus("error", msg);
    } finally {
      setResendingId(null);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyAllRecipients = (recipients) => {
    const emails = recipients.map((r) => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Filtered recipients for modal
  const filteredRecipients = (selectedEmail?.recipients || []).filter((r) => {
    const matchesSearch = r.email.toLowerCase().includes(modalSearch.toLowerCase());
    const matchesStatus =
      modalStatusFilter === "all" ? true : r.status === modalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-slate-900" /> Emails History
          </h1>
          <p className="text-xs text-gray-500">
            Audit sent newsletters, track per-subscriber delivery status, and retry failed emails
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCompose && (
            <Button
              onClick={onCompose}
              className="bg-primary hover:bg-primary/90 text-gray-950 font-bold text-xs h-9 px-3.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Compose New Email
            </Button>
          )}

          <button
            onClick={fetchHistory}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-center gap-2.5 animate-in fade-in ${
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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Emails */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Emails</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
              <Mail className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.totalCampaigns}</div>
          <p className="text-[10px] text-gray-400 mt-0.5">Emails sent</p>
        </div>

        {/* Total Delivered */}
        <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-xs flex flex-col justify-between bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.totalDelivered}</div>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Subscriber inboxes reached</p>
        </div>

        {/* Success Rate */}
        <div className="bg-white border border-sky-100 p-4 rounded-2xl shadow-xs flex flex-col justify-between bg-sky-50/20">
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivery Rate</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700">{stats.deliveryRate}%</div>
          <p className="text-[10px] text-sky-600/80 mt-0.5">Transmission reliability</p>
        </div>

        {/* Failed / Pending */}
        <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-xs flex flex-col justify-between bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Failed / Issues</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats.totalFailed + stats.totalPending}
          </div>
          <p className="text-[10px] text-amber-600/80 mt-0.5">
            {stats.totalFailed} failed, {stats.totalPending} pending
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: "all", label: "All Emails" },
            { id: "sent", label: "Delivered", count: history.filter((h) => h.status === "sent").length },
            { id: "partial", label: "Partial", count: history.filter((h) => h.status === "partial").length },
            { id: "failed", label: "Failed", count: history.filter((h) => h.status === "failed").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    statusFilter === tab.id
                      ? "bg-gray-800 text-primary"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject or subscriber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl pl-9 pr-8 py-2 focus:ring-2 focus:ring-primary focus:outline-hidden transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchHistory();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Main Email History List */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading email history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">No Email History Found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "No emails match your active search and filter settings. Try clearing filters."
                : "You haven't sent any emails to subscribers yet."}
            </p>
          </div>
          {onCompose && !searchQuery && statusFilter === "all" && (
            <Button
              onClick={onCompose}
              className="bg-primary hover:bg-primary/90 text-gray-950 font-bold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send Your First Email
            </Button>
          )}
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const total = item.totalRecipients || (item.recipients ? item.recipients.length : 0);
            const sent = item.sentCount || 0;
            const failed = item.failedCount || 0;
            const percent = total > 0 ? Math.round((sent / total) * 100) : 0;
            const formattedDate = new Date(item.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <div
                key={item._id}
                className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Type Badge (Only for Product Drop) */}
                      {item.emailType === "product_alert" && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          Product Drop
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          item.status === "sent"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : item.status === "partial"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : item.status === "failed"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-sky-50 text-sky-800 border border-sky-200"
                        }`}
                      >
                        {item.status === "sent" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.status === "partial" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {item.status === "failed" && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {item.status === "pending" && <Clock className="w-3 h-3 text-sky-600" />}
                        <span className="capitalize">{item.status === "sent" ? "Delivered" : item.status}</span>
                      </span>

                      {/* Audience */}
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        {item.targetAudience || `${total} Recipients`}
                      </span>

                      {/* Sent Time */}
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Subject Line */}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {item.subject}
                    </h3>

                    {/* Message Preview */}
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {item.message?.replace(/<[^>]*>?/gm, "") || item.heading || "No additional text"}
                    </p>
                  </div>

                  {/* Middle: Progress Bar */}
                  <div className="lg:w-48 shrink-0 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-gray-600">Delivered</span>
                      <span
                        className={
                          percent === 100
                            ? "text-emerald-700"
                            : percent > 0
                            ? "text-amber-700"
                            : "text-rose-700"
                        }
                      >
                        {sent}/{total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percent === 100
                            ? "bg-emerald-500"
                            : percent > 0
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {failed > 0 && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        {failed} failed recipient{failed === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
                    {/* View Details / Subscribers */}
                    <button
                      onClick={() => {
                        setSelectedEmail(item);
                        setModalSearch("");
                        setModalStatusFilter("all");
                      }}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Inspect recipients and email preview"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>Subscribers ({total})</span>
                    </button>

                    {/* Retry / Resend */}
                    {failed > 0 && (
                      <button
                        onClick={() => handleResend(item._id, "failed")}
                        disabled={resendingId === item._id}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        title="Retry sending to failed subscribers"
                      >
                        <RotateCw
                          className={`w-3.5 h-3.5 ${
                            resendingId === item._id ? "animate-spin" : ""
                          }`}
                        />
                        <span>Retry ({failed})</span>
                      </button>
                    )}

                    {/* Delete Log */}
                    <button
                      onClick={() => handleDeleteHistory(item._id, item.subject)}
                      disabled={deletingId === item._id}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipient Details Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/50">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {selectedEmail.emailType === "product_alert" && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      Product Alert
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(selectedEmail.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug break-words">
                  {selectedEmail.subject}
                </h2>
                <p className="text-xs text-gray-500">
                  Targeted: <span className="font-semibold text-gray-700">{selectedEmail.targetAudience}</span> • Sender: <span className="font-semibold text-gray-700">{selectedEmail.sender}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Message Content Preview Box */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Email Body Preview
                  </span>
                  {selectedEmail.buttonText && selectedEmail.buttonLink && (
                    <a
                      href={selectedEmail.buttonLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>CTA: {selectedEmail.buttonText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {selectedEmail.heading && (
                  <h4 className="text-sm font-bold text-amber-400">
                    {selectedEmail.heading}
                  </h4>
                )}

                <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
                  {selectedEmail.message}
                </div>
              </div>

              {/* Recipients Breakdown Header */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      Individual Subscriber Delivery Status
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {selectedEmail.sentCount} of {selectedEmail.totalRecipients} subscribers received this message
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy All Emails */}
                    <button
                      onClick={() => handleCopyAllRecipients(selectedEmail.recipients || [])}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedAll ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedAll ? "Copied All!" : "Copy Recipient List"}</span>
                    </button>

                    {/* Resend to All */}
                    <button
                      onClick={() => handleResend(selectedEmail._id, "all")}
                      disabled={resendingId === selectedEmail._id}
                      className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCw
                        className={`w-3 h-3 ${
                          resendingId === selectedEmail._id ? "animate-spin" : ""
                        }`}
                      />
                      <span>Resend All</span>
                    </button>
                  </div>
                </div>

                {/* Filter and search within recipients */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter subscriber email..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-1 self-start sm:self-auto text-xs">
                    {["all", "sent", "failed", "pending"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setModalStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition capitalize cursor-pointer ${
                          modalStatusFilter === st
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {st === "sent" ? "Delivered" : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscribers Table */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="py-2.5 px-4">Subscriber Email</th>
                          <th className="py-2.5 px-4">Delivery Status</th>
                          <th className="py-2.5 px-4">Details / Timestamp</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredRecipients.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-400 italic">
                              No subscribers match this criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredRecipients.map((rec, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/70 transition">
                              <td className="py-2.5 px-4 font-semibold text-gray-900">
                                {rec.email}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    rec.status === "sent"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      : rec.status === "failed"
                                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {rec.status === "sent" ? (
                                    <>
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Delivered</span>
                                    </>
                                  ) : rec.status === "failed" ? (
                                    <>
                                      <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                      <span>Failed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                                      <span>Pending</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-gray-500 text-[11px]">
                                {rec.status === "sent" && rec.sentAt ? (
                                  <span>{new Date(rec.sentAt).toLocaleTimeString()}</span>
                                ) : rec.error ? (
                                  <span className="text-rose-600 truncate max-w-xs block" title={rec.error}>
                                    {rec.error}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">In queue</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleCopyText(rec.email, `sub-${idx}`)}
                                    className="p-1 text-gray-400 hover:text-gray-700 rounded-md transition"
                                    title="Copy email"
                                  >
                                    {copiedEmail === `sub-${idx}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleResend(selectedEmail._id, "single", rec.email)
                                    }
                                    disabled={resendingId === selectedEmail._id}
                                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[10px] font-bold transition cursor-pointer"
                                    title="Resend to this subscriber"
                                  >
                                    Resend
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Log ID: <span className="font-mono text-[11px]">{selectedEmail._id}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmail(null)}
                  className="text-xs h-8 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </Button>
                {selectedEmail.failedCount > 0 && (
                  <Button
                    onClick={() => handleResend(selectedEmail._id, "failed")}
                    disabled={resendingId === selectedEmail._id}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-xl font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        resendingId === selectedEmail._id ? "animate-spin" : ""
                      }`}
                    />
                    <span>Retry All Failed ({selectedEmail.failedCount})</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
