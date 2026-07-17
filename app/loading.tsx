export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #ede9ff",
          borderTopColor: "#5b50e8",
          animation: "gleam-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes gleam-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
