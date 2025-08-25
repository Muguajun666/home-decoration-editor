import { useEffect, useRef, useState } from "react";
import { init3D } from "./init-3d";
import { init2D } from "./init-2d";
import { Button } from "antd";
import * as THREE from "three";
import { State, useHouseStore } from "../../store";
import {
  DRACOLoader,
  GLTFLoader,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import SpriteText from "three-spritetext";
import { useDrop } from "react-dnd";
import { modelMap } from "../../App";

let loaderCache: GLTFLoader;

export const getGLTFLoader = () => {
  if (!loaderCache) {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    gltfLoader.setDRACOLoader(dracoLoader);
    loaderCache = gltfLoader;
  }
  return loaderCache;
};

export const loadWindow = async () => {
  const group = new THREE.Group();
  const gltf = await modelMap["./window.glb"];
  gltf.scene = gltf.scene.clone();
  group.add(gltf.scene);

  const box = new THREE.Box3().expandByObject(gltf.scene);

  const size = box.getSize(new THREE.Vector3());
  return {
    model: group,
    size,
  };
};

export const loadDoor = async () => {
  const group = new THREE.Group();
  const gltf = await modelMap["./door.glb"];
  gltf.scene = gltf.scene.clone();
  group.add(gltf.scene);

  const box = new THREE.Box3().expandByObject(gltf.scene);

  const size = box.getSize(new THREE.Vector3());
  return {
    model: group,
    size,
  };
};

const textureLoader = new THREE.TextureLoader();
export const floorTexture = textureLoader.load("./floor-texture.png");
floorTexture.colorSpace = THREE.SRGBColorSpace;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(0.002, 0.002);

function Main() {
  const scene3DRef = useRef<THREE.Scene>(null);
  const scene2DRef = useRef<THREE.Scene>(null);
  const camera3DRef = useRef<THREE.Camera>(null);
  const changeModeRef = useRef<(isTranslate: boolean) => void>(null);
  const changeMode2DRef = useRef<(isTranslate: boolean) => void>(null);
  const changeSizeRef = useRef<(isBig: boolean) => void>(null);
  const changeSize2DRef = useRef<(isBig: boolean) => void>(null);
  const controlsRef = useRef<OrbitControls>(null);
  const detachTransformControls3DRef = useRef<() => void>(null);
  const detachTransformControls2DRef = useRef<() => void>(null);

  const [curMode, setCurMode] = useState("2d");

  const {
    data,
    updateFurniture,
    addFurniture,
    setCurSelectedFurniture,
    removeFurniture,
    curSelectedFurniture,
  } = useHouseStore();

  // 动态获取data 避免闭包问题
  const dataRef = useRef<State["data"]>(null);
  dataRef.current = data;

  // 计算法线与相机夹角
  const wallsVisibilityCalc = () => {
    const camera = camera3DRef.current!;
    const scene = scene3DRef.current!;

    if (!camera) {
      return;
    }

    dataRef.current!.walls.forEach((item, index) => {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const wallDirection = new THREE.Vector3(
        item.normal.x,
        item.normal.y,
        item.normal.z
      );

      const obj = scene?.getObjectByName("wall" + index);

      // 如果墙的法线与相机方向夹角小于90度，则墙不可见
      if (wallDirection.dot(cameraDirection) > 0) {
        obj!.visible = false;
      } else {
        obj!.visible = true;
      }
    });
  };

  // 删除选中的家具
  useEffect(() => {
    const scene = scene3DRef.current!;
    const scene2d = scene2DRef.current!;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (curSelectedFurniture) {
          const furniture = scene.getObjectByName(curSelectedFurniture.id);

          if (furniture) {
            furniture.parent?.remove(furniture);
            removeFurniture(furniture.name);
            setCurSelectedFurniture("");
            detachTransformControls3DRef.current!();
          }

          const furniture2d = scene2d.getObjectByName(curSelectedFurniture.id);
          if (furniture2d) {
            furniture2d.parent?.remove(furniture2d);
            detachTransformControls2DRef.current!();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [curSelectedFurniture]);

  useEffect(() => {
    const dom = document.getElementById("threejs-3d-container")!;
    const {
      scene,
      camera,
      changeMode,
      changeSize,
      controls,
      detachTransformControls,
    } = init3D(
      dom,
      wallsVisibilityCalc,
      updateFurniture,
      setCurSelectedFurniture
    );

    scene3DRef.current = scene;
    camera3DRef.current = camera;
    changeModeRef.current = changeMode;
    changeSizeRef.current = changeSize;
    controlsRef.current = controls;
    detachTransformControls3DRef.current = detachTransformControls;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const changeSize3D = changeSizeRef.current!;

    changeSize3D(false);
  }, []);

  useEffect(() => {
    const scene2d = scene2DRef.current!;
    const scene3d = scene3DRef.current!;
    const house2d = scene2d?.getObjectByName("house");
    const house3d = scene3d?.getObjectByName("house");

    // 更新家具情况
    if (data.walls.length) {
      return;
    }

    house2d?.parent?.remove(house2d);
    house3d?.parent?.remove(house3d);

    // 释放2d场景的内存
    house2d?.traverse((child) => {
      const obj = child as THREE.Mesh;
      if (obj.isMesh) {
        obj.geometry.dispose();
      }
    });
    // 释放3d场景的内存
    house3d?.traverse((child) => {
      const obj = child as THREE.Mesh;
      if (obj.isMesh) {
        obj.geometry.dispose();
      }
    });
  }, [data]);

  useEffect(() => {
    const house = new THREE.Group();
    const scene = scene3DRef.current!;

    if (!data.walls.length) {
      return;
    }

    // house存在的情况 只更新家具
    const houseObj = scene.getObjectByName("house");
    if (houseObj) {
      data.furnitures.forEach((item) => {
        const obj = houseObj.getObjectByName(item.id);

        if (obj) {
          // 更新家具位置
          obj.position.set(item.position.x, item.position.y, item.position.z);
          obj.rotation.x = item.rotation.x;
          obj.rotation.y = item.rotation.y;
          obj.rotation.z = item.rotation.z;
        } else {
          // 添加家具
          const furnitures = houseObj.getObjectByName("furnitures")!;

          modelMap[item.modelUrl].then((gltf) => {
            gltf.scene = gltf.scene.clone();

            furnitures.add(gltf.scene);

            gltf.scene.scale.setScalar(item.modelScale || 1);

            gltf.scene.position.set(
              item.position.x,
              item.position.y,
              item.position.z
            );
            gltf.scene.rotation.x = item.rotation.x;
            gltf.scene.rotation.y = item.rotation.y;
            gltf.scene.rotation.z = item.rotation.z;

            gltf.scene.traverse((obj) => {
              (obj as any).target = gltf.scene;
            });

            gltf.scene.name = item.id;
          });
        }
      });
      return;
    }

    // 造墙
    const walls = data.walls.map((item, index) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, item.height);
      shape.lineTo(item.width, item.height);
      shape.lineTo(item.width, 0);
      shape.lineTo(0, 0);

      // 挖窗户
      item.windows?.forEach(async (window) => {
        const path = new THREE.Path();

        const { left, bottom } = window.leftBottomPosition;

        path.moveTo(left, bottom);
        path.lineTo(left + window.width, bottom);
        path.lineTo(left + window.width, bottom + window.height);
        path.lineTo(left, bottom + window.height);
        path.lineTo(left, bottom);
        shape.holes.push(path);

        const { model, size } = await loadWindow();
        model.position.x = left + window.width / 2;
        model.position.y = bottom + window.height / 2;
        model.position.z = item.depth / 2;
        model.scale.set(window.width / size.x, window.height / size.y, 1);

        wall.add(model);
      });

      // 挖门
      item.doors?.forEach(async (door) => {
        const path = new THREE.Path();
        const { left, bottom } = door.leftBottomPosition;

        path.moveTo(left, bottom);
        path.lineTo(left + door.width, bottom);
        path.lineTo(left + door.width, bottom + door.height);
        path.lineTo(left, bottom + door.height);
        path.lineTo(left, bottom);
        shape.holes.push(path);

        const { model, size } = await loadDoor();
        model.position.x = left + door.width / 2;
        model.position.y = bottom + door.height / 2;
        model.position.z = item.depth;
        model.scale.y = door.height / size.y;
        model.scale.z = door.width / size.z;
        model.rotation.y = -Math.PI / 2;

        wall.add(model);
      });

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: item.depth,
      });
      const material = new THREE.MeshPhongMaterial({
        color: item.color || "white",
      });
      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(item.position.x, item.position.y, item.position.z);

      if (item.rotationY) {
        wall.rotation.y = item.rotationY;
      }

      // 设置墙的名称
      wall.name = "wall" + index;

      return wall;
    });
    house.add(...walls);

    // 造地板
    const floorGroup = new THREE.Group();
    floorGroup.name = "floors";
    data.floors.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);

      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      let texture = floorTexture;
      if (item.textureUrl) {
        texture = textureLoader.load(item.textureUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.002, 0.002);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      const floor = new THREE.Mesh(geometry, material);
      floor.position.z = 200;
      floor.rotateX(Math.PI / 2);

      floorGroup.add(floor);

      return floor;
    });

    house.add(floorGroup);

    // 造天花板
    const ceilings = data.ceilings.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);

      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        color: "#eee",
        side: THREE.FrontSide,
      });
      const ceiling = new THREE.Mesh(geometry, material);
      ceiling.rotateX(Math.PI / 2);
      ceiling.position.z = 200;
      ceiling.position.y = item.height;

      return ceiling;
    });

    house.add(...ceilings);

    // 造家具
    const furnitures = new THREE.Group();
    furnitures.name = "furnitures";

    data.furnitures.forEach((item) => {
      modelMap[item.modelUrl].then((gltf) => {
        gltf.scene = gltf.scene.clone();

        furnitures.add(gltf.scene);

        gltf.scene.scale.setScalar(item.modelScale || 1);

        gltf.scene.position.set(
          item.position.x,
          item.position.y,
          item.position.z
        );
        gltf.scene.rotation.x = item.rotation.x;
        gltf.scene.rotation.y = item.rotation.y;
        gltf.scene.rotation.z = item.rotation.z;

        // 设置家具的target为gltf.scene
        gltf.scene.traverse((obj) => {
          (obj as any).target = gltf.scene;
        });

        gltf.scene.name = item.id;
      });
    });
    house.add(furnitures);

    scene.add(house);

    const box3 = new THREE.Box3().expandByObject(house);
    const center = box3.getCenter(new THREE.Vector3());
    // house.position.set(-center.x, 0, -center.z);

    // 设置相机位置
    camera3DRef.current?.lookAt(center.x, 0, center.z);
    controlsRef.current?.target.set(center.x, 0, center.z);

    house.name = "house";
  }, [data]);

  useEffect(() => {
    const dom = document.getElementById("threejs-2d-container")!;
    const { scene, changeMode, changeSize, detachTransformControls } = init2D(
      dom,
      updateFurniture,
      setCurSelectedFurniture
    );

    scene2DRef.current = scene;
    changeMode2DRef.current = changeMode;
    changeSize2DRef.current = changeSize;
    detachTransformControls2DRef.current = detachTransformControls;
    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // 2d场景家具更新
  useEffect(() => {
    const scene = scene2DRef.current!;
    const house = new THREE.Group();

    if (!data.walls.length) {
      return;
    }

    const houseObj = scene.getObjectByName("house");
    if (houseObj) {
      data.furnitures.forEach((item) => {
        const obj = houseObj.getObjectByName(item.id);
        if (obj) {
          obj.position.set(
            -item.position.x,
            -item.position.y,
            -item.position.z
          );
          obj.rotation.x = item.rotation.x;
          obj.rotation.y = item.rotation.y + Math.PI;
          obj.rotation.z = item.rotation.z;
        } else {
          // 添加家具
          const furnitures = houseObj.getObjectByName("furnitures")!;

          modelMap[item.modelUrl].then((gltf) => {
            gltf.scene = gltf.scene.clone();

            furnitures.add(gltf.scene);

            gltf.scene.scale.setScalar(item.modelScale || 1);

            gltf.scene.position.set(
              -item.position.x,
              -item.position.y,
              -item.position.z
            );
            gltf.scene.rotation.x = item.rotation.x;
            gltf.scene.rotation.y = item.rotation.y + Math.PI;
            gltf.scene.rotation.z = item.rotation.z;

            gltf.scene.traverse((obj) => {
              (obj as any).target = gltf.scene;
            });

            gltf.scene.name = item.id;
          });
        }
      });
      return;
    }

    // 造墙
    const walls = data.walls.map((item, index) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, item.depth);
      shape.lineTo(item.width, item.depth);
      shape.lineTo(item.width, 0);
      shape.lineTo(0, 0);

      // 2d挖孔 窗户
      item.windows?.forEach(async (window) => {
        const path = new THREE.Path();

        const { left } = window.leftBottomPosition;

        path.moveTo(left, 0);
        path.lineTo(left, item.depth);
        path.lineTo(left + window.width, item.depth);
        path.lineTo(left + window.width, 0);
        path.lineTo(left, 0);

        shape.holes.push(path);
      });

      // 2d挖孔 门
      item.doors?.forEach(async (door) => {
        const path = new THREE.Path();
        const { left } = door.leftBottomPosition;

        path.moveTo(left, 0);
        path.lineTo(left, item.depth);
        path.lineTo(left + door.width, item.depth);
        path.lineTo(left + door.width, 0);
        path.lineTo(left, 0);

        shape.holes.push(path);
      });

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        color: item.color || "white",
        side: THREE.DoubleSide,
      });

      const wall = new THREE.Mesh(geometry, material);

      // 添加窗户标志
      item.windows?.forEach((window) => {
        const { left } = window.leftBottomPosition;
        const geometry = new THREE.PlaneGeometry(window.width, item.depth);
        const material = new THREE.MeshBasicMaterial({
          color: "#aaa",
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        const windowLogo = new THREE.Mesh(geometry, material);
        windowLogo.position.x = left + window.width / 2;
        windowLogo.position.y = 100;
        wall.add(windowLogo);
      });

      // 添加门标志
      item.doors?.forEach((door) => {
        const { left } = door.leftBottomPosition;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.arc(0, 0, door.width, 0, Math.PI / 2);
        shape.lineTo(0, 0);

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: "#aaa",
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        const doorLogo = new THREE.Mesh(geometry, material);
        doorLogo.position.x = left;
        doorLogo.position.z = -100;
        doorLogo.rotateX(Math.PI);
        doorLogo.position.y = 200;
        wall.add(doorLogo);
      });

      wall.position.set(-item.position.x, -item.position.y, -item.position.z);

      // 墙尺寸标注
      const text = new SpriteText(item.width + "", 200);
      text.color = "black";
      wall.add(text);
      text.position.x = item.width / 2;
      text.position.y = 500;
      text.position.z = -100;

      // 墙尺寸标注线
      const bufferGeometry = new THREE.BufferGeometry();
      bufferGeometry.setFromPoints([
        new THREE.Vector3(0, -100, 0),
        new THREE.Vector3(0, 100, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(item.width / 2 - 300, 0, 0),
        new THREE.Vector3(item.width / 2 + 300, 0, 0),
        new THREE.Vector3(item.width, 0, 0),
        new THREE.Vector3(item.width, -100, 0),
        new THREE.Vector3(item.width, 100, 0),
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: "#111" });
      const line = new THREE.LineSegments(bufferGeometry, lineMaterial);
      wall.add(line);
      line.position.y = 500;
      line.position.z = -100;

      if (item.rotationY) {
        wall.rotation.y = item.rotationY;
      }

      wall.name = "wall" + index;
      wall.rotateX(-Math.PI / 2);
      wall.rotateY(Math.PI);
      return wall;
    });

    house.add(...walls);

    // 造地板

    const floors = data.floors.map((item) => {
      const shape = new THREE.Shape();
      shape.moveTo(item.points[0].x, item.points[0].z);

      for (let i = 1; i < item.points.length; i++) {
        shape.lineTo(item.points[i].x, item.points[i].z);
      }

      let texture = floorTexture;
      if (item.textureUrl) {
        texture = textureLoader.load(item.textureUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.002, 0.002);
      }

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.BackSide,
      });

      const floor = new THREE.Mesh(geometry, material);
      floor.position.z = -200;

      const text = new SpriteText(item.name + "\n" + item.size + "m²", 200);
      text.color = "black";

      const box3 = new THREE.Box3().expandByObject(floor);
      const center = box3.getCenter(new THREE.Vector3());
      text.position.set(center.x, center.y, center.z);
      const helper = new THREE.Box3Helper(box3);
      floor.add(helper);

      floor.add(text);

      floor.rotateX(Math.PI / 2);
      floor.rotateZ(Math.PI);

      return floor;
    });

    house.add(...floors);

    // 造家具
    const furnitures = new THREE.Group();
    furnitures.name = "furnitures";

    data.furnitures.forEach((item) => {
      modelMap[item.modelUrl].then((gltf) => {
        gltf.scene = gltf.scene.clone();

        furnitures.add(gltf.scene);

        gltf.scene.scale.setScalar(item.modelScale || 1);

        gltf.scene.position.set(
          -item.position.x,
          -item.position.y,
          -item.position.z
        );
        gltf.scene.rotation.x = item.rotation.x;
        gltf.scene.rotation.y = item.rotation.y + Math.PI;
        gltf.scene.rotation.z = item.rotation.z;

        gltf.scene.traverse((obj) => {
          (obj as any).target = gltf.scene;
        });

        gltf.scene.name = item.id;
      });
    });
    house.add(furnitures);

    scene.add(house);

    const rad = THREE.MathUtils.degToRad(90);
    house.rotateY(rad);

    const box3 = new THREE.Box3().expandByObject(house);
    const center = box3.getCenter(new THREE.Vector3());
    house.position.set(-center.x, 0, -center.z);

    house.name = "house";

    // const helper = new THREE.AxesHelper(30000);
    // house.add(helper);
  }, [data]);

  useEffect(() => {
    const changeSize2D = changeSize2DRef.current!;
    const changeSize3D = changeSizeRef.current!;
    if (curMode === "2d") {
      changeSize2D(true);
      changeSize3D(false);
    } else {
      changeSize2D(false);
      changeSize3D(true);
    }
  }, [curMode]);

  const [, drop] = useDrop({
    accept: "家具",
    drop: (item: any, monitor) => {
      const { modelUrl, modelScale } = item;

      const dom = document.getElementById("threejs-3d-container")!;
      // 获取鼠标在3d场景中的位置
      const clientOffset = monitor.getClientOffset();
      // 获取3d场景的矩形区域
      const rect = dom.getBoundingClientRect();

      if (clientOffset && rect) {
        const offsetX = clientOffset.x - rect.x;
        const offsetY = clientOffset.y - rect.y;

        const width = window.innerWidth;
        const height = window.innerHeight - 60;

        const y = -((offsetY / height) * 2 - 1);
        const x = (offsetX / width) * 2 - 1;

        const rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(new THREE.Vector2(x, y), camera3DRef.current!);

        const scene3D = scene3DRef.current!;

        const floorGroup = scene3D.getObjectByName("floors")!;
        const intersections = rayCaster.intersectObjects(floorGroup.children);

        if (intersections.length) {
          const point = intersections[0].point;
          addFurniture({
            id: "furniture" + Math.random().toString().slice(2, 8),
            modelUrl,
            modelScale,
            position: {
              x: point.x,
              y: 0,
              z: point.z,
            },
            rotation: {
              x: 0,
              y: 0,
              z: 0,
            },
          });
        }
      }
    },
  });

  useEffect(() => {
    const div = document.getElementById("threejs-3d-container")!;
    drop(div);
  }, []);

  return (
    <div className="main">
      <div
        id="threejs-3d-container"
        style={{ zIndex: curMode === "2d" ? 2 : 1 }}
      ></div>
      <div
        id="threejs-2d-container"
        style={{ zIndex: curMode === "3d" ? 2 : 1 }}
      ></div>
      <div className="mode-change-btns">
        <Button
          type={curMode === "2d" ? "primary" : "default"}
          onClick={() => setCurMode("2d")}
          style={{ marginRight: 10 }}
        >
          2D
        </Button>
        <Button
          type={curMode === "3d" ? "primary" : "default"}
          onClick={() => setCurMode("3d")}
          style={{ marginRight: 10 }}
        >
          3D
        </Button>
        <Button
          onClick={() => {
            changeModeRef.current!(true);
            changeMode2DRef.current!(true);
          }}
          style={{ marginRight: 10 }}
        >
          平移
        </Button>
        <Button
          onClick={() => {
            changeModeRef.current!(false);
            changeMode2DRef.current!(false);
          }}
        >
          旋转
        </Button>
      </div>
    </div>
  );
}

export default Main;
