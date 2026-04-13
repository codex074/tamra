import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminPage } from '@/pages/AdminPage';
import { DoseCalculatorPage } from '@/pages/DoseCalculatorPage';
import { DrugFormularyPage } from '@/pages/DrugFormularyPage';
import { IVCompatPage } from '@/pages/IVCompatPage';
import { LoginPage } from '@/pages/LoginPage';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/formulary" replace />} />
        <Route path="formulary" element={<DrugFormularyPage />} />
        <Route path="dose-calculator" element={<DoseCalculatorPage />} />
        <Route path="iv-compatibility" element={<IVCompatPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
