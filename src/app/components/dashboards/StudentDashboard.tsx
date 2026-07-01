import {
  createOutpass,
  getStudentOutpasses,
  markExit,
  markReturn,
  expireOldOutpasses
} from "../../services/outpassService";
import {
  getStudentTransport,
  submitTransportCancellation,
  getTransportCancellation
} from "../../../api/transportService";
import {
  getStudentProfile,
  uploadStudentProfilePhoto
} from "../../../api/studentService";
import {
  createVacatingRequest,
  getStudentVacatingRequest
} from "../../../api/vacatingService";
import {
  createLeaveRequest,
  getLeaveRequests
} from "../../../api/leaveService";
import {
  changePassword
} from "../../../api/authService";
import { useState, useRef, useEffect } from 'react';  
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Dialog,
} from "@mui/material";
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
import {
  HOSTEL_LOCATION,
  HOSTEL_RADIUS
} from "../../../config/hostelLocation";

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}
const HOSTEL_LAT = HOSTEL_LOCATION.latitude;
const HOSTEL_LNG = HOSTEL_LOCATION.longitude;
const GEOFENCE_RADIUS = HOSTEL_RADIUS;

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
  const [
  vacatingRequest,
  setVacatingRequest
] = useState<any>(null);
const handleVacateSubmit = async () => {
  try {
  await createVacatingRequest({
    studentId: user.studentId,
      studentName: user.name,
    reason: vacateReason
  });
await loadVacatingRequest();
  toast.success(
    "Vacating request submitted!"
  );

  setVacateDialogOpen(false);
  setVacateReason("");
}
catch (error: any) {
  toast.error(
    "You already have a pending vacating request."
  );
}
};
  const [outpassForm, setOutpassForm] = useState({
    reason: '',
    destination: '',
    date: '',
    timeOut: '',
    returnTime: '',
  });

const [leaveForm, setLeaveForm] = useState({
    type: "",
    campus: "",
    destination: "",
    fromDate: "",
    toDate: "",
    exitTime: "",
    returnTime: "",
    reason: ""
});

  const isHostel = user.serviceType === 'hostel';
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'history' | 'password'>('info');
  const [changePwdForm, setChangePwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [transportInfo, setTransportInfo] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

const [cancelRequest, setCancelRequest] =
  useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
const handlePhotoChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

    const file = e.target.files?.[0];

    if (!file) return;

    try {

        setProfilePhoto(
            URL.createObjectURL(file)
        );

        const result =
            await uploadStudentProfilePhoto(
                user.studentId || "",
                file
            );

        setStudentProfile((prev:any)=>({
            ...prev,
            profilePhoto: result.profilePhoto
        }));

        toast.success(
            "Profile photo updated"
        );

    }
    catch{

        toast.error(
            "Photo upload failed"
        );

    }

};
 const loadOutpasses = async () => {
  try {

    // Expire old outpasses first
    await expireOldOutpasses();

    // Then load student outpasses
    const data = await getStudentOutpasses(
      user.studentId || ""
    );

    console.log(data);

    setOutpasses(data);

  } catch (err) {
    console.error(err);
  }
};
const loadLeaveRequests = async () => {

  try {

    const data = await getLeaveRequests();

    setLeaveRequests(
      data.filter(
        (x:any) => x.studentId === user.studentId
      )
    );

  } catch (err) {

    console.log(err);

  }

};
useEffect(() => {

  loadOutpasses();

  loadLeaveRequests();

  const timer = setInterval(() => {

    loadOutpasses();

    loadLeaveRequests();

  },5000);

  return () => clearInterval(timer);

}, []);
useEffect(() => {

    async function loadProfile() {

        try {

            const data =
                await getStudentProfile(
                    user.studentId || ""
                );

            setStudentProfile(data);

        } catch (err) {
            console.log(err);
        }

    }

    loadProfile();

}, []);
useEffect(() => {

    if (isHostel) return;

    async function loadTransport() {

        try {

            const data = await getStudentTransport(
                user.studentId || ""
            );

            setTransportInfo(data);

        }
        catch (err) {

            console.log(err);

        }

    }

    loadTransport();

}, [user.studentId, isHostel]);
const loadVacatingRequest =
  async () => {
    const data =
      await getStudentVacatingRequest(
        user.studentId || ""
      );

    setVacatingRequest(data);
  };
  const loadTransportCancellation =
  async () => {

    try {

      const data =
        await getTransportCancellation(
          user.studentId || ""
        );

      setCancelRequest(data);

    }
    catch {

      setCancelRequest(null);

    }

};

