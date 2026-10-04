import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  exportStudentsToExcel,
  exportComplaintsToExcel,
  exportStaffToExcel,
  exportDepartmentsToExcel,
  exportReportToExcel,
  downloadExcelTemplate,
  parseExcelFile,
  ImportValidationResult,
} from '../../utils/excel';

export const ExcelManagement: React.FC = () => {
  const {
    currentInstitution,
    users,
    complaints,
    departments,
    categories,
    importBulkData,
  } = useApp();

  const [importType, setImportType] = useState<'students' | 'staff' | 'departments' | 'categories'>('students');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult<any> | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  if (!currentInstitution) return null;

  const instStudents = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'student');
  const instStaff = users.filter(u => u.institutionId === currentInstitution.id && u.role === 'staff');
  const instComplaints = complaints.filter(c => c.institutionId === currentInstitution.id);
  const instDepts = departments.filter(d => d.institutionId === currentInstitution.id);
  const instCats = categories.filter(c => c.institutionId === currentInstitution.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImportSuccessCount(null);
      setIsValidating(true);

      try {
        const result = await parseExcelFile(
          file,
          importType,
          instDepts,
          users,
          instCats
        );
        setValidationResult(result);
      } catch (err: any) {
        alert(`Failed to parse file: ${err.message || 'Ensure it is a valid .xlsx or .xls file.'}`);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult || validationResult.valid.length === 0) return;
    const count = importBulkData(importType, validationResult.valid);
    setImportSuccessCount(count);
    setValidationResult(null);
    setSelectedFile(null);
  };

  const handleResetImport = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportSuccessCount(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Excel & Data Management Center</h1>
            <p className="text-xs text-slate-500">
              Export system records into formatted .xlsx workbooks or bulk import roster data with pre-flight verification.
            </p>
          </div>
        </div>
      </div>

      {/* EXPORT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Export System Data (.xlsx)</h2>
            <p className="text-xs text-slate-500">
              Download standard institutional records in Excel format for offline analysis or board reporting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Export Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export Students</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Full roster with Matric number, department, level, and registration status.
              </p>
              <span className="block text-xs font-mono font-semibold text-slate-700 mt-3">
                {instStudents.length} Students
              </span>
            </div>
            <button
              onClick={() => exportStudentsToExcel(instStudents, instDepts, currentInstitution)}
              className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Export Complaints */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export Complaints Log</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Comprehensive ticket registry including resolution memos, timeline, and staff assignment.
              </p>
              <span className="block text-xs font-mono font-semibold text-slate-700 mt-3">
                {instComplaints.length} Complaints
              </span>
            </div>
            <button
              onClick={() => exportComplaintsToExcel(instComplaints, instDepts, instCats, currentInstitution)}
              className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Export Staff */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export Staff Roster</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Active desk officers, assigned departments, staff IDs, and designations.
              </p>
              <span className="block text-xs font-mono font-semibold text-slate-700 mt-3">
                {instStaff.length} Staff Officers
              </span>
            </div>
            <button
              onClick={() => exportStaffToExcel(instStaff, instDepts, currentInstitution)}
              className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Export Departments */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export Departments</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Academic schools, faculties, departmental codes, and operational status.
              </p>
              <span className="block text-xs font-mono font-semibold text-slate-700 mt-3">
                {instDepts.length} Departments
              </span>
            </div>
            <button
              onClick={() => exportDepartmentsToExcel(instDepts, currentInstitution)}
              className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Generate Performance Report */}
          <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Executive Summary Report</span>
              <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                Multi-sheet workbook with resolution rates, category distributions, and unit trends.
              </p>
              <span className="block text-xs font-mono font-semibold text-emerald-800 mt-3">
                Full Analytics (.xlsx)
              </span>
            </div>
            <button
              onClick={() => exportReportToExcel(instComplaints, instDepts, instCats, currentInstitution)}
              className="mt-4 w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXCEL IMPORT SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Import Data from Excel (.xlsx)</h2>
          <p className="text-xs text-slate-500">
            Upload institutional spreadsheets. The system validates mandatory fields, duplicate IDs/emails, and departmental validity before writing to the database.
          </p>
        </div>

        {/* Import Type Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            {[
              { id: 'students', label: 'Students Roster' },
              { id: 'staff', label: 'Staff Officers' },
              { id: 'departments', label: 'Departments' },
              { id: 'categories', label: 'Complaint Categories' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setImportType(tab.id as any);
                  handleResetImport();
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  importType === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => downloadExcelTemplate(importType)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {importType.slice(0, -1)} Template (.xlsx)</span>
          </button>
        </div>

        {/* Successful Import Alert */}
        {importSuccessCount !== null && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Import Successful!</strong> Safely ingested{' '}
                <strong>{importSuccessCount}</strong> new {importType} into the system database with complete audit logging.
              </span>
            </div>
            <button
              onClick={handleResetImport}
              className="text-xs font-semibold text-emerald-900 underline hover:no-underline"
            >
              Upload Another
            </button>
          </div>
        )}

        {/* File Drag and Drop Zone */}
        {!validationResult && importSuccessCount === null && (
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">Upload {importType} Spreadsheet</h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Drag and drop your populated template (.xlsx, .xls) here. Columns must match the official template header structure.
            </p>
            <label className="inline-block px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer shadow-xs transition-colors">
              {isValidating ? 'Validating File Structure...' : 'Choose Excel File'}
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                disabled={isValidating}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Validation Results & Preview Table */}
        {validationResult && (
          <div className="space-y-5">
            {/* KPI Summary of Validation */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-400 block text-[11px]">Total Rows in File</span>
                <span className="text-xl font-bold font-mono text-slate-900">{validationResult.totalRows}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <span className="text-emerald-600 block text-[11px]">Valid & Ready to Import</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{validationResult.valid.length}</span>
              </div>
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                <span className="text-amber-700 block text-[11px]">Duplicate Records (Skipped)</span>
                <span className="text-xl font-bold font-mono text-amber-800">{validationResult.duplicates.length}</span>
              </div>
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                <span className="text-rose-700 block text-[11px]">Invalid Rows (Errors)</span>
                <span className="text-xl font-bold font-mono text-rose-800">{validationResult.invalid.length}</span>
              </div>
            </div>

            {/* Error or Duplicates callout if any */}
            {(validationResult.invalid.length > 0 || validationResult.duplicates.length > 0) && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Validation Notice:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                  {validationResult.invalid.slice(0, 3).map((inv, idx) => (
                    <li key={idx}>
                      Row {inv.rowNumber}: <span className="text-rose-700">{inv.reason}</span>
                    </li>
                  ))}
                  {validationResult.duplicates.slice(0, 3).map((dup, idx) => (
                    <li key={idx}>
                      Row {dup.rowNumber}: <span className="text-amber-700">{dup.reason}</span>
                    </li>
                  ))}
                  {(validationResult.invalid.length > 3 || validationResult.duplicates.length > 3) && (
                    <li>...and more skipped entries (only verified unique rows will be imported).</li>
                  )}
                </ul>
              </div>
            )}

            {/* Preview of Valid Records */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                Preview Verified Rows ({validationResult.valid.length})
              </h3>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Identifier</th>
                      <th className="py-2.5 px-3">Name / Label</th>
                      <th className="py-2.5 px-3">Email / Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validationResult.valid.slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                          {r.studentId || r.staffId || r.code || 'Auto-generated'}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">{r.name}</td>
                        <td className="py-2 px-3 text-slate-600">{r.email || r.description || r.faculty || '—'}</td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold text-[11px]">Ready</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirm Import Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetImport}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Discard & Upload Different File
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={validationResult.valid.length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Ingest ({validationResult.valid.length}) Records</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
