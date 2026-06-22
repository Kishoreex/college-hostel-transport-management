import {
  createOutpass,
  getStudentOutpasses,
  markExit,
  markReturn
} from "../../services/outpassService";
import { useState, useRef, useEffect } from 'react';  
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Avatar,
  Dialog,
  Chip,
} from '@mui/material';
import {
  Building2,
  Bus,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  User as UserIcon,
  X,
  History,
  Bell,
  Navigation,
  LogOut,
  AlertTriangle,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import OutpassQRCard from '../outpass/OutpassQRCard';
import type { User, OutpassRequest } from '../../types';
import type { MenuItemType } from '../common/DashboardLayout';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}
const HOSTEL_LAT = 12.991809;

const HOSTEL_LNG = 80.085388;

const GEOFENCE_RADIUS = 150;

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};
type StudentView = 'dashboard' | 'outpass' | 'leave' | 'history' | 'route' | 'announcements' | 'vacate' | 'cancel';

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [outpassDialogOpen, setOutpassDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [qrCardOpen, setQrCardOpen] = useState(false);
  const [selectedOutpass, setSelectedOutpass] = useState<OutpassRequest | null>(null);
  const [vacateDialogOpen, setVacateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [vacateReason, setVacateReason] = useState('');

  const [outpassForm, setOutpassForm] = useState({
    reason: '',
    destination: '',
    date: '',
    timeOut: '',
    returnTime: '',
  });

  const [leaveForm, setLeaveForm] = useState({
    type: '',
    campus: '' as '' | 'incampus' | 'outcampus',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const isHostel = user.serviceType === 'hostel';
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'history' | 'password'>('info');
  const [changePwdForm, setChangePwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(URL.createObjectURL(file));
  };
  const loadOutpasses = async () => {
  try {
    const data =
      await getStudentOutpasses(
        user.studentId || ""
      );

    console.log(data);

    setOutpasses(data);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  loadOutpasses();
}, []);
  const [outpasses, setOutpasses] =
useState<any[]>([]);

const activeOutpass = outpasses.find(
  x =>
    x.outpassState === "Active" ||
    x.outpassState === "Outside Hostel"
);
    useEffect(() => {

  alert("GPS EFFECT STARTED");

  if (!activeOutpass) {
    alert("NO ACTIVE OUTPASS");
    return;
  }

  alert("ACTIVE OUTPASS FOUND");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      alert(
        "LAT = " +
        position.coords.latitude
      );
    },
    (error) => {
      alert(
        "GPS ERROR: " +
        error.message
      );
    }
  );

const timer = setInterval(() => {

  navigator.geolocation.getCurrentPosition(
    async (position) => {

      const distance =
        getDistanceMeters(
          HOSTEL_LAT,
          HOSTEL_LNG,
          position.coords.latitude,
          position.coords.longitude
        );

      console.log("Distance:", distance);

      if (
        distance > GEOFENCE_RADIUS &&
        !activeOutpass.actualExitTime
      ) {

        await markExit(
          activeOutpass.id,
          position.coords.latitude,
          position.coords.longitude
        );

        await loadOutpasses();

        toast.success("Exit Recorded");
      }

      if (
        distance <= GEOFENCE_RADIUS &&
        activeOutpass.actualExitTime &&
        !activeOutpass.actualReturnTime
      ) {

        await markReturn(
          activeOutpass.id,
          position.coords.latitude,
          position.coords.longitude
        );

        await loadOutpasses();

        toast.success("Return Recorded");
      }
    },
    (error) => {
      console.log(error);
    }
  );

}, 15000);

  return () => clearInterval(timer);

}, [activeOutpass]);



  const handleOutpassSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const data = {
  outpassNumber: `OP${Date.now()}`,
  studentId: user.studentId || "",
  studentName: user.name || "",
  gender: user.gender || "",

  destination: outpassForm.destination,
  reason: outpassForm.reason,
  timeOut: outpassForm.timeOut,
  returnTime: outpassForm.returnTime,

  leaveRequestId: 0,
  validFrom: new Date(outpassForm.date),
  validTo: new Date(outpassForm.date),

  status: "Pending"
};

    console.log("Sending:", data);

    await createOutpass(data);

await loadOutpasses();
    toast.success("Outpass submitted");
    setOutpassDialogOpen(false);

    setOutpassForm({
      reason: "",
      destination: "",
      date: "",
      timeOut: "",
      returnTime: ""
    });

  } catch (error) {
    console.error(error);
    toast.error("Failed to submit outpass");
  }
};

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.campus) { toast.error('Please select In Campus or Out Campus.'); return; }
    if (leaveForm.campus === 'outcampus') {
      const generatedOutpass: OutpassRequest = {
        id: `LV-OP${Date.now()}`,
        studentId: user.studentId || 'CS2021001',
        studentName: user.name,
        department: user.department || 'BDS',
        hostelBlock: 'A Block',
        date: leaveForm.fromDate,
        reason: `Leave - ${leaveForm.reason}`,
        destination: 'Home / Outside Campus',
        status: 'pending',
        timeOut: '08:00 AM',
        expectedReturn: leaveForm.toDate ? `${leaveForm.toDate} 08:00 PM` : '08:00 PM',
      };
      setOutpasses(prev => [generatedOutpass, ...prev]);
    }
    setLeaveForm({ type: '', campus: '', fromDate: '', toDate: '', reason: '' });
    setLeaveDialogOpen(false);
    toast.success('Leave application submitted!', {
      description: leaveForm.campus === 'outcampus'
        ? 'An outpass has been generated — pending warden approval.'
        : 'Waiting for warden approval.'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return null;
    }
  };

  const hostelMenuItems: MenuItemType[] = [
    { icon: <Building2 size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <FileText size={22} />, label: 'Request Outpass', active: currentView === 'outpass', onClick: () => { setCurrentView('dashboard'); setOutpassDialogOpen(true); } },
    { icon: <Calendar size={22} />, label: 'Apply Leave', active: currentView === 'leave', onClick: () => { setCurrentView('dashboard'); setLeaveDialogOpen(true); } },
    { icon: <History size={22} />, label: 'Request History', active: currentView === 'history', onClick: () => setCurrentView('history') },
    { icon: <UserIcon size={22} />, label: 'My Profile', active: false, onClick: () => { setProfileDialogOpen(true); setProfileTab('info'); } },
    { icon: <LogOut size={22} />, label: 'Vacate Hostel', active: currentView === 'vacate', onClick: () => { setCurrentView('dashboard'); setVacateDialogOpen(true); } },
  ];

  const transportMenuItems: MenuItemType[] = [
    { icon: <Bus size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <Navigation size={22} />, label: 'Route Info', active: currentView === 'route', onClick: () => setCurrentView('route') },
    { icon: <Bell size={22} />, label: 'Announcements', active: currentView === 'announcements', onClick: () => setCurrentView('announcements') },
    { icon: <UserIcon size={22} />, label: 'My Profile', active: false, onClick: () => { setProfileDialogOpen(true); setProfileTab('info'); } },
    { icon: <XCircle size={22} />, label: 'Cancel Transport', active: currentView === 'cancel', onClick: () => { setCurrentView('dashboard'); setCancelDialogOpen(true); } },
  ];

  const menuItems = isHostel ? hostelMenuItems : transportMenuItems;

  const viewTitle = {
    dashboard: isHostel ? 'Hostel Dashboard' : 'Transport Dashboard',
    history: 'Request History',
    route: 'Route Info',
    announcements: 'Announcements',
    outpass: 'Request Outpass',
    leave: 'Apply Leave',
  }[currentView];

  return (
    <DashboardLayout user={user} onLogout={onLogout} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* History View */}
        {currentView === 'history' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">All Outpass Requests</h3>
              <div className="space-y-3">
                {outpasses.map((outpass) => {console.log(outpasses);
                  const isLeaveOutpass =
  outpass.status?.toLowerCase() === "approved";
                  return (
                  <div
  key={outpass.id}
  className={`rounded-xl p-3 ${
    outpass.status?.toLowerCase() === "approved"
      ? "bg-green-50 border border-green-200"
      : "bg-gray-50"
  }`}
>  {isLeaveOutpass && (
                      <div className="flex items-center space-x-1.5 mb-2">
                        <Calendar size={12} className="text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700">
  
</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm"> Reason: {outpass.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip
                            label={outpass.status}
                              color={getStatusColor(outpass.status?.toLowerCase())}
                            size="small"
                           icon={getStatusIcon(outpass.status?.toLowerCase())}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </div>
                      </div>
                      {outpass.status?.toLowerCase() === 'approved' && (
                        <button
                          onClick={() => { setSelectedOutpass(outpass); setQrCardOpen(true); }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium active:scale-95"
                        >
                          Show Pass
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                     <span className="flex items-center">
<Calendar size={12} className="mr-1" />
{new Date(outpass.validFrom).toLocaleDateString()}
</span>
                      <span className="flex items-center"><Clock size={12} className="mr-1" />{new Date(`2000-01-01T${outpass.timeOut}`)
  .toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} - {new Date(`2000-01-01T${outpass.returnTime}`)
  .toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}</span>
                      <span className="flex items-center"><MapPin size={12} className="mr-1" />{outpass.destination}</span>
                    </div>
                  </div>
                  );
                })}
                {outpasses.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">No outpass requests yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Info View */}
        {currentView === 'route' && (
          <>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">My Route Details</h3>
                  <Bus size={20} className="text-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">Route 5 - Anna Nagar</p></div>
                  <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">TN-01-AB-1234</p></div>
                  <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">Anna Nagar East</p></div>
                  <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">7:30 AM</p></div>
                  <div><p className="text-gray-500 text-xs">Drop Point</p><p className="font-medium">College Gate</p></div>
                  <div><p className="text-gray-500 text-xs">Drop Time</p><p className="font-medium">5:30 PM</p></div>
                </div>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-3">Route Stops</h3>
                <div className="space-y-2">
                  {['Anna Nagar East - 7:30 AM', 'Anna Nagar Tower - 7:35 AM', 'Koyambedu - 7:45 AM', 'Poonamallee - 7:55 AM', 'Madha College - 8:10 AM'].map((stop, i) => (
                    <div key={i} className="flex items-center space-x-3 py-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i === 0 ? 'bg-green-500' : i === 4 ? 'bg-red-500' : 'bg-blue-400'}`} />
                      <p className="text-sm text-gray-700">{stop}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}


        {/* Announcements View */}
        {currentView === 'announcements' && (
          <div className="space-y-3">
            {[
              { title: 'Route 5 - Time Change', body: 'Pickup time changed to 7:15 AM from Monday, June 8th onwards.', date: '2 days ago', color: 'border-blue-500 bg-blue-50' },
              { title: 'Holiday Notice', body: 'No bus service on June 15th (Public Holiday). Plan your travel accordingly.', date: '3 days ago', color: 'border-orange-500 bg-orange-50' },
              { title: 'Fee Reminder', body: 'Transport fee for June must be paid by June 15th to avoid service suspension.', date: '5 days ago', color: 'border-red-500 bg-red-50' },
              { title: 'New Pickup Stop Added', body: 'New stop added at Koyambedu Signal on Route 5.', date: '1 week ago', color: 'border-green-500 bg-green-50' },
            ].map((ann, i) => (
              <Card key={i} sx={{ borderRadius: 3 }}>
                <CardContent className="p-4">
                  <div className={`border-l-4 pl-3 ${ann.color} rounded-r-xl p-3`}>
                    <p className="font-semibold text-gray-800 text-sm">{ann.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{ann.body}</p>
                    <p className="text-xs text-gray-400 mt-2">{ann.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Default Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            {/* Profile Card */}
            <Card className="overflow-hidden" sx={{ borderRadius: 3 }}>
              <div className={`h-20 ${isHostel ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gradient-to-r from-green-500 to-green-700'}`} />
              <CardContent className="px-4 pb-4 -mt-10">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar src={profilePhoto || user.avatar} alt={user.name} sx={{ width: 80, height: 80, border: '4px solid white' }} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white active:scale-90 transition-transform"
                    >
                      <Camera size={12} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex-1 mt-10">
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      <span className="flex items-center"><UserIcon size={14} className="mr-1" />{user.studentId}</span>
                      <span className="flex items-center"><Building2 size={14} className="mr-1" />{user.department}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      <span>{user.year}</span>
                      <span>•</span>
                      <span>{user.college}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HOSTEL VIEW */}
            {isHostel && (
              
              <>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={24} className="text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{outpasses.length}</span>
                    </div>
                    <p className="text-xs text-gray-600">Total Outpasses</p>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Hostel Details</h3>
                      <Building2 size={20} className="text-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500 text-xs">Block</p><p className="font-medium">A Block</p></div>
                      <div><p className="text-gray-500 text-xs">Room</p><p className="font-medium">A-301</p></div>
                      <div><p className="text-gray-500 text-xs">Bed</p><p className="font-medium">B2</p></div>
                      <div><p className="text-gray-500 text-xs">Warden</p><p className="font-medium">Dr. Sharma</p></div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutpassDialogOpen(true)}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <FileText size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Request Outpass</p>
                  </button>
                  <button
                    onClick={() => setLeaveDialogOpen(true)}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Calendar size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Apply Leave</p>
                  </button>
                </div>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Recent Outpasses</h3>
                      <button onClick={() => setCurrentView('history')} className="text-blue-600 text-xs font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {outpasses
  .filter(
    x =>
      x.reason &&
      x.destination
  )
  .slice(0, 2)
  .map((outpass) => (
  <div
    key={outpass.id}
    className={`rounded-xl p-3 ${
      outpass.status?.toLowerCase() === "approved"
        ? "bg-green-50 border border-green-200"
        : "bg-gray-50"
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">
          {outpass.reason}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <Chip
            label={outpass.status}
            color={getStatusColor(
              outpass.status?.toLowerCase()
            )}
            size="small"
            icon={getStatusIcon(
              outpass.status?.toLowerCase()
            )}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        </div>
      </div>

      {outpass.status?.toLowerCase() ===
        "approved" && (
        <button
          onClick={() => {
            setSelectedOutpass(outpass);
            setQrCardOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium"
        >
          Show Pass
        </button>
      )}
    </div>

    <div className="flex flex-wrap gap-2 text-xs text-gray-600">

      <span className="flex items-center">
        <Calendar size={12} className="mr-1" />
        {new Date(
          outpass.validFrom
        ).toLocaleDateString()}
      </span>

      <span className="flex items-center">
        <Clock size={12} className="mr-1" />
        {new Date(
          `2000-01-01T${outpass.timeOut}`
        ).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
        {" - "}
        {new Date(
          `2000-01-01T${outpass.returnTime}`
        ).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </span>

      <span className="flex items-center">
        <MapPin size={12} className="mr-1" />
        {outpass.destination}
      </span>

    </div>
  </div>
))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
{activeOutpass && (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>

      <h3 className="font-bold text-green-700">
        Active Outpass
      </h3>

      <p>
        {activeOutpass.reason}
      </p>

      <p>
        {activeOutpass.destination}
      </p>
<p>
  State :
  {activeOutpass.outpassState}
</p>

<p>
  Exit Time :
  {
    activeOutpass.actualExitTime
      ? new Date(
          activeOutpass.actualExitTime
        ).toLocaleString()
      : "-"
  }
</p>

<p>
  Return Time :
  {
    activeOutpass.actualReturnTime
      ? new Date(
          activeOutpass.actualReturnTime
        ).toLocaleString()
      : "-"
  }
</p>

<p>
  Late Minutes :
  {
    activeOutpass.lateMinutes ?? 0
  }
</p>
      <button
        onClick={() => {
          setSelectedOutpass(activeOutpass);
          setQrCardOpen(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Show Pass
      </button>

    </CardContent>
  </Card>
)}
            {/* TRANSPORT VIEW */}
            {!isHostel && (
              <>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin size={24} className="text-blue-500" />
                      <span className="text-lg font-bold text-gray-800">Route 5</span>
                    </div>
                    <p className="text-xs text-gray-600">Active Route</p>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Transport Details</h3>
                      <Bus size={20} className="text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">Route 5 - Anna Nagar</p></div>
                      <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">TN-01-AB-1234</p></div>
                      <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">Anna Nagar</p></div>
                      <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">7:30 AM</p></div>
                      <div><p className="text-gray-500 text-xs">Drop Time</p><p className="font-medium">5:30 PM</p></div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrentView('route')}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Navigation size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Route Info</p>
                  </button>
                  <button
                    onClick={() => setCurrentView('announcements')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Bell size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Announcements</p>
                  </button>
                </div>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Announcements</h3>
                      <button onClick={() => setCurrentView('announcements')} className="text-blue-600 text-xs font-medium">
                        View All
                      </button>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
                      <p className="font-semibold text-gray-800 text-sm">Route 5 - Time Change</p>
                      <p className="text-xs text-gray-600 mt-1">Pickup time changed to 7:15 AM from Monday</p>
                      <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      {/* Outpass Dialog */}
      <Dialog open={outpassDialogOpen} onClose={() => setOutpassDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Request Outpass</h2>
          <button onClick={() => setOutpassDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleOutpassSubmit} className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={outpassForm.reason}
              onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3} required
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text" value={outpassForm.destination}
              onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date" value={outpassForm.date}
              onChange={(e) => setOutpassForm({ ...outpassForm, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Out</label>
              <input type="time" value={outpassForm.timeOut}
                onChange={(e) => setOutpassForm({ ...outpassForm, timeOut: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Time</label>
              <input type="time" value={outpassForm.returnTime}
                onChange={(e) => setOutpassForm({ ...outpassForm, returnTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            Submit Request
          </button>
        </form>
      </Dialog>

      {/* Leave Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Apply Leave</h2>
          <button onClick={() => setLeaveDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleLeaveSubmit} className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required
            >
              <option value="">Select Type</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Campus Status</label>
            <div className="flex gap-3">
              {([['incampus', '🏫 In Campus'], ['outcampus', '🚪 Out Campus']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLeaveForm({ ...leaveForm, campus: val })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${leaveForm.campus === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input type="date" value={leaveForm.fromDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input type="date" value={leaveForm.toDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={4} required />
          </div>
          {leaveForm.campus === 'outcampus' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
              <FileText size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">Out Campus leave — an <span className="font-bold">Outpass will be auto-generated</span> once the warden approves your leave request.</p>
            </div>
          )}
          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            Submit Application
          </button>
        </form>
      </Dialog>

      {selectedOutpass && (
        <OutpassQRCard open={qrCardOpen} onClose={() => setQrCardOpen(false)} outpass={selectedOutpass} student={user} />
      )}

      {/* Vacate Hostel Dialog */}
      <Dialog open={vacateDialogOpen} onClose={() => setVacateDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-red-500 to-red-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Vacate Hostel</h2>
          <button onClick={() => setVacateDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-sm mb-1">Important Notice</p>
                <p className="text-xs text-red-700">This request will permanently close your hostel account. Your room will be deallocated and all hostel access will be revoked after admin approval. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Current Hostel Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium text-gray-800">{user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-800">{user.department}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Vacating</label>
            <textarea
              value={vacateReason}
              onChange={(e) => setVacateReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={4}
              placeholder="Please provide a detailed reason for vacating the hostel..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setVacateDialogOpen(false); setVacateReason(''); }}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (vacateReason.trim()) {
                  toast.success('Vacating request submitted!', { description: 'The warden will review your request.' });
                  setVacateDialogOpen(false);
                  setVacateReason('');
                }
              }}
              disabled={!vacateReason.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Transport Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Cancel Transport</h2>
          <button onClick={() => setCancelDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-orange-800 text-sm mb-1">Important Notice</p>
                <p className="text-xs text-orange-700">This request will permanently close your transport account. Your bus seat will be deallocated and all transport access will be revoked after admin approval. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Current Transport Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium text-gray-800">{user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-800">{user.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium text-gray-800">Route 5 - Anna Nagar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Number:</span>
                  <span className="font-medium text-gray-800">TN-01-AB-1234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
            <textarea
              value={vacateReason}
              onChange={(e) => setVacateReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows={4}
              placeholder="Please provide a detailed reason for cancelling transport service..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setCancelDialogOpen(false); setVacateReason(''); }}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (vacateReason.trim()) {
                  toast.success('Cancellation request submitted!', { description: 'Transport Coordinator will review shortly.' });
                  setCancelDialogOpen(false);
                  setVacateReason('');
                }
              }}
              disabled={!vacateReason.trim()}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── PROFILE DIALOG ── */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className={`${isHostel ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'} p-4 flex items-center justify-between`}>
          <h2 className="text-white text-xl font-bold">My Profile</h2>
          <button onClick={() => setProfileDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>

        {/* Tab bar */}
        <div className="flex bg-white border-b border-gray-200 shadow-sm">
          {(['info', 'history', 'password'] as const).map(tab => (
            <button key={tab} onClick={() => setProfileTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${profileTab === tab ? (isHostel ? 'text-blue-600 border-b-2 border-blue-600' : 'text-green-600 border-b-2 border-green-600') : 'text-gray-400'}`}>
              {tab === 'info' ? '👤 Info' : tab === 'history' ? '📋 History' : '🔒 Password'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-10">

          {/* ── INFO TAB ── */}
          {profileTab === 'info' && (
            <>
              <div className={`${isHostel ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'} rounded-3xl p-5 text-white`}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar src={profilePhoto || user.avatar} alt={user.name} sx={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.5)' }} />
                    <button onClick={() => profileFileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1 shadow-md active:scale-90 transition-transform">
                      <Camera size={12} />
                    </button>
                    <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-white/80 text-sm">{user.studentId}</p>
                    <p className="text-white/70 text-xs mt-1">{isHostel ? '🏠 Hostel' : '🚌 Transport'} Student</p>
                  </div>
                </div>
              </div>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent className="p-4 space-y-2">
                  {[
                    ['College', user.college || 'Madha Dental College & Hospital'],
                    ['Department', user.department || 'BDS'],
                    ['Year', user.year || '2nd Year'],
                    ['Student ID', user.studentId || '—'],
                    ['Email', user.email || '—'],
                    ['Service', isHostel ? 'Hostel' : 'Transport'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-semibold text-gray-700">{v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {profileTab === 'history' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">All Outpass Requests ({outpasses.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {outpasses.map(op => {
                    const isLeaveOp = op.id.startsWith('LV-OP') || op.id === 'OP-LEAVE-AUTO';
                    return (
                      <div key={op.id} className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 leading-snug">{op.reason}</p>
                            {isLeaveOp && <span className="text-xs text-teal-600 font-medium">📅 From approved leave</span>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-2 ${op.status === 'approved' ? 'bg-green-100 text-green-700' : op.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {op.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{op.date} • {op.timeOut} → {op.expectedReturn}</p>
                        <p className="text-xs text-gray-400">📍 {op.destination}</p>
                      </div>
                    );
                  })}
                  {outpasses.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No records</p>}
                </div>
              </div>

              {isHostel && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">Leave Applications</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[
                      { id: 'LV-H1', type: 'Casual Leave', campus: 'Out Campus', from: '2026-05-28', to: '2026-05-31', status: 'approved', reason: 'Home visit' },
                      { id: 'LV-H2', type: 'Sick Leave', campus: 'In Campus', from: '2026-06-01', to: '2026-06-02', status: 'approved', reason: 'Fever — rest in room' },
                      { id: 'LV-H3', type: 'Emergency Leave', campus: 'Out Campus', from: '2026-06-12', to: '2026-06-15', status: 'approved', reason: 'Festival at home' },
                    ].map(lv => (
                      <div key={lv.id} className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{lv.type}</p>
                            <p className="text-xs text-gray-500">{lv.campus}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">{lv.status}</span>
                        </div>
                        <p className="text-xs text-gray-400">{lv.from} → {lv.to}</p>
                        <p className="text-xs text-gray-400">Reason: {lv.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PASSWORD TAB ── */}
          {profileTab === 'password' && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`${isHostel ? 'bg-blue-100' : 'bg-green-100'} p-3 rounded-2xl`}>
                    <Lock size={22} className={isHostel ? 'text-blue-600' : 'text-green-600'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Change Password</h3>
                    <p className="text-xs text-gray-500">Keep your account secure</p>
                  </div>
                </div>
                {(['current', 'newPwd', 'confirm'] as const).map((field, i) => (
                  <div key={field} className="relative">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      {field === 'current' ? 'Current Password' : field === 'newPwd' ? 'New Password' : 'Confirm New Password'}
                    </label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={changePwdForm[field]}
                      onChange={e => setChangePwdForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={field === 'current' ? '••••••••' : field === 'newPwd' ? 'Min 8 characters' : 'Repeat new password'}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition-all"
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-4 bottom-3.5 text-gray-400">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                ))}
                {changePwdForm.confirm && changePwdForm.newPwd !== changePwdForm.confirm && (
                  <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
                <button
                  onClick={() => {
                    if (!changePwdForm.current) { toast.error('Enter your current password'); return; }
                    if (changePwdForm.newPwd.length < 8) { toast.error('New password must be at least 8 characters'); return; }
                    if (changePwdForm.newPwd !== changePwdForm.confirm) { toast.error('Passwords do not match'); return; }
                    setChangePwdForm({ current: '', newPwd: '', confirm: '' });
                    toast.success('Password changed successfully!');
                  }}
                  className={`w-full ${isHostel ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition-transform`}
                >
                  Update Password
                </button>
              </CardContent>
            </Card>
          )}

        </div>
      </Dialog>
    </DashboardLayout>
  );
}
