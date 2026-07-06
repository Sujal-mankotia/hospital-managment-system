export const appointments = [
  { id: 'AP-88011', patient: 'Ananya Sharma', doctor: 'Dr. Rohan Mehta', department: 'Cardiology', date: '2026-07-06', time: '09:30 AM', priority: 'Routine', status: 'Confirmed' },
  { id: 'AP-88012', patient: 'Vikram Nair', doctor: 'Dr. Kavita Rao', department: 'Neurology', date: '2026-07-06', time: '10:00 AM', priority: 'Emergency', status: 'In Progress' },
  { id: 'AP-88013', patient: 'Simran Kaur', doctor: 'Dr. Arjun Verma', department: 'Orthopedics', date: '2026-07-06', time: '11:15 AM', priority: 'Routine', status: 'Confirmed' },
  { id: 'AP-88014', patient: 'Rahul Deshmukh', doctor: 'Dr. Neha Kapoor', department: 'Gynecology', date: '2026-07-06', time: '12:00 PM', priority: 'Follow-up', status: 'Waiting' },
  { id: 'AP-88015', patient: 'Meera Iyer', doctor: 'Dr. Imran Qureshi', department: 'Pulmonology', date: '2026-07-06', time: '01:30 PM', priority: 'Routine', status: 'Confirmed' },
  { id: 'AP-88016', patient: 'Aditya Kulkarni', doctor: 'Dr. Priya Sen', department: 'Pediatrics', date: '2026-07-07', time: '09:00 AM', priority: 'Routine', status: 'Confirmed' },
  { id: 'AP-88017', patient: 'Fatima Sheikh', doctor: 'Dr. Kavita Rao', department: 'Neurology', date: '2026-07-07', time: '10:30 AM', priority: 'Emergency', status: 'Confirmed' },
  { id: 'AP-88018', patient: 'Sanjay Gupta', doctor: 'Dr. Arjun Verma', department: 'Orthopedics', date: '2026-07-07', time: '02:00 PM', priority: 'Follow-up', status: 'Cancelled' },
  { id: 'AP-88019', patient: 'Priya Nambiar', doctor: 'Dr. Neha Kapoor', department: 'Gynecology', date: '2026-07-08', time: '11:00 AM', priority: 'Routine', status: 'Confirmed' },
  { id: 'AP-88020', patient: 'Karan Malhotra', doctor: 'Dr. Suresh Pillai', department: 'General Medicine', date: '2026-07-08', time: '03:30 PM', priority: 'Routine', status: 'Waiting' },
]

export const waitingList = [
  { id: 'WL-01', patient: 'Divya Reddy', department: 'General Medicine', waitSince: '08:40 AM', estWait: '15 min' },
  { id: 'WL-02', patient: 'Amitabh Joshi', department: 'Pulmonology', waitSince: '09:10 AM', estWait: '25 min' },
  { id: 'WL-03', patient: 'Neelam Bhatt', department: 'Dermatology', waitSince: '09:25 AM', estWait: '10 min' },
]

export const emergencyQueue = [
  { id: 'EQ-01', patient: 'Vikram Nair', condition: 'Cardiac Arrhythmia', arrivedAt: '09:52 AM', severity: 'Critical' },
  { id: 'EQ-02', patient: 'Unknown — Trauma Case', condition: 'Road Traffic Accident', arrivedAt: '10:05 AM', severity: 'Critical' },
  { id: 'EQ-03', patient: 'Fatima Sheikh', condition: 'Stroke Symptoms', arrivedAt: '10:12 AM', severity: 'High' },
]
