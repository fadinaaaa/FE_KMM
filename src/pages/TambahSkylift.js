import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const TambahSkylift = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jenis: "Skylift",
    id: "",
    nama: "",
    quantity: ""
  });

  /* ================= AUTO GENERATE ID ================= */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("skyliftData")) || [];
    const nextNumber = data.length + 1;
    const newId = `S_${String(nextNumber).padStart(3, "0")}`;
    setForm((prev) => ({ ...prev, id: newId }));
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE ================= */
  const handleSubmit = () => {
    const oldData = JSON.parse(localStorage.getItem("skyliftData")) || [];
    const newData = [...oldData, form];
    localStorage.setItem("skyliftData", JSON.stringify(newData));
    navigate("/skylift");
  };

  return (
    <div style={style.pageContainer}>
      <Sidebar />

      {/* ===== MODAL OVERLAY ===== */}
      <div style={style.overlay}>
        <div style={style.modal}>
          <h3 style={{ marginBottom: "15px" }}>Tambah Skylift</h3>

          {/* JENIS (FIXED) */}
          <input
            value="Skylift"
            disabled
            style={{ ...style.input, background: "#eee" }}
          />

          {/* AUTO ID */}
          <input
            value={form.id}
            disabled
            style={{ ...style.input, background: "#eee" }}
          />

          {/* NAMA */}
          <input
            name="nama"
            placeholder="Nama Skylift"
            onChange={handleChange}
            style={style.input}
          />

          {/* QUANTITY */}
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            onChange={handleChange}
            style={style.input}
          />

          {/* BUTTON */}
          <div style={style.btnGroup}>
            <button onClick={handleSubmit} style={style.saveBtn}>
              Simpan
            </button>
            <button
              onClick={() => navigate("/skylift")}
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

//* ================= STYLE (FINAL FIX) ================= */
const style = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },

  

    modal: {
    background: "#fff",
    width: "420px",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },


  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box"
  },

  btnGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px"
  },

  saveBtn: {
    flex: 1,
    background: "#2F1F6B",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  cancelBtn: {
    flex: 1,
    background: "#9e9e9e",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default TambahSkylift;
