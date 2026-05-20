'use client'
import { useState, useRef } from 'react'
import { Upload, Ruler, ChevronRight, ChevronLeft, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface AvatarStatus {
  status: 'NONE' | 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  metahuman_id?: string
  estimated_ready?: string
  avatar_id?: string
}

interface Props {
  onComplete?: (avatar: AvatarStatus) => void
}

export default function AvatarCreationForm({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [measurements, setMeasurements] = useState({
    body_height: '', body_weight: '', body_chest: '', body_waist: '', body_hips: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AvatarStatus | null>(null)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files).slice(0, 6)
    setPhotos(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    if (photos.length !== 6) { setError('Please upload exactly 6 face photos'); return }
    const { body_height, body_weight, body_chest, body_waist, body_hips } = measurements
    if (!body_height || !body_weight || !body_chest || !body_waist || !body_hips) {
      setError('All measurements are required'); return
    }
    setError('')
    setSubmitting(true)
    try {
      const form = new FormData()
      photos.forEach(p => form.append('photos', p))
      Object.entries(measurements).forEach(([k, v]) => form.append(k, v))
      const res = await api.postForm<AvatarStatus>('/api/avatars', form)
      setResult(res)
      onComplete?.(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="glass p-8 rounded-2xl text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-brand-400 animate-pulse-slow" />
        </div>
        <h2 className="text-xl font-bold text-white">Avatar in Progress!</h2>
        <p className="text-white/60">Your MetaHuman is being created. This usually takes a few seconds in demo mode.</p>
        <p className="text-xs text-white/30">Avatar ID: {result.avatar_id}</p>
      </div>
    )
  }

  return (
    <div className="glass p-6 md:p-8 rounded-2xl space-y-6 animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step === s ? 'bg-brand-500 text-white' : step > s ? 'bg-brand-500/30 text-brand-300' : 'bg-white/10 text-white/40'}`}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm ${step === s ? 'text-white' : 'text-white/40'}`}>
              {s === 1 ? 'Upload Photos' : 'Measurements'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Photos */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-1">Upload 6 Face Photos</h3>
            <p className="text-sm text-white/40">Front, left, right, 3/4 angles — clear lighting</p>
          </div>

          <div
            id="photo-drop-zone"
            onClick={() => fileInput.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            className="border-2 border-dashed border-white/10 hover:border-brand-400/50 rounded-xl p-8
                       flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 group"
          >
            <Upload className="w-8 h-8 text-white/30 group-hover:text-brand-400 transition-colors" />
            <p className="text-white/50 text-sm">Drag & drop or click to select</p>
            <p className="text-white/25 text-xs">Exactly 6 photos required • JPG/PNG</p>
            <input ref={fileInput} type="file" multiple accept="image/*" className="hidden"
              onChange={e => handleFiles(e.target.files)} />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative">
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/60 rounded text-xs text-white/60 px-1">{i + 1}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {photos.length === 6
              ? <CheckCircle className="w-4 h-4 text-green-400" />
              : <AlertCircle className="w-4 h-4 text-white/30" />}
            <span className="text-sm text-white/50">{photos.length}/6 photos selected</span>
          </div>

          <button
            id="avatar-step1-next"
            onClick={() => photos.length === 6 ? setStep(2) : setError('Upload exactly 6 photos')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 — Measurements */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-brand-400" /> Body Measurements
            </h3>
            <p className="text-sm text-white/40">Used to fit outfits to your avatar correctly</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'body_height', label: 'Height (cm)', placeholder: '175' },
              { key: 'body_weight', label: 'Weight (kg)', placeholder: '70' },
              { key: 'body_chest',  label: 'Chest (cm)',  placeholder: '95' },
              { key: 'body_waist',  label: 'Waist (cm)',  placeholder: '80' },
              { key: 'body_hips',   label: 'Hips (cm)',   placeholder: '96' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className={key === 'body_hips' ? 'col-span-2' : ''}>
                <label className="block text-xs text-white/50 mb-1">{label}</label>
                <input
                  id={`avatar-${key}`}
                  type="number"
                  placeholder={placeholder}
                  value={(measurements as any)[key]}
                  onChange={e => setMeasurements(m => ({ ...m, [key]: e.target.value }))}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              id="avatar-step2-back"
              onClick={() => setStep(1)}
              className="btn-ghost flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              id="avatar-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Create My Avatar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
