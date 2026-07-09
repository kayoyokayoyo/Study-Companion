import { useGetCourse, useListQuizzes, getGetCourseQueryKey, getListQuizzesQueryKey } from "@workspace/api-client-react"
import { Link, useParams } from "wouter"
import { ArrowLeft, PlayCircle, BookOpen, Clock, Tag, LayoutGrid } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function StudentCourseDetail() {
  const { courseId } = useParams()
  const id = Number(courseId)

  const { data: course, isLoading: isCourseLoading } = useGetCourse(id, {
    query: { enabled: !!id, queryKey: getGetCourseQueryKey(id) }
  })
  const { data: quizzes, isLoading: isQuizzesLoading } = useListQuizzes({ courseId: id }, {
    query: { enabled: !!id, queryKey: getListQuizzesQueryKey({ courseId: id }) }
  })

  if (isCourseLoading) {
    return (
      <div className="p-5 md:p-10 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!course) {
    return <div className="p-10 text-center text-muted-foreground">Cours introuvable</div>
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
        <Link href="/courses">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tous les cours
        </Link>
      </Button>

      {/* Course header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{course.name}</h1>
        </div>
        {course.description && (
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {course.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="gap-1.5">
            <LayoutGrid className="w-3 h-3" /> {course.quizCount} Quizz
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Tag className="w-3 h-3" /> {course.questionCount} Questions
          </Badge>
        </div>
      </div>

      {/* Quiz list */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Choisissez un quizz</h2>

        {isQuizzesLoading ? (
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : quizzes?.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
            Aucun quizz disponible pour ce cours.
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes?.map(quiz => (
              <div
                key={quiz.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                {/* Card body */}
                <div className="p-5 space-y-3">
                  {/* Top row: badge + date */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="bg-secondary/15 text-secondary border-secondary/25 hover:bg-secondary/20 text-xs font-semibold px-2.5 py-0.5">
                      {quiz.evalTypeName}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(quiz.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold leading-snug">{quiz.title}</h3>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  {/* Question count pill */}
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium bg-muted px-3 py-1.5 rounded-lg">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    {quiz.questionCount} Question{quiz.questionCount !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="border-t grid grid-cols-2">
                  <Link href={`/quiz/${quiz.id}/train`}>
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors active:scale-[0.98]">
                      <PlayCircle className="w-4 h-4" /> Entraînement
                    </button>
                  </Link>
                  <Link href={`/quiz/${quiz.id}/read`}>
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-secondary-foreground bg-secondary hover:bg-secondary/90 transition-colors border-l active:scale-[0.98]">
                      <BookOpen className="w-4 h-4" /> Lecture
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
