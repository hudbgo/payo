export default function RankingTab({ scores, currentUserId }) {
  if (scores.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-3">🏁</div>
        <p className="text-[#8E8E93] text-sm">Sin miembros aún. Invita a tus amigos.</p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-3">
      {/* Podium top 3 */}
      {scores.length >= 3 && (
        <div className="card p-5 mb-2">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <PodiumPerson member={scores[1]} position={2} />
            {/* 1st */}
            <PodiumPerson member={scores[0]} position={1} isTop />
            {/* 3rd */}
            <PodiumPerson member={scores[2]} position={3} />
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {scores.map((member, idx) => {
          const isMe = member.id === currentUserId
          const isTop3 = idx < 3

          return (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                isMe ? 'bg-accent/10 border border-accent/20' : 'card'
              } ${isTop3 ? 'border border-payellow/20' : ''}`}
            >
              {/* Position */}
              <div className="w-8 text-center shrink-0">
                {idx < 3 ? (
                  <span className="text-xl">{medals[idx]}</span>
                ) : (
                  <span className="text-sm font-bold text-[#6C6C70]">#{idx + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <img
                src={member.avatar_url ?? `https://api.dicebear.com/8.x/notionists/svg?seed=${member.username}`}
                alt={member.username}
                className="w-9 h-9 rounded-full bg-[#2C2C2E] shrink-0"
              />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold truncate">{member.username}</span>
                  {isMe && <span className="text-xs text-accent font-medium">(tú)</span>}
                </div>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <div className={`font-bold font-mono text-lg ${idx === 0 ? 'text-payellow' : 'text-[#F2F2F7]'}`}>
                  {member.score}
                </div>
                <div className="text-xs text-[#6C6C70]">pts</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PodiumPerson({ member, position, isTop = false }) {
  const heights = { 1: 'h-16', 2: 'h-12', 3: 'h-10' }
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className={`flex flex-col items-center gap-1 ${isTop ? 'animate-float' : ''}`}>
      <img
        src={member.avatar_url ?? `https://api.dicebear.com/8.x/notionists/svg?seed=${member.username}`}
        alt={member.username}
        className={`rounded-full bg-[#2C2C2E] ${isTop ? 'w-14 h-14 border-2 border-payellow' : 'w-10 h-10'}`}
      />
      <span className="text-xl">{medals[position]}</span>
      <span className="text-xs font-semibold text-center max-w-[72px] truncate">{member.username}</span>
      <span className={`font-bold font-mono ${isTop ? 'text-payellow text-sm' : 'text-xs text-[#8E8E93]'}`}>
        {member.score} pts
      </span>
      <div className={`${heights[position]} w-12 rounded-t-xl ${
        position === 1 ? 'bg-payellow/20 border border-payellow/30' :
        position === 2 ? 'bg-[#C0C0C0]/10 border border-white/10' :
        'bg-[#CD7F32]/10 border border-[#CD7F32]/20'
      }`} />
    </div>
  )
}
