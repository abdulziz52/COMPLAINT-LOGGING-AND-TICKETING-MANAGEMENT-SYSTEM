import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Institution,
  Department,
  ComplaintCategory,
  Complaint,
  ComplaintMessage,
  ComplaintStatusHistory,
  Notification,
  AuditLog,
  ComplaintStatus,
} from '../types';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_MESSAGES,
  INITIAL_STATUS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import { generateTicketNumber } from '../utils/ticket';

interface AppContextType {
  currentUser: User | null;
  currentInstitution: Institution | null;
  institutions: Institution[];
  users: User[];
  departments: Department[];
  categories: ComplaintCategory[];
  complaints: Complaint[];
  messages: ComplaintMessage[];
  statusHistory: ComplaintStatusHistory[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  unreadNotifsCount: number;

  // Auth & Context
  login: (emailOrId: string, institutionId?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (user: User) => void;
  switchInstitutionContext: (institutionId: string) => void;
  registerStudent: (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    institutionId: string;
    departmentId: string;
    faculty?: string;
    programme?: string;
    level?: string;
  }) => { success: boolean; error?: string; user?: User };

  // Complaint operations
  createComplaint: (data: {
    title: string;
    description: string;
    categoryId: string;
    departmentId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    relatedCourse?: string;
    semesterSession?: string;
    attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  }) => Complaint | null;
  updateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    comment?: string,
    resolution?: string
  ) => void;
  assignComplaint: (complaintId: string, staffId: string) => void;
  sendComplaintMessage: (
    complaintId: string,
    text: string,
    isInternal?: boolean,
    attachments?: Array<{ name: string; url: string; type: string; size: number }>
  ) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Management operations
  addStudent: (data: Partial<User>) => void;
  updateStudent: (id: string, updates: Partial<User>) => void;
  deleteStudent: (id: string) => void;

  addStaff: (data: Partial<User>) => void;
  updateStaff: (id: string, updates: Partial<User>) => void;
  deleteStaff: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addCategory: (cat: Omit<ComplaintCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<ComplaintCategory>) => void;
  deleteCategory: (id: string) => void;

  addInstitution: (inst: Omit<Institution, 'id' | 'createdAt'>) => void;
  updateInstitution: (id: string, updates: Partial<Institution>) => void;

