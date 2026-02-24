import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";

const Skylift = () => {
  const API_URL = "http://localhost:8000/api";
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fileInputRef = useRef(null);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const [form, setForm] = useState({
    db_id: null,
    nama: "",
    quantity: "",
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
      const res = await axios.get(`${API_URL}/skylifts`, authHeader);

      const normalized = res.data.map((item) => ({
        db_id: item.id,
        nama: item.nama,
        quantity: item.quantity,
      }));

      setData(normalized);
    } catch (error) {
      console.error(error);
      alert("Gagal load data skylift");
    }
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.nama || !form.quantity) {
      alert("Lengkapi data!");
      return;
    }

    const payload = {
      nama: form.nama,
      quantity: Number(form.quantity),
    };

    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/skylifts/${form.db_id}`,
          payload,
          authHeader,
        );
      } else {
        await axios.post(`${API_URL}/skylifts`, payload, authHeader);
      }

      alert("Simpan berhasil ✅");
      fetchData();
      resetForm();
    } catch (error) {
      console.error(error.response?.data);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        let msg = "Gagal simpan:\n";
        for (let key in errors) {
          msg += `- ${errors[key][0]}\n`;
        }
        alert(msg);
      } else {
        alert("Gagal simpan skylift");
      }
    }
  };

  const resetForm = () => {
    setForm({
      db_id: null,
      nama: "",
      quantity: "",
    });
    setShowModal(false);
    setIsEdit(false);
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
      db_id: item.db_id,
      nama: item.nama,
      quantity: item.quantity,
    });
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus skylift?")) return;

    try {
      await axios.delete(`${API_URL}/skylifts/${id}`, authHeader);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal hapus skylift");
    }
  };

  // ================= EXPORT =================
const handleExport = async () => {
  try {
    const res = await axios.get(`${API_URL}/skylifts-export`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "skylifts.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Export error:", error);
    alert("Export gagal");
  }
};

  // ================= IMPORT =================
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/skylifts-import`, formData, authHeader);
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
    const template = [{ nama: "", quantity: "" }];
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_skylift.xlsx");
    setShowImportMenu(false);
  };

  return (
  <div style={layout.container}>
    <Sidebar />

    <div style={layout.content}>
      {/* TOP BAR */}
      <div style={layout.topBar}>
        <input
          placeholder="Cari Nama"
          style={layout.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          {/* EXPORT */}
          <button style={layout.btn} onClick={handleExport}>
            Export
          </button>

          {/* IMPORT ADMIN */}
          {isAdmin && (
            <div style={{ position: "relative", display: "inline-block" }}>
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
          )}

          {/* TAMBAH ADMIN */}
          {isAdmin && (
            <button
              style={layout.btn}
              onClick={() => setShowModal(true)}
            >
              + Baru
            </button>
          )}

          {/* FILE INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* TABLE */}
      <table style={layout.table}>
        <thead>
          <tr>
            <th style={layout.th}>NAMA</th>
            <th style={layout.th}>QUANTITY</th>
            <th style={layout.th}>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {data
            .filter((item) =>
              item.nama.toLowerCase().includes(search.toLowerCase())
            )
            .map((item, i) => (
              <tr key={i}>
                <td style={layout.td}>{item.nama}</td>
                <td style={layout.td}>{item.quantity}</td>

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
          <h3>{isEdit ? "Edit Skylift" : "Tambah Skylift"}</h3>

          <input
            name="nama"
            placeholder="Nama"
            value={form.nama}
            onChange={handleChange}
            style={layout.input}
          />

          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            style={layout.input}
          />

          <div style={layout.modalBtnWrap}>
            <button style={layout.saveBtn} onClick={handleSave}>
              Simpan
            </button>
            <button style={layout.cancelBtn} onClick={resetForm}>
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
          <h3>Detail Skylift</h3>

          <p>
            <b>Nama:</b> {detailData.nama}
          </p>
          <p>
            <b>Quantity:</b> {detailData.quantity}
          </p>

          <button
            style={{ ...layout.cancelBtn, width: "100%" }}
            onClick={() => setShowDetail(false)}
          >
            Tutup
          </button>
        </div>
      </div>
    )}
  </div>
  )}

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

  th: {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "center",
    background: "#F5F6FA",
    fontWeight: "600",
  },

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

export default Skylift;
