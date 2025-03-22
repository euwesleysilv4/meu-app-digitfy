import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export function DefaultLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 