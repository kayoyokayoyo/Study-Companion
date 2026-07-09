import { Link } from "wouter"
import { GraduationCap, BookOpen, LayoutGrid, ListChecks, Zap, Users, ArrowLeft, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const FEATURES = [
  {
    icon: <LayoutGrid className="w-5 h-5 text-primary" />,
    title: "QCM & Réponses directes",
    desc: "Deux types de questions au sein d'un même quizz pour s'entraîner dans les conditions réelles.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-secondary" />,
    title: "Mode Lecture",
    desc: "Révisez toutes les questions et leurs réponses attendues avant de vous lancer.",
  },
  {
    icon: <ListChecks className="w-5 h-5 text-blue-500" />,
    title: "Organisé par cours",
    desc: "Chaque quizz est rattaché à un cours et un type d'évaluation (examen, TD, interrogation…).",
  },
  {
    icon: <Zap className="w-5 h-5 text-violet-500" />,
    title: "Suggestions",
    desc: "Les étudiants peuvent soumettre des idées d'amélioration directement depuis l'app.",
  },
]

const TEAM = [
  {
    name: "Créateur principal",
    role: "Développeur & Designer",
    initials: "CP",
    color: "bg-primary",
  },
  {
    name: "Collaborateur",
    role: "Contenu & Questions",
    initials: "CO",
    color: "bg-secondary",
  },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-14 md:py-20 space-y-6">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Link>
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">QuizNET</h1>
              <p className="text-muted-foreground mt-1">La plateforme de révision pour les étudiants</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            QuizNET est une application web de révision sous forme de quizz, pensée pour les étudiants.
            Elle permet de s'entraîner sur des QCM et des questions à réponse directe, organisés par cours
            et type d'évaluation.
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1">React + Vite</Badge>
            <Badge variant="secondary" className="px-3 py-1">Python Flask</Badge>
            <Badge variant="secondary" className="px-3 py-1">SQLite</Badge>
            <Badge variant="secondary" className="px-3 py-1">PythonAnywhere</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-10 py-12 space-y-16">
        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Fonctionnalités</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-card border rounded-2xl p-5 space-y-3 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Comment ça marche ?</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Choisissez un cours", desc: "Naviguez dans le catalogue et sélectionnez le cours qui vous intéresse." },
              { step: "02", title: "Sélectionnez un quizz", desc: "Chaque cours contient plusieurs quizz classés par type d'évaluation." },
              { step: "03", title: "Entraînez-vous", desc: "Répondez aux questions, obtenez un feedback immédiat avec les explications." },
              { step: "04", title: "Révisez en mode Lecture", desc: "Consultez toutes les réponses pour consolider vos connaissances." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Équipe</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEAM.map((member, i) => (
              <div key={i} className="bg-card border rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${member.color} text-white font-bold text-lg flex items-center justify-center shrink-0`}>
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            ✏️ Pour personnaliser cette page avec vos vrais noms, modifiez le tableau <code className="bg-muted px-1 rounded text-xs">TEAM</code> dans <code className="bg-muted px-1 rounded text-xs">src/pages/public/about.tsx</code>.
          </p>
        </section>

        {/* Source */}
        <section className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Code source</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Le projet est hébergé sur GitHub. N'hésitez pas à contribuer ou à signaler un bug.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <a href="https://github.com/kayoyokayoyo/Study-Companion" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </Button>
        </section>
      </div>
    </div>
  )
}