  importBulkData: (type: 'students' | 'staff' | 'departments' | 'categories', records: any[]) => number;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INSTITUTIONS: 'st_inst_v2',
  USERS: 'st_users_v2',
  DEPARTMENTS: 'st_depts_v2',
  CATEGORIES: 'st_cats_v2',
  COMPLAINTS: 'st_cmps_v2',
  MESSAGES: 'st_msgs_v2',
  HISTORY: 'st_hist_v2',
  NOTIFS: 'st_notifs_v2',
  AUDIT: 'st_audit_v2',
  CURRENT_USER_ID: 'st_curr_user_v2',
  SELECTED_INST_ID: 'st_sel_inst_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [categories, setCategories] = useState<ComplaintCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [messages, setMessages] = useState<ComplaintMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [statusHistory, setStatusHistory] = useState<ComplaintStatusHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : INITIAL_STATUS_HISTORY;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;
  });

  const [selectedInstId, setSelectedInstId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_INST_ID) || 'inst-atap';
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(statusHistory));
  }, [statusHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedInstId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_INST_ID, selectedInstId);
    }
  }, [selectedInstId]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  const currentInstitution = currentUser?.institutionId
    ? institutions.find(i => i.id === currentUser.institutionId) || null
    : institutions.find(i => i.id === selectedInstId) || institutions[0] || null;

  const unreadNotifsCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.readStatus).length
    : 0;

  // Add audit log helper
  const logAudit = (action: string, description: string, institutionId?: string) => {
    const inst = institutions.find(i => i.id === (institutionId || currentInstitution?.id));
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System User',
      institutionId: inst?.id,
      institutionName: inst?.name || 'Platform Central',
      action,
      description,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (emailOrId: string, institutionId?: string): { success: boolean; error?: string } => {
    const query = emailOrId.trim().toLowerCase();

    // Check super admin first
    const superAdmin = users.find(u => u.role === 'super_admin' && u.email.toLowerCase() === query);
    if (superAdmin) {
      setCurrentUserId(superAdmin.id);
      logAudit('LOGIN_SUCCESS', `Super Admin logged in`, undefined);
      return { success: true };
    }

    if (!institutionId) {
      return { success: false, error: 'Please select your educational institution.' };
    }

    // Match user in the designated institution
    const matched = users.find(u => {
      const matchInst = u.institutionId === institutionId;
      const matchEmail = u.email.toLowerCase() === query;
      const matchStudentId = u.studentId && u.studentId.toLowerCase() === query;
      const matchStaffId = u.staffId && u.staffId.toLowerCase() === query;
      return matchInst && (matchEmail || matchStudentId || matchStaffId);
    });

    if (!matched) {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your Student ID/Email and ensure you selected the correct institution.',
      };
    }

    if (matched.status === 'suspended') {
      return {
        success: false,
        error: 'Your account is suspended. Please contact your institution administrator.',
      };
    }

    setCurrentUserId(matched.id);
    setSelectedInstId(matched.institutionId || institutionId);
    logAudit('LOGIN_SUCCESS', `User ${matched.name} (${matched.role}) logged into ${institutionId}`, matched.institutionId);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', `User ${currentUser.name} logged out`, currentUser.institutionId);
    }
    setCurrentUserId(null);
  };

  const switchUser = (user: User) => {
    setCurrentUserId(user.id);
    if (user.institutionId) {
      setSelectedInstId(user.institutionId);
    }
  };

  const switchInstitutionContext = (institutionId: string) => {
    setSelectedInstId(institutionId);
  };

  const registerStudent = (data: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    institutionId: string;
    departmentId: string;
    faculty?: string;
    programme?: string;
    level?: string;
  }) => {
    // Validate institution
    const inst = institutions.find(i => i.id === data.institutionId);
    if (!inst) {
      return { success: false, error: 'Please select a valid institution from the list.' };
    }

    // Validate department belongs to institution
    const dept = departments.find(d => d.id === data.departmentId && d.institutionId === data.institutionId);
    if (!dept) {
      return { success: false, error: 'The selected department does not belong to this institution.' };
    }

    // Check duplicate email or studentId
    const emailExists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (emailExists) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const matricExists = users.some(
      u => u.studentId && u.studentId.toLowerCase() === data.studentId.toLowerCase().trim() && u.institutionId === data.institutionId
    );
    if (matricExists) {
      return { success: false, error: 'This Student ID / Matric number is already registered in this institution.' };
    }

    const newUser: User = {
      id: `user-stu-${Date.now()}`,
      institutionId: data.institutionId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      role: 'student',
      status: 'active',
      studentId: data.studentId.trim(),
      departmentId: data.departmentId,
      faculty: data.faculty || dept.faculty || 'School / Faculty',
      programme: data.programme || 'General Studies',
      level: data.level || '100 Level',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setSelectedInstId(data.institutionId);

    // Welcome Notification
    const welcomeNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to Online Complaint Portal',
      message: `Your student profile has been registered successfully with ${inst.name}. You can now submit and track complaints.`,
      type: 'success',
      readStatus: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    logAudit('STUDENT_REGISTRATION', `New student registration: ${newUser.name} (${newUser.studentId})`, data.institutionId);

    return { success: true, user: newUser };
  };

  const createComplaint = (data: {
    title: string;
    description: string;
    categoryId: string;
    departmentId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    relatedCourse?: string;
    semesterSession?: string;
    attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  }): Complaint | null => {
    if (!currentUser || !currentInstitution) return null;

    const ticketNumber = generateTicketNumber(currentInstitution, complaints);
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      institutionId: currentInstitution.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentMatricNo: currentUser.studentId || 'N/A',
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone,
      ticketNumber,
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      departmentId: data.departmentId,
      faculty: currentUser.faculty,
      priority: data.priority,
      status: 'submitted',
      relatedCourse: data.relatedCourse?.trim(),
      semesterSession: data.semesterSession?.trim(),
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now,
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Initial status history
    const initialHist: ComplaintStatusHistory = {
      id: `hist-${Date.now()}`,
      complaintId: newComplaint.id,
      oldStatus: 'submitted',
      newStatus: 'submitted',
      changedById: currentUser.id,
      changedByName: currentUser.name,
      comment: 'Complaint logged online by student.',
      createdAt: now,
    };
    setStatusHistory(prev => [initialHist, ...prev]);

    // Notify student
    const studentNotif: Notification = {
      id: `notif-${Date.now()}-1`,
      userId: currentUser.id,
      title: 'Complaint Submitted Successfully',
      message: `Your ticket ${ticketNumber} has been logged. You can track progress in real-time.`,
      type: 'success',
      readStatus: false,
      complaintId: newComplaint.id,
      ticketNumber,
      createdAt: now,
    };

    // Notify institution admins
    const instAdmins = users.filter(u => u.role === 'institution_admin' && u.institutionId === currentInstitution.id);
    const adminNotifs: Notification[] = instAdmins.map(admin => ({
      id: `notif-${Date.now()}-${admin.id}`,
      userId: admin.id,
      title: 'New Student Complaint Logged',
      message: `${currentUser.name} logged complaint "${newComplaint.title}" [${ticketNumber}].`,
      type: newComplaint.priority === 'critical' ? 'alert' : 'info',
      readStatus: false,
      complaintId: newComplaint.id,
      ticketNumber,
      createdAt: now,
    }));

    setNotifications(prev => [studentNotif, ...adminNotifs, ...prev]);

    logAudit(
      'LOG_COMPLAINT',
      `Student ${currentUser.name} submitted complaint ${ticketNumber}: "${newComplaint.title}"`,
      currentInstitution.id
    );

    return newComplaint;
  };

  const updateComplaintStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    comment?: string,
    resolution?: string
  ) => {
    const target = complaints.find(c => c.id === complaintId);
    if (!target || !currentUser) return;

    const now = new Date().toISOString();
    const oldStatus = target.status;

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: newStatus,
            resolution: resolution !== undefined ? resolution : c.resolution,
            resolvedAt: newStatus === 'resolved' ? now : c.resolvedAt,
            closedAt: newStatus === 'closed' ? now : c.closedAt,
            updatedAt: now,
          };
        }
        return c;
      })
    );

    // Record status history
    const histEntry: ComplaintStatusHistory = {
      id: `hist-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus,
      changedById: currentUser.id,
      changedByName: currentUser.name,
      comment: comment || `Status updated from ${oldStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}`,
      createdAt: now,
    };
    setStatusHistory(prev => [histEntry, ...prev]);

    // Send notification to student
    const studentUser = users.find(u => u.id === target.studentId);
    if (studentUser) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: studentUser.id,
        title: `Ticket Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
        message: comment || `Your complaint ${target.ticketNumber} is now marked as ${newStatus.replace(/_/g, ' ')}.`,
        type: newStatus === 'resolved' ? 'success' : newStatus === 'rejected' ? 'alert' : 'info',
        readStatus: false,
        complaintId: target.id,
        ticketNumber: target.ticketNumber,
        createdAt: now,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    logAudit(
      'STATUS_CHANGE',
      `${currentUser.name} changed status of ${target.ticketNumber} to ${newStatus}`,
      target.institutionId
    );
  };

  const assignComplaint = (complaintId: string, staffId: string) => {
    const staff = users.find(u => u.id === staffId);
    const complaint = complaints.find(c => c.id === complaintId);
    if (!staff || !complaint || !currentUser) return;

    const now = new Date().toISOString();

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            assignedStaffId: staff.id,
            assignedStaffName: staff.name,
            status: c.status === 'submitted' || c.status === 'pending' ? 'assigned' : c.status,
            updatedAt: now,
          };
        }
        return c;
      })
    );

    const histEntry: ComplaintStatusHistory = {
      id: `hist-${Date.now()}`,
      complaintId,
      oldStatus: complaint.status,
      newStatus: 'assigned',
      changedById: currentUser.id,
      changedByName: currentUser.name,
      comment: `Assigned complaint to officer ${staff.name} (${staff.staffRole || 'Desk Officer'}).`,
      createdAt: now,
    };
    setStatusHistory(prev => [histEntry, ...prev]);

    // Notify staff
    const staffNotif: Notification = {
      id: `notif-${Date.now()}-staff`,
      userId: staff.id,
      title: 'New Complaint Assigned',
      message: `You were assigned ticket ${complaint.ticketNumber}: "${complaint.title}"`,
      type: 'warning',
      readStatus: false,
      complaintId: complaint.id,
      ticketNumber: complaint.ticketNumber,
      createdAt: now,
    };

    // Notify student
    const stuNotif: Notification = {
      id: `notif-${Date.now()}-stu`,
      userId: complaint.studentId,
      title: 'Ticket Assigned to Officer',
      message: `Your ticket ${complaint.ticketNumber} has been assigned to ${staff.name} for investigation.`,
      type: 'info',
      readStatus: false,
      complaintId: complaint.id,
      ticketNumber: complaint.ticketNumber,
      createdAt: now,
    };

    setNotifications(prev => [staffNotif, stuNotif, ...prev]);

    logAudit(
      'ASSIGN_COMPLAINT',
      `Assigned ${complaint.ticketNumber} to ${staff.name}`,
      complaint.institutionId
    );
  };

  const sendComplaintMessage = (
    complaintId: string,
    text: string,
    isInternal = false,
    attachments: Array<{ name: string; url: string; type: string; size: number }> = []
  ) => {
    if (!currentUser) return;
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    const now = new Date().toISOString();

    const newMsg: ComplaintMessage = {
      id: `msg-${Date.now()}`,
      complaintId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: text.trim(),
      attachments,
      isInternal,
      createdAt: now,
    };

    setMessages(prev => [...prev, newMsg]);

    // Update complaint timestamp
    setComplaints(prev =>
      prev.map(c => (c.id === complaintId ? { ...c, updatedAt: now } : c))
    );

    // Notify other party (if not an internal note)
    if (!isInternal) {
      if (currentUser.role === 'student') {
        // Notify assigned staff or admin
        const recipientId = complaint.assignedStaffId;
        if (recipientId) {
          const notif: Notification = {
            id: `notif-${Date.now()}`,
            userId: recipientId,
            title: `Student Replied on ${complaint.ticketNumber}`,
            message: `${currentUser.name}: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
            type: 'info',
            readStatus: false,
            complaintId,
            ticketNumber: complaint.ticketNumber,
            createdAt: now,
          };
          setNotifications(prev => [notif, ...prev]);
        }
      } else {
        // Staff replied -> notify student
        const notif: Notification = {
          id: `notif-${Date.now()}`,
          userId: complaint.studentId,
          title: `Staff Response on ${complaint.ticketNumber}`,
          message: `${currentUser.name} responded to your complaint.`,
          type: 'info',
          readStatus: false,
          complaintId,
          ticketNumber: complaint.ticketNumber,
          createdAt: now,
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, readStatus: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, readStatus: true } : n))
    );
  };

  // Student Admin CRUD
  const addStudent = (data: Partial<User>) => {
    const instId = data.institutionId || currentInstitution?.id;
    if (!instId) return;

    const newStudent: User = {
      id: `user-stu-${Date.now()}`,
      institutionId: instId,
      name: data.name || 'New Student',
      email: data.email || `student${Date.now()}@inst.edu`,
      phone: data.phone || '',
      role: 'student',
      status: data.status || 'active',
      studentId: data.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: data.departmentId,
      faculty: data.faculty,
      programme: data.programme,
      level: data.level,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newStudent, ...prev]);
    logAudit('CREATE_STUDENT', `Added student ${newStudent.name} (${newStudent.studentId})`, instId);
  };

  const updateStudent = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('UPDATE_STUDENT', `Updated profile of student ${id}`, currentInstitution?.id);
  };

  const deleteStudent = (id: string) => {
    const u = users.find(user => user.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    logAudit('DELETE_STUDENT', `Deleted student ${u?.name || id}`, currentInstitution?.id);
  };

  // Staff Admin CRUD
  const addStaff = (data: Partial<User>) => {
    const instId = data.institutionId || currentInstitution?.id;
    if (!instId) return;

    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      institutionId: instId,
      name: data.name || 'New Staff Officer',
      email: data.email || `staff${Date.now()}@inst.edu`,
      phone: data.phone || '',
      role: 'staff',
      status: data.status || 'active',
      staffId: data.staffId || `STF-${Math.floor(100 + Math.random() * 900)}`,
      departmentId: data.departmentId,
      staffRole: data.staffRole || 'Desk Officer',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newStaff, ...prev]);
    logAudit('CREATE_STAFF', `Added staff officer ${newStaff.name} (${newStaff.staffId})`, instId);
  };

  const updateStaff = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('UPDATE_STAFF', `Updated staff record ${id}`, currentInstitution?.id);
  };

  const deleteStaff = (id: string) => {
    const u = users.find(user => user.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));
    logAudit('DELETE_STAFF', `Deleted staff officer ${u?.name || id}`, currentInstitution?.id);
  };

  // Department CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments(prev => [...prev, newDept]);
    logAudit('CREATE_DEPARTMENT', `Added department ${newDept.name} (${newDept.code})`, dept.institutionId);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    logAudit('UPDATE_DEPARTMENT', `Updated department ${id}`, currentInstitution?.id);
  };

  const deleteDepartment = (id: string) => {
    const d = departments.find(dept => dept.id === id);
    setDepartments(prev => prev.filter(dept => dept.id !== id));
    logAudit('DELETE_DEPARTMENT', `Deleted department ${d?.name || id}`, currentInstitution?.id);
  };

  // Category CRUD
  const addCategory = (cat: Omit<ComplaintCategory, 'id'>) => {
    const newCat: ComplaintCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
    logAudit('CREATE_CATEGORY', `Created category ${newCat.name}`, cat.institutionId);
  };

  const updateCategory = (id: string, updates: Partial<ComplaintCategory>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('UPDATE_CATEGORY', `Updated category ${id}`, currentInstitution?.id);
  };

  const deleteCategory = (id: string) => {
    const c = categories.find(cat => cat.id === id);
    setCategories(prev => prev.filter(cat => cat.id !== id));
    logAudit('DELETE_CATEGORY', `Deleted category ${c?.name || id}`, currentInstitution?.id);
  };

  // Institution CRUD
  const addInstitution = (inst: Omit<Institution, 'id' | 'createdAt'>) => {
    const newInst: Institution = {
      ...inst,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInstitutions(prev => [...prev, newInst]);
    logAudit('CREATE_INSTITUTION', `Provisioned new institution: ${newInst.name} (${newInst.abbreviation})`);
  };

  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
    logAudit('UPDATE_INSTITUTION', `Updated institution configuration for ${id}`, id);
  };

  // Bulk Import
  const importBulkData = (type: 'students' | 'staff' | 'departments' | 'categories', records: any[]) => {
    if (!currentInstitution) return 0;
    const now = new Date().toISOString();

    if (type === 'students') {
      const newStudents: User[] = records.map((r, idx) => ({
        id: `user-stu-imp-${Date.now()}-${idx}`,
        institutionId: currentInstitution.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        role: 'student',
        status: 'active',
        studentId: r.studentId,
        departmentId: r.departmentId,
        faculty: r.faculty,
        programme: r.programme,
        level: r.level,
        createdAt: now,
      }));
      setUsers(prev => [...newStudents, ...prev]);
      logAudit('IMPORT_STUDENTS', `Imported ${newStudents.length} students from Excel file`, currentInstitution.id);
      return newStudents.length;
    } else if (type === 'staff') {
      const newStaff: User[] = records.map((r, idx) => ({
        id: `user-staff-imp-${Date.now()}-${idx}`,
        institutionId: currentInstitution.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        role: 'staff',
        status: 'active',
        staffId: r.staffId,
        departmentId: r.departmentId,
        staffRole: r.staffRole,
        createdAt: now,
      }));
      setUsers(prev => [...newStaff, ...prev]);
      logAudit('IMPORT_STAFF', `Imported ${newStaff.length} staff members from Excel file`, currentInstitution.id);
      return newStaff.length;
    } else if (type === 'departments') {
      const newDepts: Department[] = records.map((r, idx) => ({
        id: `dept-imp-${Date.now()}-${idx}`,
        institutionId: currentInstitution.id,
        name: r.name,
        code: r.code,
        faculty: r.faculty,
        status: 'active',
      }));
      setDepartments(prev => [...prev, ...newDepts]);
      logAudit('IMPORT_DEPARTMENTS', `Imported ${newDepts.length} departments from Excel file`, currentInstitution.id);
      return newDepts.length;
    } else if (type === 'categories') {
      const newCats: ComplaintCategory[] = records.map((r, idx) => ({
        id: `cat-imp-${Date.now()}-${idx}`,
        institutionId: currentInstitution.id,
        name: r.name,
        description: r.description,
        status: 'active',
      }));
      setCategories(prev => [...prev, ...newCats]);
      logAudit('IMPORT_CATEGORIES', `Imported ${newCats.length} categories from Excel file`, currentInstitution.id);
      return newCats.length;
    }

    return 0;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setInstitutions(INITIAL_INSTITUTIONS);
    setUsers(INITIAL_USERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setCategories(INITIAL_CATEGORIES);
    setComplaints(INITIAL_COMPLAINTS);
    setMessages(INITIAL_MESSAGES);
    setStatusHistory(INITIAL_STATUS_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId(null);
    setSelectedInstId('inst-atap');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentInstitution,
        institutions,
        users,
        departments,
        categories,
        complaints,
        messages,
        statusHistory,
        notifications,
        auditLogs,
        unreadNotifsCount,

        login,
        logout,
        switchUser,
        switchInstitutionContext,
        registerStudent,

        createComplaint,
        updateComplaintStatus,
        assignComplaint,
        sendComplaintMessage,

        markNotificationRead,
        markAllNotificationsRead,

        addStudent,
        updateStudent,
        deleteStudent,

        addStaff,
        updateStaff,
        deleteStaff,

        addDepartment,
        updateDepartment,
        deleteDepartment,

        addCategory,
        updateCategory,
        deleteCategory,

        addInstitution,
        updateInstitution,

        importBulkData,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
