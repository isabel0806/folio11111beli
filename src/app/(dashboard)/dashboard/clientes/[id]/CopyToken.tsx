'use client'

import { useState } from 'react'

export function CopyToken({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs text-gray-400 bg-black/30 rounded px-3 py-2 truncate">{url}</code>
      <button
        onClick={copy}
        className="px-3 py-2 text-xs font-medium bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors shrink-0"
      >
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
