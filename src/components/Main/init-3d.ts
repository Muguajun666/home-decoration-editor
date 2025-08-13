import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const init3D = (dom: HTMLElement, wallsVisibilityCalc: () => void) => {
  // 创建场景
  const scene = new THREE.Scene();

  // 添加坐标轴辅助器  500是坐标轴的长度
  // const axesHelper = new THREE.AxesHelper(5000);
  // scene.add(axesHelper);

  // 添加网格辅助器
  const gridHelper = new THREE.GridHelper(100000, 500, "white", "white");
  gridHelper.position.y = -100;
  scene.add(gridHelper);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 1500, 0);
  scene.add(directionalLight);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);

  // 设置相机
  const width = window.innerWidth;
  const height = window.innerHeight - 60;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
  camera.position.set(8000, 8000, 5000);
  camera.lookAt(0, 0, 0);

  // 创建渲染器 开启抗锯齿
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor("skyblue");

  // 渲染循环
  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);

    // wallsVisibilityCalc();
  }

  render();

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
  const controls = new OrbitControls(camera, renderer.domElement);

  const edges: Array<THREE.Line> = [];
  renderer.domElement.addEventListener("click", (e) => {
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;
    // 创建射线
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    // 获取射线与场景的交点
    const intersections = rayCaster.intersectObjects(scene.children);

    console.log({intersections});

    // 删除之前的边
    edges.forEach((item) => {
      item.parent?.remove(item);
    });

    // 如果射线与场景有交点
    if (intersections.length > 0) {
      const obj = intersections[0].object as THREE.Mesh;

      // 如果交点是网格
      if (obj.isMesh) {
        const geometry = new THREE.EdgesGeometry(obj.geometry);
        const material = new THREE.LineBasicMaterial({ color: "blue" });

        const line = new THREE.LineSegments(geometry, material);

        obj.add(line);
        edges.push(line);
      }
    }
  });

  return {
    scene,
    camera,
  };
};
