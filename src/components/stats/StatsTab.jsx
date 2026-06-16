import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, subDays, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2C2C2E] border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
        <p className="text-[#8E8E93]">{label}</p>
        <p className="font-bold text-payellow">{payload[0].value} pts</p>
      </div>
    )
  }
  return null
}

export default function StatsTab({ events, scores }) {
  const stats = useMemo(() => {
    const totalPoints = events.reduce((sum, e) => sum + e.points, 0)
    const topPayo = scores[0] ?? null
    const leastPayo = scores.length > 0 ? scores[scores.length - 1] : null

    // Weekly activity (last 7 days)
    const today = new Date()
    const weekDays = eachDayOfInterval({ start: subDays(today, 6), end: today })
    const weeklyData = weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const pts = events
        .filter(e => {
          const d = format(new Date(e.event_date ?? e.created_at), 'yyyy-MM-dd')
          return d === dayStr
        })
        .reduce((sum, e) => sum + e.points, 0)
      return { day: format(day, 'EEE', { locale: es }), pts }
    })

    // Monthly activity (last 30 days grouped by week)
    const monthDays = eachDayOfInterval({ start: subDays(today, 29), end: today })
    const weeklyGrouped = {}
    monthDays.forEach(day => {
      const week = format(startOfWeek(day, { locale: es }), 'dd/MM')
      const pts = events
        .filter(e => format(new Date(e.event_date ?? e.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.points, 0)
      weeklyGrouped[week] = (weeklyGrouped[week] ?? 0) + pts
    })
    const monthlyData = Object.entries(weeklyGrouped).map(([week, pts]) => ({ week, pts }))

    // Top givers
    const giverMap = {}
    events.forEach(e => {
      if (!e.giver) return
      giverMap[e.giver.username] = (giverMap[e.giver.username] ?? 0) + e.points
    })
    const topGivers = Object.entries(giverMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, pts]) => ({ username, pts }))

    return { totalPoints, topPayo, leastPayo, weeklyData, monthlyData, topGivers }
  }, [events, scores])

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard emoji="🏆" label="Más payo" value={stats.topPayo?.username ?? '—'} sub={`${stats.topPayo?.score ?? 0} pts`} highlight />
        <StatCard emoji="😇" label="Menos payo" value={stats.leastPayo?.username ?? '—'} sub={`${stats.leastPayo?.score ?? 0} pts`} />
        <StatCard emoji="⚡" label="Puntos totales" value={stats.totalPoints} sub="acumulados" />
        <StatCard emoji="📋" label="Eventos" value={events.length} sub="registrados" />
      </div>

      {/* Weekly activity */}
      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-4">Actividad esta semana</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={stats.weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fill: '#6C6C70', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6C6C70', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,214,10,0.05)' }} />
            <Bar dataKey="pts" fill="#FFD60A" opacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend */}
      <div className="card p-4">
        <h3 className="font-semibold text-sm mb-4">Tendencia mensual</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={stats.monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fill: '#6C6C70', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6C6C70', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="pts" stroke="#FF3B30" strokeWidth={2} dot={{ fill: '#FF3B30', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top givers */}
      {stats.topGivers.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3">Quién más puntúa</h3>
          <div className="space-y-2">
            {stats.topGivers.map(({ username, pts }, i) => (
              <div key={username} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6C6C70] w-4">#{i + 1}</span>
                  <img
                    src={`https://api.dicebear.com/8.x/notionists/svg?seed=${username}`}
                    className="w-6 h-6 rounded-full bg-[#3A3A3C]"
                    alt={username}
                  />
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <span className="payo-badge">{pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ emoji, label, value, sub, highlight = false }) {
  return (
    <div className={`card p-4 ${highlight ? 'border border-payellow/20' : ''}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xs text-[#6C6C70] mb-1">{label}</div>
      <div className={`font-bold text-lg leading-tight truncate ${highlight ? 'text-payellow' : 'text-[#F2F2F7]'}`}>
        {value}
      </div>
      <div className="text-xs text-[#6C6C70] mt-0.5">{sub}</div>
    </div>
  )
}
