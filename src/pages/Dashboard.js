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
  BarElement
);

const Dashboard = () => {
  const API_URL = "http://localhost:8000/api";

  const [tahun, setTahun] = useState("2025");

  const [totalItems, setTotalItems] = useState(0);
  const [totalSkylift, setTotalSkylift] = useState(0);
  const [totalKeluarMasuk, setTotalKeluarMasuk] = useState(0);
  const [totalPergantian, setTotalPergantian] = useState(0);
  const [totalPeminjaman, setTotalPeminjaman] = useState(0);

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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
        data: [0, 0, 0, 0, 0],
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

  const [barData, setBarData] = useState({
    labels: [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ],
    datasets: [
      { label: "Barang & Alat", data: Array(12).fill(0), backgroundColor: "#6c5ce7" },
      { label: "Skylift", data: Array(12).fill(0), backgroundColor: "#00b894" },
      { label: "Keluar Masuk", data: Array(12).fill(0), backgroundColor: "#fdcb6e" },
      { label: "Pergantian Alat", data: Array(12).fill(0), backgroundColor: "#0984e3" },
      { label: "Peminjaman", data: Array(12).fill(0), backgroundColor: "#e17055" },
    ],
  });

  useEffect(() => {
    fetchData();
  }, [tahun]);

  const safeMonthYear = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  };

  const fetchData = async () => {
    try {
      const [
        skyliftRes,
        itemsRes,
        keluarRes,
        pergantianRes,
        peminjamanRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/skylifts`, authHeader),
        axios.get(`${API_URL}/items`, authHeader),
        axios.get(`${API_URL}/keluar-masuk`, authHeader),
        axios.get(`${API_URL}/pergantian-alat`, authHeader),
        axios.get(`${API_URL}/peminjaman-barang`, authHeader),
      ]);

      const skylifts = skyliftRes.data?.data || [];
      const items = itemsRes.data?.data || [];
      const keluarMasuk = keluarRes.data?.data || [];
      const pergantian = pergantianRes.data?.data || [];
      const peminjaman = peminjamanRes.data?.data || [];

      // ===== TOTAL CARD =====
      setTotalItems(items.length);
      setTotalSkylift(skylifts.length);
      setTotalKeluarMasuk(keluarMasuk.length);
      setTotalPergantian(pergantian.length);
      setTotalPeminjaman(peminjaman.length);

      // ===== PIE UPDATE =====
      setPieData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [
              items.length,
              skylifts.length,
              keluarMasuk.length,
              pergantian.length,
              peminjaman.length,
            ],
          },
        ],
      }));

      // ===== BULANAN =====
      const monthlyItems = Array(12).fill(0);
      const monthlySkylift = Array(12).fill(0);
      const monthlyKeluar = Array(12).fill(0);
      const monthlyPergantian = Array(12).fill(0);
      const monthlyPeminjaman = Array(12).fill(0);

      const filterByYear = (data, field, targetArray) => {
        data.forEach((item) => {
          const result = safeMonthYear(item[field]);
          if (result && result.year.toString() === tahun) {
            targetArray[result.month]++;
          }
        });
      };

      filterByYear(items, "created_at", monthlyItems);
      filterByYear(skylifts, "created_at", monthlySkylift);
      filterByYear(keluarMasuk, "tanggal", monthlyKeluar);
      filterByYear(pergantian, "tanggal", monthlyPergantian);
      filterByYear(peminjaman, "tanggal", monthlyPeminjaman);

      setBarData({
        labels: barData.labels,
        datasets: [
          { label: "Barang & Alat", data: monthlyItems, backgroundColor: "#6c5ce7" },
          { label: "Skylift", data: monthlySkylift, backgroundColor: "#00b894" },
          { label: "Keluar Masuk", data: monthlyKeluar, backgroundColor: "#fdcb6e" },
          { label: "Pergantian Alat", data: monthlyPergantian, backgroundColor: "#0984e3" },
          { label: "Peminjaman", data: monthlyPeminjaman, backgroundColor: "#e17055" },
        ],
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h2 style={styles.title}>Selamat Datang 👋</h2>

        <div style={styles.cardRow}>
          <Card title="Barang & Alat" value={totalItems} color="#6c5ce7" />
          <Card title="Skylift" value={totalSkylift} color="#00b894" />
          <Card title="Keluar Masuk" value={totalKeluarMasuk} color="#fdcb6e" />
          <Card title="Pergantian Alat" value={totalPergantian} color="#0984e3" />
          <Card title="Peminjaman" value={totalPeminjaman} color="#e17055" />
        </div>

        <div style={styles.chartRow}>
          <div style={styles.chartBox}>
            <h3>Distribusi Data</h3>
            <div style={styles.pieWrapper}>
              <Pie data={pieData} />
            </div>
          </div>

          <div style={styles.chartBox}>
            <div style={{ marginBottom: 10 }}>
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
            <Bar data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <h4>{title}</h4>
    <h1>{value}</h1>
  </div>
);
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