import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import {
  Users,
  Building2,
  Bus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  UserCircle,
  Phone,
  Home,
  X
} from "lucide-react";
import DashboardLayout from '../common/DashboardLayout';
import {
  ArrowLeft,
  UserCircle,
  Phone,
  Home,
  X
} from "lucide-react";
import type { User } from '../../types';
import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getActivities,
  getHostelStudents,
  getTransportStudents
} from "../../../api/adminDashboardService";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
const [summary, setSummary] = useState({

    totalStudents: 0,

    hostelStudents: 0,

    transportStudents: 0,

    mdchHostel: 0,
    mdchTransport: 0,

    mconHostel: 0,
    mconTransport: 0,

    mcopHostel: 0,
    mcopTransport: 0

});
const [activities, setActivities] = useState<any[]>([]);
const [students, setStudents] = useState<any[]>([]);
const [selectedStudent, setSelectedStudent] = useState<any>(null);
const [studentType, setStudentType] = useState<"hostel" | "transport" | null>(null);
const [studentDialogOpen, setStudentDialogOpen] =
useState(false);
const [studentDetailOpen, setStudentDetailOpen] =
useState(false);
const [dialogTitle, setDialogTitle] =
useState("");
const [search, setSearch] = useState("");
useEffect(() => {

    loadDashboard();

}, []);

async function loadDashboard() {

    try {

        const data =
            await getDashboardSummary();

        console.log(data);

        setSummary(data);
const activityData = await getActivities();

setActivities(activityData);
    }
    catch (err) {

        console.error(err);

    }
}
const openHostelStudents = async (
college: string
) => {

const data =
await getHostelStudents(college);

setStudents(data);
  setStudentType("hostel"); 

setDialogTitle(
college + " Hostel Students"
);

setStudentDialogOpen(true);

};

const openTransportStudents = async (
college: string
) => {

const data =
await getTransportStudents(college);

setStudents(data);
  setStudentType("transport");  
setDialogTitle(
college + " Transport Students"
);

setStudentDialogOpen(true);

};

