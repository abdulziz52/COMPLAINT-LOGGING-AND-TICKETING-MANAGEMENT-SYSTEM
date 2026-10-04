import * as XLSX from 'xlsx';
import { User, Complaint, Department, ComplaintCategory, Institution } from '../types';

/**
 * Downloads a workbook as an actual .xlsx file
 */
export function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { bookType: 'xlsx', type: 'binary' });
}

/**
 * Export Students to Excel
 */
export function exportStudentsToExcel(
  students: User[],
  departments: Department[],
  institution: Institution
) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));

  const rows = students.map(s => ({
    'Student ID / Matric': s.studentId || 'N/A',
    'Full Name': s.name,
    'Email Address': s.email,
    'Phone Number': s.phone || 'N/A',
    'Institution': institution.name,
    'Faculty / School': s.faculty || 'N/A',
    'Department': s.departmentId ? deptMap.get(s.departmentId) || s.departmentId : 'N/A',
    'Programme / Course': s.programme || 'N/A',
    'Level': s.level || 'N/A',
    'Registration Date': new Date(s.createdAt).toLocaleDateString(),
    'Account Status': s.status.toUpperCase(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  const safeName = institution.abbreviation.replace(/\s+/g, '_');
  downloadWorkbook(workbook, `${safeName}_Students_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export Complaints to Excel
 */
export function exportComplaintsToExcel(
  complaints: Complaint[],
  departments: Department[],
  categories: ComplaintCategory[],
  institution: Institution
) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  const rows = complaints.map(c => ({
    'Ticket Number': c.ticketNumber,
    'Student Name': c.studentName,
    'Student ID': c.studentMatricNo,
    'Student Email': c.studentEmail,
    'Institution': institution.name,
    'Department': deptMap.get(c.departmentId) || c.departmentId,
    'Category': catMap.get(c.categoryId) || c.categoryId,
    'Complaint Title': c.title,
    'Description': c.description,
    'Priority': c.priority.toUpperCase(),
    'Status': c.status.replace(/_/g, ' ').toUpperCase(),
    'Assigned Staff': c.assignedStaffName || 'Unassigned',
    'Related Course': c.relatedCourse || 'N/A',
    'Semester / Session': c.semesterSession || 'N/A',
    'Date Submitted': new Date(c.createdAt).toLocaleString(),
    'Last Updated': new Date(c.updatedAt).toLocaleString(),
    'Resolution Date': c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : 'N/A',
    'Resolution Summary': c.resolution || 'Pending Resolution',
    'Closed Date': c.closedAt ? new Date(c.closedAt).toLocaleString() : 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints');

  const safeName = institution.abbreviation.replace(/\s+/g, '_');
  downloadWorkbook(workbook, `${safeName}_Complaints_Log_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export Staff to Excel
 */
export function exportStaffToExcel(
  staffList: User[],
  departments: Department[],
  institution: Institution
) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));

  const rows = staffList.map(s => ({
    'Staff ID': s.staffId || 'N/A',
    'Full Name': s.name,
    'Email Address': s.email,
    'Phone Number': s.phone || 'N/A',
    'Institution': institution.name,
    'Department': s.departmentId ? deptMap.get(s.departmentId) || s.departmentId : 'N/A',
    'Designation / Role': s.staffRole || 'Desk Officer',
    'Status': s.status.toUpperCase(),
    'Date Registered': new Date(s.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff_List');

  const safeName = institution.abbreviation.replace(/\s+/g, '_');
  downloadWorkbook(workbook, `${safeName}_Staff_Roster_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export Departments to Excel
 */
export function exportDepartmentsToExcel(
  departments: Department[],
  institution: Institution
) {
  const rows = departments.map(d => ({
    'Department Code': d.code,
    'Department Name': d.name,
    'Faculty / School': d.faculty || 'General',
    'Institution': institution.name,
    'Status': d.status.toUpperCase(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');

  const safeName = institution.abbreviation.replace(/\s+/g, '_');
  downloadWorkbook(workbook, `${safeName}_Departments_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export Analytics Report to Excel
 */
export function exportReportToExcel(
  complaints: Complaint[],
  departments: Department[],
  categories: ComplaintCategory[],
  institution: Institution
) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  // Sheet 1: Summary KPI
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
  const pending = complaints.filter(c => c.status === 'pending' || c.status === 'submitted' || c.status === 'under_review').length;
  const resolutionRate = total > 0 ? `${((resolved / total) * 100).toFixed(1)}%` : '0%';

  const summaryData = [
    { Metric: 'Institution Name', Value: institution.name },
    { Metric: 'Report Date', Value: new Date().toLocaleDateString() },
    { Metric: 'Total Complaints Logged', Value: total },
    { Metric: 'Pending / Under Review', Value: pending },
    { Metric: 'Active In Progress', Value: inProgress },
    { Metric: 'Resolved & Closed Complaints', Value: resolved },
    { Metric: 'Resolution Rate', Value: resolutionRate },
  ];

  // Sheet 2: Complaints by Category
  const catCounts: Record<string, number> = {};
  complaints.forEach(c => {
    const name = catMap.get(c.categoryId) || 'Uncategorized';
    catCounts[name] = (catCounts[name] || 0) + 1;
  });
  const catRows = Object.entries(catCounts).map(([cat, count]) => ({
    'Complaint Category': cat,
    'Total Complaints': count,
    'Percentage': total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%',
  }));

  // Sheet 3: Complaints by Department
  const deptCounts: Record<string, number> = {};
  complaints.forEach(c => {
    const name = deptMap.get(c.departmentId) || 'General';
    deptCounts[name] = (deptCounts[name] || 0) + 1;
  });
  const deptRows = Object.entries(deptCounts).map(([dept, count]) => ({
    'Department': dept,
    'Complaints Received': count,
    'Percentage': total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%',
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), 'Executive_Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(catRows), 'By_Category');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(deptRows), 'By_Department');

  const safeName = institution.abbreviation.replace(/\s+/g, '_');
  downloadWorkbook(workbook, `${safeName}_Performance_Report_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Generate Excel Blank Template with headers and sample guidelines
 */
export function downloadExcelTemplate(type: 'students' | 'staff' | 'departments' | 'categories') {
  const workbook = XLSX.utils.book_new();

  if (type === 'students') {
    const headers = [
      {
        'Student ID': 'STU/2026/001',
        'Full Name': 'John Doe',
        'Email': 'john.doe@student.institution.edu.ng',
        'Phone': '+234 800 123 4567',
        'Department': 'Computer Science',
        'Faculty': 'School of Science',
        'Programme': 'National Diploma',
        'Level': 'ND I',
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(headers), 'Students_Template');
    downloadWorkbook(workbook, 'Student_Import_Template');
  } else if (type === 'staff') {
    const headers = [
      {
        'Staff ID': 'STF-010',
        'Full Name': 'Dr. Sarah Wilson',
        'Email': 's.wilson@institution.edu.ng',
        'Phone': '+234 801 234 5678',
        'Department': 'Computer Science',
        'Role': 'Examination Officer',
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(headers), 'Staff_Template');
    downloadWorkbook(workbook, 'Staff_Import_Template');
  } else if (type === 'departments') {
    const headers = [
      {
        'Department Code': 'CS',
        'Department Name': 'Computer Science',
        'Faculty': 'School of Science and Technology',
      },
      {
        'Department Code': 'ACC',
        'Department Name': 'Accountancy',
        'Faculty': 'School of Management Studies',
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(headers), 'Departments_Template');
    downloadWorkbook(workbook, 'Department_Import_Template');
  } else if (type === 'categories') {
    const headers = [
      {
        'Category Name': 'Hostel & Water Supply',
        'Description': 'Hall of residence facilities, pump breakdown and repairs',
      },
      {
        'Category Name': 'Library Services',
        'Description': 'Book checkouts, quiet hours compliance, internet in library',
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(headers), 'Categories_Template');
    downloadWorkbook(workbook, 'Category_Import_Template');
  }
}

export interface ImportValidationResult<T> {
  valid: T[];
  invalid: { row: any; reason: string; rowNumber: number }[];
  duplicates: { row: any; reason: string; rowNumber: number }[];
  totalRows: number;
}

/**
 * Parses and validates an uploaded Excel file for import
 */
export async function parseExcelFile<T = any>(
  file: File,
  type: 'students' | 'staff' | 'departments' | 'categories',
  institutionDepartments: Department[],
  existingUsers: User[],
  existingCategories: ComplaintCategory[]
): Promise<ImportValidationResult<T>> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

  const valid: any[] = [];
  const invalid: { row: any; reason: string; rowNumber: number }[] = [];
  const duplicates: { row: any; reason: string; rowNumber: number }[] = [];

  const deptLookup = new Map(institutionDepartments.map(d => [d.name.toLowerCase().trim(), d]));
  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase().trim()));
  const existingStudentIds = new Set(
    existingUsers.filter(u => u.studentId).map(u => u.studentId!.toLowerCase().trim())
  );
  const existingStaffIds = new Set(
    existingUsers.filter(u => u.staffId).map(u => u.staffId!.toLowerCase().trim())
  );
  const existingDeptCodes = new Set(institutionDepartments.map(d => d.code.toLowerCase().trim()));
  const existingCatNames = new Set(existingCategories.map(c => c.name.toLowerCase().trim()));

  const seenInFile = new Set<string>();

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // considering 1-indexed sheet + header row

    if (type === 'students') {
      const studentId = (row['Student ID'] || row['student_id'] || row['Matric Number'] || '').toString().trim();
      const name = (row['Full Name'] || row['Name'] || row['name'] || '').toString().trim();
      const email = (row['Email'] || row['Email Address'] || row['email'] || '').toString().trim();
      const phone = (row['Phone'] || row['Phone Number'] || '').toString().trim();
      const deptName = (row['Department'] || row['department'] || '').toString().trim();
      const faculty = (row['Faculty'] || row['School'] || '').toString().trim();
      const programme = (row['Programme'] || row['Course'] || 'General').toString().trim();
      const level = (row['Level'] || 'ND I').toString().trim();

      if (!studentId || !name || !email) {
        invalid.push({ row, reason: 'Missing required field: Student ID, Name, or Email', rowNumber });
        return;
      }

      if (!email.includes('@')) {
        invalid.push({ row, reason: `Invalid email address format: "${email}"`, rowNumber });
        return;
      }

      // Check duplicates in system
      if (existingEmails.has(email.toLowerCase())) {
        duplicates.push({ row, reason: `Email "${email}" is already registered in the system`, rowNumber });
        return;
      }
      if (existingStudentIds.has(studentId.toLowerCase())) {
        duplicates.push({ row, reason: `Student ID "${studentId}" already exists`, rowNumber });
        return;
      }

      // Check duplicate within the uploaded file
      if (seenInFile.has(email.toLowerCase()) || seenInFile.has(studentId.toLowerCase())) {
        duplicates.push({ row, reason: `Duplicate record within this Excel file`, rowNumber });
        return;
      }
      seenInFile.add(email.toLowerCase());
      seenInFile.add(studentId.toLowerCase());

      // Validate department belongs to institution
      let departmentId = institutionDepartments[0]?.id || '';
      if (deptName) {
        const found = deptLookup.get(deptName.toLowerCase());
        if (found) {
          departmentId = found.id;
        } else {
          invalid.push({ row, reason: `Department "${deptName}" does not exist in this institution`, rowNumber });
          return;
        }
      }

      valid.push({
        studentId,
        name,
        email,
        phone,
        departmentId,
        faculty: faculty || institutionDepartments.find(d => d.id === departmentId)?.faculty || '',
        programme,
        level,
        role: 'student' as const,
        status: 'active' as const,
      });

    } else if (type === 'staff') {
      const staffId = (row['Staff ID'] || row['staff_id'] || '').toString().trim();
      const name = (row['Full Name'] || row['Name'] || '').toString().trim();
      const email = (row['Email'] || row['email'] || '').toString().trim();
      const phone = (row['Phone'] || '').toString().trim();
      const deptName = (row['Department'] || '').toString().trim();
      const roleTitle = (row['Role'] || row['Designation'] || 'Staff Officer').toString().trim();

      if (!name || !email) {
        invalid.push({ row, reason: 'Missing required field: Name or Email', rowNumber });
        return;
      }

      if (!email.includes('@')) {
        invalid.push({ row, reason: `Invalid email address format: "${email}"`, rowNumber });
        return;
      }

      if (existingEmails.has(email.toLowerCase())) {
        duplicates.push({ row, reason: `Email "${email}" already registered`, rowNumber });
        return;
      }

      if (staffId && existingStaffIds.has(staffId.toLowerCase())) {
        duplicates.push({ row, reason: `Staff ID "${staffId}" already exists`, rowNumber });
        return;
      }

      if (seenInFile.has(email.toLowerCase())) {
        duplicates.push({ row, reason: `Duplicate email within this file`, rowNumber });
        return;
      }
      seenInFile.add(email.toLowerCase());

      let departmentId = institutionDepartments[0]?.id || '';
      if (deptName) {
        const found = deptLookup.get(deptName.toLowerCase());
        if (found) {
          departmentId = found.id;
        } else {
          invalid.push({ row, reason: `Department "${deptName}" not found in this institution`, rowNumber });
          return;
        }
      }

      valid.push({
        staffId: staffId || `STF-${Math.floor(100 + Math.random() * 900)}`,
        name,
        email,
        phone,
        departmentId,
        staffRole: roleTitle,
        role: 'staff' as const,
        status: 'active' as const,
      });

    } else if (type === 'departments') {
      const code = (row['Department Code'] || row['Code'] || '').toString().trim().toUpperCase();
      const name = (row['Department Name'] || row['Name'] || '').toString().trim();
      const faculty = (row['Faculty'] || row['School'] || 'General').toString().trim();

      if (!code || !name) {
        invalid.push({ row, reason: 'Missing Department Code or Name', rowNumber });
        return;
      }

      if (existingDeptCodes.has(code.toLowerCase())) {
        duplicates.push({ row, reason: `Department code "${code}" already exists in institution`, rowNumber });
        return;
      }

      if (seenInFile.has(code.toLowerCase())) {
        duplicates.push({ row, reason: `Duplicate department code within file`, rowNumber });
        return;
      }
      seenInFile.add(code.toLowerCase());

      valid.push({
        code,
        name,
        faculty,
        status: 'active' as const,
      });

    } else if (type === 'categories') {
      const name = (row['Category Name'] || row['Name'] || '').toString().trim();
      const description = (row['Description'] || 'General category').toString().trim();

      if (!name) {
        invalid.push({ row, reason: 'Missing Category Name', rowNumber });
        return;
      }

      if (existingCatNames.has(name.toLowerCase())) {
        duplicates.push({ row, reason: `Category "${name}" already exists in institution`, rowNumber });
        return;
      }

      if (seenInFile.has(name.toLowerCase())) {
        duplicates.push({ row, reason: `Duplicate category name within file`, rowNumber });
        return;
      }
      seenInFile.add(name.toLowerCase());

      valid.push({
        name,
        description,
        status: 'active' as const,
      });
    }
  });

  return {
    valid,
    invalid,
    duplicates,
    totalRows: rawRows.length,
  };
}
