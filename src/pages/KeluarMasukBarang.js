import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";

const KeluarMasukBarang = () => {
  const [data, setData] = useState([]);
  const API_URL = "http://localhost:8000/api";
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [saldoAktif, setSaldoAktif] = useState(0);
  const [items, setItems] = useState([]);

  const [showAuto, setShowAuto] = useState(false);
  const [filteredBarang, setFilteredBarang] = useState([]);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    item_id: "",
    nama: "",
    satuan: "",
    keluarmasuk: "",
    tanggal: "",
    nominal: "",
    PIC: "",
    keterangan: "",
  });
 const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`, authHeader);
      console.log("ITEMS API:", res.data);
      setItems(res.data.data || res.data);
    } catch (error) {
      console.error("Gagal load items", error);
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
    fetchItems();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/keluar-masuk`, authHeader);
      const raw = res.data.data;

      // 🔢 HITUNG SALDO PER ITEM
      const saldoMap = {};
      raw.forEach((r) => {
        if (!saldoMap[r.item_id]) saldoMap[r.item_id] = 0;

        if (r.keluarmasuk === "masuk") {
          saldoMap[r.item_id] += Number(r.nominal);
        }

        if (r.keluarmasuk === "keluar") {
          saldoMap[r.item_id] -= Number(r.nominal);
        }
      });

      const normalized = raw.map((item) => ({
        id: item.id,
        item_id: item.item_id,
        nama: item.nama,
        satuan: item.satuan,
        keluarmasuk: item.keluarmasuk,
        tanggal: item.tanggal,
        nominal: item.nominal,
        PIC: item.PIC,
        keterangan: item.keterangan,
        saldo: saldoMap[item.item_id] || 0, // ✅ INI KUNCINYA
      }));

      setData(normalized);

      console.log("SALDO MAP:", saldoMap);
    } catch (error) {
      console.error(error);
      alert("Gagal load data");
    }
  };

  // ================= FORM =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      return updatedForm;
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    // ✅ VALIDASI SESUAI FORM KELUAR MASUK
    if (!form.nama) {
      alert("Barang / alat wajib dipilih!");
      return;
    }

    if (!form.keluarmasuk) {
      alert("Pilih keluar atau masuk!");
      return;
    }

    if (!form.tanggal) {
      alert("Tanggal wajib diisi!");
      return;
    }

    if (!form.nominal || Number(form.nominal) <= 0) {
      alert("Nominal harus diisi!");
      return;
    }

    if (!form.PIC) {
      alert("Nominal harus diisi!");
      return;
    }

    const transaksiItem = data.filter(
      (d) => Number(d.item_id) === Number(form.item_id),
    );

    let saldoCheck = 0;

    transaksiItem.forEach((t) => {
      if (t.keluarmasuk === "masuk") {
        saldoCheck += Number(t.nominal);
      }

      if (t.keluarmasuk === "keluar") {
        saldoCheck -= Number(t.nominal);
      }
    });

    // Kalau sedang edit → keluarkan transaksi lama
    if (isEdit) {
      const original = data.find((d) => Number(d.id) === Number(form.id));

      if (original) {
        if (original.keluarmasuk === "masuk") {
          saldoCheck -= Number(original.nominal);
        }

        if (original.keluarmasuk === "keluar") {
          saldoCheck += Number(original.nominal);
        }
      }
    }

    try {
      const payload = {
        item_id: form.item_id,
        nama: form.nama,
        satuan: form.satuan,
        keluarmasuk: form.keluarmasuk,
        tanggal: form.tanggal,
        nominal: Number(form.nominal),
        PIC: form.PIC,
        keterangan: form.keterangan,
      };

      if (isEdit) {
        await axios.put(
          `${API_URL}/keluar-masuk/${form.id}`,
          payload,
          authHeader,
        );
      } else {
        await axios.post(`${API_URL}/keluar-masuk`, payload, authHeader);
      }

      alert("Simpan berhasil ✅");
      fetchData();
      setShowModal(false);
      setIsEdit(false);
      setSaldoAktif(0);

      setForm({
        item_id: "",
        nama: "",
        satuan: "",
        keluarmasuk: "",
        tanggal: "",
        nominal: "",
        PIC: "",
        keterangan: "",
      });
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data");
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

    const saldo = data
      .filter((d) => String(d.item_id) === String(item.item_id))
      .reduce((acc, d) => {
        if (d.keluarmasuk === "masuk") return acc + Number(d.nominal);
        if (d.keluarmasuk === "keluar") return acc - Number(d.nominal);
        return acc;
      }, 0);

    setSaldoAktif(saldo);

    setForm({
      id: item.id,
      item_id: item.item_id,
      nama: item.nama,
      satuan: item.satuan,
      keluarmasuk: item.keluarmasuk || "",
      tanggal: item.tanggal || "",
      nominal: item.nominal || "",
      PIC: item.PIC || "",
      keterangan: item.keterangan || "",
    });

    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data?")) return;

    try {
      await axios.delete(`${API_URL}/keluar-masuk/${id}`, authHeader);

      alert("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error.response?.data);
      alert("Gagal menghapus data");
    }
  };

  // ================= EXPORT =================
const handleExport = async () => {
  try {
    const res = await axios.get(`${API_URL}/keluar-masuk-barang/export`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // buat link download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "keluar_masuk_barang.xlsx");
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
      await axios.post(
        `${API_URL}/keluar-masuk-barang/import`,
        formData,
        authHeader,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
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
    window.open(
      `${API_URL}/keluar-masuk-barang/template`,
      "_blank",
      authHeader,
    );
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
          {/* EXPORT */}
          <button style={layout.btn} onClick={handleExport}>
            Export
          </button>

          {/* IMPORT */}
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

          {/* TAMBAH */}
          {isAdmin && (
            <button
              style={layout.btn}
              onClick={() => {
                setShowModal(true);
                setIsEdit(false);
                setForm({
                  item_id: "",
                  nama: "",
                  satuan: "",
                  keluarmasuk: "",
                  tanggal: "",
                  nominal: "",
                  PIC: "",
                  keterangan: "",
                });
              }}
            >
              + Baru
            </button>
          )}

          {/* FILE INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
        </div>
      </div>

        {/* TABLE */}
        <table style={layout.table}>
          <thead>
            <tr>
              <th style={layout.th}>ID</th>
              <th style={layout.th}>NAMA</th>
              <th style={layout.th}>SATUAN</th>
              <th style={layout.th}>KELUAR / MASUK</th>
              <th style={layout.th}>TANGGAL</th>
              <th style={layout.th}>NOMINAL</th>
              <th style={layout.th}>PIC</th>
              <th style={layout.th}>KETERANGAN BARANG</th>
              <th style={layout.th}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((item) => {
                const id = item.id ? String(item.id).toLowerCase() : "";
                const nama = item.nama ? String(item.nama).toLowerCase() : "";
                const term = search.toLowerCase();
                return id.includes(term) || nama.includes(term);
              })
              .map((item, index) => (
                <tr key={index}>
                  <td style={layout.td}>{item.item_id}</td>
                  <td style={layout.td}>{item.nama}</td>
                  <td style={layout.td}>{item.satuan}</td>

                  {/* KELUAR / MASUK */}
                  <td style={layout.td}>{item.keluarmasuk || "-"}</td>

                  {/* TANGGAL */}
                  <td style={layout.td}>{item.tanggal || "-"}</td>

                  {/* NOMINAL */}
                  <td style={layout.td}>{item.nominal || "-"}</td>

                  <td style={layout.td}>{item.PIC || "-"}</td>

                  {/* KETERANGAN */}
                  <td style={layout.td}>{item.keterangan || "-"}</td>

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

            <input
              value={form.item_id}
              disabled
              style={{ ...layout.input, background: "#eee" }}
            />

            <div style={{ position: "relative" }}>
              <input
                name="nama"
                placeholder="Nama Barang / Alat"
                value={form.nama}
                onChange={(e) => {
                  handleChange(e);

                  const value = e.target.value;

                  if (value.length >= 1) {
                    const filtered =
                      items?.filter((item) =>
                        item.nama.toLowerCase().includes(value.toLowerCase()),
                      ) || [];

                    setFilteredBarang(filtered);
                    setShowAuto(true);
                  } else {
                    setShowAuto(false);
                  }
                }}
                onBlur={() => {
                  // delay supaya klik masih kebaca
                  setTimeout(() => setShowAuto(false), 150);
                }}
                style={layout.input}
              />

              {/* AUTOCOMPLETE DROPDOWN */}
              {showAuto && filteredBarang.length > 0 && (
                <div style={layout.autocompleteBox}>
                  {filteredBarang.map((item) => (
                    <div
                      key={item.id}
                      style={layout.autocompleteItem}
                      onMouseDown={() => {
                        const lastItem = data
                          .filter((d) => String(d.item_id) === String(item.id))
                          .pop();

                        const saldo = lastItem ? lastItem.saldo : 0;

                        setForm({
                          ...form,
                          item_id: item.id,
                          nama: item.nama,
                          satuan: item.satuan,
                        });

                        setSaldoAktif(saldo);
                        setShowAuto(false);
                      }}
                    >
                      {item.nama}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              name="satuan"
              placeholder="Satuan"
              value={form.satuan}
              disabled
              style={{ ...layout.input, background: "#eee" }}
            />

            <select
              name="keluarmasuk"
              value={form.keluarmasuk}
              onChange={handleChange}
              style={layout.input}
            >
              <option value="">Keluar / Masuk</option>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
            </select>

            <input
              name="tanggal"
              type="date"
              value={form.tanggal}
              onChange={handleChange}
              style={layout.input}
            />

            <input
              name="nominal"
              type="number"
              placeholder={
                form.keluarmasuk === "keluar"
                  ? `nominal (Max ${saldoAktif})`
                  : "nominal"
              }
              value={form.nominal}
              min={1}
              onChange={(e) => {
                let value = Number(e.target.value);

                // selalu update dulu supaya user bisa ketik bebas
                setForm((prev) => ({ ...prev, nominal: value }));

                // validasi hanya jika:
                // - item sudah dipilih
                // - mode keluar
                if (!form.item_id || form.keluarmasuk !== "keluar") return;

                const transaksiItem = data.filter(
                  (d) => Number(d.item_id) === Number(form.item_id),
                );

                let saldoRealtime = 0;

                transaksiItem.forEach((t) => {
                  if (t.keluarmasuk === "masuk")
                    saldoRealtime += Number(t.nominal);

                  if (t.keluarmasuk === "keluar")
                    saldoRealtime -= Number(t.nominal);
                });

                // if (value > saldoRealtime) {
                //   alert(
                //     `Nominal tidak boleh lebih dari saldo (${saldoRealtime})`,
                //   );
                // }

                setForm({ ...form, nominal: value });
              }}
              style={layout.input}
            />
            <input
              name="PIC"
              placeholder="Masukkan Nama PIC"
              value={form.PIC}
              onChange={handleChange}
              style={layout.input}
            />

            <input
              name="keterangan"
              placeholder="Keterangan Barang"
              value={form.keterangan}
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
              <b>Keluar / Masuk:</b> {detailData.keluarmasuk || "-"}
            </p>
            <p>
              <b>Tanggal:</b> {detailData.tanggal || "-"}
            </p>
            <p>
              <b>Nominal:</b> {detailData.nominal || "-"}
            </p>
            <p>
              <b>PIC:</b> {detailData.PIC || "-"}
            </p>
            <p>
              <b>Keterangan Barang:</b> {detailData.keterangan || "-"}
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

export default KeluarMasukBarang;
