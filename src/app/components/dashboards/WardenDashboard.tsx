import { useState } from 'react';
import {
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
} from '@mui/material';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Home,
  Phone,
  Search,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';
import type { MenuItemType } from '../common/DashboardLayout';

interface WardenDashboardProps {
  user: User;
  onLogout: () => void;
}

type WardenView = 'dashboard' | 'students' | 'outpass' | 'attendance';

export default function WardenDashboard({ user, onLogout }: WardenDashboardProps) {
  const [currentView, setCurrentView] = useState<WardenView>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Students', value: '352', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Present Today', value: '338', subtitle: '96% attendance', icon: <CheckCircle2 className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Pending Requests', value: '12', icon: <Clock className="w-6 h-6" />, color: 'bg-orange-500' },
    { label: 'Late Returns', value: '3', icon: <AlertCircle className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  const [outpassRequests, setOutpassRequests] = useState([
    { id: 'OP001', studentId: 'CS2021045', studentName: 'Rahul Kumar', room: 'A-301', reason: 'Medical Appointment', date: '2026-06-05', timeOut: '2:00 PM', expectedReturn: '6:00 PM', status: 'pending' },
    { id: 'OP002', studentId: 'EC2020123', studentName: 'Priya Sharma', room: 'A-205', reason: 'Family Function', date: '2026-06-06', timeOut: '10:00 AM', expectedReturn: '8:00 PM', status: 'pending' },
    { id: 'OP003', studentId: 'ME2021098', studentName: 'Amit Singh', room: 'A-412', reason: 'Shopping', date: '2026-06-05', timeOut: '4:00 PM', expectedReturn: '7:00 PM', status: 'pending' },
    { id: 'OP004', studentId: 'BDS2022011', studentName: 'Kavya Nair', room: 'A-108', reason: 'Bank Work', date: '2026-06-06', timeOut: '11:00 AM', expectedReturn: '3:00 PM', status: 'approved' },
  ]);

  const students = [
    { id: 'CS2021045', name: 'Rahul Kumar', room: 'A-301', department: 'BDS', year: '2nd Year', phone: '9876543210', status: 'present' },
    { id: 'EC2020123', name: 'Priya Sharma', room: 'A-205', department: 'B.Nursing', year: '3rd Year', phone: '9876543211', status: 'present' },
    { id: 'ME2021098', name: 'Amit Singh', room: 'A-412', department: 'Physiotherapy', year: '2nd Year', phone: '9876543212', status: 'absent' },
    { id: 'BDS2022011', name: 'Kavya Nair', room: 'A-108', department: 'BDS', year: '1st Year', phone: '9876543213', status: 'present' },
    { id: 'ME2022045', name: 'Deepak Raj', room: 'A-215', department: 'B.Nursing', year: '1st Year', phone: '9876543214', status: 'present' },
    { id: 'CS2023001', name: 'Ananya Menon', room: 'A-320', department: 'BDS', year: '1st Year', phone: '9876543215', status: 'on-leave' },
  ];

  const attendanceData = [
    { date: '2026-06-06 (Today)', present: 338, absent: 8, onLeave: 6 },
    { date: '2026-06-05', present: 340, absent: 7, onLeave: 5 },
    { date: '2026-06-04', present: 335, absent: 10, onLeave: 7 },
    { date: '2026-06-03', present: 342, absent: 5, onLeave: 5 },
    { date: '2026-06-02', present: 338, absent: 8, onLeave: 6 },
  ];

  const handleApprove = (requestId: string) => {
    setOutpassRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'approved' } : r)
    );
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    setOutpassRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'rejected' } : r)
    );
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems: MenuItemType[] = [
    { icon: <Home size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <Users size={22} />, label: 'Students', active: currentView === 'students', onClick: () => setCurrentView('students') },
    { icon: <FileText size={22} />, label: 'Outpass Requests', active: currentView === 'outpass', onClick: () => setCurrentView('outpass') },
    { icon: <Calendar size={22} />, label: 'Attendance', active: currentView === 'attendance', onClick: () => setCurrentView('attendance') },
  ];

  const viewTitle = {
    dashboard: 'Warden Dashboard',
    students: 'Students',
    outpass: 'Outpass Requests',
    attendance: 'Attendance',
  }[currentView];

  const pendingCount = outpassRequests.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout user={user} onLogout={onLogout} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* Students View */}
        {currentView === 'students' && (
          <>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center space-x-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar sx={{ width: 44, height: 44, bgcolor: '#2563eb' }}>
                        {student.name[0]}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                          <Chip
                            label={student.status === 'on-leave' ? 'On Leave' : student.status}
                            color={student.status === 'present' ? 'success' : student.status === 'absent' ? 'error' : 'warning'}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{student.id} • {student.department} • {student.year}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center"><Building2 size={11} className="mr-1" />Room {student.room}</span>
                          <span className="flex items-center"><Phone size={11} className="mr-1" />{student.phone}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-10">
                  <Users size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No students found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Outpass Requests View */}
        {currentView === 'outpass' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg">Outpass Requests</h3>
              {pendingCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <div className="space-y-3">
              {outpassRequests.map((request) => (
                <Card key={request.id} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{request.studentName}</p>
                        <p className="text-xs text-gray-500">{request.studentId} • Room {request.room}</p>
                      </div>
                      <Chip
                        label={request.status}
                        color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-sm text-gray-700 font-medium">{request.reason}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center"><Calendar size={11} className="mr-1" />{request.date}</span>
                        <span className="flex items-center"><Clock size={11} className="mr-1" />{request.timeOut} - {request.expectedReturn}</span>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setSelectedRequest(request); setDialogOpen(true); }}
                          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                        >
                          Quick Approve
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Attendance View */}
        {currentView === 'attendance' && (
          <>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-3">Today's Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">338</p>
                    <p className="text-xs text-gray-600 mt-1">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">8</p>
                    <p className="text-xs text-gray-600 mt-1">Absent</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">6</p>
                    <p className="text-xs text-gray-600 mt-1">On Leave</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {attendanceData.map((day, i) => (
                <Card key={i} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <p className="font-semibold text-gray-800 text-sm mb-3">{day.date}</p>
                    <div className="flex space-x-3">
                      <div className="flex-1 bg-green-50 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-green-600">{day.present}</p>
                        <p className="text-xs text-gray-500">Present</p>
                      </div>
                      <div className="flex-1 bg-red-50 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-red-600">{day.absent}</p>
                        <p className="text-xs text-gray-500">Absent</p>
                      </div>
                      <div className="flex-1 bg-orange-50 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-orange-600">{day.onLeave}</p>
                        <p className="text-xs text-gray-500">Leave</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Dashboard Overview */}
        {currentView === 'dashboard' && (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5 text-white">
              <h2 className="text-xl font-bold mb-1">Welcome, {user.name}</h2>
              <p className="text-purple-200 text-sm">A Block Warden • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <Card key={index} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className={`${stat.color} text-white p-2.5 rounded-xl mb-3 w-fit`}>
                      {stat.icon}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    {stat.subtitle && <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setCurrentView('students')} className="bg-blue-600 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform">
                <Users size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Students</p>
              </button>
              <button onClick={() => setCurrentView('outpass')} className="bg-orange-500 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform relative">
                <FileText size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Outpass</p>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button onClick={() => setCurrentView('attendance')} className="bg-green-600 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform">
                <Calendar size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Attendance</p>
              </button>
            </div>

            {/* Pending Requests Preview */}
            {pendingCount > 0 && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">Pending Approvals</h3>
                    <button onClick={() => setCurrentView('outpass')} className="text-blue-600 text-xs font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {outpassRequests.filter((r) => r.status === 'pending').slice(0, 2).map((request) => (
                      <div key={request.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 text-sm">{request.studentName}</p>
                          <span className="text-xs text-gray-500">{request.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{request.reason} • Room {request.room}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs font-semibold active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs font-semibold active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Block Overview */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-3">A Block Overview</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Total Rooms', value: '100', color: 'text-gray-800' },
                    { label: 'Occupied Rooms', value: '88', color: 'text-blue-600' },
                    { label: 'Vacant Rooms', value: '12', color: 'text-green-600' },
                    { label: 'Total Capacity', value: '400 students', color: 'text-gray-800' },
                    { label: 'Current Occupancy', value: '352 (88%)', color: 'text-green-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        {selectedRequest && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <p className="font-bold text-gray-800">Review Outpass Request</p>
              <p className="text-sm text-gray-500 font-normal">{selectedRequest.studentName} • {selectedRequest.studentId}</p>
            </DialogTitle>
            <DialogContent>
              <div className="space-y-3 pt-1">
                {[
                  { label: 'Room', value: selectedRequest.room },
                  { label: 'Reason', value: selectedRequest.reason },
                  { label: 'Date', value: selectedRequest.date },
                  { label: 'Time', value: `${selectedRequest.timeOut} - ${selectedRequest.expectedReturn}` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-800">{item.value}</span>
                  </div>
                ))}
                <TextField label="Remarks (Optional)" multiline rows={2} fullWidth margin="dense" size="small" />
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
              <Button variant="contained" color="error" onClick={() => handleReject(selectedRequest.id)} sx={{ flex: 1 }}>Reject</Button>
              <Button variant="contained" color="success" onClick={() => handleApprove(selectedRequest.id)} sx={{ flex: 1 }}>Approve</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
