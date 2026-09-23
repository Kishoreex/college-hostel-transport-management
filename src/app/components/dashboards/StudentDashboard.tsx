import {
  createOutpass,
  getStudentOutpasses,
  markExit,
  markReturn,
  expireOldOutpasses,
  cancelOutpass
} from "../../services/outpassService";
import {
  startBackgroundLocation,
  stopBackgroundLocation,
  addBackgroundLocationListener
} from "../../services/backgroundLocationService";
import * as signalR from "@microsoft/signalr";
import API_URL from "../../../api/api";
const HUB_URL = API_URL.replace("/api", "");
import {
  getStudentTransport,
  submitTransportCancellation,
  getTransportCancellation,
  acknowledgeTransportRejectNotification
} from "../../../api/transportService";
import {
  getStudentProfile,
  uploadStudentProfilePhoto
} from "../../../api/studentService";
import {
  createVacatingRequest,
  getStudentVacatingRequest,
  acknowledgeVacatingReject
} from "../../../api/vacatingService";
import {
  createLeaveRequest,
  getLeaveRequests,
  cancelLeave
} from "../../../api/leaveService";
import {
  changePassword
} from "../../../api/authService";
import { useState, useRef, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface OutpassLocationPlugin {
  openAppSettings(): Promise<void>;
}

const OutpassLocation =
  registerPlugin<OutpassLocationPlugin>('OutpassLocation');
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Dialog,
} from "@mui/material";
import {
  Building2,
  Bus,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  User as UserIcon,
  X,
  History,
  Bell,
  Navigation,
  LogOut,
  AlertTriangle,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import DashboardLayout from '../common/DashboardLayout';
import OutpassQRCard from '../outpass/OutpassQRCard';
import type { User, OutpassRequest } from '../../types';
import type { MenuItemType } from '../common/DashboardLayout';
import {
  HOSTEL_LOCATION,
  HOSTEL_RADIUS
} from "../../../config/hostelLocation";

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}
const HOSTEL_LAT = HOSTEL_LOCATION.latitude;
const HOSTEL_LNG = HOSTEL_LOCATION.longitude;
const GEOFENCE_RADIUS = HOSTEL_RADIUS;

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};
type StudentView = 'dashboard' | 'outpass' | 'leave' | 'history' | 'route' | 'announcements' | 'vacate' | 'cancel';

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
// =========================================================
// MANDATORY LOCATION PERMISSION
// =========================================================

const [locationAllowed, setLocationAllowed] = useState(false);
const [checkingLocation, setCheckingLocation] = useState(true);

const checkLocationPermission = async () => {
  try {
    setCheckingLocation(true);

    const permission = await Geolocation.checkPermissions();

    console.log(
      "📍 Current location permission:",
      permission.location
    );

    // =====================================================
    // LOCATION ALREADY GRANTED
    // =====================================================

    if (permission.location === "granted") {

      try {

        await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        console.log("✅ Location is working");

        setLocationAllowed(true);
        return;

      } catch (gpsError) {

        console.error(
          "❌ GPS is not available:",
          gpsError
        );

        setLocationAllowed(false);
        return;
      }
    }

    // =====================================================
    // PERMISSION NOT GRANTED
    // =====================================================

    setLocationAllowed(false);

  } catch (error) {

    console.error(
      "❌ Location permission check failed:",
      error
    );

    setLocationAllowed(false);

  } finally {

    setCheckingLocation(false);
  }
};

