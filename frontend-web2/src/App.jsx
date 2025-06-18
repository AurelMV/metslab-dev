import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyCode from "./pages/auth/Verify-code";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import AddressPage from "./pages/Direcciones/AddressPage";

import "leaflet/dist/leaflet.css";
import "./fixLeafletIcon";

// Import the new CSS file
import "./App.css"; // Adjust the path if your App.css is in a different directory

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Replaced 'min-h-screen flex flex-col' with 'app-container' */}
          <div className="app-container">
            <Header />
            {/* Replaced 'flex-1' with 'app-main-content' */}
            <main className="app-main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/verify-code" element={<VerifyCode />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/direcciones" element={<AddressPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
