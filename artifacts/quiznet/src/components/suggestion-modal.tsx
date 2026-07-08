import { useState } from "react"
import { MessageSquarePlus, Send, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

export function SuggestionModal({ variant = "sidebar" }: { variant?: "sidebar" | "inline" }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}/api/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() || null, email: email.trim() || null, message: message.trim() }),
      })
      if (!res.ok) throw new Error("Erreur serveur")
      setSent(true)
      setTimeout(() => {
        setOpen(false)
        setSent(false)
        setName("")
        setEmail("")
        setMessage("")
      }, 2500)
    } catch {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (v: boolean) => {
    if (!loading) {
      setOpen(v)
      if (!v) { setSent(false); setError(null) }
    }
  }

  return (
    <>
      {variant === "sidebar" ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          <span>Suggérer une amélioration</span>
        </button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
          <MessageSquarePlus className="w-4 h-4" /> Suggérer
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {sent ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-bold">Merci pour votre suggestion !</h3>
              <p className="text-muted-foreground text-sm">Elle a bien été transmise à l'équipe.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-primary" />
                  Suggérer une amélioration
                </DialogTitle>
                <DialogDescription>
                  Une idée, un bug, une demande de cours ? Dites-le nous !
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sug-name">Nom <span className="text-muted-foreground">(optionnel)</span></Label>
                    <Input
                      id="sug-name"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sug-email">Email <span className="text-muted-foreground">(optionnel)</span></Label>
                    <Input
                      id="sug-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sug-message">Message <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="sug-message"
                    placeholder="Décrivez votre suggestion, idée ou problème..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={!message.trim() || loading} className="gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? "Envoi..." : "Envoyer"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
