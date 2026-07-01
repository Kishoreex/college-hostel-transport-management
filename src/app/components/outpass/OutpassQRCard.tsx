  import { Dialog, DialogTitle, DialogContent, Avatar, Divider } from '@mui/material';
  import {
    X,
    Building2,
    MapPin,
    Calendar,
    Clock,
    FileText
  } from "lucide-react";
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

validFrom: outpass.validFrom,

validTo: outpass.validTo,

status: outpass.status,

state: outpass.outpassState

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
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold mb-3">
                Madha Group of Institutions
              </div>
              <h3 className="text-lg font-bold text-gray-800">Hostel Outpass</h3>
            </div>
            <div className="mb-4 bg-green-50 border border-green-300 rounded-xl p-4 text-center">
    <p className="font-semibold text-green-800">
      ✓ Approved by Warden
    </p>

    <p className="text-sm text-green-600">
Status : {outpass.outpassState}
</p>
  </div>
    

            {/* Student Info */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-col items-center mb-4">
              <Avatar
    src={
      student.profilePhoto
        ? `https://202.61.121.102:8443${student.profilePhoto}`
        : student.avatar
    }
    alt={student.name}
    sx={{
    width: 110,
    height: 110,
    border: "4px solid #2563eb"
  }}
  />
              
        <div className="text-center mt-3">

  <p className="text-2xl font-bold text-gray-900">
  {student.name}
  </p>

  <p className="text-gray-600">
  ID : {student.studentId}
  </p>

  </div>
              </div>

              <Divider sx={{ my: 2 }} />

              {/* Outpass Details */}
              <div className="space-y-2.5">
            
                <div className="flex items-start space-x-3">

  <FileText
  size={18}
  className="text-blue-600 mt-0.5"
  />

  <div className="flex-1">

  <p className="text-xs text-gray-500">
  Reason
  </p>

  <p className="text-sm font-medium text-gray-800">
  {outpass.reason}
  </p>

  </div>

  </div>
            

                {outpass.destination && (

<div className="flex items-start space-x-3">

<MapPin size={18} className="text-blue-600 mt-0.5" />

<div className="flex-1">

<p className="text-xs text-gray-500">

Destination

</p>

<p className="text-sm font-medium text-gray-800">

{outpass.destination}

</p>

</div>

</div>

)}
  <div className="flex items-start space-x-3">
    <Building2
      size={18}
      className="text-blue-600 mt-0.5"
    />

    <div>
      <p className="text-xs text-gray-500">
        College
      </p>

      <p className="text-sm font-medium">
        {student.college}
      </p>

      <p className="text-sm">
        {student.department}
      </p>

      <p className="text-sm">
        {student.year}
      </p>
    </div>
  </div>
                <div className="flex items-start space-x-3">
                  <Calendar size={18} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                   <p className="text-xs text-gray-500">
Validity
</p>

<p className="text-sm font-medium text-gray-800">
{new Date(outpass.validFrom).toLocaleDateString()}

{"  →  "}

{new Date(outpass.validTo).toLocaleDateString()}
</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">

<div className="flex items-start space-x-3">

<Clock size={18} className="text-blue-600 mt-0.5"/>

<div>

<p className="text-xs text-gray-500">

Exit Time

</p>

<p className="text-sm font-medium">

{outpass.actualExitTime
? new Date(outpass.actualExitTime).toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
hour12:true
})
: "Not Exited"}

</p>

</div>

</div>

<div className="flex items-start space-x-3">

<Clock size={18} className="text-green-600 mt-0.5"/>

<div>

<p className="text-xs text-gray-500">

Return Time

</p>

<p className="text-sm font-medium">

{outpass.actualReturnTime
? new Date(outpass.actualReturnTime).toLocaleString([],{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"numeric",
minute:"2-digit",
hour12:true
})
: "Not Returned"}

</p>

</div>

</div>

</div>
              </div>
              
            </div>
{outpass.lateMinutes > 0 && (

<div className="mt-3">

<p className="text-red-600 font-semibold">

Late : {outpass.lateMinutes} minutes

</p>

</div>

)}
<div className="mt-2">

<p className="text-sm">

<b>State :</b>

{" "}

{outpass.outpassState}

</p>

</div>
            {/* QR Code */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="bg-gray-50 border-4 border-blue-500 rounded-lg p-4 mb-3">
                  <div className="w-48 h-48 bg-white flex items-center justify-center">
                  <div className="text-center">
    <QRCode
      value={qrCodeData}
      size={170}
    />
    <p className="text-xs text-gray-500 mt-2">
      QR Code
    </p>
  </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center mb-1">Show the outpass at security gate</p>
                <p className="text-xs font-mono text-gray-400">OutPass ID ={outpass.id}</p>
              </div>
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
