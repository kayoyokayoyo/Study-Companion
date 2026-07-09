import { useState } from "react"
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

export function AdminSettings() {
  const [current, setCurrent]     = useState("")
  const [next, setNext]           = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (next !== confirm) {
      setError("Les nouveaux mots de passe ne correspondent pas.")
      return
    }
    if (next.length < 6) {
      setError("Le nouveau mot de passe doit faire au moins 6 caractères.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/auth/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erreur inconnue")
      } else {
        setSuccess(true)
        setCurrent("")
        setNext("")
        setConfirm("")
      }
    } catch {
      setError("Impossible de joindre le serveur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration de l'espace administrateur.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Changer le mot de passe admin</CardTitle>
              <CardDescription>Le nouveau mot de passe sera actif immédiatement.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showPwd ? "text" : "password"}
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new">Nouveau mot de passe</Label>
              <Input
                id="new"
                type={showPwd ? "text" : "password"}
                value={next}
                onChange={e => setNext(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirm"
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4" />
                Mot de passe mis à jour avec succès.
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