const handleEnableLocation = async () => {
  try {
    setCheckingLocation(true);

    console.log("📍 Enable Location clicked");

    // =========================================================
    // ANDROID / CAPACITOR APP
    // =========================================================

    if (Capacitor.isNativePlatform()) {

      console.log("📱 Native Android detected");

      const requested =
        await Geolocation.requestPermissions();

      console.log(
        "📍 Android permission result:",
        requested.location
      );

      // -------------------------------------------------------
      // LOCATION GRANTED
      // -------------------------------------------------------

      if (requested.location === "granted") {

        try {

          await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });

          console.log(
            "✅ Android location granted and GPS working"
          );

          setLocationAllowed(true);

          return;

        } catch (gpsError) {

          console.error(
            "❌ Android GPS is not available:",
            gpsError
          );

          setLocationAllowed(false);

          alert(
            "Please turn ON Location/GPS on your phone and try again."
          );

          return;
        }
      }

      // -------------------------------------------------------
      // USER DENIED LOCATION
      // -------------------------------------------------------

      console.log(
        "⚠️ Android location permission denied"
      );

      setLocationAllowed(false);

      // Open Android App Settings
      await OutpassLocation.openAppSettings();

      return;
    }


    // =========================================================
    // WEB BROWSER
    // =========================================================

    console.log("🌐 Web browser detected");

    if (!navigator.geolocation) {

      alert(
        "Location is not supported by this browser."
      );

      setLocationAllowed(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(

      // -------------------------------------------------------
      // LOCATION GRANTED
      // -------------------------------------------------------

      (position) => {

        console.log(
          "✅ Browser location granted:",
          position.coords.latitude,
          position.coords.longitude
        );

        setLocationAllowed(true);
      },

      // -------------------------------------------------------
      // LOCATION DENIED / ERROR
      // -------------------------------------------------------

      (error) => {

        console.error(
          "❌ Browser location error:",
          error
        );

        setLocationAllowed(false);

        if (error.code === 1) {

          alert(
            "Location permission is blocked for this website. " +
            "Please allow Location permission in your browser settings, " +
            "then click Enable Location again."
          );

        } else if (error.code === 2) {

          alert(
            "Your location could not be detected. " +
            "Please turn ON Location/GPS and try again."
          );

        } else if (error.code === 3) {

          alert(
            "Location request timed out. " +
            "Please try again."
          );

        } else {

          alert(
            "Unable to get your location. Please try again."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

  } catch (error) {

    console.error(
      "❌ Enable Location failed:",
      error
    );

    setLocationAllowed(false);

    // ---------------------------------------------------------
    // ONLY ANDROID CAN OPEN APP SETTINGS
    // ---------------------------------------------------------

    if (Capacitor.isNativePlatform()) {

      try {

        await OutpassLocation.openAppSettings();

      } catch (settingsError) {

        console.error(
          "❌ Could not open Android app settings:",
          settingsError
        );
      }

    } else {

      alert(
        "Please allow Location permission for this website " +
        "from your browser settings."
      );
    }

  } finally {

    setCheckingLocation(false);
  }
};

  useEffect(() => {
    checkLocationPermission();

    // IMPORTANT:
    // When student goes to Android Settings and enables
    // location, then comes back to the app, check again.
    let listener: any;

    const setupAppListener = async () => {
      listener = await App.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            console.log("📱 App became active - checking location again");
            checkLocationPermission();
          }
        }
      );
    };

    setupAppListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);
  const getApprovalLabel = (item: any) => {
  if (item.status?.toLowerCase() !== "pending") {
    return item.status;
  }

  switch (item.approvalStage) {
    case "FirstApproved":
      return `Approved by ${item.firstApprovedBy ?? "First Level"} — Waiting for Second Level`;
    case "SecondApproved":
      return `Approved by ${item.secondApprovedBy ?? "Second Level"} — Waiting for Final Approval`;
    default:
      return "Waiting for First Level Approval";
  }
};
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [outpassDialogOpen, setOutpassDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [qrCardOpen, setQrCardOpen] = useState(false);
  const [selectedOutpass, setSelectedOutpass] = useState<OutpassRequest | null>(null);
  const [vacateDialogOpen, setVacateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [vacateReason, setVacateReason] = useState('');
  const connectionRef =
  useRef<signalR.HubConnection | null>(null);
  const testBackgroundLocation = async () => {
  try {
    await startBackgroundLocation();

    await addBackgroundLocationListener(
      (latitude, longitude) => {

        console.log(
          "🔥 BACKGROUND LOCATION:",
          latitude,
          longitude
        );

      }
    );

    console.log(
      "✅ Background tracking test started"
    );

  } catch (error) {

    console.error(
      "❌ Background tracking test failed:",
      error
    );

  }
};

const stopTestBackgroundLocation = async () => {

  try {

    await stopBackgroundLocation();

    console.log(
      "🛑 Background tracking test stopped"
    );

  } catch (error) {

    console.error(
      "❌ Failed to stop background tracking:",
      error
    );

  }
};
  const [
  vacatingRequest,
  setVacatingRequest
] = useState<any>(null);
const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
useEffect(() => {

if(
vacatingRequest?.status==="Rejected" &&
!vacatingRequest?.studentReadRejected
){
setRejectPopupOpen(true);
}

},[vacatingRequest]);

const handleVacateSubmit = async () => {
  try {
  await createVacatingRequest({
    studentId: user.studentId,
      studentName: user.name,
    reason: vacateReason
  });
await loadVacatingRequest();
  toast.success(
    "Vacating request submitted!"
  );

  setVacateDialogOpen(false);
  setVacateReason("");
}
catch (error: any) {
  toast.error(
    "You already have a pending vacating request."
  );
}
};


  const [outpassForm, setOutpassForm] = useState({
    reason: '',
    destination: '',
    date: '',
    timeOut: '',
    returnTime: '',
  });

const [leaveForm, setLeaveForm] = useState({
    type: "",
    campus: "",
    destination: "",
    fromDate: "",
    toDate: "",
    exitTime: "",
    returnTime: "",
    reason: ""
});

  const isHostel = user.serviceType === 'hostel';
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'history' | 'password'>('info');
  const [changePwdForm, setChangePwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
const hasProfilePhoto = () => {
  return !!(
    profilePhoto ||
    studentProfile?.profilePhoto ||
    user.profilePhoto
  );
};

const requireProfilePhoto = () => {
  if (hasProfilePhoto()) {
    return true;
  }

  toast.error(
    "Profile photo is required. Please upload your profile photo first."
  );

  setProfileDialogOpen(true);
  setProfileTab("info");

  return false;
};
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
const [photoAdjustOpen, setPhotoAdjustOpen] = useState(false);
const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
const [photoZoom, setPhotoZoom] = useState(1);
const [photoX, setPhotoX] = useState(0);
const [photoY, setPhotoY] = useState(0);
const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

const photoCropRef = useRef<HTMLDivElement>(null);

const photoDragStartRef = useRef({
  x: 0,
  y: 0,
  photoX: 0,
  photoY: 0,
});
const [uploadingPhoto, setUploadingPhoto] = useState(false);

const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [transportInfo, setTransportInfo] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

const [cancelRequest, setCancelRequest] =
  useState<any>(null);
  useEffect(() => {
  console.log("cancelRequest =", cancelRequest);
}, [cancelRequest]);
  const [cancelRejectPopupOpen, setCancelRejectPopupOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  
const handlePhotoChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Only allow images
  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image");
    return;
  }

  // Limit size to 10 MB
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Photo must be smaller than 10 MB");
    return;
  }

  const previewUrl = URL.createObjectURL(file);

  setPendingPhoto(file);
  setPendingPhotoUrl(previewUrl);

  // Reset adjustment
  setPhotoZoom(1);
  setPhotoX(0);
  setPhotoY(0);

  // Open adjustment screen
  setPhotoAdjustOpen(true);

  // Reset input so same photo can be selected again
  e.target.value = "";
};

const confirmPhotoUpload = async () => {
  if (!pendingPhoto || !pendingPhotoUrl) return;

  try {
    setUploadingPhoto(true);

    const image = new Image();

    image.src = pendingPhotoUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    const outputSize = 800;

    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas not supported");
    }

    /*
     * Get the actual visible crop size.
     * This lets the uploaded image match
     * exactly what the student positioned.
     */
    const cropSize =
      photoCropRef.current?.getBoundingClientRect().width || 320;

    /*
     * Scale image so it covers the square.
     */
    const scale =
      Math.max(
        outputSize / image.width,
        outputSize / image.height
      ) * photoZoom;

    const width = image.width * scale;
    const height = image.height * scale;

    /*
     * Convert screen drag distance into
     * 800x800 canvas coordinates.
     */
    const positionScale =
      outputSize / cropSize;

    const x =
      (outputSize - width) / 2 +
      photoX * positionScale;

    const y =
      (outputSize - height) / 2 +
      photoY * positionScale;

    /*
     * Draw exactly what the user positioned.
     */
    ctx.drawImage(
      image,
      x,
      y,
      width,
      height
    );

    /*
     * Convert to JPEG.
     */
    const blob = await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.92
        );
      }
    );

    if (!blob) {
      throw new Error(
        "Failed to process image"
      );
    }

    /*
     * Create final upload file.
     */
    const adjustedFile = new File(
      [blob],
      "profile-photo.jpg",
      {
        type: "image/jpeg",
      }
    );

    /*
     * Show final image immediately.
     */
    const finalPreviewUrl =
      URL.createObjectURL(blob);

    setProfilePhoto(finalPreviewUrl);

    /*
     * Upload adjusted image.
     */
    const result =
      await uploadStudentProfilePhoto(
        user.studentId || "",
        adjustedFile
      );

    /*
     * Update profile state.
     */
    setStudentProfile(
      (prev: any) => ({
        ...prev,
        profilePhoto:
          result.profilePhoto,
      })
    );

    /*
     * Close adjustment screen.
     */
    setPhotoAdjustOpen(false);

    setPendingPhoto(null);

    if (pendingPhotoUrl) {
      URL.revokeObjectURL(
        pendingPhotoUrl
      );
    }

    setPendingPhotoUrl(null);

    setPhotoZoom(1);
    setPhotoX(0);
    setPhotoY(0);

    toast.success(
      "Profile photo updated"
    );

  } catch (error) {

    console.error(
      "Profile photo upload error:",
      error
    );

    toast.error(
      "Photo upload failed"
    );

  } finally {

    setUploadingPhoto(false);

  }
};

const cancelPhotoAdjustment = () => {
  setPhotoAdjustOpen(false);

  setPendingPhoto(null);

  if (pendingPhotoUrl) {
    URL.revokeObjectURL(pendingPhotoUrl);
  }

  setPendingPhotoUrl(null);

  setPhotoZoom(1);
  setPhotoX(0);
  setPhotoY(0);
};

const handlePhotoPointerDown = (
  e: React.PointerEvent<HTMLDivElement>
) => {
  e.preventDefault();

  setIsDraggingPhoto(true);

  photoDragStartRef.current = {
    x: e.clientX,
    y: e.clientY,
    photoX,
    photoY,
  };

  e.currentTarget.setPointerCapture(e.pointerId);
};

const handlePhotoPointerMove = (
  e: React.PointerEvent<HTMLDivElement>
) => {
  if (!isDraggingPhoto) return;

  e.preventDefault();

  const start = photoDragStartRef.current;

  const deltaX = e.clientX - start.x;
  const deltaY = e.clientY - start.y;

  const cropSize =
    photoCropRef.current?.getBoundingClientRect().width || 320;

  // Keep movement reasonable
  const maxMove = cropSize * 0.5;

  const newX = Math.max(
    -maxMove,
    Math.min(maxMove, start.photoX + deltaX)
  );

  const newY = Math.max(
    -maxMove,
    Math.min(maxMove, start.photoY + deltaY)
  );

  setPhotoX(newX);
  setPhotoY(newY);
};

const handlePhotoPointerUp = (
  e: React.PointerEvent<HTMLDivElement>
) => {
  setIsDraggingPhoto(false);

  try {
    e.currentTarget.releasePointerCapture(e.pointerId);
  } catch {
    // Ignore pointer release errors
  }
};
const openProfilePhoto = () => {
  const photo =
    profilePhoto ||
    (studentProfile?.profilePhoto
      ? `https://api.madhapharma.in${studentProfile.profilePhoto}`
      : user.avatar);

  if (!photo) {
    toast.error("No profile photo available");
    return;
  }

  setPhotoPreviewOpen(true);
};

const handlePhotoTouchStart = () => {
  longPressTimerRef.current = setTimeout(() => {
    openProfilePhoto();
  }, 600);
};

const handlePhotoTouchEnd = () => {
  if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }
};

