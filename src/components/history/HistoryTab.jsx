import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function HistoryTab({ events }) {
  if (events.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-[#8E8E93] text-sm">Sin eventos aún. ¡Empieza asignando puntos!</p>
      </div>
    )
  }

  // Group by date
  const grouped = {}
  events.forEach(evt => {
    const day = format(new Date(evt.event_date ?? evt.created_at), 'yyyy-MM-dd')
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(evt)
  })

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-5">
      {sortedDays.map(day => (
        <div key={day}>
          <div className="text-xs font-semibold text-[#6C6C70] uppercase tracking-wider mb-2 px-1">
            {format(new Date(day + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
          </div>
          <div className="space-y-2">
            {grouped[day].map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventCard({ event }) {
  const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: es })

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <img
          src={event.receiver?.avatar_url ?? `https://api.dicebear.com/8.x/notionists/svg?seed=${event.receiver?.username}`}
          alt={event.receiver?.username}
          className="w-9 h-9 rounded-full bg-[#2C2C2E] shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{event.receiver?.username}</span>
            <span className="payo-badge shrink-0">+{event.points} pts</span>
          </div>
          <p className="text-[#8E8E93] text-sm mt-0.5 leading-snug">{event.reason}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <img
              src={event.giver?.avatar_url ?? `https://api.dicebear.com/8.x/notionists/svg?seed=${event.giver?.username}`}
              alt={event.giver?.username}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-xs text-[#6C6C70]">
              de <span className="text-[#8E8E93]">{event.giver?.username}</span>
              {' · '}{timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
