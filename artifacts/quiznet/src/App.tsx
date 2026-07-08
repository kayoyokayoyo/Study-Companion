import { lazy, Suspense } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter'
import { useGetAuthMe } from "@workspace/api-client-react"
import { useQuery } from "@tanstack/react-query"

import { StudentLayout, AdminLayout } from '@/layouts'

// Lazy-loaded pages
const StudentHome       = lazy(() => import('@/pages/public/home').then(m => ({ default: m.StudentHome })))
const StudentCourses    = lazy(() => import('@/pages/public/courses').then(m => ({ default: m.StudentCourses })))
const StudentCourseDetail = lazy(() => import('@/pages/public/course-detail').then(m => ({ default: m.StudentCourseDetail })))
const StudentTrainQuiz  = lazy(() => import('@/pages/public/train').then(m => ({ default: m.StudentTrainQuiz })))
const StudentReadQuiz   = lazy(() => import('@/pages/public/read').then(m => ({ default: m.StudentReadQuiz })))

const AdminLogin        = lazy(() => import('@/pages/admin/login').then(m => ({ default: m.AdminLogin })))
const AdminDashboard    = lazy(() => import('@/pages/admin/dashboard').then(m => ({ default: m.AdminDashboard })))
const AdminCourses      = lazy(() => import('@/pages/admin/courses').then(m => ({ default: m.AdminCourses })))
const AdminEvalTypes    = lazy(() => import('@/pages/admin/eval-types').then(m => ({ default: m.AdminEvalTypes })))
const AdminQuizzes      = lazy(() => import('@/pages/admin/quizzes').then(m => ({ default: m.AdminQuizzes })))
const AdminQuestions    = lazy(() => import('@/pages/admin/questions').then(m => ({ default: m.AdminQuestions })))
const AdminSuggestions  = lazy(() => import('@/pages/admin/suggestions').then(m => ({ default: m.AdminSuggestions })))
const NotFound          = lazy(() => import('@/pages/not-found'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — avoids redundant refetches
      gcTime:    1000 * 60 * 10,  // 10 min cache retention
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

function PageLoader() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: auth, isLoading } = useGetAuthMe()
  const [, setLocation] = useLocation()

  if (isLoading) return <PageLoader />
  if (!auth?.isAdmin) {
    setLocation('/admin')
    return null
  }
  return <Component />
}

function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: suggestions } = useQuery({
    queryKey: ['suggestions-unread'],
    queryFn: () =>
      fetch(`${BASE}/api/suggestions`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then((data: { isRead: boolean }[]) => data.filter(s => !s.isRead).length),
    staleTime: 1000 * 30,
  })

  return <AdminLayout unreadSuggestions={suggestions ?? 0}>{children}</AdminLayout>
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Admin Login */}
        <Route path="/admin">
          <AdminLogin />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/dashboard">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminDashboard} />
          </AdminLayoutWrapper>
        </Route>
        <Route path="/admin/courses">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminCourses} />
          </AdminLayoutWrapper>
        </Route>
        <Route path="/admin/eval-types">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminEvalTypes} />
          </AdminLayoutWrapper>
        </Route>
        <Route path="/admin/quizzes">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminQuizzes} />
          </AdminLayoutWrapper>
        </Route>
        <Route path="/admin/quizzes/:quizId/questions">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminQuestions} />
          </AdminLayoutWrapper>
        </Route>
        <Route path="/admin/suggestions">
          <AdminLayoutWrapper>
            <ProtectedAdminRoute component={AdminSuggestions} />
          </AdminLayoutWrapper>
        </Route>

        {/* Full-screen quiz modes */}
        <Route path="/quiz/:quizId/train">
          <StudentTrainQuiz />
        </Route>
        <Route path="/quiz/:quizId/read">
          <StudentReadQuiz />
        </Route>

        {/* Student Routes */}
        <Route path="/">
          <StudentLayout>
            <StudentHome />
          </StudentLayout>
        </Route>
        <Route path="/courses">
          <StudentLayout>
            <StudentCourses />
          </StudentLayout>
        </Route>
        <Route path="/courses/:courseId">
          <StudentLayout>
            <StudentCourseDetail />
          </StudentLayout>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
