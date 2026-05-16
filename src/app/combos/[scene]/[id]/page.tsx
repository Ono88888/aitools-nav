import { getCombos, SCENE_LABELS } from '@/lib/combos-data'
import ComboDetailClient from './ComboDetailClient'

// 所有场景和combo ID的静态路径
const SCENES = ['video','wechat','ecommerce','dev','painting','podcast','writing','ppt','music','knowledge','livestream','agent']

export function generateStaticParams() {
  const params: { scene: string; id: string }[] = []
  for (const scene of SCENES) {
    const combos = getCombos(scene)
    for (const combo of combos) {
      params.push({ scene, id: combo.id })
    }
  }
  return params
}

export default function ComboPage({ params }: { params: { scene: string; id: string } }) {
  const { scene, id } = params
  const combos = getCombos(scene)
  const combo = combos.find(c => c.id === id)
  const sceneLabel = SCENE_LABELS[scene] || scene

  if (!combo) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>方案未找到</div>
  }

  return <ComboDetailClient combo={combo} scene={scene} sceneLabel={sceneLabel} allCombos={combos} />
}
