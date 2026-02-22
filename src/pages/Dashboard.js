import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

const Dashboard = () => {
  const API_URL = "http://localhost:8000/api";

  const [bulan, setBulan] = useState("Jan");
  const [tahun, setTahun] = useState("2025");

  const [totalItems, setTotalItems] = useState(0);
  const [totalSkylift, setTotalSkylift] = useState(0);
  const [totalKeluarMasuk, setTotalKeluarMasuk] = useState(0);

  const [pieData, setPieData] = useState({
    labels: [
      "Barang & Alat",
      "Skylift",
      "Keluar Masuk",
      "Pergantian Alat",
      "Peminjaman",
    ],
    datasets: [
      {
        data: [0, 0, 0, 12, 14],
        backgroundColor: [
          "#6c5ce7",
          "#00b894",
          "#fdcb6e",
          "#0984e3",
          "#e17055",
        ],
      },
    ],
  });
  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const [barData, setBarData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Barang & Alat",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#6c5ce7",
      },
      {
        label: "Skylift",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#00b894",
      },
      {
        label: "Keluar Masuk",
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: "#fdcb6e",
      },
      {
        label: "Pergantian Alat",
        data: [5, 7, 6, 9, 4, 8],
        backgroundColor: "#0984e3",
      },
      {
        label: "Peminjaman",
        data: [12, 10, 14, 9, 11, 15],
        backgroundColor: "#e17055",
      },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skyliftRes, itemsRes, keluarRes] = await Promise.all([
        axios.get(`${API_URL}/skylifts`), authHeader,
        axios.get(`${API_URL}/items`),authHeader,
        axios.get(`${API_URL}/keluar-masuk`), authHeader,
      ]);

      const skylifts = skyliftRes.data?.data || skyliftRes.data || [];
      const items = itemsRes.data?.data || itemsRes.data || [];
      const keluarMasuk = keluarRes.data?.data || keluarRes.data || [];

      setTotalItems(items.length);
      setTotalSkylift(skylifts.length);
      setTotalKeluarMasuk(keluarMasuk.length);

      // Update PIE (tanpa ubah tampilan)
      setPieData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [
              items.length,
              skylifts.length,
              keluarMasuk.length,
              prev.datasets[0].data[3],
              prev.datasets[0].data[4],
            ],
          },
        ],
      }));

      // Hitung keluar masuk per bulan (6 bulan pertama saja agar sama)
      const monthly = [0, 0, 0, 0, 0, 0];

      keluarMasuk.forEach((item) => {
        if (item?.tanggal) {
          const date = new Date(item.tanggal);
          const month = date.getMonth();
          if (month >= 0 && month <= 5) {
            monthly[month]++;
          }
        }
      });

      setBarData((prev) => ({
        ...prev,
        datasets: prev.datasets.map((dataset) =>
          dataset.label === "Keluar Masuk"
            ? { ...dataset, data: monthly }
            : dataset,
        ),
      }));
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <h2 style={styles.title}>Selamat Datang 👋</h2>

        {/* ===== CARD SUMMARY ===== */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, borderTop: "4px solid #6c5ce7" }}>
            <h4>Barang & Alat</h4>
            <h1>{totalItems}</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #00b894" }}>
            <h4>Skylift</h4>
            <h1>{totalSkylift}</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #fdcb6e" }}>
            <h4>Keluar Masuk</h4>
            <h1>{totalKeluarMasuk}</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #0984e3" }}>
            <h4>Pergantian Alat</h4>
            <h1>8</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #e17055" }}>
            <h4>Peminjaman</h4>
            <h1>15</h1>
          </div>
        </div>

        {/* ===== GRAFIK AREA ===== */}
        <div style={styles.chartRow}>
          <div style={styles.chartBox}>
            <h3>Distribusi Data</h3>
            <div style={styles.pieWrapper}>
              <Pie data={pieData} />
            </div>
          </div>

          <div style={styles.chartBox}>
            <div style={styles.chartHeader}>
              <h3>Aktivitas Bulanan</h3>

              <div style={styles.filterWrap}>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  style={styles.select}
                >
                  <option>Jan</option>
                  <option>Feb</option>
                  <option>Mar</option>
                  <option>Apr</option>
                  <option>Mei</option>
                  <option>Jun</option>
                  <option>Jul</option>
                  <option>Agu</option>
                  <option>Sep</option>
                  <option>Okt</option>
                  <option>Nov</option>
                  <option>Des</option>
                </select>

                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  style={styles.select}
                >
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
            </div>

            <Bar data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= STYLE ================= */
/* CSS KAMU TIDAK DIUBAH SAMA SEKALI */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f5f6fa",
  },
  main: {
    flex: 1,
    padding: "25px",
    overflowY: "auto",
  },
  title: {
    fontSize: "26px",
    marginBottom: "20px",
    color: "#2F1F6B",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    background: "white",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 8px 15px rgba(0,0,0,0.08)",
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  chartBox: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 15px rgba(0,0,0,0.08)",
  },
  pieWrapper: {
    width: "100%",
    maxWidth: "300px",
    height: "300px",
    margin: "0 auto",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  filterWrap: {
    display: "flex",
    gap: "10px",
  },
  select: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
};

export default Dashboard;
