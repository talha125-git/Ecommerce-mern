import { useCart } from "@/context/CartContext";
import { Menu, Search, ShoppingCart, X, ChevronDown, User, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function Header() {
  const { cart } = useCart();
  const cartCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const { pathname } = useLocation();

  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!localStorage.getItem("userLoggedIn") || !!localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setLoginDropdownOpen(false);
  }, [pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const isActivePath = (path) => {
    if (path === "/" || path === "/#hero-slider") {
      return pathname === "/" && (!window.location.hash || window.location.hash === "" || window.location.hash === "#hero-slider");
    }
    if (path.includes("#")) {
      return pathname === "/" && window.location.hash === path.substring(path.indexOf("#"));
    }
    return pathname === path;
  };

  const navItems = [
    { href: "/#hero-slider", label: "Home" },
    { href: "/#products", label: "All Products" },
    { href: "/#about", label: "About Us" },
  ];

  const handleNavClick = (e, href) => {
    setIsMobileOpen(false);

    if (href === "/" || href === "/#hero-slider") {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (href.includes("#")) {
      const hash = href.substring(href.indexOf("#"));
      if (pathname === "/") {
        e.preventDefault();
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const getDashboardPath = () => {
    return userRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  return (
    <header
      id="header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8 lg:space-x-12">
            <Link
              className="text-2xl tracking-tight text-gray-900 hover:text-gray-700 transition-colors font-extrabold"
              to="/"
              aria-label="BloomShop Home"
            >
              BLOOM<span className="text-primary">SHOP</span>
            </Link>

            <nav
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className={`relative py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActivePath(href)
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={isActivePath(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form className="relative w-full">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                aria-label="Search products"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons / Dashboard Pill */}
            <div className="hidden sm:flex items-center space-x-2">
              {isLoggedIn ? (
                <Link to={getDashboardPath()}>
                  <Button size="sm" variant="default" className="text-sm font-bold gap-1.5 rounded-xl shadow-sm">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  {/* Sign In Dropdown Button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className="text-sm font-semibold gap-1 rounded-xl"
                    >
                      Sign In <ChevronDown className={`w-4 h-4 transition-transform ${loginDropdownOpen ? "rotate-180" : ""}`} />
                    </Button>

                    {loginDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <Link
                          to="/login"
                          onClick={() => setLoginDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                          <User className="w-4 h-4 text-primary" /> User Login
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <Link
                          to="/admin/login"
                          onClick={() => setLoginDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-600" /> Admin Login
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link to="/register">
                    <Button size="sm" variant="default" className="text-sm font-bold rounded-xl">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="lg:hidden mt-4 animate-in slide-in-from-top duration-200">
            <form className="relative">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                aria-label="Search products"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}

        {isMobileOpen && (
          <nav
            className="md:hidden mt-4 animate-in slide-in-from-top duration-200"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-3 pb-4 border-b border-gray-200">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className={`text-sm font-medium py-2 px-3 rounded-lg transition-all ${
                    isActivePath(href)
                      ? "bg-orange-100"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  aria-current={isActivePath(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-3 pt-4 sm:hidden">
              {isLoggedIn ? (
                <Button className="w-full text-sm font-bold" variant="default" asChild>
                  <Link to={getDashboardPath()} onClick={closeMobileMenu}>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full text-sm font-bold justify-between" asChild>
                    <Link to="/login" onClick={closeMobileMenu}>
                      <span>User Login</span>
                      <User className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full text-sm font-bold justify-between text-rose-600 border-rose-200" asChild>
                    <Link to="/admin/login" onClick={closeMobileMenu}>
                      <span>Admin Login</span>
                      <ShieldCheck className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button className="w-full text-sm font-bold" variant="default" asChild>
                    <Link to="/register" onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
