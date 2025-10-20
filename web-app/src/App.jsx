import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { PayrollProvider } from './contexts/PayrollContext';
import FileUploadDashboard from './pages/file-upload-dashboard';
import PayrollSummaryResults from './pages/payroll-summary-results';
import EmployeeDetailBreakdown from './pages/employee-detail-breakdown';
import ManualAdjustments from './pages/manual-adjustments';
import EmployeeConfiguration from './pages/employee-configuration';
import NotFound from './pages/NotFound';

function App() {
  return (
    // <PayrollProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<FileUploadDashboard />} />
        <Route path="/payroll-summary-results" element={<PayrollSummaryResults />} />
        <Route path="/employee-detail-breakdown" element={<EmployeeDetailBreakdown />} />
        <Route path="/manual-adjustments" element={<ManualAdjustments />} />
        <Route path="/employee-configuration" element={<EmployeeConfiguration />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    // </PayrollProvider>
  );
}

export default App;