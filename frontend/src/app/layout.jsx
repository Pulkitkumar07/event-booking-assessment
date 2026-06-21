import { Header } from "@/components/header";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

export const metadata = {
  title: "BookIt",
  description: "Discover and book live events"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
