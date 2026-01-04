import Footer from "@/components/Footer";
import PanelHeader from "@/components/PanelHeader";

export default function PanelLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-white dark:bg-background min-h-screen transition-colors duration-300">
            <PanelHeader />
            {children}
            <Footer />
        </div>
    );
}