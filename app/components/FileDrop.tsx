import { useCallback, useRef, useState } from 'react'

interface FileDropProps {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  className?: string
  label?: string
  hint?: string
}

export default function FileDrop({ accept, multiple, onFiles, className = '', label = 'Drop files here or click to upload', hint = 'PDF, images, CSV supported' }: FileDropProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return
      const files = Array.from(list)
      onFiles(files)
    },
    [onFiles]
  )

  return (
    <div
      className={
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors ' +
        (dragOver ? 'bg-muted/50 ' : 'bg-background ') +
        className
      }
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      role="button"
      aria-label="File upload dropzone"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.currentTarget.files)}
      />
      <div className="ty-h2 mb-2">{label}</div>
      <p className="ty-body text-foreground/70">{hint}</p>
    </div>
  )
}

