// src/pages/PergantianAlatKerja.js
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import SignatureCanvas from "react-signature-canvas";

const PergantianAlatKerja = () => {
  const API_URL = "http://localhost:8000/api";

  // ===== DATA =====
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  // ===== MODAL =====
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // ===== DETAIL =====
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // ===== AUTOCOMPLETE =====
  const [showAuto, setShowAuto] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  // ===== FILE =====
  const fileRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // ===== SIGNATURE =====
  const sigRef = useRef(null);
  const sigBoxRef = useRef(null);
  const [sigWidth, setSigWidth] = useState(380);
  const [sigError, setSigError] = useState("");
  const [sigPreview, setSigPreview] = useState(""); // ttd lama (optional)

  // ===== FORM =====
  const [form, setForm] = useState({
    id: "",
    item_id: "",
    nama_barang: "",
    satuan: "",
    tanggal: "",
    nominal: "",
    pic: "",
    foto_lama: null,
  });

  // ================= LOAD =================
  useEffect(() => {
    fetchPergantian();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Signature resize listener (saat modal terbuka)
  useEffect(() => {
    if (!showModal) return;

    const updateWidth = () => {
      const w = sigBoxRef.current?.clientWidth || 380;
      setSigWidth(Math.max(260, Math.floor(w)));
    };

    const t = setTimeout(updateWidth, 0);
    window.addEventListener("resize", updateWidth);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateWidth);
    };
  }, [showModal]);

  // GET transaksi pergantian
  const fetchPergantian = async () => {
    try {
      const res = await axios.get(`${API_URL}/pergantian-alat`);
      const list = res.data?.data || res.data || [];

      const normalized = list.map((r) => ({
        id: r.id,
        item_id: r.item_id ?? r.item?.id ?? "",
        item_kode: r.item_kode ?? r.item?.kode ?? "",
        nama_barang: r.nama_barang || "",
        satuan: r.satuan || "",
        tanggal: r.tanggal || "",
        nominal: Number(r.nominal) || 0,
        pic: r.pic || "",
        foto_lama_url: r.foto_lama_url || "",
        tanda_tangan_url: r.tanda_tangan_url || "", // kalau backend kirim url ttd
      }));

      setRows(normalized);
    } catch (err) {
      console.error(err);
      alert("Gagal load data pergantian alat");
    }
  };

  // GET items untuk autocomplete
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`);
      const list = res.data || [];

      const normalized = list.map((it) => ({
        id: it.id,
        kode: it.kode || "",
        nama: it.nama || "",
        satuan: it.satuan || "",
        jenis: it.jenis || "",
        saldo: Number(it.saldo) || 0,
      }));

      setItems(normalized);
    } catch (err) {
      console.error(err);
      alert("Gagal load items untuk autocomplete");
    }
  };

  // ================= FORM =================
  const resetForm = () => {
    setForm({
      id: "",
      item_id: "",
      nama_barang: "",
      satuan: "",
      tanggal: "",
      nominal: "",
      pic: "",
      foto_lama: null,
    });

    setPreviewUrl("");
    setShowAuto(false);
    setFilteredItems([]);
    setSigError("");
    setSigPreview("");

    if (fileRef.current) fileRef.current.value = null;
    sigRef.current?.clear();
  };

  const openCreate = () => {
    setIsEdit(false);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (row) => {
    setIsEdit(true);

    setForm({
      id: row.id,
      item_id: row.item_id || "",
      nama_barang: row.nama_barang || "",
      satuan: row.satuan || "",
      tanggal: row.tanggal || "",
      nominal: row.nominal || "",
      pic: row.pic || "",
      foto_lama: null,
    });

    setPreviewUrl(row.foto_lama_url || "");
    setSigPreview(row.tanda_tangan_url || "");

    if (fileRef.current) fileRef.current.value = null;
    sigRef.current?.clear(); // edit: ttd ulang
    setShowModal(true);
  };

  const openView = (row) => {
    setDetailData(row);
    setShowDetail(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, foto_lama: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ================= AUTOCOMPLETE =================
  const onNamaChange = (value) => {
    setForm((prev) => ({
      ...prev,
      nama_barang: value,
      item_id: "",
      satuan: "",
    }));

    if (value.trim().length >= 1) {
      const filtered = items.filter((it) =>
        it.nama.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowAuto(true);
    } else {
      setShowAuto(false);
      setFilteredItems([]);
    }
  };

  const pickItem = (it) => {
    setForm((prev) => ({
      ...prev,
      item_id: it.id,
      nama_barang: it.nama,
      satuan: it.satuan,
    }));
    setShowAuto(false);
  };

  // ================= SIGNATURE (FIX ERROR getTrimmedCanvas) =================
  // ✅ TRIM manual tanpa getTrimmedCanvas (aman untuk alpha)
  const trimSignatureCanvasToDataURL = () => {
    if (!sigRef.current) return "";
    if (sigRef.current.isEmpty()) return "";

    const canvas = sigRef.current.getCanvas(); // ✅ aman
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let top = null,
      bottom = null,
      left = null,
      right = null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 0) {
          if (top === null) top = y;
          bottom = y;
          if (left === null || x < left) left = x;
          if (right === null || x > right) right = x;
        }
      }
    }

    if (top === null) return "";

    const pad = 10;
    top = Math.max(0, top - pad);
    left = Math.max(0, left - pad);
    bottom = Math.min(height - 1, bottom + pad);
    right = Math.min(width - 1, right + pad);

    const trimW = right - left + 1;
    const trimH = bottom - top + 1;

    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = trimW;
    trimmedCanvas.height = trimH;

    const tctx = trimmedCanvas.getContext("2d");
    tctx.drawImage(canvas, left, top, trimW, trimH, 0, 0, trimW, trimH);

    return trimmedCanvas.toDataURL("image/png");
  };

  const getSignatureDataUrl = () => trimSignatureCanvasToDataURL();

  const clearSignature = () => {
    sigRef.current?.clear();
    setSigError("");
  };

  const previewSignature = () => {
    const dataUrl = getSignatureDataUrl();
    if (!dataUrl) {
      setSigError("Tanda tangan wajib diisi!");
      return;
    }
    window.open(dataUrl, "_blank");
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.item_id) {
      alert("Pilih item dari list dropdown dulu (klik item).");
      return;
    }
    if (!form.tanggal) {
      alert("Tanggal wajib diisi!");
      return;
    }
    if (!form.nominal || Number(form.nominal) <= 0) {
      alert("Nominal wajib diisi!");
      return;
    }
    if (!form.pic) {
      alert("PIC wajib diisi!");
      return;
    }

    const ttdBase64 = getSignatureDataUrl();
    if (!ttdBase64) {
      setSigError("Tanda tangan wajib diisi!");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("item_id", String(form.item_id));
      fd.append("tanggal", form.tanggal);
      fd.append("nominal", String(Number(form.nominal)));
      fd.append("pic", form.pic);

      // ✅ kirim base64 ttd
      fd.append("tanda_tangan_base64", ttdBase64);

      if (form.foto_lama) fd.append("foto_lama", form.foto_lama);

      if (isEdit) {
        fd.append("_method", "PUT");
        await axios.post(`${API_URL}/pergantian-alat/${form.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/pergantian-alat`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Simpan berhasil ✅");
      closeModal();
      fetchPergantian();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors) {
          let msg = "Validasi gagal:\n";
          Object.keys(errors).forEach((k) => {
            msg += `- ${errors[k][0]}\n`;
          });
          alert(msg);
        } else {
          alert(err.response?.data?.message || "Validasi gagal (422)");
        }
      } else {
        alert("Gagal menyimpan data");
      }
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data?")) return;
    try {
      await axios.delete(`${API_URL}/pergantian-alat/${id}`);
      alert("Data berhasil dihapus");
      fetchPergantian();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  };

  // ================= RENDER =================
  return (
    <div style={layout.container}>
      <Sidebar />

      <div style={layout.content}>
        {/* TOP BAR */}
        <div style={layout.topBar}>
          <input
            placeholder="Cari ID / Nama / PIC"
            style={layout.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={layout.btn} onClick={openCreate}>
            + Baru
          </button>
        </div>

        {/* TABLE */}
        <table style={layout.table}>
          <thead>
            <tr>
              <th style={layout.th}>ID</th>
              <th style={layout.th}>SATUAN</th>
              <th style={layout.th}>NAMA BARANG</th>
              <th style={layout.th}>TANGGAL</th>
              <th style={layout.th}>NOMINAL</th>
              <th style={layout.th}>PIC</th>
              <th style={layout.th}>FOTO BARANG LAMA</th>
              <th style={layout.th}>TANDA TANGAN</th>
              <th style={layout.th}>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {rows
              .filter((r) => {
                const term = search.toLowerCase();
                return (
                  String(r.item_kode || r.id).toLowerCase().includes(term) ||
                  String(r.nama_barang).toLowerCase().includes(term) ||
                  String(r.pic).toLowerCase().includes(term)
                );
              })
              .map((r, idx) => (
                <tr key={idx}>
                  <td style={layout.td}>{r.item_kode || r.id}</td>
                  <td style={layout.td}>{r.satuan || "-"}</td>
                  <td style={layout.td}>{r.nama_barang || "-"}</td>
                  <td style={layout.td}>{r.tanggal || "-"}</td>
                  <td style={layout.td}>{r.nominal || "-"}</td>
                  <td style={layout.td}>{r.pic || "-"}</td>

                  <td style={layout.td}>
                    {r.foto_lama_url ? (
                      <a href={r.foto_lama_url} target="_blank" rel="noreferrer">
                        Lihat Foto
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td style={layout.td}>
                    {r.tanda_tangan_url ? (
                      <a
                        href={r.tanda_tangan_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat TTD
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td style={layout.td}>
                    <div style={layout.actionWrap}>
                      <button style={layout.viewBtn} onClick={() => openView(r)}>
                        <FaEye />
                      </button>
                      <button style={layout.editBtn} onClick={() => openEdit(r)}>
                        <FaEdit />
                      </button>
                      <button
                        style={layout.deleteBtn}
                        onClick={() => handleDelete(r.id)}
                      >
                        <FaTrash />
                      </button>
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
            <h3 style={{ marginTop: 0 }}>
              {isEdit ? "Edit Pergantian Alat" : "Tambah Pergantian Alat"}
            </h3>

            {/* ID */}
            <input
              value={isEdit ? form.id : "(auto)"}
              disabled
              style={{ ...layout.input, background: "#eee" }}
            />

            {/* Nama Barang (autocomplete) */}
            <div style={{ position: "relative" }}>
              <input
                placeholder="Nama Barang / Alat (pilih dari list)"
                value={form.nama_barang}
                onChange={(e) => onNamaChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowAuto(false), 150)}
                style={layout.input}
              />

              {showAuto && filteredItems.length > 0 && (
                <div style={layout.autocompleteBox}>
                  {filteredItems.map((it) => (
                    <div
                      key={it.id}
                      style={layout.autocompleteItem}
                      onMouseDown={() => pickItem(it)}
                    >
                      {it.nama}{" "}
                      <span style={{ opacity: 0.6 }}>
                        ({it.kode || "-"} • {it.satuan || "-"})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Satuan */}
            <input
              placeholder="Satuan"
              value={form.satuan}
              disabled
              style={{ ...layout.input, background: "#eee" }}
            />

            {/* Tanggal */}
            <input
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
              style={layout.input}
            />

            {/* Nominal */}
            <input
              name="nominal"
              type="number"
              min={1}
              placeholder="Nominal"
              value={form.nominal}
              onChange={handleChange}
              style={layout.input}
            />

            {/* PIC */}
            <input
              name="pic"
              placeholder="PIC"
              value={form.pic}
              onChange={handleChange}
              style={layout.input}
            />

            {/* Foto lama */}
            <div style={{ marginBottom: "10px" }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePickFoto}
              />
              {previewUrl ? (
                <div style={{ marginTop: "8px" }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>
              ) : null}
            </div>

            {/* TANDA TANGAN (RESPONSIVE) */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Tanda Tangan</div>

              <div
                ref={sigBoxRef}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{
                    width: sigWidth,
                    height: 160,
                    style: { background: "#fff", width: "100%" },
                  }}
                  onBegin={() => setSigError("")}
                />
              </div>

              {sigError ? (
                <div style={{ color: "red", marginTop: 6, fontSize: 13 }}>
                  {sigError}
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  style={{ ...layout.smallBtn, background: "#666" }}
                  onClick={clearSignature}
                >
                  Hapus TTD
                </button>

                <button
                  type="button"
                  style={{ ...layout.smallBtn, background: "#2F1F6B" }}
                  onClick={previewSignature}
                >
                  Preview
                </button>
              </div>

              {/* TTD LAMA (OPSIONAL) */}
              {isEdit && sigPreview ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                    TTD tersimpan sebelumnya:
                  </div>
                  <img
                    src={sigPreview}
                    alt="TTD Lama"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #eee",
                    }}
                  />
                </div>
              ) : null}
            </div>

            {/* tombol */}
            <div style={layout.modalBtnWrap}>
              <button onClick={handleSave} style={layout.saveBtn}>
                Simpan
              </button>
              <button onClick={closeModal} style={layout.cancelBtn}>
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
            <h3 style={{ marginTop: 0 }}>Detail Pergantian Alat</h3>

            <p>
              <b>ID:</b> {detailData.item_kode || detailData.id}
            </p>
            <p>
              <b>Nama Barang:</b> {detailData.nama_barang || "-"}
            </p>
            <p>
              <b>Satuan:</b> {detailData.satuan || "-"}
            </p>
            <p>
              <b>Tanggal:</b> {detailData.tanggal || "-"}
            </p>
            <p>
              <b>Nominal:</b> {detailData.nominal || "-"}
            </p>
            <p>
              <b>PIC:</b> {detailData.pic || "-"}
            </p>

            {detailData.foto_lama_url ? (
              <div style={{ marginTop: 8 }}>
                <b>Foto Barang Lama:</b>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={detailData.foto_lama_url}
                    alt="Foto Barang Lama"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>
              </div>
            ) : (
              <p>
                <b>Foto Barang Lama:</b> -
              </p>
            )}

            {detailData.tanda_tangan_url ? (
              <div style={{ marginTop: 8 }}>
                <b>Tanda Tangan:</b>
                <div style={{ marginTop: 8 }}>
                  <img
                    src={detailData.tanda_tangan_url}
                    alt="Tanda Tangan"
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>
              </div>
            ) : (
              <p>
                <b>Tanda Tangan:</b> -
              </p>
            )}

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

/* ========== STYLE (RESPONSIVE MODAL + SCROLL) ========== */
const layout = {
  container: { display: "flex", height: "100vh" },
  content: { flex: 1, padding: "30px", overflowY: "auto" },

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
    cursor: "pointer",
  },

  smallBtn: {
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    width: "50%",
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

  actionWrap: { display: "flex", justifyContent: "center", gap: "10px" },

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

  // ✅ overlay bisa scroll, modal maxHeight + overflow
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 12px",
    overflowY: "auto",
    zIndex: 1000,
  },

  modal: {
    background: "white",
    padding: "20px",
    width: "min(92vw, 520px)",
    borderRadius: "12px",
    maxHeight: "90vh",
    overflowY: "auto",
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
    gap: "10px",
    marginTop: 8,
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

  autocompleteBox: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 2000,
    maxHeight: "180px",
    overflowY: "auto",
  },

  autocompleteItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
  },
};

export default PergantianAlatKerja;
