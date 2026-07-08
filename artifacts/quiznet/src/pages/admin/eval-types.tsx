import { useState } from "react"
import { useListEvalTypes, useCreateEvalType, useUpdateEvalType, useDeleteEvalType, getListEvalTypesQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function AdminEvalTypes() {
  const { data: evalTypes, isLoading } = useListEvalTypes()
  const queryClient = useQueryClient()
  
  const createMutation = useCreateEvalType()
  const updateMutation = useUpdateEvalType()
  const deleteMutation = useDeleteEvalType()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState("")

  const openNew = () => {
    setEditingId(null)
    setName("")
    setIsModalOpen(true)
  }

  const openEdit = (et: any) => {
    setEditingId(et.id)
    setName(et.name)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) return

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListEvalTypesQueryKey() })
      setIsModalOpen(false)
    }

    if (editingId) {
      updateMutation.mutate({ evalTypeId: editingId, data: { name } }, { onSuccess })
    } else {
      createMutation.mutate({ data: { name } }, { onSuccess })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce type d'évaluation ?")) {
      deleteMutation.mutate({ evalTypeId: id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEvalTypesQueryKey() })
      })
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Types d'évaluation</h1>
          <p className="text-muted-foreground">Gérez les étiquettes pour vos quizz (Examen, TD, TP, etc).</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nouveau</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Nom</th>
              <th className="p-4 font-medium text-center">Quizz associés</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={3} className="p-8 text-center">Chargement...</td></tr>
            ) : evalTypes?.map(et => (
              <tr key={et.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{et.name}</td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                    {et.quizCount}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(et)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(et.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {evalTypes?.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Aucun type.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le type" : "Nouveau type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Examen Final" 
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
