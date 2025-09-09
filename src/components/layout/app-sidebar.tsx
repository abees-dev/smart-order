import {
  Calendar,
  Home,
  Settings,
  Users,
  Package,
  ShoppingCart,
  Archive,
  Building2,
  Warehouse,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ROUTES, isActiveRoute, isSuppliesActive } from "@/constants/routes";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [suppliesOpen, setSuppliesOpen] = useState(false);

  // Auto-open supplies menu if we're on a supplies route
  useEffect(() => {
    if (isSuppliesActive(location.pathname)) {
      setSuppliesOpen(true);
    }
  }, [location.pathname]);

  // Regular menu items (without submenu)
  const simpleItems = [
    {
      title: t("navigation.dashboard"),
      url: ROUTES.DASHBOARD.ROOT,
      icon: Home,
    },
    {
      title: t("navigation.orders"),
      url: ROUTES.DASHBOARD.ORDERS,
      icon: ShoppingCart,
    },
    {
      title: t("navigation.products"),
      url: ROUTES.DASHBOARD.PRODUCTS,
      icon: Package,
    },
    {
      title: t("navigation.customers"),
      url: ROUTES.DASHBOARD.CUSTOMERS,
      icon: Users,
    },
    {
      title: t("navigation.suppliers"),
      url: ROUTES.DASHBOARD.SUPPLIERS,
      icon: Building2,
    },
  ];

  // Supplies submenu items
  const suppliesSubItems = [
    {
      title: t("navigation.inventory"),
      url: ROUTES.DASHBOARD.SUPPLIES.INVENTORY,
      icon: Warehouse,
    },
    {
      title: t("navigation.imports"),
      url: ROUTES.DASHBOARD.SUPPLIES.IMPORTS,
      icon: FileText,
    },
  ];

  // Other menu items
  const otherItems = [
    {
      title: t("navigation.reports"),
      url: ROUTES.DASHBOARD.REPORTS,
      icon: Calendar,
    },
    {
      title: t("navigation.settings"),
      url: ROUTES.DASHBOARD.SETTINGS,
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("app.title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Simple menu items */}
              {simpleItems.map((item) => {
                const isActive = isActiveRoute(location.pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Supplies menu item with submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSuppliesOpen(!suppliesOpen)}
                >
                  <Archive />
                  <span>{t("navigation.supplies")}</span>
                  <ChevronRight
                    className={`ml-auto transition-transform ${
                      suppliesOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
                {suppliesOpen && (
                  <SidebarMenuSub>
                    {suppliesSubItems.map((subItem) => {
                      const isActive = isActiveRoute(
                        location.pathname,
                        subItem.url
                      );
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link to={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Other menu items */}
              {otherItems.map((item) => {
                const isActive = isActiveRoute(location.pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
export default AppSidebar;
