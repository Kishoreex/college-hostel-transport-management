import { Card, CardContent, Chip, Grid } from '@mui/material';
import { getParentOutpasses } from "../../services/parentOutpassService";
import { getParentLeaves } from "../../services/parentLeaveService";

import type { MenuItemType } from "../common/DashboardLayout";
import HistoryIcon from "@mui/icons-material/History";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useEffect, useState } from "react";
import OutpassQRCard from "../outpass/OutpassQRCard";
import DashboardLayout from '../common/DashboardLayout';
import type { User as UserType } from '../../types';
import {
User as UserIcon,
Building2,
Bus,
CheckCircle2,
Clock,
FileText,
Calendar,
Phone,
AlertCircle,
MapPin,
CheckCircle2 as CheckIcon,
XCircle,
} from "lucide-react";
interface ParentDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function ParentDashboard({ user, onLogout }: ParentDashboardProps) {
 const [studentData, setStudentData] = useState<any>(null);
 const [outpasses, setOutpasses] = useState<any[]>([]);
 const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
 const [selectedOutpass, setSelectedOutpass] = useState<any>(null);

const [qrCardOpen, setQrCardOpen] = useState(false);
const [currentView, setCurrentView] =
useState<
"dashboard" | "history"
>("dashboard");
const menuItems: MenuItemType[] = [

{
icon:<DashboardIcon />,
label:"Dashboard",
active:currentView==="dashboard",
onClick:()=>setCurrentView("dashboard")
},

{
icon:<HistoryIcon />,
label:"Request History",
active:currentView==="history",
onClick:()=>setCurrentView("history")
}

];
const loadStudent = async () => {
  try {
    const response = await fetch(
      `https://api.madhapharma.in/api/Student/parent/${user.userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load student");
    }

    const data = await response.json();

    setStudentData(data);

    const outpassData = await getParentOutpasses(user.userId);

    setOutpasses(outpassData);
const leaveData = await getParentLeaves(user.userId);

setLeaveRequests(leaveData);
    console.log("Student:", data);
    console.log("Outpasses:", outpassData);

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {

  loadStudent();

}, []);

const activeOutpasses =
outpasses.filter(
x =>
x.outpassState === "Active" ||
x.outpassState === "Outside Hostel"
).length;

const pendingLeaves =
leaveRequests.filter(
x => x.status === "Pending"
).length;

const totalOutpasses =
outpasses.length;

const totalLeaves =
leaveRequests.length;


const latestOutpass =
  outpasses.length > 0 ? outpasses[0] : null;

const showLiveStatus =
  latestOutpass &&
  (
    latestOutpass.outpassState === "Active" 
  );

const studentStatus =
  latestOutpass == null
    ? "In Hostel"

    : latestOutpass.outpassState === "Active"
    ? "Outpass Approved"
    : "In Hostel";

const getStatusColor = (
  status: string
): "success" | "warning" | "error" | "default" => {

  switch (status?.toLowerCase()) {

    case "approved":
    case "completed":
      return "success";

    case "pending":
      return "warning";

    case "rejected":
    case "cancelled":
    case "not accepted by hostel incharge":
      return "error";

    default:
      return "default";
  }
};
const getStatusIcon = (status: string) => {

  switch (status?.toLowerCase()) {

    case "approved":
    case "completed":
      return <CheckIcon size={14} />;

    case "pending":
      return <Clock size={14} />;

    case "rejected":
    case "cancelled":
    case "not accepted by hostel incharge":
      return <XCircle size={14} />;

    default:
      return null;
  }

};
if (!studentData) {

  return (
    <DashboardLayout
    user={user}
    onLogout={onLogout}
    title="Parent Portal"
    menuItems={menuItems}
>
      <div className="p-10">
        Loading...
 </div>



</DashboardLayout>
  );

}
  return (
  <DashboardLayout
    user={user}
    onLogout={onLogout}
    title="Parent Portal"
    menuItems={menuItems}
>
      <div className="space-y-6">

{currentView === "dashboard" && (

<>
      <Card
  sx={{
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: 4
  }}
>
  <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />

  <CardContent className="px-6 pb-6 -mt-16">

    <div className="flex flex-col items-center">

      <img
        src={
          studentData.profilePhoto
            ? `https://api.madhapharma.in${studentData.profilePhoto}`
            : "/profile.png"
        }
        className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
      />

      <h2 className="text-2xl font-bold mt-4">
        {studentData.studentName}
      </h2>

      <p className="text-gray-500">
        {studentData.studentId}
      </p>

      <Chip
        label="Hostel Student"
        color="primary"
        sx={{
          mt:2,
          fontWeight:700
        }}
      />

    </div>

    <div className="grid grid-cols-2 gap-4 mt-8">

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Department
        </p>
        <p className="font-semibold">
          {studentData.department}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Year
        </p>
        <p className="font-semibold">
          {studentData.year}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Block
        </p>
        <p className="font-semibold">
          {studentData.block || "-"}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Room
        </p>
        <p className="font-semibold">
          {studentData.roomNumber || "-"}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Bed
        </p>
        <p className="font-semibold">
          {studentData.bedNumber || "-"}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs text-gray-500">
          Phone
        </p>
        <p className="font-semibold">
          {studentData.phone}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
        <p className="text-xs text-gray-500">
          Parent
        </p>
        <p className="font-semibold">
          {studentData.parentName}
        </p>

        <p className="text-sm text-blue-600">
          {studentData.parentPhone}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
        <p className="text-xs text-gray-500">
          College
        </p>

        <p className="font-semibold">
          {studentData.collegeName}
        </p>
      </div>

    </div>

  </CardContent>
</Card>
{showLiveStatus && (
<Card
  sx={{
    borderRadius: 4,
    boxShadow: 3
  }}
>
  <CardContent className="p-5">

    <div className="flex justify-between items-center mb-5">

      <div>

        <h2 className="text-xl font-bold">
          Live Student Status
        </h2>

        <p className="text-gray-500 text-sm">
          Current hostel activity
        </p>

      </div>

      <Chip
        label={studentStatus}
        color={
          studentStatus === "Outside Hostel"
            ? "warning"
            : studentStatus === "Outpass Approved"
            ? "info"
            : "success"
        }
        sx={{
          fontWeight: 700
        }}
      />

    </div>

    <div className="grid grid-cols-2 gap-4">

      <div className="bg-blue-50 rounded-2xl p-4">

        <p className="text-xs text-gray-500">
          Current State
        </p>

        <p className="font-bold text-blue-700 mt-1">
          {studentStatus}
        </p>

      </div>

   

  

    

      <div className="bg-red-50 rounded-2xl p-4 col-span-2">

        <p className="text-xs text-gray-500">
          Destination
        </p>

        <p className="font-semibold mt-1">
          {latestOutpass?.destination ?? "Inside Hostel"}
        </p>

      </div>

    </div>

  </CardContent>
</Card>
)}
        {/* Stats */}
     {/* Quick Overview */}

<div className="grid grid-cols-2 gap-4">

<Card
sx={{
borderRadius:4,
background:"linear-gradient(135deg,#2563eb,#3b82f6)",
color:"white"
}}
>

<CardContent>

<FileText size={34} />

<p className="text-sm mt-4 opacity-80">
Total Outpasses
</p>

<h2 className="text-3xl font-bold mt-1">
{totalOutpasses}
</h2>

</CardContent>

</Card>

<Card
sx={{
borderRadius:4,
background:"linear-gradient(135deg,#16a34a,#22c55e)",
color:"white"
}}
>

<CardContent>

<Calendar size={34} />

<p className="text-sm mt-4 opacity-80">
Leave Requests
</p>

<h2 className="text-3xl font-bold mt-1">
{totalLeaves}
</h2>

</CardContent>

</Card>

<Card
sx={{
borderRadius:4,
background:"linear-gradient(135deg,#ea580c,#fb923c)",
color:"white"
}}
>

<CardContent>

<Clock size={34} />

<p className="text-sm mt-4 opacity-80">
Pending Leaves
</p>

<h2 className="text-3xl font-bold mt-1">
{pendingLeaves}
</h2>

</CardContent>

</Card>

<Card
sx={{
borderRadius:4,
background:"linear-gradient(135deg,#7c3aed,#8b5cf6)",
color:"white"
}}
>

<CardContent>

<CheckCircle2 size={34} />

<p className="text-sm mt-4 opacity-80">
Active Outpasses
</p>

<h2 className="text-3xl font-bold mt-1">
{activeOutpasses}
</h2>

</CardContent>

</Card>

</div>

        {/* Recent Outpasses */}
      <Card
  sx={{
    borderRadius: 4,
    boxShadow: 3
  }}
>
  <CardContent className="p-5">

    <div className="flex justify-between items-center mb-5">

      <div>

        <h2 className="text-xl font-bold">
          Recent Outpasses
        </h2>

        <p className="text-sm text-gray-500">
          Latest student outpass history
        </p>

      </div>

      <button
        onClick={() => setCurrentView("history")}
        className="text-blue-600 font-semibold"
      >
        View All
      </button>

    </div>

    <div className="space-y-4">

      {outpasses
        .slice(0, 2)
        .map((outpass) => (

          <div
            key={outpass.id}
            className={`rounded-3xl p-5 border ${
              outpass.outpassState === "Active" ||
              outpass.outpassState === "Outside Hostel"
                ? "bg-green-50 border-green-300"
                : "bg-white border-gray-200"
            }`}
          >

            <div className="flex justify-between items-start">

              <div>

                <h3 className="font-bold text-lg">
                  {outpass.destination}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {outpass.reason}
                </p>

              </div>

              <Chip
                label={outpass.status}
                color={
                  outpass.status === "Approved"
                    ? "success"
                    : outpass.status === "Pending"
                    ? "warning"
                    : "error"
                }
              />

            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">

              <div>

                <p className="text-xs text-gray-500">
                  Exit
                </p>

                <p className="font-semibold">
                  {outpass.timeOut}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Return
                </p>

                <p className="font-semibold">
                  {outpass.returnTime}
                </p>

              </div>

              <div>

             

           

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Date
                </p>

                <p className="font-semibold">
                  {new Date(
                    outpass.validFrom
                  ).toLocaleDateString()}
                </p>

              </div>

            </div>

           

        
            {outpass.status === "Approved" && (

              <button
                onClick={() => {

                  setSelectedOutpass(outpass);

                  setQrCardOpen(true);

                }}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-white font-bold shadow-lg"
              >
                Show Digital Pass
              </button>

            )}

          </div>

      ))}

      {outpasses.length === 0 && (

        <div className="text-center py-10">

          <FileText
            size={60}
            className="mx-auto text-gray-300 mb-4"
          />

          <p className="text-gray-500">

            No Outpass History

          </p>

        </div>

      )}

    </div>

  </CardContent>
</Card>
</>

)}

       {/* History View */}
       {currentView==="history" && (
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
                          {outpass.status === "Rejected" &&
 outpass.rejectReason && (
  <p className="text-xs text-red-600 mt-2">
    Reject Reason: {outpass.rejectReason}
  </p>
)}
                        </div>
                      </div>
                    {(
    outpass.status?.toLowerCase() === "approved" &&
    (
        outpass.outpassState === "Active" 
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
<span className="text-gray-500">Leave Type :</span> {leave.leaveType}
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
<span className="font-medium">Reason :</span> {leave.reason}
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

      
      </div>
<OutpassQRCard
    open={qrCardOpen}
    onClose={() => setQrCardOpen(false)}
    outpass={selectedOutpass}
    student={{
        id: studentData.id,
        name: studentData.studentName,
        studentId: studentData.studentId,
        profilePhoto: studentData.profilePhoto,
        avatar: "",
        college: studentData.collegeName,
        department: studentData.department,
        year: studentData.year,
    } as any}
/>
    </DashboardLayout>
  );
}
