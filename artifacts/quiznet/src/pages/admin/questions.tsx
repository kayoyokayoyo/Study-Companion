import { useState } from "react"
import { useGetQuiz, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useImportQuestions, getGetQuizQueryKey, QuestionInput } from "@workspace/api-client-react"
import { useParams, Link } from "wouter"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus, Edit2, Trash2, Save, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminQuestions() {
  const { quizId } = useParams()
  const id = Number(quizId)
  
  const { data: quiz, isLoading } = useGetQuiz(id, { query: { enabled: !!id, queryKey: getGetQuizQueryKey(id) } })
  const queryClient = useQueryClient()
  
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()
  const deleteMutation = useDeleteQuestion()
  const importMutation = useImportQuestions()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importJson, setImportJson] = useState("")
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<{
    type: 'mcq' | 'direct',
    text: string,
    explanation: string,
    directAnswer: string,
    choices: { text: string, isCorrect: boolean }[]
  }>({
    type: 'mcq',
    text: '',
    explanation: '',
    directAnswer: '',
    choices: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ]
  })

  const openNew = () => {
    setEditingId(null)
    setFormData({
      type: 'mcq',
      text: '',
      explanation: '',
      directAnswer: '',
      choices: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }]
    })
    setIsModalOpen(true)
  }

  const openEdit = (q: any) => {
    setEditingId(q.id)
    setFormData({
      type: q.type,
      text: q.text,
      explanation: q.explanation || '',
      directAnswer: q.directAnswer || '',
      choices: q.choices?.map((c:any) => ({ text: c.text, isCorrect: c.isCorrect })) || []
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.text.trim()) return

    const payload: QuestionInput = {
      quizId: id,
      type: formData.type,
      text: formData.text,
      explanation: formData.explanation || null,
      orderIndex: null, // will be auto-assigned
    }

    if (formData.type === 'mcq') {
      const validChoices = formData.choices.filter(c => c.text.trim() !== '')
      if (validChoices.length < 2) {
        alert("Il faut au moins 2 choix valides.")
        return
      }
      payload.choices = validChoices
    } else {
      if (!formData.directAnswer.trim()) {
        alert("Réponse attendue obligatoire.")
        return
      }
      payload.directAnswer = formData.directAnswer
    }

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(id) })
      setIsModalOpen(false)
    }

    if (editingId) {
      updateMutation.mutate({ questionId: editingId, data: payload }, { onSuccess })
    } else {
      createMutation.mutate({ data: payload }, { onSuccess })
    }
  }

  const handleDelete = (questionId: number) => {
    if (confirm("Supprimer cette question ?")) {
      deleteMutation.mutate({ questionId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(id) })
      })
    }
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importJson)
      if (!data.questions || !Array.isArray(data.questions)) throw new Error("Format invalide. Doit contenir { questions: [...] }")
      
      const payload = {
        questions: data.questions.map((q: any) => ({
          ...q,
          quizId: id // force current quiz
        }))
      }

      importMutation.mutate({ quizId: id, data: payload }, {
        onSuccess: (res) => {
          alert(`Import réussi : ${res.imported} questions importées. ${res.errors.length > 0 ? '\nErreurs: ' + res.errors.join(', ') : ''}`)
          queryClient.invalidateQueries({ queryKey: getGetQuizQueryKey(id) })
          setIsImportOpen(false)
          setImportJson("")
        },
        onError: (err: any) => {
          alert(`Erreur d'import : ${err.error || 'Erreur inconnue'}`)
        }
      })
    } catch (e: any) {
      alert("JSON invalide : " + e.message)
    }
  }

  const questions = quiz?.questions ? [...quiz.questions].sort((a, b) => a.orderIndex - b.orderIndex) : []

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 pb-32">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
          <Link href="/admin/quizzes"><ArrowLeft className="w-4 h-4 mr-2" /> Retour aux quizz</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{quiz?.title}</h1>
            <p className="text-muted-foreground">Gérez les questions de ce quizz.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
              <FileJson className="w-4 h-4" /> Importer
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> Ajouter
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center text-sm font-bold mt-0.5 shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-snug">{q.text}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span className="uppercase text-[10px] tracking-wider font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                          {q.type === 'mcq' ? 'QCM' : 'Directe'}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {q.type === 'mcq' ? (
                  <ul className="space-y-2">
                    {q.choices.map((c, j) => (
                      <li key={c.id || j} className={`flex items-start gap-2 text-sm ${c.isCorrect ? 'font-medium text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${c.isCorrect ? 'border-green-500 bg-green-500/20' : 'border-muted'}`}>
                          {c.isCorrect && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                        </div>
                        {c.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm">
                    <span className="font-semibold text-muted-foreground mr-2">Réponse attendue :</span>
                    <span className="font-medium text-foreground">{q.directAnswer}</span>
                  </div>
                )}
                {q.explanation && (
                  <div className="mt-4 text-sm bg-blue-500/5 text-muted-foreground p-3 rounded border border-blue-500/10">
                    <span className="font-semibold text-foreground">Explication :</span> {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {questions.length === 0 && (
            <div className="text-center p-16 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
              Aucune question. Cliquez sur "Ajouter" pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la question" : "Nouvelle question"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {!editingId && (
              <div className="space-y-3">
                <Label>Type de question</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                    <RadioGroupItem value="mcq" id="mcq" />
                    <Label htmlFor="mcq" className="cursor-pointer">Choix multiples (QCM)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct" className="cursor-pointer">Réponse directe</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label>L'énoncé de la question</Label>
              <Textarea 
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                placeholder="Ex: Quelle est la capitale de la France ?"
                className="text-lg"
              />
            </div>

            {formData.type === 'mcq' ? (
              <div className="space-y-3 border p-4 rounded-xl bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                  <Label>Choix de réponses</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFormData({ ...formData, choices: [...formData.choices, { text: '', isCorrect: false }] })}
                  >
                    Ajouter un choix
                  </Button>
                </div>
                {formData.choices.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-2">
                      <Checkbox 
                        checked={c.isCorrect} 
                        onCheckedChange={checked => {
                          const newC = [...formData.choices];
                          newC[idx].isCorrect = !!checked;
                          setFormData({ ...formData, choices: newC })
                        }}
                      />
                    </div>
                    <Input 
                      value={c.text}
                      onChange={e => {
                        const newC = [...formData.choices];
                        newC[idx].text = e.target.value;
                        setFormData({ ...formData, choices: newC })
                      }}
                      placeholder={`Choix ${idx + 1}`}
                      className={c.isCorrect ? "border-green-500 bg-green-500/5 focus-visible:ring-green-500" : ""}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        const newC = formData.choices.filter((_, i) => i !== idx);
                        setFormData({ ...formData, choices: newC })
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground mt-2">Cochez les cases pour indiquer la/les bonne(s) réponse(s).</div>
              </div>
            ) : (
              <div className="space-y-2 border p-4 rounded-xl bg-muted/20">
                <Label>Réponse attendue exacte</Label>
                <Input 
                  value={formData.directAnswer}
                  onChange={e => setFormData({ ...formData, directAnswer: e.target.value })}
                  placeholder="Ex: Paris"
                  className="font-medium"
                />
                <div className="text-xs text-muted-foreground">L'étudiant devra saisir ce texte (la casse n'est pas prise en compte).</div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Explication (optionnel)</Label>
              <Textarea 
                value={formData.explanation}
                onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Pourquoi est-ce la bonne réponse ?"
              />
            </div>

          </div>
          
          <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending || !formData.text.trim()}>
              <Save className="w-4 h-4 mr-2" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importer depuis JSON</DialogTitle>
            <DialogDescription>Collez un tableau JSON contenant vos questions.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              className="font-mono text-xs h-[400px]"
              placeholder={`{
  "questions": [
    {
      "type": "mcq",
      "text": "Question 1",
      "choices": [
        { "text": "A", "isCorrect": true },
        { "text": "B", "isCorrect": false }
      ]
    }
  ]
}`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Annuler</Button>
            <Button onClick={handleImport} disabled={importMutation.isPending || !importJson.trim()}>
              Lancer l'import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
