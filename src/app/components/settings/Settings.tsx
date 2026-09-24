import { useEffect, useState } from "react";
import { getActivityLogs } from "../../../api/activityLogService";
import {
  getNotificationSettings,
  saveNotificationSettings
} from "../../../api/notificationSettingsService";
import {
  getUsers,
  createUser,
  updateUser,
  changePassword,
  disableUser,
  enableUser
} from "../../../api/userService";

import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Save,
  Plus,
  Edit2,
  UserCircle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Bus,
  Home,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
}
interface SystemUser {
  id: number;
  userId: string;

  name: string;
  phone: string;
  email: string;

  roleId: number;
  role: string;

  collegeId: number | null;
  college: string;

  module: string;

  canManageTransport: boolean;
  canManageBoysHostel: boolean;
  canManageGirlsHostel: boolean;

  hostelApprovalLevel: string | null;

  assignedYear: string | null;

  status: 'active' | 'inactive';
}


// Bottom sheet component
function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': { borderRadius: '20px 20px 0 0', position: 'fixed', bottom: 0, m: 0, width: '100%', maxWidth: '100%', maxHeight: '92vh' },
        '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
        <div className="w-10 h-1 bg-gray-300 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
        <h2 className="font-bold text-gray-800 text-base mt-2">{title}</h2>
        <button onClick={onClose} className="mt-2 bg-gray-100 p-1.5 rounded-xl active:scale-95 transition-transform">
          <X size={16} className="text-gray-500" />
        </button>
      </div>
      <DialogContent sx={{ px: 2.5, pb: 3, pt: 0 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all ${icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  );
}

export default function Settings({ user, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState(0);
const canManageUsers =
  user.staffRole === "Management" ||
  user.role === "management";
  const [users, setUsers] =
  useState<SystemUser[]>([]); 

  const [pushNotifications,
setPushNotifications] =
useState(true);

const [newOutpassRequest,
setNewOutpassRequest] =
useState(true);

const [newLeaveApplication,
setNewLeaveApplication] =
useState(true);

const [newUserRegistration,
setNewUserRegistration] =
useState(true);
useEffect(() => {

  if (canManageUsers) {
    loadUsers();

    const loadLogs = async () => {
      try {
        const data = await getActivityLogs();
        setAuditLogs(data);
      } catch (error) {
        console.error(
          'Failed to load activity logs:',
          error
        );
      }
    };

    loadLogs();
  }

  loadNotificationSettings();

}, [
  canManageUsers,
  user.id
]);
const loadNotificationSettings =
async () => {

  const data =
    await getNotificationSettings(
      user.id
    );

  if (!data) return;

  setPushNotifications(
    data.pushNotifications
  );

  setNewOutpassRequest(
    data.newOutpassRequest
  );

  setNewLeaveApplication(
    data.newLeaveApplication
  );

  setNewUserRegistration(
    data.newUserRegistration
  );
};
const loadUsers = async () => {
  try {
    const data = await getUsers();

const allowedRoles = [
  "Management",
  "Principal",
  "Hostel Incharge",
  "Admin Office",
  "Class Incharge"
];

    const staffUsers = data.filter(
      (u: any) =>
        allowedRoles.includes(u.role)
    );

    setUsers(
      staffUsers.map((u: any) => ({
        id: u.id,
        userId: u.userId,

        name: u.fullName,
        email: u.email,
        phone: u.phoneNumber || '',

        roleId: u.roleId,
        role: u.role,

        collegeId:
          u.collegeId ?? null,

        college:
          u.college || 'All Colleges',

        module:
          u.module || '',

        canManageTransport:
          u.canManageTransport ?? false,

        canManageBoysHostel:
          u.canManageBoysHostel ?? false,

        canManageGirlsHostel:
          u.canManageGirlsHostel ?? false,

      hostelApprovalLevel:
  u.hostelApprovalLevel ?? null,

assignedYear:
  u.assignedYear ?? null,

status:
  u.isActive
    ? 'active'
    : 'inactive'
      }))
    );

  } catch (error) {
    console.error(
      'Failed to load users:',
      error
    );
  }
};
  // Admin profile
 const [adminName, setAdminName] =
  useState(user.name);

const [adminPhone, setAdminPhone] =
  useState(user.phoneNumber || "");

const [adminEmail, setAdminEmail] =
  useState(user.email);
  const [profileSaved, setProfileSaved] = useState(false);

  // Change password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);
  const pwdMatch = newPwd === confirmPwd && newPwd.length >= 6;

  // Add User sheet
  const [addSheet, setAddSheet] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
const [newCollegeId, setNewCollegeId] = useState<number | ''>('');
const [newRoleId, setNewRoleId] = useState<number | ''>('');

const [newModule, setNewModule] =
  useState('');

const [newBoysHostel, setNewBoysHostel] =
  useState(false);

const [newGirlsHostel, setNewGirlsHostel] =
  useState(false);

const [newHostelApprovalLevel, setNewHostelApprovalLevel] =
  useState('');
  const [newAssignedYear, setNewAssignedYear] =
  useState('');
  // Edit User sheet
  const [editSheet, setEditSheet] = useState<{ open: boolean; u: SystemUser | null }>({ open: false, u: null });
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
const [editCollegeId, setEditCollegeId] = useState<number | ''>('');
const [editRoleId, setEditRoleId] = useState<number | ''>('');

const [editModule, setEditModule] =
  useState('');

const [editBoysHostel, setEditBoysHostel] =
  useState(false);

const [editGirlsHostel, setEditGirlsHostel] =
  useState(false);

const [editHostelApprovalLevel, setEditHostelApprovalLevel] =
  useState('');
  const [editAssignedYear, setEditAssignedYear] =
  useState('');
const colleges = [
  {
    id: 0,
    name: 'All Colleges'
  },
  {
    id: 1,
    name: 'Madha Dental College & Hospital'
  },
  {
    id: 2,
    name: 'Madha College of Physiotherapy'
  },
  {
    id: 3,
    name: 'Madha College of Nursing'
  }
];
const staffRoles = [
  {
    id: 3,
    name: 'Principal'
  },
  {
    id: 4,
    name: 'Hostel Incharge'
  },
  {
    id: 5,
    name: 'Admin Office'
  },
{
  id: 1003,
  name: 'Class Incharge'
}
];

const toggleModule = (
  current: string,
  module: string
) => {

  const modules = current
    ? current.split(',').filter(Boolean)
    : [];

  if (modules.includes(module)) {

    return modules
      .filter(m => m !== module)
      .join(',');

  }

  return [...modules, module].join(',');
};
 const [auditLogs, setAuditLogs] = useState<any[]>([]);

const openAdd = () => {
  setNewName('');
  setNewPhone('');
  setNewEmail('');
  setNewPassword('');

  setNewCollegeId('');
  setNewRoleId('');

  setNewModule('');

setNewBoysHostel(false);
setNewGirlsHostel(false);

setNewHostelApprovalLevel('');
setNewAssignedYear('');

setAddSheet(true);
};

const handleAdd = async () => {

  if (
  !newName ||
  !newPhone ||
  !newEmail ||
  !newPassword ||
  !newRoleId ||
  newCollegeId === '' ||
  !newModule
) {
  alert('Please fill all required fields.');
  return;
}
  const selectedRole =
    staffRoles.find(
      role =>
        role.id === Number(newRoleId)
    );

  if (!selectedRole) {
    alert('Please select a valid role.');
    return;
  }
if (
  selectedRole.name === "Class Incharge" &&
  !newAssignedYear
) {
  alert("Please select an Assigned Year for Class Incharge.");
  return;
}
  // Hostel validation
if (newModule.split(',').includes("Hostel")) {

    if (
      !newBoysHostel &&
      !newGirlsHostel
    ) {
      alert(
        "Please select Boys Hostel or Girls Hostel."
      );
      return;
    }

    if (!newHostelApprovalLevel) {
      alert(
        "Please select an approval level."
      );
      return;
    }
  }

  try {

    await createUser({

      userId:
        newEmail.split('@')[0],

      fullName:
        newName,

      email:
        newEmail,

      phoneNumber:
        newPhone,

      passwordHash:
        newPassword,

      roleId:
        Number(newRoleId),
collegeId:
  newCollegeId === 0
    ? null
    : Number(newCollegeId),

      module:
        newModule,
canManageTransport:
  newModule
    .split(',')
    .includes("Transport"),

canManageBoysHostel:
  newModule
    .split(',')
    .includes("Hostel") &&
  newBoysHostel,

canManageGirlsHostel:
  newModule
    .split(',')
    .includes("Hostel") &&
  newGirlsHostel,

hostelApprovalLevel:
  newModule
    .split(',')
    .includes("Hostel")
    ? newHostelApprovalLevel
    : null,

assignedYear:
  selectedRole.name === "Class Incharge"
    ? newAssignedYear
    : null
});

    await loadUsers();

    setAddSheet(false);

    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewPassword('');

    setNewCollegeId('');
    setNewRoleId('');

    setNewModule('');

    setNewBoysHostel(false);
    setNewGirlsHostel(false);

    setNewHostelApprovalLevel('');
    setNewAssignedYear('');
  } catch (error: any) {

    console.error(error);

    alert(
      error?.message ||
      'Failed to create user.'
    );
  }
};

const openEdit = (u: SystemUser) => {

  setEditSheet({
    open: true,
    u
  });

  setEditName(u.name);
  setEditPhone(u.phone);
  setEditEmail(u.email);
  setEditPassword('');

  setEditCollegeId(
    u.collegeId ?? ''
  );

  setEditRoleId(
    u.roleId
  );

  setEditModule(
    u.module || ''
  );

  setEditBoysHostel(
    u.canManageBoysHostel
  );

  setEditGirlsHostel(
    u.canManageGirlsHostel
  );

  setEditHostelApprovalLevel(
    u.hostelApprovalLevel || ''
  );
  setEditAssignedYear(
  u.assignedYear || ''
);
};const handleEdit = async () => {
  if (!editSheet.u) {
    return;
  }

  if (
    !editName ||
    !editPhone ||
    !editEmail ||
    !editRoleId ||
    editCollegeId === ''
  ) {
    alert('Please fill all required fields.');
    return;
  }
  const selectedRole = staffRoles.find(
    role => role.id === Number(editRoleId)
  );

  if (!selectedRole) {
    alert('Please select a valid role.');
    return;
  }
if (
  selectedRole.name === "Class Incharge" &&
  !editAssignedYear
) {
  alert("Please select an Assigned Year for Class Incharge.");
  return;
}
  const hasHostel =
    editModule
      .split(',')
      .filter(Boolean)
      .includes("Hostel");

  const hasTransport =
    editModule
      .split(',')
      .filter(Boolean)
      .includes("Transport");

  // Hostel validation
  if (hasHostel) {

    if (!editBoysHostel && !editGirlsHostel) {
      alert("Please select Boys Hostel or Girls Hostel.");
      return;
    }

    if (!editHostelApprovalLevel) {
      alert("Please select an approval level.");
      return;
    }
  }

  try {

    await updateUser(
      editSheet.u.id,
      {
        fullName: editName,

        email: editEmail,

        phoneNumber: editPhone,

        roleId: Number(editRoleId),

        collegeId:
  editCollegeId === 0
    ? null
    : Number(editCollegeId),

        // MODULE
        module: editModule,

        // TRANSPORT PERMISSION
        canManageTransport: hasTransport,

        // HOSTEL PERMISSIONS
        canManageBoysHostel:
          hasHostel && editBoysHostel,

        canManageGirlsHostel:
          hasHostel && editGirlsHostel,

        // APPROVAL LEVEL
      hostelApprovalLevel:
  hasHostel
    ? editHostelApprovalLevel
    : null,

// ASSIGNED YEAR
assignedYear:
  selectedRole.name === "Class Incharge"
    ? editAssignedYear
    : null,

// PASSWORD
...(editPassword
  ? { passwordHash: editPassword }
  : {})
      }
    );

    alert("User updated successfully.");

    setEditPassword('');

    await loadUsers();

    setEditSheet({
      open: false,
      u: null
    });

  } catch (error: any) {

    console.error(error);

    alert(
      error?.message ||
      'Failed to update user.'
    );
  }
};


  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Settings">
      <div className="space-y-4 max-w-2xl mx-auto pb-6">
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ '& .MuiTab-root': { fontSize: '0.75rem' } }}>
           <Tab label="GENERAL" />

{canManageUsers && (
  <Tab label="USERS" />
)}

<Tab label="ALERTS" />
<Tab label="LOGS" />
          </Tabs>

          <CardContent className="p-4">
            {/* ── GENERAL ── */}
            {activeTab === 0 && (
              <div className="space-y-4">
                {/* Profile avatar header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <UserCircle size={40} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{adminName}</p>
                    <p className="text-blue-200 text-sm">{adminEmail}</p>
                    <p className="text-blue-300 text-xs mt-0.5">{adminPhone}</p>
                  </div>
                </div>

                {/* Profile form */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="bg-blue-100 p-1.5 rounded-lg"><UserCircle size={16} className="text-blue-600" /></div>
                    <h3 className="font-bold text-gray-800 text-sm">Admin Profile</h3>
                  </div>
                  <FieldInput label="Full Name" value={adminName} onChange={setAdminName} placeholder="Your full name" icon={<UserCircle size={15} />} />
                  <FieldInput label="Phone Number" value={adminPhone} onChange={setAdminPhone} placeholder="+91 XXXXX XXXXX" icon={<Phone size={15} />} />
                  <FieldInput label="Email ID" value={adminEmail} onChange={setAdminEmail} placeholder="admin@institution.edu" icon={<Mail size={15} />} />

                  {profileSaved && (
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-100 rounded-xl p-2.5">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <p className="text-xs text-green-700 font-medium">Profile saved successfully!</p>
                    </div>
                  )}

                  
                </div>

                {/* Change Password */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="bg-amber-100 p-1.5 rounded-lg"><Lock size={16} className="text-amber-600" /></div>
                    <h3 className="font-bold text-gray-800 text-sm">Change Password</h3>
                  </div>
                  <PasswordInput label="Current Password" value={currentPwd} onChange={setCurrentPwd} placeholder="Enter current password" />
                  <PasswordInput label="New Password" value={newPwd} onChange={setNewPwd} placeholder="Min 6 characters" />
                  <PasswordInput label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} placeholder="Re-enter new password" />

                  {confirmPwd && !pwdMatch && (
                    <div className="flex items-center space-x-2 bg-red-50 border border-red-100 rounded-xl p-2.5">
                      <AlertCircle size={14} className="text-red-500" />
                      <p className="text-xs text-red-600">{newPwd.length < 6 ? 'Password must be at least 6 characters' : 'Passwords do not match'}</p>
                    </div>
                  )}

                  {pwdSaved && (
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-100 rounded-xl p-2.5">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <p className="text-xs text-green-700 font-medium">Password updated successfully!</p>
                    </div>
                  )}

                  <button
                    disabled={!currentPwd || !pwdMatch}
                    onClick={async () => {
  try {
   await changePassword(
  Number(user.userId),
  currentPwd,
  newPwd
);

    setPwdSaved(true);

    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");

    setTimeout(() => {
      setPwdSaved(false);
    }, 3000);

  } catch {
    alert("Current Password Incorrect");
  }
}}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-500 disabled:bg-gray-200 hover:bg-amber-600 active:scale-95 text-white disabled:text-gray-400 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm"
                  >
                    <Lock size={16} />
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
      {canManageUsers && activeTab === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800">System Users</h3>
                  <button
                    onClick={openAdd}
                    className="flex items-center space-x-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform"
                  >
                    <Plus size={15} />
                    <span>Add User</span>
                  </button>
                </div>

                {users.map(u => (
                  <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                          <UserCircle size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{u.name}</p>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <Mail size={11} className="text-gray-400" />
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone size={11} className="text-gray-400" />
                            <p className="text-xs text-gray-400">{u.phone}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </div>
<div className="flex flex-wrap gap-2 mb-3">

  {/* ROLE */}
  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">
    {u.role}
  </span>

  {/* COLLEGE */}
  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
    {u.college}
  </span>
{/* ASSIGNED YEAR */}
{u.role === "Class Incharge" && u.assignedYear && (
  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">
    📚 {u.assignedYear}
  </span>
)}
  {/* TRANSPORT */}
  {u.canManageTransport && (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cyan-100 text-cyan-700">
      🚌 Transport
    </span>
  )}

  {/* HOSTEL */}
  {u.module?.split(',').includes("Hostel") && (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">
      🏠 Hostel
    </span>
  )}

  {/* BOYS HOSTEL */}
  {u.canManageBoysHostel && (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 text-orange-700">
      👦 Boys Hostel
    </span>
  )}

  {/* GIRLS HOSTEL */}
  {u.canManageGirlsHostel && (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-pink-100 text-pink-700">
      👧 Girls Hostel
    </span>
  )}

  {/* APPROVAL LEVEL */}
  {u.hostelApprovalLevel && (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-700">
      ✓ {u.hostelApprovalLevel}
    </span>
  )}

</div>
<div className="flex gap-2">

 {editSheet.u?.role?.toLowerCase() === "management" ? (

    <button
      onClick={() => openEdit(u)}
      className="w-full flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-2.5 rounded-xl text-sm font-semibold transition-all"
    >
      <Eye size={14} />
      <span>View</span>
    </button>

  ) : (

    <>
      <button
        onClick={() => openEdit(u)}
        className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-blue-50 active:scale-95 text-gray-700 hover:text-blue-700 py-2.5 rounded-xl text-sm font-semibold transition-all"
      >
        <Edit2 size={14} />
        <span>Edit</span>
      </button>

{u.role?.toLowerCase() !== "management" && (
  <button
    onClick={async () => {

      if (u.status === "active") {

        await disableUser(u.id);

      } else {

        await enableUser(u.id);

      }

      await loadUsers();

    }}
    className={`flex-1 flex items-center justify-center space-x-1.5 active:scale-95 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      u.status === 'active'
        ? 'bg-red-50 text-red-600 hover:bg-red-100'
        : 'bg-green-50 text-green-700 hover:bg-green-100'
    }`}
  >

    <Shield size={14} />

    <span>
      {u.status === 'active'
        ? 'Disable'
        : 'Enable'}
    </span>

  </button>
)}
    </>

  )}

</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
        {activeTab === (canManageUsers ? 2 : 1) && (
              <div className="space-y-3">
                {[
                  { title: '🔔 Push Notifications', items: ['Enable push notifications', 'NewOutpass Request','New Leave Application' , 'New User Registration'] },
                ].map(section => (
                  <div key={section.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-700">{section.title}</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                     <div className="flex items-center justify-between px-4 py-3">
  <span>Push Notifications</span>
  <Switch
    checked={pushNotifications}
    onChange={(e) =>
      setPushNotifications(
        e.target.checked
      )
    }
  />
</div>

<div className="flex items-center justify-between px-4 py-3">
  <span>New Outpass Request</span>
  <Switch
    checked={newOutpassRequest}
    onChange={(e) =>
      setNewOutpassRequest(
        e.target.checked
      )
    }
  />
</div>

<div className="flex items-center justify-between px-4 py-3">
  <span>New Leave Application</span>
  <Switch
    checked={newLeaveApplication}
    onChange={(e) =>
      setNewLeaveApplication(
        e.target.checked
      )
    }
  />
</div>

<div className="flex items-center justify-between px-4 py-3">
  <span>New User Registration</span>
  <Switch
    checked={newUserRegistration}
    onChange={(e) =>
      setNewUserRegistration(
        e.target.checked
      )
    }
  />
</div>
                    </div>
                  </div>
                ))}
                <button 
                onClick={async () => {

  await saveNotificationSettings({
    userId: user.id,
    pushNotifications,
    newOutpassRequest,
    newLeaveApplication,
    newUserRegistration
  });

  alert("Settings Saved");
}}className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-transform shadow-sm">
                  <Save size={16} /><span>Save Preferences</span>
                </button>
              </div>
            )}

            {/* ── LOGS ── */}
         {activeTab === (canManageUsers ? 3 : 2) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800">Activity Logs</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{auditLogs.length} entries</span>
                </div>
                {auditLogs.map(log => (
                  <div key={log.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="bg-indigo-100 p-2.5 rounded-xl shrink-0">
                        <Clock size={16} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm"> {log.userName}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{log.action}</p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <span className="text-xs text-gray-400">
  {new Date(log.createdAt).toLocaleString()}</span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{log.ip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── ADD USER SHEET ── */}
      {/* ── ADD USER SHEET ── */}

<BottomSheet
  open={addSheet}
  onClose={() => setAddSheet(false)}
  title="Add New User"
>
  <div className="space-y-4">

    {/* FULL NAME */}

    <FieldInput
      label="Full Name"
      value={newName}
      onChange={setNewName}
      placeholder="e.g. Dr. Ramesh Kumar"
      icon={<UserCircle size={15} />}
    />


    {/* PHONE */}

    <FieldInput
      label="Phone Number"
      value={newPhone}
      onChange={setNewPhone}
      placeholder="10-digit mobile number"
      icon={<Phone size={15} />}
    />


    {/* EMAIL */}

    <FieldInput
      label="Email Address"
      value={newEmail}
      onChange={setNewEmail}
      placeholder="user@college.edu"
      icon={<Mail size={15} />}
    />


    {/* PASSWORD */}

    <PasswordInput
      label="Password"
      value={newPassword}
      onChange={setNewPassword}
      placeholder="Set a password"
    />


    {/* =====================================================
        ROLE
       ===================================================== */}

    <div>

      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        Role
      </label>

      <select
        value={newRoleId}
        onChange={e =>
          setNewRoleId(
            e.target.value
              ? Number(e.target.value)
              : ''
          )
        }
        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
      >

        <option value="">
          Select Role
        </option>

        {staffRoles.map(role => (
          <option
            key={role.id}
            value={role.id}
          >
            {role.name}
          </option>
        ))}

      </select>

    </div>


    {/* =====================================================
        COLLEGE
       ===================================================== */}

    <div>

      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        College
      </label>

      <select
        value={newCollegeId}
        onChange={e =>
          setNewCollegeId(
            e.target.value
              ? Number(e.target.value)
              : ''
          )
        }
        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
      >

        <option value="">
          Select College
        </option>

        {colleges.map(college => (
          <option
            key={college.id}
            value={college.id}
          >
            {college.name}
          </option>
        ))}

      </select>

    </div>

{/* =====================================================
    ASSIGNED YEAR
   ===================================================== */}

{staffRoles.find(
  role => role.id === Number(newRoleId)
)?.name === "Class Incharge" && (

  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      Assigned Year
    </label>

    <select
      value={newAssignedYear}
      onChange={e =>
        setNewAssignedYear(e.target.value)
      }
      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
    >
<option value="">Select Assigned Year</option>

<option value="1st Year">1st Year</option>
<option value="2nd Year">2nd Year</option>
<option value="3rd Year">3rd Year</option>
<option value="Final Year">Final Year</option>
<option value="Internship">Internship</option>
    </select>
  </div>
)}
    {/* =====================================================
        MODULE
       ===================================================== */}

    <div>

      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Module
      </label>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">

        {/* HOSTEL */}

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={newModule
              .split(',')
              .includes("Hostel")}
            onChange={() => {

              const updated =
                toggleModule(
                  newModule,
                  "Hostel"
                );

              setNewModule(updated);

              if (
                !updated
                  .split(',')
                  .includes("Hostel")
              ) {

          setNewBoysHostel(false);
setNewGirlsHostel(false);

setNewHostelApprovalLevel('');
setNewAssignedYear('');


              }

            }}
            className="w-4 h-4"
          />

          <span className="text-sm font-medium text-gray-700">
            Hostel
          </span>

        </label>


        {/* TRANSPORT */}

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={newModule
              .split(',')
              .includes("Transport")}
            onChange={() => {

              const updated =
                toggleModule(
                  newModule,
                  "Transport"
                );

              setNewModule(updated);

            }}
            className="w-4 h-4"
          />

          <span className="text-sm font-medium text-gray-700">
            Transport
          </span>

        </label>

      </div>

    </div>


    {/* =====================================================
        HOSTEL PERMISSIONS
       ===================================================== */}

    {newModule
      .split(',')
      .includes("Hostel") && (

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">

        {/* HOSTEL ACCESS */}

        <div>

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Hostel
          </label>

          <div className="space-y-3">

            {/* BOYS */}

            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={newBoysHostel}
                onChange={e =>
                  setNewBoysHostel(
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />

              <span className="text-sm text-gray-700">
                Boys Hostel
              </span>

            </label>


            {/* GIRLS */}

            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={newGirlsHostel}
                onChange={e =>
                  setNewGirlsHostel(
                    e.target.checked
                  )
                }
                className="w-4 h-4"
              />

              <span className="text-sm text-gray-700">
                Girls Hostel
              </span>

            </label>

          </div>

        </div>


        {/* APPROVAL LEVEL */}

        <div>

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Approval Level
          </label>

          <select
            value={newHostelApprovalLevel}
            onChange={e =>
              setNewHostelApprovalLevel(
                e.target.value
              )
            }
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none"
          >

            <option value="">
              Select Approval Level
            </option>

            <option value="First Level">
              First Level
            </option>

            <option value="Second Level">
              Second Level
            </option>

            <option value="Final Level">
              Final Level
            </option>

          </select>

        </div>

      </div>

    )}


    {/* =====================================================
        PERMISSION PREVIEW
       ===================================================== */}

    {newModule
      .split(',')
      .includes("Transport") && (

      <div className="flex flex-wrap gap-2">

        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
          ✓ Transport
        </span>

      </div>

    )}


    {newModule
      .split(',')
      .includes("Hostel") && (

      <div className="flex flex-wrap gap-2">

        {newBoysHostel && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 text-orange-700">
            ✓ Boys Hostel
          </span>
        )}

        {newGirlsHostel && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-pink-100 text-pink-700">
            ✓ Girls Hostel
          </span>
        )}

        {newHostelApprovalLevel && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-700">
            ✓ {newHostelApprovalLevel}
          </span>
        )}

      </div>

    )}


    {/* =====================================================
        BUTTONS
       ===================================================== */}

    <div className="flex gap-3 pt-2">

      <button
        onClick={() =>
          setAddSheet(false)
        }
        className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform"
      >
        Cancel
      </button>


      <button
        onClick={handleAdd}
        disabled={
          !newName ||
          !newPhone ||
          !newEmail ||
          !newPassword ||
          !newRoleId ||
newCollegeId === '' ||
          !newModule ||
          (
            newModule
              .split(',')
              .includes("Hostel") &&
            !newBoysHostel &&
            !newGirlsHostel
          ) ||
          (
            newModule
              .split(',')
              .includes("Hostel") &&
            !newHostelApprovalLevel
          )
          ||
(
  staffRoles.find(
    role => role.id === Number(newRoleId)
  )?.name === "Class Incharge" &&
  !newAssignedYear
)
        }
        className="flex-1 py-3 rounded-2xl bg-blue-600 disabled:bg-blue-200 text-white text-sm font-semibold active:scale-95 transition-transform"
      >
        Add User
      </button>

    </div>

  </div>
</BottomSheet>

    <BottomSheet
  open={editSheet.open}
  onClose={() =>
    setEditSheet({
      open: false,
      u: null
    })
  }
  title="Edit User"
>
  <div className="space-y-4">

    {/* =====================================================
        MANAGEMENT ACCOUNT
        VIEW ONLY
       ===================================================== */}

{editSheet.u?.role?.toLowerCase() === "management" ? (

      <div className="space-y-4">

        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-green-700">
            Management Account
          </p>

          <p className="text-xs text-green-600 mt-1">
            This account has all permissions and cannot be modified.
          </p>
        </div>

        <FieldInput
          label="Full Name"
          value={editName}
          onChange={() => {}}
          icon={<UserCircle size={15} />}
        />

        <FieldInput
          label="Phone Number"
          value={editPhone}
          onChange={() => {}}
          icon={<Phone size={15} />}
        />

        <FieldInput
          label="Email Address"
          value={editEmail}
          onChange={() => {}}
          icon={<Mail size={15} />}
        />

        <div className="bg-gray-50 rounded-2xl p-4">

          <p className="text-xs font-bold text-gray-500 uppercase mb-3">
            Permissions
          </p>

          <div className="space-y-2 text-sm text-gray-700">

            <p>✓ Transport</p>
            <p>✓ Boys Hostel</p>
            <p>✓ Girls Hostel</p>
            <p>✓ All Approval Levels</p>

          </div>

        </div>

        <button
          onClick={() =>
            setEditSheet({
              open: false,
              u: null
            })
          }
          className="w-full py-3 rounded-2xl bg-gray-200 text-gray-700 text-sm font-semibold"
        >
          Close
        </button>

      </div>

    ) : (

      /* =====================================================
         NORMAL STAFF USER EDIT
         ===================================================== */

      <div className="space-y-4">

        {/* Current user card */}

        {editSheet.u && (
          <div className="flex items-center space-x-3 bg-blue-50 border border-blue-100 rounded-2xl p-3">

            <div className="bg-blue-100 p-2 rounded-xl">
              <UserCircle
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {editSheet.u.name}
              </p>

              <p className="text-xs text-gray-500">
                Editing user details below
              </p>
            </div>

          </div>
        )}

        <FieldInput
          label="Full Name"
          value={editName}
          onChange={setEditName}
          placeholder="Full name"
          icon={<UserCircle size={15} />}
        />

        <FieldInput
          label="Phone Number"
          value={editPhone}
          onChange={setEditPhone}
          placeholder="Phone number"
          icon={<Phone size={15} />}
        />

        <FieldInput
          label="Email Address"
          value={editEmail}
          onChange={setEditEmail}
          placeholder="Email address"
          icon={<Mail size={15} />}
        />

        <PasswordInput
          label="New Password (optional)"
          value={editPassword}
          onChange={setEditPassword}
          placeholder="Leave blank to keep current"
        />

        {/* =====================================================
            COLLEGE
           ===================================================== */}

        <div>

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            College
          </label>

          <select
            value={editCollegeId}
            onChange={e =>
              setEditCollegeId(
                e.target.value
                  ? Number(e.target.value)
                  : ''
              )
            }
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
          >

            <option value="">
              Select College
            </option>

            {colleges.map(college => (
              <option
                key={college.id}
                value={college.id}
              >
                {college.name}
              </option>
            ))}

          </select>

        </div>


        {/* =====================================================
            ROLE
           ===================================================== */}

        <div>

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Role
          </label>

          <select
            value={editRoleId}
            onChange={e => {
              const value = e.target.value;

              setEditRoleId(
                value
                  ? Number(value)
                  : ''
              );
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
          >

            <option value="">
              Select Role
            </option>

            {staffRoles
              .filter(
                role =>
                  role.name !== "System Admin"
              )
              .map(role => (

                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </option>

              ))}

          </select>

        </div>
{/* =====================================================
    ASSIGNED YEAR
   ===================================================== */}

{staffRoles.find(
  role => role.id === Number(editRoleId)
)?.name === "Class Incharge" && (

  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      Assigned Year
    </label>

    <select
      value={editAssignedYear}
      onChange={e =>
        setEditAssignedYear(e.target.value)
      }
      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
    >
<option value="">Select Assigned Year</option>

<option value="1st Year">1st Year</option>
<option value="2nd Year">2nd Year</option>
<option value="3rd Year">3rd Year</option>
<option value="Final Year">Final Year</option>
<option value="Internship">Internship</option>
    </select>
  </div>
)}
{/* =====================================================
    MODULE
   ===================================================== */}

<div>

  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
    Module
  </label>

  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">

    {/* HOSTEL */}

    <label className="flex items-center gap-3">

      <input
        type="checkbox"
        checked={editModule
          .split(',')
          .includes("Hostel")}
        onChange={() => {

          const updated = toggleModule(
            editModule,
            "Hostel"
          );

          setEditModule(updated);

          if (
            !updated
              .split(',')
              .includes("Hostel")
          ) {

            setEditBoysHostel(false);
            setEditGirlsHostel(false);
            setEditHostelApprovalLevel('');

          }

        }}
        className="w-4 h-4"
      />

      <span className="text-sm font-medium text-gray-700">
        Hostel
      </span>

    </label>


    {/* TRANSPORT */}

    <label className="flex items-center gap-3">

      <input
        type="checkbox"
        checked={
          editModule
            .split(',')
            .includes("Transport")
        }
        onChange={() => {

          const updated = toggleModule(
            editModule,
            "Transport"
          );

          setEditModule(updated);

        }}
        className="w-4 h-4"
      />

      <span className="text-sm font-medium text-gray-700">
        Transport
      </span>

    </label>

  </div>

</div>

{editModule
  .split(',')
  .includes("Hostel") && (

  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">

    {/* HOSTEL */}

    <div>

      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Hostel
      </label>

      <div className="space-y-3">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={editBoysHostel}
            onChange={e =>
              setEditBoysHostel(
                e.target.checked
              )
            }
            className="w-4 h-4"
          />

          <span className="text-sm text-gray-700">
            Boys Hostel
          </span>

        </label>


        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={editGirlsHostel}
            onChange={e =>
              setEditGirlsHostel(
                e.target.checked
              )
            }
            className="w-4 h-4"
          />

          <span className="text-sm text-gray-700">
            Girls Hostel
          </span>

        </label>

      </div>

    </div>


    {/* APPROVAL LEVEL */}

    <div>

      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        Approval Level
      </label>

      <select
        value={editHostelApprovalLevel}
        onChange={e =>
          setEditHostelApprovalLevel(
            e.target.value
          )
        }
        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none"
      >

        <option value="">
          Select Approval Level
        </option>

        <option value="First Level">
          First Level
        </option>

        <option value="Second Level">
          Second Level
        </option>

        <option value="Final Level">
          Final Level
        </option>

      </select>

    </div>

  </div>

)}
        {/* =====================================================
            SAVE / CANCEL
           ===================================================== */}

        <div className="flex gap-3 pt-2">

          <button
            onClick={() =>
              setEditSheet({
                open: false,
                u: null
              })
            }
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform"
          >
            Cancel
          </button>

          <button
            onClick={handleEdit}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            Save Changes
          </button>

        </div>

      </div>

    )}

  </div>
</BottomSheet>
    </DashboardLayout>
  );
}
