import { ReactNode, useState, useEffect } from 'react';
import {
  getNotificationCount,
  getNotifications,
  markNotificationRead
}
from "../../../api/notificationService";

import { useNavigate } from 'react-router';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount,
setNotificationCount] =
useState(0);
  const [notifications,
setNotifications] =
useState<any[]>([]);
  useEffect(() => {

  loadNotificationCount();
     loadNotifications();
}, []);

const loadNotificationCount =
async () => {

  const count =
    await getNotificationCount(
      Number(user.id)
    );

  setNotificationCount(count);

};
const loadNotifications =
async () => {

  const data =
    await getNotifications(
      Number(user.id)
    );

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
      return [
        baseItem,
        { icon: <Building2 size={22} />, label: 'Hostel Management', onClick: () => { navigate('/admin/hostel'); setDrawerOpen(false); } },
        { icon: <Bus size={22} />, label: 'Transport Management', onClick: () => { navigate('/admin/transport'); setDrawerOpen(false); } },
        { icon: <Settings size={22} />, label: 'Settings', onClick: () => { navigate('/admin/settings'); setDrawerOpen(false); } },
      ];
    }

    return [baseItem];
  };

  const items = menuItems ?? getAutoMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <AppBar position="sticky" sx={{ bgcolor: '#1e40af' }} elevation={0}>
        <Toolbar className="px-4">
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon size={24} />
          </IconButton>

          <div className="flex-1">
            <h1 className="text-white font-bold text-lg truncate">{title}</h1>
          </div>

         <IconButton
  color="inherit"
  sx={{ mr: 0.5 }}
  onClick={() => setNotificationsOpen(true)}
>
            <Badge badgeContent={unreadCount} color="error">
              <Bell size={22} />
            </Badge>
          </IconButton>

     <Avatar
  src={
    user.profilePhoto
      ? `https://202.61.121.102:8443${user.profilePhoto}`
      : user.avatar
  }
  alt={user.name}
  sx={{ width: 36, height: 36, cursor: 'pointer' }}
/>
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
        ? `https://202.61.121.102:8443${user.profilePhoto}`
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
      <main className="p-4 pb-20">
        {children}
      </main>
    </div>
  );
}
