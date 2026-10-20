import { ReactNode, useState, useEffect } from 'react';
import {
  getNotificationCount,
  getNotifications,
  markNotificationRead
}
from "../../../api/notificationService";

import { useNavigate, useLocation } from 'react-router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Building2,
  Bus,
  Settings,
  Bell,
  LogOut,
  Users,
  Calendar,
  ClipboardList,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  MoreHorizontal,
} from 'lucide-react';
import type { User } from '../../types';

export interface MenuItemType {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface DashboardLayoutProps {
  user: User;
  children: ReactNode;
  onLogout: () => void;
  title: string;
  menuItems?: MenuItemType[];
}

const mockNotifications = [
  {
    id: 1,
    type: 'approval',
    title: 'Outpass Approved',
    message: 'Your outpass for Medical Appointment has been approved',
    time: '5 min ago',
    read: false,
    icon: <CheckCircle2 size={18} />,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    id: 2,
    type: 'alert',
    title: 'Late Return Alert',
    message: 'Please return to hostel before 10:00 PM tonight',
    time: '1 hr ago',
    read: false,
    icon: <AlertCircle size={18} />,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    id: 3,
    type: 'info',
    title: 'Attendance Marked',
    message: 'Your morning attendance has been recorded',
    time: '3 hrs ago',
    read: true,
    icon: <Info size={18} />,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Fee Due Reminder',
    message: 'Hostel fee payment due by 15th June 2026',
    time: '1 day ago',
    read: true,
    icon: <Clock size={18} />,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
];

export default function DashboardLayout({ user, children, onLogout, title, menuItems }: DashboardLayoutProps) {
console.log(
  "Current User",
  JSON.stringify(user, null, 2)
);
const navigate = useNavigate();
const location = useLocation();

const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount,
setNotificationCount] =
useState(0);
  const [notifications,
setNotifications] =
useState<any[]>([]);
useEffect(() => {

  if (!user || !user.id) return;

  loadNotificationCount();
  loadNotifications();

}, [user]);

const loadNotificationCount = async () => {

  if (!user?.id) return;

  const count = await getNotificationCount(Number(user.id));

  setNotificationCount(count);

};
const loadNotifications = async () => {

  if (!user?.id) return;

  const data = await getNotifications(Number(user.id));

  setNotifications(data);

};

const unreadCount =
notificationCount;

const markAllRead = async () => {

  for (const n of notifications) {

    if (!n.isRead) {

      await markNotificationRead(
        n.id
      );

    }
  }

  await loadNotifications();

  await loadNotificationCount();
};

  const getAutoMenuItems = (): MenuItemType[] => {
    const baseItem: MenuItemType = {
      icon: <Home size={22} />,
      label: 'Dashboard',
      onClick: () => { navigate(`/${user.role}`); setDrawerOpen(false); },
    };

if (user.role === 'admin') {
  const isManagement =
    user.staffRole?.toLowerCase() === "management" ||
    user.role?.toLowerCase() === "management";

  const canManageBoysHostel =
    isManagement ||
    user.canManageBoysHostel === true;

  const canManageGirlsHostel =
    isManagement ||
    user.canManageGirlsHostel === true;

  const canManageHostel =
    canManageBoysHostel ||
    canManageGirlsHostel;

  const canManageTransport =
    isManagement ||
    user.canManageTransport === true;

  return [
    baseItem,

    ...(canManageHostel
      ? [
          {
            icon: <Building2 size={22} />,
            label: 'Hostel Management',
            onClick: () => {
              navigate('/admin/hostel');
              setDrawerOpen(false);
            },
          },
        ]
      : []),

    ...(canManageTransport
      ? [
          {
            icon: <Bus size={22} />,
            label: 'Transport Management',
            onClick: () => {
              navigate('/admin/transport');
              setDrawerOpen(false);
            },
          },
        ]
      : []),

    {
      icon: <Settings size={22} />,
      label: 'Settings',
      onClick: () => {
        navigate('/admin/settings');
        setDrawerOpen(false);
      },
    },
  ];
}

    return [baseItem];
  };

  const items = menuItems ?? getAutoMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
{/* Premium Dashboard Header */}
<AppBar
  position="sticky"
  elevation={0}
  sx={{
    bgcolor: '#1e40af',
    boxShadow: 'none',
  }}
>
  <Toolbar className="px-4">
    <div className="flex-1 min-w-0">
      <h1 className="text-white font-bold text-lg truncate">
        {title}
      </h1>
      <p className="text-blue-100 text-xs truncate">
        Welcome, {user.name}
      </p>
    </div>

    <IconButton
      color="inherit"
      aria-label="Open notifications"
      onClick={() => setNotificationsOpen(true)}
      sx={{ ml: 1 }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <Bell size={22} />
      </Badge>
    </IconButton>
  </Toolbar>
</AppBar>
      
      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: '#1e3a8a' } }}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-blue-800 to-blue-900">
          {/* User Profile */}
          <div className="p-5 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-1">
              <Avatar
    src={
      user.profilePhoto
        ? `https://api.madhapharma.in${user.profilePhoto}`
        : user.avatar
    }
    alt={user.name}
    sx={{ width: 56, height: 56 }}
