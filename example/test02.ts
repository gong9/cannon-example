import { Body, ContactMaterial, Material, Plane, Sphere, Vec3, World } from 'cannon-es'
import { Clock, Color, Mesh, MeshBasicMaterial, PlaneGeometry, SceneControl as Scene, SphereGeometry, Vector3, use } from '@anov/3d-core'

/**
 * @file 关于定义刚体之间的材质
 */

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

const sphereShape = new Sphere(1)

const sphereBody = new Body(
  {
    mass: 1,
    shape: sphereShape,
    position: new Vec3(0, 5, 0),
    material: spherePhyMaterial,
  },
)

world.addBody(sphereBody)
world.addContactMaterial(concretePlasticContactMaterial)

const planeGeomery = new PlaneGeometry(1000, 1000)
const planeMaterial = new MeshBasicMaterial({ color: new Color('#ccc') })
const plane = new Mesh(planeGeomery, planeMaterial)

plane.position.set(0, 0, 0)
plane.rotateX(-Math.PI / 2)
scene.add(plane)

const sphereGeometry = new SphereGeometry(1)
const sphereMaterial = new MeshBasicMaterial({ color: new Color('red'), wireframe: true })

const sphere = new Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(0, 5, 0)
scene.add(sphere)

const clock = new Clock()

use.useframe(() => {
  world.step(clock.getDelta())

  // @ts-expect-error
  sphere.position.copy(sphereBody.position)
  // @ts-expect-error
  sphere.quaternion.copy(sphereBody.quaternion)
})
