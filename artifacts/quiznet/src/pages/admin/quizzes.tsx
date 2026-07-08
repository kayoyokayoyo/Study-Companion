import { useState } from "react"
import { useListQuizzes, useListCourses, useListEvalTypes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz, getListQuizzesQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import { Plus, Edit2, Trash2, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function AdminQuizzes() {
  const { data: quizzes, isLoading } = useListQuizzes()
  const { data: courses } = useListCourses()
  const { data: evalTypes } = useListEvalTypes()
  
  const queryClient = useQueryClient()
  const createMutation = useCreateQuiz()
  const updateMutation = useUpdateQuiz()
  const deleteMutation = useDeleteQuiz()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "",
    courseId: "",
    evalTypeId: ""
  })

  const openNew = () => {
    setEditingId(null)
    setFormData({ title: "", description: "", courseId: "", evalTypeId: "" })
    setIsModalOpen(true)
  }

  const openEdit = (quiz: any) => {
    setEditingId(quiz.id)
    setFormData({ 
      title: quiz.title, 
      description: quiz.description || "",
      courseId: quiz.courseId.toString(),
      evalTypeId: quiz.evalTypeId.toString()
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title.trim() || !formData.courseId || !formData.evalTypeId) return

    const payload = {
      title: formData.title,
      description: formData.description || null,
      courseId: parseInt(formData.courseId),
      evalTypeId: parseInt(formData.evalTypeId)
    }

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() })
      setIsModalOpen(false)
    }

    if (editingId) {
      updateMutation.mutate({ quizId: editingId, data: payload }, { onSuccess })
    } else {
      createMutation.mutate({ data: payload }, { onSuccess })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce quizz et toutes ses questions ?")) {
      deleteMutation.mutate({ quizId: id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() })
      })
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Quizz</h1>
          <p className="text-muted-foreground">Créez et organisez vos séries de questions.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nouveau</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium w-1/3">Titre</th>
              <th className="p-4 font-medium hidden md:table-cell">Cours</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium text-center">Questions</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center">Chargement...</td></tr>
            ) : quizzes?.map(q => (
              <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">
                  {q.title}
                  <div className="text-xs text-muted-foreground font-normal md:hidden mt-1">{q.courseName}</div>
                </td>
                <td className="p-4 hidden md:table-cell">{q.courseName}</td>
                <td className="p-4">
                  <Badge variant="outline">{q.evalTypeName}</Badge>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-full font-bold">
                    {q.questionCount}
                  </span>
                </td>
                <td className="p-4 text-right space-x-1">
                  <Button variant="ghost" size="icon" asChild title="Gérer les questions">
                    <Link href={`/admin/quizzes/${q.id}/questions`}>
                      <List className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {quizzes?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun quizz.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le quizz" : "Nouveau quizz"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: QCM Chapitre 1" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cours</Label>
                <Select value={formData.courseId} onValueChange={v => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type d'évaluation</Label>
                <Select value={formData.evalTypeId} onValueChange={v => setFormData({ ...formData, evalTypeId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {evalTypes?.map(et => <SelectItem key={et.id} value={et.id.toString()}>{et.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Consignes particulières..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending || !formData.title.trim() || !formData.courseId || !formData.evalTypeId}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
