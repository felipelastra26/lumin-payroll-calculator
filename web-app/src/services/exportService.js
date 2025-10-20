/**
 * Export Service
 * Handles PDF and Excel export functionality
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export payroll summary to PDF
 */
export function exportPayrollToPDF(payrollData) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Lumin Salon Payroll Report', 14, 20);
  
  // Pay period info
  doc.setFontSize(12);
  doc.text(`Pay Period: ${payrollData.dateRange}`, 14, 30);
  doc.text(`Pay Date: ${payrollData.payDate}`, 14, 37);
  doc.text(`Calculated: ${payrollData.calculationDate}`, 14, 44);
  
  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 14, 55);
  doc.setFontSize(11);
  doc.text(`Total Employees: ${payrollData.employeeCount}`, 14, 62);
  doc.text(`Total Hours: ${payrollData.totalHours}`, 14, 69);
  doc.text(`Total Payroll: $${payrollData.totalPayroll.toFixed(2)}`, 14, 76);
  
  // Employee table
  const tableData = payrollData.employees.map(emp => [
    emp.name,
    emp.position,
    emp.payStructure,
    emp.totalHours?.toFixed(2) || '0.00',
    `$${emp.week1Pay.toFixed(2)}`,
    `$${emp.week2Pay.toFixed(2)}`,
    `$${emp.totalPay.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 85,
    head: [['Employee', 'Position', 'Pay Type', 'Hours', 'Week 1', 'Week 2', 'Total Pay']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' }
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  const fileName = `Lumin_Payroll_${payrollData.dateRange.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Export employee detail to PDF
 */
export function exportEmployeeDetailToPDF(employeeData, payPeriod) {
  const doc = new jsPDF();
  const { fullDetails } = employeeData;
  
  // Title
  doc.setFontSize(20);
  doc.text(`Payroll Detail: ${employeeData.name}`, 14, 20);
  
  // Employee info
  doc.setFontSize(12);
  doc.text(`Position: ${employeeData.position}`, 14, 30);
  doc.text(`Pay Structure: ${employeeData.payStructure}`, 14, 37);
  doc.text(`Pay Period: ${new Date(payPeriod.startDate).toLocaleDateString()} - ${new Date(payPeriod.endDate).toLocaleDateString()}`, 14, 44);
  
  let yPos = 55;
  
  // Week 1
  doc.setFontSize(14);
  doc.text('Week 1', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.text(`Hours: ${fullDetails.week1.hours.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Hourly Pay: $${fullDetails.week1.hourlyPay.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Commission: $${fullDetails.week1.commissionPay.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Base Pay: $${fullDetails.week1.basePay.toFixed(2)} (${fullDetails.week1.basePayType})`, 14, yPos);
  yPos += 6;
  doc.text(`Tips: $${fullDetails.week1.tips.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Addings: $${fullDetails.week1.addings.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Discounts: -$${fullDetails.week1.discountDeduction.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.setFont(undefined, 'bold');
  doc.text(`Week 1 Total: $${fullDetails.week1.total.toFixed(2)}`, 14, yPos);
  doc.setFont(undefined, 'normal');
  yPos += 12;
  
  // Week 2
  doc.setFontSize(14);
  doc.text('Week 2', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.text(`Hours: ${fullDetails.week2.hours.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Hourly Pay: $${fullDetails.week2.hourlyPay.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Commission: $${fullDetails.week2.commissionPay.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Base Pay: $${fullDetails.week2.basePay.toFixed(2)} (${fullDetails.week2.basePayType})`, 14, yPos);
  yPos += 6;
  doc.text(`Tips: $${fullDetails.week2.tips.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Addings: $${fullDetails.week2.addings.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.text(`Discounts: -$${fullDetails.week2.discountDeduction.toFixed(2)}`, 14, yPos);
  yPos += 6;
  doc.setFont(undefined, 'bold');
  doc.text(`Week 2 Total: $${fullDetails.week2.total.toFixed(2)}`, 14, yPos);
  doc.setFont(undefined, 'normal');
  yPos += 12;
  
  // Adjustments
  if (fullDetails.adjustments && fullDetails.adjustments.length > 0) {
    doc.setFontSize(14);
    doc.text('Adjustments', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    fullDetails.adjustments.forEach(adj => {
      const sign = adj.type === 'bonus' ? '+' : '-';
      doc.text(`${sign}$${adj.amount.toFixed(2)} - ${adj.notes || adj.type}`, 14, yPos);
      yPos += 6;
    });
    yPos += 6;
  }
  
  // Final Total
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`FINAL PAY: $${fullDetails.finalPay.toFixed(2)}`, 14, yPos);
  
  // Save
  const fileName = `${employeeData.name.replace(/\s/g, '_')}_Payroll_Detail.pdf`;
  doc.save(fileName);
}

/**
 * Export payroll to Excel
 */
export function exportPayrollToExcel(payrollData) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Lumin Salon Payroll Report'],
    [],
    ['Pay Period:', payrollData.dateRange],
    ['Pay Date:', payrollData.payDate],
    ['Calculated:', payrollData.calculationDate],
    [],
    ['Total Employees:', payrollData.employeeCount],
    ['Total Hours:', payrollData.totalHours],
    ['Total Payroll:', payrollData.totalPayroll],
    []
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Employee details sheet
  const employeeData = [
    ['Employee', 'Position', 'Pay Structure', 'Total Hours', 'Week 1 Pay', 'Week 2 Pay', 'Adjustments', 'Total Pay']
  ];
  
  payrollData.employees.forEach(emp => {
    employeeData.push([
      emp.name,
      emp.position,
      emp.payStructure,
      emp.totalHours || 0,
      emp.week1Pay,
      emp.week2Pay,
      emp.totalAdjustments || 0,
      emp.totalPay
    ]);
  });
  
  const employeeWs = XLSX.utils.aoa_to_sheet(employeeData);
  
  // Set column widths
  employeeWs['!cols'] = [
    { wch: 20 }, // Employee
    { wch: 15 }, // Position
    { wch: 20 }, // Pay Structure
    { wch: 12 }, // Total Hours
    { wch: 12 }, // Week 1 Pay
    { wch: 12 }, // Week 2 Pay
    { wch: 12 }, // Adjustments
    { wch: 12 }  // Total Pay
  ];
  
  XLSX.utils.book_append_sheet(wb, employeeWs, 'Employee Details');
  
  // Save
  const fileName = `Lumin_Payroll_${payrollData.dateRange.replace(/\s/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export employee detail to Excel
 */
export function exportEmployeeDetailToExcel(employeeData, payPeriod) {
  const { fullDetails } = employeeData;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Employee info
  const infoData = [
    ['Employee Payroll Detail'],
    [],
    ['Employee:', employeeData.name],
    ['Position:', employeeData.position],
    ['Pay Structure:', employeeData.payStructure],
    ['Pay Period:', `${new Date(payPeriod.startDate).toLocaleDateString()} - ${new Date(payPeriod.endDate).toLocaleDateString()}`],
    []
  ];
  
  const infoWs = XLSX.utils.aoa_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, infoWs, 'Employee Info');
  
  // Week 1 breakdown
  const week1Data = [
    ['Week 1 Breakdown'],
    [],
    ['Hours:', fullDetails.week1.hours],
    ['Hourly Pay:', fullDetails.week1.hourlyPay],
    ['Commission:', fullDetails.week1.commissionPay],
    ['Base Pay:', fullDetails.week1.basePay],
    ['Tips:', fullDetails.week1.tips],
    ['Addings:', fullDetails.week1.addings],
    ['Discounts:', -fullDetails.week1.discountDeduction],
    ['Week 1 Total:', fullDetails.week1.total],
    []
  ];
  
  const week1Ws = XLSX.utils.aoa_to_sheet(week1Data);
  XLSX.utils.book_append_sheet(wb, week1Ws, 'Week 1');
  
  // Week 2 breakdown
  const week2Data = [
    ['Week 2 Breakdown'],
    [],
    ['Hours:', fullDetails.week2.hours],
    ['Hourly Pay:', fullDetails.week2.hourlyPay],
    ['Commission:', fullDetails.week2.commissionPay],
    ['Base Pay:', fullDetails.week2.basePay],
    ['Tips:', fullDetails.week2.tips],
    ['Addings:', fullDetails.week2.addings],
    ['Discounts:', -fullDetails.week2.discountDeduction],
    ['Week 2 Total:', fullDetails.week2.total],
    []
  ];
  
  const week2Ws = XLSX.utils.aoa_to_sheet(week2Data);
  XLSX.utils.book_append_sheet(wb, week2Ws, 'Week 2');
  
  // Save
  const fileName = `${employeeData.name.replace(/\s/g, '_')}_Payroll_Detail.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export default {
  exportPayrollToPDF,
  exportEmployeeDetailToPDF,
  exportPayrollToExcel,
  exportEmployeeDetailToExcel
};

