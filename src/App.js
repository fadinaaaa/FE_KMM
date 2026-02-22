import React from "react";
import { Routes, Route } from "react-router-dom";

import BarangDanAlat from "./pages/BarangDanAlat";
import TambahBarangDanAlat from "./pages/TambahBarangDanAlat";
import Skylift from "./pages/Skylift";
import TambahSkylift from "./pages/TambahSkylift";
import Dashboard from "./pages/Dashboard";
import KeluarMasukBarang from "./pages/KeluarMasukBarang";
import PergantianAlatKerja from "./pages/PergantianAlatKerja";
import PeminjamanBarang from "./pages/PeminjamanBarang";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>

      {/* DEFAULT PAGE */}
      <Route path="/" element={<LoginPage />} />
      
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/barang" element={<BarangDanAlat />} />
      <Route path="/tambah-barang" element={<TambahBarangDanAlat />} />
      <Route path="/skylift" element={<Skylift />} />
      <Route path="/tambahskylift" element={<TambahSkylift />} />
      <Route path="/keluarmasuk" element={<KeluarMasukBarang />} />
      <Route path="/pergantian" element={<PergantianAlatKerja />} />
      <Route path="/peminjaman" element={<PeminjamanBarang />} />
    </Routes>
  );
}

export default App;
