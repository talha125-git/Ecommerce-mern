import './App.css'

// ── Auth Pages ──
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// ── User / Store Pages ──
import HomePage from './pages/user/HomePage'
import CartPage from './pages/user/CartPage'
import ProductDetailsPage from './pages/user/ProductDetailsPage'

// ── Admin Pages ──
import DashboardPage from './pages/admin/admin_pages/DashboardPage'

// ── Layout ──
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// ── Providers & Router ──
import { CartProvider } from './context/CartContext'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

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
        <Routes>
          {/* ═══════════════════════════════════
              User / Store Routes
              (wrapped in Header + Footer layout)
          ═══════════════════════════════════ */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
          </Route>

          {/* ═══════════════════════════════════
              Auth Routes
              (standalone – no header/footer)
          ═══════════════════════════════════ */}
          <Route path="/register" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ═══════════════════════════════════
              Admin Routes
              (standalone – separate layout)
          ═══════════════════════════════════ */}
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App