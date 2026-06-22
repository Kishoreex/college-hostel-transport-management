import { useState } from 'react';
import { Card, CardContent, Chip, Avatar } from '@mui/material';
import {
  LogIn,
  LogOut,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Search,
  Home,
  ClipboardList,
  ScanLine,
  Shield,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';
import type { MenuItemType } from '../common/DashboardLayout';

interface SecurityDashboardProps {
  user: User;
  onLogout: () => void;
}

type SecurityView = 'dashboard' | 'scan' | 'logs';

export default function SecurityDashboard({ user, onLogout }: SecurityDashboardProps) {
  const [currentView, setCurrentView] = useState<SecurityView>('dashboard');
  const [scanQuery, setScanQuery] = useState('');
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [scanError, setScanError] = useState('');

  const stats = [
    { label: 'Students Out', value: '142', subtitle: 'Currently outside', icon: <LogOut className="w-6 h-6" />, color: 'bg-orange-500' },
    { label: 'Entries Today', value: '468', icon: <LogIn className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Exits Today', value: '452', icon: <LogOut className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Late Returns', value: '3', icon: <Clock className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  const [activeOutpasses, setActiveOutpasses] = useState([
    { studentId: 'CS2021045', name: 'Rahul Kumar', room: 'A-301', timeOut: '2:00 PM', expectedReturn: '6:00 PM', destination: 'Medical Appointment', status: 'active' },
    { studentId: 'EC2020123', name: 'Priya Sharma', room: 'A-205', timeOut: '3:30 PM', expectedReturn: '7:00 PM', destination: 'Shopping', status: 'active' },
    { studentId: 'ME2021098', name: 'Amit Singh', room: 'A-412', timeOut: '1:00 PM', expectedReturn: '5:00 PM', destination: 'Bank Work', status: 'overdue' },
  ]);

  const entryLogs = [
    { id: 1, type: 'exit', studentId: 'CS2021045', name: 'Rahul Kumar', room: 'A-301', time: '2:00 PM', action: 'Exit', date: 'Today' },
    { id: 2, type: 'entry', studentId: 'EC2020067', name: 'Sneha Patel', room: 'B-212', time: '1:45 PM', action: 'Entry', date: 'Today' },
    { id: 3, type: 'exit', studentId: 'ME2021098', name: 'Amit Singh', room: 'A-412', time: '1:00 PM', action: 'Exit', date: 'Today' },
    { id: 4, type: 'entry', studentId: 'BDS2022011', name: 'Kavya Nair', room: 'A-108', time: '12:30 PM', action: 'Entry', date: 'Today' },
    { id: 5, type: 'entry', studentId: 'CS2023001', name: 'Ananya Menon', room: 'A-320', time: '11:00 AM', action: 'Entry', date: 'Today' },
    { id: 6, type: 'exit', studentId: 'ME2022045', name: 'Deepak Raj', room: 'A-215', time: '10:30 AM', action: 'Exit', date: 'Today' },
    { id: 7, type: 'entry', studentId: 'EC2020123', name: 'Priya Sharma', room: 'A-205', time: '9:00 AM', action: 'Entry', date: 'Yesterday' },
  ];

  const mockStudents: Record<string, any> = {
    'CS2021045': { name: 'Rahul Kumar', room: 'A-301', outpass: 'OP001', destination: 'Medical Appointment', expectedReturn: '6:00 PM', status: 'valid' },
    'EC2020123': { name: 'Priya Sharma', room: 'A-205', outpass: 'OP002', destination: 'Shopping', expectedReturn: '7:00 PM', status: 'valid' },
    'ME2021098': { name: 'Amit Singh', room: 'A-412', outpass: 'OP003', destination: 'Bank Work', expectedReturn: '5:00 PM', status: 'overdue' },
  };

  const handleScan = () => {
    setScanError('');
    setScannedStudent(null);
    if (!scanQuery.trim()) return;

    const found = mockStudents[scanQuery.toUpperCase()];
    if (found) {
      setScannedStudent(found);
    } else {
      setScanError('No valid outpass found for this ID. Entry not authorized.');
    }
  };

  const handleMarkReturn = (studentId: string) => {
    setActiveOutpasses((prev) =>
      prev.map((op) => op.studentId === studentId ? { ...op, status: 'returned' } : op)
    );
  };

  const menuItems: MenuItemType[] = [
    { icon: <Home size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <ScanLine size={22} />, label: 'Scan Outpass', active: currentView === 'scan', onClick: () => setCurrentView('scan') },
    { icon: <ClipboardList size={22} />, label: 'Entry Logs', active: currentView === 'logs', onClick: () => setCurrentView('logs') },
  ];

  const viewTitle = {
    dashboard: 'Security Gate',
    scan: 'Scan Outpass',
    logs: 'Entry Logs',
  }[currentView];

  return (
    <DashboardLayout user={user} onLogout={onLogout} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* Scan View */}
        {currentView === 'scan' && (
          <>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <QrCode size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-800">Scan / Enter Student ID</h3>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center space-x-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter Student ID (e.g. CS2021045)"
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                      className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleScan}
                    className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                  >
                    Check
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Scan Result - Error */}
            {scanError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-700 text-sm">Access Denied</p>
                  <p className="text-red-600 text-xs mt-0.5">{scanError}</p>
                </div>
              </div>
            )}

            {/* Scan Result - Valid */}
            {scannedStudent && (
              <Card sx={{ borderRadius: 3, border: '2px solid #10b981' }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-2.5 rounded-xl">
                      <CheckCircle2 size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-700 text-base">Valid Outpass</p>
                      <p className="text-xs text-green-600">Outpass #{scannedStudent.outpass}</p>
                    </div>
                    <Chip
                      label={scannedStudent.status === 'overdue' ? 'OVERDUE' : 'VALID'}
                      color={scannedStudent.status === 'overdue' ? 'error' : 'success'}
                      size="small"
                      sx={{ ml: 'auto', fontWeight: 700 }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div><p className="text-xs text-gray-500">Student</p><p className="font-semibold">{scannedStudent.name}</p></div>
                    <div><p className="text-xs text-gray-500">Room</p><p className="font-semibold">{scannedStudent.room}</p></div>
                    <div><p className="text-xs text-gray-500">Destination</p><p className="font-semibold">{scannedStudent.destination}</p></div>
                    <div><p className="text-xs text-gray-500">Expected Return</p><p className="font-semibold">{scannedStudent.expectedReturn}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-green-500 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                      Allow Entry ✓
                    </button>
                    <button className="bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                      Mark Return
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Outpasses List */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Currently Outside</h3>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeOutpasses.filter((o) => o.status !== 'returned').length} out
                  </span>
                </div>
                <div className="space-y-3">
                  {activeOutpasses.map((outpass, i) => (
                    <div key={i} className={`rounded-xl p-3 border ${outpass.status === 'overdue' ? 'bg-red-50 border-red-200' : outpass.status === 'returned' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-orange-50 border-orange-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{outpass.name}</p>
                        <Chip
                          label={outpass.status === 'returned' ? 'Returned' : outpass.status === 'overdue' ? 'Overdue' : 'Outside'}
                          color={outpass.status === 'returned' ? 'default' : outpass.status === 'overdue' ? 'error' : 'warning'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{outpass.studentId} • Room {outpass.room}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">Return by: {outpass.expectedReturn}</p>
                        {outpass.status !== 'returned' && (
                          <button
                            onClick={() => handleMarkReturn(outpass.studentId)}
                            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg font-medium active:scale-95"
                          >
                            Mark Return
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Entry Logs View */}
        {currentView === 'logs' && (
          <>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex items-center space-x-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      className="flex-1 bg-transparent border-0 focus:outline-none text-sm placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {entryLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${log.type === 'exit' ? 'bg-orange-100' : 'bg-green-100'}`}>
                          {log.type === 'exit'
                            ? <LogOut className="text-orange-600" size={18} />
                            : <LogIn className="text-green-600" size={18} />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{log.name}</p>
                          <p className="text-xs text-gray-500">{log.studentId} • Room {log.room}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${log.type === 'exit' ? 'text-orange-600' : 'text-green-600'}`}>{log.action}</p>
                        <p className="text-xs text-gray-500">{log.time}</p>
                        <p className="text-xs text-gray-400">{log.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-5 text-white">
              <div className="flex items-center space-x-3 mb-1">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Security Gate</h2>
                  <p className="text-red-200 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <Card key={index} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className={`${stat.color} text-white p-2.5 rounded-xl mb-3 w-fit`}>{stat.icon}</div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    {stat.subtitle && <p className="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCurrentView('scan')} className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg active:scale-95 transition-transform">
                <QrCode size={28} className="mx-auto mb-2" />
                <p className="font-semibold text-sm">Scan Outpass</p>
                <p className="text-xs text-blue-200 mt-0.5">Verify student pass</p>
              </button>
              <button onClick={() => setCurrentView('logs')} className="bg-slate-700 text-white p-5 rounded-2xl shadow-lg active:scale-95 transition-transform">
                <ClipboardList size={28} className="mx-auto mb-2" />
                <p className="font-semibold text-sm">Entry Logs</p>
                <p className="text-xs text-slate-300 mt-0.5">View all entries</p>
              </button>
            </div>

            {/* Overdue Alerts */}
            {activeOutpasses.filter((o) => o.status === 'overdue').length > 0 && (
              <Card sx={{ borderRadius: 3, border: '2px solid #ef4444' }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle size={20} className="text-red-500" />
                    <h3 className="font-bold text-red-700">Overdue Returns</h3>
                  </div>
                  {activeOutpasses.filter((o) => o.status === 'overdue').map((outpass, i) => (
                    <div key={i} className="bg-red-50 rounded-xl p-3 mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{outpass.name}</p>
                          <p className="text-xs text-gray-600">{outpass.studentId} • Room {outpass.room}</p>
                          <p className="text-xs text-red-600 mt-1">Was due at {outpass.expectedReturn}</p>
                        </div>
                        <button
                          onClick={() => handleMarkReturn(outpass.studentId)}
                          className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:scale-95"
                        >
                          Mark Return
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Active Outpasses Preview */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Active Outpasses</h3>
                  <button onClick={() => setCurrentView('scan')} className="text-blue-600 text-xs font-medium">Manage</button>
                </div>
                <div className="space-y-2">
                  {activeOutpasses.filter((o) => o.status !== 'returned').map((outpass, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{outpass.name}</p>
                        <p className="text-xs text-gray-500">{outpass.destination} • Due {outpass.expectedReturn}</p>
                      </div>
                      <Chip
                        label={outpass.status === 'overdue' ? 'Overdue' : 'Active'}
                        color={outpass.status === 'overdue' ? 'error' : 'warning'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Recent Activity</h3>
                  <button onClick={() => setCurrentView('logs')} className="text-blue-600 text-xs font-medium">View All</button>
                </div>
                <div className="space-y-2">
                  {entryLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg ${log.type === 'exit' ? 'bg-orange-100' : 'bg-green-100'}`}>
                          {log.type === 'exit' ? <LogOut className="text-orange-600" size={16} /> : <LogIn className="text-green-600" size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{log.name}</p>
                          <p className="text-xs text-gray-500">{log.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-xs ${log.type === 'exit' ? 'text-orange-600' : 'text-green-600'}`}>{log.action}</p>
                        <p className="text-xs text-gray-400">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
