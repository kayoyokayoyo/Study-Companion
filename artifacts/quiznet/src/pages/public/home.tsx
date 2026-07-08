import { useGetStats, useListCourses, useListQuizzes } from "@workspace/api-client-react"
import { Link } from "wouter"
import { Book, LayoutGrid, ListChecks, Target, ArrowRight, Sparkles, PlayCircle, BookOpen, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/utils"

function greeting() {
  const h = new Date().getHours()
  if (h < 5)  return "Bonne nuit"
  if (h < 12) return "Bonjour"
  if (h < 18) return "Bon après-midi"
  return "Bonsoir"
}

const LAST_VISIT_KEY = "quiznet_notifications_seen_at"

export function StudentHome() {
  const { data: stats, isLoading: statsLoading } = useGetStats()
  const { data: courses, isLoading: coursesLoading } = useListCourses()
  const { data: quizzes } = useListQuizzes()

  const featuredCourses = courses?.slice(0, 4) ?? []

  // Recent quizzes — last 4 sorted by newest first
  const recentQuizzes = (quizzes ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  // Unread notification count
  const seenAt = Number(localStorage.getItem(LAST_VISIT_KEY) ?? 0)
  const newCount = (quizzes ?? []).filter(q => new Date(q.createdAt).getTime() > seenAt).length

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{greeting()} !</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Prêt à <span className="text-primary">exceller</span>&nbsp;?
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Entraînez-vous avec des QCM et réponses directes pour booster vos résultats.
        </p>
        {newCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {newCount} nouveau{newCount > 1 ? "x" : ""} quizz disponible{newCount > 1 ? "s" : ""} — consultez la cloche 🔔
          </div>
        )}
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsLoading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : (
            <>
              <StatCard icon={<Book className="w-5 h-5 text-primary" />}       label="Cours"       value={stats?.totalCourses ?? 0}   color="bg-primary/10" />
              <StatCard icon={<LayoutGrid className="w-5 h-5 text-teal-500" />} label="Quizz"       value={stats?.totalQuizzes ?? 0}   color="bg-teal-500/10" />
              <StatCard icon={<ListChecks className="w-5 h-5 text-blue-500" />} label="Questions"   value={stats?.totalQuestions ?? 0} color="bg-blue-500/10" />
              <StatCard icon={<Target className="w-5 h-5 text-violet-500" />}   label="Types d'éval" value={stats?.totalEvalTypes ?? 0} color="bg-violet-500/10" />
            </>
          )}
      </section>

      {/* Recent quizzes */}
      {recentQuizzes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" /> Récemment ajoutés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentQuizzes.map(q => {
              const isNew = new Date(q.createdAt).getTime() > seenAt
              return (
                <div
                  key={q.id}
                  className="group flex items-center gap-4 bg-card border rounded-xl p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{q.title}</span>
                      {isNew && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground shrink-0">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {q.courseName} · {q.evalTypeName} · {q.questionCount} question{q.questionCount !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{formatDistanceToNow(q.createdAt)}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1">
                      <Link href={`/quiz/${q.id}/read`}>
                        <BookOpen className="w-3.5 h-3.5" /> Lire
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="h-8 px-2 text-xs gap-1">
                      <Link href={`/quiz/${q.id}/train`}>
                        <PlayCircle className="w-3.5 h-3.5" /> Jouer
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Courses grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Vos cours</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">Voir tout <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
          </Button>
        </div>

        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredCourses.map(course => (
              <Card key={course.id} className="flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {course.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5" /> {course.quizCount} Quizz
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" /> {course.questionCount} Questions
                    </span>
                  </div>
                  <Button asChild className="w-full h-9">
                    <Link href={`/courses/${course.id}`}>Commencer</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {featuredCourses.length === 0 && (
              <div className="col-span-full py-14 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                Aucun cours disponible pour le moment.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5 flex flex-col items-center text-center space-y-2">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        <div className="text-3xl font-black">{value}</div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</div>
      </CardContent>
    </Card>
  )
}
