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
  LogOut,
  User,
  Wallet2,
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
import { useAuthActions } from "@/modules/auth/hooks/use-auth-actions";

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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasResource } from "@/utils/permission";
import { Resources } from "@/constants";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { handleLogout, user } = useAuthActions();
  const { state } = useSidebar();
  const [suppliesOpen, setSuppliesOpen] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);

  const isCollapsed = state === "collapsed";

  // Unified menu items structure
  const menuItems = [
    {
      title: t("navigation.customers"),
      url: ROUTES.DASHBOARD.CUSTOMERS,
      icon: Users,
      type: "simple" as const,
      view: hasResource(Resources.CUSTOMERS, user?.permissions || {}),
    },
    {
      title: t("navigation.suppliers"),
      url: ROUTES.DASHBOARD.SUPPLIERS,
      icon: Building2,
      type: "simple" as const,
      view: hasResource(Resources.SUPPLIERS, user?.permissions || {}),
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
      view: hasResource(Resources.SUPPLIES, user?.permissions || {}),
    },
    {
      title: t("navigation.products"),
      url: ROUTES.DASHBOARD.PRODUCTS,
      icon: Package,
      type: "simple" as const,
      view: hasResource(Resources.PRODUCTS, user?.permissions || {}),
    },
    {
      title: t("navigation.orders"),
      url: ROUTES.DASHBOARD.ORDERS,
      icon: ShoppingCart,
      view: hasResource(Resources.ORDERS, user?.permissions || {}),
      type: "simple" as const,
    },
    {
      title: t("navigation.debts"),
      url: ROUTES.DASHBOARD.DEBTS,
      icon: Wallet2,
      view: hasResource(Resources.DEBTS, user?.permissions || {}),
      type: "simple" as const,
    },
    {
      title: "Hóa đơn",
      icon: Receipt,
      type: "submenu" as const,
      isOpen: invoicesOpen,
      setOpen: setInvoicesOpen,
      isActiveChecker: isInvoicesActive,
      view: hasResource(Resources.INVOICES, user?.permissions || {}),
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
      view: hasResource(Resources.REPORTS, user?.permissions || {}),
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center border-b p-4 flex-col">
          <img
            src="/icon.png"
            alt="Logo"
            className="h-10 w-10 rounded overflow-hidden"
          />

          <div className="text-lg font-bold p-4 group-data-[collapsible=icon]:hidden">
            {t("app.title")}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => item.view)
                .map((item) => {
                  if (item.type === "simple") {
                    const isActive = isActiveRoute(
                      location.pathname,
                      item.url!
                    );
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link to={item.url!}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  } else if (item.type === "submenu") {
                    // When collapsed, show submenu items as dropdown on hover
                    if (isCollapsed) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                <item.icon />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              className="w-48"
                            >
                              {item.subItems!.map((subItem) => {
                                return (
                                  <DropdownMenuItem key={subItem.title} asChild>
                                    <Link
                                      to={subItem.url}
                                      className="flex items-center gap-2 w-full"
                                    >
                                      <subItem.icon className="h-4 w-4" />
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuItem>
                      );
                    }

                    // When expanded, show normal submenu
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => item.setOpen(!item.isOpen)}
                          tooltip={item.title}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight
                            className={`ml-auto transition-transform ${
                              item.isOpen ? "rotate-90" : ""
                            } group-data-[collapsible=icon]:hidden`}
                          />
                        </SidebarMenuButton>
                        {item.isOpen && (
                          <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
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
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 p-2 text-sm group-data-[collapsible=icon]:justify-center">
                  <User className="h-4 w-4" />
                  <div className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                    <div className="font-medium truncate">
                      {user?.firstName} {user?.lastName}
                    </div>
                    {user?.email && (
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                  tooltip={t("auth.signOut")}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("auth.signOut")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="text-center group-data-[collapsible=icon]:hidden">
                {`Version ${__APP_VERSION__}`}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
export default AppSidebar;
