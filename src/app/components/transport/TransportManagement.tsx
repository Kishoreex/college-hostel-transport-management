import {
  getTransportApplications,
  approveTransportStudent,
  rejectTransportStudent,
  getRoutes,
  createRoute,
  updateRoute,
  getTransportStudents,
  downloadTransportReport,
  getTransportCancellationRequests,
  approveTransportCancellation,
  rejectTransportCancellation
} from "../../../api/transportService";

import { useState, useEffect } from 'react'
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
} from '@mui/material';
import {
  Bus,
  Users,
  MapPin,
  Plus,
  Edit,
  CheckCircle2,
  X,
  Phone,
  Building2,
  UserCircle,
  Home,
  Trash2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';

interface TransportManagementProps {
  user: User;
  onLogout: () => void;
}

interface PickupPoint {
  location: string;
  time: string;
}

interface Route {
  routeId: string;
  routeName: string;
  busNumber: string;
  driver: string;
  driverPhone: string;
  pickupPoints: PickupPoint[];
  students: number;
  morningTime: string;
  eveningTime: string;
  status: string;
}

interface TransportStudent {
  studentId: string;
  studentName: string;
  phone: string;
  collegeName: string;
  department: string;
  year: string;
  batch: string;
  parentName: string;
  parentPhone: string;
  address: string;
  busRoute: string;
  busNumber: string;
  pickupPoint: string;
  pickupTime: string;
}

interface CancellationRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  year: string;
  batch: string;
  busRoute: string;
  busNumber: string;
  pickupPoint: string;
  phone: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'closed';
}

export default function TransportManagement({ user, onLogout }: TransportManagementProps) {
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TransportStudent | null>(null);
  const [applicationMonths, setApplicationMonths] = useState(12);

const [cancellationMonths, setCancellationMonths] = useState(12);
const handleApprove = async (id: number) => {
  await approveTransportStudent(id);

  toast.success("Student Approved");

  await loadApplications();
  await loadStudents();
};
const handleReject = async (id: number) => {
  await rejectTransportStudent(id);

  toast.success("Student Rejected");

  await loadApplications();
  await loadStudents();
};
const handleApproveCancellation = async (id: number) => {
  try {
    await approveTransportCancellation(id);

    toast.success("Transport cancelled successfully");

    await loadStudents();
    await loadCancellationRequests();
  } catch (err) {
    console.error(err);
    toast.error("Approval failed");
  }
};

const handleRejectCancellation = async (id: number) => {
  try {
    await rejectTransportCancellation(id);

    toast.success("Cancellation rejected");

    await loadCancellationRequests();
  } catch (err) {
    console.error(err);
    toast.error("Reject failed");
  }
};
  const [editForm, setEditForm] = useState({
    routeName: '',
    busNumber: '',
    driver: '',
    driverPhone: '',
    morningTime: '',
    eveningTime: '',
    pickupPoints: [] as PickupPoint[],
  });


const [routes, setRoutes] = useState<Route[]>([]);
 const [students, setStudents] = useState<TransportStudent[]>([]);
  const [applications, setApplications] =
  useState([]);
useEffect(() => {
  loadApplications();
  loadRoutes();
  loadStudents();
  loadCancellationRequests();
}, []);
const loadCancellationRequests = async () => {
  try {
    const data = await getTransportCancellationRequests();

    setCancellationRequests(
      data.map((x: any) => ({
        id: x.id,
        studentId: x.studentId,
        studentName: x.studentName,
        department: x.department ?? "-",
        year: x.year ?? "-",
        batch: x.batch ?? "-",
        busRoute: x.busRoute ?? "-",
        busNumber: x.busNumber ?? "-",
        pickupPoint: x.pickupPoint ?? "-",
        phone: x.phone ?? "-",
        reason: x.reason,
        requestDate: x.requestedAt,
        status: x.status.toLowerCase(),
      }))
    );
  } catch (err) {
    console.error(err);
  }
};
const loadStudents = async () => {
  try {
    const data = await getTransportStudents();
    setStudents(data);
  } catch (err) {
    console.error(err);
  }
};  


const loadRoutes = async () => {
  try {
    const data = await getRoutes();

    const formatted = data.map((r: any) => ({
      routeId: r.id,
      routeName: r.routeName,
      busNumber: r.busNumber,
      driver: r.driverName,
      driverPhone: r.driverPhone,
      students: 0,
      morningTime: r.morningTime,
      eveningTime: r.eveningTime,
      status: "active",

      pickupPoints: r.stops.map((s: any) => ({
        location: s.stopName,
        time: s.pickupTime
      }))
    }));

    setRoutes(formatted);
  }
  catch (err) {
    console.error(err);
  }
};

const loadApplications = async () => {
  try {
    const data =
      await getTransportApplications();

    setApplications(data);
  } catch (error) {
    console.error(error);
  }
};

const [cancellationRequests, setCancellationRequests] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setEditForm({
      routeName: route.routeName,
      busNumber: route.busNumber,
      driver: route.driver,
      driverPhone: route.driverPhone,
      morningTime: route.morningTime,
      eveningTime: route.eveningTime,
      pickupPoints: [...route.pickupPoints],
    });
    setEditDialogOpen(true);
  };

  const handleAddRoute = () => {
    setEditForm({
      routeName: '',
      busNumber: '',
      driver: '',
      driverPhone: '',
      morningTime: '',
      eveningTime: '',
      pickupPoints: [{ location: '', time: '' }],
    });
    setAddDialogOpen(true);
  };

