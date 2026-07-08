import { useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react"
import { Link, useParams } from "wouter"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StudentReadQuiz() {
  const { quizId } = useParams()
  const id = Number(quizId)
  const { data: quiz, isLoading } = useGetQuiz(id, { query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) } })

  if (isLoading) {
    return <div className="p-10 flex justify-center">Chargement...</div>
  }

  if (!quiz) {
    return <div className="p-10 text-center">Quizz introuvable</div>
  }

  const questions = quiz.questions ? [...quiz.questions].sort((a, b) => a.orderIndex - b.orderIndex) : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link href={`/courses/${quiz.courseId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Mode Lecture : {quiz.title}</h1>
            <p className="text-muted-foreground">Révisez l'ensemble des questions et leurs réponses.</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {questions.length === 0 && (
             <div className="text-center text-muted-foreground py-12">Aucune question dans ce quizz.</div>
          )}
          
          {questions.map((q, i) => (
            <div key={q.id} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">
                  {i + 1}
                </div>
                <h2 className="text-xl font-semibold leading-relaxed pt-1">
                  {q.text}
                </h2>
              </div>

              <div className="pl-12">
                {q.type === 'mcq' ? (
                  <div className="space-y-3">
                    {q.choices.map(c => (
                      <div 
                        key={c.id} 
                        className={`p-3 rounded-lg border ${
                          c.isCorrect 
                            ? 'bg-green-500/10 border-green-500/30 font-medium text-green-900 dark:text-green-300' 
                            : 'bg-muted/50 border-transparent text-muted-foreground'
                        } flex items-start gap-3`}
                      >
                        {c.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                        )}
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">Réponse attendue</div>
                    <div className="text-lg font-medium">{q.directAnswer}</div>
                  </div>
                )}

                {q.explanation && (
                  <div className="mt-6 bg-blue-500/5 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground">Explication :</span> {q.explanation}
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
