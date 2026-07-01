import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function SignaturePad({ onSave, height = 160 }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#F4F4F5'
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e) => {
    const c = canvasRef.current
    const rect = c.getBoundingClientRect()
    const t = e.touches ? e.touches[0] : e
    return { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    setDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasStrokes(true)
  }

  const end = (e) => {
    if (!drawing) return
    e.preventDefault()
    setDrawing(false)
    if (hasStrokes && onSave) {
      onSave(canvasRef.current.toDataURL('image/png'))
    }
  }

  const clear = () => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = c.width / dpr
    const h = c.height / dpr
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#F4F4F5'
    ctx.fillRect(0, 0, w, h)
    setHasStrokes(false)
    if (onSave) onSave(null)
  }

  return (
    <div className="sig-wrap" style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        onMouseDown={start} onMouseMove={draw} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={end}
      />
      {hasStrokes && (
        <button className="sig-clear btn btn-g btn-sm" onClick={clear} type="button">
          <X size={12} /> Clear
        </button>
      )}
      {!hasStrokes && <div className="sig-label">Sign here — draw with finger or mouse</div>}
    </div>
  )
}