const filteredStudents = students.filter((student: any) => {

    const text = search.toLowerCase();

    return (
        student.studentName?.toLowerCase().includes(text) ||
        student.studentId?.toLowerCase().includes(text) ||
        student.phone?.toLowerCase().includes(text)
    );

});
if (selectedStudent) {

  if (studentType === "hostel") {

    // PASTE YOUR ENTIRE HOSTEL DETAIL VIEW HERE

  }

  if (studentType === "transport") {

    // PASTE YOUR ENTIRE TRANSPORT DETAIL VIEW HERE

  }

}
if (
    studentDetailOpen &&
    selectedStudent &&
    studentType === "hostel"
) {
    return (
        <DashboardLayout
            user={user}
            onLogout={onLogout}
            title="Student Details"
        >
            <div className="max-w-2xl mx-auto space-y-4 pb-6">

                <button
                    onClick={() => {
                        setStudentDetailOpen(false);
                        setSelectedStudent(null);
                        setStudentDialogOpen(true);
                    }}
                    className="flex items-center space-x-2 text-blue-600 font-medium text-sm"
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white">

                    <div className="flex items-center space-x-4">

                        <div className="bg-white/20 p-3 rounded-2xl">
                            <UserCircle size={40} />
                        </div>

                        <div>

                            <h2 className="font-bold text-xl">
                                {selectedStudent.studentName}
                            </h2>

                            <p className="text-blue-100">
                                {selectedStudent.studentId}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <Phone size={14} />
                                {selectedStudent.phone}
                            </div>

                        </div>

                    </div>

                </div>

                <div className="bg-blue-50 rounded-2xl p-4">

                    <h3 className="font-bold text-blue-700 mb-3">
                        Academic Details
                    </h3>

                    <div className="space-y-2">

                        <div className="flex justify-between">
                            <span>College</span>
                            <span>{selectedStudent.collegeName}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Department</span>
                            <span>{selectedStudent.department}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Year</span>
                            <span>{selectedStudent.year}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Batch</span>
                            <span>{selectedStudent.batch}</span>
                        </div>

                    </div>

                </div>

                <div className="bg-green-50 rounded-2xl p-4">

                    <h3 className="font-bold text-green-700 mb-3">
                        Parent Details
                    </h3>

                    <div className="space-y-2">

                        <div className="flex justify-between">
                            <span>Name</span>
                            <span>{selectedStudent.parentName}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Phone</span>
                            <span>{selectedStudent.parentPhone}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Address</span>
                            <span>{selectedStudent.address}</span>
                        </div>

                    </div>

                </div>

                <div className="bg-purple-50 rounded-2xl p-4">

                    <h3 className="font-bold text-purple-700 mb-3">
                        Room Details
                    </h3>

                    <div className="flex justify-between">

                        <span>Room Number</span>

                        <span>
                            {selectedStudent.roomNumber ??
                                "Not Allocated"}
                        </span>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}


if (
    studentDetailOpen &&
    selectedStudent &&
    studentType === "transport"
) {
    return (
        <Dialog
            open={studentDetailOpen}
            onClose={() => {
                setStudentDetailOpen(false);
                setSelectedStudent(null);
                setStudentDialogOpen(true);
            }}
            fullScreen
            PaperProps={{ sx: { bgcolor: "#f9fafb" } }}
        >
            <>
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
                    <h2 className="text-white text-xl font-bold">
                        Student Details
                    </h2>

                    <button
                        onClick={() => {
                            setStudentDetailOpen(false);
                            setSelectedStudent(null);
                            setStudentDialogOpen(true);
                        }}
                        className="text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-3">

                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>

                            <div className="flex items-center space-x-3 mb-4">

                                <div className="bg-purple-100 p-3 rounded-xl">
                                    <UserCircle
                                        className="text-purple-600"
                                        size={32}
                                    />
                                </div>

                                <div>

                                    <h3 className="font-bold text-lg">
                                        {selectedStudent.studentName}
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {selectedStudent.studentId}
                                    </p>

                                </div>

                            </div>

                            <div className="space-y-3">

                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <p><b>Phone:</b> {selectedStudent.phone}</p>
                                </div>

                                <div className="bg-green-50 p-3 rounded-xl">
                                    <p><b>College:</b> {selectedStudent.collegeName}</p>
                                    <p><b>Department:</b> {selectedStudent.department}</p>
                                    <p><b>Year:</b> {selectedStudent.year}</p>
                                    <p><b>Batch:</b> {selectedStudent.batch}</p>
                                </div>

                                <div className="bg-orange-50 p-3 rounded-xl">
                                    <p><b>Parent:</b> {selectedStudent.parentName}</p>
                                    <p><b>Parent Phone:</b> {selectedStudent.parentPhone}</p>
                                </div>

                                <div className="bg-purple-50 p-3 rounded-xl">
                                    <p><b>Address:</b></p>
                                    <p>{selectedStudent.address}</p>
                                </div>

                                <div className="bg-indigo-50 p-3 rounded-xl">
                                    <p><b>Route:</b> {selectedStudent.busRoute}</p>
                                    <p><b>Bus:</b> {selectedStudent.busNumber}</p>
                                    <p><b>Pickup:</b> {selectedStudent.pickupPoint}</p>
                                    <p><b>Pickup Time:</b> {selectedStudent.pickupTime}</p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>

                </div>
            </>
        </Dialog>
    );
}
  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Admin Dashboard">
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-blue-100 text-sm">Here's your institution overview</p>
        </div>

      {/* Student Summary */}

<Card sx={{ borderRadius: 3 }}>
  <CardContent className="p-5">

    <div className="flex items-center justify-between mb-5">

      <div>
        <p className="text-sm text-gray-600">
          Total Students
        </p>

        <p className="text-4xl font-bold text-blue-700">
          {summary.totalStudents}
        </p>
      </div>

      <div className="bg-blue-500 text-white p-4 rounded-2xl">
        <Users size={32} />
      </div>

    </div>

    <table className="w-full border border-gray-200 rounded-xl overflow-hidden">

      <thead className="bg-gray-100">

        <tr>

          <th className="text-left p-3">
            College
          </th>

          <th className="text-center p-3">
            Hostel
          </th>

          <th className="text-center p-3">
            Transport
          </th>

        </tr>

      </thead>

      <tbody>

        <tr className="border-t">
          <td className="p-3">
            Madha Dental College & Hospital
          </td>

          <td className="text-center">
       {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
            openHostelStudents("Madha Dental College & Hospital")
        }
    >
        {summary.mdchHostel}
    </button>
) : (
    <span className="font-bold text-gray-700">
        {summary.mdchHostel}
    </span>
)}
          </td>

          <td className="text-center">
            {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
       openTransportStudents(
"Madha Dental College & Hospital"
)
        }
    >
      {summary.mdchTransport}
    </button>
) : (
    <span className="font-bold text-gray-700">
       {summary.mdchTransport}
    </span>
)}
        
          </td>
        </tr>

        <tr className="border-t">
          <td className="p-3">
            Madha College of Nursing
          </td>

          <td className="text-center">
            {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
         openHostelStudents(
"Madha College of Nursing"
)
        }
    >
    {summary.mconHostel}
    </button>
) : (
    <span className="font-bold text-gray-700">
     {summary.mconHostel}
    </span>
)}
  
          </td>

          <td className="text-center">
            {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
          openTransportStudents(
"Madha College of Nursing"
)
        }
    >
       {summary.mconTransport}
    </button>
) : (
    <span className="font-bold text-gray-700">
     {summary.mconTransport}
    </span>
)}
    
          </td>
        </tr>

        <tr className="border-t">
          <td className="p-3">
            Madha College of Physiotherapy
          </td>

          <td className="text-center">
            {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
           openHostelStudents(
"Madha College of Physiotherapy"
)
        }
    >
       {summary.mcopHostel}
    </button>
) : (
    <span className="font-bold text-gray-700">
     {summary.mcopHostel}
    </span>
)}
     
          </td>

          <td className="text-center">
            {user.isSystemAdmin ? (
    <button
        className="text-blue-600 font-bold hover:underline"
        onClick={() =>
          openTransportStudents(
"Madha College of Physiotherapy"
)
        }
    >
  {summary.mcopTransport}
    </button>
) : (
    <span className="font-bold text-gray-700">
    {summary.mcopTransport}
    </span>
)}
       
          </td>
        </tr>

      </tbody>

      <tfoot className="bg-gray-100 font-bold">

        <tr>

          <td className="p-3">
            Total
          </td>

          <td className="text-center">
            {summary.hostelStudents}
          </td>

          <td className="text-center">
            {summary.transportStudents}
          </td>

        </tr>

      </tfoot>

    </table>

  </CardContent>
