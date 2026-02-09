import React, { useState } from "react";
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
  const [bulan, setBulan] = useState("Jan");
  const [tahun, setTahun] = useState("2025");
  /* ===== PIE DATA ===== */
  const pieData = {
    labels: ["Barang & Alat", "Skylift", "Keluar Masuk", "Pergantian Alat", "Peminjaman"],
    datasets: [
      {
        data: [50, 25, 25, 12, 14],
        backgroundColor: ["#6c5ce7", "#00b894", "#fdcb6e", "#0984e3", "#e17055"],
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  /* ===== BAR DATA ===== */
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Barang & Alat",
        data: [10, 15, 8, 20, 12, 18],
        backgroundColor: "#6c5ce7",
      },
      {
        label: "Skylift",
        data: [10, 15, 8, 20, 12, 18],
        backgroundColor: "#00b894",
      },
      {
        label: "Keluar Masuk",
        data: [10, 15, 8, 20, 12, 18],
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
            <h1>120</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #00b894" }}>
            <h4>Skylift</h4>
            <h1>12</h1>
          </div>

          <div style={{ ...styles.card, borderTop: "4px solid #fdcb6e" }}>
            <h4>Keluar Masuk</h4>
            <h1>45</h1>
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
          {/* PIE */}
          <div style={styles.chartBox}>
            <h3>Distribusi Data</h3>
            <div style={styles.pieWrapper}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          {/* BAR */}
          <div style={styles.chartBox}>
            <div style={styles.chartHeader}>
              <h3>Aktivitas Bulanan</h3>

              <div style={styles.filterWrap}>
                <select value={bulan} onChange={(e) => setBulan(e.target.value)} style={styles.select}>
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

                <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={styles.select}>
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