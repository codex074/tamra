import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminPage } from '@/pages/AdminPage';
import { DoseCalculatorPage } from '@/pages/DoseCalculatorPage';
import { DrugFormularyPage } from '@/pages/DrugFormularyPage';
import { InjectableDrugPage } from '@/pages/InjectableDrugPage';
import { ClinicLandingPage } from '@/pages/ClinicLandingPage';
import { LoginPage } from '@/pages/LoginPage';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/clinic" element={<ClinicLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/formulary" replace />} />
        <Route path="formulary" element={<DrugFormularyPage />} />
        <Route path="dose-calculator" element={<DoseCalculatorPage />} />
        <Route path="injectable-drugs" element={<InjectableDrugPage />} />
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
