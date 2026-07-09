import { useState, useEffect, useMemo } from "react"
import { Search, BookOpen, LayoutGrid, PlayCircle } from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useListQuizzes, useListCourses } from "@workspace/api-client-react"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const { data: quizzes } = useListQuizzes()
  const { data: courses } = useListCourses()

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Reset query on close
  useEffect(() => { if (!open) setQuery("") }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { quizzes: [], courses: [] }
    return {
      courses: (courses ?? [])
        .filter(c => c.name.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q))
        .slice(0, 4),
      quizzes: (quizzes ?? [])
        .filter(x =>
          x.title.toLowerCase().includes(q) ||
          (x.courseName ?? "").toLowerCase().includes(q) ||
          (x.evalTypeName ?? "").toLowerCase().includes(q)
        )
        .slice(0, 5),
    }
  }, [query, quizzes, courses])

  const hasResults = results.courses.length > 0 || results.quizzes.length > 0

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setOpen(true)}
        title="Rechercher (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden">
          {/* Search input row */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un quizz, un cours…"
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-base bg-transparent"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted border rounded px-1.5 py-0.5 font-mono">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {!query && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Tapez pour rechercher des quizz et des cours…
              </p>
            )}
            {query && !hasResults && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aucun résultat pour «&nbsp;{query}&nbsp;»
              </p>
            )}

            {results.courses.length > 0 && (
              <section className="mb-2">
                <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cours</p>
                {results.courses.map(c => (
                  <Link key={c.id} href={`/courses/${c.id}`} onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.quizCount} quizz · {c.questionCount} questions</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {results.quizzes.length > 0 && (
              <section>
                <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quizz</p>
                {results.quizzes.map(q => (
                  <div key={q.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.courseName} · {q.evalTypeName}</p>
                    </div>
                    <Link href={`/quiz/${q.id}/train`} onClick={() => setOpen(false)}>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 shrink-0">
                        <PlayCircle className="w-3.5 h-3.5" /> Jouer
                      </Button>
                    </Link>
                  </div>
                ))}
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
