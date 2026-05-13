'use client'

// ── GO悟空 SVG Logo 组件 ─────────────────────────────────────
// 齐天大圣：金箍、橙圆底、英气眉、红领口

interface Props {
  size?: number
  className?: string
}

export default function WukongLogo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GO悟空 Logo"
    >
      {/* 橙色圆底 */}
      <circle cx="60" cy="60" r="56" fill="#D97706"/>
      {/* 头部 */}
      <ellipse cx="60" cy="58" rx="28" ry="30" fill="#F9B84A"/>
      {/* 耳朵 */}
      <ellipse cx="36" cy="42" rx="9" ry="11" fill="#F9B84A"/>
      <ellipse cx="84" cy="42" rx="9" ry="11" fill="#F9B84A"/>
      <ellipse cx="36" cy="42" rx="5.5" ry="7" fill="#E8915A"/>
      <ellipse cx="84" cy="42" rx="5.5" ry="7" fill="#E8915A"/>
      {/* 面部白区 */}
      <ellipse cx="60" cy="66" rx="18" ry="16" fill="#FDEAC8"/>
      {/* 眼白 */}
      <ellipse cx="51" cy="54" rx="6" ry="6.5" fill="white"/>
      <ellipse cx="69" cy="54" rx="6" ry="6.5" fill="white"/>
      {/* 眼珠 */}
      <circle cx="52.5" cy="54.5" r="4" fill="#1a1a1a"/>
      <circle cx="70.5" cy="54.5" r="4" fill="#1a1a1a"/>
      {/* 高光 */}
      <circle cx="54" cy="53" r="1.5" fill="white"/>
      <circle cx="72" cy="53" r="1.5" fill="white"/>
      {/* 眉毛 */}
      <path d="M46 47 Q52 44 57 47" stroke="#7B4A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M63 47 Q68 44 74 47" stroke="#7B4A1A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 鼻子 */}
      <ellipse cx="60" cy="62" rx="3" ry="2" fill="#C67A3A"/>
      {/* 嘴巴 */}
      <path d="M53 68 Q60 74 67 68" stroke="#C67A3A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 金箍 */}
      <rect x="42" y="30" width="36" height="7" rx="3.5" fill="#FFD700" stroke="#D4A800" strokeWidth="0.5"/>
      <rect x="52" y="29" width="16" height="4" rx="2" fill="#FFD700"/>
      <line x1="49" y1="31" x2="49" y2="36" stroke="#D4A800" strokeWidth="0.8" opacity={0.6}/>
      <line x1="56" y1="31" x2="56" y2="36" stroke="#D4A800" strokeWidth="0.8" opacity={0.6}/>
      <line x1="64" y1="31" x2="64" y2="36" stroke="#D4A800" strokeWidth="0.8" opacity={0.6}/>
      <line x1="71" y1="31" x2="71" y2="36" stroke="#D4A800" strokeWidth="0.8" opacity={0.6}/>
      {/* 红色领口 */}
      <path d="M38 86 Q60 96 82 86 L80 105 Q60 115 40 105 Z" fill="#C8410A"/>
      <path d="M48 86 Q60 92 72 86 L70 100 Q60 106 50 100 Z" fill="#E85020"/>
    </svg>
  )
}
