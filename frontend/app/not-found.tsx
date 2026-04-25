import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-2" style={{ color: "#1A2730" }}>404</h1>
      <p className="mb-6" style={{ color: "#637280" }}>Page not found</p>
      <Link
        href="/"
        className="text-sm font-medium py-2 px-4 rounded-lg transition-opacity hover:opacity-80"
        style={{ color: "#1E7B7B", border: "1px solid #1E7B7B50", backgroundColor: "#E6F4F4" }}
      >
        Back to home
      </Link>
    </main>
  );
}
