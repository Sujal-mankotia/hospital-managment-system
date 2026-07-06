export const patients = [
  { id: 'PT-20481', name: 'Ananya Sharma', age: 34, gender: 'Female', bloodGroup: 'O+', phone: '+91 98765 43210', disease: 'Hypertension', doctor: 'Dr. Rohan Mehta', status: 'Admitted', photo: 'https://i.pravatar.cc/100?img=47', admitted: '2026-06-28', ward: 'General - B204' },
  { id: 'PT-20482', name: 'Vikram Nair', age: 58, gender: 'Male', bloodGroup: 'A-', phone: '+91 91234 56780', disease: 'Cardiac Arrhythmia', doctor: 'Dr. Kavita Rao', status: 'Critical', photo: 'https://i.pravatar.cc/100?img=12', admitted: '2026-07-02', ward: 'ICU - 3' },
  { id: 'PT-20483', name: 'Simran Kaur', age: 27, gender: 'Female', bloodGroup: 'B+', phone: '+91 99887 66554', disease: 'Fracture - Tibia', doctor: 'Dr. Arjun Verma', status: 'Stable', photo: 'https://i.pravatar.cc/100?img=32', admitted: '2026-06-30', ward: 'Ortho - A112' },
  { id: 'PT-20484', name: 'Rahul Deshmukh', age: 45, gender: 'Male', bloodGroup: 'AB+', phone: '+91 90011 22334', disease: 'Type 2 Diabetes', doctor: 'Dr. Neha Kapoor', status: 'Discharged', photo: 'https://i.pravatar.cc/100?img=15', admitted: '2026-06-18', ward: '—' },
  { id: 'PT-20485', name: 'Meera Iyer', age: 62, gender: 'Female', bloodGroup: 'O-', phone: '+91 98123 45670', disease: 'Pneumonia', doctor: 'Dr. Rohan Mehta', status: 'Stable', photo: 'https://i.pravatar.cc/100?img=45', admitted: '2026-07-01', ward: 'General - C108' },
  { id: 'PT-20486', name: 'Aditya Kulkarni', age: 8, gender: 'Male', bloodGroup: 'B-', phone: '+91 99223 34455', disease: 'Viral Fever', doctor: 'Dr. Priya Sen', status: 'Stable', photo: 'https://i.pravatar.cc/100?img=51', admitted: '2026-07-03', ward: 'Pediatrics - P02' },
  { id: 'PT-20487', name: 'Fatima Sheikh', age: 71, gender: 'Female', bloodGroup: 'A+', phone: '+91 97766 55443', disease: 'Stroke Recovery', doctor: 'Dr. Kavita Rao', status: 'Critical', photo: 'https://i.pravatar.cc/100?img=24', admitted: '2026-06-25', ward: 'ICU - 1' },
  { id: 'PT-20488', name: 'Sanjay Gupta', age: 39, gender: 'Male', bloodGroup: 'O+', phone: '+91 98456 12378', disease: 'Appendicitis', doctor: 'Dr. Arjun Verma', status: 'Admitted', photo: 'https://i.pravatar.cc/100?img=68', admitted: '2026-07-04', ward: 'Surgical - S05' },
  { id: 'PT-20489', name: 'Priya Nambiar', age: 29, gender: 'Female', bloodGroup: 'B+', phone: '+91 90998 87766', disease: 'Prenatal Care', doctor: 'Dr. Neha Kapoor', status: 'Stable', photo: 'https://i.pravatar.cc/100?img=41', admitted: '2026-07-02', ward: 'Maternity - M03' },
  { id: 'PT-20490', name: 'Karan Malhotra', age: 50, gender: 'Male', bloodGroup: 'AB-', phone: '+91 91765 43221', disease: 'Kidney Stones', doctor: 'Dr. Priya Sen', status: 'Discharged', photo: 'https://i.pravatar.cc/100?img=59', admitted: '2026-06-20', ward: '—' },
  { id: 'PT-20491', name: 'Divya Reddy', age: 33, gender: 'Female', bloodGroup: 'O+', phone: '+91 99887 12233', disease: 'Migraine', doctor: 'Dr. Rohan Mehta', status: 'Stable', photo: 'https://i.pravatar.cc/100?img=36', admitted: '2026-07-05', ward: 'General - B211' },
  { id: 'PT-20492', name: 'Amitabh Joshi', age: 66, gender: 'Male', bloodGroup: 'A+', phone: '+91 98776 65544', disease: 'COPD', doctor: 'Dr. Kavita Rao', status: 'Admitted', photo: 'https://i.pravatar.cc/100?img=53', admitted: '2026-07-01', ward: 'Pulmonology - PU2' },
]

export const medicalHistory = {
  'PT-20481': [
    { date: '2026-07-05', title: 'Blood pressure check', detail: '142/91 mmHg — slightly elevated, medication adjusted.', type: 'vitals' },
    { date: '2026-07-01', title: 'ECG performed', detail: 'Normal sinus rhythm, no abnormalities detected.', type: 'test' },
    { date: '2026-06-28', title: 'Admitted', detail: 'Admitted for observation of hypertensive episode.', type: 'admission' },
    { date: '2026-06-15', title: 'Prescription renewed', detail: 'Amlodipine 5mg once daily continued.', type: 'medication' },
  ],
}
