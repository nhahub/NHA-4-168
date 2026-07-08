import type { DriverStatus } from '../services/api/driverService';

// لستة الحالات اللي هتظهر في الـ Dropdown جوه الـ Dialog
export const driverStatuses: DriverStatus[] = ['Active', 'Inactive', 'Suspended'];
// القيم المبدئية لما تيجي تكريت سواق جديد (هنحتاجها في الـ DriverForm)
export const initialDriverValues = {
  driverSsn: 0,
  firstName: '',
  lastName: '',
  phone: '',
  licenseNumber: '',
  carModel: '',
  carPlate: '',
  carYear: new Date().getFullYear(),
  userId: null,
};