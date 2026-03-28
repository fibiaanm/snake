import * as THREE from 'three'
import type { position } from '@/types/translation'

const toThree = (v: number) => v / 30

export class CoinMesh {
  private readonly _mesh: THREE.Mesh
  private readonly _light: THREE.PointLight
  private _angle = 0

  constructor(scene: THREE.Scene) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff8c00,
      emissiveIntensity: 0.4,
      roughness: 0.15,
      metalness: 0.95
    })
    this._mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20), mat)
    this._mesh.castShadow = true
    scene.add(this._mesh)

    this._light = new THREE.PointLight(0xffd700, 1.2, 4)
    scene.add(this._light)
  }

  public update(pos: position) {
    this._angle += 0.04
    const x = toThree(pos.x) + 0.5
    const z = toThree(pos.y) + 0.5
    const y = 0.5 + Math.sin(this._angle * 1.5) * 0.12

    this._mesh.position.set(x, y, z)
    this._mesh.rotation.y = this._angle
    this._light.position.set(x, y + 0.6, z)
  }

  public burst() {
    this._mesh.scale.set(1.6, 1.6, 1.6)
    const mat = this._mesh.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 1.0
    setTimeout(() => {
      this._mesh.scale.set(1, 1, 1)
      mat.emissiveIntensity = 0.4
    }, 120)
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this._mesh, this._light)
    this._mesh.geometry.dispose()
    ;(this._mesh.material as THREE.Material).dispose()
  }
}
