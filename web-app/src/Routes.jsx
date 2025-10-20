import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import EmployeeDetailBreakdown from './pages/employee-detail-breakdown';
import ManualAdjustments from './pages/manual-adjustments';
import FileUploadDashboard from './pages/file-upload-dashboard';
import EmployeeConfiguration from './pages/employee-configuration';
import PayrollSummaryResults from './pages/payroll-summary-results';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<FileUploadDashboard />} />
        <Route path="/employee-detail-breakdown" element={<EmployeeDetailBreakdown />} />
        <Route path="/manual-adjustments" element={<ManualAdjustments />} />
        <Route path="/file-upload-dashboard" element={<FileUploadDashboard />} />
        <Route path="/employee-configuration" element={<EmployeeConfiguration />} />
        <Route path="/payroll-summary-results" element={<PayrollSummaryResults />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