const handlePhotoDoubleClick = () => {
  openProfilePhoto();
};
 const loadOutpasses = async () => {
  try {

    // Expire old outpasses first
    await expireOldOutpasses();

    // Then load student outpasses
    const data = await getStudentOutpasses(
      user.studentId || ""
    );

    console.log(data);

    setOutpasses(data);

  } catch (err) {
    console.error(err);
  }
};
const loadLeaveRequests = async () => {

  try {

    const data = await getLeaveRequests();

    setLeaveRequests(
      data.filter(
        (x:any) => x.studentId === user.studentId
      )
    );

  } catch (err) {

    console.log(err);

  }

};
useEffect(() => {

  loadOutpasses();

  loadLeaveRequests();

  const timer = setInterval(() => {

    loadOutpasses();

    loadLeaveRequests();

  },5000);

  return () => clearInterval(timer);

}, []);
useEffect(() => {

    async function loadProfile() {

        try {

            const data =
                await getStudentProfile(
                    user.studentId || ""
                );

            setStudentProfile(data);

        } catch (err) {
            console.log(err);
        }

    }

    loadProfile();

}, []);
useEffect(() => {

    if (isHostel) return;

    async function loadTransport() {

        try {

            const data = await getStudentTransport(
                user.studentId || ""
            );

            setTransportInfo(data);

        }
        catch (err) {

            console.log(err);

        }

    }

    loadTransport();

}, [user.studentId, isHostel]);
const loadVacatingRequest =
  async () => {
    const data =
      await getStudentVacatingRequest(
        user.studentId || ""
      );

    setVacatingRequest(data);
  };

const acknowledgeReject = async () => {

  try {

    await acknowledgeVacatingReject(
      vacatingRequest.id
    );

    setRejectPopupOpen(false);

    await loadVacatingRequest();

  }
  catch {

    toast.error(
      "Failed to acknowledge notification"
    );

  }

};
const acknowledgeTransportReject = async () => {

  try {

    await acknowledgeTransportRejectNotification(
      cancelRequest.id
    );

    setCancelRejectPopupOpen(false);

    await loadTransportCancellation();

  }
  catch {

    toast.error(
      "Failed to acknowledge notification"
    );

  }


  

};
const loadTransportCancellation = async () => {
  try {
    const data = await getTransportCancellation(
      user.studentId || ""
    );

    console.log("Transport Data", data);

    setCancelRequest(data);
  } catch {
    setCancelRequest(null);
  }
};

