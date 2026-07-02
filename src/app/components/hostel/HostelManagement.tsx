    import { getAllOutpasses } from "../../services/outpassService";
    import {
      approveOutpass,
      rejectOutpass
    } from "../../services/outpassService";
    import {
  getLeaveRequests,
  approveLeave,
  rejectLeave
} from "../../../api/leaveService";
    import {
      getAllVacatingRequests,
      approveVacatingRequest,
      rejectVacatingRequest
    } from "../../services/vacatingService";
    import {
      getAllRooms,
      createRoom
    } from "../../services/hostelRoomService";
    import {
      getAllRoomAllocations,
      getAvailableStudents
    } from "../../services/hostelRoomAllocationService";
    import {
    getStudentRegistrations
  } from "../../services/studentRegistrationService";
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
    import API_URL from "../../../api/api";

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
    roommates: {
    name: string;
    phone: string;
    year: string;
    college: string;
  }[];
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


      const [vacatingGender, setVacatingGender] =
      useState<'boys' | 'girls'>(defaultGender);
    const [historyGender, setHistoryGender] =
      useState<'boys' | 'girls'>(defaultGender);
      const [reportGender, setReportGender] =
useState<'boys' | 'girls'>(defaultGender);

const [reportType, setReportType] =
useState("students");
const [reportPeriod, setReportPeriod] =
useState("3years");

const [fromDate, setFromDate] =
useState("");

const [toDate, setToDate] =
useState("");

