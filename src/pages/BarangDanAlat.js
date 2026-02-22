import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";

const BarangDanAlat = () => {
  const [data, setData] = useState([]);
  const API_URL = "http://localhost:8000/api";
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    jenis: "Barang",
    id: "",
    nama: "",
    satuan: "",
    saldo: "",
    minimal: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`, authHeader);
      // Normalisasi data agar konsisten (mengonversi field dari backend ke state frontend)
      const normalized = res.data.map((item) => ({
        id: item.kode || String(item.id),
        nama: item.nama || "",
        satuan: item.satuan || "",
        saldo: Number(item.saldo) || 0,
        minimal: Number(item.minimal_saldo) || Number(item.minimal) || 0,
      }));
      setData(normalized);
    } catch (error) {
      console.error(error);
      alert("Gagal load data");
    }
  };

  // ================= AUTO ID =================
  useEffect(() => {
    if (showModal && !isEdit) {
      generateId(form.jenis);
    }
  }, [showModal, form.jenis]);

  const generateId = (jenis) => {
    const prefix = jenis === "Barang" ? "B" : "A";
    const filtered = data.filter((item) => String(item.id).startsWith(prefix));
    const nextNumber = filtered.length + 1;
    const newId = `${prefix}_${String(nextNumber).padStart(3, "0")}`;
    setForm((prev) => ({ ...prev, id: newId }));
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.nama || !form.saldo || !form.minimal) {
      alert("Lengkapi data!");
      return;
    }

    try {
      // Pastikan nama field (kiri) sesuai dengan kolom di Database/Backend Anda
      const payload = {
        kode: form.id,
        jenis: form.jenis.toLowerCase(), // FIX INVALID
        nama: form.nama,
        satuan: form.satuan,
        saldo: Number(form.saldo),
        minimal_saldo: Number(form.minimal),
      };

      if (isEdit) {
        await axios.put(`${API_URL}/items`, payload, authHeader);
      } else {
        await axios.post(`${API_URL}/items`, payload, authHeader);
      }

      alert("Simpan Berhasil!");
      fetchData();
      setShowModal(false);
      setIsEdit(false);
      setForm({
        jenis: "Barang",
        id: "",
        nama: "",
        satuan: "",
        saldo: "",
        minimal: "",
      });
    } catch (error) {
      console.error("Detail Error 422:", error.response?.data);

      // Mengambil pesan error validasi dari backend (Laravel style)
      if (error.response?.status === 422) {
        const errors = error.response.data.errors; // Ambil daftar kolom yang error
        let pesan = "Gagal simpan:\n";
        for (let key in errors) {
          pesan += `- ${errors[key][0]}\n`;
        }
        alert(pesan);
      } else {
        alert("Gagal simpan data");
      }
    }
  };

  // ================= VIEW =================
  const handleView = (item) => {
    setDetailData(item);
    setShowDetail(true);
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setIsEdit(true);
    setForm({
      jenis: String(item.id).startsWith("B") ? "Barang" : "Alat",
      id: item.id,
      nama: item.nama,
      satuan: item.satuan,
      saldo: item.saldo,
      minimal: item.minimal,
    });
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data?")) return;

    try {
      await axios.delete(`${API_URL}/items`, authHeader, {
        data: {
          kode: id, // ← WAJIB pakai "data"
        },
      });

      alert("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error.response?.data);
      alert("Gagal menghapus data");
    }
  };

  // ================= EXPORT =================
  const handleExport = () => {
    window.open(`${API_URL}/items-export`, "_blank", authHeader);
  };

  // ================= IMPORT =================
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/items-import`, formData, authHeader);
      alert("Import berhasil ✅");
      fetchData();
      setShowImportMenu(false);
      fileInputRef.current.value = null;
    } catch (error) {
      console.error(error);
      alert("Import gagal");
    }
  };

  const handleDownloadTemplate = () => {
    const worksheetData = [
      {
        kode: "",
        nama: "",
        jenis: "", // ✅ KOSONG
        satuan: "",
        saldo: "",
        minimal_saldo: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, "template_inventory.xlsx");
  };

  return (
    <div style={layout.container}>
      <Sidebar />
      <div style={layout.content}>
        {/* TOP BAR */}
        <div style={layout.topBar}>
          <input
            placeholder="Cari ID atau Nama"
            style={layout.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div>
            <button style={layout.btn} onClick={handleExport}>
              Export
            </button>
            <div style={{ position: "relative", display: "inline-block" }}>
              {isAdmin && (
                <>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      style={layout.btn}
                      onClick={() => setShowImportMenu(!showImportMenu)}
                    >
                      Import
                    </button>
                    {showImportMenu && (
                      <div style={layout.dropdown}>
                        <button
                          onClick={handleDownloadTemplate}
                          style={layout.dropBtn}
                        >
                          Download Template
                        </button>
                        <button
                          onClick={() => fileInputRef.current.click()}
                          style={layout.dropBtn}
                        >
                          Upload File
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    style={layout.btn}
                    onClick={() => {
                      setShowModal(true);
                      setIsEdit(false);
                    }}
                  >
                    + Baru
                  </button>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <table style={layout.table}>
          <thead>
            <tr>
              <th style={layout.th}>ID</th>
              <th style={layout.th}>NAMA</th>
              <th style={layout.th}>SATUAN</th>
              <th style={layout.th}>SALDO</th>
              <th style={layout.th}>MINIMAL</th>
              <th style={layout.th}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((item) => {
                // PENGAMAN: Ubah ke string agar .toLowerCase() tidak error
                const id = item.id ? String(item.id).toLowerCase() : "";
                const nama = item.nama ? String(item.nama).toLowerCase() : "";
                const term = search.toLowerCase();
                return id.includes(term) || nama.includes(term);
              })
              .map((item, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor:
                      item.saldo < item.minimal ? "#FFE5E5" : "transparent",
                  }}
                >
                  <td style={layout.td}>{item.id}</td>
                  <td style={layout.td}>{item.nama}</td>
                  <td style={layout.td}>{item.satuan}</td>
                  <td
                    style={{
                      ...layout.td,
                      color: item.saldo < item.minimal ? "red" : "black",
                      fontWeight: item.saldo < item.minimal ? "bold" : "normal",
                    }}
                  >
                    {item.saldo}
                  </td>
                  <td style={layout.td}>{item.minimal}</td>
                  <td style={layout.td}>
                    <div style={layout.actionWrap}>
                      <button
                        style={layout.viewBtn}
                        onClick={() => handleView(item)}
                      >
                        <FaEye />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            style={layout.editBtn}
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            style={layout.deleteBtn}
                            onClick={() => handleDelete(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div style={layout.overlay}>
          <div style={layout.modal}>
            <h3>{isEdit ? "Edit Data" : "Tambah Data"}</h3>
            <select
              name="jenis"
              value={form.jenis}
              onChange={handleChange}
              style={layout.input}
            >
              <option value="Barang">Barang</option>
              <option value="Alat">Alat</option>
            </select>
            <input
              value={form.id}
              disabled
              style={{ ...layout.input, background: "#eee" }}
            />
            <input
              name="nama"
              placeholder="Nama"
              value={form.nama}
              onChange={handleChange}
              style={layout.input}
            />
            <input
              name="satuan"
              placeholder="Satuan"
              value={form.satuan}
              onChange={handleChange}
              style={layout.input}
            />
            <input
              name="saldo"
              type="number"
              placeholder="Saldo"
              value={form.saldo}
              onChange={handleChange}
              style={layout.input}
            />
            <input
              name="minimal"
              type="number"
              placeholder="Minimal"
              value={form.minimal}
              onChange={handleChange}
              style={layout.input}
            />
            <div style={layout.modalBtnWrap}>
              <button onClick={handleSave} style={layout.saveBtn}>
                Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={layout.cancelBtn}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetail && detailData && (
        <div style={layout.overlay}>
          <div style={layout.modal}>
            <h3>Detail Inventory</h3>
            <p>
              <b>ID:</b> {detailData.id}
            </p>
            <p>
              <b>Nama:</b> {detailData.nama}
            </p>
            <p>
              <b>Satuan:</b> {detailData.satuan}
            </p>
            <p>
              <b>Saldo:</b> {detailData.saldo}
            </p>
            <p>
              <b>Minimal:</b> {detailData.minimal}
            </p>
            <button
              onClick={() => setShowDetail(false)}
              style={{ ...layout.cancelBtn, width: "100%" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const layout = {
  container: {
    display: "flex",
    height: "100vh",
  },

  content: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  search: {
    width: "300px",
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    background: "#9E9E9E",
    color: "white",
    outline: "none",
  },

  btn: {
    background: "#2F1F6B",
    color: "white",
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    marginLeft: "10px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
  },

  /* === HEADER TABLE === */
  th: {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "center",
    background: "#F5F6FA",
    fontWeight: "600",
  },

  /* === ISI TABLE === */
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
    transition: "0.2s",
  },

  actionWrap: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },

  viewBtn: {
    background: "#F1F93B",
    border: "none",
    padding: "7px 10px",
    cursor: "pointer",
    borderRadius: "6px",
  },

  editBtn: {
    background: "#3DA5FF",
    color: "white",
    border: "none",
    padding: "7px 10px",
    cursor: "pointer",
    borderRadius: "6px",
  },

  deleteBtn: {
    background: "#FF4D4D",
    color: "white",
    border: "none",
    padding: "7px 10px",
    cursor: "pointer",
    borderRadius: "6px",
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
    zIndex: 1000,
  },

  modal: {
    background: "white",
    padding: "20px",
    width: "400px",
    borderRadius: "12px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    boxSizing: "border-box",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  modalBtnWrap: {
    display: "flex",
    justifyContent: "space-between",
  },

  saveBtn: {
    background: "#2F1F6B",
    color: "white",
    width: "48%",
    padding: "10px",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },

  cancelBtn: {
    background: "#b51414ff",
    color: "white",
    width: "48%",
    padding: "10px",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },

  dropdown: {
    position: "absolute",
    top: "45px",
    right: "0",
    background: "white",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    zIndex: 99,
  },

  dropBtn: {
    width: "100%",
    marginBottom: "5px",
    cursor: "pointer",
    padding: "6px",
    border: "none",
    background: "#F1F1F1",
    borderRadius: "5px",
  },
};

export default BarangDanAlat;
