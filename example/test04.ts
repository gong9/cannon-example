import { Body, ContactMaterial, Material, Plane, Vec3, World } from 'cannon-es'
import { Clock, Color, Mesh, MeshBasicMaterial, ModelLoader, PlaneGeometry, SceneControl as Scene, SphereGeometry, Vector3, use } from '@anov/3d-core'
import CannonDebugger from 'cannon-es-debugger'
import { ShapeType, threeToCannon } from 'three-to-cannon'

/**
 *@file 复杂glb的优化
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
  restitution: 0.5,
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

let car
let carBody: Body

load.loadGLTF('./car.glb', false, false, '', (gltf) => {
  car = gltf.scene

  scene.add(car)

  const result = threeToCannon(car, { type: ShapeType.BOX })

  carBody = new Body(
    {
      mass: 1,
      position: new Vec3(0, 5, 0),
      material: spherePhyMaterial,
    },
  )

  carBody.addShape(result!.shape, result!.offset)

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
