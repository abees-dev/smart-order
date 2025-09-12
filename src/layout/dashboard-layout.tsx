import AppSidebar from "@/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const LayoutItem = () => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <>
      <AppSidebar />
      <div className="flex-1">
        <SidebarTrigger />
        <div
          className="px-6"
          style={{
            width:
              isMobile || isCollapsed
                ? "100vw"
                : "calc(100vw - var(--sidebar-width))",
          }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <LayoutItem />
    </SidebarProvider>
  );
};

export default DashboardLayout;