useEffect(() => {
  loadVacatingRequest();
}, []);
useEffect(() => {

    if (!isHostel) return;

    const connection =
        new signalR.HubConnectionBuilder()
            .withUrl(`${HUB_URL}/notificationHub`)
            .withAutomaticReconnect()
            .build();

    connection.on(
        "VacatingUpdated",
        async (studentId: string) => {

            if (studentId === user.studentId) {

                await loadVacatingRequest();

            }

        }
    );
connection.on(
  "ForceLogout",
  (studentId: string) => {

    if (studentId !== user.studentId) return;

    toast.error(
      "Your account has been deactivated."
    );

    localStorage.clear();

    setTimeout(() => {
      onLogout();
    }, 1500);
  }
);
    connection.start().catch(console.error);

    return () => {

        connection.stop();

    };

}, [user.studentId, isHostel]);
useEffect(() => {

  if (!isHostel) {
    loadTransportCancellation();
  }

}, []);
useEffect(() => {

  if (isHostel) return;

  const connection =
    new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}/notificationHub`)
      .withAutomaticReconnect()
      .build();

  connectionRef.current = connection;

  connection.on(
    "TransportCancellationCreated",
    async () => {

      await loadTransportCancellation();

    }
  );

  connection.on(
    "TransportCancellationUpdated",
    async () => {

      await loadTransportCancellation();

      const data = await getStudentTransport(
        user.studentId || ""
      );

      setTransportInfo(data);

    }
  );
connection.on(
  "ForceLogout",
  (studentId: string) => {

    if (studentId !== user.studentId) return;

    toast.error(
      "Your account has been deactivated."
    );

    localStorage.clear();

    setTimeout(() => {
      onLogout();
    }, 1500);
  }
);
  connection
    .start()
    .catch(console.error);

  return () => {

    connection.stop();

  };

}, [isHostel, user.studentId]);

useEffect(() => {

  if (
    cancelRequest?.status === "Rejected" &&
    !cancelRequest?.studentReadRejected
  ) {

    setCancelRejectPopupOpen(true);

  }

}, [cancelRequest]);
  const [outpasses, setOutpasses] =
useState<any[]>([]);
const [outsideCounter, setOutsideCounter] = useState(0);
const [insideCounter, setInsideCounter] = useState(0);
const [leaveRequests, setLeaveRequests] =
useState<any[]>([]);
const [submittingOutpass, setSubmittingOutpass] = useState(false);
const [submittingLeave, setSubmittingLeave] = useState(false);
const activeOutpass = outpasses.find(x =>

    x.status === "Approved" &&

    (
        x.outpassState === "Active" ||
        x.outpassState === "Waiting For Exit" ||
        x.outpassState === "Outside Hostel"
    )

);

const activeLeave = leaveRequests.some(
  (x: any) =>
    x.status === "Pending" ||
    x.status === "Approved"
);
console.log("ACTIVE OUTPASS =", activeOutpass);
  useEffect(() => {

  if (!activeOutpass) return;

  const timer = setInterval(() => {

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const distance = getDistanceMeters(
          HOSTEL_LAT,
          HOSTEL_LNG,
          position.coords.latitude,
          position.coords.longitude
        );

        console.log("Distance =", distance);
console.log("Radius =", GEOFENCE_RADIUS);
console.log("Latitude =", position.coords.latitude);
console.log("Longitude =", position.coords.longitude);
console.log("Exit Time =", activeOutpass.actualExitTime);
console.log("Return Time =", activeOutpass.actualReturnTime);
if (
  distance > GEOFENCE_RADIUS &&
  !activeOutpass.actualExitTime
) {

  await markExit(
    activeOutpass.id,
    position.coords.latitude,
    position.coords.longitude
  );

  await loadOutpasses();

  

  setInsideCounter(0);
}
      if (
  distance <= GEOFENCE_RADIUS &&
  activeOutpass.actualExitTime &&
  !activeOutpass.actualReturnTime
) {

  setInsideCounter(prev => {

    const count = prev + 1;

    console.log("Inside Count =", count);

    if (count >= 2) {

      markReturn(
        activeOutpass.id,
        position.coords.latitude,
        position.coords.longitude
      ).then(async () => {

        await loadOutpasses();

        

      });

      return 0;
    }

    return count;
  });

  setOutsideCounter(0);

} else if (distance > GEOFENCE_RADIUS) {

  setInsideCounter(0);

}
      },

      (error) => {
        console.log(error);
      }

    );

  }, 5000);

  return () => clearInterval(timer);

}, [activeOutpass]);

const handleOutpassSubmit = async (
  e: React.FormEvent
) => {
 e.preventDefault();

if (!requireProfilePhoto()) {
  return;
}

if (submittingOutpass) return;

setSubmittingOutpass(true);
if (activeOutpass) {
  toast.error("You already have an active outpass.");
  setSubmittingOutpass(false);
  return;
}

let permissionGranted = false;

try {
  await new Promise<GeolocationPosition>((resolve, reject) => {
   navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("GPS SUCCESS", position);
    resolve(position);
  },
  (error) => {
    console.log("GPS ERROR", error);
    alert(
      "Error Code: " +
      error.code +
      "\nMessage: " +
      error.message
    );
    reject(error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);
  });

  permissionGranted = true;
}
catch {

  toast.error(
    "Location permission is required to request an outpass."
  );

  return;
}
  try {
    const data = {
  outpassNumber: `OP${Date.now()}`,
  studentId: user.studentId || "",
  studentName: user.name || "",
  gender: (user as any).gender || "",

  destination: outpassForm.destination,
  reason: outpassForm.reason,
  timeOut: outpassForm.timeOut,
  returnTime: outpassForm.returnTime,

  leaveRequestId: 0,
validFrom: `${outpassForm.date}T${outpassForm.timeOut}:00`,

validTo: `${outpassForm.date}T${outpassForm.returnTime}:00`,

 status: "Pending",

locationPermissionGranted: permissionGranted,

studentPhoto:
  studentProfile?.profilePhoto || ""
};

    console.log("Sending:", data);

    await createOutpass(data);
setSubmittingOutpass(false);
await loadOutpasses();
    toast.success("Outpass submitted");
    setOutpassDialogOpen(false);

    setOutpassForm({
      reason: "",
      destination: "",
      date: "",
      timeOut: "",
      returnTime: ""
    });

  } catch (error) {
    setSubmittingOutpass(false);
    console.error(error);
    toast.error("Failed to submit outpass");
  }
};

const handleLeaveSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();

  if (!requireProfilePhoto()) {
    return;
  }

  if (submittingLeave) return;

setSubmittingLeave(true);
const activeLeave = leaveRequests.find(
  (x: any) =>
    x.status === "Pending" ||
    x.status === "Approved"
);

if (activeLeave) {
  toast.error(
    "You already have an active leave request."
  );
  setSubmittingLeave(false);
  return;
}
  if (!leaveForm.campus) {
    toast.error("Select Campus");
     setSubmittingLeave(false);
    return;
  }

  try {

  await createLeaveRequest({

  studentId: user.studentId,

  studentName: user.name,
CollegeName: user.college,
  leaveType: leaveForm.type,

  campus:
    leaveForm.campus === "incampus"
      ? "In Campus"
      : "Out Campus",

  department: studentProfile?.department,

  gender: studentProfile?.gender,

  year: studentProfile?.year,

  fromDate: leaveForm.fromDate,

  toDate: leaveForm.toDate,

  reason: leaveForm.reason,

destination: leaveForm.destination,

exitTime: leaveForm.exitTime,

returnTime: leaveForm.returnTime
});
setSubmittingLeave(false);

await loadLeaveRequests();
    toast.success(
      "Leave application submitted"
    );

    setLeaveDialogOpen(false);

setLeaveForm({
    type: "",
    campus: "",
    destination: "",
    fromDate: "",
    toDate: "",
    exitTime: "",
    returnTime: "",
    reason: ""
});

  }
 catch (err) {

  setSubmittingLeave(false);

  console.log(err);

  toast.error(
    "Failed to submit leave request"
  );

}

};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    case 'expired': return 'error';
    case 'cancelled': return 'default';
    case 'completed': return 'success';
    default: return 'default';
  }
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return null;
    }
  };

  const hostelMenuItems: MenuItemType[] = [
    { icon: <Building2 size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <History size={22} />, label: 'Request History', active: currentView === 'history', onClick: () => setCurrentView('history') },
    { icon: <UserIcon size={22} />, label: 'My Profile', active: false, onClick: () => { setProfileDialogOpen(true); setProfileTab('info'); } },
   ...(vacatingRequest?.status !== "Pending"
  ? [{
      icon: <LogOut size={22} />,
      label: 'Vacate Hostel',
      active: currentView === 'vacate',
      onClick: () => {
        setCurrentView('dashboard');
        setVacateDialogOpen(true);
      }
    }]
  : []),
  ];

  const transportMenuItems: MenuItemType[] = [
    { icon: <Bus size={22} />, label: 'Dashboard', active: currentView === 'dashboard', onClick: () => setCurrentView('dashboard') },
    { icon: <Navigation size={22} />, label: 'Route Info', active: currentView === 'route', onClick: () => setCurrentView('route') },
    { icon: <Bell size={22} />, label: 'Announcements', active: currentView === 'announcements', onClick: () => setCurrentView('announcements') },
    { icon: <UserIcon size={22} />, label: 'My Profile', active: false, onClick: () => { setProfileDialogOpen(true); setProfileTab('info'); } },
    { icon: <XCircle size={22} />, label: 'Cancel Transport', active: currentView === 'cancel', onClick: () => { setCurrentView('dashboard'); setCancelDialogOpen(true); } },
  ];

  const menuItems = isHostel ? hostelMenuItems : transportMenuItems;

  const viewTitle = {
    dashboard: isHostel ? 'Hostel Dashboard' : 'Transport Dashboard',
    history: 'Request History',
    route: 'Route Info',
    announcements: 'Announcements',
    outpass: 'Request Outpass',
    leave: 'Apply Leave',
  }[currentView];
    

  // =========================================================
  // BLOCK APP UNTIL LOCATION IS ENABLED
  // =========================================================

  if (checkingLocation) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <MapPin size={40} className="text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Checking Location
        </h2>

        <p className="text-gray-500 max-w-sm">
          Please wait while we verify your location permission.
        </p>
      </div>
    );
  }

  if (!locationAllowed) {
    return (
      <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-6 text-center">

        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <MapPin size={48} className="text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Location Required
        </h2>

        <p className="text-gray-600 max-w-sm mb-6 leading-relaxed">
          Location permission is required to use Madha Campus.
          Please enable location access to continue.
        </p>

<button
  onClick={handleEnableLocation}
  className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
>
  Enable Location
</button>

        <p className="text-xs text-gray-400 mt-5 max-w-xs">
          If you previously denied permission, please enable
          Location permission for Madha Campus from Android Settings.
        </p>

      </div>
    );
  }

  return (
    <DashboardLayout
user={{
    ...user,
    profilePhoto:
        profilePhoto ||
        studentProfile?.profilePhoto ||
        user.profilePhoto
}}
onLogout={() => {

if(activeOutpass){

toast.error(
"Return to hostel before logging out."
);

return;
}

onLogout();

}} title={viewTitle} menuItems={menuItems}>
      <div className="space-y-4 max-w-2xl mx-auto">

        {/* History View */}
        {currentView === 'history' && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">
Request History
</h3>
              <div className="space-y-3">
                {[...outpasses]
.filter(x => x.leaveRequestId === 0)
.sort((a,b)=>{

const aActive =
a.outpassState==="Active"||
a.outpassState==="Outside Hostel";

const bActive =
b.outpassState==="Active"||
b.outpassState==="Outside Hostel";

if(aActive && !bActive) return -1;

if(!aActive && bActive) return 1;

return new Date(b.createdAt).getTime()
-
new Date(a.createdAt).getTime();

})
.map((outpass)=>{console.log(outpasses);
                  const isLeaveOutpass =
                       outpass.status?.toLowerCase() === "approved";
                  return (
                  <div key={outpass.id}
    className={`rounded-xl p-3 ${
(
outpass.outpassState==="Active"||
outpass.outpassState==="Outside Hostel"
)
?
"bg-green-50 border border-green-200"
:
"bg-white border border-gray-200"
}`}
>  {isLeaveOutpass && (
                      <div className="flex items-center space-x-1.5 mb-2">
                        <Calendar size={12} className="text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700"></span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm"> Reason: {outpass.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                         <Chip
                            label={getApprovalLabel(outpass)}
                              color={getStatusColor(outpass.status?.toLowerCase())}
                            size="small"
                           icon={getStatusIcon(outpass.status?.toLowerCase())}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          
                          {outpass.status === "Rejected" &&
 outpass.rejectReason && (
  <p className="text-xs text-red-600 mt-2">
    Reject Reason: {outpass.rejectReason}
  </p>
)}
                        </div>
                      </div>
                    {(
    outpass.status?.toLowerCase() === "approved" &&
    (
        outpass.outpassState === "Active" ||
        outpass.outpassState === "Outside Hostel" ||
        outpass.outpassState === "Waiting For Exit"
    )
) && (
                        <button
                          onClick={() => { setSelectedOutpass(outpass); setQrCardOpen(true); }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium active:scale-95"
                        >
                          Show Pass
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">

  <span className="flex items-center">
    <Calendar size={12} className="mr-1" />
    {new Date(outpass.validFrom).toLocaleDateString()}
  </span>

  <span className="flex items-center">
    <Clock size={12} className="mr-1" />

    {new Date(`2000-01-01T${outpass.timeOut}`)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}

    {" - "}

    {new Date(`2000-01-01T${outpass.returnTime}`)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}
  </span>

  <span className="flex items-center">
    <MapPin size={12} className="mr-1" />
    {outpass.destination}
  </span>







</div>

                  </div>
                  );
                })}
                {outpasses.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">No outpass requests yet</p>
                )}
             
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Info View */}
        {currentView === 'route' && (
          <>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">My Route Details</h3>
                  <Bus size={20} className="text-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">{transportInfo?.routeName ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">{transportInfo?.busNumber ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">{transportInfo?.stopName ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">{transportInfo?.pickupTime ?? "-"}</p></div>
                  <div><p className="text-gray-500 text-xs">Drop Point</p><p className="font-medium">College Gate</p></div>
                  {/*<div><p className="text-gray-500 text-xs">Drop Time</p><p className="font-medium">5:30 PM</p></div>*/}
                </div>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-3">Route Stops</h3>
                <div className="space-y-2">
                  {['Anna Nagar East - 7:30 AM', 'Anna Nagar Tower - 7:35 AM', 'Koyambedu - 7:45 AM', 'Poonamallee - 7:55 AM', 'Madha College - 8:10 AM'].map((stop, i) => (
                    <div key={i} className="flex items-center space-x-3 py-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i === 0 ? 'bg-green-500' : i === 4 ? 'bg-red-500' : 'bg-blue-400'}`} />
                      <p className="text-sm text-gray-700">{stop}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}


        {/* Announcements View */}
      {currentView === "announcements" && (
  <div className="space-y-3">

    {announcements.length === 0 ? (

      <Card sx={{ borderRadius: 3 }}>
        <CardContent className="text-center py-8">

          <Bell
            size={40}
            className="mx-auto text-gray-300 mb-3"
          />

 <p className="text-gray-500">
    No announcements available
</p>

        </CardContent>
      </Card>

    ) : (

      announcements.map((ann: any) => (
        <Card key={ann.id} sx={{ borderRadius: 3 }}>
          <CardContent>

         <p className="font-semibold">
    {ann.title}
</p>
<p className="mt-1 text-gray-600">
    {ann.message}
</p>

           <p className="text-xs text-gray-400 mt-2">
    {ann.createdDate}
</p>

          </CardContent>
        </Card>
      ))

    )}

  </div>
)}

        {/* Default Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            {/* Profile Card */}
            <Card className="overflow-hidden" sx={{ borderRadius: 3 }}>
              <div className={`h-20 ${isHostel ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gradient-to-r from-green-500 to-green-700'}`} />
              <CardContent className="px-4 pb-4 -mt-10">
                <div className="flex items-start space-x-4">
                  <div className="relative">
       <div
  onDoubleClick={handlePhotoDoubleClick}
  onTouchStart={handlePhotoTouchStart}
  onTouchEnd={handlePhotoTouchEnd}
  onTouchCancel={handlePhotoTouchEnd}
  className="cursor-pointer select-none"
