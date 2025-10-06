import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "GiftCards Áudio",
  description: "Cartões de presente com mensagem em áudio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        

        <main>{children}</main>
              </body>
    </html>
  );
}
