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
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  BarChart3, 
  User, 
  Database, 
  Settings,
  HelpCircle,
  Activity,
  PieChart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  {
    title: "Дашборд",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Конструктор графиков",
    url: "/charts",
    icon: BarChart3,
  },
  {
    title: "Таблицы данных",
    url: "/tables",
    icon: TableIcon,
  },
  {
    title: "Личный кабинет",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar-background">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-4 flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold block leading-tight">Ваш анализатор данных</span>
            </div>
          </div>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-tighter">Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`transition-all duration-200 group ${location.pathname === item.url ? 'bg-primary/5 text-primary' : 'hover:bg-primary/5'}`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${location.pathname === item.url ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{item.title}</span>
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
