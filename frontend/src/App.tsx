import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CustomerList } from "./pages/customers/CustomerList";
import { CustomerForm } from "./pages/customers/CustomerForm";
import { CustomerDetail } from "./pages/customers/CustomerDetail";
import { ProductList } from "./pages/products/ProductList";
import { ProductForm } from "./pages/products/ProductForm";
import { ProductDetail } from "./pages/products/ProductDetail";
import { ChallanList } from "./pages/challans/ChallanList";
import { ChallanCreate } from "./pages/challans/ChallanCreate";
import { ChallanDetail } from "./pages/challans/ChallanDetail";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />

          <Route path="/challans" element={<ChallanList />} />
          <Route path="/challans/new" element={<ChallanCreate />} />
          <Route path="/challans/:id" element={<ChallanDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
