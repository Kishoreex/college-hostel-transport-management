import { getAllOutpasses } from "../../services/outpassService";
import {
  approveOutpass,
  rejectOutpass
} from "../../services/outpassService";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Users,
  Plus,
  Edit2,
  CheckCircle2,
  X,
  UserCircle,
  Home,
  Search,
  Phone,
  ArrowLeft,
  User as UserIcon,
  UserCheck,
  DoorOpen,
  GraduationCap,
  FileText,
  Calendar,
  ChevronRight,
  AlertCircle,
  LogOut,
  Trash2,
  History,
  Clock,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';

interface HostelManagementProps {
  user: User;
  onLogout: () => void;
}

interface StudentDetail {
  id: string;
  name: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  batch: string;
  parentName: string;
  parentPhone: string;
  address: string;
  roomNumber: string;
  gender: 'boys' | 'girls';
  roommates: string[];
}

interface RoomData {
  roomNumber: string;
  capacity: number;
  gender: 'boys' | 'girls';
  students: StudentDetail[];
}

interface OutpassRequest {
  id: string;
  studentName: string;
  studentId: string;
  gender: 'boys' | 'girls';
  type: 'outpass' | 'leave';
  reason: string;
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  // Leave-specific
  leaveType?: string;
  campus?: 'incampus' | 'outcampus';
  // Outpass-specific
  destination?: string;
  dateTimeOut?: string;
  returnTime?: string;
}

interface VacatingRequest {
  id: string;
  studentId: string;
  studentName: string;
  gender: 'boys' | 'girls';
  department: string;
  year: string;
  batch: string;
  roomNumber: string;
  phone: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'closed';
}

const seedStudents: StudentDetail[] = [
  { id: 'BDS2022011', name: 'Rahul Kumar', phone: '9876543210', college: 'Madha Dental College & Hospital', department: 'BDS', year: '3rd Year', batch: '2022-2027', parentName: 'Suresh Kumar', parentPhone: '9876543200', address: '12, MG Road, Chennai - 600040', roomNumber: 'B-301', gender: 'boys', roommates: ['Amit Shah', 'Vijay Patel'] },
  { id: 'CS2021002', name: 'Amit Shah', phone: '9871234567', college: 'Madha College of Nursing', department: 'B.Sc Nursing', year: '2nd Year', batch: '2021-2025', parentName: 'Nilesh Shah', parentPhone: '9871234500', address: '45, Anna Nagar, Chennai - 600040', roomNumber: 'B-301', gender: 'boys', roommates: ['Rahul Kumar', 'Vijay Patel'] },
  { id: 'ME2021034', name: 'Vijay Patel', phone: '9865432109', college: 'Madha College of Physiotherapy', department: 'BPT', year: '2nd Year', batch: '2021-2025', parentName: 'Ramesh Patel', parentPhone: '9865432100', address: '78, T Nagar, Chennai - 600017', roomNumber: 'B-301', gender: 'boys', roommates: ['Rahul Kumar', 'Amit Shah'] },
  { id: 'BDS2022044', name: 'Sneha Iyer', phone: '9845678901', college: 'Madha Dental College & Hospital', department: 'BDS', year: '3rd Year', batch: '2022-2027', parentName: 'Venkat Iyer', parentPhone: '9845678900', address: '22, Adyar, Chennai - 600020', roomNumber: 'G-405', gender: 'girls', roommates: ['Meera Nair', 'Lakshmi Bai'] },
  { id: 'BDS2022045', name: 'Meera Nair', phone: '9834567890', college: 'Madha Dental College & Hospital', department: 'BDS', year: '3rd Year', batch: '2022-2027', parentName: 'Suresh Nair', parentPhone: '9834567800', address: '5, Velachery, Chennai - 600042', roomNumber: 'G-405', gender: 'girls', roommates: ['Sneha Iyer', 'Lakshmi Bai'] },
  { id: 'NUR2021010', name: 'Lakshmi Bai', phone: '9823456789', college: 'Madha College of Nursing', department: 'B.Sc Nursing', year: '2nd Year', batch: '2021-2025', parentName: 'Rajan Bai', parentPhone: '9823456700', address: '9, Tambaram, Chennai - 600045', roomNumber: 'G-405', gender: 'girls', roommates: ['Sneha Iyer', 'Meera Nair'] },
  { id: 'EC2020046', name: 'Divya Verma', phone: '9812345678', college: 'Madha College of Physiotherapy', department: 'BPT', year: '3rd Year', batch: '2020-2024', parentName: 'Anil Verma', parentPhone: '9812345600', address: '33, Porur, Chennai - 600116', roomNumber: 'G-302', gender: 'girls', roommates: ['Anjali Reddy'] },
  { id: 'EC2020047', name: 'Anjali Reddy', phone: '9801234567', college: 'Madha Dental College & Hospital', department: 'MDS', year: '1st Year', batch: '2025-2027', parentName: 'Ravi Reddy', parentPhone: '9801234500', address: '67, Chromepet, Chennai - 600044', roomNumber: 'G-302', gender: 'girls', roommates: ['Divya Verma'] },
];

