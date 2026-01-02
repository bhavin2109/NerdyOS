import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Desktop from "../os/desktop/Desktop";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Desktop Route */}
        <Route path="/" element={<Desktop />} />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
