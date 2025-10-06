import {
  Calendar,
  Users,
  Package,
  ShoppingCart,
  Archive,
  Building2,
  Warehouse,
  FileText,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ROUTES,
  isActiveRoute,
  isSuppliesActive,
  isInvoicesActive,
} from "@/constants/routes";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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
  const [invoicesOpen, setInvoicesOpen] = useState(false);

  // Unified menu items structure
  const menuItems = [
    {
      title: t("navigation.customers"),
      url: ROUTES.DASHBOARD.CUSTOMERS,
      icon: Users,
      type: "simple" as const,
    },
    {
      title: t("navigation.suppliers"),
      url: ROUTES.DASHBOARD.SUPPLIERS,
      icon: Building2,
      type: "simple" as const,
    },
    {
      title: t("navigation.supplies"),
      icon: Archive,
      type: "submenu" as const,
      isOpen: suppliesOpen,
      setOpen: setSuppliesOpen,
      isActiveChecker: isSuppliesActive,
      subItems: [
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
      ],
    },
    {
      title: t("navigation.products"),
      url: ROUTES.DASHBOARD.PRODUCTS,
      icon: Package,
      type: "simple" as const,
    },
    {
      title: t("navigation.orders"),
      url: ROUTES.DASHBOARD.ORDERS,
      icon: ShoppingCart,
      type: "simple" as const,
    },
    {
      title: "Hóa đơn",
      icon: Receipt,
      type: "submenu" as const,
      isOpen: invoicesOpen,
      setOpen: setInvoicesOpen,
      isActiveChecker: isInvoicesActive,
      subItems: [
        {
          title: "Hóa đơn đầu vào",
          url: ROUTES.DASHBOARD.INVOICES.INPUT,
          icon: Archive,
        },
        {
          title: "Hóa đơn đầu ra",
          url: ROUTES.DASHBOARD.INVOICES.OUTPUT,
          icon: Receipt,
        },
      ],
    },
    {
      title: t("navigation.reports"),
      url: ROUTES.DASHBOARD.REPORTS,
      icon: Calendar,
      type: "simple" as const,
    },
  ];

  // Auto-open submenus if we're on related routes
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.type === "submenu" && item.isActiveChecker) {
        if (item.isActiveChecker(location.pathname)) {
          item.setOpen(true);
        }
      }
    });
  }, [location.pathname]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center border-b p-4 flex-col">
          <img
            src="/icon.png"
            alt="Logo"
            className="h-10 w-10 rounded overflow-hidden"
          />

          <div className="text-lg font-bold p-4">{t("app.title")}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.type === "simple") {
                  const isActive = isActiveRoute(location.pathname, item.url!);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url!}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                } else if (item.type === "submenu") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => item.setOpen(!item.isOpen)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight
                          className={`ml-auto transition-transform ${
                            item.isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                      {item.isOpen && (
                        <SidebarMenuSub>
                          {item.subItems!.map((subItem) => {
                            const isActive = isActiveRoute(
                              location.pathname,
                              subItem.url
                            );
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive}
                                >
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
                  );
                }
                return null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
export default AppSidebar;
