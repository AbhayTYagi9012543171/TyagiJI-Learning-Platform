import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout.jsx';
import AppErrorBoundary from '../components/common/AppErrorBoundary.jsx';
import CareerPage from '../pages/career/CareerPage.jsx';
import FAQPage from '../pages/public/FAQPage.jsx';
import { AuthGuard, AdminGuard } from '../components/Guards.jsx';
import {
  HomePage, CoursesPage, CourseDetailsPage, LessonPage,
  ProjectsPage, ProjectDetailsPage, ResourcesPage, GlossaryPage,
  CheatsheetsPage, PlaygroundPage, AboutPage, AchievementsPage,
  AuthPage, DashboardPage, BookmarksPage, ProgressPage, SettingsPage,
  ProfilePage, QuizPage, AdminPage, LegalInfoPage,
  ForgotPasswordPage, ResetPasswordPage, NotFoundPage,
} from '../pages/index.js';

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:slug" element={<CourseDetailsPage />} />
        <Route path="courses/:course/lessons/:lesson" element={<AuthGuard><LessonPage /></AuthGuard>} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="glossary" element={<GlossaryPage />} />
        <Route path="cheatsheets" element={<CheatsheetsPage />} />
        <Route path="playground" element={<PlaygroundPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="achievements" element={<AuthGuard><AchievementsPage /></AuthGuard>} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="career" element={<AuthGuard><CareerPage /></AuthGuard>} />
        <Route path="my-learning" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="bookmarks" element={<AuthGuard><BookmarksPage /></AuthGuard>} />
        <Route path="progress" element={<AuthGuard><ProgressPage /></AuthGuard>} />
        <Route path="settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
        <Route path="profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
        <Route path="quiz/:id" element={<AuthGuard><QuizPage /></AuthGuard>} />
        <Route path="quiz/:id/results" element={<AuthGuard><QuizPage /></AuthGuard>} />
        <Route path="admin/*" element={<AdminGuard><AdminPage /></AdminGuard>} />
        <Route path="privacy" element={<LegalInfoPage title="Privacy information" text="This starter policy should be reviewed by the operator. The platform stores account details, bookmarks, learning progress, and quiz attempts to provide features." />} />
        <Route path="terms" element={<LegalInfoPage title="Terms of use" text="Learning materials are educational. Review these starter terms with a qualified adviser before public launch." />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Routes>
    </AppErrorBoundary>
  );
}
