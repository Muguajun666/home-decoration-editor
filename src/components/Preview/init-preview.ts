import * as THREE from "three";
import { FlyControls, OrbitControls, RGBELoader } from "three/examples/jsm/Addons.js";

export const initPreviewScene = (dom: HTMLElement) => {
  const scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(5000);
  scene.add(axesHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(1000, 2000, 500);
  // camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);

  // const controls = new OrbitControls(camera, renderer.domElement);

  // 飞行控制器
  const controls = new FlyControls(camera, renderer.domElement);
  // 移动速度
  controls.movementSpeed = 1000;
  // 旋转速度
  controls.rollSpeed = Math.PI / 6;

  // 时钟
  const clock = new THREE.Clock();

  function render() {
    // 更新控制器
    controls.update(clock.getDelta());

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  const rgbeLoader = new RGBELoader();

  rgbeLoader.load("./pic.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
  });

  dom.append(renderer.domElement);

  window.onresize = function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  return {
    scene,
    camera,
    controls,
  };
};
