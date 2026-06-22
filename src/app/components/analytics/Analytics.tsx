import { Card, CardContent, Grid } from '@mui/material';
import {
  TrendingUp,
  Users,
  Building2,
  Bus,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';

interface AnalyticsProps {
  user: User;
  onLogout: () => void;
}

export default function Analytics({ user, onLogout }: AnalyticsProps) {
  const monthlyData = [
    { month: 'Jan', hostel: 1850, transport: 820, revenue: 985000 },
    { month: 'Feb', hostel: 1875, transport: 835, revenue: 1020000 },
    { month: 'Mar', hostel: 1892, transport: 845, revenue: 1055000 },
    { month: 'Apr', hostel: 1920, transport: 856, revenue: 1098000 },
    { month: 'May', hostel: 1905, transport: 850, revenue: 1087000 },
    { month: 'Jun', hostel: 1892, transport: 856, revenue: 1095000 },
  ];

  const attendanceData = [
    { date: 'Jun 1', hostel: 94, transport: 88 },
    { date: 'Jun 2', hostel: 93, transport: 90 },
    { date: 'Jun 3', hostel: 96, transport: 85 },
    { date: 'Jun 4', hostel: 94, transport: 89 },
    { date: 'Jun 5', hostel: 95, transport: 91 },
  ];

  const hostelDistribution = [
    { name: 'A Block', value: 352, color: '#2563eb' },
    { name: 'B Block', value: 380, color: '#10b981' },
    { name: 'C Block', value: 290, color: '#f59e0b' },
    { name: 'D Block', value: 350, color: '#8b5cf6' },
    { name: 'Girls Hostel', value: 552, color: '#ec4899' },
  ];

  const outpassTrends = [
    { category: 'Medical', count: 450 },
    { category: 'Family', count: 680 },
    { category: 'Personal', count: 520 },
    { category: 'Shopping', count: 340 },
    { category: 'Emergency', count: 120 },
    { category: 'Others', count: 348 },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: '₹1.09Cr',
      change: '+8.2%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Avg Occupancy',
      value: '91.5%',
      change: '+2.1%',
      trend: 'up',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Transport Usage',
      value: '84%',
      change: '+1.5%',
      trend: 'up',
      icon: <Bus className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Avg Attendance',
      value: '93.8%',
      change: '+0.8%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Analytics & Reports">
      <div className="space-y-6">
        {/* KPI Cards */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.color} text-white p-3 rounded-lg`}>
                      {stat.icon}
                    </div>
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                      <TrendingUp size={14} className="mr-1" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Monthly Trends */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">6-Month Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData} id="monthly-trends-chart">
                <CartesianGrid strokeDasharray="3 3" key="grid" />
                <XAxis dataKey="month" key="xaxis" />
                <YAxis yAxisId="left" key="yaxis-left" />
                <YAxis yAxisId="right" orientation="right" key="yaxis-right" />
                <Tooltip key="tooltip" />
                <Legend key="legend" />
                <Area
                  key="hostel-area"
                  yAxisId="left"
                  type="monotone"
                  dataKey="hostel"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#2563eb"
                  name="Hostel Students"
                />
                <Area
                  key="transport-area"
                  yAxisId="left"
                  type="monotone"
                  dataKey="transport"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Transport Students"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Attendance Trends */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Daily Attendance Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData} id="analytics-attendance-chart">
                    <CartesianGrid strokeDasharray="3 3" key="grid" />
                    <XAxis dataKey="date" key="xaxis" />
                    <YAxis key="yaxis" />
                    <Tooltip key="tooltip" />
                    <Legend key="legend" />
                    <Line
                      key="hostel-line"
                      type="monotone"
                      dataKey="hostel"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Hostel %"
                    />
                    <Line
                      key="transport-line"
                      type="monotone"
                      dataKey="transport"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Transport %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Hostel Distribution */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Hostel Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart id="hostel-distribution-chart">
                    <Pie
                      key="hostel-pie"
                      data={hostelDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {hostelDistribution.map((entry, index) => (
                        <Cell key={`hostel-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip key="tooltip" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Outpass Categories */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Outpass Requests by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={outpassTrends} id="outpass-trends-chart">
                    <CartesianGrid strokeDasharray="3 3" key="grid" />
                    <XAxis dataKey="category" key="xaxis" />
                    <YAxis key="yaxis" />
                    <Tooltip key="tooltip" />
                    <Legend key="legend" />
                    <Bar key="count-bar" dataKey="count" fill="#2563eb" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Cards */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Hostel Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Capacity</span>
                    <span className="font-bold text-blue-600">2,500 beds</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Occupied</span>
                    <span className="font-bold text-green-600">2,287 beds</span>
                  </div>
                  <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Vacant</span>
                    <span className="font-bold text-orange-600">213 beds</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Monthly Revenue</span>
                    <span className="font-bold text-purple-600">₹1.09Cr</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Buses</span>
                    <span className="font-bold text-blue-600">24 buses</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Active Routes</span>
                    <span className="font-bold text-green-600">24 routes</span>
                  </div>
                  <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Students Using</span>
                    <span className="font-bold text-orange-600">856 students</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Avg Daily Attendance</span>
                    <span className="font-bold text-purple-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </DashboardLayout>
  );
}
