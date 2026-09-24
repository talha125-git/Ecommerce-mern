import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  ArrowRight,
  MailCheck,
  Sparkles,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyNewsletterPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Verification token is missing. Please check your verification link.");
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const res = await axios.get(`${API_URL}/api/newsletter/verify?token=${encodeURIComponent(token)}`);

        if (isMounted) {
          setSuccess(true);
          setMessage(res.data.message || "Your email has been successfully verified!");
          if (res.data.email) setEmail(res.data.email);
        }
      } catch (err) {
        if (isMounted) {
          setSuccess(false);
          setMessage(
            err.response?.data?.message ||
              "Invalid or expired verification link. Please subscribe again from our footer."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Verifying Subscription...
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Confirming your email with our newsletter database. Just a moment!
            </p>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-xs">
                <MailCheck className="w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 bg-primary text-gray-950 p-1.5 rounded-full shadow-xs">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wide">
                Subscription Confirmed
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                You're in the Loop!
              </h1>
              {email && (
                <p className="text-xs font-semibold text-slate-800 bg-slate-100 py-1 px-3 rounded-lg inline-block">
                  {email}
                </p>
              )}
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                Thank you for subscribing to the BloomShop newsletter. You'll now receive our newest arrivals, secret sales, and trend alerts directly in your inbox.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="flex-1">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Start Shopping
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-100 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-gray-500" /> Go to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 uppercase tracking-wide">
                Verification Failed
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Link Expired or Invalid
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                {message ||
                  "This verification link has expired or has already been used. Please subscribe again from our footer to get a new verification link."}
              </p>
            </div>

            <div className="pt-2">
              <Link to="/">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                  <ArrowRight className="w-4 h-4 text-primary" /> Return to Homepage & Try Again
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
