import { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'

export default function InviteModal({ payometer, onClose }) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const inviteUrl = `${window.location.origin}/join/${payometer.invite_code}`

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyCode() {
    await navigator.clipboard.writeText(payometer.invite_code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: `Únete a ${payometer.name} en Payómetro`,
        text: `Compite por ser el más payo en "${payometer.name}"`,
        url: inviteUrl,
      })
    } else {
      copyLink()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 animate-slide-up mx-0 sm:mx-4">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#3A3A3C] rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Invitar al Payómetro</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#2C2C2E] text-[#6C6C70] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Invite link */}
          <div>
            <label className="label">Enlace de invitación</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="input-field text-xs flex-1 min-w-0"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 px-3 rounded-xl transition-all duration-200 ${
                  copied ? 'bg-green-500/20 text-green-400' : 'bg-[#3A3A3C] text-[#F2F2F7] hover:bg-[#4A4A4E]'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Invite code */}
          <div>
            <label className="label">Código de invitación</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#2C2C2E] border border-white/10 rounded-xl px-4 py-3 font-mono font-bold text-2xl text-center tracking-[0.3em] text-payellow">
                {payometer.invite_code}
              </div>
              <button
                onClick={copyCode}
                className={`shrink-0 px-3 py-3 rounded-xl transition-all duration-200 ${
                  copiedCode ? 'bg-green-500/20 text-green-400' : 'bg-[#3A3A3C] text-[#F2F2F7] hover:bg-[#4A4A4E]'
                }`}
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-[#6C6C70] mt-1.5">Tus amigos entran en /join/CÓDIGO</p>
          </div>

          <button onClick={shareNative} className="btn-primary w-full">
            Compartir invitación
          </button>
        </div>
      </div>
    </div>
  )
}
