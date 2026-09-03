import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerRoute from "./components/CustomerRoute";
import SplashScreen from "./components/SplashScreen";
import PageLoader from "./components/PageLoader";
import { hasSeenSplash } from "./utils/splash";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminDeliveryZones from "./pages/admin/AdminDeliveryZones";
import AdminOrders from "./pages/admin/AdminOrders";

function StorefrontLayout({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <PageLoader />
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
            <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
            <Route path="/product/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
            <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
            <Route path="/payment/callback" element={<StorefrontLayout><PaymentCallback /></StorefrontLayout>} />
            <Route path="/track-order" element={<StorefrontLayout><TrackOrder /></StorefrontLayout>} />
            <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
            <Route path="/signup" element={<StorefrontLayout><Signup /></StorefrontLayout>} />
            <Route
              path="/account"
              element={
                <StorefrontLayout>
                  <CustomerRoute>
                    <Account />
                  </CustomerRoute>
                </StorefrontLayout>
              }
            />
            <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
            <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
            <Route path="/returns" element={<StorefrontLayout><ReturnPolicy /></StorefrontLayout>} />
            <Route path="/privacy-policy" element={<StorefrontLayout><PrivacyPolicy /></StorefrontLayout>} />
            <Route path="/terms" element={<StorefrontLayout><TermsOfService /></StorefrontLayout>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/change-password"
              element={
                <ProtectedRoute>
                  <AdminChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute>
                  <AdminProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delivery-zones"
              element={
                <ProtectedRoute>
                  <AdminDeliveryZones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
