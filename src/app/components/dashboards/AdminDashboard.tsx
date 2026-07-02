import { Card, CardContent } from '@mui/material';
import {
  Users,
  Building2,
  Bus,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';
import { useEffect, useState } from "react";
import { getDashboardSummary,
  getActivities
 } from "../../../api/adminDashboardService";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    hostelStudents: 0,
    transportStudents: 0
});
const [activities, setActivities] = useState<any[]>([]);
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

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Admin Dashboard">
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-blue-100 text-sm">Here's your institution overview</p>
        </div>

        {/* Student Stats Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Total Students */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-gray-800">{summary.totalStudents}</p>
                </div>
                <div className="bg-blue-500 text-white p-4 rounded-2xl">
                  <Users size={32} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hostel Students */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Hostel Students</p>
                  <p className="text-3xl font-bold text-gray-800">{summary.hostelStudents}</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-2xl">
                  <Building2 size={32} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Students */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Transport Students</p>
                  <p className="text-3xl font-bold text-gray-800">{summary.transportStudents}</p>
                </div>
                <div className="bg-orange-500 text-white p-4 rounded-2xl">
                  <Bus size={32} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
    </DashboardLayout>
  );
}