const downloadReport = async () => {
  try {

    let url =
      `${API_URL}/Reports/export` +
      `?type=${reportType}` +
      `&gender=${reportGender}` +
      `&period=${reportPeriod}` +
      `&fromDate=${fromDate}` +
      `&toDate=${toDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      toast.error("Download Failed");
      return;
    }

    const blob = await response.blob();

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = downloadUrl;

    a.download =
      `${reportGender}_${reportType}.xlsx`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(downloadUrl);

    toast.success("Excel Downloaded");

  } catch {

    toast.error("Download Failed");

  }
};
  const [historyType, setHistoryType] =
    useState<
      'outpass' |
      'leave' |
      'applications' |
      'vacating'
    >('outpass');
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
      const closeStudentSheet = () => {
    setStudentSheetOpen(false);
  };
      const [studentSheetOpen, setStudentSheetOpen] =
  useState(false);
    const [rooms, setRooms] = useState<any[]>([]);

    useEffect(() => {
      loadRooms();
    }, []);


      const loadRooms = async () => {
      try {
        const roomsData = await getAllRooms();
        const allocationsData =
    await getAllRoomAllocations();

  const registrationsData =
    await getStudentRegistrations();

        const rooms = roomsData.map(
          (room: any) => ({
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            gender:
              room.gender?.toLowerCase() === "male"
                ? "boys"
                : "girls",

            students: allocationsData
              .filter(
                (a: any) =>
                  a.roomNumber === room.roomNumber
              ).map((a: any) => {

  console.log("Allocation StudentId:", a.studentId);
console.log("Registrations:", registrationsData);

const registration =
  registrationsData.find(
    (r: any) =>
      String(r.studentId).trim() ===
      String(a.studentId).trim()
  );

console.log("Matched Registration:", registration);

    const roommates =
    allocationsData
      .filter(
        (x: any) =>
          x.roomNumber === a.roomNumber &&
          x.studentId !== a.studentId
      )
      .map((x: any) => {

        const rmRegistration =
          registrationsData.find(
            (r: any) =>
              r.studentId === x.studentId
          );

        return {
          name: x.studentName,
          phone:
            rmRegistration?.phone || "",
          year:
            rmRegistration?.year || "",
          college:
            rmRegistration?.collegeName || ""
        };
      });

    return {
      id: a.studentId,
      name: a.studentName,

      phone:
        registration?.phone || "",

      college:
        registration?.collegeName || "",

      department:
        registration?.department || "",

      year:
        registration?.year || "",

      batch:
        registration?.batch || "",

      parentName:
        registration?.parentName || "",

      parentPhone:
        registration?.parentPhone || "",

      address:
        registration?.address || "",

      roomNumber: a.roomNumber,

      gender:
        a.gender?.toLowerCase() === "male"
          ? "boys"
          : "girls",

      roommates
    };
  })
          })
        );

        console.log("ROOMS:", rooms);

        setRooms(rooms);
      } catch (error) {
        console.error(error);
      }
    };
      const [outpasses, setOutpasses] =
      useState<any[]>([]);
const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
const [leaveHistory, setLeaveHistory] =
  useState<any[]>([]);
      useEffect(() => {
      loadOutpasses();
    }, []);
useEffect(() => {
  loadLeaveRequests();
  loadLeaveHistory();
}, []);
const loadLeaveRequests = async () => {
  const data = await getLeaveRequests();
  setLeaveRequests(data);
};
const loadLeaveHistory = async () => {
  try {

    const response = await fetch(`${API_URL}/LeaveRequests/history`);

    const data = await response.json();

    setLeaveHistory(data);

  } catch (error) {

    console.error(error);

  }
};
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
    const handleApproveLeave = async (
  id: number
) => {
  try {
    await approveLeave(id);

    toast.success(
      "Leave Approved"
    );

    loadLeaveRequests();
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
    const handleRejectLeave = async (
  id: number
) => {
  await rejectLeave(id);

  loadLeaveRequests();
};
    const loadOutpasses = async () => {
    const data = await getAllOutpasses();

    console.log("API DATA:", data);

    setOutpasses(data);
    };
      const [vacatingRequests, setVacatingRequests] =
      useState<any[]>([]);
      const [applicationHistory, setApplicationHistory] =
    useState<any[]>([]);

  const [vacatingHistory, setVacatingHistory] =
    useState<any[]>([]);
      useEffect(() => {
      loadVacatingRequests();
    }, []);

    const loadVacatingRequests =
      async () => {
        const data =
          await getAllVacatingRequests();
    console.log(vacatingRequests);
      console.log(data);
        setVacatingRequests(data);
      };
      const handleApproveVacating =
      async (id: number) => {
        try {
          await approveVacatingRequest(id);

          toast.success(
            "Vacating Request Approved"
          );

          loadVacatingRequests();
        } catch {
          toast.error(
            "Approval Failed"
          );
        }
      };

    const handleRejectVacating =
      async (id: number) => {
        try {
          await rejectVacatingRequest(id);

          toast.success(
            "Vacating Request Rejected"
          );

          loadVacatingRequests();
        } catch {
          toast.error(
            "Reject Failed"
          );
        }
      };
      const loadApplicationHistory = async () => {
    try {
      const response = await fetch(
        `${API_URL}/StudentRegistrations/history`
      );

      const data = await response.json();

      setApplicationHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadVacatingHistory = async () => {
    try {
      const response = await fetch(
        `${API_URL}/Vacating/history`
      );

      const data = await response.json();

      console.log("VACATING HISTORY:", data);

      setVacatingHistory(data);
    } catch (error) {
      console.error(error);
    }
  };
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

      loadRooms();
    loadApplications();
    loadVacatingRequests();

    loadApplicationHistory();
    loadVacatingHistory();
    }, []);

    useEffect(() => {
    loadHistory();
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
      const [availableStudents, setAvailableStudents] =
      useState<any[]>([]);
      const [addStudentId, setAddStudentId] = useState('');
      const [addStudentName, setAddStudentName] = useState('');
      const [addStudentPhone, setAddStudentPhone] = useState('');

      const loadApplications = async () => {
      try {
      const response = await fetch(
    `${API_URL}/StudentRegistrations`
  );

        const data = await response.json();

        setApplications(data);
      } catch (error) {
        console.error(error);
      }
    };
    const loadHistory = async () => {
    try {
      const appResponse = await fetch(
        `${API_URL}/StudentRegistrations/history`
      );

      const vacResponse = await fetch(
        `${API_URL}/Vacating/history`
      );

      const appData =
        await appResponse.json();

      const vacData =
        await vacResponse.json();

      setApplicationHistory(appData);
      setVacatingHistory(vacData);
    } catch (error) {
      console.error(error);
    }
  };
      const filteredVacatingRequests =
      vacatingRequests.filter(req => {
        const gender = req.gender?.toLowerCase();

        return vacatingGender === "boys"
          ? gender === "male"
          : gender === "female";
      });
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
    const dashboardStudents =
  filteredStudents;

const totalCount =
  dashboardStudents.length;

const boysCount =
  dashboardStudents.filter(
    s => s.gender === "boys"
  ).length;

const girlsCount =
  dashboardStudents.filter(
    s => s.gender === "girls"
  ).length;

    const displayStudents =
      searchQuery.length > 1
        ? filteredStudents.filter(
            s =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : filteredStudents;


    const confirmReject = async () => {
  if (rejectSheet.type === "leave") {
   await rejectLeave(
    Number(rejectSheet.id),
    rejectRemark
);

    toast.success("Leave Rejected");

    loadLeaveRequests();
  } else {
    await rejectOutpass(Number(rejectSheet.id));

    toast.success("Outpass Rejected");

    loadOutpasses();
  }

  setRejectSheet({
    open: false,
    id: "",
    type: ""
  });

  setRejectRemark("");
};
    const handleAddRoom = async () => {
      try {
        await createRoom({
          gender:
            roomGender === "boys"
              ? "Male"
              : "Female",

          block:
            roomGender === "boys"
              ? "B"
              : "G",

          roomNumber: newRoomNum,
          capacity: Number(newRoomCap),
          status: "Available"
        });

        await loadRooms();

        setNewRoomNum("");
        setNewRoomCap("");
        setAddRoomSheet(false);

        toast.success("Room Added Successfully");
      } catch (error) {
        console.error(error);

        toast.error("Failed To Add Room");
      }
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

      const allocateStudent = async (
    student: any
  ) => {
    try {
      const response = await fetch(
    `${API_URL}/HostelRoomAllocation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        studentId: student.studentId,
        block: "A",
        roomNumber: addStudentSheet.roomNumber,
        bedNumber: "1"
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.log(errorText);

    throw new Error(errorText);
  }

  toast.success("Student Allocated Successfully");

      loadRooms();

      setAddStudentSheet({
        open: false,
        roomNumber: ""
      });
    }
    catch (error) {
      console.error(error);

      toast.error(
        "Allocation Failed"
      );
    }
  };

      const quickActions = [
        { label: 'Rooms', icon: <DoorOpen size={22} />, color: 'bg-blue-500', screen: 'rooms' },
        { label: 'Students', icon: <GraduationCap size={22} />, color: 'bg-purple-500', screen: 'students' },
        { label: 'Outpass', icon: <FileText size={22} />, color: 'bg-orange-500', screen: 'outpass' },
        { label: 'Leave', icon: <Calendar size={22} />, color: 'bg-teal-500', screen: 'leave' },
   
      
        { label: 'Applications', icon: <Users size={22} />, color: 'bg-rose-500', screen: 'applications' },
             { label: 'Vacating', icon: <LogOut size={22} />, color: 'bg-red-500', screen: 'vacating' },
         { label: 'History', icon: <History size={22} />, color: 'bg-indigo-500', screen: 'history' },
    ...(user.isSystemAdmin
  ? [{
      label: 'Reports',
      icon: <FileText size={22} />,
      color: 'bg-emerald-500',
      screen: 'reports'
    }]
  : [])
      ];
      const reportPeriods = [
  {
    value: "3years",
    label: "📅 Last 3 Years"
  },
  {
    value: "1year",
    label: "📆 Last 1 Year"
  },
  {
    value: "6months",
    label: "🗓 Last 6 Months"
  },
  {
    value: "3months",
    label: "📋 Last 3 Months"
  },
  {
    value: "1month",
    label: "📄 Last 1 Month"
  },
  {
    value: "today",
    label: "☀ Today"
  },
  {
    value: "custom",
    label: "📌 Custom Range"
  }
];