useEffect(() => {
  loadVacatingRequest();
}, []);
useEffect(() => {
  if (!isHostel) {
    loadTransportCancellation();
  }
}, []);
  const [outpasses, setOutpasses] =
useState<any[]>([]);
const [outsideCounter, setOutsideCounter] = useState(0);
const [insideCounter, setInsideCounter] = useState(0);
const [leaveRequests, setLeaveRequests] =
useState<any[]>([]);
const [submittingOutpass, setSubmittingOutpass] = useState(false);
const [submittingLeave, setSubmittingLeave] = useState(false);
const activeOutpass = outpasses.find(x =>

    x.status === "Approved" &&

    (
        x.outpassState === "Active" ||
        x.outpassState === "Waiting For Exit" ||
        x.outpassState === "Outside Hostel"
    )

);
console.log("ACTIVE OUTPASS =", activeOutpass);
  useEffect(() => {

  if (!activeOutpass) return;

  const timer = setInterval(() => {

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const distance = getDistanceMeters(
          HOSTEL_LAT,
          HOSTEL_LNG,
          position.coords.latitude,
          position.coords.longitude
        );

        console.log("Distance =", distance);
console.log("Radius =", GEOFENCE_RADIUS);
console.log("Latitude =", position.coords.latitude);
console.log("Longitude =", position.coords.longitude);
console.log("Exit Time =", activeOutpass.actualExitTime);
console.log("Return Time =", activeOutpass.actualReturnTime);
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

  setInsideCounter(0);
}
      if (
  distance <= GEOFENCE_RADIUS &&
  activeOutpass.actualExitTime &&
  !activeOutpass.actualReturnTime
) {

  setInsideCounter(prev => {

    const count = prev + 1;

    console.log("Inside Count =", count);

    if (count >= 2) {

      markReturn(
        activeOutpass.id,
        position.coords.latitude,
        position.coords.longitude
      ).then(async () => {

        await loadOutpasses();

        toast.success("Return Recorded");

      });

      return 0;
    }

    return count;
  });

  setOutsideCounter(0);

} else if (distance > GEOFENCE_RADIUS) {

  setInsideCounter(0);

}
      },

      (error) => {
        console.log(error);
      }

    );

  }, 5000);

  return () => clearInterval(timer);

}, [activeOutpass]);

  const handleOutpassSubmit = async (
  e: React.FormEvent
) => {
 e.preventDefault();
if (submittingOutpass) return;

setSubmittingOutpass(true);
if (activeOutpass) {
  toast.error(
    "You already have an active outpass."
  );
  return;
}

let permissionGranted = false;

try {
  await new Promise<GeolocationPosition>((resolve, reject) => {
   navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("GPS SUCCESS", position);
    resolve(position);
  },
  (error) => {
    console.log("GPS ERROR", error);
    alert(
      "Error Code: " +
      error.code +
      "\nMessage: " +
      error.message
    );
    reject(error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);
  });

  permissionGranted = true;
}
catch {

  toast.error(
    "Location permission is required to request an outpass."
  );

  return;
}
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
validFrom: `${outpassForm.date}T${outpassForm.timeOut}:00`,

validTo: `${outpassForm.date}T${outpassForm.returnTime}:00`,

 status: "Pending",

locationPermissionGranted: permissionGranted,

studentPhoto:
  studentProfile?.profilePhoto || ""
};

    console.log("Sending:", data);

    await createOutpass(data);
setSubmittingOutpass(false);
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
    setSubmittingOutpass(false);
    console.error(error);
    toast.error("Failed to submit outpass");
  }
};

const handleLeaveSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();
  if (submittingLeave) return;

setSubmittingLeave(true);
const activeLeave = leaveRequests.find(
  (x: any) =>
    x.status === "Pending" ||
    x.status === "Approved"
);

