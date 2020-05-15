import * as THREE from 'three';
import { TrackballControls } from 'three-trackballcontrols-ts';
import { TopDownCarSim } from './topdowncar';
import { Control, Steer, SimObject, TopDownCarSpec, ObjectSpec } from './carinterface';

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.Renderer, controls: TrackballControls;
let geometry: THREE.BoxGeometry, material: THREE.Material, wheelMaterial: THREE.Material;

let meshes = {
  car: new THREE.Mesh(),
  wheels: [new THREE.Mesh(), new THREE.Mesh(), new THREE.Mesh(), new THREE.Mesh()]
}

let sim: TopDownCarSim;

let control = Control.NONE;
let steer = Steer.NONE;

window.onkeydown = function (ev: KeyboardEvent) {
  if (ev.key == "w") {
    control = Control.FORWARD;
  } else if (ev.key == "s") {
    control = Control.BRAKE;
  }
  if (ev.key == "a") {
    steer = Steer.LEFT;
  } else if (ev.key == "d") {
    steer = Steer.RIGHT;
  }
}

window.onkeyup = function (ev: KeyboardEvent) {
  if (ev.key == "w" || ev.key == "s") {
    control = Control.NONE;
  }
  if (ev.key == "a" || ev.key == "d") {
    steer = Steer.NONE;
  }
}

window.onload = main;

class MeshUpdater implements SimObject {
  constructor(public mesh: THREE.Mesh) { }

  update(pos: { x: number, y: number }, angle: number): void {

    this.mesh.position.x = pos.x;
    this.mesh.position.z = pos.y;

    this.mesh.rotation.x = 0;
    this.mesh.rotation.y = -angle;
    this.mesh.rotation.z = 0;
  }
  deleted(): void {
    this.mesh.remove();
  }
};

function main(): void {
  let spec = new TopDownCarSpec(
    new MeshUpdater(meshes.car),
    [
      new MeshUpdater(meshes.wheels[0]),
      new MeshUpdater(meshes.wheels[1]),
      new MeshUpdater(meshes.wheels[2]),
      new MeshUpdater(meshes.wheels[3])
    ]
  );

  init(spec);

  sim = new TopDownCarSim(spec);

  requestAnimationFrame(animate);
}

function init(config: TopDownCarSpec) {

  let height = Math.min(480, window.innerHeight);
  let width = Math.min(640, window.innerWidth);

  camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
  camera.position.z = 20;
  camera.position.y = 20;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  var helper = new THREE.GridHelper(1, 10);
  helper.scale.x = 100;
  helper.scale.y = 100;
  helper.scale.z = 100;
  scene.add(helper);

  scene.add(new THREE.AmbientLight(0x333333));

  let pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.x = 30;
  pointLight.position.y = 100;
  pointLight.position.z = 30;
  scene.add(pointLight);

  let light = new THREE.HemisphereLight(0x443333, 0x222233, 2);
  light.position.y = 30;
  scene.add(light);

  geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);

  material = new THREE.MeshStandardMaterial({ color: 0x888888 });

  wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222266 });

  let setTransform = (config: ObjectSpec, mesh: THREE.Mesh): void => {
    mesh.scale.x = config.width;
    mesh.scale.y = config.height;
    mesh.scale.z = config.height;

    mesh.position.x = config.position.x;
    mesh.position.y = 0.4;
    mesh.position.z = config.position.y;

    mesh.rotation.x = 0;
    mesh.rotation.y = config.angle;
    mesh.rotation.z = 0;
  };

  meshes.car.geometry = geometry;
  meshes.car.material = material;
  setTransform(config.body, meshes.car);
  meshes.car.position.y += 0.5;
  meshes.car.scale.y = 1;
  scene.add(meshes.car);

  for (let i = 0; i < meshes.wheels.length; i++) {
    let wheelMesh = meshes.wheels[i];
    wheelMesh.geometry = geometry;
    wheelMesh.material = wheelMaterial;

    setTransform(config.wheels[i], wheelMesh);
    scene.add(wheelMesh);
  }

  let rendererParams: THREE.WebGLRendererParameters = { antialias: true };
  renderer = new THREE.WebGLRenderer(rendererParams);
  renderer.setSize(width, height);
  renderer.domElement.classList.add("canvas");

  document.body.appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);
}

let lastTime = undefined;

function animate(time: number) {
  let d = (time - lastTime || 0) / 1000;
  lastTime = time;

  requestAnimationFrame(animate);

  sim.setControl(control);
  sim.setSteer(steer);
  sim.update(d);

  controls.update();

  renderer.render(scene, camera);
}