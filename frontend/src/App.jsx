
import './App.css'
import Signup from './componants/Signup'
import Login from './componants/Login'
import Dashboard from './componants/Dashboard'
import Home from './componants/Home'
import Cart from './componants/Cart'
import ProductDetails from './componants/ProductDetails'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { CartProvider } from './context/CartContext'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

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
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Route>
          
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App