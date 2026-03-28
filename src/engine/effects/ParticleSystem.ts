import * as THREE from 'three'
import type { position } from '@/types/translation'

const toThree = (v: number) => v / 30

interface Particle {
  mesh: THREE.Mesh
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
}

const SPHERE_GEO = new THREE.SphereGeometry(0.07, 4, 4)

export class ParticleSystem {
  private readonly _scene: THREE.Scene
  private _active: Particle[] = []

  constructor(scene: THREE.Scene) {
    this._scene = scene
  }

  public burst(pos: position, color = 0xffd700, count = 22) {
    const x = toThree(pos.x) + 0.5
    const z = toThree(pos.y) + 0.5

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.04 + Math.random() * 0.1
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
      const mesh = new THREE.Mesh(SPHERE_GEO, mat)
      mesh.position.set(x, 0.5, z)
      this._scene.add(mesh)
      this._active.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 0.08 + Math.random() * 0.1,
        vz: Math.sin(angle) * speed,
        life: 0,
        maxLife: 28 + Math.floor(Math.random() * 18)
      })
    }
  }

  public deathBurst(path: position[]) {
    path.forEach(pos => this.burst(pos, 0xff3333, 6))
  }

  public update() {
    this._active = this._active.filter(p => {
      p.life++
      p.mesh.position.x += p.vx
      p.mesh.position.y += p.vy
      p.mesh.position.z += p.vz
      p.vy -= 0.007
      const t = p.life / p.maxLife
      ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - t
      p.mesh.scale.setScalar(1 - t * 0.6)

      if (p.life >= p.maxLife) {
        this._scene.remove(p.mesh)
        ;(p.mesh.material as THREE.Material).dispose()
        return false
      }
      return true
    })
  }
}
