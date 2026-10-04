export type UserRole = 'super_admin' | 'institution_admin' | 'staff' | 'student';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'pending'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_student_response'
  | 'resolved'
  | 'rejected'
  | 'closed';

export interface Institution {
  id: string;
  name: string;
  abbreviation: string;
  type: 'University' | 'Polytechnic' | 'College of Education' | 'College of Health' | 'Other';
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  status: 'active' | 'suspended';
  primaryColor: string;
  secondaryColor: string;
  ticketPrefix: string;
  escalationDays: number;
  createdAt: string;
}

export interface User {
  id: string;
  institutionId?: string; // null for super_admin
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended';
  profilePhoto?: string;
  createdAt: string;
  // Specific role metadata
  studentId?: string; // Matric number
  faculty?: string;
  departmentId?: string;
  programme?: string;
  level?: string;
  staffId?: string;
  staffRole?: string; // e.g. "Examination Officer", "HOD", "Dean"
}

export interface Department {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  faculty?: string;
  status: 'active' | 'inactive';
}

export interface ComplaintCategory {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Complaint {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  studentMatricNo: string;
  studentEmail: string;
  studentPhone?: string;
  ticketNumber: string;
  title: string;
  description: string;
  categoryId: string;
  departmentId: string;
  faculty?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  relatedCourse?: string;
  semesterSession?: string;
  attachments: Attachment[];
  resolution?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachments?: Attachment[];
  isInternal?: boolean; // If true, only staff/admins can see it
  createdAt: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaintId: string;
  oldStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedById: string;
  changedByName: string;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  readStatus: boolean;
  complaintId?: string;
  ticketNumber?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  institutionId?: string;
  institutionName?: string;
  action: string;
  description: string;
  timestamp: string;
}
