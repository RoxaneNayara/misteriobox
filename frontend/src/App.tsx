import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { CatalogPage } from './pages/CatalogPage';
import { HistoryPage } from './pages/HistoryPage';
import { InvestigationPage } from './pages/investigation/InvestigationPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResultPage } from './pages/ResultPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/investigacoes/:investigationId" element={<InvestigationPage />} />
          <Route path="/investigacoes/:investigationId/resultado" element={<ResultPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
