import { SessionProvider } from 'next-auth/react';
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
            <Footer />
        </SessionProvider>
    );
}