if (activeLeave) {
  toast.error(
    "You already have an active leave request."
  );
  setSubmittingLeave(false);
  return;
}
  if (!leaveForm.campus) {
    toast.error("Select Campus");
     setSubmittingLeave(false);
    return;
  }

  try {

  await createLeaveRequest({
  studentId: user.studentId,

  studentName: user.name,

  leaveType: leaveForm.type,

  campus:
    leaveForm.campus === "incampus"
      ? "In Campus"
      : "Out Campus",

  department: studentProfile?.department,

  gender: studentProfile?.gender,

  year: studentProfile?.year,

  fromDate: leaveForm.fromDate,

  toDate: leaveForm.toDate,

  reason: leaveForm.reason,

destination: leaveForm.destination,

exitTime: leaveForm.exitTime,

returnTime: leaveForm.returnTime
});
setSubmittingLeave(false);

await loadLeaveRequests();
    toast.success(
      "Leave application submitted"
    );

    setLeaveDialogOpen(false);

setLeaveForm({
    type: "",
    campus: "",
    destination: "",
    fromDate: "",
    toDate: "",
    exitTime: "",
    returnTime: "",
    reason: ""
});

  }
 catch (err) {

  setSubmittingLeave(false);

  console.log(err);

  toast.error(
    "Failed to submit leave request"
  );

}

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
    { icon: <History size={22} />, label: 'Request History', active: currentView === 'history', onClick: () => setCurrentView('history') },
    { icon: <UserIcon size={22} />, label: 'My Profile', active: false, onClick: () => { setProfileDialogOpen(true); setProfileTab('info'); } },
   ...(vacatingRequest?.status !== "Pending"
  ? [{
      icon: <LogOut size={22} />,
      label: 'Vacate Hostel',
      active: currentView === 'vacate',
      onClick: () => {
        setCurrentView('dashboard');
        setVacateDialogOpen(true);
      }
    }]
  : []),
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
    <DashboardLayout
user={{
    ...user,
    profilePhoto:
        profilePhoto ||
        studentProfile?.profilePhoto ||
        user.profilePhoto
}}
onLogout={() => {

if(activeOutpass){

toast.error(
"Return to hostel before logging out."
);

return;
}

onLogout();

}} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* History View */}
        {currentView === 'history' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
Request History
</h3>
              <div className="space-y-3">
                {[...outpasses]
.filter(x => x.leaveRequestId === 0)
.sort((a,b)=>{

const aActive =
a.outpassState==="Active"||
a.outpassState==="Outside Hostel";

const bActive =
b.outpassState==="Active"||
b.outpassState==="Outside Hostel";

if(aActive && !bActive) return -1;

if(!aActive && bActive) return 1;

return new Date(b.createdAt).getTime()
-
new Date(a.createdAt).getTime();

})
.map((outpass)=>{console.log(outpasses);
                  const isLeaveOutpass =
                       outpass.status?.toLowerCase() === "approved";
                  return (
                  <div key={outpass.id}
    className={`rounded-xl p-3 ${
(
outpass.outpassState==="Active"||
outpass.outpassState==="Outside Hostel"
)
?
"bg-green-50 border border-green-200"
:
"bg-white border border-gray-200"
}`}
>  {isLeaveOutpass && (
                      <div className="flex items-center space-x-1.5 mb-2">
                        <Calendar size={12} className="text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700"></span>
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
                    {(
    outpass.status?.toLowerCase() === "approved" &&
    (
        outpass.outpassState === "Active" ||
        outpass.outpassState === "Outside Hostel" ||
        outpass.outpassState === "Waiting For Exit"
    )
) && (
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

  <span className="flex items-center">
    <Clock size={12} className="mr-1" />

    {new Date(`2000-01-01T${outpass.timeOut}`)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}

    {" - "}

    {new Date(`2000-01-01T${outpass.returnTime}`)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}
  </span>

  <span className="flex items-center">
    <MapPin size={12} className="mr-1" />
    {outpass.destination}
  </span>
{outpass.outpassState==="Expired" &&
!outpass.actualExitTime && (

<p className="w-full text-red-600 text-xs font-semibold">

Not Exited

</p>

)}
  {outpass.actualExitTime && (
    <p className="w-full text-green-600 text-xs">
      Exit Time :
      {" "}
      {new Date(outpass.actualExitTime).toLocaleString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      })}
    </p>
  )}
{outpass.outpassState==="Outside Hostel" &&
!outpass.actualReturnTime && (

<p className="w-full text-orange-600 text-xs font-semibold">

Not Returned Yet

</p>

)}
  {outpass.actualReturnTime && (
    <p className="w-full text-blue-600 text-xs">
      Return Time :
      {" "}
      {new Date(outpass.actualReturnTime).toLocaleString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      })}
    </p>
  )}

  {outpass.lateMinutes > 0 && (
    <p className="w-full text-red-600 text-xs">
      Late :
      {outpass.lateMinutes} minutes
    </p>
  )}

</div>
                  </div>
                  );
                })}
                {outpasses.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">No outpass requests yet</p>
                )}
                <hr className="my-5" />

<h3 className="font-bold text-gray-800 mb-3">
Leave Requests
</h3>

<div className="space-y-3">