const handleSaveRoute = async () => {
  if (!selectedRoute) return;

  try {
    const payload = {
      routeName: editForm.routeName,
      busNumber: editForm.busNumber,
      driverName: editForm.driver,
      driverPhone: editForm.driverPhone,
      morningTime: editForm.morningTime,
      eveningTime: editForm.eveningTime,

      stops: editForm.pickupPoints.map((p) => ({
        stopName: p.location,
        pickupTime: p.time,
      })),
    };

    await updateRoute(Number(selectedRoute.routeId), payload);

    await loadRoutes();

    setEditDialogOpen(false);
    setSelectedRoute(null);

    toast.success("Route updated successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update route");
  }
};
const handleCreateRoute = async () => {
  try {
    const payload = {
      routeName: editForm.routeName,
      busNumber: editForm.busNumber,
      driverName: editForm.driver,
      driverPhone: editForm.driverPhone,
      morningTime: editForm.morningTime,
      eveningTime: editForm.eveningTime,

      stops: editForm.pickupPoints.map((point) => ({
        stopName: point.location,
        pickupTime: point.time,
      })),
    };

    await createRoute(payload);

    await loadRoutes();

    setAddDialogOpen(false);

    setEditForm({
      routeName: "",
      busNumber: "",
      driver: "",
      driverPhone: "",
      morningTime: "",
      eveningTime: "",
      pickupPoints: [{ location: "", time: "" }],
    });

    toast.success("Route created successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to create route");
  }
};
  const addPickupPoint = () => {
    setEditForm({
      ...editForm,
      pickupPoints: [...editForm.pickupPoints, { location: '', time: '' }],
    });
  };

  const removePickupPoint = (index: number) => {
    setEditForm({
      ...editForm,
      pickupPoints: editForm.pickupPoints.filter((_, i) => i !== index),
    });
  };

  const updatePickupPoint = (index: number, field: 'location' | 'time', value: string) => {
    const updated = [...editForm.pickupPoints];
    updated[index][field] = value;
    setEditForm({ ...editForm, pickupPoints: updated });
  };

  const handleStudentClick = (student: TransportStudent) => {
    setSelectedStudent(student);
    setStudentDetailOpen(true);
  };

