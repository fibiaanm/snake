import * as THREE from 'three'
import type { WallCell } from '@/engine/walls'

const WALL_MAT = new THREE.MeshStandardMaterial({
  color: 0x546e7a,
  emissive: 0x263238,
  emissiveIntensity: 0.4,
  roughness: 0.5,
  metalness: 0.6
})

export class WallMesh {
  private readonly _scene: THREE.Scene
  private _meshes: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this._scene = scene
  }

  public update(walls: WallCell[][]) {
    this._clear()

    walls.forEach(cells => {
      const xs = cells.map(c => c.x)
      const ys = cells.map(c => c.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minY = Math.min(...ys), maxY = Math.max(...ys)

      const w = (maxX - minX + 1)
      const d = (maxY - minY + 1)

      // Thin wall: whichever axis is 1 cell gets reduced to 0.3 visually
      const vw = w === 1 ? 0.3 : w
      const vd = d === 1 ? 0.3 : d

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(vw, 0.32, vd),
        WALL_MAT.clone()
      )
      mesh.position.set(
        minX + w / 2 - 0.5,
        0.16,
        minY + d / 2 - 0.5
      )
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.scale.y = 0
      this._scene.add(mesh)
      this._meshes.push(mesh)
      this._animateIn(mesh)
    })
  }

  private _animateIn(mesh: THREE.Mesh) {
    let t = 0
    const step = () => {
      t = Math.min(t + 0.07, 1)
      mesh.scale.y = t
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  private _clear() {
    this._meshes.forEach(m => {
      this._scene.remove(m)
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    })
    this._meshes = []
  }

  public dispose() { this._clear() }
}
