import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const init3D = (dom: HTMLElement) => {
  // 创建场景
  const scene = new THREE.Scene();

  // 添加坐标轴辅助器  500是坐标轴的长度
  const axesHelper = new THREE.AxesHelper(5000);
  scene.add(axesHelper);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  // 设置相机
  const width = window.innerWidth;
  const height = window.innerHeight - 60;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(8000, 8000, 5000);
  camera.lookAt(0, 0, 0);

  // 创建渲染器 开启抗锯齿
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setSize(width, height);
  renderer.setClearColor('lightyellow');

  // 渲染循环
  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render()

  // 将渲染器的 DOM 元素添加到页面
  dom.append(renderer.domElement);

  // 窗口大小调整事件
  window.onresize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // 添加轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);

  return {
    scene
  }
}