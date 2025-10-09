import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const LayoutItem = () => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getMainContentWidth = () => {
    if (isMobile) return "100vw";
    if (isCollapsed) return "calc(100vw - var(--sidebar-width-icon))";
    return "calc(100vw - var(--sidebar-width))";
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1">
        <Header />

        <div
          className="md:p-6 p-4"
          style={{
            width: getMainContentWidth(),
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