</Card>

        {/* Recent Activities */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Activities
            </h3>
            <div className="space-y-3">
              {activities.map((activity: any, index: number) => (
    <div
        key={index}
        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl"
    >
        <div className="mt-1">
            <Clock
                size={18}
                className="text-blue-500"
            />
        </div>

        <div className="flex-1">
            <p className="text-sm text-gray-800 font-medium">
                {activity.message}
            </p>

            <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.time).toLocaleString()}
            </p>
        </div>
    </div>
))}
            </div>
          </CardContent>
        </Card>
      </div>
<Dialog
    open={studentDialogOpen}
    onClose={() => {
        setStudentDialogOpen(false);
        setSearch("");
    }}
    fullWidth
    maxWidth="md"
>

<div className="bg-blue-700 text-white p-5">

    <div className="flex justify-between items-center">

        <div>

            <h2 className="text-xl font-bold">
                {dialogTitle}
            </h2>

            <p className="text-blue-100 text-sm mt-1">
                {filteredStudents.length} Students
            </p>

        </div>

        <IconButton
            onClick={()=>{
                setStudentDialogOpen(false);
                setSearch("");
            }}
            sx={{color:"white"}}
        >
            ✕
        </IconButton>

    </div>

</div>

<DialogContent className="p-5">

<div className="mb-4">

<input
    type="text"
    placeholder="Search by Name, Student ID or Phone..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-500"
/>

</div>

<div className="space-y-3 max-h-[500px] overflow-y-auto">

{
filteredStudents.length===0 ?

<div className="text-center py-8 text-gray-500">

No Students Found

</div>

:

filteredStudents.map((student:any)=>(
<div
  key={student.studentId}
onClick={() => {
    setSelectedStudent(student);
    setStudentDialogOpen(false);
    setStudentDetailOpen(true);
}}
  className="bg-white border border-gray-200 rounded-2xl p-4 hover:bg-blue-50 transition cursor-pointer shadow-sm"
>

<div className="flex justify-between">

<div className="flex gap-3">

<div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

<Users
size={26}
className="text-blue-700"
/>

</div>

<div>

<h3 className="font-bold text-gray-800 text-lg">

{student.studentName}

</h3>

<p className="text-gray-500 text-sm">

{student.studentId}

</p>

<p className="text-gray-500 text-sm">

{student.department}

</p>

<p className="text-gray-500 text-sm">

{student.year}

</p>

</div>

</div>

<div className="text-right">

<p className="text-sm text-gray-500">
Phone
</p>

<p className="font-semibold text-gray-700">

{student.phone}

</p>

</div>

</div>

</div>

))

}

</div>

</DialogContent>

</Dialog>
    </DashboardLayout>
    
  );
}
