import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ContentChecker from "./pages/ContentChecker";
import Guidelines from "./pages/Guidelines";
import VisualChecker from "./pages/VisualChecker";
import History from "./pages/History";
import Review from "./pages/Review";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/check" element={<ContentChecker />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/visual" element={<VisualChecker />} />
        <Route path="/history" element={<History />} />
        <Route path="/review" element={<Review />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>
    </Routes>
  );
}
