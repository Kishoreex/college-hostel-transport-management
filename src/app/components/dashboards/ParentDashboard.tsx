import { Card, CardContent, Chip, Grid } from '@mui/material';
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
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User as UserType } from '../../types';

interface ParentDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function ParentDashboard({ user, onLogout }: ParentDashboardProps) {
  const studentData = {
    name: 'Rahul Kumar',
    studentId: 'CS2021001',
    department: 'Computer Science',
    year: '3rd Year',
    hostel: 'A Block, Room A-301',
    busRoute: 'Route 5 - City Center',
    phone: '+91 98765 43210',
  };

  const stats = [
    {
      label: 'Hostel Attendance',
      value: '94%',
      subtitle: 'This Month',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Transport Attendance',
      value: '92%',
      subtitle: 'This Month',
      icon: <Bus className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Active Outpasses',
      value: '1',
      subtitle: 'Currently active',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
    {
      label: 'Pending Approvals',
      value: '2',
      subtitle: 'Requires attention',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const recentOutpasses = [
    {
      id: 'OP001',
      date: '2026-06-05',
      reason: 'Medical Appointment',
      status: 'approved',
      timeOut: '2:00 PM',
      expectedReturn: '6:00 PM',
    },
    {
      id: 'OP002',
      date: '2026-06-03',
      reason: 'Shopping',
      status: 'pending',
      timeOut: '4:00 PM',
      expectedReturn: '7:00 PM',
      requiresApproval: true,
    },
  ];

  const attendanceHistory = [
    { date: '2026-06-05', hostel: 'Present', transport: 'Present' },
    { date: '2026-06-04', hostel: 'Present', transport: 'Present' },
    { date: '2026-06-03', hostel: 'Present', transport: 'Absent' },
    { date: '2026-06-02', hostel: 'Present', transport: 'Present' },
    { date: '2026-06-01', hostel: 'Present', transport: 'Present' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Parent Portal">
      <div className="space-y-6">
        {/* Student Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{studentData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-medium">{studentData.studentId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{studentData.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{studentData.year}</span>
                  </div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 size={16} className="text-gray-500" />
                    <span className="text-gray-600">Hostel:</span>
                    <span className="font-medium">{studentData.hostel}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bus size={16} className="text-gray-500" />
                    <span className="text-gray-600">Bus Route:</span>
                    <span className="font-medium">{studentData.busRoute}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{studentData.phone}</span>
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent className="p-4">
                  <div className={`${stat.color} text-white p-3 rounded-lg mb-3 w-fit`}>
                    {stat.icon}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Outpasses */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Outpass Requests</h3>
            <div className="space-y-3">
              {recentOutpasses.map((outpass) => (
                <div
                  key={outpass.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-800">{outpass.reason}</span>
                      <Chip
                        label={outpass.status}
                        color={getStatusColor(outpass.status)}
                        size="small"
                      />
                      {outpass.requiresApproval && (
                        <Chip
                          label="Requires Approval"
                          color="warning"
                          size="small"
                          icon={<AlertCircle size={14} />}
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{outpass.date}</span>
                      <span>{outpass.timeOut} - {outpass.expectedReturn}</span>
                    </div>
                  </div>
                  {outpass.requiresApproval && (
                    <div className="space-x-2">
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Hostel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Transport</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{record.date}</td>
                      <td className="py-3 px-4">
                        {record.hostel === 'Present' ? (
                          <Chip label="Present" color="success" size="small" />
                        ) : (
                          <Chip label="Absent" color="error" size="small" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.transport === 'Present' ? (
                          <Chip label="Present" color="success" size="small" />
                        ) : (
                          <Chip label="Absent" color="error" size="small" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
