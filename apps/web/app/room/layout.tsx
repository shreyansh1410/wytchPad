import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { ReactNode } from "react";

export default function RoomLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
