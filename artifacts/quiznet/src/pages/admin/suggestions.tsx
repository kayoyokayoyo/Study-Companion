import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, CheckCheck, Trash2, Mail, User, RefreshCw, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "@/lib/utils"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

type Suggestion = {
  id: number
  name: string | null
  email: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export function AdminSuggestions() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  const { data: suggestions = [], isLoading, refetch } = useQuery<Suggestion[]>({
    queryKey: ['suggestions'],
    queryFn: () => fetch(`${BASE}/api/suggestions`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    staleTime: 0,
  })

  const markRead = async (id: number) => {
    await fetch(`${BASE}/api/suggestions/${id}/read`, { method: 'PATCH', credentials: 'include' })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['suggestions-unread'] })
  }

  const deleteSuggestion = async (id: number) => {
    if (!confirm("Supprimer cette suggestion ?")) return
    await fetch(`${BASE}/api/suggestions/${id}`, { method: 'DELETE', credentials: 'include' })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['suggestions-unread'] })
  }

  const markAllRead = async () => {
    await Promise.all(
      suggestions.filter(s => !s.isRead).map(s =>
        fetch(`${BASE}/api/suggestions/${s.id}/read`, { method: 'PATCH', credentials: 'include' })
      )
    )
    refetch()
    queryClient.invalidateQueries({ queryKey: ['suggestions-unread'] })
  }

  const filtered = suggestions.filter(s => {
    if (filter === "unread") return !s.isRead
    if (filter === "read")   return s.isRead
    return true
  })

  const unreadCount = suggestions.filter(s => !s.isRead).length

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Suggestions
          </h1>
          <p className="text-muted-foreground mt-1">
            {suggestions.length} message{suggestions.length !== 1 ? "s" : ""}
            {unreadCount > 0 && ` · ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="outline" size="sm" className="gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
            </Button>
          )}
          <Button onClick={() => refetch()} variant="ghost" size="icon" className="h-9 w-9">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-lg w-fit">
        {(["all", "unread", "read"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Toutes" : f === "unread" ? `Non lues ${unreadCount > 0 ? `(${unreadCount})` : ""}` : "Lues"}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3 text-muted-foreground border-2 border-dashed rounded-xl">
          <Inbox className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm">
            {filter === "unread" ? "Aucune suggestion non lue" :
             filter === "read"   ? "Aucune suggestion lue" :
             "Aucune suggestion reçue pour le moment"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div
              key={s.id}
              className={`rounded-xl border p-4 md:p-5 transition-colors ${
                s.isRead
                  ? "bg-card border-border"
                  : "bg-orange-500/5 border-orange-200 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {!s.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      {s.name ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {s.name}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">Anonyme</span>
                      )}
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          {s.email}
                        </a>
                      )}
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(s.createdAt)}</span>
                      {!s.isRead && (
                        <Badge className="text-[10px] px-1.5 h-4 bg-orange-500/20 text-orange-700 border-orange-300">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    {/* Message */}
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {s.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  {!s.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-green-600"
                      title="Marquer comme lu"
                      onClick={() => markRead(s.id)}
                    >
                      <CheckCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    title="Supprimer"
                    onClick={() => deleteSuggestion(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
