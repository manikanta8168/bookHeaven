import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminBooks from './pages/AdminBooks';
import AboutContact from './pages/AboutContact';
import AdminBookEdit from './pages/AdminBookEdit';
import AdminOrders from './pages/AdminOrders';
import SupportPage from './pages/SupportPage';
import Categories from './pages/Categories';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import Account from './pages/Account';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import WhatsAppFloat from './components/WhatsAppFloat';
import AdminDashboard from './pages/AdminDashboard';
import SellWithUs from './pages/SellWithUs';
import AdminCollabRequests from './pages/AdminCollabRequests';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route element={<UserRoute />}>
              <Route path="/account" element={<Account />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
            </Route>
            <Route path="/admin/login" element={<Login adminMode />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/books" element={<AdminBooks />} />
              <Route path="/admin/books/new" element={<AdminBookEdit />} />
              <Route path="/admin/books/:id/edit" element={<AdminBookEdit />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/collab" element={<AdminCollabRequests />} />
            </Route>
            <Route path="/about" element={<AboutContact />} />
            <Route path="/contact" element={<AboutContact />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/faq" element={<SupportPage topic="faq" />} />
            <Route path="/shipping" element={<SupportPage topic="shipping" />} />
            <Route path="/returns" element={<SupportPage topic="returns" />} />
            <Route path="/sell-with-us" element={<SellWithUs />} />
          </Routes>
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
