import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenueAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F6FDE" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0F6FDE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs ${v / 100000}L`} />
        <Tooltip
          formatter={(v) => [`Rs ${v.toLocaleString('en-IN')}`, 'Revenue']}
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#0F6FDE" strokeWidth={2.5} fill="url(#revFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
