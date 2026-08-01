import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginAdmin } from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginAdmin(formData);
      if (response.data && response.data.token) {
        localStorage.setItem("srisai_token", response.data.token);
        navigate("/admin");
      } else {
        setError(response.data?.message || "Invalid Email or Password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#0D1B2A,#243B55)",
        padding: "20px",
      }}
    >

      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "400px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            fontFamily:
              "'Playfair Display', serif",
            marginBottom: "10px",
            color: "#0D1B2A",
          }}
        >
          Sri Sai Real Estate
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#C9A84C",
            marginBottom: "30px",
          }}
        >
          Admin Login
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />

          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "#d4b86a" : "#C9A84C",
              color: "#0D1B2A",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}