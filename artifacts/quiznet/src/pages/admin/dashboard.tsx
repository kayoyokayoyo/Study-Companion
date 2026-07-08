import { useGetStats, useListQuizzes, useListCourses } from "@workspace/api-client-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import {
  Book, LayoutGrid, ListChecks, Target, TrendingUp,
  MessageSquare, Plus, CheckCheck, Trash2, RefreshCw, ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/utils"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

type Suggestion = { id: number; name: string | null; email: string | null; message: string; isRead: boolean; createdAt: string }

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats()
  const { data: quizzes } = useListQuizzes()
  const { data: courses } = useListCourses()
  const queryClient = useQueryClient()

  const { data: suggestions = [], refetch: refetchSuggestions } = useQuery<Suggestion[]>({
    queryKey: ['suggestions'],
    queryFn: () =>
      fetch(`${BASE}/api/suggestions`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : []),
    staleTime: 1000 * 30,
  })

  const unread = suggestions.filter(s => !s.isRead).length
  const recentSuggestions = suggestions.slice(0, 5)

  const recentQuizzes = (quizzes ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const markRead = async (id: number) => {
    await fetch(`${BASE}/api/suggestions/${id}/read`, { method: 'PATCH', credentials: 'include' })
    refetchSuggestions()
    queryClient.invalidateQueries({ queryKey: ['suggestions-unread'] })
  }

  const deleteSuggestion = async (id: number) => {
    await fetch(`${BASE}/api/suggestions/${id}`, { method: 'DELETE', credentials: 'include' })
    refetchSuggestions()
    queryClient.invalidateQueries({ queryKey: ['suggestions-unread'] })
  }

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h1>
          <p className="text-muted-foreground">Statistiques de la plateforme QuizNET.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/admin/courses"><Plus className="w-3.5 h-3.5" /> Cours</Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/quizzes"><Plus className="w-3.5 h-3.5" /> Quizz</Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="Cours"       value={stats?.totalCourses ?? 0}   icon={<Book className="w-5 h-5" />}        color="text-primary"    bg="bg-primary/10" />
          <AdminStatCard title="Quizz"       value={stats?.totalQuizzes ?? 0}   icon={<LayoutGrid className="w-5 h-5" />}  color="text-teal-600"   bg="bg-teal-500/10" />
          <AdminStatCard title="Questions"   value={stats?.totalQuestions ?? 0} icon={<ListChecks className="w-5 h-5" />} color="text-blue-600"   bg="bg-blue-500/10" />
          <AdminStatCard title="Suggestions" value={unread}                     icon={<MessageSquare className="w-5 h-5" />} color="text-orange-600" bg="bg-orange-500/10"
            badge={unread > 0 ? `${unread} non lu${unread > 1 ? "s" : ""}` : undefined} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" /> Top Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.topCourses ?? []).map((c, i) => {
                const maxQ = Math.max(...(stats?.topCourses ?? []).map(x => x.questionCount), 1)
                const pct = Math.round((c.questionCount / maxQ) * 100)
                return (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium truncate max-w-[160px]">{c.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.quizCount} qz · {c.questionCount} qs</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {!stats?.topCourses?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question type distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Répartition des questions</CardTitle>
            <CardDescription className="text-xs">
              QCM et réponses directes peuvent être mélangés dans un même quizz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "QCM", count: stats?.mcqCount ?? 0, color: "bg-primary" },
              { label: "Réponse directe", count: stats?.directCount ?? 0, color: "bg-teal-500" },
            ].map(({ label, count, color }) => {
              const total = (stats?.totalQuestions ?? 0) || 1
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{label}</span>
                    <span className="font-bold">{count} <span className="text-muted-foreground font-normal">({Math.round(count / total * 100)}%)</span></span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent quizzes */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Quizz récents</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Link href="/admin/quizzes">Voir tout <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentQuizzes.map(q => (
                <div key={q.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{q.title}</div>
                    <div className="text-xs text-muted-foreground">{q.courseName} · {q.questionCount} questions</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{q.evalTypeName}</Badge>
                    <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Link href={`/admin/quizzes/${q.id}/questions`}>
                        <ListChecks className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {recentQuizzes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun quizz créé</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions preview */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Suggestions
                {unread > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-500/10 text-orange-600 text-xs font-bold rounded-full">
                    {unread} non lu{unread > 1 ? "s" : ""}
                  </span>
                )}
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Link href="/admin/suggestions">Tout voir <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSuggestions.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Aucune suggestion reçue
              </div>
            ) : (
              <div className="space-y-2">
                {recentSuggestions.map(s => (
                  <div
                    key={s.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                      s.isRead ? "bg-muted/30 border-transparent" : "bg-orange-500/5 border-orange-200"
                    }`}
                  >
                    {!s.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{s.name || "Anonyme"}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(s.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.message}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!s.isRead && (
                        <button onClick={() => markRead(s.id)} title="Marquer lu" className="text-muted-foreground hover:text-green-600 transition-colors">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteSuggestion(s.id)} title="Supprimer" className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminStatCard({ title, value, icon, color, bg, badge }: {
  title: string; value: number; icon: React.ReactNode; color: string; bg: string; badge?: string
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
          {badge && (
            <span className="text-xs font-medium px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{title}</div>
      </CardContent>
    </Card>
  )
}
