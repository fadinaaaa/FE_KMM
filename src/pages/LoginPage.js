import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errorMessage) setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            // ❗ PERBAIKAN: hapus spasi sebelum /api/login
            const response = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Login gagal, periksa username/password."
                );
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            if (data.user?.username) {
                localStorage.setItem("username", data.user.username);
            } else {
                localStorage.setItem("username", formData.username);
            }

            if (data.user?.role) {
                localStorage.setItem("role", data.user.role);
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login Error:", error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* STYLE DIGABUNG DI SINI */}
            <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #f9fafb;
          color: #374151;
        }

        .ttmt-login-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background-color: #f9fafb;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ttmt-login-card {
          width: 100%;
          max-width: 400px;
          background-color: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
        }

        .ttmt-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .ttmt-login-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #2563EB;
          margin-bottom: 0.5rem;
        }

        .ttmt-login-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .ttmt-login-group {
          margin-bottom: 1.5rem;
        }

        .ttmt-login-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .ttmt-login-input-wrapper {
          position: relative;
        }

        .ttmt-login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .ttmt-login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px #dbeafe;
        }

        .ttmt-login-toggle-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
        }

        .ttmt-login-submit-btn {
          width: 100%;
          background-color: #2563EB;
          color: white;
          font-weight: 700;
          padding: 0.875rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
        }

        .ttmt-login-submit-btn:hover {
          background-color: #1d4ed8;
          transform: translateY(-2px);
        }
      `}</style>

            <div className="ttmt-login-container">
                <div className="ttmt-login-card">
                    <div className="ttmt-login-header">
                        <h1 className="ttmt-login-title">PT TTMT</h1>
                        <p className="ttmt-login-subtitle">
                            Please login to your account
                        </p>
                    </div>

                    {errorMessage && (
                        <div
                            style={{
                                backgroundColor: "#ffebee",
                                color: "#c62828",
                                padding: "10px",
                                borderRadius: "4px",
                                marginBottom: "15px",
                                fontSize: "0.9rem",
                                textAlign: "center",
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="ttmt-login-group">
                            <label className="ttmt-login-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="ttmt-login-input"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="ttmt-login-group">
                            <label className="ttmt-login-label">Password</label>
                            <div className="ttmt-login-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="ttmt-login-input"
                                    style={{ paddingRight: "3rem" }}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ttmt-login-toggle-btn"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color="#666" />
                                    ) : (
                                        <Eye size={20} color="#666" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="ttmt-login-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;