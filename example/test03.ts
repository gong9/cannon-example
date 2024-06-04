import { Body, ContactMaterial, Material, Plane, Sphere, Trimesh, Vec3, World } from 'cannon-es'
import { Clock, Color, Mesh, MeshBasicMaterial, ModelLoader, PlaneGeometry, SceneControl as Scene, SphereGeometry, Vector3, use } from '@anov/3d-core'
import CannonDebugger from 'cannon-es-debugger'

/**
 *@file 高级shape
 */

const load = new ModelLoader()

const scene = new Scene({
  orbitControls: {
    use: true,
  },
  defCameraOps: {
    position: new Vector3(0, 10, 10),
    far: 1000000,
  },
  rendererOps: {
    shadowMap: true,
    alpha: true,
  },
  reset: true,
  ambientLight: true,

})

scene.render(document.querySelector('#app')!)

const world = new World({
  gravity: new Vec3(0, -9.82, 0),
})

// @ts-expect-error
const cannonDebugger = new CannonDebugger(scene, world)

// 创建物理材质
const planePhyMaterial = new Material()
const spherePhyMaterial = new Material()

// 物理材质之间的相互关系
const concretePlasticContactMaterial = new ContactMaterial(planePhyMaterial, spherePhyMaterial, {
  restitution: 1,
  friction: 0.1,
})

const planeShape = new Plane()

const planeBody = new Body({
  mass: 0,
  position: new Vec3(0, 0, 0),
  shape: planeShape,
  material: planePhyMaterial,
})

planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

const trimeshArray: Trimesh[] = []
const trimeshPoistionArray: Vector3[] = []

let car
let carBody: Body

load.loadGLTF('./car.glb', false, false, '', (gltf) => {
  car = gltf.scene

  const modelWorldPosition = new Vector3()
  car.getWorldPosition(modelWorldPosition)

  car.traverse((child) => {
    if (child.type === 'Mesh') {
      const worldPosition = new Vector3()
      child.getWorldPosition(worldPosition)

      const trimesh = new Trimesh(child.geometry.attributes.position.array, child.geometry.index.array)
      trimeshArray.push(trimesh)
      trimeshPoistionArray.push(worldPosition.sub(modelWorldPosition))
    }
  })

  // scene.add(car)

  carBody = new Body(
    {
      mass: 1,
      position: new Vec3(0, 5, 0),
      material: spherePhyMaterial,
    },
  )

  for (let i = 0; i < trimeshArray.length; i++)
    carBody.addShape(trimeshArray[i], new Vec3(trimeshPoistionArray[i].x, trimeshPoistionArray[i].y, trimeshPoistionArray[i].z))

  world.addBody(carBody)

  return gltf
})

world.addContactMaterial(concretePlasticContactMaterial)

const planeGeomery = new PlaneGeometry(1000, 1000)
const planeMaterial = new MeshBasicMaterial({ color: new Color('#ccc') })
const plane = new Mesh(planeGeomery, planeMaterial)

plane.position.set(0, 0, 0)
plane.rotateX(-Math.PI / 2)
scene.add(plane)

const clock = new Clock()

use.useframe(() => {
  world.step(clock.getDelta())

  car && car.position.copy(carBody.position)
  car && car.quaternion.copy(carBody.quaternion)
  cannonDebugger.update()
})
