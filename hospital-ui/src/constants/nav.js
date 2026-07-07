export const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'dashboard', disabled: false },
  { key: 'patients', label: 'Patients', path: '/patients', icon: 'patients', disabled: false },
  { key: 'doctors', label: 'Doctors', path: '/doctors', icon: 'doctors', disabled: false },
  { key: 'appointments', label: 'Appointments', path: '/appointments', icon: 'appointments', disabled: false },
  { key: 'create-user', label: 'Create User', path: '/admin/users/new', icon: 'userPlus', disabled: false, roles: ['admin'] },
  { key: 'laboratory', label: 'Laboratory', path: '/laboratory', icon: 'lab', disabled: true },
  { key: 'pharmacy', label: 'Pharmacy', path: '/pharmacy', icon: 'pharmacy', disabled: true },
  { key: 'billing', label: 'Billing', path: '/billing', icon: 'billing', disabled: true },
  { key: 'reports', label: 'Reports', path: '/reports', icon: 'reports', disabled: true },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'settings', disabled: true },
]
