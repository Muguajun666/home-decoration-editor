import * as THREE from "three";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { Action } from "../../store";

export const init2D = (
  dom: HTMLElement,
  updateFurniture: Action["updateFurniture"],
  setCurSelectedFurniture: Action["setCurSelectedFurniture"]
) => {
  // 创建场景
  const scene = new THREE.Scene();

  // 添加坐标轴辅助器  500是坐标轴的长度
  // const axesHelper = new THREE.AxesHelper(50000);
  // scene.add(axesHelper);

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
  camera.position.set(0, 10000, 0);
  camera.lookAt(0, 0, 0);

  // 创建渲染器 开启抗锯齿
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setClearColor("lightblue");

  // 添加轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;

  // 添加变换控制器
  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.showY = false;

  const transformHelper = transformControls.getHelper();
  scene.add(transformHelper);

  transformControls.addEventListener("dragging-changed", (e) => {
    // 当变换控制器拖拽时，禁用轨道控制器
    controls.enabled = !e.value;
  });

  transformControls.addEventListener("change", (e) => {
    const obj = transformControls.object;

    if (obj) {
      if (transformControls.mode === "translate") {
        updateFurniture(
          obj.name,
          "position",
          new THREE.Vector3(-obj.position.x, -obj.position.y, -obj.position.z)
        );
      } else if (transformControls.mode === "rotate") {
        updateFurniture(
          obj.name,
          "rotation",
          new THREE.Vector3(obj.rotation.x, obj.rotation.y, obj.rotation.z)
        );
      }
    }
  });

  // 将渲染器的 DOM 元素添加到页面
  dom.append(renderer.domElement);

  // 窗口大小调整事件
  window.onresize = () => {
    // 如果窗口高度为200，则不进行调整
    const size = renderer.getSize(new THREE.Vector2());
    if (size.y === 200) return;

    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // controls.target.set(200, 0, -100);

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

  renderer.domElement.addEventListener("click", (e) => {
    const { x: width, y: height } = renderer.getSize(new THREE.Vector2());

    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;
    // 创建射线
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const furnitures = scene.getObjectByName("furnitures")!;
    // 获取射线与家具的交点
    const intersections2 = rayCaster.intersectObjects(furnitures.children);

    if (intersections2.length > 0) {
      const obj = intersections2[0].object as any;
      if (obj.target) {
        transformControls.attach(obj.target);
        setCurSelectedFurniture(obj.target.name);
      }
    } else {
      transformControls.detach();
      setCurSelectedFurniture("");
    }
  });

  const changeMode = (isTranslate: boolean) => {
    if (isTranslate) {
      transformControls.mode = "translate";
      transformControls.showX = true;
      transformControls.showZ = true;
      transformControls.showY = false;
    } else {
      transformControls.mode = "rotate";
      transformControls.showX = false;
      transformControls.showZ = false;
      transformControls.showY = true;
    }
  };

  const changeSize = (isBig: boolean) => {
    if (isBig) {
      const width = window.innerWidth;
      const height = window.innerHeight - 60;

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else {
      const width = 240;
      const height = 200;

      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const detachTransformControls = () => {
    transformControls.detach();
  }

  return {
    scene,
    changeMode,
    changeSize,
    detachTransformControls,
  };
};
