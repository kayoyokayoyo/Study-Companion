import { useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react"
import { Link, useParams } from "wouter"
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StudentReadQuiz() {
  const { quizId } = useParams()
  const id = Number(quizId)
  const { data: quiz, isLoading } = useGetQuiz(id, {
    query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) }
  })

  if (isLoading) {
    return <div className="p-10 flex justify-center">Chargement…</div>
  }
  if (!quiz) {
    return <div className="p-10 text-center">Quizz introuvable</div>
  }

  const questions = quiz.questions
    ? [...quiz.questions].sort((a, b) => a.orderIndex - b.orderIndex)
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header — hidden when printing */}
      <header className="print:hidden bg-card border-b p-4 md:p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
              <Link href={`/courses/${quiz.courseId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Mode Lecture : {quiz.title}</h1>
            <p className="text-muted-foreground text-sm">
              {quiz.courseName} · {quiz.evalTypeName} · {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Exporter PDF
          </Button>
        </div>
      </header>

      {/* Print-only title */}
      <div className="hidden print:block px-8 pt-8 pb-4 border-b">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{quiz.courseName} · {quiz.evalTypeName}</p>
      </div>

      <main className="p-5 md:p-6 print:p-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-20 print:pb-0">
          {questions.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              Aucune question dans ce quizz.
            </div>
          )}

          {questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-card border rounded-2xl p-5 md:p-7 shadow-sm space-y-5 print:shadow-none print:border print:break-inside-avoid"
            >
              {/* Question */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <h2 className="text-lg font-semibold leading-relaxed pt-0.5">{q.text}</h2>
              </div>

              {/* Answer */}
              <div className="pl-12 space-y-4">
                {q.type === "mcq" ? (
                  <div className="space-y-2">
                    {q.choices.map(c => (
                      <div
                        key={c.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                          c.isCorrect
                            ? "bg-green-500/10 border-green-500/30 font-medium text-green-900 dark:text-green-300"
                            : "bg-muted/40 border-transparent text-muted-foreground"
                        }`}
                      >
                        {c.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                        )}
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                      Réponse attendue
                    </p>
                    <p className="text-base font-medium leading-relaxed">{q.directAnswer}</p>
                  </div>
                )}

                {q.explanation && (
                  <div className="bg-blue-500/5 border-l-4 border-blue-400 px-4 py-3 rounded-r-xl text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">Explication : </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
