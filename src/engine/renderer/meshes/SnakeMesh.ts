import * as THREE from 'three'
import type { position } from '@/types/translation'

const toThree = (v: number) => v / 30

const HEAD_MAT = new THREE.MeshStandardMaterial({
  color: 0x4fc3f7,
  emissive: 0x1565c0,
  emissiveIntensity: 0.6,
  roughness: 0.25,
  metalness: 0.5
})

export class SnakeMesh {
  private readonly _scene: THREE.Scene
  private readonly _pool: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this._scene = scene
  }

  public update(path: position[]) {
    this._ensurePool(path.length)

    for (let i = 0; i < this._pool.length; i++) {
      const seg = this._pool[i]
      seg.visible = i < path.length

      if (i >= path.length) continue

      const pos = path[i]
      const isHead = i === path.length - 1
      const t = path.length > 1 ? i / (path.length - 1) : 1

      seg.position.set(toThree(pos.x) + 0.5, 0.5, toThree(pos.y) + 0.5)
      seg.rotation.set(0, 0, 0)

      const scale = isHead ? 0.88 : 0.72 + t * 0.08
      seg.scale.setScalar(scale)

      const mat = seg.material as THREE.MeshStandardMaterial
      if (isHead) {
        mat.copy(HEAD_MAT)
      } else {
        mat.color.setHSL(0.57, 0.75, 0.28 + t * 0.18)
        mat.emissive.setHSL(0.6, 1, 0.1)
        mat.emissiveIntensity = t * 0.25
      }
    }
  }

  public flash() {
    const head = this._pool[this._pool.length - 1]
    if (!head || !head.visible) return
    const mat = head.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 1.5
    setTimeout(() => { mat.emissiveIntensity = 0.6 }, 100)
  }

  public explode(path: position[]) {
    for (let i = 0; i < Math.min(path.length, this._pool.length); i++) {
      const seg = this._pool[i]
      if (!seg.visible) continue

      const vx = (Math.random() - 0.5) * 0.25
      const vy = 0.08 + Math.random() * 0.15
      const vz = (Math.random() - 0.5) * 0.25
      let vy_ = vy
      let frame = 0

      const animate = () => {
        if (frame > 40) { seg.visible = false; return }
        seg.position.x += vx
        seg.position.y += vy_
        seg.position.z += vz
        vy_ -= 0.012
        seg.rotation.x += 0.12
        seg.rotation.z += 0.08
        frame++
        requestAnimationFrame(animate)
      }

      setTimeout(() => requestAnimationFrame(animate), i * 18)
    }
  }

  public reset() {
    this._pool.forEach(seg => {
      seg.visible = false
      seg.rotation.set(0, 0, 0)
      seg.scale.setScalar(1)
    })
  }

  public dispose() {
    this._pool.forEach(seg => {
      this._scene.remove(seg)
      seg.geometry.dispose()
      ;(seg.material as THREE.Material).dispose()
    })
    this._pool.length = 0
  }

  private _ensurePool(needed: number) {
    while (this._pool.length < needed) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.3 })
      )
      mesh.castShadow = true
      mesh.receiveShadow = true
      this._scene.add(mesh)
      this._pool.push(mesh)
    }
  }
}
