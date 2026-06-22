import { useState, useEffect } from "react";
import { getAllOutpasses } from "../../services/outpassService";

import {
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Filter,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DashboardLayout from '../common/DashboardLayout';
import type { User } from '../../types';

interface OutpassManagementProps {
  user: User;
  onLogout: () => void;
}

export default function OutpassManagement({ user, onLogout }: OutpassManagementProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOutpass, setSelectedOutpass] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = [
    {
      label: 'Total Requests',
      value: '2,458',
      subtitle: 'This month',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Approved',
      value: '1,598',
      subtitle: '65%',
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Pending',
      value: '615',
      subtitle: '25%',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
    {
      label: 'Rejected',
      value: '245',
      subtitle: '10%',
      icon: <XCircle className="w-6 h-6" />,
      color: 'bg-red-500',
    },
  ];

  const [outpasses, setOutpasses] = useState<any[]>([]);
  useEffect(() => {
  loadOutpasses();
}, []);

const loadOutpasses = async () => {
  try {
    const data = await getAllOutpasses();
    console.log(data);
    setOutpasses(data);
  } catch (error) {
    console.error(error);
  }
};
  const statusData = [
    { name: 'Approved', value: 65, color: '#10b981' },
    { name: 'Pending', value: 25, color: '#f59e0b' },
    { name: 'Rejected', value: 10, color: '#ef4444' },
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

  const handleApprove = (outpass: any) => {
    console.log('Approved:', outpass);
    setDialogOpen(false);
  };

  const handleReject = (outpass: any) => {
    console.log('Rejected:', outpass);
    setDialogOpen(false);
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout} title="Outpass Management">
      <div className="space-y-6">
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

        <Grid container spacing={3}>
          {/* Status Distribution */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart id="status-distribution-chart">
                    <Pie
                      key="status-pie"
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip key="tooltip" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">New Requests</p>
                      <p className="text-3xl font-bold text-blue-600">45</p>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Approved Today</p>
                      <p className="text-3xl font-bold text-green-600">38</p>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Active Outpasses</p>
                      <p className="text-3xl font-bold text-orange-600">142</p>
                    </div>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Late Returns</p>
                      <p className="text-3xl font-bold text-red-600">3</p>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Outpass Requests */}
        <Card>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="All Requests" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>

          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Outpass Requests</h3>
              <Button variant="outlined" startIcon={<Filter />}>
                Filter
              </Button>
            </div>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell><strong>Outpass ID</strong></TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Hostel</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outpasses
                    .filter((o) => {
                      if (activeTab === 0) return true;
                     if (activeTab === 1)
  return o.status?.toLowerCase() === "pending";

if (activeTab === 2)
  return o.status?.toLowerCase() === "approved";

if (activeTab === 3)
  return o.status?.toLowerCase() === "rejected";
                      return true;
                    })
                    .map((outpass) => (
                      <TableRow key={outpass.id} hover>
                        <TableCell>{outpass.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{outpass.studentName}</p>
                            <p className="text-sm text-gray-600">{outpass.studentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{outpass.block}</p>
                            <p className="text-sm text-gray-600">{outpass.room}</p>
                          </div>
                        </TableCell>
                        <TableCell>{outpass.reason}</TableCell>
                        <TableCell>{outpass.date}</TableCell>
                        <TableCell>
                          {outpass.timeOut} - {outpass.expectedReturn}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={outpass.status}
                            color={getStatusColor(outpass.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedOutpass(outpass);
                                setDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                            {outpass.status === 'approved' && (
                              <Button size="small" variant="contained" startIcon={<QrCode />}>
                                QR
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>

      {/* View/Review Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedOutpass && (
          <>
            <DialogTitle>Outpass Request Details</DialogTitle>
            <DialogContent>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Outpass ID:</span>
                  <span className="font-medium">{selectedOutpass.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium">{selectedOutpass.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-medium">{selectedOutpass.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hostel:</span>
                  <span className="font-medium">{selectedOutpass.block} - {selectedOutpass.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium">{selectedOutpass.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{selectedOutpass.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedOutpass.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedOutpass.timeOut} - {selectedOutpass.expectedReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Chip
                    label={selectedOutpass.status}
                    color={getStatusColor(selectedOutpass.status)}
                    size="small"
                  />
                </div>
                {selectedOutpass.status === 'pending' && (
                  <TextField
                    label="Remarks (Optional)"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                  />
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              {selectedOutpass.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(selectedOutpass)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(selectedOutpass)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
