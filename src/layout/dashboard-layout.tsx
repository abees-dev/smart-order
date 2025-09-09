import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1">
        <SidebarTrigger />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
