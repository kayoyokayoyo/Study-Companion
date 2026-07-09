import { useState } from "react"
import { Link, useLocation } from "wouter"
import {
  GraduationCap, LayoutDashboard, Library, FileText,
  Settings, BookOpen, Menu, LogOut, MessageSquare, Info, Settings2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { SuggestionModal } from "@/components/suggestion-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"
import { useLogout } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"

// ─── Student Layout ───────────────────────────────────────────────────────────

const studentLinks = [
  { href: "/",        label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/courses", label: "Mes cours",        icon: Library },
  { href: "/about",   label: "À propos",         icon: Info },
]

function StudentNavLink({
  href, label, icon: Icon, exact, onClick,
}: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; onClick?: () => void
}) {
  const [location] = useLocation()
  const active = exact ? location === href : location.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

function StudentSidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">QuizNET</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {studentLinks.map(l => (
          <StudentNavLink key={l.href} {...l} onClick={onNavClick} />
        ))}
      </nav>
      <div className="px-3 pb-4 border-t pt-3 space-y-1">
        <SuggestionModal variant="sidebar" />
      </div>
    </div>
  )
}

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <StudentSidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur border-b px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">QuizNET</span>
          </div>
          <div className="flex items-center gap-0.5">
            <GlobalSearch />
            <ThemeToggle />
            <NotificationBell />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <StudentSidebarContent onNavClick={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop topbar */}
        <div className="hidden md:flex sticky top-0 z-20 bg-background/80 backdrop-blur border-b px-6 h-11 items-center justify-end gap-1">
          <GlobalSearch />
          <ThemeToggle />
          <SuggestionModal variant="inline" />
          <NotificationBell />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────

const adminLinks = [
  { href: "/admin/dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { href: "/admin/courses",    label: "Cours",              icon: BookOpen },
  { href: "/admin/eval-types", label: "Types d'évaluation", icon: FileText },
  { href: "/admin/quizzes",    label: "Quizz",              icon: Library },
  { href: "/admin/suggestions",label: "Suggestions",        icon: MessageSquare },
  { href: "/admin/settings",   label: "Paramètres",         icon: Settings2 },
]

function AdminNavLink({
  href, label, icon: Icon, badge, onClick,
}: {
  href: string; label: string; icon: React.ElementType; badge?: number; onClick?: () => void
}) {
  const [location] = useLocation()
  const active = location.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary/10 text-sidebar-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  )
}

function AdminSidebarContent({
  onNavClick, unreadSuggestions,
}: {
  onNavClick?: () => void; unreadSuggestions?: number
}) {
  const queryClient = useQueryClient()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear()
        window.location.href = import.meta.env.BASE_URL + "admin"
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3 border-b">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">QuizNET</div>
          <div className="text-xs text-muted-foreground">Administration</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminLinks.map(l => (
          <AdminNavLink
            key={l.href}
            {...l}
            badge={l.href === "/admin/suggestions" ? unreadSuggestions : undefined}
            onClick={onNavClick}
          />
        ))}
      </nav>
      <div className="px-3 pb-4 border-t pt-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Apparence</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export function AdminLayout({
  children, unreadSuggestions,
}: {
  children: React.ReactNode; unreadSuggestions?: number
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-sidebar flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <AdminSidebarContent unreadSuggestions={unreadSuggestions} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-sidebar/95 backdrop-blur border-b px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Admin</span>
          </div>
          <div className="flex items-center gap-0.5">
            {(unreadSuggestions ?? 0) > 0 && (
              <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadSuggestions}
              </span>
            )}
            <ThemeToggle />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar">
                <AdminSidebarContent
                  onNavClick={() => setSheetOpen(false)}
                  unreadSuggestions={unreadSuggestions}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
