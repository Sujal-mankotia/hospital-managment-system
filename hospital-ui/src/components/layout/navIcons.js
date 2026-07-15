import {
  MdOutlineDashboard, MdOutlinePersonOutline, MdOutlineLocalHospital,
  MdOutlineCalendarMonth, MdOutlineScience, MdOutlineMedication,
  MdOutlineReceiptLong, MdOutlineBarChart, MdOutlineSettings, MdLogout,
} from 'react-icons/md'
import { FiUserPlus, FiUsers } from 'react-icons/fi'

export const iconMap = {
  dashboard: MdOutlineDashboard,
  patients: MdOutlinePersonOutline,
  doctors: MdOutlineLocalHospital,
  appointments: MdOutlineCalendarMonth,
  lab: MdOutlineScience,
  pharmacy: MdOutlineMedication,
  billing: MdOutlineReceiptLong,
  reports: MdOutlineBarChart,
  settings: MdOutlineSettings,
  userPlus: FiUserPlus,
  users: FiUsers,
  logout: MdLogout,
}
