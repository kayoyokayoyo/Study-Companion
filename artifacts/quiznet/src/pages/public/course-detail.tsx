import { useGetCourse, useListQuizzes, getGetCourseQueryKey, getListQuizzesQueryKey } from "@workspace/api-client-react"
import { Link, useParams } from "wouter"
import { ArrowLeft, PlayCircle, BookOpen, Clock, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function StudentCourseDetail() {
  const { courseId } = useParams()
  const id = Number(courseId)
  
  const { data: course, isLoading: isCourseLoading } = useGetCourse(id, { query: { enabled: !!id, queryKey: getGetCourseQueryKey(id) } })
  const { data: quizzes, isLoading: isQuizzesLoading } = useListQuizzes({ courseId: id }, { query: { enabled: !!id, queryKey: getListQuizzesQueryKey({ courseId: id }) } })

  if (isCourseLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!course) {
    return <div className="p-10 text-center">Cours introuvable</div>
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
          <Link href="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux cours
          </Link>
        </Button>
        
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            {course.name}
          </h1>
          {course.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {course.description}
            </p>
          )}
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-background">
              {course.quizCount} Quizz
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-background">
              {course.questionCount} Questions
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sélectionnez un quizz</h2>
        
        {isQuizzesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.map(quiz => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                      {quiz.evalTypeName}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-2 rounded-md w-fit">
                    <Tag className="w-4 h-4" />
                    {quiz.questionCount} Questions
                  </div>
                </CardContent>
                <CardFooter className="gap-3 pt-6 border-t">
                  <Button asChild className="flex-1 group">
                    <Link href={`/quiz/${quiz.id}/train`}>
                      <PlayCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Entraînement
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="flex-1 group">
                    <Link href={`/quiz/${quiz.id}/read`}>
                      <BookOpen className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Lecture
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {quizzes?.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                Aucun quizz disponible pour ce cours.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
