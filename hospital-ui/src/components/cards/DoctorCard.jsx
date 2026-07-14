import { motion } from 'framer-motion'
import { FiEye, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'

export default function DoctorCard({ doctor, onView, onEdit, onDelete }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <Avatar src={doctor.photo} name={doctor.name} size="lg" ring />
        <Badge>{doctor.availability}</Badge>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink">{doctor.name}</h3>
      <p className="text-xs text-primary">{doctor.department}</p>
      <p className="mt-1 id-tag">{doctor.id}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-amber">
        <FiStar className="fill-amber" size={13} /> {doctor.rating} <span className="text-slate-light">- {doctor.experience}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-slate">
        <span>{doctor.patients} patients</span>
        <div className="flex items-center gap-1">
          <button onClick={onView} className="rounded-lg p-1.5 hover:bg-primary-light hover:text-primary" title="View profile"><FiEye size={14} /></button>
          <button onClick={onEdit} className="rounded-lg p-1.5 hover:bg-primary-light hover:text-primary" title="Edit"><FiEdit2 size={14} /></button>
          <button onClick={onDelete} className="rounded-lg p-1.5 hover:bg-rose-light hover:text-rose" title="Delete"><FiTrash2 size={14} /></button>
        </div>
      </div>
    </motion.div>
  )
}
