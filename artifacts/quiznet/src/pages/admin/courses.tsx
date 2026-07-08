import { useState } from "react"
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, getListCoursesQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function AdminCourses() {
  const { data: courses, isLoading } = useListCourses()
  const queryClient = useQueryClient()
  
  const createMutation = useCreateCourse()
  const updateMutation = useUpdateCourse()
  const deleteMutation = useDeleteCourse()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({ name: "", description: "" })

  const openNew = () => {
    setEditingId(null)
    setFormData({ name: "", description: "" })
    setIsModalOpen(true)
  }

  const openEdit = (course: any) => {
    setEditingId(course.id)
    setFormData({ name: course.name, description: course.description || "" })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() })
      setIsModalOpen(false)
    }

    if (editingId) {
      updateMutation.mutate(
        { courseId: editingId, data: { name: formData.name, description: formData.description || null } },
        { onSuccess }
      )
    } else {
      createMutation.mutate(
        { data: { name: formData.name, description: formData.description || null } },
        { onSuccess }
      )
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce cours ?")) {
      deleteMutation.mutate({ courseId: id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() })
      })
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des cours</h1>
          <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des cours.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nouveau</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Nom</th>
              <th className="p-4 font-medium hidden md:table-cell">Description</th>
              <th className="p-4 font-medium">Statistiques</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center">Chargement...</td></tr>
            ) : courses?.map(c => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                  {c.description || "-"}
                </td>
                <td className="p-4 text-muted-foreground">
                  {c.quizCount} quizz, {c.questionCount} q.
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {courses?.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun cours.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le cours" : "Nouveau cours"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du cours</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Programmation Web" 
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du cours..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name.trim()}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