/>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base truncate">{user.name}</p>
                <p className="text-sm text-blue-200 capitalize">{user.role}</p>
                {user.studentId && <p className="text-xs text-blue-300">ID: {user.studentId}</p>}
              </div>
            </div>
          </div>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

          <List className="flex-1 py-2">
            {items.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ px: 1, py: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    item.onClick();
                    setDrawerOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    color: 'white',
                    py: 1.5,
                    bgcolor: item.active ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: item.active ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

          <div className="p-2">
            <ListItemButton
              onClick={onLogout}
              sx={{
                borderRadius: 2,
                color: 'white',
                py: 1.5,
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>
                <LogOut size={22} />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }} />
            </ListItemButton>
          </div>

          <div className="p-4 text-center">
            <p className="text-xs text-blue-300">© 2026 Madha Institutions</p>
          </div>
        </div>
      </Drawer>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        PaperProps={{ sx: { width: '100%', maxWidth: 400 } }}
      >
        <div className="h-full flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-blue-700 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={22} className="text-white" />
              <h2 className="text-white font-bold text-lg">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-white/80 text-xs font-medium underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setNotificationsOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={async () => {

  await markNotificationRead(
    notif.id
  );

  await loadNotifications();

  await loadNotificationCount();

}}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
  notif.isRead
    ? 'border-gray-100 opacity-70'
    : 'border-blue-100'
}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-xl mt-0.5">
  <Bell size={18} className="text-blue-500" />
</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
  {new Date(notif.createdAt)
    .toLocaleString()}
</p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>

{/* Main Content */}
<main className="p-4 pb-32 md:pb-20">
  {children}
</main>

{/* Premium Floating Bottom Navigation */}
<nav
  aria-label="Main navigation"
  className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1200]
             w-[calc(100%-24px)] max-w-md
             rounded-2xl border border-white/70
             bg-white/90 backdrop-blur-xl
             shadow-[0_8px_35px_rgba(15,23,42,0.18)]
             px-2 py-2"
  style={{
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
  }}
>
  <div className="flex items-center justify-around gap-1">
    {items.slice(0, 4).map((item, index) => {
      const path = location.pathname.toLowerCase();

      const active =
        item.active === true ||
        (item.label === 'Dashboard' &&
          path === `/${user.role.toLowerCase()}`) ||
        (item.label === 'Hostel Management' &&
          path.startsWith('/admin/hostel')) ||
        (item.label === 'Transport Management' &&
          path.startsWith('/admin/transport')) ||
        (item.label === 'Settings' &&
          path.startsWith('/admin/settings'));

      return (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          aria-current={active ? 'page' : undefined}
          onClick={item.onClick}
          className={`flex min-w-0 flex-1 flex-col items-center
                      justify-center gap-1 rounded-xl px-1 py-2
                      transition-all duration-200
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                      }`}
        >
          <span
            className={`transition-transform duration-200 ${
              active ? '-translate-y-0.5 scale-110' : ''
            }`}
          >
            {item.icon}
          </span>

          <span className="w-full truncate text-center text-[10px] font-semibold">
            {item.label}
          </span>
        </button>
      );
    })}

    <button
      type="button"
      aria-label="More navigation options"
      onClick={() => setDrawerOpen(true)}
      className="flex min-w-0 flex-1 flex-col items-center
                 justify-center gap-1 rounded-xl px-1 py-2
                 text-gray-500 transition-all duration-200
                 hover:bg-gray-50 hover:text-blue-600
                 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <MoreHorizontal size={23} />

      <span className="text-[10px] font-semibold">
        More
      </span>
    </button>
  </div>
</nav>
    </div>
  );
}
