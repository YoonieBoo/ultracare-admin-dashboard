import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "UltraCare Admin Dashboard",
  description: "Platform administration dashboard for UltraCare healthcare monitoring",
  icons: {
    icon: "/logo.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
