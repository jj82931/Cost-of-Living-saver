import React from 'react'

export type IconName = 'check' | 'info' | 'warning' | 'upload' | 'arrow-right'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  className?: string
}

const paths: Record<IconName, React.ReactNode> = {
  check: (
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 8h.01M11 12h2v4h-2z" fill="currentColor" />
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" fill="none" />
    </>
  ),
  'arrow-right': (
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
}

export default function Icon({ name, className = '', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  )
}