const seedRooms: RoomData[] = [
  { roomNumber: 'B-301', capacity: 4, gender: 'boys', students: seedStudents.filter(s => s.roomNumber === 'B-301') },
  { roomNumber: 'B-204', capacity: 4, gender: 'boys', students: [] },
  { roomNumber: 'B-112', capacity: 3, gender: 'boys', students: [] },
  { roomNumber: 'G-405', capacity: 4, gender: 'girls', students: seedStudents.filter(s => s.roomNumber === 'G-405') },
  { roomNumber: 'G-302', capacity: 3, gender: 'girls', students: seedStudents.filter(s => s.roomNumber === 'G-302') },
  { roomNumber: 'G-210', capacity: 4, gender: 'girls', students: [] },
];

const seedOutpasses: OutpassRequest[] = [
  { id: 'OP001', studentName: 'Rahul Kumar', studentId: 'BDS2022011', gender: 'boys', type: 'outpass', reason: 'Medical appointment', destination: 'Government Hospital, Tambaram', dateTimeOut: '2026-06-09 10:00', returnTime: '2026-06-09 18:00', from: '2026-06-09 10:00', to: '2026-06-09 18:00', status: 'pending' },
  { id: 'OP002', studentName: 'Sneha Iyer', studentId: 'BDS2022044', gender: 'girls', type: 'outpass', reason: 'Family function', destination: 'Anna Nagar, Chennai', dateTimeOut: '2026-06-10 08:00', returnTime: '2026-06-10 20:00', from: '2026-06-10 08:00', to: '2026-06-10 20:00', status: 'pending' },
  { id: 'LV001', studentName: 'Amit Shah', studentId: 'CS2021002', gender: 'boys', type: 'leave', leaveType: 'casual', campus: 'outcampus', reason: 'Home visit - festival', from: '2026-06-12', to: '2026-06-15', status: 'pending' },
  { id: 'LV002', studentName: 'Meera Nair', studentId: 'BDS2022045', gender: 'girls', type: 'leave', leaveType: 'emergency', campus: 'outcampus', reason: 'Festival at home', from: '2026-06-14', to: '2026-06-17', status: 'pending' },
];

const seedVacatingRequests: VacatingRequest[] = [
  { id: 'VR001', studentId: 'BDS2020015', studentName: 'Karthik Raja', gender: 'boys', department: 'BDS', year: 'Final Year', batch: '2020-2024', roomNumber: 'B-205', phone: '9876501234', reason: 'Course completed. Planning to move back home.', requestDate: '2026-06-05', status: 'pending' },
  { id: 'VR002', studentId: 'EC2020032', studentName: 'Priya Menon', gender: 'girls', department: 'Electronics', year: '3rd Year', batch: '2021-2025', roomNumber: 'G-102', phone: '9876502345', reason: 'Family relocating to Chennai. Will commute from home.', requestDate: '2026-06-06', status: 'pending' },
  { id: 'VR003', studentId: 'CS2019045', studentName: 'Suresh Kumar', gender: 'boys', department: 'Computer Science', year: 'Final Year', batch: '2019-2023', roomNumber: 'B-310', phone: '9876503456', reason: 'Course completed successfully.', requestDate: '2026-05-28', status: 'closed' },
];

interface HistoryOutpass {
  id: string;
  studentName: string;
  studentId: string;
  gender: 'boys' | 'girls';
  reason: string;
  destination: string;
  dateTimeOut: string;
  expectedReturn: string;
  actualReturn?: string;
}

interface HistoryLeave {
  id: string;
  studentName: string;
  studentId: string;
  gender: 'boys' | 'girls';
  leaveType: string;
  campus: 'incampus' | 'outcampus';
  fromDate: string;
  toDate: string;
  actualReturn?: string;
}



const seedLeaveHistory: HistoryLeave[] = [
  { id: 'HLV01', studentName: 'Amit Shah', studentId: 'CS2021002', gender: 'boys', leaveType: 'Casual', campus: 'outcampus', fromDate: '2026-05-28', toDate: '2026-05-31', actualReturn: '2026-05-31' },
  { id: 'HLV02', studentName: 'Vijay Patel', studentId: 'ME2021034', gender: 'boys', leaveType: 'Sick', campus: 'incampus', fromDate: '2026-06-01', toDate: '2026-06-03', actualReturn: '2026-06-03' },
  { id: 'HLV03', studentName: 'Rahul Kumar', studentId: 'BDS2022011', gender: 'boys', leaveType: 'Emergency', campus: 'outcampus', fromDate: '2026-06-08', toDate: '2026-06-10' },
  { id: 'HLV04', studentName: 'Sneha Iyer', studentId: 'BDS2022044', gender: 'girls', leaveType: 'Casual', campus: 'outcampus', fromDate: '2026-05-30', toDate: '2026-06-02', actualReturn: '2026-06-03' },
  { id: 'HLV05', studentName: 'Meera Nair', studentId: 'BDS2022045', gender: 'girls', leaveType: 'Sick', campus: 'incampus', fromDate: '2026-06-04', toDate: '2026-06-05', actualReturn: '2026-06-05' },
  { id: 'HLV06', studentName: 'Lakshmi Bai', studentId: 'NUR2021010', gender: 'girls', leaveType: 'Emergency', campus: 'outcampus', fromDate: '2026-06-09', toDate: '2026-06-12' },
];

function getDelayMinutes(expected: string, actual: string): number {
  const exp = new Date(expected.replace(' ', 'T')).getTime();
  const act = new Date(actual.replace(' ', 'T')).getTime();
  return Math.round((act - exp) / 60000);
}

