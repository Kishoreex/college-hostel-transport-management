export type UserRole = 'student' | 'warden' | 'transport' | 'security' | 'admin';

export type ServiceType = 'hostel' | 'transport';

export interface User {
    id: string;
    userId: string;
    name: string;
    role: UserRole;
  email: string;
  phoneNumber?: string;

  isSystemAdmin?: boolean;
  canManageTransport?: boolean;
  canManageBoysHostel?: boolean;
  canManageGirlsHostel?: boolean;

  avatar?: string;
  studentId?: string;
  department?: string;
  year?: string;
  college?: string;
  serviceType?: "hostel" | "transport";
}

export interface OutpassRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  hostelBlock: string;
  reason: string;
  destination: string;
  date: string;
  timeOut: string;
  expectedReturn: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  qrCode?: string;
}
