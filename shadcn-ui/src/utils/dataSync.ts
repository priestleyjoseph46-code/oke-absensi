// Data synchronization utilities for cross-device data sharing
export interface SyncData {
  attendanceData: any[];
  users: any[];
  lastUpdated: number;
}

export const syncToCloud = (data: SyncData) => {
  // Simulate cloud sync by using localStorage with timestamp
  const syncKey = 'attendanceSync';
  const syncData = {
    ...data,
    lastUpdated: Date.now()
  };
  localStorage.setItem(syncKey, JSON.stringify(syncData));
};

export const syncFromCloud = (): SyncData | null => {
  const syncKey = 'attendanceSync';
  const data = localStorage.getItem(syncKey);
  return data ? JSON.parse(data) : null;
};

export const initializeSync = () => {
  // Check if there's existing sync data
  const syncData = syncFromCloud();
  if (!syncData) {
    // Initialize with empty data
    const initialData: SyncData = {
      attendanceData: [],
      users: [],
      lastUpdated: Date.now()
    };
    syncToCloud(initialData);
  }
};

export const mergeAttendanceData = (localData: any[], syncData: any[]): any[] => {
  // Merge attendance data from different devices
  const combined = [...localData, ...syncData];
  const unique = combined.filter((item, index, arr) => 
    arr.findIndex(t => t.id === item.id) === index
  );
  return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};