// Mobile bottom-sheet style dialog wrapper
function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '20px 20px 0 0',
          position: 'fixed',
          bottom: 0,
          m: 0,
          width: '100%',
          maxWidth: '100%',
          maxHeight: '90vh',
        },
        '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="w-10 h-1 bg-gray-300 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
        <h2 className="font-bold text-gray-800 text-base mt-2">{title}</h2>
        <IconButton size="small" onClick={onClose} sx={{ bgcolor: '#f3f4f6', borderRadius: 2 }}>
          <X size={16} />
        </IconButton>
      </div>
      <DialogContent sx={{ px: 2.5, pb: 3, pt: 0 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default function HostelManagement({ user, onLogout }: HostelManagementProps) {
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
const defaultGender =
  user.canManageGirlsHostel
    ? 'girls'
    : 'boys';

const [roomGender, setRoomGender] =
  useState<'boys' | 'girls'>(defaultGender);

const [outpassGender, setOutpassGender] =
  useState<'boys' | 'girls'>(defaultGender);

const [historyGender, setHistoryGender] =
  useState<'boys' | 'girls'>(defaultGender);
  const [historyType, setHistoryType] = useState<'outpass' | 'leave'>('outpass');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>(seedRooms);
  const [outpasses, setOutpasses] =
  useState<any[]>([]);


  useEffect(() => {
  loadOutpasses();
}, []);

const handleApprove = async (
  id: number
) => {
  try {
    await approveOutpass(id);

    toast.success(
      "Outpass Approved"
    );

    loadOutpasses();
  } catch {
    toast.error(
      "Approval Failed"
    );
  }
};
const handleReject = async (
  id: number
) => {
  await rejectOutpass(id);

  loadOutpasses();
};
const loadOutpasses = async () => {
 const data = await getAllOutpasses();

console.log("API DATA:", data);

setOutpasses(data);
};
  const [vacatingRequests, setVacatingRequests] = useState<VacatingRequest[]>(seedVacatingRequests);
  const [applications, setApplications] = useState([]);
  const pendingOutpasses = outpasses.filter(o => {
  const gender = o.gender?.toLowerCase();

  const matchesGender =
    outpassGender === "boys"
      ? gender === "male"
      : gender === "female";

  return (
    matchesGender &&
    o.status?.toLowerCase() === "pending"
  );
});
  useEffect(() => {
  loadApplications();
}, []);
  // Reject dialog
  const [rejectSheet, setRejectSheet] = useState<{ open: boolean; id: string; type: string }>({ open: false, id: '', type: '' });
  const [rejectRemark, setRejectRemark] = useState('');

  // Add Room sheet
  const [addRoomSheet, setAddRoomSheet] = useState(false);
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomCap, setNewRoomCap] = useState('');

  // Edit Room sheet
  const [editRoomSheet, setEditRoomSheet] = useState<{ open: boolean; room: RoomData | null }>({ open: false, room: null });
  const [editRoomCap, setEditRoomCap] = useState('');
  const [editRoomNum, setEditRoomNum] = useState('');

  // Add Student sheet
  const [addStudentSheet, setAddStudentSheet] = useState<{ open: boolean; roomNumber: string }>({ open: false, roomNumber: '' });
  const [addStudentId, setAddStudentId] = useState('');
  const [addStudentName, setAddStudentName] = useState('');
  const [addStudentPhone, setAddStudentPhone] = useState('');

  const loadApplications = async () => {
  try {
    const response = await fetch(
      "http://192.168.0.167:5077/api/StudentRegistrations"
    );

    const data = await response.json();

    setApplications(data);
  } catch (error) {
    console.error(error);
  }
};

  const visibleStudents =
  user.isSystemAdmin
    ? seedStudents
    : user.canManageBoysHostel
    ? seedStudents.filter(s => s.gender === "boys")
    : seedStudents.filter(s => s.gender === "girls");

const boysCount =
  visibleStudents.filter(s => s.gender === "boys").length;

const girlsCount =
  visibleStudents.filter(s => s.gender === "girls").length;

  const filteredRooms = rooms.filter(r => r.gender === roomGender);
  const allStudentsFlat = rooms.flatMap(r => r.students);
  const filteredStudents = allStudentsFlat.filter(student => {
  if (user.isSystemAdmin) return true;

  if (user.canManageBoysHostel)
    return student.gender === "boys";

  if (user.canManageGirlsHostel)
    return student.gender === "girls";

  return false;
});

const displayStudents =
  searchQuery.length > 1
    ? filteredStudents.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredStudents;


  const confirmReject = () => {
    const req = outpasses.find(o => o.id === rejectSheet.id);
    if (req) toast.error(`${rejectSheet.type === 'leave' ? 'Leave' : 'Outpass'} rejected`, { description: `${req.studentName}'s request has been rejected.` });
    setOutpasses(prev => prev.map(o => o.id === rejectSheet.id ? { ...o, status: 'rejected', remarks: rejectRemark } : o));
    setRejectSheet({ open: false, id: '', type: '' });
    setRejectRemark('');
  };

  const handleAddRoom = () => {
    if (!newRoomNum || !newRoomCap) return;
    setRooms(prev => [...prev, { roomNumber: newRoomNum, capacity: parseInt(newRoomCap), gender: roomGender, students: [] }]);
    setNewRoomNum(''); setNewRoomCap(''); setAddRoomSheet(false);
  };

  const handleEditRoom = () => {
    if (!editRoomSheet.room) return;
    setRooms(prev => prev.map(r => r.roomNumber === editRoomSheet.room!.roomNumber
      ? { ...r, roomNumber: editRoomNum || r.roomNumber, capacity: parseInt(editRoomCap) || r.capacity }
      : r
    ));
    setEditRoomSheet({ open: false, room: null });
  };

  const handleAddStudent = () => {
    if (!addStudentId || !addStudentName) return;
    const s: StudentDetail = { id: addStudentId, name: addStudentName, phone: addStudentPhone, college: 'Madha Institutions', department: '-', year: '-', batch: '-', parentName: '-', parentPhone: '-', address: '-', roomNumber: addStudentSheet.roomNumber, gender: roomGender, roommates: [] };
    setRooms(prev => prev.map(r => r.roomNumber === addStudentSheet.roomNumber ? { ...r, students: [...r.students, s] } : r));
    setAddStudentSheet({ open: false, roomNumber: '' });
    setAddStudentId(''); setAddStudentName(''); setAddStudentPhone('');
  };

  const quickActions = [
    { label: 'Rooms', icon: <DoorOpen size={22} />, color: 'bg-blue-500', screen: 'rooms' },
    { label: 'Students', icon: <GraduationCap size={22} />, color: 'bg-purple-500', screen: 'students' },
    { label: 'Outpass', icon: <FileText size={22} />, color: 'bg-orange-500', screen: 'outpass' },
    { label: 'Leave', icon: <Calendar size={22} />, color: 'bg-teal-500', screen: 'leave' },
    { label: 'Vacating', icon: <LogOut size={22} />, color: 'bg-red-500', screen: 'vacating' },
    { label: 'History', icon: <History size={22} />, color: 'bg-indigo-500', screen: 'history' },
    { label: 'Applications', icon: <Users size={22} />, color: 'bg-rose-500', screen: 'applications' },
  ];

  // Student detail view
  if (selectedStudent) {
    return (
      <DashboardLayout user={user} onLogout={onLogout} title="Student Details">
        <div className="max-w-2xl mx-auto space-y-4 pb-6">
          <button
            onClick={() => setSelectedStudent(null)}
            className="flex items-center space-x-2 text-blue-600 font-medium text-sm mb-2"
          >
            <ArrowLeft size={18} /> <span>Back</span>
          </button>

          {/* Profile header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <UserCircle size={40} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{selectedStudent.name}</h2>
                <p className="text-blue-200 text-sm">{selectedStudent.id}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Phone size={12} className="text-blue-200" />
                  <span className="text-sm text-blue-100">{selectedStudent.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {[
            { title: 'Academic Details', bg: 'bg-blue-50', titleColor: 'text-blue-700', rows: [['College', selectedStudent.college], ['Department', selectedStudent.department], ['Year', selectedStudent.year], ['Batch', selectedStudent.batch]] },
            { title: 'Parent Details', bg: 'bg-green-50', titleColor: 'text-green-700', rows: [['Parent Name', selectedStudent.parentName], ['Phone', selectedStudent.parentPhone], ['Address', selectedStudent.address]] },
            { title: 'Room Details', bg: 'bg-purple-50', titleColor: 'text-purple-700', rows: [['Room Number', selectedStudent.roomNumber]] },
          ].map(section => (
            <div key={section.title} className={`${section.bg} rounded-2xl p-4`}>
              <h3 className={`font-bold text-sm mb-3 ${section.titleColor}`}>{section.title}</h3>
              <div className="space-y-2">
                {section.rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="font-semibold text-gray-800 text-sm text-right max-w-[58%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedStudent.roommates.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-purple-700 mb-3">Roommates</h3>
              <div className="space-y-2">
                {selectedStudent.roommates.map((rm, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-white p-2.5 rounded-xl shadow-sm">
                    <div className="bg-purple-100 p-1.5 rounded-lg">
                      <UserCircle size={16} className="text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{rm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Hostel Management">
      <div className="space-y-4 max-w-2xl mx-auto pb-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: visibleStudents.length, icon: <Users size={20} />, bg: 'bg-blue-500' },
            { label: 'Boys', value: boysCount, icon: <UserIcon size={20} />, bg: 'bg-indigo-500' },
            { label: 'Girls', value: girlsCount, icon: <UserCheck size={20} />, bg: 'bg-pink-500' },
          ].map(stat => (
            <Card key={stat.label} sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <CardContent className="p-3 text-center">
                <div className={`${stat.bg} text-white p-2 rounded-2xl mb-2 w-fit mx-auto`}>{stat.icon}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions (3+3 grid) */}
        {!activeScreen && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => setActiveScreen(qa.screen)}
                    className="flex flex-col items-center space-y-2 p-3 bg-gray-50 hover:bg-gray-100 active:scale-95 rounded-2xl transition-all"
                  >
                    <div className={`${qa.color} text-white p-3.5 rounded-2xl w-14 h-14 flex items-center justify-center shadow-sm`}>
                      {qa.icon}
                    </div>
                    <span className="text-xs text-gray-700 font-semibold">{qa.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: ROOMS ── */}
        {activeScreen === 'rooms' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Room Management</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(
  user.isSystemAdmin
    ? ['boys', 'girls']
    : user.canManageGirlsHostel
    ? ['girls']
    : ['boys']
).map(g => (
                    <button key={g} onClick={() => setRoomGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${roomGender === g ? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                      {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">{filteredRooms.length} rooms</span>
                  <button onClick={() => { setNewRoomNum(''); setNewRoomCap(''); setAddRoomSheet(true); }} className="flex items-center space-x-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform">
                    <Plus size={15} /><span>Add Room</span>
                  </button>
                </div>
                {filteredRooms.map(room => {
                  const occ = room.students.length;
                  const pct = Math.round((occ / room.capacity) * 100);
                  return (
                    <div key={room.roomNumber} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 p-2.5 rounded-xl"><Home size={18} className="text-indigo-600" /></div>
                          <div>
                            <p className="font-bold text-gray-800">Room {room.roomNumber}</p>
                            <p className="text-xs text-gray-400">{occ}/{room.capacity} occupied</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${occ >= room.capacity ? 'bg-red-100 text-red-600' : occ === 0 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`}>
                            {occ >= room.capacity ? 'Full' : occ === 0 ? 'Vacant' : 'Available'}
                          </span>
                          <button onClick={() => { setEditRoomSheet({ open: true, room }); setEditRoomNum(room.roomNumber); setEditRoomCap(String(room.capacity)); }} className="bg-gray-100 p-1.5 rounded-lg active:scale-95 transition-transform">
                            <Edit2 size={14} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      {room.students.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {room.students.map(s => (
                            <button key={s.id} onClick={() => setSelectedStudent(s)} className="w-full flex items-center justify-between bg-gray-50 hover:bg-blue-50 active:bg-blue-100 p-2.5 rounded-xl transition-colors">
                              <div className="flex items-center space-x-2.5">
                                <div className={`${s.gender === 'boys' ? 'bg-indigo-100' : 'bg-pink-100'} p-1.5 rounded-lg`}>
                                  <UserCircle size={16} className={s.gender === 'boys' ? 'text-indigo-500' : 'text-pink-500'} />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-blue-700">{s.name}</p>
                                  <p className="text-xs text-gray-400">{s.id} • {s.phone}</p>
                                </div>
                              </div>
                              <ChevronRight size={14} className="text-gray-300" />
                            </button>
                          ))}
                        </div>
                      )}
                      <button onClick={() => { setAddStudentSheet({ open: true, roomNumber: room.roomNumber }); setAddStudentId(''); setAddStudentName(''); setAddStudentPhone(''); }} className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-200 hover:border-blue-300 text-gray-400 hover:text-blue-500 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]">
                        <Plus size={15} /><span>Add Student</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: STUDENTS ── */}
        {activeScreen === 'students' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">All Students</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></div>
                  <input type="text" placeholder="Search name or student ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-all" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                </div>
                {searchQuery.length > 1 && displayStudents.length === 0 && (
                  <div className="text-center py-8"><Search size={32} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No students found</p></div>
                )}
                <div className="space-y-2">
                  {displayStudents.map(s => (
                    <button key={s.id} onClick={() => setSelectedStudent(s)} className="w-full text-left">
                      <div className="flex items-center justify-between bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 p-3.5 rounded-2xl transition-all shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className={`${s.gender === 'boys' ? 'bg-indigo-100' : 'bg-pink-100'} p-2.5 rounded-xl`}>
                            <UserCircle size={22} className={s.gender === 'boys' ? 'text-indigo-500' : 'text-pink-500'} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.id}</p>
                            <div className="flex items-center space-x-1 mt-0.5"><Phone size={10} className="text-gray-300" /><span className="text-xs text-gray-400">{s.phone}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.gender === 'boys' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}>{s.gender === 'boys' ? 'Boy' : 'Girl'}</span>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: OUTPASS ── */}
        {activeScreen === 'outpass' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Outpass Requests</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(
  user.isSystemAdmin
    ? ['boys', 'girls']
    : user.canManageGirlsHostel
    ? ['girls']
    : ['boys']
).map(g => (
                    <button key={g} onClick={() => setOutpassGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${outpassGender === g ? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                      {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                    </button>
                  ))}
                </div>
              {pendingOutpasses.length === 0 && (
                  <div className="text-center py-10"><FileText size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No outpass requests</p></div>
                )}
     {pendingOutpasses.map(req => (
                  <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 p-2.5 rounded-xl"><UserCircle size={20} className="text-orange-500" /></div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{req.studentName}</p>
                          <p className="text-xs text-gray-400">{req.studentId}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[['Reason', req.reason], ['Destination', req.destination || '—'],[
  'Date & Time Out',
  `${req.validFrom?.split('T')[0]} ${new Date(`2000-01-01T${req.timeOut}`)
  .toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })}`
],
[
  'Return Time',
  `${req.validTo?.split('T')[0]} ${new Date(`2000-01-01T${req.returnTime}`)
  .toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })}`
]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                    {req.remarks && (
                      <div className="flex items-start space-x-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700"><span className="font-semibold">Remark: </span>{req.remarks}</p>
                      </div>
                    )}
                    {req.status?.toLowerCase() === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(Number(req.id))} className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                          <CheckCircle2 size={15} /><span>Accept</span>
                        </button>
                        <button onClick={() => { setRejectSheet({ open: true, id: req.id, type: 'outpass' }); setRejectRemark(''); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-white border-2 border-red-200 hover:bg-red-50 active:scale-95 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-all">
                          <X size={15} /><span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: LEAVE ── */}
        {activeScreen === 'leave' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Leave Requests</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(
  user.isSystemAdmin
    ? ['boys', 'girls']
    : user.canManageGirlsHostel
    ? ['girls']
    : ['boys']
).map(g => (
                    <button key={g} onClick={() => setOutpassGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${outpassGender === g ? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                      {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                    </button>
                  ))}
                </div>
                {outpasses.filter(o => o.gender === outpassGender && o.type === 'leave').length === 0 && (
                  <div className="text-center py-10"><Calendar size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No leave requests</p></div>
                )}
                {outpasses.filter(o => o.gender === outpassGender && o.type === 'leave').map(req => (
                  <div key={req.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-teal-100 p-2.5 rounded-xl"><UserCircle size={20} className="text-teal-500" /></div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{req.studentName}</p>
                          <p className="text-xs text-gray-400">{req.studentId}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    {req.status === 'approved' && req.campus === 'outcampus' && (
                      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-xl p-2.5 mb-3">
                        <FileText size={13} className="text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-700 font-medium">Outpass auto-generated for this out-campus leave</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[
                        ['Leave Type', req.leaveType ? req.leaveType.charAt(0).toUpperCase() + req.leaveType.slice(1) + ' Leave' : '—'],
                        ['Campus', req.campus === 'incampus' ? '🏫 In Campus' : req.campus === 'outcampus' ? '🚪 Out Campus' : '—'],
                        ['Reason', req.reason],
                        ['From Date', req.from],
                        ['To Date', req.to],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                    {req.remarks && (
                      <div className="flex items-start space-x-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700"><span className="font-semibold">Remark: </span>{req.remarks}</p>
                      </div>
                    )}
                    {req.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button  onClick={() => handleApprove(Number(req.id))} className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                          <CheckCircle2 size={15} /><span>Accept</span>
                        </button>
                        <button onClick={() => { setRejectSheet({ open: true, id: req.id, type: 'leave' }); setRejectRemark(''); }} className="flex-1 flex items-center justify-center space-x-1.5 bg-white border-2 border-red-200 hover:bg-red-50 active:scale-95 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-all">
                          <X size={15} /><span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: VACATING ── */}
        {activeScreen === 'vacating' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Vacating Requests</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(
  user.isSystemAdmin
    ? ['boys', 'girls']
    : user.canManageGirlsHostel
    ? ['girls']
    : ['boys']
).map(g => (
                    <button key={g} onClick={() => setOutpassGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${outpassGender === g ? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                      {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                    </button>
                  ))}
                </div>
                {vacatingRequests.filter(r => r.gender === outpassGender).length === 0 && (
                  <div className="text-center py-10"><LogOut size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No vacating requests</p></div>
                )}
                {vacatingRequests.filter(r => r.gender === outpassGender).map(req => (
                  <div key={req.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${req.status === 'closed' ? 'border-gray-300 bg-gray-50' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`${req.status === 'closed' ? 'bg-gray-200' : 'bg-red-100'} p-2.5 rounded-xl`}>
                          <UserCircle size={20} className={req.status === 'closed' ? 'text-gray-400' : 'text-red-500'} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${req.status === 'closed' ? 'text-gray-500' : 'text-gray-800'}`}>{req.studentName}</p>
                          <p className="text-xs text-gray-400">{req.studentId}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${req.status === 'closed' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status === 'closed' ? 'Account Closed' : 'Pending'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[['Department', req.department], ['Year', req.year], ['Batch', req.batch], ['Room', req.roomNumber], ['Phone', req.phone], ['Requested', req.requestDate]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className={`font-medium ${req.status === 'closed' ? 'text-gray-500' : 'text-gray-700'}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">Reason for Vacating:</p>
                      <p className="text-xs text-red-600">{req.reason}</p>
                    </div>
                    {req.status === 'pending' && (
                      <button onClick={() => { if (confirm(`Approve and close ${req.studentName}'s hostel account?`)) { setVacatingRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'closed' } : r)); toast.success('Account closed', { description: `${req.studentName}'s hostel account has been closed.` }); } }} className="w-full flex items-center justify-center space-x-1.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                        <CheckCircle2 size={15} /><span>Approve & Close Account</span>
                      </button>
                    )}
                    {req.status === 'closed' && (
                      <div className="flex items-center justify-center space-x-2 bg-gray-100 py-2.5 rounded-xl">
                        <CheckCircle2 size={14} className="text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500">Account Closed - Data Archived</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: HISTORY ── */}
        {activeScreen === 'history' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Outpass & Leave History</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Gender toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(
  user.isSystemAdmin
    ? ['boys', 'girls']
    : user.canManageGirlsHostel
    ? ['girls']
    : ['boys']
                        ).map(g => (
                    <button key={g} onClick={() => setHistoryGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${historyGender === g ? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                      {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                    </button>
                  ))}
                </div>
                {/* Type toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(['outpass', 'leave'] as const).map(t => (
                    <button key={t} onClick={() => setHistoryType(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${historyType === t ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>
                      {t === 'outpass' ? '📋 Outpass History' : '🗓 Leave History'}
                    </button>
                  ))}
                </div>

                {historyType === 'outpass' && (
                  <>
                    {outpasses
.filter(h => {
  const gender = h.gender?.toLowerCase();

  const matchesGender =
    historyGender === "boys"
      ? gender === "male"
      : gender === "female";

  return (
    matchesGender &&
    h.status?.toLowerCase() === "approved"
  );
})
.map(h => {
                      const isOut = !h.actualReturnTime;
                     const delayMins =
  h.lateMinutes || 0;
                      const isDelayed = delayMins > 0;
                      const isCurrentlyLate = isOut; // still outside past expected time
                      return (
                        <div key={h.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${isCurrentlyLate ? 'border-red-300' : isDelayed ? 'border-amber-200' : 'border-gray-100'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2.5 rounded-xl ${isCurrentlyLate ? 'bg-red-100' : isDelayed ? 'bg-amber-100' : 'bg-green-100'}`}>
                                <UserCircle size={20} className={isCurrentlyLate ? 'text-red-500' : isDelayed ? 'text-amber-600' : 'text-green-600'} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{h.studentName}</p>
                                <p className="text-xs text-gray-400">{h.studentId}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isCurrentlyLate ? 'bg-red-100 text-red-700' : isDelayed ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {isCurrentlyLate ? '🔴 Still Out' : isDelayed ? '⚠️ Delayed' : '✅ On Time'}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                            {[['Reason', h.reason], ['Destination', h.destination], ['Time Out', h.timeOut],['Expected Return', h.returnTime]].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-400">{k}</span>
                                <span className="font-medium text-gray-700">{v}</span>
                              </div>
                            ))}
                            {h.actualReturnTime && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Actual Return</span>
                                <span className={`font-medium ${isDelayed ? 'text-amber-600' : 'text-green-600'}`}>{new Date(
  h.actualReturnTime
).toLocaleString()}{h.actualReturn}</span>
                              </div>
                            )}
                          </div>
                          {isDelayed && h.actualReturn && (
                            <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-3">
                              <Clock size={14} className="text-amber-600 shrink-0" />
                              <p className="text-xs text-amber-800 font-semibold">Returned {delayMins} min{delayMins !== 1 ? 's' : ''} late — entered campus at {h.actualReturn}</p>
                            </div>
                          )}
                          {isCurrentlyLate && (
                            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl p-2.5 mt-3">
                              <AlertCircle size={14} className="text-red-500 shrink-0" />
                              <p className="text-xs text-red-700 font-semibold">Student has not returned yet — expected by {h.expectedReturn}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {historyType === 'leave' && (
                  <>
                    {seedLeaveHistory.filter(h => h.gender === historyGender).map(h => {
                      const isOut = !h.actualReturn && h.campus === 'outcampus';
                      const delayDays = h.actualReturn && h.campus === 'outcampus'
                        ? Math.round((new Date(h.actualReturn).getTime() - new Date(h.toDate).getTime()) / 86400000)
                        : 0;
                      const isDelayed = delayDays > 0;
                      return (
                        <div key={h.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${isOut ? 'border-red-300' : isDelayed ? 'border-amber-200' : 'border-gray-100'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2.5 rounded-xl ${isOut ? 'bg-red-100' : isDelayed ? 'bg-amber-100' : 'bg-teal-100'}`}>
                                <UserCircle size={20} className={isOut ? 'text-red-500' : isDelayed ? 'text-amber-600' : 'text-teal-600'} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{h.studentName}</p>
                                <p className="text-xs text-gray-400">{h.studentId}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${h.campus === 'incampus' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {h.campus === 'incampus' ? '🏫 In Campus' : '🚪 Out Campus'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isOut ? 'bg-red-100 text-red-700' : isDelayed ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {isOut ? '🔴 Still Out' : isDelayed ? '⚠️ Delayed' : '✅ Returned'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                            {[['Leave Type', h.leaveType + ' Leave'], ['From Date', h.fromDate], ['Expected Return', h.toDate]].map(([k, v]) => (
                              <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-400">{k}</span>
                                <span className="font-medium text-gray-700">{v}</span>
                              </div>
                            ))}
                            {h.actualReturn && h.campus === 'outcampus' && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Actual Return</span>
                                <span className={`font-medium ${isDelayed ? 'text-amber-600' : 'text-green-600'}`}>{h.actualReturn}</span>
                              </div>
                            )}
                          </div>
                          {isDelayed && h.actualReturn && (
                            <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-3">
                              <Clock size={14} className="text-amber-600 shrink-0" />
                              <p className="text-xs text-amber-800 font-semibold">Returned {delayDays} day{delayDays !== 1 ? 's' : ''} late — entered campus on {h.actualReturn}</p>
                            </div>
                          )}
                          {isOut && (
                            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl p-2.5 mt-3">
                              <AlertCircle size={14} className="text-red-500 shrink-0" />
                              <p className="text-xs text-red-700 font-semibold">Student has not returned from leave — expected by {h.toDate}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: APPLICATIONS ── */}
        {activeScreen === 'applications' && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Hostel Applications</h3>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">2 Pending</span>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div key={app.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${app.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${app.gender === 'Boys' ? 'bg-indigo-100' : 'bg-pink-100'}`}>
                          <UserCircle size={20} className={app.gender === 'Boys' ? 'text-indigo-500' : 'text-pink-500'} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{app.studentName}</p>
                          <p className="text-xs text-gray-400">{app.registerNumber}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${app.status === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-amber-100 text-amber-700'}`}>
                        {app.status === 'Approved' ? '✅ Approved' : 'Pending'}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[
                        ['College', app.collegeName],
                        ['Department', app.department],
                        ['Year', app.year],
                        ['Batch', app.batch],
                        ['Gender', app.gender],
                        ['Phone', app.phone],
                        ['Applied', app.date],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">Parent / Guardian</p>
                      <p className="text-xs text-blue-600">{app.parentName} — {app.parentPhone}</p>
                      <p className="text-xs text-blue-500 mt-0.5">{app.address}</p>
                    </div>

                    {app.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                        onClick={async () => {
    await fetch(
      `http://192.168.0.167:5077/api/StudentRegistrations/approve/${app.id}`,
      {
        method: "POST"
      }
    );

    loadApplications();
  }}
                        
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                          <CheckCircle2 size={15} /><span>Accept</span>
                        </button>
                        <button 
                        onClick={async () => {
    await fetch(
      `http://192.168.0.167:5077/api/StudentRegistrations/reject/${app.id}`,
      {
        method: "POST"
      }
    );

    loadApplications();
  }}

                        className="flex-1 flex items-center justify-center space-x-1.5 bg-white border-2 border-red-200 hover:bg-red-50 active:scale-95 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-all">
                          <X size={15} /><span>Reject</span>
                        </button>
                      </div>
                    )}
                    {app.status === 'Approved' && (
                      <div className="flex items-center justify-center space-x-2 bg-green-100 py-2.5 rounded-xl">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Application Approved — Room to be Allocated</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── REJECT BOTTOM SHEET ── */}
      <BottomSheet
        open={rejectSheet.open}
        onClose={() => setRejectSheet({ open: false, id: '', type: '' })}
        title={`Reject ${rejectSheet.type === 'leave' ? 'Leave' : 'Outpass'} Request`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2 bg-red-50 border border-red-100 rounded-2xl p-3">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-600">Please provide a reason for rejection. This will be visible to the student.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Remarks</label>
            <textarea
              value={rejectRemark}
              onChange={e => setRejectRemark(e.target.value)}
              placeholder="e.g. Insufficient reason provided, please reapply..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => handleReject(Number(req.id))}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              disabled={!rejectRemark.trim()}
              className="flex-1 py-3 rounded-2xl bg-red-500 disabled:bg-red-200 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── ADD ROOM BOTTOM SHEET ── */}
      <BottomSheet open={addRoomSheet} onClose={() => setAddRoomSheet(false)} title={`Add ${roomGender === 'boys' ? 'Boys' : 'Girls'} Room`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Room Number</label>
            <input
              value={newRoomNum}
              onChange={e => setNewRoomNum(e.target.value)}
              placeholder="e.g. B-401"
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Capacity (beds)</label>
            <input
              type="number"
              value={newRoomCap}
              onChange={e => setNewRoomCap(e.target.value)}
              placeholder="e.g. 4"
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
            />
          </div>
          <div className={`flex items-center space-x-2 p-3 rounded-2xl ${roomGender === 'boys' ? 'bg-indigo-50 border border-indigo-100' : 'bg-pink-50 border border-pink-100'}`}>
            <span className="text-lg">{roomGender === 'boys' ? '👦' : '👧'}</span>
            <span className={`text-sm font-semibold ${roomGender === 'boys' ? 'text-indigo-700' : 'text-pink-700'}`}>
              This room will be added to {roomGender === 'boys' ? 'Boys' : 'Girls'} Hostel
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setAddRoomSheet(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform">Cancel</button>
            <button
              onClick={handleAddRoom}
              disabled={!newRoomNum || !newRoomCap}
              className="flex-1 py-3 rounded-2xl bg-blue-600 disabled:bg-blue-200 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              Add Room
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── EDIT ROOM BOTTOM SHEET ── */}
      <BottomSheet open={editRoomSheet.open} onClose={() => setEditRoomSheet({ open: false, room: null })} title="Edit Room">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Room Number</label>
            <input
              value={editRoomNum}
              onChange={e => setEditRoomNum(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Capacity (beds)</label>
            <input
              type="number"
              value={editRoomCap}
              onChange={e => setEditRoomCap(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setEditRoomSheet({ open: false, room: null })} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform">Cancel</button>
            <button onClick={handleEditRoom} className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold active:scale-95 transition-transform">Save Changes</button>
          </div>
        </div>
      </BottomSheet>

      {/* ── ADD STUDENT BOTTOM SHEET ── */}
      <BottomSheet
        open={addStudentSheet.open}
        onClose={() => setAddStudentSheet({ open: false, roomNumber: '' })}
        title={`Add Student — Room ${addStudentSheet.roomNumber}`}
      >
        <div className="space-y-4">
          {[
            { label: 'Student ID', value: addStudentId, set: setAddStudentId, placeholder: 'e.g. BDS2022099' },
            { label: 'Full Name', value: addStudentName, set: setAddStudentName, placeholder: 'Student full name' },
            { label: 'Phone Number', value: addStudentPhone, set: setAddStudentPhone, placeholder: '10-digit mobile number' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
              <input
                value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setAddStudentSheet({ open: false, roomNumber: '' })} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-semibold active:scale-95 transition-transform">Cancel</button>
            <button
              onClick={handleAddStudent}
              disabled={!addStudentId || !addStudentName}
              className="flex-1 py-3 rounded-2xl bg-blue-600 disabled:bg-blue-200 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              Add Student
            </button>
          </div>
        </div>
      </BottomSheet>
    </DashboardLayout>
  );
}
