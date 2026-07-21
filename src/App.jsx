import { Route, Routes } from "react-router-dom";
import OrderPage from "@/pages/OrderPage.jsx";
import AuthPage from "@/pages/AuthPage.jsx";
import MyOrdersPage from "@/pages/MyOrdersPage.jsx";
import AdminPage from "@/pages/AdminPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/my" element={<MyOrdersPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
