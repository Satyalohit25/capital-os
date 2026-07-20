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

const primary = [{ title: "Dashboard", to: "/" }];

const hub = [
  { title: "Overview", to: "/hub" },
  { title: "Income", to: "/hub/income" },
  { title: "Bills", to: "/hub/bills" },
  { title: "Debts", to: "/hub/debts" },
  { title: "Credit Lines", to: "/hub/credit" },
  { title: "Savings", to: "/hub/savings" },
  { title: "Investments", to: "/hub/investments" },
  { title: "Assets", to: "/hub/assets" },
];

const planning = [
  { title: "Monthly Planner", to: "/planner" },
  { title: "Forecast Engine", to: "/forecast" },
  { title: "Analytics", to: "/analytics" },
];

const locked = [
  { title: "Debt Strategy", to: "/debt-strategy", phase: "Phase 4" },
  { title: "Goal Planner", to: "/goals", phase: "Phase 5" },
  { title: "Reports", to: "/reports", phase: "Phase 7" },
  { title: "AI Advisor", to: "/advisor", phase: "Phase 8" },
  { title: "History", to: "/history", phase: "Phase 9" },
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

  const renderItem = (item: { title: string; to: string }) => (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton asChild isActive={isActive(item.to)}>
        <Link
          to={item.to}
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
        >
          <span className="size-1.5 shrink-0 rounded-full border border-border" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-3 text-sm font-medium text-foreground data-[active=true]:bg-muted"
                    >
                      <span className="size-4 shrink-0 rounded-full bg-[--color-accent]" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Financial Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{hub.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{planning.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Coming Soon
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {locked.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <Link
                      to={item.to}
                      className="group flex items-center justify-between gap-3 text-sm text-muted-foreground/80 hover:text-muted-foreground"
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-2 w-16 rounded bg-muted group-hover:bg-muted" />
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
                        {item.phase}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings — unlocked */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItem({ title: "Settings", to: "/settings" })}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto border-t border-border pt-4">
          <Link to="/settings" className="flex items-center gap-3 px-3 hover:opacity-80">
            <Avatar className="size-8">
              {settings.avatarUrl && (
                <AvatarImage src={settings.avatarUrl} alt={settings.profileName} />
              )}
              <AvatarFallback className="bg-muted text-xs text-muted-foreground outline outline-1 -outline-offset-1 outline-hairline">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium text-foreground">{settings.profileName}</div>
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
