import { Link, useRouterState } from "@tanstack/react-router";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFinance } from "@/store/finance-store";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  Receipt,
  Percent,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Coins,
  ListTodo,
  Sparkles,
  Settings,
  Lock,
} from "lucide-react";
import * as React from "react";

interface SidebarItem {
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LockedSidebarItem extends SidebarItem {
  phase: string;
}

const primary: SidebarItem[] = [{ title: "Dashboard", to: "/", icon: LayoutDashboard }];

const hub: SidebarItem[] = [
  { title: "Overview", to: "/hub", icon: Wallet },
  { title: "Income", to: "/hub/income", icon: ArrowUpRight },
  { title: "Bills", to: "/hub/bills", icon: Receipt },
  { title: "Debts", to: "/hub/debts", icon: Percent },
  { title: "Credit Lines", to: "/hub/credit", icon: CreditCard },
  { title: "Savings", to: "/hub/savings", icon: PiggyBank },
  { title: "Investments", to: "/hub/investments", icon: TrendingUp },
  { title: "Assets", to: "/hub/assets", icon: Coins },
];

const planning: SidebarItem[] = [
  { title: "Monthly Planner", to: "/planner", icon: ListTodo },
  { title: "Forecast Engine", to: "/forecast", icon: Sparkles },
];

const locked: LockedSidebarItem[] = [
  { title: "Debt Strategy", to: "/debt-strategy", phase: "Phase 4", icon: Lock },
  { title: "Goal Planner", to: "/goals", phase: "Phase 5", icon: Lock },
  { title: "Analytics", to: "/analytics", phase: "Phase 6", icon: Lock },
  { title: "Reports", to: "/reports", phase: "Phase 7", icon: Lock },
  { title: "AI Advisor", to: "/advisor", phase: "Phase 8", icon: Lock },
  { title: "History", to: "/history", phase: "Phase 9", icon: Lock },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname === p);
  const { settings } = useFinance();

  const initials = settings.profileName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon;
    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={isActive(item.to)}>
          <Link
            to={item.to}
            className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900"
          >
            <Icon className="size-4 shrink-0 text-neutral-400 group-hover:text-neutral-900 group-data-[active=true]:text-neutral-900" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-950/5 bg-neutral-50">
      <SidebarContent className="p-4">
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)}>
                      <Link
                        to={item.to}
                        className="flex items-center gap-3 text-sm font-medium text-neutral-900 data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900"
                      >
                        <Icon className="size-4 shrink-0 text-[--color-accent]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financial Hub */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Financial Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{hub.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Planning */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{planning.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Coming Soon / Locked */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Coming Soon
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {locked.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild disabled>
                      <span className="flex items-center justify-between w-full gap-3 text-sm text-neutral-400 cursor-not-allowed">
                        <span className="flex items-center gap-3">
                          <Icon className="size-4 shrink-0 text-neutral-300" />
                          <span>{item.title}</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-neutral-300 bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                          {item.phase}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItem({ title: "Settings", to: "/settings", icon: Settings })}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info Foot */}
        <div className="mt-auto border-t border-neutral-950/5 pt-4">
          <Link to="/settings" className="flex items-center gap-3 px-3 hover:opacity-80">
            <Avatar className="size-8">
              {settings.avatarUrl && (
                <AvatarImage src={settings.avatarUrl} alt={settings.profileName} />
              )}
              <AvatarFallback className="bg-neutral-200 text-xs text-neutral-600 outline outline-1 -outline-offset-1 outline-black/5">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium text-neutral-900">{settings.profileName}</div>
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
