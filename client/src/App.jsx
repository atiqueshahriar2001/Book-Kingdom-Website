import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AdminBooksPage from "./pages/admin/AdminBooksPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import BookDetailsPage from "./pages/BookDetailsPage.jsx";
import BooksPage from "./pages/BooksPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import OrdersPage from "./pages/user/OrdersPage.jsx";
import ProfilePage from "./pages/user/ProfilePage.jsx";
import UserDashboardPage from "./pages/user/UserDashboardPage.jsx";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return children;
};

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!isAdminPage && !isAdmin && <Header />}
      <main className="main-shell">
        <Routes>
          <Route path="/" element={<AdminRoute><HomePage /></AdminRoute>} />
          <Route path="/books" element={<AdminRoute><BooksPage /></AdminRoute>} />
          <Route path="/books/:id" element={<AdminRoute><BookDetailsPage /></AdminRoute>} />
          <Route path="/login" element={<AdminRoute><LoginPage /></AdminRoute>} />
          <Route path="/register" element={<AdminRoute><RegisterPage /></AdminRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/books" element={<ProtectedRoute admin><AdminLayout><AdminBooksPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute admin><AdminLayout><AdminOrdersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute admin><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdminPage && !isAdmin && <Footer />}
    </div>
  );
};

export default App;
