import "./globals.css";

export const metadata = {
  title: "The Enlightenment Chamber",
  description:
    "Two AI instances investigate what enlightenment is and how to achieve it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
