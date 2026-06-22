import { useState } from 'react';
import { Card, CardContent, Chip, Avatar } from '@mui/material';
import {
  Bus,
  Users,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  TrendingUp,
  Home,
  Calendar,
  Search,
  Phone,
  Navigation,
  Wrench,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';
import type { MenuItemType } from '../common/DashboardLayout';

interface TransportDashboardProps {
  user: User;
  onLogout: () => void;
}

type TransportView = 'dashboard' | 'fleet' | 'students' | 'attendance';

export default function TransportDashboard({ user, onLogout }: TransportDashboardProps) {
  const [currentView, setCurrentView] = useState<TransportView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Buses', value: '24', subtitle: '22 active today', icon: <Bus className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Total Students', value: '856', subtitle: 'Using transport', icon: <Users className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Present Today', value: '789', subtitle: '92% attendance', icon: <CheckCircle2 className="w-6 h-6" />, color: 'bg-emerald-500' },
    { label: 'Active Issues', value: '2', subtitle: 'Requires attention', icon: <AlertCircle className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  const routes = [
    { routeNumber: 'Route 1', routeName: 'City Center', busNumber: 'TN-01-AB-1234', driver: 'Mr. Rajan', driverPhone: '9876543210', students: 42, capacity: 50, status: 'On Time', currentLocation: 'College Campus' },
    { routeNumber: 'Route 2', routeName: 'Airport Road', busNumber: 'TN-01-AB-5678', driver: 'Mr. Kumar', driverPhone: '9876543211', students: 38, capacity: 50, status: 'On Time', currentLocation: 'En Route' },
    { routeNumber: 'Route 3', routeName: 'Railway Station', busNumber: 'TN-01-AB-9012', driver: 'Mr. Singh', driverPhone: '9876543212', students: 45, capacity: 50, status: 'Delayed', currentLocation: 'Traffic Jam' },
    { routeNumber: 'Route 4', routeName: 'IT Park', busNumber: 'TN-01-AB-3456', driver: 'Mr. Patel', driverPhone: '9876543213', students: 40, capacity: 50, status: 'On Time', currentLocation: 'College Campus' },
  ];

  const fleetData = [
    { busNumber: 'TN-01-AB-1234', route: 'Route 1 - City Center', driver: 'Mr. Rajan', lastService: '2026-05-15', nextService: '2026-07-15', status: 'active', students: 42 },
    { busNumber: 'TN-01-AB-5678', route: 'Route 2 - Airport Road', driver: 'Mr. Kumar', lastService: '2026-05-20', nextService: '2026-07-20', status: 'active', students: 38 },
    { busNumber: 'TN-01-AB-9012', route: 'Route 3 - Railway Station', driver: 'Mr. Singh', lastService: '2026-04-10', nextService: '2026-06-10', status: 'maintenance', students: 0 },
    { busNumber: 'TN-01-AB-3456', route: 'Route 4 - IT Park', driver: 'Mr. Patel', lastService: '2026-05-25', nextService: '2026-07-25', status: 'active', students: 40 },
    { busNumber: 'TN-01-AB-7890', route: 'Route 5 - Anna Nagar', driver: 'Mr. Velu', lastService: '2026-05-18', nextService: '2026-07-18', status: 'active', students: 45 },
  ];

  const transportStudents = [
    { id: 'CS2021045', name: 'Rahul Kumar', route: 'Route 1', stop: 'City Center', phone: '9876543210', status: 'present' },
    { id: 'EC2020123', name: 'Priya Sharma', route: 'Route 2', stop: 'Airport Road', phone: '9876543211', status: 'present' },
    { id: 'ME2021098', name: 'Amit Singh', route: 'Route 3', stop: 'Railway Station', phone: '9876543212', status: 'absent' },
    { id: 'BDS2022011', name: 'Kavya Nair', route: 'Route 5', stop: 'Anna Nagar', phone: '9876543213', status: 'present' },
    { id: 'ME2022045', name: 'Deepak Raj', route: 'Route 4', stop: 'IT Park', phone: '9876543214', status: 'present' },
    { id: 'CS2023001', name: 'Ananya Menon', route: 'Route 1', stop: 'City Center', phone: '9876543215', status: 'absent' },
  ];

  const attendanceRecords = [
    { date: '2026-06-06 (Today)', present: 789, absent: 67, rate: 92 },
    { date: '2026-06-05', present: 801, absent: 55, rate: 94 },
    { date: '2026-06-04', present: 780, absent: 76, rate: 91 },
    { date: '2026-06-03', present: 810, absent: 46, rate: 95 },
    { date: '2026-06-02', present: 795, absent: 61, rate: 93 },
  ];

  const alerts = [
    { id: 1, type: 'breakdown', message: 'Route 12 bus breakdown - alternate arrangement made', time: '1 hour ago', severity: 'high' },
    { id: 2, type: 'delay', message: 'Route 3 delayed by 15 minutes due to traffic', time: '30 minutes ago', severity: 'medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'success';
      case 'Delayed': return 'warning';
      case 'Breakdown': return 'error';
      default: return 'default';
    }
  };

  const filteredStudents = transportStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems: MenuItemType[] = [
    { icon: <Home size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <Bus size={22} />, label: 'Fleet Management', active: currentView === 'fleet', onClick: () => setCurrentView('fleet') },
    { icon: <Users size={22} />, label: 'Student List', active: currentView === 'students', onClick: () => setCurrentView('students') },
    { icon: <Calendar size={22} />, label: 'Attendance', active: currentView === 'attendance', onClick: () => setCurrentView('attendance') },
  ];

  const viewTitle = {
    dashboard: 'Transport Coordinator',
    fleet: 'Fleet Management',
    students: 'Student List',
    attendance: 'Attendance',
  }[currentView];

  return (
    <DashboardLayout user={user} onLogout={onLogout} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* Fleet Management View */}
        {currentView === 'fleet' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold text-green-600">22</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold text-orange-600">2</p>
                <p className="text-xs text-gray-500">Maintenance</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold text-blue-600">24</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
            <div className="space-y-3">
              {fleetData.map((bus, i) => (
                <Card key={i} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-xl ${bus.status === 'maintenance' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                          {bus.status === 'maintenance' ? <Wrench size={18} className="text-orange-600" /> : <Bus size={18} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{bus.busNumber}</p>
                          <p className="text-xs text-gray-500">{bus.route}</p>
                        </div>
                      </div>
                      <Chip
                        label={bus.status === 'maintenance' ? 'Maintenance' : 'Active'}
                        color={bus.status === 'maintenance' ? 'warning' : 'success'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span className="flex items-center"><Users size={11} className="mr-1" />Driver: {bus.driver}</span>
                      <span className="flex items-center"><Users size={11} className="mr-1" />Students: {bus.students}</span>
                      <span className="flex items-center"><Calendar size={11} className="mr-1" />Last: {bus.lastService}</span>
                      <span className="flex items-center"><Clock size={11} className="mr-1" />Next: {bus.nextService}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Student List View */}
        {currentView === 'students' && (
          <>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center space-x-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID or route..."
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
                      <Avatar sx={{ width: 44, height: 44, bgcolor: '#10b981' }}>
                        {student.name[0]}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                          <Chip
                            label={student.status}
                            color={student.status === 'present' ? 'success' : 'error'}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{student.id}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center"><Navigation size={11} className="mr-1" />{student.route}</span>
                          <span className="flex items-center"><MapPin size={11} className="mr-1" />{student.stop}</span>
                          <span className="flex items-center"><Phone size={11} className="mr-1" />{student.phone}</span>
                        </div>
                      </div>
                    </div>
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
                    <p className="text-2xl font-bold text-green-600">789</p>
                    <p className="text-xs text-gray-600 mt-1">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">67</p>
                    <p className="text-xs text-gray-600 mt-1">Absent</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">92%</p>
                    <p className="text-xs text-gray-600 mt-1">Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {attendanceRecords.map((record, i) => (
                <Card key={i} sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800 text-sm">{record.date}</p>
                      <span className={`text-sm font-bold ${record.rate >= 93 ? 'text-green-600' : 'text-orange-600'}`}>{record.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${record.rate}%` }} />
                    </div>
                    <div className="flex space-x-3 text-xs text-gray-600">
                      <span className="text-green-600 font-medium">✓ {record.present} Present</span>
                      <span className="text-red-600 font-medium">✗ {record.absent} Absent</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl p-5 text-white">
              <h2 className="text-xl font-bold mb-1">Transport Coordinator</h2>
              <p className="text-orange-200 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setCurrentView('fleet')} className="bg-blue-600 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform">
                <Bus size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Fleet</p>
              </button>
              <button onClick={() => setCurrentView('students')} className="bg-green-600 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform">
                <Users size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Students</p>
              </button>
              <button onClick={() => setCurrentView('attendance')} className="bg-orange-500 text-white p-4 rounded-2xl shadow active:scale-95 transition-transform">
                <Calendar size={24} className="mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Attendance</p>
              </button>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Active Alerts</h3>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start space-x-3 p-3 rounded-xl ${
                          alert.severity === 'high' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                        }`}
                      >
                        <AlertCircle className={alert.severity === 'high' ? 'text-red-500 mt-0.5' : 'text-orange-500 mt-0.5'} size={18} />
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Routes */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Active Routes</h3>
                  <button onClick={() => setCurrentView('fleet')} className="text-blue-600 text-xs font-medium">View Fleet</button>
                </div>
                <div className="space-y-3">
                  {routes.map((route, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Bus className="text-blue-600" size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{route.routeNumber} - {route.routeName}</p>
                            <p className="text-xs text-gray-500">{route.busNumber}</p>
                          </div>
                        </div>
                        <Chip label={route.status} color={getStatusColor(route.status)} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span className="flex items-center"><Users size={11} className="mr-1" />{route.driver}</span>
                        <span className="flex items-center"><Users size={11} className="mr-1" />{route.students}/{route.capacity}</span>
                        <span className="flex items-center"><MapPin size={11} className="mr-1" />{route.currentLocation}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(route.students / route.capacity) * 100}%` }} />
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
