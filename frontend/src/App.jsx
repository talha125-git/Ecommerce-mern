import './App.css'

// ── Auth Pages ──
import LoginPage from './pages/auth/LoginPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import SignupPage from './pages/auth/SignupPage'

// ── User / Store Pages ──
import HomePage from './pages/user/HomePage'
import CartPage from './pages/user/CartPage'
import ProductDetailsPage from './pages/user/ProductDetailsPage'
import CheckoutPage from './pages/user/CheckoutPage'
import UserDashboardPage from './pages/user/user_dashboard/UserDashboardPage'

// ── Admin Pages ──
import DashboardPage from './pages/admin/DashboardPage'

// ── Layout ──
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// ── Providers & Router ──
import { CartProvider } from './context/CartContext'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'

// Scroll To Top on Route Navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Dynamic Dashboard Redirect component based on role
const DashboardRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/user/dashboard" replace />;
};

// Layout wrapper for the public storefront (header + footer)
const StoreLayout = () => (
  <div className="antialiased flex flex-col min-h-screen">
    <Header />
    <main className="grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ═══════════════════════════════════
              User / Store Routes
              (wrapped in Header + Footer layout)
          ═══════════════════════════════════ */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* ═══════════════════════════════════
              Auth Routes
          ═══════════════════════════════════ */}
          <Route path="/register" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ═══════════════════════════════════
              Dashboards
          ═══════════════════════════════════ */}
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App