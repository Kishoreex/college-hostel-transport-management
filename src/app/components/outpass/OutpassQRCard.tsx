import { Dialog, DialogTitle, DialogContent, Avatar, Divider } from '@mui/material';
import { X, Building2, MapPin, Calendar, Clock } from 'lucide-react';
import QRCode from "react-qr-code";
import type { OutpassRequest, User } from '../../types';

interface OutpassQRCardProps {
  open: boolean;
  onClose: () => void;
  outpass: OutpassRequest;
  student: User;
}


export default function OutpassQRCard({ open, onClose, outpass, student }: OutpassQRCardProps) {
 const qrCodeData = JSON.stringify({
  outpassId: outpass.id,
  studentId: student.studentId,
  studentName: student.name,
  destination: outpass.destination,
  timeOut: outpass.timeOut,
  returnTime: outpass.returnTime,
  status: outpass.status
});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between pb-2">
        <span className="text-xl font-bold text-gray-800">Digital Outpass</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </DialogTitle>

      <DialogContent>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold mb-3">
              Madha Group of Institutions
            </div>
            <h3 className="text-lg font-bold text-gray-800">Hostel Outpass</h3>
          </div>

          {/* Student Info */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar
                src={student.avatar}
                alt={student.name}
                sx={{ width: 70, height: 70 }}
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{student.name}</p>
                <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                <p className="text-sm text-gray-600">{student.department}</p>
              </div>
            </div>

            <Divider sx={{ my: 2 }} />

            {/* Outpass Details */}
            <div className="space-y-2.5">
              <div className="flex items-start space-x-3">
              
             
              </div>

              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm font-medium text-gray-800">{outpass.destination}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar size={18} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(outpass.validFrom).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start space-x-3">
                  <Clock size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Time Out</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(`2000-01-01T${outpass.timeOut}`)
  .toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock size={18} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Return Time</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(`2000-01-01T${outpass.returnTime}`)
.toLocaleTimeString([], {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="bg-gray-50 border-4 border-blue-500 rounded-lg p-4 mb-3">
                <div className="w-48 h-48 bg-white flex items-center justify-center">
                 <div className="text-center">
  <QRCode
    value={qrCodeData}
    size={160}
  />
  <p className="text-xs text-gray-500 mt-2">
    QR Code
  </p>
</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center mb-1">Scan this code at security gate</p>
              <p className="text-xs font-mono text-gray-400">{outpass.id}</p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-green-800">
              ✓ Approved by Warden
            </p>
            <p className="text-xs text-green-700 mt-1">Status: Active</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-900 mb-1">Important Instructions:</p>
          <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
            <li>Show this pass to security while leaving</li>
            <li>Return before the specified time</li>
            <li>Carry your college ID card</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
