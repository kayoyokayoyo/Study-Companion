import { useState, useEffect } from "react"
import { Bell, ExternalLink } from "lucide-react"
import { useListQuizzes } from "@workspace/api-client-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { formatDistanceToNow } from "@/lib/utils"

const KEY = "quiznet_notifications_seen_at"

export function NotificationBell() {
  const [seenAt, setSeenAt] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const { data: quizzes } = useListQuizzes()

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    // On very first visit, mark as seen now so we don't flood with "new" for all quizzes
    if (!stored) {
      localStorage.setItem(KEY, "0") // 0 = epoch → show all as new on first visit
    }
    setSeenAt(stored ? Number(stored) : 0)
  }, [])

  const newQuizzes = (quizzes || []).filter(
    (q) => new Date(q.createdAt).getTime() > seenAt
  )

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && newQuizzes.length > 0) {
      const now = Date.now()
      localStorage.setItem(KEY, String(now))
      setSeenAt(now)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="w-4 h-4" />
          {newQuizzes.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              {newQuizzes.length > 9 ? "9+" : newQuizzes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {newQuizzes.length > 0
              ? `${newQuizzes.length} nouveau${newQuizzes.length > 1 ? "x" : ""} quizz disponible${newQuizzes.length > 1 ? "s" : ""}`
              : "Aucune nouvelle notification"}
          </p>
        </div>
        {newQuizzes.length > 0 ? (
          <ul className="divide-y max-h-72 overflow-y-auto">
            {newQuizzes.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/courses/${q.courseId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{q.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {q.courseName} · {q.evalTypeName}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">
                      {formatDistanceToNow(q.createdAt)}
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-1" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tout est à jour</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
