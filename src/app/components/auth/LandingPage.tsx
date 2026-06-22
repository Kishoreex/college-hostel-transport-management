import { Card, CardContent, Divider } from '@mui/material';
import { Building2, Bus, Users } from 'lucide-react';
import type { ServiceType } from '../../types';

interface LandingPageProps {
  onSelectService: (service: ServiceType) => void;
  onStaffLogin: () => void;
}

export default function LandingPage({ onSelectService, onStaffLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
              <span className="text-xl font-bold tracking-wide">Madha Group of Institutions</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Campus Hostel & Transport Management System
          </h1>
          <p className="text-lg text-gray-500 mt-2">Select a service to continue</p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Hostel Management */}
          <Card
            className="cursor-pointer group"
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
              borderRadius: 3,
              overflow: 'hidden',
            }}
            onClick={() => onSelectService('hostel')}
          >
            <div className="h-2 bg-blue-500" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="bg-blue-50 text-blue-600 p-6 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-16 h-16" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Hostel Management</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Access hostel services, apply for outpass, manage leaves, and view hostel details
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full text-xs text-gray-500 mt-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">Outpass</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">Leave</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">QR Pass</div>
                  </div>
                </div>
                <button className="mt-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-base font-semibold shadow">
                  Student Login →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Transport Management */}
          <Card
            className="cursor-pointer group"
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
              borderRadius: 3,
              overflow: 'hidden',
            }}
            onClick={() => onSelectService('transport')}
          >
            <div className="h-2 bg-green-500" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl group-hover:bg-green-100 transition-colors">
                  <Bus className="w-16 h-16" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Transport Management</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Access bus services, view routes, check attendance, and manage transport details
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full text-xs text-gray-500 mt-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">Routes</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">Attendance</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-gray-700">Bus Info</div>
                  </div>
                </div>
                <button className="mt-2 w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-base font-semibold shadow">
                  Student Login →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Login */}
        <div className="text-center">
          <Divider sx={{ mb: 3 }}>
            <span className="text-gray-400 text-sm px-3">OR</span>
          </Divider>
          <button
            onClick={onStaffLogin}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors py-2 px-6 rounded-lg border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 shadow-sm"
          >
            <Users size={18} />
            <span className="font-medium">Staff / Admin Login</span>
          </button>
          <p className="text-xs text-gray-400 mt-2">For Wardens, Transport Coordinators, Security & Admins</p>
        </div>
      </div>
    </div>
  );
}