>
  <Avatar
    src={
      profilePhoto ||
      (studentProfile?.profilePhoto
        ? `https://api.madhapharma.in${studentProfile.profilePhoto}`
        : user.avatar)
    }
    alt={user.name}
    sx={{
      width: 80,
      height: 80,
      border: "4px solid white"
    }}
  />
</div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white active:scale-90 transition-transform"
                    >
                      <Camera size={12} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex-1 mt-10">
                    <h2 className="text-xl font-bold text-gray-800">{studentProfile?.studentName}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      <span className="flex items-center"><UserIcon size={14} className="mr-1" />{studentProfile?.studentId}</span>
                      <span className="flex items-center"><Building2 size={14} className="mr-1" />{studentProfile?.department}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      <span>{studentProfile?.year}</span>
                      <span>•</span>
                      <span>{studentProfile?.collegeName}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HOSTEL VIEW */}
            {isHostel && (
              
              <>{vacatingRequest?.status === "Pending" && (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <p className="text-orange-600 font-semibold">
        Your vacating request is pending approval.
      </p>
    </CardContent>
  </Card>
)}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={24} className="text-green-500" />
                      <span className="text-2xl font-bold text-gray-800">{
outpasses.filter(x => x.leaveRequestId === 0).length
}</span>
                    </div>
                    <p className="text-xs text-gray-600">Total Outpasses</p>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Hostel Details</h3>
                      <Building2 size={20} className="text-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500 text-xs">Block</p><p className="font-medium">{studentProfile?.block ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Room</p><p className="font-medium">{studentProfile?.roomNumber ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Bed</p><p className="font-medium">{studentProfile?.bedNumber ?? "-"}</p></div>
                     
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
    <button
disabled={
  outpasses.some(
    x =>
      ![
        "Cancelled",
        "Completed",
        "Rejected",
        "Expired",
        "Not Accepted By  Incharge"
      ].includes(x.status)
  )
}
onClick={() => {
  if (!requireProfilePhoto()) return;

  setOutpassDialogOpen(true);
}}
className={`bg-gradient-to-br from-blue-500 to-blue-600
text-white p-4 rounded-2xl shadow-lg
${
outpasses.some(
  x =>
    ![
      "Cancelled",
      "Completed",
      "Rejected",
      "Expired",
      "Not Accepted By  Incharge"
    ].includes(x.status)
)
? "opacity-50 cursor-not-allowed"
: ""
}
`}
>
                    <FileText size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Request Outpass</p>
                  </button>
<button
disabled={activeLeave}
onClick={() => {
  if (!requireProfilePhoto()) return;

  setLeaveDialogOpen(true);
}}
className={`bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg ${
activeLeave
? "opacity-50 cursor-not-allowed"
: ""
}`}
>
                    <Calendar size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Apply Leave</p>
                  </button>
                </div>
{activeOutpass && (

<Card sx={{ borderRadius: 3 }}>

<CardContent className="p-4">

<div className="flex items-center justify-between mb-3">

<h3 className="font-bold text-gray-800">
Active Outpass
</h3>

<Chip
label={activeOutpass.status}
color="success"
size="small"
/>

</div>

<div
className="rounded-xl p-3 bg-green-50 border border-green-200"
>

<p className="font-semibold text-gray-800 text-sm">
  <span className="text-gray-500">Reason :</span> {activeOutpass.reason}
</p>

<div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">

<span className="flex items-center">
<Calendar size={12} className="mr-1"/>
{new Date(activeOutpass.validFrom).toLocaleDateString()}
</span>

<span className="flex items-center">
<Clock size={12} className="mr-1"/>

{new Date(`2000-01-01T${activeOutpass.timeOut}`)
.toLocaleTimeString([],{
hour:"numeric",
minute:"2-digit",
hour12:true
})}

{" - "}

{new Date(`2000-01-01T${activeOutpass.returnTime}`)
.toLocaleTimeString([],{
hour:"numeric",
minute:"2-digit",
hour12:true
})}

</span>

<span className="flex items-center">
<MapPin size={12} className="mr-1"/>
{activeOutpass.destination}
</span>

</div>





<div className="mt-4">

<button
onClick={()=>{
setSelectedOutpass(activeOutpass);
setQrCardOpen(true);
}}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
>

Show Pass

</button>

</div>

</div>

</CardContent>

</Card>

)}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Recent Outpasses</h3>
                      <button onClick={() => setCurrentView('history')} className="text-blue-600 text-xs font-medium">
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {outpasses
.filter(
  x =>
    x.reason &&
    x.destination &&
    x.leaveRequestId === 0
)
.sort((a, b) => {

    if (
        a.outpassState === "Active" ||
        a.outpassState === "Outside Hostel"
    ) return -1;

    if (
        b.outpassState === "Active" ||
        b.outpassState === "Outside Hostel"
    ) return 1;

    return new Date(b.createdAt).getTime()
         - new Date(a.createdAt).getTime();
})
.slice(0,2)
  .map((outpass) => (
  <div
    key={outpass.id}
    className={`rounded-xl p-3 ${
     (
outpass.outpassState==="Active" ||
outpass.outpassState==="Outside Hostel"
)
?
"bg-green-50 border border-green-200"
:
"bg-white border border-gray-200"
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">
  <span className="text-gray-500">Reason :</span> {outpass.reason}
</p>

        <div className="flex items-center gap-2 mt-1">
    <Chip
            label={getApprovalLabel(outpass)}
            color={getStatusColor(
              outpass.status?.toLowerCase()
            )}
            size="small"
            icon={getStatusIcon(
              outpass.status?.toLowerCase()
            )}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
          {outpass.status === "Rejected" &&
 outpass.rejectReason && (
  <p className="text-xs text-red-600 mt-2">
    Reject Reason: {outpass.rejectReason}
  </p>
)}
        </div>
      </div>
{(
    outpass.status?.toLowerCase() === "approved" &&
    (
        outpass.outpassState === "Active" ||
        outpass.outpassState === "Outside Hostel" ||
        outpass.outpassState === "Waiting For Exit"
    )
) && (
        <button
          onClick={() => {
            setSelectedOutpass(outpass);
            setQrCardOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium"
        >
          Show Pass
        </button>
      )}
    </div>

    <div className="flex flex-wrap gap-2 text-xs text-gray-600">

      <span className="flex items-center">
        <Calendar size={12} className="mr-1" />
        {new Date(
          outpass.validFrom
        ).toLocaleDateString()}
      </span>

      <span className="flex items-center">
        <Clock size={12} className="mr-1" />
        {new Date(
          `2000-01-01T${outpass.timeOut}`
        ).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
        {" - "}
        {new Date(
          `2000-01-01T${outpass.returnTime}`
        ).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </span>

      <span className="flex items-center">
        <MapPin size={12} className="mr-1" />
        {outpass.destination}
      </span>
    
    </div>
 {outpass.status?.toLowerCase() === "pending" && (
  <div className="mt-3">
    <button
      onClick={async () => {
        await cancelOutpass(outpass.id);

        toast.success("Outpass Cancelled");

        await loadOutpasses();
      }}
      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
    >
      Cancel Request
    </button>
  </div>
)}
  </div>
))}
                    </div>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3 }}>
  <CardContent className="p-4">

    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-gray-800">
        Recent Leave Requests
      </h3>
    </div>

    <div className="space-y-3">

      {leaveRequests
        .sort(
          (a,b)=>
            new Date(b.createdDate).getTime()-
            new Date(a.createdDate).getTime()
        )
        .slice(0,2)
        .map((leave)=>{

          const linkedOutpass =
            outpasses.find(
              x=>x.leaveRequestId===leave.id
            );

          return(

            <div
  key={leave.id}
  className={`rounded-xl p-3 ${
    leave.status === "Approved"
      ? "bg-green-50 border border-green-200"
      : leave.status === "Rejected"
      ? "bg-red-50 border border-red-200"
      : "bg-yellow-50 border border-yellow-200"
  }`}
>
              <div className="flex items-start justify-between mb-2">

                <div>

<p className="font-semibold text-gray-800 text-sm">
  <span className="text-gray-500">Leave Type :</span> {leave.leaveType}
</p>

                <p className="text-xs text-gray-500">
  {leave.campus}
</p>

{leave.destination && (
  <p className="text-xs text-gray-600 mt-1">
    <MapPin size={12} className="inline mr-1" />
    {leave.destination}
  </p>
)}

                </div>
<Chip
                  label={getApprovalLabel(leave)}
                  color={getStatusColor(
                    leave.status.toLowerCase()
                  )}
                  size="small"
                />

              </div>

              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">

  <span className="flex items-center">
    <Calendar size={12} className="mr-1" />
    {new Date(leave.fromDate).toLocaleDateString()}
    {" - "}
    {new Date(leave.toDate).toLocaleDateString()}
  </span>

</div>

<p className="text-xs text-gray-700 mt-2">
  <span className="font-medium">Reason :</span> {leave.reason}
</p>
{leave.status?.toLowerCase() === "pending" && (
  <div className="mt-3">
    <button
      onClick={async () => {
        await cancelLeave(leave.id);
        toast.success("Leave Cancelled");
        await loadLeaveRequests();
      }}
      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
    >
      Cancel Request
    </button>
  </div>
)}
              {leave.status==="Rejected" &&
                leave.rejectReason && (

                <p className="text-xs text-red-600 mt-2">
                  Reject Reason :
                  {" "}
                  {leave.rejectReason}
                </p>

              )}
{linkedOutpass && (

<>



</>

)}
              {leave.campus==="Out Campus" &&
               linkedOutpass &&
               linkedOutpass.status==="Approved" &&
               (
                 linkedOutpass.outpassState==="Active" ||
                 linkedOutpass.outpassState==="Waiting For Exit" ||
                 linkedOutpass.outpassState==="Outside Hostel"
               ) && (

                <button
                  onClick={()=>{
                    setSelectedOutpass(linkedOutpass);
                    setQrCardOpen(true);
                  }}
                 className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium mt-3"
                >
                  Show Pass
                </button>

              )}

            </div>

          );

      })}

      {leaveRequests.length===0 && (

        <p className="text-center text-gray-400 py-6">

          No Leave Requests

        </p>

      )}

    </div>

  </CardContent>
</Card>
              </>
              
            )}
            {/* TRANSPORT VIEW */}
            {!isHostel && (
              <>
              {cancelRequest?.status === "Pending" && (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <p className="text-orange-600 font-semibold">
        Your transport cancellation request is pending approval.
      </p>
    </CardContent>
  </Card>
)}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin size={24} className="text-blue-500" />
                    <span className="text-lg font-bold text-gray-800">
{transportInfo?.routeName ?? "-"}
</span>
                    </div>
                    <p className="text-xs text-gray-600">Active Route</p>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Transport Details</h3>
                      <Bus size={20} className="text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500 text-xs">Route</p><p className="font-medium">{transportInfo?.routeName ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Bus Number</p><p className="font-medium">{transportInfo?.busNumber ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Boarding Point</p><p className="font-medium">{transportInfo?.stopName ?? "-"}</p></div>
                      <div><p className="text-gray-500 text-xs">Pickup Time</p><p className="font-medium">{transportInfo?.pickupTime ?? "-"}</p></div>

                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrentView('route')}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Navigation size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Route Info</p>
                  </button>
                  <button
                    onClick={() => setCurrentView('announcements')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Bell size={28} className="mb-2" />
                    <p className="font-semibold text-sm">Announcements</p>
                  </button>
                </div>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">Announcements</h3>
                      <button onClick={() => setCurrentView('announcements')} className="text-blue-600 text-xs font-medium">
                        View All
                      </button>
                    </div>
                  {announcements.length === 0 ? (

<div className="text-center py-8 text-gray-500">

No announcements available

</div>

) : (

<div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">

<p className="font-semibold text-gray-800 text-sm">
{announcements[0].title}
</p>

<p className="text-xs text-gray-600 mt-1">
{announcements[0].message}
</p>

<p className="text-xs text-gray-400 mt-2">
{announcements[0].createdDate}
</p>

</div>

)}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      {/* Outpass Dialog */}
      <Dialog open={outpassDialogOpen} onClose={() => setOutpassDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Request Outpass</h2>
          <button onClick={() => setOutpassDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleOutpassSubmit} className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={outpassForm.reason}
              onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3} required
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text" value={outpassForm.destination}
              onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date" value={outpassForm.date}
              onChange={(e) => setOutpassForm({ ...outpassForm, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Out</label>
              <input type="time" value={outpassForm.timeOut}
                onChange={(e) => setOutpassForm({ ...outpassForm, timeOut: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Time</label>
              <input type="time" value={outpassForm.returnTime}
                onChange={(e) => setOutpassForm({ ...outpassForm, returnTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
          </div>
          <button type="submit"disabled={submittingOutpass} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
           {submittingOutpass ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </Dialog>

      {/* Leave Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Apply Leave</h2>
          <button onClick={() => setLeaveDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleLeaveSubmit} className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required
            >
              <option value="">Select Type</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Campus Status</label>
            <div className="flex gap-3">
              {([['incampus', '🏫 In Campus'], ['outcampus', '🚪 Out Campus']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLeaveForm({ ...leaveForm, campus: val })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${leaveForm.campus === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {leaveForm.campus === "outcampus" && (

<div className="bg-white rounded-2xl p-4">

<label className="block text-sm font-medium text-gray-700 mb-2">

Destination

</label>

<input
type="text"
value={leaveForm.destination}
onChange={(e)=>
setLeaveForm({
...leaveForm,
destination:e.target.value
})
}
className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl"
placeholder="Enter Destination"
required
/>

</div>

)}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input type="date" value={leaveForm.fromDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input type="date" value={leaveForm.toDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400" required />
            </div>
          </div>
          {
leaveForm.campus === "outcampus" &&
leaveForm.fromDate === leaveForm.toDate && (
<>

<div className="bg-white rounded-2xl p-4">
<label>Exit Time</label>

<input
type="time"
value={leaveForm.exitTime}
onChange={(e)=>
setLeaveForm({
...leaveForm,
exitTime:e.target.value
})}
required
/>
</div>

<div className="bg-white rounded-2xl p-4">
<label>Return Time</label>

<input
type="time"
value={leaveForm.returnTime}
onChange={(e)=>
setLeaveForm({
...leaveForm,
returnTime:e.target.value
})}
required
/>
</div>

</>
)}
          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              rows={4} required />
          </div>
          {leaveForm.campus === 'outcampus' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
              <FileText size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">Out Campus leave — an <span className="font-bold">Outpass will be auto-generated</span> once the warden approves your leave request.</p>
            </div>
          )}
          <button type="submit" disabled={submittingLeave} className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
             {submittingLeave
        ? "Submitting..."
        : "Submit Application"}
          </button>
        </form>
      </Dialog>

     {selectedOutpass && (
  <OutpassQRCard
    open={qrCardOpen}
    onClose={() => setQrCardOpen(false)}
    outpass={selectedOutpass}
    student={{
      ...user,
      profilePhoto: studentProfile?.profilePhoto,
      department: studentProfile?.department,
      year: studentProfile?.year,
      college: studentProfile?.collegeName
    }}
  />
)}

      {/* Vacate Hostel Dialog */}
      <Dialog open={vacateDialogOpen} onClose={() => setVacateDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-red-500 to-red-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Vacate Hostel</h2>
          <button onClick={() => setVacateDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-sm mb-1">Important Notice</p>
                <p className="text-xs text-red-700">This request will permanently close your hostel account. Your room will be deallocated and all hostel access will be revoked after admin approval. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Current Hostel Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium text-gray-800">{studentProfile?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{studentProfile?.studentName}</span>
                </div>
             
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Vacating</label>
        <textarea
value={vacateReason}
onChange={(e) => setVacateReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={4}
              placeholder="Please provide a detailed reason for vacating the hostel..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setVacateDialogOpen(false); setVacateReason(''); }}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
             onClick={() => {
  if (!vacateReason.trim()) {
    toast.error("Enter reason");
    return;
  }

  handleVacateSubmit();
}}

             disabled={!vacateReason.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Transport Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Cancel Transport</h2>
          <button onClick={() => setCancelDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-orange-800 text-sm mb-1">Important Notice</p>
                <p className="text-xs text-orange-700">This request will permanently close your transport account. Your bus seat will be deallocated and all transport access will be revoked after admin approval. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Current Transport Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium text-gray-800">{user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                
               <div className="flex justify-between">
  <span className="text-gray-600">Route:</span>
  <span className="font-medium text-gray-800">
    {transportInfo?.routeName ?? "-"}
  </span>
</div>

<div className="flex justify-between">
  <span className="text-gray-600">Bus Number:</span>
  <span className="font-medium text-gray-800">
    {transportInfo?.busNumber ?? "-"}
  </span>
</div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
           <textarea
  value={cancelReason}
  onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              rows={4}
              placeholder="Please provide a detailed reason for cancelling transport service..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
             onClick={() => {
    setCancelDialogOpen(false);
    setCancelReason("");
}}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
           onClick={async () => {

  if (!cancelReason.trim()) {
    toast.error("Enter reason");
    return;
  }

  try {

    await submitTransportCancellation(
      user.studentId || "",
      user.name,
      cancelReason
    );

    await loadTransportCancellation();

    toast.success("Cancellation request submitted");

    setCancelDialogOpen(false);
    setCancelReason("");

  } catch (err: any) {

    toast.error(err.message);

  }

}}
             disabled={!cancelReason.trim()}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── PROFILE DIALOG ── */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} fullScreen PaperProps={{ sx: { bgcolor: '#f9fafb' } }}>
        <div className={`${isHostel ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'} p-4 flex items-center justify-between`}>
          <h2 className="text-white text-xl font-bold">My Profile</h2>
          <button onClick={() => setProfileDialogOpen(false)} className="text-white"><X size={24} /></button>
        </div>

        {/* Tab bar */}
       <div className="flex bg-white border-b border-gray-200 shadow-sm">
  {(isHostel
    ? (['info', 'history', 'password'] as const)
    : (['info', 'password'] as const)
  ).map(tab => (
            <button key={tab} onClick={() => setProfileTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${profileTab === tab ? (isHostel ? 'text-blue-600 border-b-2 border-blue-600' : 'text-green-600 border-b-2 border-green-600') : 'text-gray-400'}`}>
              {tab === 'info' ? '👤 Info' : tab === 'history' ? '📋 History' : '🔒 Password'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-10">

          {/* ── INFO TAB ── */}
          {profileTab === 'info' && (
            <>
              <div className={`${isHostel ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-green-500 to-green-700'} rounded-3xl p-5 text-white`}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
            <div
  onDoubleClick={handlePhotoDoubleClick}
  onTouchStart={handlePhotoTouchStart}
  onTouchEnd={handlePhotoTouchEnd}
  onTouchCancel={handlePhotoTouchEnd}
  className="cursor-pointer select-none"
>
  <Avatar
    src={
      profilePhoto ||
      (studentProfile?.profilePhoto
        ? `https://api.madhapharma.in${studentProfile.profilePhoto}`
        : user.avatar)
    }
    alt={user.name}
    sx={{
      width: 72,
      height: 72,
      border: "3px solid rgba(255,255,255,0.5)"
    }}
  />
</div>
                    <button onClick={() => profileFileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1 shadow-md active:scale-90 transition-transform">
                      <Camera size={12} />
                    </button>
                    <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-white/80 text-sm">{user.studentId}</p>
                    <p className="text-white/70 text-xs mt-1">{isHostel ? '🏠 Hostel' : '🚌 Transport'} Student</p>
                  </div>
                </div>
              </div>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent className="p-4 space-y-2">
                  {[
                    ['College', user.college || 'Madha Dental College & Hospital'],
                    ['Department', user.department || 'BDS'],
                    ['Year', user.year || '2nd Year'],
                    ['Student ID', user.studentId || '—'],
                    ['Email', user.email || '—'],
                    ['Service', isHostel ? 'Hostel' : 'Transport'],

                      ['Parent Login ID', studentProfile?.parentLoginId || '—'],
  ['Temporary Password', studentProfile?.parentTemporaryPassword || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-semibold text-gray-700">{v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {profileTab === 'history' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">All Outpass Requests ({outpasses.length})</h3>
                </div>
                <div className="divide-y divide-gray-100">
               {[...outpasses]
.filter(x => x.leaveRequestId === 0)
.sort(
(a,b)=>
new Date(b.createdAt).getTime()-
new Date(a.createdAt).getTime()
)
.map(op => (

<div key={op.id} className="p-3">

<div className="flex justify-between">

<p className="font-semibold">
{op.reason}
</p>

<Chip
label={op.status}
color={getStatusColor(op.status?.toLowerCase())}
size="small"
/>
{op.status === "Rejected" &&
 op.rejectReason && (
  <p className="text-xs text-red-600 mt-2">
    Reject Reason: {op.rejectReason}
  </p>
)}
</div>

<p className="text-xs text-gray-500 mt-1">
📅 {new Date(op.validFrom).toLocaleDateString()}
</p>

<p className="text-xs text-gray-500">
🕒 {op.timeOut} - {op.returnTime}
</p>

<p className="text-xs text-gray-500">
📍 {op.destination}
</p>












<hr className="mt-3"/>

</div>

))}

{outpasses.length===0 && (

<p className="text-center text-gray-400 py-6">

No Outpass History

</p>

)}</div>
              </div>

             </>
          )}

          {/* ── PASSWORD TAB ── */}
          {profileTab === 'password' && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`${isHostel ? 'bg-blue-100' : 'bg-green-100'} p-3 rounded-2xl`}>
                    <Lock size={22} className={isHostel ? 'text-blue-600' : 'text-green-600'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Change Password</h3>
                    <p className="text-xs text-gray-500">Keep your account secure</p>
                  </div>
                </div>
                {(['current', 'newPwd', 'confirm'] as const).map((field, i) => (
                  <div key={field} className="relative">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      {field === 'current' ? 'Current Password' : field === 'newPwd' ? 'New Password' : 'Confirm New Password'}
                    </label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={changePwdForm[field]}
                      onChange={e => setChangePwdForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={field === 'current' ? '••••••••' : field === 'newPwd' ? 'Min 8 characters' : 'Repeat new password'}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition-all"
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-4 bottom-3.5 text-gray-400">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                ))}
                {changePwdForm.confirm && changePwdForm.newPwd !== changePwdForm.confirm && (
                  <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                )}
                <button
                  onClick={async () => {

  if (!changePwdForm.current) {
    toast.error("Enter your current password");
    return;
  }

  if (changePwdForm.newPwd.length < 8) {
    toast.error("New password must be at least 8 characters");
    return;
  }

  if (changePwdForm.newPwd !== changePwdForm.confirm) {
    toast.error("Passwords do not match");
    return;
  }

  try {

    await changePassword(
      user.studentId!,
      changePwdForm.current,
      changePwdForm.newPwd
    );

    toast.success("Password updated successfully");

    setChangePwdForm({
      current: "",
      newPwd: "",
      confirm: ""
    });

  } catch (err: any) {

    toast.error(err.message);

  }

}}
                  className={`w-full ${isHostel ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white font-bold py-3.5 rounded-2xl shadow-md active:scale-95 transition-transform`}
                >
                  Update Password
                </button>
              </CardContent>
            </Card>
          )}

        </div>
      </Dialog>
      <Dialog
  open={rejectPopupOpen}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4,
      overflow: "hidden"
    }
  }}
>

  {/* Header */}
  <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 flex flex-col items-center">

    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">

      <AlertTriangle
        size={42}
        className="text-red-500"
      />

    </div>

    <h2 className="text-white text-2xl font-bold mt-4">
      Request Rejected
    </h2>

  </div>

  {/* Body */}

  <div className="p-6">

    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">

      <p className="text-gray-700 text-center">

        Your hostel vacating request has been rejected by the Hostel Administration.

      </p>

      <p className="text-red-600 font-semibold text-center mt-3">

        Please meet the Hostel Warden for further clarification.

      </p>

    </div>

    <button
      onClick={acknowledgeReject}
      className="
      w-full
      mt-6
      bg-gradient-to-r
      from-blue-500
      to-blue-600
      text-white
      font-semibold
      py-3
      rounded-xl
      shadow-lg
      active:scale-95
      transition-all"
    >
      OK
    </button>

  </div>

</Dialog>

  <Dialog
   open={cancelRejectPopupOpen}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 4,
      overflow: "hidden"
    }
  }}
>

  {/* Header */}
  <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 flex flex-col items-center">

    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">

      <AlertTriangle
        size={42}
        className="text-red-500"
      />

    </div>

    <h2 className="text-white text-1xl font-bold mt-4">
      Transport Cancellation Rejected
    </h2>

  </div>

  {/* Body */}

  <div className="p-6">

    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">

      <p className="text-gray-700 text-center">

         Your transport cancellation request has been rejected.

      </p>

      <p className="text-red-600 font-semibold text-center mt-3">

        Please contact the Transport Coordinator.

      </p>

    </div>

    <button
          onClick={acknowledgeTransportReject}
      className="
      w-full
      mt-6
      bg-gradient-to-r
      from-blue-500
      to-blue-600
      text-white
      font-semibold
      py-3
      rounded-xl
      shadow-lg
      active:scale-95
      transition-all"
    >
      OK
    </button>

  </div>

</Dialog>
{/* PROFILE PHOTO VIEWER */}
<Dialog
  open={photoPreviewOpen}
  onClose={() => setPhotoPreviewOpen(false)}
  fullScreen
  PaperProps={{
    sx: {
      bgcolor: "black"
    }
  }}
>
  <div className="relative w-full h-full flex items-center justify-center">

    <button
      onClick={() => setPhotoPreviewOpen(false)}
      className="absolute top-5 right-5 z-50 text-white bg-black/50 rounded-full p-2"
    >
      <X size={26} />
    </button>

    <img
      src={
        profilePhoto ||
        (studentProfile?.profilePhoto
          ? `https://api.madhapharma.in${studentProfile.profilePhoto}`
          : user.avatar)
      }
      alt={user.name}
      className="max-w-full max-h-full object-contain"
    />

  </div>
</Dialog>
{/* PROFILE PHOTO ADJUSTMENT */}
<Dialog
  open={photoAdjustOpen}
  onClose={cancelPhotoAdjustment}
  fullScreen
  PaperProps={{
    sx: {
      bgcolor: "#000",
    },
  }}
>
  <div className="w-full h-full flex flex-col">

    {/* HEADER */}
    <div className="flex items-center justify-between p-4 text-white">

      <button
        type="button"
        onClick={cancelPhotoAdjustment}
        className="text-white font-semibold px-2 py-2"
      >
        Cancel
      </button>

      <h2 className="font-bold text-lg">
        Adjust Photo
      </h2>

      <button
        type="button"
        onClick={confirmPhotoUpload}
        disabled={uploadingPhoto}
        className="text-blue-400 font-bold px-2 py-2 disabled:opacity-50"
      >
        {uploadingPhoto
          ? "Uploading..."
          : "Confirm"}
      </button>

    </div>


    {/* PHOTO AREA */}
    <div className="flex-1 flex items-center justify-center overflow-hidden">

      {pendingPhotoUrl && (

        <div
          ref={photoCropRef}
          className="relative w-[min(88vw,420px)] aspect-square overflow-hidden rounded-full bg-gray-900 border-2 border-white/30 select-none touch-none"
          onPointerDown={handlePhotoPointerDown}
          onPointerMove={handlePhotoPointerMove}
          onPointerUp={handlePhotoPointerUp}
          onPointerCancel={handlePhotoPointerUp}
          style={{
            cursor: isDraggingPhoto
              ? "grabbing"
              : "grab",
          }}
        >

          {/* PHOTO */}
          <img
            src={pendingPhotoUrl}
            alt="Adjust profile photo"
            draggable={false}
            className="absolute max-w-none pointer-events-none select-none"
            style={{
              width: `${100 * photoZoom}%`,
              height: `${100 * photoZoom}%`,

              left: "50%",
              top: "50%",

              transform: `
                translate(
                  calc(-50% + ${photoX}px),
                  calc(-50% + ${photoY}px)
                )
              `,

              objectFit: "cover",
            }}
          />

          {/* CROP BORDER */}
          <div
            className="absolute inset-0 rounded-full border-4 border-white/80 pointer-events-none"
          />

          {/* CENTER GUIDE */}
          <div
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-white/70 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />

        </div>

      )}

    </div>


    {/* CONTROLS */}
    <div className="bg-black p-6">

      <p className="text-white text-center font-medium mb-2">
        Position your photo
      </p>

      <p className="text-gray-400 text-center text-sm mb-5">
        Drag the photo to move it
      </p>


      {/* ZOOM */}
      <div className="flex items-center gap-3">

        <span className="text-white text-lg">
          −
        </span>

        <input
          aria-label="Photo zoom"
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={photoZoom}
          onChange={(e) =>
            setPhotoZoom(Number(e.target.value))
          }
          className="flex-1"
        />

        <span className="text-white text-lg">
          +
        </span>

      </div>


      {/* RESET POSITION */}
      <button
        type="button"
        onClick={() => {
          setPhotoZoom(1);
          setPhotoX(0);
          setPhotoY(0);
        }}
        className="block mx-auto mt-5 text-gray-300 text-sm font-medium"
      >
        Reset position
      </button>

    </div>

  </div>
</Dialog>
    </DashboardLayout>
  );
}
