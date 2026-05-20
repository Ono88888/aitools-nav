import { getCombos, SCENE_LABELS, COMBOS_DB } from '@/lib/combos-data'
import ComboDetailClient from './ComboDetailClient'

// 所有场景和combo ID的静态路径
export function generateStaticParams() {
  const params: { scene: string; id: string }[] = []
  const sceneKeys = Object.keys(COMBOS_DB)
  
  for (const scene of sceneKeys) {
    const combos = getCombos(scene)
    for (const combo of combos) {
      params.push({ scene, id: combo.id })
    }
  }
  return params
}

export default function ComboPage({ params }: { params: { scene: string; id: string } }) {
  let { scene, id } = params
  
  // 兼容逻辑：如果传入的是中文标签，尝试转回 key
  if (!COMBOS_DB[scene]) {
    const matchedKey = Object.entries(SCENE_LABELS).find(([_, label]) => label === decodeURIComponent(scene))?.[0]
    if (matchedKey) scene = matchedKey
  }

  const combos = getCombos(scene)
  const combo = combos.find(c => c.id === id)
  const sceneLabel = SCENE_LABELS[scene] || scene

  if (!combo) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>方案未找到</div>
  }

  return <ComboDetailClient combo={combo} scene={scene} sceneLabel={sceneLabel} allCombos={combos} />
}
