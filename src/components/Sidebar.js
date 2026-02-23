import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { name: "DASHBOARD", path: "/dashboard" },
    { name: "BARANG DAN ALAT", path: "/barang" },
    { name: "SKYLIFT", path: "/skylift" },
    { name: "KELUAR MASUK BARANG", path: "/keluarmasuk" },
    { name: "PERGANTIAN ALAT KERJA", path: "/pergantian" },
    { name: "PEMINJAMAN BARANG", path: "/peminjaman" },
    { name: "LOGOUT", isLogout: true },
  ];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // hapus token
      localStorage.removeItem("token");

      // redirect login
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* ===== TOP AREA ===== */}
      <div>
        {/* LOGO */}
        <div style={styles.logoBox}>
          <img src={LogoImg} alt="Logo TTMT" style={styles.logoImg} />
          <h3 style={styles.logoText}>TTMT</h3>
        </div>

        {/* MENU */}
        <ul style={styles.menu}>
  {menuItems.map((item, index) => {
    const isActive = location.pathname === item.path;
    const isHover = hovered === index;

    if (item.isLogout) {
      return (
        <li
          key={index}
          style={logoutMenuStyle}
          onClick={handleLogout}
        >
          <span
            style={{
              ...styles.link,
              color: "#ff4d4f",
              cursor: "pointer",
            }}
          >
            {item.name}
          </span>
        </li>
      );
    }

    return (
      <li
        key={index}
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        style={menuStyle(isActive || isHover)}
      >
        <Link to={item.path} style={styles.link}>
          {item.name}
        </Link>
      </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

/* ================= STYLE ================= */

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "#2F1F6B",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
  },

  logoBox: {
    textAlign: "center",
    marginBottom: "30px",
  },

  logoImg: {
    width: "80px",
    marginBottom: "10px",
  },

  logoText: {
    margin: 0,
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  link: {
    color: "inherit",
    textDecoration: "none",
    display: "block",
    width: "100%",
  },

  logout: {
    cursor: "pointer",
    padding: "12px",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.2)",
  },
};

/* ===== ACTIVE + HOVER STYLE ===== */
const menuStyle = (active) => ({
  padding: "12px 15px",
  borderRadius: "8px",
  marginBottom: "6px",
  cursor: "pointer",
  backgroundColor: active ? "#1a3a6e" : "transparent",
  color: active ? "#ffffff" : "white",
  transition: "0.2s ease",
});

const logoutMenuStyle = {
  padding: "12px 15px",
  borderRadius: "8px",
  marginTop: "40px", // JARAK BESAR dari menu atas
  cursor: "pointer",
  backgroundColor: "transparent",
  transition: "0.2s ease",
};

export default Sidebar;
