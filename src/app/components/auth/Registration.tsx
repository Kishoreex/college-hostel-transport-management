import {
  registerStudent,
  submitTransportRegistration
} from "../../../api/registrationService";
import { useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import type { ServiceType } from '../../types';

interface RegistrationProps {
  serviceType: ServiceType;
  onBack: () => void;
  onSuccess: () => void;
}

const colleges = [
  { value: 'dental', label: 'Madha Dental College & Hospital' },
  { value: 'nursing', label: 'Madha College of Nursing' },
  { value: 'physiotherapy', label: 'Madha College of Physiotherapy' },
];

const departmentsByCollege: Record<string, string[]> = {
  dental: ['BDS', 'MDS - Orthodontics', 'MDS - Periodontics', 'MDS - Prosthodontics', 'MDS - Oral Surgery'],
  nursing: ['B.Sc Nursing', 'M.Sc Nursing', 'Post Basic B.Sc Nursing'],
  physiotherapy: ['BPT', 'MPT - Orthopedics', 'MPT - Neurology', 'MPT - Sports'],
};

const years = ['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Internship'];

const batches = [
  '2020-2024',
  '2021-2025',
  '2022-2026',
  '2023-2027',
  '2024-2028',
  '2025-2029',
  '2026-2030',
];

const busRoutes = [
  { id: 'R1', name: 'Route 1 - Anna Nagar', bus: 'TN-01-AB-1234', driver: 'Mr. Kumar', stops: ['Anna Nagar', 'Kilpauk', 'Shenoy Nagar'] },
  { id: 'R2', name: 'Route 2 - Tambaram', bus: 'TN-01-CD-5678', driver: 'Mr. Ravi', stops: ['Tambaram', 'Chromepet', 'Pallavaram'] },
  { id: 'R3', name: 'Route 3 - Velachery', bus: 'TN-01-EF-9012', driver: 'Mr. Siva', stops: ['Velachery', 'Adyar', 'Guindy'] },
  { id: 'R4', name: 'Route 4 - OMR', bus: 'TN-01-GH-3456', driver: 'Mr. Raja', stops: ['Sholinganallur', 'Perungudi', 'Thoraipakkam'] },
  { id: 'R5', name: 'Route 5 - GST Road', bus: 'TN-01-IJ-7890', driver: 'Mr. Balu', stops: ['St. Thomas Mount', 'Meenambakkam', 'Nanganallur'] },
];

export default function Registration({ serviceType, onBack, onSuccess }: RegistrationProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    college: '',
    department: '',
    year: '',
    batch: '',
    fullName: '',
    studentId: '',
    gender: "",
    email: '',
    mobile: '',
    parentName: '',
    parentMobile: '',
    address: '',
    busRoute: '',
    busStop: '',
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<typeof busRoutes[0] | null>(null);

  const handleCollegeChange = (college: string) => {
    setFormData({ ...formData, college, department: '' });
    setDepartments(departmentsByCollege[college] || []);
  };

  const handleRouteChange = (routeId: string) => {
    const route = busRoutes.find((r) => r.id === routeId);
    setSelectedRoute(route || null);
    setFormData({ ...formData, busRoute: routeId, busStop: '' });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBackStep = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {

  const payload = {
  registrationType: serviceType,

  collegeName:
    colleges.find(c => c.value === formData.college)?.label || "",

  department: formData.department,
  year: formData.year,
  batch: formData.batch,

  studentName: formData.fullName,
  registerNumber: formData.studentId,

  gender: formData.gender,

  email: formData.email,
  phone: formData.mobile,

  parentName: formData.parentName,
  parentPhone: formData.parentMobile,
  address: formData.address,

  busRoute: formData.busRoute,
  busStop: formData.busStop
};

  let result;

if (serviceType === "transport") {
  result = await submitTransportRegistration(payload);
} else {
  result = await registerStudent(payload);  
}

alert(
  "Registration Successful\nToken Number: " +
  result.tokenNumber
);
  onSuccess();
};

  const steps = serviceType === 'transport'
    ? ['College', 'Student Info', 'Parent Info', 'Transport']
    : ['College', 'Student Info', 'Parent Info'];

  const isStepValid = () => {
    if (activeStep === 0) return formData.college && formData.department && formData.year && formData.batch;
    if (activeStep === 1)
return formData.fullName &&
       formData.studentId &&
       formData.gender &&
       formData.email &&
       formData.mobile;
    if (activeStep === 2) return formData.parentName && formData.parentMobile && formData.address;
    if (activeStep === 3 && serviceType === 'transport') return formData.busRoute && formData.busStop;
    return true;
  };

  const color = serviceType === 'hostel' ? 'blue' : 'green';
  const bgGradient = serviceType === 'hostel' ? 'from-blue-500 to-blue-700' : 'from-green-500 to-green-700';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm py-4 px-4">
        <button onClick={onBack} className="flex items-center text-white">
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Login</span>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 relative">
                <div className={`h-2 rounded-full ${index <= activeStep ? 'bg-white' : 'bg-white/30'}`} />
                {index < steps.length - 1 && (
                  <div className={`absolute top-0 left-full w-full h-2 ${index < activeStep ? 'bg-white' : 'bg-white/30'}`} style={{ marginLeft: '2px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-white text-xs mt-2">
            {steps.map((step, index) => (
              <span key={index} className={index === activeStep ? 'font-bold' : 'opacity-70'}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-white text-2xl font-bold mb-1">
              {serviceType === 'hostel' ? 'Hostel' : 'Transport'} Registration
            </h2>
            <p className="text-white/80 text-sm">Step {activeStep + 1} of {steps.length}</p>
          </div>

          <div className="space-y-4">
            {/* Step 0: College Info */}
            {activeStep === 0 && (
              <>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                  <select
                    value={formData.college}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select College</option>
                    {colleges.map((college) => (
                      <option key={college.value} value={college.value}>{college.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={!formData.college}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {!formData.college && <p className="text-white/80 text-xs mt-2">Please select a college first</p>}
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Step 1: Student Info */}
            {activeStep === 1 && (
              <>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., MDC2024001"
                    required
                  />
                </div>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Gender
  </label>

  <select
    value={formData.gender}
    onChange={(e) =>
      setFormData({
        ...formData,
        gender: e.target.value
      })
    }
    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 2: Parent Info */}
            {activeStep === 2 && (
              <>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Parent's full name"
                    required
                  />
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number</label>
                  <input
                    type="tel"
                    value={formData.parentMobile}
                    onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                    placeholder="Complete residential address"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 3: Transport Details */}
            {activeStep === 3 && serviceType === 'transport' && (
              <>
                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Bus Route</label>
                  <select
                    value={formData.busRoute}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select Route</option>
                    {busRoutes.map((route) => (
                      <option key={route.id} value={route.id}>{route.name}</option>
                    ))}
                  </select>
                </div>

                {selectedRoute && (
                  <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-300">
                    <p className="text-sm font-bold text-green-900 mb-2">Bus Details</p>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><span className="font-medium">Bus Number:</span> {selectedRoute.bus}</p>
                      <p><span className="font-medium">Driver:</span> {selectedRoute.driver}</p>
                      <p><span className="font-medium">Stops:</span> {selectedRoute.stops.join(' → ')}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Pickup Stop</label>
                  <select
                    value={formData.busStop}
                    onChange={(e) => setFormData({ ...formData, busStop: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    disabled={!selectedRoute}
                    required
                  >
                    <option value="">Select Stop</option>
                    {(selectedRoute?.stops || []).map((stop) => (
                      <option key={stop} value={stop}>{stop}</option>
                    ))}
                  </select>
                  {!selectedRoute && <p className="text-white/80 text-xs mt-2">Please select a route first</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-6 bg-white/10 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex gap-3">
          {activeStep > 0 && (
            <button
              onClick={handleBackStep}
              className="flex-1 bg-white/20 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              Back
            </button>
          )}

          {activeStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className={`flex-1 bg-white text-${color}-600 font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 ${!isStepValid() ? 'opacity-50' : ''}`}
            >
              <CheckCircle size={20} />
              Request Login ID
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex-1 bg-white text-${color}-600 font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 ${!isStepValid() ? 'opacity-50' : ''}`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
