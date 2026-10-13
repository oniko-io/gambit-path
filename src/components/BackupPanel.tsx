import { useState } from 'react'
import { exportCode, importCode, PUBLIC_URL, transferLink } from '../lib/backup.ts'

export function BackupPanel() {
  const [code, setCode] = useState('')
  const [pasted, setPasted] = useState('')
  const [message, setMessage] = useState('')
  const online = location.href.startsWith(PUBLIC_URL)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setMessage('Copied.')
    } catch {
      // the clipboard is blocked on plain http: the code stays selectable by hand
      setMessage('Could not copy. Select the code and copy it by hand.')
    }
  }

  const restore = () => {
    if (!confirm('Replace the progress on this device?')) return
    if (importCode(pasted)) location.reload()
    else setMessage('That code is not valid.')
  }

  return (
    <details className="backup">
      <summary>Backup and transfer</summary>
      <p className="muted">Progress is saved only on this device, for this web address.</p>

      {!online && (
        <a className="button primary" href={transferLink()}>
          Move my progress to the online app
        </a>
      )}

      <button onClick={() => setCode(exportCode())}>Show backup code</button>
      {code && (
        <>
          <textarea readOnly value={code} rows={4} onFocus={(e) => e.target.select()} aria-label="Backup code" />
          <button onClick={copy}>Copy code</button>
        </>
      )}

      <textarea
        value={pasted}
        rows={3}
        placeholder="Paste a backup code here"
        aria-label="Backup code to restore"
        onChange={(e) => setPasted(e.target.value)}
      />
      <button onClick={restore} disabled={!pasted.trim()}>
        Restore from code
      </button>

      {message && <p className="muted">{message}</p>}
    </details>
  )
}