{leaveRequests
.sort(
(a,b)=>
new Date(b.createdDate).getTime()-
new Date(a.createdDate).getTime()
)
.map((leave)=>{

const linkedOutpass=
outpasses.find(
x=>x.leaveRequestId===leave.id
);

return(

<div
key={leave.id}
className="border rounded-xl p-3"
>

<div className="flex justify-between">

<div>

<p className="font-semibold">
{leave.leaveType}
</p>

<p className="text-xs text-gray-500">
{leave.campus}
</p>

</div>

<Chip
label={leave.status}
color={getStatusColor(
leave.status.toLowerCase()
)}
size="small"
/>

</div>

<p className="text-xs mt-2">
📅 {new Date(leave.fromDate).toLocaleDateString()}
{" - "}
{new Date(leave.toDate).toLocaleDateString()}
</p>

<div className="mt-2 space-y-1">

  <p className="text-xs text-gray-700">
    {leave.reason}
  </p>

  {leave.destination && (
    <p className="flex items-center text-xs text-gray-600">
      <MapPin size={12} className="mr-1 text-red-500" />
      {leave.destination}
    </p>
  )}

</div>

{leave.status==="Rejected" &&
leave.rejectReason && (

<p className="text-xs text-red-600 mt-2">

Reject Reason :

{" "}

{leave.rejectReason}

</p>

)}

{leave.campus==="Out Campus" &&
linkedOutpass &&
linkedOutpass.status==="Approved" &&
(
linkedOutpass.outpassState==="Active" ||
linkedOutpass.outpassState==="Waiting For Exit" ||
linkedOutpass.outpassState==="Outside Hostel"
) && (

<button
onClick={()=>{
setSelectedOutpass(linkedOutpass);
setQrCardOpen(true);
}}
className="mt-3 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
>

Show Pass

</button>

)}

</div>

);

})}

{leaveRequests.length===0 && (

<p className="text-center text-gray-400">

No Leave Requests

</p>

)}

