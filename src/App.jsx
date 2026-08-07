import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ChatPage from './pages/ChatPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { useThemeStore } from './store/themeStore';
import { IconCalendar, IconColumns, IconListCheck, IconMessage, IconSettings } from '@tabler/icons-react';
import { useChatStore } from './store/chatStore';
import { useTasksStore } from './store/tasksStore';
import { useCalendarStore } from './store/calendarStore';
import { useKanbanStore } from './store/kanbanStore';
import ErrorBanner from './components/ui/ErrorBanner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import { useAuth } from './context/AuthContext';

const routeMeta = {
  '/chat': { title: 'Chat', icon: IconMessage },
  '/calendar': { title: 'Calendario', icon: IconCalendar },
  '/tasks': { title: 'Tareas', icon: IconListCheck },
  '/kanban': { title: 'Kanban', icon: IconColumns },
  '/settings': { title: 'Ajustes', icon: IconSettings },
};

function ThemeSync() {
  const { theme, accent } = useThemeStore();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.classList.toggle('accent-warm', accent === 'warm');
    html.classList.toggle('accent-cool', accent === 'cool');
  }, [theme, accent]);

  return null;
}

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-surface-0 text-text-secondary">Cargando...</div>;
  }

  return <Navigate to={isAuthenticated ? '/chat' : '/welcome'} replace />;
}

function AppShell() {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useThemeStore();
  const currentMeta = routeMeta[location.pathname] || routeMeta['/chat'];
  const chatError = useChatStore((state) => state.error);
  const tasksError = useTasksStore((state) => state.error);
  const calendarError = useCalendarStore((state) => state.error);
  const kanbanError = useKanbanStore((state) => state.error);
  const fetchChat = useChatStore((state) => state.fetchMessages);
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const fetchCalendar = useCalendarStore((state) => state.fetchEvents);
  const fetchKanban = useKanbanStore((state) => state.fetchCards);

  const errorMessage = useMemo(() => {
    const messages = [chatError, tasksError, calendarError, kanbanError].filter(Boolean);
    return messages.length ? messages.join(' · ') : null;
  }, [chatError, tasksError, calendarError, kanbanError]);

  const retryAll = () => {
    fetchChat();
    fetchTasks();
    fetchCalendar(7, 2026);
    fetchKanban();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-text-primary transition-colors duration-200">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={currentMeta.title} Icon={currentMeta.icon} onMenuClick={toggleSidebar} />
        {errorMessage ? <ErrorBanner message={errorMessage} onRetry={retryAll} /> : null}
        <section className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}