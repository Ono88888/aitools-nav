'use client'

import Image from 'next/image'

interface Props {
  size?: number
  className?: string
}

export default function WukongLogo({ size = 32, className }: Props) {
  return (
    <Image
      src="/wukong-logo.png"
      alt="GO悟空"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      className={className}
    />
  )
}
