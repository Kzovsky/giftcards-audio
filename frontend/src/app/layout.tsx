
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastProvider } from "@/components/ToastProvider";

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
        <ToastProvider />
      </body>
    </html>
  );
}
