import React from "react";
import { Routes, Route } from "react-router-dom";

import BarangDanAlat from "./pages/BarangDanAlat";
import TambahBarangDanAlat from "./pages/TambahBarangDanAlat";
import Skylift from "./pages/Skylift";
import TambahSkylift from "./pages/TambahSkylift";
import Dashboard from "./pages/Dashboard";
import KeluarMasukBarang from "./pages/KeluarMasukBarang";

function App() {
  return (
    <Routes>

      {/* DEFAULT PAGE */}
      <Route path="/" element={<Dashboard />} />

      <Route path="/barang" element={<BarangDanAlat />} />
      <Route path="/tambah-barang" element={<TambahBarangDanAlat />} />
      <Route path="/skylift" element={<Skylift />} />
      <Route path="/tambahskylift" element={<TambahSkylift />} />
      <Route path="/keluarmasuk" element={<KeluarMasukBarang />} />
    </Routes>
  );
}

export default App;
