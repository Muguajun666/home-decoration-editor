import * as THREE from "three";
import { MapControls } from "three/examples/jsm/Addons.js";

export const init2D = (dom: HTMLElement) => {
  // 创建场景
  const scene = new THREE.Scene();

  // 添加坐标轴辅助器  500是坐标轴的长度
  const axesHelper = new THREE.AxesHelper(50000);
  scene.add(axesHelper);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  // 设置相机
  const width = window.innerWidth;
  const height = window.innerHeight - 60;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(0, 10000, 0);
  camera.lookAt(0, 0, 0);

  // 创建渲染器 开启抗锯齿
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor("lightblue");

  // 将渲染器的 DOM 元素添加到页面
  dom.append(renderer.domElement);

  // 窗口大小调整事件
  window.onresize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // 添加轨道控制器
  const controls = new MapControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.target.set(200, 0, -100);

  // controls.addEventListener("change", () => {
  //   console.log(controls.target, camera.position);
  // });

  // 渲染循环
  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  return {
    scene,
  };
};
