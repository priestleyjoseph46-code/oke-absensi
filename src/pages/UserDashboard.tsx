import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId: string;
  type: 'in' | 'out';
  timestamp: Date;
  location?: string;
}

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'out' | 'in'>('out');

  useEffect(() => {
    // Load today's attendance from localStorage
    const today = new Date().toDateString();
    const allAttendance = JSON.parse(localStorage.getItem('attendanceData') || '[]');
    const todayRecords = allAttendance.filter((record: AttendanceRecord) => 
      record.userId === user?.id && 
      new Date(record.timestamp).toDateString() === today
    );
    
    setTodayAttendance(todayRecords);
    
    // Determine current status
    if (todayRecords.length > 0) {
      const lastRecord = todayRecords[todayRecords.length - 1];
      setCurrentStatus(lastRecord.type === 'in' ? 'in' : 'out');
    }
  }, [user?.id]);

  const handleAttendance = (type: 'in' | 'out') => {
    if (!user) return;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      userId: user.id,
      type,
      timestamp: new Date(),
      location: 'Online'
    };

    // Save to localStorage
    const allAttendance = JSON.parse(localStorage.getItem('attendanceData') || '[]');
    allAttendance.push(newRecord);
    localStorage.setItem('attendanceData', JSON.stringify(allAttendance));

    // Update state
    setTodayAttendance(prev => [...prev, newRecord]);
    setCurrentStatus(type);

    toast.success(
      type === 'in' 
        ? 'Finger In berhasil dicatat!' 
        : 'Finger Out berhasil dicatat!',
      {
        description: `Waktu: ${new Date().toLocaleTimeString('id-ID')}`
      }
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Absensi</h1>
            <p className="text-gray-600">{formatDate(new Date())}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informasi Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-semibold">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Saat Ini</p>
                <Badge variant={currentStatus === 'in' ? 'default' : 'secondary'}>
                  {currentStatus === 'in' ? 'Masuk' : 'Keluar'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                Finger In
              </CardTitle>
              <CardDescription>
                Catat kehadiran masuk Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleAttendance('in')}
                disabled={currentStatus === 'in'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                {currentStatus === 'in' ? 'Sudah Finger In' : 'Finger In Sekarang'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="mr-2 h-5 w-5" />
                Finger Out
              </CardTitle>
              <CardDescription>
                Catat kehadiran keluar Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleAttendance('out')}
                disabled={currentStatus === 'out'}
                variant="destructive"
                className="w-full"
              >
                <Clock className="mr-2 h-4 w-4" />
                {currentStatus === 'out' ? 'Sudah Finger Out' : 'Finger Out Sekarang'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Riwayat Absensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada aktivitas absensi hari ini
              </p>
            ) : (
              <div className="space-y-3">
                {todayAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {record.type === 'in' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-3" />
                      )}
                      <div>
                        <p className="font-medium">
                          {record.type === 'in' ? 'Finger In' : 'Finger Out'}
                        </p>
                        <p className="text-sm text-gray-600">{record.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatTime(record.timestamp)}</p>
                      <Badge variant={record.type === 'in' ? 'default' : 'secondary'}>
                        {record.type === 'in' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;