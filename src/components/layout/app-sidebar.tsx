import {
  Calendar,
  Home,
  Settings,
  Users,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();

  // Menu items.
  const items = [
    {
      title: t("navigation.dashboard"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("navigation.orders"),
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: t("navigation.products"),
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: t("navigation.customers"),
      url: "/dashboard/customers",
      icon: Users,
    },
    {
      title: t("navigation.reports"),
      url: "/dashboard/reports",
      icon: Calendar,
    },
    {
      title: t("navigation.settings"),
      url: "/dashboard/settings",
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
export default AppSidebar;
