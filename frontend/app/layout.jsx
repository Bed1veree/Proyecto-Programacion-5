import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "BiblioUni - Biblioteca universitaria",
  description: "Catálogo y solicitudes de préstamo de BiblioUni",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header>
          <nav>
            <Link href="/" className="logo">
              BiblioUni
            </Link>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; 2026 BiblioUni · Fabian Zuñiga y Felipe Rivas</p>
        </footer>
      </body>
    </html>
  );
}
