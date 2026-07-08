import { useGetAuthMe, getGetAuthMeQueryKey, useLogin } from "@workspace/api-client-react"
import { useLocation, Redirect } from "wouter"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminLogin() {
  const { data: auth, isLoading } = useGetAuthMe()
  const login = useLogin()
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  if (isLoading) return null
  
  if (auth?.isAdmin) {
    return <Redirect to="/admin/dashboard" />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    login.mutate(
      { data: { password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() })
          setLocation("/admin/dashboard")
        },
        onError: () => {
          setError("Mot de passe incorrect")
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Administration</CardTitle>
          <CardDescription>
            Veuillez vous authentifier pour accéder à l'espace administrateur de QuizNET.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  className="pl-10 h-12 text-lg"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive font-medium pl-1">{error}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium" 
              disabled={login.isPending || !password}
            >
              {login.isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
