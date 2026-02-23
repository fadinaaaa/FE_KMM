import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const TambahBarangDanAlat = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    jenis: "Barang",
    id: "",
    nama: "",
    satuan: "",
    saldo: "",
    minimal: "",
  });

  // ================= AUTO GENERATE ID =================
  useEffect(() => {
    generateId(form.jenis);
  }, [form.jenis]);

  const generateId = (jenis) => {

    const data = JSON.parse(localStorage.getItem("barangData")) || [];

    const prefix = jenis === "Barang" ? "B" : "A";

    const filtered = data.filter(item => item.id.startsWith(prefix));

    const nextNumber = filtered.length + 1;

    const newId = `${prefix}_${String(nextNumber).padStart(3, "0")}`;

    setForm(prev => ({ ...prev, id: newId }));
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSubmit = () => {

    const oldData = JSON.parse(localStorage.getItem("barangData")) || [];

    const newData = [...oldData, form];

    localStorage.setItem("barangData", JSON.stringify(newData));

    navigate("/dashboard");
  };

  return (
    <div style={style.pageContainer}>

      <Sidebar />

      {/* ===== MODAL OVERLAY ===== */}
      <div style={style.overlay}>

        <div style={style.modal}>

          <h3 style={{ marginBottom: "15px" }}>
            Tambah Barang & Alat
          </h3>

          {/* PILIH JENIS */}
          <select
            name="jenis"
            value={form.jenis}
            onChange={handleChange}
            style={style.input}
          >
            <option value="Barang">Barang</option>
            <option value="Alat">Alat</option>
          </select>

          {/* AUTO ID */}
          <input
            value={form.id}
            disabled
            style={{
              ...style.input,
              background: "#eee",
              cursor: "not-allowed"
            }}
          />

          <input
            name="nama"
            placeholder="Nama Barang / Alat"
            onChange={handleChange}
            style={style.input}
          />

          <input
            name="satuan"
            placeholder="Satuan (Bh, Unit, Pcs)"
            onChange={handleChange}
            style={style.input}
          />

          <input
            name="saldo"
            type="number"
            placeholder="Saldo"
            onChange={handleChange}
            style={style.input}
          />

          <input
            name="minimal"
            type="number"
            placeholder="Minimal Saldo"
            onChange={handleChange}
            style={style.input}
          />

          {/* BUTTON AREA */}
          <div style={style.btnGroup}>

            <button
              onClick={handleSubmit}
              style={style.saveBtn}
            >
              Simpan
            </button>

            <button
              onClick={() => navigate("/barang")}
              style={style.cancelBtn}
            >
              Batal
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

// ================= STYLE =================

const style = {

  pageContainer: {
    display: "flex",
    height: "100vh"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    background: "white",
    width: "420px",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.3s ease"
  },

  input: {
    width: "100%",
    padding: "11px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none"
  },

  btnGroup: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px"
  },

  saveBtn: {
    background: "#2F1F6B",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%"
  },

  cancelBtn: {
    background: "#999",
    color: "white",
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%"
  }

};

export default TambahBarangDanAlat;
