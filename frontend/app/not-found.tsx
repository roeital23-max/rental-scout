import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-[#e2e8f0] mb-2">404</h1>
      <p className="text-[#8899AA] mb-6">Page not found</p>
      <Link
        href="/"
        className="text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        style={{ color: "#00E5A0", border: "1px solid #00E5A0" }}
      >
        Back to home
      </Link>
    </main>
  );
}
