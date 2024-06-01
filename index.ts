import { Clock, Color, DoubleSide, Mesh, MeshBasicMaterial, ModelLoader, PlaneGeometry, SceneControl as Scene, SphereGeometry, Vector3, use } from '@anov/3d-core'
import { Body, Box, ContactMaterial, Material, Plane, Sphere, Vec3, World } from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { ShapeType, threeToCannon } from 'three-to-cannon'

const load = new ModelLoader()

const scene = new Scene({
  orbitControls: {
    use: true,
  },
  defCameraOps: {
    position: new Vector3(10, 10, 10),
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

const world = new World()
world.gravity.set(0, -9.82, 0)

// @ts-expect-error
const cannonDebugger = new CannonDebugger(scene, world, {
  // options...
})

// threejs世界
const planeGeometry = new PlaneGeometry(100, 100)
const material = new MeshBasicMaterial({ color: new Color('#ccc'), side: DoubleSide })

const mesh = new Mesh(
  planeGeometry,
  material,
)

mesh.rotateX(Math.PI / 2)
scene.add(mesh)

const geometry1 = new SphereGeometry(1, 32, 16)
const material1 = new MeshBasicMaterial({ color: 0xFFFF00 })
const sphere = new Mesh(geometry1, material1)
sphere.position.set(0, 0, 0)

scene.add(sphere)

// 物理世界

const concreteMaterial = new Material('concrete')
const plasticMaterial = new Material('plastic')

const sphereShape = new Sphere(1)

const sphereBody = new Body({
  mass: 3,
  position: new Vec3(0, 10, 0),
  shape: sphereShape,
  material: plasticMaterial,
})

// world.addBody(sphereBody)

const planeShape = new Plane()

const planeBody = new Body({
  mass: 0,
  position: new Vec3(0, 0, 0),
  shape: planeShape,
  material: concreteMaterial,
})

const concretePlasticContactMaterial = new ContactMaterial(concreteMaterial, plasticMaterial, {
  friction: 0.1,
  restitution: 0.7,
})

world.addContactMaterial(concretePlasticContactMaterial)

planeBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)

world.addBody(planeBody)

sphereBody.applyLocalForce(new Vec3(20, 0, 200), new Vec3(0, 0, 0))

const clock = new Clock()
let oldElapsedTime = 0

let car
let carBody

load.loadGLTF('./car.glb', false, false, '', (gltf) => {
  car = gltf.scene
  car.position.set(0, 10, 0)

  const boxShape = new Box(
    new Vec3(1, 0.5, 1),
  )

  carBody = new Body({
    mass: 1,
    position: new Vec3(0, 10, 0),
    shape: boxShape,
    material: plasticMaterial,
  })

  scene.add(car)
  world.addBody(carBody)

  return gltf
})

use.useframe(() => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // sphereBody.applyForce(new Vec3(-10.5, 0, 0), sphereBody.position)

  world.step(1 / 60, deltaTime, 3)

  if (car && carBody) {
    car.position.copy(carBody.position as any)
    car.quaternion.copy(carBody.quaternion as any)
  }

  sphere.position.copy(sphereBody.position as any)
  sphere.quaternion.copy(sphereBody.quaternion as any)

  cannonDebugger.update()
})
