import React from "react";
import TopNav from "@/components/dashboard/TopNav";
import Sidebar from "@/components/dashboard/sidebar";

export const metadata = {
    title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-dvh overflow-hidden bg-[#020816] text-white p-3">

            {/* TOP NAV */}
            <div className="h-15">
                <TopNav />
            </div>

            {/* BODY */}
            <div className="h-[calc(100dvh-74px)] flex gap-3 py-3">

                {/* SIDEBAR */}
                <aside className="w-fit h-full rounded-lg border border-white/10 bg-background-surface">
                    <Sidebar />
                </aside>

                {/* MAIN */}
                <main className="flex-1 h-full overflow-y-auto rounded-lg border border-white/10 bg-background-surface p-3">
                    {children}
                </main>

            </div>
        </div>
    );
}