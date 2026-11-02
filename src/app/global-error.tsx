"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 300,
          background: "#ffffff",
          color: "#102322",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 72, margin: 0, color: "#158ab0" }}>500</p>
          <h1 style={{ fontWeight: 300, fontSize: 26 }}>Aplikasi mengalami gangguan</h1>
          <p style={{ color: "#5d7775" }}>Muat ulang halaman untuk mencoba lagi.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "10px 22px",
              borderRadius: 999,
              border: 0,
              background: "#158ab0",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
