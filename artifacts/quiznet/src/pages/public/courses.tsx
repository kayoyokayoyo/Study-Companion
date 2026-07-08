import { useState, useMemo } from "react"
import { useListCourses } from "@workspace/api-client-react"
import { Link } from "wouter"
import { LayoutGrid, ListChecks, Search, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function StudentCourses() {
  const { data: courses, isLoading } = useListCourses()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!courses) return []
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    )
  }, [courses, search])

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tous les cours</h1>
        <p className="text-muted-foreground">
          Choisissez un cours pour commencer votre entraînement.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un cours..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          {search ? `Aucun cours trouvé pour "${search}"` : "Aucun cours disponible pour le moment."}
        </div>
      ) : (
        <>
          {search && (
            <p className="text-sm text-muted-foreground">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} pour «&nbsp;{search}&nbsp;»
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(course => (
              <Card
                key={course.id}
                className="flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem] text-sm">
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
                  <Button
                    asChild
                    className="w-full h-9"
                    variant={course.quizCount > 0 ? "default" : "secondary"}
                  >
                    <Link href={`/courses/${course.id}`}>
                      {course.quizCount > 0 ? "Ouvrir" : "Voir"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
