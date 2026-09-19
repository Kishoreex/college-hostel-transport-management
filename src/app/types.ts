export type UserRole =
  | 'student'
  | 'warden'
  | 'transport'
  | 'security'
  | 'admin'
  | 'system-admin'
  | 'management'
  | 'principal'
  | 'hostel-incharge'
  | 'admin-office';

export type ServiceType = 'hostel' | 'transport';

export interface User {
  id: string;

  userId: string;

  name: string;

  role: UserRole;

  email: string;
    // Actual backend staff role
  // Example: System Admin, Management, Principal
  staffRole?: string;

  phoneNumber?: string;

  // New staff access model
  collegeId?: number | null;

  college?: string;
assignedYear?: string;
  isSystemAdmin?: boolean;

  // Old permissions kept temporarily
  // for compatibility with existing screens.
  canManageTransport?: boolean;

  canManageBoysHostel?: boolean;

  canManageGirlsHostel?: boolean;

  avatar?: string;

  studentId?: string;

  department?: string;

  year?: string;

  serviceType?: 'hostel' | 'transport';
}