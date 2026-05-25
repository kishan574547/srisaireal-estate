function Navbar() {
  return (
    <nav
      style={{
        background: "black",
        color: "white",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2>Sri Sai Real Estate</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <a href="/" style={{ color: "white" }}>
          Home
        </a>

        <a href="/admin" style={{ color: "white" }}>
          Admin
        </a>
      </div>
    </nav>
  );
}

export default Navbar;