</div>
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
                  <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">{transportInfo?.routeName ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">{transportInfo?.busNumber ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">{transportInfo?.stopName ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">{transportInfo?.pickupTime ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Drop Point</p><p className="font-medium">College Gate</p></div>
                  {/*<div><p className="text-gray-500 text-xs">Drop Time</p><p className="font-medium">5:30 PM</p></div>*/}
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
      {currentView === "announcements" && (
  <div className="space-y-3">

    {announcements.length === 0 ? (

      <Card sx={{ borderRadius: 3 }}>
        <CardContent className="text-center py-8">

          <Bell
            size={40}
            className="mx-auto text-gray-300 mb-3"
          />

 <p className="text-gray-500">
    No announcements available
</p>

        </CardContent>
      </Card>

    ) : (

      announcements.map((ann: any) => (
        <Card key={ann.id} sx={{ borderRadius: 3 }}>
          <CardContent>

         <p className="font-semibold">
    {ann.title}
</p>
<p className="mt-1 text-gray-600">
    {ann.message}
</p>

           <p className="text-xs text-gray-400 mt-2">
    {ann.createdDate}
</p>

          </CardContent>
        </Card>
      ))

    )}

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
                <Avatar
  src={
    profilePhoto ||
    (studentProfile?.profilePhoto
      ? `https://202.61.121.102:8443${studentProfile.profilePhoto}`
      : user.avatar)
  }
  alt={user.name}sx={{ width: 80, height: 80, border: '4px solid white' }} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white active:scale-90 transition-transform"
                    >
                      <Camera size={12} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex-1 mt-10">
                    <h2 className="text-xl font-bold text-gray-800">{studentProfile?.studentName}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      <span className="flex items-center"><UserIcon size={14} className="mr-1" />{studentProfile?.studentId}</span>
                      <span className="flex items-center"><Building2 size={14} className="mr-1" />{studentProfile?.department}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      <span>{studentProfile?.year}</span>
                      <span>•</span>
                      <span>{studentProfile?.collegeName}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HOSTEL VIEW */}
            {isHostel && (
              
              <>{vacatingRequest?.status === "Pending" && (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <p className="text-orange-600 font-semibold">
        Your vacating request is pending approval.
      </p>
    </CardContent>
  </Card>
)}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={24} className="text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{
outpasses.filter(x => x.leaveRequestId === 0).length
}</span>
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
                      <div><p className="text-gray-500 text-xs">Block</p><p className="font-medium">{studentProfile?.block ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Room</p><p className="font-medium">{studentProfile?.roomNumber ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Bed</p><p className="font-medium">{studentProfile?.bedNumber ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Warden</p><p className="font-medium">Dr. Sharma</p></div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <button
  disabled={!!activeOutpass}
  onClick={() => setOutpassDialogOpen(true)}
  className={`bg-gradient-to-br from-blue-500 to-blue-600
    text-white p-4 rounded-2xl shadow-lg
    ${activeOutpass ? "opacity-50 cursor-not-allowed" : ""}
  `}
>
                    <FileText size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Request Outpass</p>
                  </button>
                  <button
 disabled={
  !!activeOutpass ||
  leaveRequests.some(
    (x: any) =>
      x.status === "Pending" ||
      x.status === "Approved"
  )
}
  onClick={() => setLeaveDialogOpen(true)}
  className={`bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg ${
    !!activeOutpass ||
    leaveRequests.some(
      (x: any) =>
        x.status === "Pending" ||
        x.status === "Approved"
    )
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
>
                    <Calendar size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Apply Leave</p>
                  </button>
                </div>
{activeOutpass && (

<Card sx={{ borderRadius: 3 }}>

<CardContent className="p-4">

<div className="flex items-center justify-between mb-3">

<h3 className="font-bold text-gray-800">
Active Outpass
</h3>

<Chip
label={activeOutpass.status}
color="success"
size="small"
/>

</div>

<div
className="rounded-xl p-3 bg-green-50 border border-green-200"
>

<p className="font-semibold text-gray-800 text-sm">
{activeOutpass.reason}
</p>

<div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">

<span className="flex items-center">
<Calendar size={12} className="mr-1"/>
{new Date(activeOutpass.validFrom).toLocaleDateString()}
</span>

<span className="flex items-center">
<Clock size={12} className="mr-1"/>

{new Date(`2000-01-01T${activeOutpass.timeOut}`)
.toLocaleTimeString([],{
hour:"numeric",
minute:"2-digit",
hour12:true
})}

{" - "}

{new Date(`2000-01-01T${activeOutpass.returnTime}`)
.toLocaleTimeString([],{
hour:"numeric",
minute:"2-digit",
hour12:true
})}

</span>

<span className="flex items-center">
<MapPin size={12} className="mr-1"/>
{activeOutpass.destination}
</span>

</div>

<p className="mt-3 text-sm">

<b>State :</b>

<span className="text-green-700 font-semibold ml-1">
{activeOutpass.outpassState}
</span>

</p>

{activeOutpass.actualExitTime && (

<p className="mt-2 text-green-600 text-sm">

Exit Time :

{" "}

{new Date(activeOutpass.actualExitTime)
.toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
second:"2-digit",
hour12:true
})}

</p>

)}

{activeOutpass.actualReturnTime && (

<p className="mt-1 text-blue-600 text-sm">

Return Time :

{" "}

{new Date(activeOutpass.actualReturnTime)
.toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
second:"2-digit",
hour12:true
})}

</p>

)}

{activeOutpass.lateMinutes>0 && (

<p className="mt-1 text-red-600 text-sm">

Late :

{activeOutpass.lateMinutes} minutes

</p>

)}

<div className="mt-4">

<button
onClick={()=>{
setSelectedOutpass(activeOutpass);
setQrCardOpen(true);
}}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
>

Show Pass

</button>

</div>

</div>

</CardContent>

</Card>

)}
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
    x.destination &&
    x.leaveRequestId === 0
)
.sort((a, b) => {

    if (
        a.outpassState === "Active" ||
        a.outpassState === "Outside Hostel"
    ) return -1;

    if (
        b.outpassState === "Active" ||
        b.outpassState === "Outside Hostel"
    ) return 1;

    return new Date(b.createdAt).getTime()
         - new Date(a.createdAt).getTime();
})
.slice(0,2)
  .map((outpass) => (
  <div
    key={outpass.id}
    className={`rounded-xl p-3 ${
     (
outpass.outpassState==="Active" ||
outpass.outpassState==="Outside Hostel"
)
?
"bg-green-50 border border-green-200"
:
"bg-white border border-gray-200"
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
{(
    outpass.status?.toLowerCase() === "approved" &&
    (
        outpass.outpassState === "Active" ||
        outpass.outpassState === "Outside Hostel" ||
        outpass.outpassState === "Waiting For Exit"
    )
) && (
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
      {outpass.outpassState==="Expired" &&
!outpass.actualExitTime && (

<p className="w-full text-red-600 text-xs font-semibold">

Not Exited

</p>

)}
{outpass.actualExitTime && (
  <p className="w-full text-green-600 text-xs">
    Exit Time :
    {new Date(outpass.actualExitTime).toLocaleString()}
  </p>
)}
{outpass.outpassState==="Outside Hostel" &&
!outpass.actualReturnTime && (

<p className="w-full text-orange-600 text-xs font-semibold">

Not Returned Yet

</p>

)}
{outpass.actualReturnTime && (
  <p className="w-full text-blue-600 text-xs">
    Return Time :
    {new Date(outpass.actualReturnTime).toLocaleString()}
  </p>
)}


{outpass.lateMinutes > 0 && (
  <p className="w-full text-red-600 text-xs">
    Late :
    {outpass.lateMinutes} minutes
  </p>
)}
    </div>
  </div>
))}
                    </div>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3 }}>
  <CardContent className="p-4">

    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-gray-800">
        Recent Leave Requests
      </h3>
    </div>

    <div className="space-y-3">

      {leaveRequests
        .sort(
          (a,b)=>
            new Date(b.createdDate).getTime()-
            new Date(a.createdDate).getTime()
        )
        .slice(0,2)
        .map((leave)=>{

          const linkedOutpass =
            outpasses.find(
              x=>x.leaveRequestId===leave.id
            );

          return(

            <div
  key={leave.id}
  className={`rounded-xl p-3 ${
    leave.status === "Approved"
      ? "bg-green-50 border border-green-200"
      : leave.status === "Rejected"
      ? "bg-red-50 border border-red-200"
      : "bg-yellow-50 border border-yellow-200"
  }`}
>
              <div className="flex items-start justify-between mb-2">

                <div>

                 <p className="font-semibold text-gray-800 text-sm">
  {leave.leaveType}
</p>

                <p className="text-xs text-gray-500">
  {leave.campus}
</p>

{leave.destination && (
  <p className="text-xs text-gray-600 mt-1">
    <MapPin size={12} className="inline mr-1" />
    {leave.destination}
  </p>
)}

                </div>

                <Chip
                  label={leave.status}
                  color={getStatusColor(
                    leave.status.toLowerCase()
                  )}
                  size="small"
                />

              </div>

              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">

  <span className="flex items-center">
    <Calendar size={12} className="mr-1" />
    {new Date(leave.fromDate).toLocaleDateString()}
    {" - "}
    {new Date(leave.toDate).toLocaleDateString()}
  </span>

</div>

             <p className="text-xs text-gray-700 mt-2">
  {leave.reason}
</p>

              {leave.status==="Rejected" &&
                leave.rejectReason && (

                <p className="text-xs text-red-600 mt-2">
                  Reject Reason :
                  {" "}
                  {leave.rejectReason}
                </p>

              )}
{linkedOutpass && (

<>

<p className="text-xs mt-2">
<b>State :</b> {linkedOutpass.outpassState}
</p>

{linkedOutpass.outpassState === "Expired" &&
!linkedOutpass.actualExitTime && (

<p className="text-xs text-red-600 mt-1">
Not Exited
</p>

)}

{linkedOutpass.actualExitTime && (

<p className="text-xs text-green-600 mt-1">

Exit Time :
{" "}
{new Date(linkedOutpass.actualExitTime)
.toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
second:"2-digit",
hour12:true
})}

</p>

)}

{linkedOutpass.outpassState==="Outside Hostel" &&
!linkedOutpass.actualReturnTime && (

<p className="text-xs text-orange-600 mt-1">

Not Returned Yet

</p>

)}

{linkedOutpass.actualReturnTime && (

<p className="text-xs text-blue-600 mt-1">

Return Time :
{" "}
{new Date(linkedOutpass.actualReturnTime)
.toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
second:"2-digit",
hour12:true
})}

</p>

)}

{linkedOutpass.lateMinutes>0 && (

<p className="text-xs text-red-600 mt-1">

Late :
{linkedOutpass.lateMinutes} minutes

</p>

)}

</>

)}
              {leave.campus==="Out Campus" &&
               linkedOutpass &&
               linkedOutpass.status==="Approved" &&
               (
                 linkedOutpass.outpassState==="Active" ||
                 linkedOutpass.outpassState==="Waiting For Exit" ||
                 linkedOutpass.outpassState==="Outside Hostel"
               ) && (

                <button
                  onClick={()=>{
                    setSelectedOutpass(linkedOutpass);
                    setQrCardOpen(true);
                  }}
                 className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium mt-3"
                >
                  Show Pass
                </button>

              )}

            </div>

          );

      })}

      {leaveRequests.length===0 && (

        <p className="text-center text-gray-400 py-6">

          No Leave Requests

        </p>

      )}

    </div>

  </CardContent>
</Card>
              </>
              
            )}
            {/* TRANSPORT VIEW */}
            {!isHostel && (
              <>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin size={24} className="text-blue-500" />
                    <span className="text-lg font-bold text-gray-800">
{transportInfo?.routeName ?? "-"}
</span>
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
                      <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">{transportInfo?.routeName ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">{transportInfo?.busNumber ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">{transportInfo?.stopName ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">{transportInfo?.pickupTime ?? "-"}</p></div>

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
                  {announcements.length === 0 ? (

<div className="text-center py-8 text-gray-500">

No announcements available

</div>

) : (

<div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">

<p className="font-semibold text-gray-800 text-sm">
{announcements[0].title}
</p>

<p className="text-xs text-gray-600 mt-1">
{announcements[0].message}
</p>

<p className="text-xs text-gray-400 mt-2">
{announcements[0].createdDate}
</p>

</div>

)}
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
          <button type="submit"disabled={submittingOutpass} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
           {submittingOutpass ? "Submitting..." : "Submit Request"}
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
          {leaveForm.campus === "outcampus" && (

<div className="bg-white rounded-2xl p-4">

<label className="block text-sm font-medium text-gray-700 mb-2">

Destination

</label>

<input
type="text"
value={leaveForm.destination}
onChange={(e)=>
setLeaveForm({
...leaveForm,
destination:e.target.value
})
}
className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl"
placeholder="Enter Destination"
required
/>

</div>

)}
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
          {
leaveForm.campus === "outcampus" &&
leaveForm.fromDate === leaveForm.toDate && (
<>

<div className="bg-white rounded-2xl p-4">
<label>Exit Time</label>

<input
type="time"
value={leaveForm.exitTime}
onChange={(e)=>
setLeaveForm({
...leaveForm,
exitTime:e.target.value
})}
required
/>
</div>

<div className="bg-white rounded-2xl p-4">
<label>Return Time</label>

<input
type="time"
value={leaveForm.returnTime}
onChange={(e)=>
setLeaveForm({
...leaveForm,
returnTime:e.target.value
})}
required
/>
</div>

</>
)}
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
          <button type="submit" disabled={submittingLeave} className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
             {submittingLeave
        ? "Submitting..."
        : "Submit Application"}
          </button>
        </form>
      </Dialog>

     {selectedOutpass && (
  <OutpassQRCard
    open={qrCardOpen}
    onClose={() => setQrCardOpen(false)}
    outpass={selectedOutpass}
    student={{
      ...user,
      profilePhoto: studentProfile?.profilePhoto,
      department: studentProfile?.department,
      year: studentProfile?.year,
      college: studentProfile?.collegeName
    }}
  />
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
                  <span className="font-medium text-gray-800">{studentProfile?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{studentProfile?.studentName}</span>
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
  if (!vacateReason.trim()) {
    toast.error("Enter reason");
    return;
  }

  handleVacateSubmit();
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
  <span className="text-gray-600">Route:</span>
  <span className="font-medium text-gray-800">
    {transportInfo?.routeName ?? "-"}
  </span>
</div>

<div className="flex justify-between">
  <span className="text-gray-600">Bus Number:</span>
  <span className="font-medium text-gray-800">
    {transportInfo?.busNumber ?? "-"}
  </span>
</div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
           <textarea
  value={cancelReason}
  onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows={4}
              placeholder="Please provide a detailed reason for cancelling transport service..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
             onClick={() => {
    setCancelDialogOpen(false);
    setCancelReason("");
}}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
           onClick={async () => {

  if (!cancelReason.trim()) {
    toast.error("Enter reason");
    return;
  }

  try {

    await submitTransportCancellation(
      user.studentId || "",
      user.name,
      cancelReason
    );

    await loadTransportCancellation();

    toast.success("Cancellation request submitted");

    setCancelDialogOpen(false);
    setCancelReason("");

  } catch (err: any) {

    toast.error(err.message);

  }

}}
             disabled={!cancelReason.trim()}
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
  {(isHostel
    ? (['info', 'history', 'password'] as const)
    : (['info', 'password'] as const)
  ).map(tab => (
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
                   <Avatar
  src={
    profilePhoto ||
    (studentProfile?.profilePhoto
      ? `https://202.61.121.102:8443${studentProfile.profilePhoto}`
      : user.avatar)
  } alt={user.name} sx={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.5)' }} />
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
               {[...outpasses]
.filter(x => x.leaveRequestId === 0)
.sort(
(a,b)=>
new Date(b.createdAt).getTime()-
new Date(a.createdAt).getTime()
)
.map(op => (

<div key={op.id} className="p-3">

<div className="flex justify-between">

<p className="font-semibold">
{op.reason}
</p>

<Chip
label={op.status}
color={getStatusColor(op.status?.toLowerCase())}
size="small"
/>

</div>

<p className="text-xs text-gray-500 mt-1">
📅 {new Date(op.validFrom).toLocaleDateString()}
</p>

<p className="text-xs text-gray-500">
🕒 {op.timeOut} - {op.returnTime}
</p>

<p className="text-xs text-gray-500">
📍 {op.destination}
</p>

<p className="text-xs mt-1">
<b>State :</b> {op.outpassState}
</p>

{op.actualExitTime && (

<p className="text-xs text-green-600">

Exit :
{" "}
{new Date(op.actualExitTime).toLocaleString()}

</p>

)}

{op.actualReturnTime && (

<p className="text-xs text-blue-600">

Return :
{" "}
{new Date(op.actualReturnTime).toLocaleString()}

</p>

)}

{op.outpassState === "Expired" &&
!op.actualExitTime && (

<p className="text-xs text-red-600">

Expired - Not Exited

</p>

)}

{op.outpassState === "Outside Hostel" &&
!op.actualReturnTime && (

<p className="text-xs text-orange-600">

Outside Hostel

</p>

)}

{op.lateMinutes > 0 && (

<p className="text-xs text-red-600">

Late :
{op.lateMinutes} minutes

</p>

)}

<hr className="mt-3"/>

</div>

))}

{outpasses.length===0 && (

<p className="text-center text-gray-400 py-6">

No Outpass History

</p>

)}</div>
              </div>

              {isHostel && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">Leave Applications</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                  {leaveRequests
.sort(
(a,b)=>
new Date(b.createdDate).getTime()-
new Date(a.createdDate).getTime()
)
.map((leave)=>{

const linkedOutpass =
outpasses.find(
x=>x.leaveRequestId===leave.id
);

return(

<div
key={leave.id}
className="p-3"
>

<div className="flex items-start justify-between mb-1">

<div>

<p className="text-sm font-semibold text-gray-800">

{leave.leaveType}

</p>

<p className="text-xs text-gray-500">

{leave.campus}

</p>

</div>

<Chip
label={leave.status}
color={getStatusColor(
leave.status.toLowerCase()
)}
size="small"
/>

</div>

<p className="text-xs text-gray-500">

📅 {new Date(leave.fromDate).toLocaleDateString()}

{" - "}

{new Date(leave.toDate).toLocaleDateString()}

</p>

<p className="text-xs text-gray-500">

Reason :
{leave.reason}

</p>
{leave.destination && (

<p className="text-xs text-gray-500">

📍 {leave.destination}

</p>

)}
{leave.status==="Rejected" &&
leave.rejectReason && (

<p className="text-xs text-red-600 mt-1">

Reject Reason :

{" "}

{leave.rejectReason}

</p>

)}
{linkedOutpass && (

<>

<p className="text-xs mt-2">

<b>State :</b> {linkedOutpass.outpassState}

</p>

{linkedOutpass.outpassState==="Expired" &&
!linkedOutpass.actualExitTime && (

<p className="text-xs text-red-600">

Not Exited

</p>

)}

{linkedOutpass.actualExitTime && (

<p className="text-xs text-green-600">

Exit Time :

{" "}

{new Date(linkedOutpass.actualExitTime)
.toLocaleString()}

</p>

)}

{linkedOutpass.outpassState==="Outside Hostel" &&
!linkedOutpass.actualReturnTime && (

<p className="text-xs text-orange-600">

Not Returned Yet

</p>

)}

{linkedOutpass.actualReturnTime && (

<p className="text-xs text-blue-600">

Return Time :

{" "}

{new Date(linkedOutpass.actualReturnTime)
.toLocaleString()}

</p>

)}

{linkedOutpass.lateMinutes>0 && (

<p className="text-xs text-red-600">

Late :
{linkedOutpass.lateMinutes} minutes

</p>

)}

</>

)}
{leave.campus==="Out Campus" &&
linkedOutpass &&
linkedOutpass.status==="Approved" &&
(
linkedOutpass.outpassState==="Active" ||
linkedOutpass.outpassState==="Waiting For Exit" ||
linkedOutpass.outpassState==="Outside Hostel"
) && (

<button
onClick={()=>{
setSelectedOutpass(linkedOutpass);
setQrCardOpen(true);
}}
className="mt-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs"
>

Show Pass

</button>

)}

</div>

);

})}

{leaveRequests.length===0 && (

<p className="text-center text-gray-400 py-6">

No Leave History

</p>

)}
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
                  onClick={async () => {

  if (!changePwdForm.current) {
    toast.error("Enter your current password");
    return;
  }

  if (changePwdForm.newPwd.length < 8) {
    toast.error("New password must be at least 8 characters");
    return;
  }

  if (changePwdForm.newPwd !== changePwdForm.confirm) {
    toast.error("Passwords do not match");
    return;
  }

  try {

    await changePassword(
      user.studentId!,
      changePwdForm.current,
      changePwdForm.newPwd
    );

    toast.success("Password updated successfully");

    setChangePwdForm({
      current: "",
      newPwd: "",
      confirm: ""
    });

  } catch (err: any) {

    toast.error(err.message);

  }

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
