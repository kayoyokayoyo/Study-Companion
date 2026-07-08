import { useState, useMemo } from "react"
import { useGetQuiz, getGetQuizQueryKey } from "@workspace/api-client-react"
import { Link, useParams } from "wouter"
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function StudentTrainQuiz() {
  const { quizId } = useParams()
  const id = Number(quizId)
  const { data: quiz, isLoading } = useGetQuiz(id, { query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) } })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [directInput, setDirectInput] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const questions = useMemo(() => {
    return quiz?.questions ? [...quiz.questions].sort((a, b) => a.orderIndex - b.orderIndex) : []
  }, [quiz?.questions])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  const handleMCQSubmit = () => {
    if (!selectedAnswer) return
    setIsAnswered(true)
    const choice = currentQuestion.choices.find(c => c.id.toString() === selectedAnswer)
    if (choice?.isCorrect) {
      setScore(s => s + 1)
    }
  }

  const handleDirectSubmit = () => {
    if (!directInput.trim()) return
    setIsAnswered(true)
    const isCorrect = currentQuestion.directAnswer && 
      directInput.trim().toLowerCase() === currentQuestion.directAnswer.trim().toLowerCase()
    if (isCorrect) {
      setScore(s => s + 1)
    }
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer("")
      setDirectInput("")
      setIsAnswered(false)
    } else {
      setIsFinished(true)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setSelectedAnswer("")
    setDirectInput("")
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
  }

  if (isLoading) {
    return <div className="p-10 flex justify-center">Chargement...</div>
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="p-10 text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Ce quizz est vide</h2>
        <Button asChild><Link href={`/courses/${quiz?.courseId || ''}`}>Retour au cours</Link></Button>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Terminé !</h1>
            <p className="text-xl text-muted-foreground">{quiz.title}</p>
          </div>
          
          <div className="bg-card border rounded-2xl p-10 shadow-sm relative overflow-hidden">
            <div className={`absolute inset-0 opacity-10 ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div className="relative z-10 space-y-4">
              <div className="text-6xl font-black">
                {score} <span className="text-3xl text-muted-foreground">/ {questions.length}</span>
              </div>
              <div className="text-lg font-medium">
                {percentage >= 70 ? "Excellent travail !" : percentage >= 50 ? "Pas mal, encore un effort." : "Il faut réviser encore un peu."}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={restart} size="lg" variant="outline" className="gap-2">
              <RotateCcw className="w-5 h-5" /> Recommencer
            </Button>
            <Button asChild size="lg" className="gap-2">
              <Link href={`/courses/${quiz.courseId}`}>
                <ArrowRight className="w-5 h-5" /> Retour au cours
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isMCQ = currentQuestion.type === 'mcq'

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="bg-background border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/courses/${quiz.courseId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Question {currentIndex + 1} sur {questions.length}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-3xl w-full animate-in slide-in-from-right-8 duration-300" key={currentQuestion.id}>
          <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
            <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
              {currentQuestion.text}
            </h2>

            {isMCQ ? (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3" disabled={isAnswered}>
                {currentQuestion.choices.map(choice => {
                  const isSelected = selectedAnswer === choice.id.toString()
                  const showCorrect = isAnswered && choice.isCorrect
                  const showWrong = isAnswered && isSelected && !choice.isCorrect

                  return (
                    <div 
                      key={choice.id} 
                      className={`flex items-center space-x-3 border rounded-xl p-4 transition-all
                        ${!isAnswered && isSelected ? 'border-primary bg-primary/5' : ''}
                        ${!isAnswered && !isSelected ? 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer' : ''}
                        ${showCorrect ? 'border-green-500 bg-green-500/10' : ''}
                        ${showWrong ? 'border-red-500 bg-red-500/10' : ''}
                        ${isAnswered && !showCorrect && !showWrong ? 'opacity-50' : ''}
                      `}
                      onClick={() => !isAnswered && setSelectedAnswer(choice.id.toString())}
                    >
                      <RadioGroupItem value={choice.id.toString()} id={`choice-${choice.id}`} />
                      <Label htmlFor={`choice-${choice.id}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                        {choice.text}
                      </Label>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  )
                })}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                <Input 
                  value={directInput}
                  onChange={(e) => setDirectInput(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  disabled={isAnswered}
                  className="text-lg p-6 h-auto"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !isAnswered && directInput.trim()) {
                      handleDirectSubmit()
                    }
                  }}
                />
                {isAnswered && (
                  <div className={`p-4 rounded-xl border ${
                    currentQuestion.directAnswer && directInput.trim().toLowerCase() === currentQuestion.directAnswer.trim().toLowerCase()
                      ? 'bg-green-500/10 border-green-500 text-green-700'
                      : 'bg-red-500/10 border-red-500 text-red-700'
                  }`}>
                    <div className="font-semibold mb-1">
                      {currentQuestion.directAnswer && directInput.trim().toLowerCase() === currentQuestion.directAnswer.trim().toLowerCase()
                        ? "Bonne réponse !" 
                        : "Mauvaise réponse."}
                    </div>
                    <div className="text-sm">
                      La réponse attendue était : <span className="font-bold">{currentQuestion.directAnswer}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAnswered && currentQuestion.explanation && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 p-4 rounded-xl text-sm leading-relaxed animate-in fade-in zoom-in-95">
                <span className="font-bold block mb-1">Explication :</span>
                {currentQuestion.explanation}
              </div>
            )}

            <div className="pt-6 border-t flex justify-end">
              {!isAnswered ? (
                <Button 
                  size="lg" 
                  onClick={isMCQ ? handleMCQSubmit : handleDirectSubmit}
                  disabled={isMCQ ? !selectedAnswer : !directInput.trim()}
                  className="w-full md:w-auto"
                >
                  Valider
                </Button>
              ) : (
                <Button size="lg" onClick={nextQuestion} className="w-full md:w-auto gap-2" autoFocus>
                  {currentIndex < questions.length - 1 ? "Question suivante" : "Terminer"} <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