const pendingApplications = applications.filter(
  (app: any) => app.status === "Pending"
);

 const transportQuickActions = [
  {
    label: "Routes",
    icon: <Bus size={22} />,
    color: "bg-blue-500",
    screen: "routes",
  },
  {
    label: "Students ",
    icon: <Users size={22} />,
    color: "bg-purple-500",
    screen: "students",
  },
  {
    label: "Applications ",
    icon: <CheckCircle2 size={22} />,
    color: "bg-green-500",
    screen: "applications",
  },
  {
    label: "Cancellations",
    icon: <XCircle size={22} />,
    color: "bg-red-500",
    screen: "cancellations",
  },
  {
    label: "Route Map",
    icon: <MapPin size={22} />,
    color: "bg-orange-500",
    screen: "routemap",
  },
  {
    label: "Reports",
    icon: <Building2 size={22} />,
    color: "bg-indigo-500",
    screen: "reports",
  },
];
const stats = [
  {
    label: "Total Routes",
    value: routes.length,
    icon: <MapPin className="w-8 h-8" />,
    color: "bg-green-500",
  },
  {
    label: "Students",
    value: students.length,
    
    icon: <Users className="w-8 h-8" />,
    color: "bg-purple-500",
  },
];
  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Transport Management">
      <div className="space-y-4 max-w-2xl mx-auto pb-6">
       {!activeScreen && (
<>
  {/* Stats Cards */}
  <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className={`${stat.color} text-white p-3 rounded-2xl mb-3 w-fit`}>
                  {stat.icon}
                </div>
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions (3+3) */}
        {!activeScreen && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {transportQuickActions.map(qa => (
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
</>
)}
        {/* ── SCREEN: ROUTES ── */}
        {activeScreen === 'routes' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Bus Routes</h3>
              <div className="ml-auto">
                <button onClick={handleAddRoute} className="flex items-center space-x-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform">
                  <Plus size={15} /><span>Add</span>
                </button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {routes.map((route) => (
                  <div key={route.routeId} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-xl"><Bus className="text-blue-600" size={20} /></div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{route.routeName}</h4>
                          <p className="text-xs text-gray-500">{route.routeId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Chip label={route.status} color={getStatusColor(route.status)} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                        <button onClick={() => handleEditRoute(route)} className="bg-gray-100 p-1.5 rounded-lg active:scale-95 transition-transform">
                          <Edit size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[['Bus Number', route.busNumber], ['Driver', route.driver], ['Driver Phone', route.driverPhone], ['Students', String(route.students)], ['Morning', route.morningTime], ['Evening', route.eveningTime]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs font-semibold mb-2">Pickup Points:</p>
                    <div className="space-y-1.5">
                      {route.pickupPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === route.pickupPoints.length - 1 ? 'bg-red-500' : 'bg-blue-400'}`} />
                            <span className="text-xs text-gray-700">{point.location}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{point.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: STUDENTS ── */}
        {activeScreen === 'students' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Transport Students</h3>
              <Chip label={`${students.length} Total`} color="primary" size="small" sx={{ ml: 'auto' }} />
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {students.map((student) => (
                  <button key={student.studentId} onClick={() => handleStudentClick(student)} className="w-full text-left">
                    <div className="flex items-center justify-between bg-white border border-gray-100 hover:border-purple-200 hover:bg-purple-50 active:bg-purple-100 p-3.5 rounded-2xl transition-all shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2.5 rounded-xl"><UserCircle className="text-purple-600" size={22} /></div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{student.studentName}</h4>
                          <p className="text-xs text-gray-500">{student.studentId}</p>
                          <p className="text-xs text-gray-400">{student.department} • {student.year}</p>
                          <p className="text-xs text-gray-400">{student.busRoute}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: APPLICATIONS ── */}
        {activeScreen === 'applications' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Transport Applications</h3>
              <Chip label={`${pendingApplications.length} Pending`} color="warning" size="small" sx={{ ml: 'auto' }} />
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
         {pendingApplications.map((app: any) => (
                  <div key={app.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
  <h4 className="font-bold text-gray-800">
    {app.studentName}
  </h4>

  <p className="text-xs text-gray-500">
    {app.studentId}
  </p>

  <p className="text-xs text-blue-600 font-semibold">
    Token No: {app.tokenNumber}
  </p>
</div>
                      <Chip label={app.status} color={getStatusColor(app.status)} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[['Department', app.department], ['Year', app.year], ['Batch', app.batch], ['Pickup Point', app.pickupPoint], ['Preferred Route', app.preferredRoute], ['Applied', app.appliedDate]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                    {app.status === "Pending" && (
<div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(app.id)}
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-sm">
                        <CheckCircle2 size={15} /><span>Approve</span>
                      </button>
                      <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-white border-2 border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform">
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

        {/* ── SCREEN: CANCELLATIONS ── */}
        {activeScreen === 'cancellations' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Cancellations</h3>
              <Chip label={`${cancellationRequests.filter(r => r.status === 'pending').length} Pending`} color="warning" size="small" sx={{ ml: 'auto' }} />
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {cancellationRequests.map((req) => (
                  <div key={req.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${req.status === 'closed' ? 'border-gray-300 bg-gray-50' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${req.status === 'closed' ? 'bg-gray-200' : 'bg-orange-100'}`}>
                          <UserCircle className={req.status === 'closed' ? 'text-gray-400' : 'text-orange-600'} size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${req.status === 'closed' ? 'text-gray-500' : 'text-gray-800'}`}>{req.studentName}</h4>
                          <p className="text-xs text-gray-500">{req.studentId}</p>
                        </div>
                      </div>
                      <Chip label={req.status === 'closed' ? 'Closed' : 'Pending'} color={req.status === 'closed' ? 'default' : 'warning'} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-3">
                      {[['Department', req.department], ['Year', req.year], ['Bus Route', req.busRoute], ['Bus No', req.busNumber], ['Pickup', req.pickupPoint], ['Phone', req.phone], ['Date', req.requestDate]].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-400">{k}</span>
                          <span className={`font-medium ${req.status === 'closed' ? 'text-gray-500' : 'text-gray-700'}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-xl mb-3">
                      <p className="text-xs font-semibold text-orange-700 mb-1">Reason:</p>
                      <p className="text-xs text-orange-600">{req.reason}</p>
                    </div>
                    {req.status === 'pending' && (
                <div className="flex gap-2">
  <button
    onClick={() => handleApproveCancellation(Number(req.id))}
    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold"
  >
    Approve
  </button>

  <button
    onClick={() => handleRejectCancellation(Number(req.id))}
    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold"
  >
    Reject
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

        {/* ── SCREEN: ROUTE MAP ── */}
        {activeScreen === 'routemap' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Route Map Overview</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {routes.map(route => (
                  <div key={route.routeId} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-orange-100 p-2.5 rounded-xl"><MapPin size={18} className="text-orange-600" /></div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{route.routeName}</p>
                        <p className="text-xs text-gray-400">{route.busNumber} • {route.students} students</p>
                      </div>
                    </div>
                    <div className="relative pl-5">
                      {route.pickupPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start space-x-3 mb-3 last:mb-0">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${idx === 0 ? 'bg-green-500' : idx === route.pickupPoints.length - 1 ? 'bg-red-500' : 'bg-blue-400'}`} />
                            {idx < route.pickupPoints.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                          </div>
                          <div className="flex-1 -mt-0.5">
                            <p className="text-sm font-medium text-gray-700">{point.location}</p>
                            <p className="text-xs text-gray-400">{point.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── SCREEN: REPORTS ── */}
        {activeScreen === 'reports' && (
          <Card sx={{ borderRadius: 3 }}>
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-gray-100">
              <button onClick={() => setActiveScreen(null)} className="p-1.5 mr-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-xl active:scale-95 transition-transform">
                <Home size={18} />
              </button>
              <h3 className="font-bold text-gray-800">Transport Reports</h3>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { title: 'Total Active Routes', value: `${routes.length}`, icon: <Bus size={20} />, color: 'bg-blue-500' },
                  { title: 'Total Students',value: `${students.length}`, icon: <Users size={20} />, color: 'bg-purple-500' },
                  { title: 'Applications Pending',value: `${pendingApplications.length}`, icon: <CheckCircle2 size={20} />, color: 'bg-green-500' },
                  { title: 'Cancellation Requests', value: `${cancellationRequests.filter(r => r.status === 'pending').length}`, icon: <XCircle size={20} />, color: 'bg-red-500' },
                ].map(stat => (
                  <div key={stat.title} className="flex items-center space-x-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className={`${stat.color} text-white p-3 rounded-2xl`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                ))}
               
              </div>
              <div className="space-y-4 mt-5">

  {/* Students */}
  <div className="bg-white border border-gray-100 rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-700">
        Transport Students
      </span>

      <button
        onClick={() => downloadTransportReport("students")}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
        Download Excel
      </button>
    </div>
  </div>

  {/* Bus Details */}
  <div className="bg-white border border-gray-100 rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-700">
        Bus Details
      </span>

      <button
        onClick={() => downloadTransportReport("buses")}
        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
        Download Excel
      </button>
    </div>
  </div>

  {/* Applications */}
  <div className="bg-white border border-gray-100 rounded-2xl p-4">
    <div className="flex items-center gap-3">

      <span className="font-semibold text-gray-700 flex-1">
        Applications
      </span>

     <select
value={applicationMonths}
onChange={(e) =>
setApplicationMonths(Number(e.target.value))
}
className="border rounded-xl px-3 py-2">

        <option value="1">1 Month</option>
<option value="3">3 Months</option>
<option value="6">6 Months</option>
<option value="12">1 Year</option>
<option value="36">3 Years</option>

      </select>

      <button
        onClick={() =>
downloadTransportReport(
"applications",
applicationMonths
)
}
        className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">

        Download

      </button>

    </div>
  </div>

  {/* Cancellations */}
  <div className="bg-white border border-gray-100 rounded-2xl p-4">
    <div className="flex items-center gap-3">

      <span className="font-semibold text-gray-700 flex-1">
    Transport Cancellation Report
</span>

    <select
value={cancellationMonths}
onChange={(e)=>
setCancellationMonths(Number(e.target.value))
}
className="border rounded-xl px-3 py-2">  

  <option value="1">1 Month</option>
<option value="3">3 Months</option>
<option value="6">6 Months</option>
<option value="12">1 Year</option>
<option value="36">3 Years</option>

      </select>

      <button
        onClick={() =>
downloadTransportReport(
"cancellations",
cancellationMonths
)
}
        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">

        Download

      </button>

    </div>
  </div>

</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Detail Dialog */}
      <Dialog
        open={studentDetailOpen}
        onClose={() => setStudentDetailOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: '#f9fafb' } }}
      >
        {selectedStudent && (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Student Details</h2>
              <button onClick={() => setStudentDetailOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <Card sx={{ borderRadius: 3 }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <UserCircle className="text-purple-600" size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{selectedStudent.studentName}</h3>
                      <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone size={16} className="text-blue-600" />
                        <span className="font-semibold text-gray-700 text-sm">Contact Information</span>
                      </div>
                      <div className="ml-6 space-y-1 text-sm">
                        <p className="text-gray-600">Student: {selectedStudent.phone}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 size={16} className="text-green-600" />
                        <span className="font-semibold text-gray-700 text-sm">Academic Information</span>
                      </div>
                      <div className="ml-6 space-y-1 text-sm">
                        <p className="text-gray-600">College: {selectedStudent.collegeName}</p>
                        <p className="text-gray-600">Department: {selectedStudent.department}</p>
                        <p className="text-gray-600">Year: {selectedStudent.year}</p>
                        <p className="text-gray-600">Batch: {selectedStudent.batch}</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserCircle size={16} className="text-orange-600" />
                        <span className="font-semibold text-gray-700 text-sm">Parent Information</span>
                      </div>
                      <div className="ml-6 space-y-1 text-sm">
                        <p className="text-gray-600">Name: {selectedStudent.parentName}</p>
                        <p className="text-gray-600">Phone: {selectedStudent.parentPhone}</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Home size={16} className="text-purple-600" />
                        <span className="font-semibold text-gray-700 text-sm">Address</span>
                      </div>
                      <p className="ml-6 text-gray-600 text-sm">{selectedStudent.address}</p>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bus size={16} className="text-indigo-600" />
                        <span className="font-semibold text-gray-700 text-sm">Transport Details</span>
                      </div>
                      <div className="ml-6 space-y-1 text-sm">
                        <p className="text-gray-600">Route: {selectedStudent.busRoute}</p>
                        <p className="text-gray-600">Bus Number: {selectedStudent.busNumber}</p>
                        <p className="text-gray-600">Pickup Point: {selectedStudent.pickupPoint}</p>
                        <p className="text-gray-600 font-medium">Pickup Time: {selectedStudent.pickupTime}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: '#f9fafb' } }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Edit Route</h2>
          <button onClick={() => setEditDialogOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
            <input
              type="text"
              value={editForm.routeName}
              onChange={(e) => setEditForm({ ...editForm, routeName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number</label>
            <input
              type="text"
              value={editForm.busNumber}
              onChange={(e) => setEditForm({ ...editForm, busNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
            <input
              type="text"
              value={editForm.driver}
              onChange={(e) => setEditForm({ ...editForm, driver: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone</label>
            <input
              type="tel"
              value={editForm.driverPhone}
              onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Morning Time</label>
              <input
                type="time"
                value={editForm.morningTime}
                onChange={(e) => setEditForm({ ...editForm, morningTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Evening Time</label>
              <input
                type="time"
                value={editForm.eveningTime}
                onChange={(e) => setEditForm({ ...editForm, eveningTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Boarding Points */}
          <div className="bg-white rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Boarding Points</label>
              <Button
                size="small"
                variant="outlined"
                onClick={addPickupPoint}
                startIcon={<Plus size={16} />}
                sx={{ borderRadius: 2 }}
              >
                Add Stop
              </Button>
            </div>
            <div className="space-y-3">
              {editForm.pickupPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Stop {index + 1}</span>
                    {editForm.pickupPoints.length > 1 && (
                      <button
                        onClick={() => removePickupPoint(index)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={point.location}
                    onChange={(e) => updatePickupPoint(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  <input
                    type="time"
                    value={point.time}
                    onChange={(e) => updatePickupPoint(index, 'time', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveRoute}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Save Changes
          </button>
        </div>
      </Dialog>

      {/* Add Route Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: '#f9fafb' } }}
      >
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Add New Route</h2>
          <button onClick={() => setAddDialogOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
            <input
              type="text"
              value={editForm.routeName}
              onChange={(e) => setEditForm({ ...editForm, routeName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g., Route 3 - Tambaram"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number</label>
            <input
              type="text"
              value={editForm.busNumber}
              onChange={(e) => setEditForm({ ...editForm, busNumber: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="TN-01-AB-XXXX"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
            <input
              type="text"
              value={editForm.driver}
              onChange={(e) => setEditForm({ ...editForm, driver: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Mr. Kumar"
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone</label>
            <input
              type="tel"
              value={editForm.driverPhone}
              onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Morning Time</label>
              <input
                type="time"
                value={editForm.morningTime}
                onChange={(e) => setEditForm({ ...editForm, morningTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Evening Time</label>
              <input
                type="time"
                value={editForm.eveningTime}
                onChange={(e) => setEditForm({ ...editForm, eveningTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Boarding Points */}
          <div className="bg-white rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Boarding Points</label>
              <Button
                size="small"
                variant="outlined"
                onClick={addPickupPoint}
                startIcon={<Plus size={16} />}
                sx={{ borderRadius: 2 }}
              >
                Add Stop
              </Button>
            </div>
            <div className="space-y-3">
              {editForm.pickupPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Stop {index + 1}</span>
                    {editForm.pickupPoints.length > 1 && (
                      <button
                        onClick={() => removePickupPoint(index)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={point.location}
                    onChange={(e) => updatePickupPoint(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                  />
                  <input
                    type="time"
                    value={point.time}
                    onChange={(e) => updatePickupPoint(index, 'time', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateRoute}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Create Route
          </button>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