const reportTypes = [
  {
    value: "students",
    title: "Students",
    icon: "🎓"
  },
  {
    value: "applications",
    title: "Applications",
    icon: "📝"
  },
  {
    value: "outpasses",
    title: "Outpasses",
    icon: "🚪"
  },
  {
    value: "leaves",
    title: "Leaves",
    icon: "📅"
  },
  {
    value: "vacating",
    title: "Vacating",
    icon: "🏠"
  }
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
    <div
      key={i}
      className="bg-white p-3 rounded-xl shadow-sm"
    >
      <div className="font-semibold text-purple-700">
        {rm.name}
      </div>

      <div className="text-sm text-gray-600">
        📞 {rm.phone}
      </div>

      <div className="text-sm text-gray-600">
        🎓 {rm.year}
      </div>

      <div className="text-sm text-gray-600">
        🏫 {rm.college}
      </div>
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
          {!activeScreen && (
<div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: totalCount, icon: <Users size={20} />, bg: 'bg-blue-500' },
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
)}

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
                                <button key={s.id}onClick={() => {
    setSelectedStudent(s);
    setStudentSheetOpen(true);
  }}  className="w-full flex items-center justify-between bg-gray-50 hover:bg-blue-50 active:bg-blue-100 p-2.5 rounded-xl transition-colors">
                                  <div className="flex items-center space-x-2.5">
                                    <div className={`${s.gender === 'boys' ? 'bg-indigo-100' : 'bg-pink-100'} p-1.5 rounded-lg`}>
                                      <UserCircle size={16} className={s.gender === 'boys' ? 'text-indigo-500' : 'text-pink-500'} />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-sm font-semibold text-blue-700">{s.name}</p>
                                      <p className="text-xs text-gray-500"> {s.year}• {s.college}• {s.phone}</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-300" />
                                </button>
                              ))}
                            </div>
                          )}
                          <button onClick={async () => {
      const gender =
        room.gender === "boys"
          ? "male"
          : "female";
    const students =
      await getAvailableStudents(gender);

    console.log("AVAILABLE STUDENTS:", students);

    setAvailableStudents(students);

      setAvailableStudents(students);

      setAddStudentSheet({
        open: true,
        roomNumber: room.roomNumber
      });
    }} className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-200 hover:border-blue-300 text-gray-400 hover:text-blue-500 py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]">
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
                      <input type="text"placeholder="Search Student Id " value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition-all" />
                      {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
                    </div>
                    {searchQuery.length > 1 && displayStudents.length === 0 && (
                      <div className="text-center py-8"><Search size={32} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">No students found</p></div>
                    )}
                    <div className="space-y-2">
                      {displayStudents.map(s => (
                        <button key={s.id} onClick={() => {
    setSelectedStudent(s);
    setStudentSheetOpen(true);
  }}className="w-full">
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
                  {leaveRequests.filter(o =>
  (outpassGender === "boys"
    ? o.gender?.toLowerCase() === "male"
    : o.gender?.toLowerCase() === "female") &&
  o.status?.toLowerCase() === "pending"
).length === 0 && (
                      <div className="text-center py-10"><Calendar size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No leave requests</p></div>
                    )}
                   {leaveRequests
  .filter(o =>
    (outpassGender === "boys"
      ? o.gender?.toLowerCase() === "male"
      : o.gender?.toLowerCase() === "female") &&
    o.status?.toLowerCase() === "pending"
  )
  .map(req => (
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
  [
    "Leave Type",
    req.leaveType
      ? req.leaveType.charAt(0).toUpperCase() +
        req.leaveType.slice(1) +
        " Leave"
      : "-"
  ],

  [
    "Campus",
    req.campus === "In Campus"
      ? "🏫 In Campus"
      : "🚪 Out Campus"
  ],

  ...(req.campus === "Out Campus"
    ? [["Destination", req.destination]]
    : []),

  [
    "Reason",
    req.reason
  ],

  [
    "From Date",
    req.fromDate?.split("T")[0]
  ],

  [
    "To Date",
    req.toDate?.split("T")[0]
  ]
].map(([k, v]) => (
  <div
    key={String(k)}
    className="flex justify-between text-sm"
  >
    <span className="text-gray-400">{k}</span>

    <span className="font-medium text-gray-700">
      {v}
    </span>
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
                            <button  onClick={() => handleApproveLeave(Number(req.id))} className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
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
                        <button key={g} onClick={() => setVacatingGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${ vacatingGender === g? (g === 'boys' ? 'bg-blue-600 text-white shadow' : 'bg-pink-500 text-white shadow') : 'text-gray-500'}`}>
                          {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                        </button>
                      ))}
                    </div>
                {vacatingRequests.length === 0&& (
                      <div className="text-center py-10"><LogOut size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No vacating requests</p></div>
                    )}
                {filteredVacatingRequests.map(req => (
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
                        {req.status?.toLowerCase() === "pending" && (
      <div className="space-y-2">
        <button
          onClick={() => handleApproveVacating(Number(req.id))}
          className="w-full flex items-center justify-center space-x-1.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <CheckCircle2 size={15} />
          <span>Approve & Close Account</span>
        </button>

        <button
          onClick={() => handleRejectVacating(Number(req.id))}
          className="w-full flex items-center justify-center space-x-1.5 bg-white border-2 border-red-200 hover:bg-red-50 active:scale-95 text-red-500 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <X size={15} />
          <span>Reject</span>
        </button>
      </div>
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
                  <h3 className="font-bold text-gray-800">History</h3>
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
                      {(
  [
    'outpass',
    'leave',
    'applications',
    'vacating'
  ] as const
  ).map(t => (
                        <button key={t} onClick={() => setHistoryType(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${historyType === t ? 'bg-white text-gray-800 shadow' : 'text-gray-500'}`}>
                        {
    t === 'outpass'
      ? '📋 Outpass History'
      : t === 'leave'
      ? '🗓 Leave History'
      : t === 'applications'
      ? '👨‍🎓 Applications'
      : '🚪 Vacating'
  }
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
    h.status?.toLowerCase() === "completed" &&
    !h.leaveRequestId
);
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .map(h => {
   

    const exitedEarly =
      h.actualExitTime &&
      new Date(h.actualExitTime) <
      new Date(
        `${h.validFrom.split("T")[0]}T${h.timeOut}`
      );

    const stillOut =
      h.actualExitTime &&
      !h.actualReturnTime;

    const overdue =
      stillOut &&
      new Date() >
      new Date(
        `${h.validTo.split("T")[0]}T${h.returnTime}`
      );

    const returnedLate =
      h.actualReturnTime &&
      (h.lateMinutes || 0) > 0;

   const now = new Date();

const exitTime = new Date(
  `${h.validFrom.split("T")[0]}T${h.timeOut}`
);

const returnTime = new Date(
  `${h.validTo.split("T")[0]}T${h.returnTime}`
);

const waitingForExit =
  !h.actualExitTime &&
  now < exitTime;

const expiredWithoutExit =
  !h.actualExitTime &&
  now >= exitTime;

const returnedInTime =
  h.actualReturnTime &&
  (h.lateMinutes || 0) === 0;

const earlyMinutes =
  h.earlyExitMinutes || 0;

    const delayMins =
      h.lateMinutes || 0;// still outside past expected time
                          return (
                            <div key={h.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${overdue ? 'border-red-300' : returnedLate ? 'border-amber-200' : 'border-gray-100'}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2.5 rounded-xl ${overdue ? 'bg-red-100' : returnedLate ? 'bg-amber-100' : 'bg-green-100'}`}>
                                    <UserCircle size={20} className={overdue ? 'text-red-500' : returnedLate ? 'text-amber-600' : 'text-green-600'} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{h.studentName}</p>
                                    <p className="text-xs text-gray-400">{h.studentId}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${overdue ? 'bg-red-100 text-red-700' : returnedLate ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
{
waitingForExit
? '🟡 Waiting For Exit'

: expiredWithoutExit
? '❌ Not Exited'

: exitedEarly
? `🟠 Exited Early (${earlyMinutes} min)`

: overdue
? '🔴 Overdue'

: returnedLate
? `⚠️ Returned Late (${h.lateMinutes} min)`

: returnedInTime
? '✅ Returned In Time'

: '🟢 Outside Hostel'
}
                   </span>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                {[['Reason', h.reason], ['Destination', h.destination], [
'Time Out',
new Date(`2000-01-01T${h.timeOut}`)
.toLocaleTimeString([],{
hour:'numeric',
minute:'2-digit',
hour12:true
})
],

[
'Expected Return',
new Date(`2000-01-01T${h.returnTime}`)
.toLocaleTimeString([],{
hour:'numeric',
minute:'2-digit',
hour12:true
})
]].map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-sm">
                                    <span className="text-gray-400">{k}</span>
                                    <span className="font-medium text-gray-700">{v}</span>
                                  </div>
                                ))}
                                {h.actualExitTime && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">
      Actual Exit
    </span>

    <span
      className={`font-medium ${
        exitedEarly
          ? "text-orange-600"
          : "text-green-600"
      }`}
    >
      {new Date(h.actualExitTime).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
      )}
    </span>
  </div>
)}
                             {h.actualReturnTime && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">
      Actual Return
    </span>

    <span
      className={`font-medium ${
        returnedLate
          ? "text-amber-600"
          : "text-green-600"
      }`}
    >
      {new Date(h.actualReturnTime).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      )}
    </span>
  </div>
)}
   
                                {expiredWithoutExit && (
<div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3 text-red-700 text-sm font-semibold">
❌ Student did not exit before the outpass expired.
</div>
)}

{exitedEarly && (
<div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-3 text-orange-700 text-sm font-semibold">
🟠 Student exited {earlyMinutes} minute(s) early.
</div>
)}

{returnedInTime && (
<div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3 text-green-700 text-sm font-semibold">
✅ Student returned within the permitted time.
</div>
)}
                              </div>
                              {returnedLate && h.actualReturnTime && (
                                <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-3">
                                  <Clock size={14} className="text-amber-600 shrink-0" />
                                  <p className="text-xs text-amber-800 font-semibold">Returned {delayMins} min{delayMins !== 1 ? 's' : ''} late — entered campus at {h.actualReturnTime}</p>
                                </div>
                              )}
                              {overdue && (
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
                {historyType === "applications" && (
    <>
      {applicationHistory
        .filter((item: any) =>
          historyGender === "boys"
            ? item.gender?.toLowerCase() === "male"
            : item.gender?.toLowerCase() === "female"
        )
        .map((item: any) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-4 shadow-sm ${
              item.status === "Approved"
                ? "border-green-200"
                : "border-red-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    item.status === "Approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <UserCircle
                    size={20}
                    className={
                      item.status === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  />
                </div>

                <div>
                  <p className="font-bold text-gray-800">
                    {item.studentName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.registerNumber}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status === "Approved"
                  ? "✅ Approved"
                  : "❌ Rejected"}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <span>🏫 College</span>
                <span>{item.collegeName}</span>
              </div>

              <div className="flex justify-between">
                <span>📚 Department</span>
                <span>{item.department}</span>
              </div>

              <div className="flex justify-between">
                <span>🎓 Year</span>
                <span>{item.year}</span>
              </div>

              <div className="flex justify-between">
                <span>📱 Phone</span>
                <span>{item.phone}</span>
              </div>
            </div>

            <div
              className={`mt-3 rounded-xl p-3 border ${
                item.status === "Approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  item.status === "Approved"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {item.status === "Approved"
                  ? "Hostel Application Approved"
                  : "Hostel Application Rejected"}
              </p>
            </div>
          </div>
        ))}
    </>
  )}
  {historyType === "vacating" && (
    <>
      {vacatingHistory
        .filter((item: any) =>
          historyGender === "boys"
            ? item.gender?.toLowerCase() === "male"
            : item.gender?.toLowerCase() === "female"
        )
        .map((item: any) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-4 shadow-sm ${
              item.status === "Approved"
                ? "border-green-200"
                : "border-red-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    item.status === "Approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <LogOut
                    size={20}
                    className={
                      item.status === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  />
                </div>

                <div>
                  <p className="font-bold text-gray-800">
                    {item.studentName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Room {item.roomNumber}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status === "Approved"
                  ? "✅ Approved"
                  : "❌ Rejected"}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <span>📚 Department</span>
                <span>{item.department}</span>
              </div>

              <div className="flex justify-between">
                <span>🎓 Year</span>
                <span>{item.year}</span>
              </div>

              <div className="flex justify-between">
                <span>📱 Phone</span>
                <span>{item.phone}</span>
              </div>

              <div className="flex justify-between">
                <span>🚪 Room</span>
                <span>{item.roomNumber}</span>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
              <p className="font-semibold text-red-700 mb-1">
                Reason For Vacating
              </p>

              <p className="text-sm text-red-600">
                {item.reason}
              </p>
            </div>

            <div
              className={`mt-3 rounded-xl p-3 border ${
                item.status === "Approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  item.status === "Approved"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {item.status === "Approved"
                  ? "Account Closed Successfully"
                  : "Vacating Request Rejected"}
              </p>
            </div>
          </div>
        ))}
    </>
  )}
                    {historyType === 'leave' && (
                      <>
                        {leaveHistory.filter(h =>
    historyGender === "boys"
        ? h.gender?.toLowerCase() === "male"
        : h.gender?.toLowerCase() === "female"
).map(h => {
                         const now = new Date();

const exitTime = new Date(
  `${h.fromDate.split("T")[0]}T${h.exitTime || "00:00"}`
);

const returnTime = new Date(
  `${h.toDate.split("T")[0]}T${h.returnTime || "23:59"}`
);

const isOutCampus = h.campus === "Out Campus";

const waitingForExit =
  isOutCampus &&
  !h.actualExitTime &&
  now < exitTime;

const expiredWithoutExit =
  isOutCampus &&
  !h.actualExitTime &&
  now >= exitTime;
const outsideCampus =
  isOutCampus &&
  h.actualExitTime &&
  !h.actualReturnTime &&
  now <= returnTime;

const overdueOutside =
  isOutCampus &&
  h.actualExitTime &&
  !h.actualReturnTime &&
  now > returnTime;

const returnedLate =
  h.actualReturnTime &&
  (h.lateMinutes || 0) > 0;

const returnedInTime =
  h.actualReturnTime &&
  (h.lateMinutes || 0) === 0;
const exitedEarly =
  (h.earlyExitMinutes || 0) > 0;
const scheduledExitTime = new Date(
  `${h.fromDate.split("T")[0]}T${h.exitTime}`
);
                     const delayDays =
    h.lateMinutes && h.actualReturnTime
        ? Math.round(
            (
              new Date(h.actualReturnTime).getTime() -
              new Date(h.toDate).getTime()
            ) / 86400000
          )
        : 0;
                          const isDelayed = delayDays > 0;
                          return (
                           <div
key={h.id}
className={`bg-white border rounded-2xl p-4 shadow-sm ${
    overdueOutside
        ? "border-red-300"
        : outsideCampus
        ? "border-blue-300"
        : returnedLate
        ? "border-amber-300"
        : "border-gray-100"
}`}
>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                       

  <div
    className={`p-2.5 rounded-xl ${
      overdueOutside
        ? "bg-red-100"
        : outsideCampus
        ? "bg-blue-100"
        : returnedLate
        ? "bg-amber-100"
        : "bg-green-100"
    }`}
  >
    <UserCircle
      size={20}
      className={
        overdueOutside
          ? "text-red-500"
          : outsideCampus
          ? "text-blue-600"
          : returnedLate
          ? "text-amber-600"
          : "text-teal-600"
      }
    />
  </div>

  <div>
    <p className="font-bold text-gray-800 text-sm">{h.studentName}</p>
    <p className="text-xs text-gray-400">{h.studentId}</p>
  </div>

</div>                                <div className="flex flex-col items-end gap-1">
                                  
                                 <span
className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
    overdueOutside
        ? "bg-red-100 text-red-700"
        : outsideCampus
        ? "bg-blue-100 text-blue-700"
        : returnedLate
        ? "bg-amber-100 text-amber-700"
        : waitingForExit
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
}`}
>
  {
!isOutCampus
    ? (now <= returnTime
        ? "🟢 Active Leave"
        : "✅ Leave Completed")

: waitingForExit
? "🟡 Waiting For Exit"

: expiredWithoutExit
? "❌ Not Exited"

: exitedEarly
? `🔴 Exited Early (${h.earlyExitMinutes} min)`

: outsideCampus
? "🟢 Outside Campus"


: overdueOutside
? "🔴 Outside Beyond Return Time"

: returnedLate
? `⚠️ Returned Late (${h.lateMinutes} min)`

: returnedInTime
? "✅ Returned In Time"

: "Completed"
}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                {[
  [
    "Leave Type",
    h.leaveType + " Leave"
  ],

[
"Campus",
h.campus === "In Campus"
    ? "🏫 In Campus"
    : "🚪 Out Campus"
],

...(h.campus?.toLowerCase() === "out campus"
|| h.campus?.toLowerCase() === "outcampus"
? [["Destination", h.destination || "-"]]
: []),

  [
    "Reason",
    h.reason
  ],

  [
    "From Date",
    h.fromDate?.split("T")[0]
  ],

  [
    "Expected Return",
    h.toDate?.split("T")[0]
  ]
  
].map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-sm">
                                    <span className="text-gray-400">{k}</span>
                                    <span className="font-medium text-gray-700">{v}</span>
                                  </div>
                                ))}
                                {h.actualExitTime && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">
      Actual Exit
    </span>

    <span className="font-medium text-red-600">
      {new Date(h.actualExitTime).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      )}
    </span>
  </div>
)}
                                {h.actualReturnTime && (
                                  <div className="flex justify-between text-sm">
                                   <span className="text-gray-400">
  Actual Return
</span>

<span
  className={`font-medium ${
    isDelayed
      ? "text-amber-600"
      : "text-green-600"
  }`}
>
  {new Date(h.actualReturnTime).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }
  )}
</span>
                                  </div>
                                )}
                              </div>
                          {returnedLate && h.actualReturnTime && (
      <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-3">
        <Clock size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-semibold">
          Returned {delayDays} day{delayDays !== 1 ? 's' : ''} late —
          entered campus at{" "}
{new Date(h.actualReturnTime).toLocaleString(
  "en-IN",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }
)}
        </p>
      </div>
    )}
                             {isOutCampus && outsideCampus && (
<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
    <p className="text-sm font-semibold text-blue-700">
        🟢 Student is currently outside the campus and is still within the permitted leave time.
    </p>
</div>
)}
{isOutCampus && overdueOutside && (
<div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
    <AlertCircle
        size={14}
        className="text-red-500"
    />

    <p className="text-sm font-semibold text-red-700">
        Student is still outside the campus after the permitted return time.
    </p>
</div>
)}
                              {isOutCampus && expiredWithoutExit && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
    <p className="text-sm font-semibold text-red-700">
      ❌ Leave expired before the student exited.
    </p>
  </div>
)}
{isOutCampus && exitedEarly && h.actualExitTime && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3">
    <p className="text-sm font-semibold text-red-700">
      🔴 Student exited {h.earlyExitMinutes} minute{h.earlyExitMinutes !== 1 ? "s" : ""} early.
    </p>

    <p className="text-xs text-red-600 mt-1">
      Expected Exit :
      {" "}
      {scheduledExitTime.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}
    </p>

    <p className="text-xs text-red-600">
      Actual Exit :
      {" "}
      {new Date(h.actualExitTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}
    </p>
  </div>
)}
{returnedInTime && (
  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
    <p className="text-sm font-semibold text-green-700">
      ✅ Student returned within the permitted leave period.
    </p>
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

        {activeScreen === "reports" && (
  <Card sx={{ borderRadius: 3 }}>
    <div className="flex items-center px-4 pt-4 pb-3 border-b">
      <button
        onClick={() => setActiveScreen(null)}
        className="mr-2"
      >
        <ArrowLeft size={18} />
      </button>

      <h3 className="font-bold text-lg">
        Reports
      </h3>
    </div>

    <CardContent className="space-y-5">

      {/* Gender */}

      <div>
        <p className="text-sm font-semibold mb-2 text-gray-700">
          Select Hostel
        </p>

        <div className="flex bg-gray-100 rounded-2xl p-1">

          {(user.isSystemAdmin
            ? ["boys", "girls"]
            : user.canManageGirlsHostel
            ? ["girls"]
            : ["boys"]
          ).map(g => (

            <button
              key={g}
              onClick={() =>
                setReportGender(g as "boys" | "girls")
              }
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                reportGender === g
                  ? g === "boys"
                    ? "bg-blue-600 text-white"
                    : "bg-pink-500 text-white"
                  : "text-gray-600"
              }`}
            >
              {g === "boys"
                ? "👦 Boys Hostel"
                : "👧 Girls Hostel"}
            </button>

          ))}

        </div>
      </div>

      {/* Report Type */}

      <div>

        <p className="text-sm font-semibold mb-3 text-gray-700">
          Select Report
        </p>

        <div className="grid grid-cols-1 gap-3">

          {reportTypes.map(item => (

            <button
              key={item.value}
              onClick={() =>
                setReportType(item.value)
              }
              className={`text-left border rounded-2xl p-4 transition ${
                reportType === item.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="font-bold text-base">
                {item.icon} {item.title}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Download {item.title} Excel Report
              </div>

            </button>

          ))}

        </div>

      </div>

      {/* Time Period */}

      <div>

        <p className="text-sm font-semibold mb-3 text-gray-700">
          Select Time Period
        </p>

        <div className="grid grid-cols-2 gap-3">

          {reportPeriods.map(item => (

            <button
              key={item.value}
              onClick={() =>
                setReportPeriod(item.value)
              }
              className={`rounded-xl border p-3 text-sm font-medium transition ${
                reportPeriod === item.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200"
              }`}
            >
              {item.label}
            </button>

          ))}

        </div>

      </div>

      {/* Custom Date */}
{reportPeriod === "custom" && (

<Card
    sx={{
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        boxShadow: "none",
        mt: 1
    }}
>

<CardContent className="space-y-5">

<div className="flex items-center gap-2">

<div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
📅
</div>

<div>
<div className="font-bold">
Custom Date Range
</div>

<div className="text-sm text-gray-500">
Choose report start and end dates
</div>

</div>

</div>
<div className="space-y-4">

  <div>
    <p className="text-sm font-semibold text-gray-600 mb-2">
      From Date
    </p>

    <TextField
      fullWidth
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          background: "#fff",
          height: 52
        }
      }}
    />
  </div>

  <div>
    <p className="text-sm font-semibold text-gray-600 mb-2">
      To Date
    </p>

    <TextField
      fullWidth
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          background: "#fff",
          height: 52
        }
      }}
    />
  </div>

</div>

</CardContent>

</Card>

)}

      {/* Summary */}

      <Card
        sx={{
          borderRadius: 3,
          bgcolor: "#F9FAFB"
        }}
      >

        <CardContent>

          <div className="font-bold mb-4">
            📊 Report Summary
          </div>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Hostel</span>

              <b>
                {reportGender === "boys"
                  ? "👦 Boys"
                  : "👧 Girls"}
              </b>
            </div>

            <div className="flex justify-between">
              <span>Report</span>

              <b>
                {
                  reportTypes.find(
                    x => x.value === reportType
                  )?.title
                }
              </b>
            </div>

            <div className="flex justify-between">
              <span>Period</span>

              <b>
                {
                  reportPeriods.find(
                    x => x.value === reportPeriod
                  )?.label
                }
              </b>
            </div>

          </div>

        </CardContent>

      </Card>

      {/* Download */}

      <button
    onClick={downloadReport}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold transition-all"
>
    ⬇ Download Excel Report
</button>

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
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
    {applications.filter(
      (a: any) => a.status === "Pending"
    ).length} Pending
  </span></div>
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
                        <span
    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
      app.status?.toLowerCase() === "approved"
        ? "bg-green-200 text-green-800"
        : app.status?.toLowerCase() === "rejected"
        ? "bg-red-200 text-red-800"
        : "bg-amber-100 text-amber-700"
    }`}
  >
    {app.status?.toLowerCase() === "approved"
      ? "✅ Approved"
      : app.status?.toLowerCase() === "rejected"
      ? "❌ Rejected"
      : "⏳ Pending"}
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

                        {app.status?.toLowerCase() === 'pending' && (
                          <div className="flex gap-2">
                            <button
                            onClick={async () => {
        await fetch(
          `${API_URL}/StudentRegistrations/approve/${app.id}`,
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
          `${API_URL}/StudentRegistrations/reject/${app.id}`,
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
                        {app.status?.toLowerCase() === 'approved' && (
                          <div className="flex items-center justify-center space-x-2 bg-green-100 py-2.5 rounded-xl">
                            <CheckCircle2 size={14} className="text-green-600" />
                            <span className="text-xs font-semibold text-green-700">Application Approved — Room to be Allocated</span>
                          </div>
                          
                        )}
                        {app.status?.toLowerCase() === 'rejected' && (
    <div className="flex items-center justify-center space-x-2 bg-red-100 py-2.5 rounded-xl">
      <X size={14} className="text-red-600" />
      <span className="text-xs font-semibold text-red-700">
        Application Rejected
      </span>
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
      onClose={() =>
        setAddStudentSheet({
          open: false,
          roomNumber: ""
        })
      }
      title={`Add Student - Room ${addStudentSheet.roomNumber}`}
    >
      <div className="space-y-3">
        {availableStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
      <Users
        size={48}
        className="text-gray-300 mb-3"
      />

      <p className="text-gray-500 font-medium">
        No Students Available
      </p>

      <p className="text-sm text-gray-400">
        All students are already allocated
      </p>
    </div>
        ) : (
          availableStudents.map((student) => (
          <div
      key={student.studentId}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">

          <div className="bg-blue-100 p-3 rounded-xl">
            <GraduationCap
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>
            <h3 className="font-bold text-gray-800 text-base">
              {student.studentName}
            </h3>

            <p className="text-sm text-gray-500">
              ID: {student.studentId}
            </p>

            <div className="flex gap-2 mt-2">
              <Chip
                size="small"
                label={student.year}
                color="primary"
              />

              <Chip
                size="small"
                label={student.department}
                color="success"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => allocateStudent(student)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm"
        >
          Allocate
        </button>
      </div>
    </div>
          ))
        )}
      </div>
    </BottomSheet>

  
        </DashboardLayout>
      );
    }
