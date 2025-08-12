import { useEffect, useRef, useState } from "react";
import { init3D } from "./init-3d";
import { init2D } from "./init-2d";
import { Button } from "antd";
import * as THREE from "three";
import { useHouseStore } from "../../store";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

let windowModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;
let doorModel: { model: THREE.Group; size: THREE.Vector3 } | null = null;

const loadWindow = async () => {
  if (windowModel !== null) {
    return windowModel;
  } else {
    const group = new THREE.Group();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("./window.glb");
    group.add(gltf.scene);

    const box = new THREE.Box3().expandByObject(gltf.scene);

    const size = box.getSize(new THREE.Vector3());
    windowModel = {
      model: group,
      size,
    };

    return windowModel;
  }
};

const loadDoor = async () => {
  if (doorModel !== null) {
    return doorModel;
  } else {
    const group = new THREE.Group();
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("./door.glb");
    group.add(gltf.scene);

    const box = new THREE.Box3().expandByObject(gltf.scene);

    const size = box.getSize(new THREE.Vector3());
    doorModel = {
      model: group,
      size,
    };

    return doorModel;
  }
};

const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load("./floor-texture.png");
floorTexture.colorSpace = THREE.SRGBColorSpace;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(0.002, 0.002);

function Main() {
  const scene3DRef = useRef<THREE.Scene>(null);
  const scene2DRef = useRef<THREE.Scene>(null);
  const camera3DRef = useRef<THREE.Camera>(null);

  const { data } = useHouseStore();

  // 计算法线与相机夹角
  const wallsVisibilityCalc = () => {
    const camera = camera3DRef.current!;
    const scene = scene3DRef.current!;

    if (!camera) {
      return;
    }

    data.walls.forEach((item, index) => {
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

  useEffect(() => {
    const dom = document.getElementById("threejs-3d-container")!;
    const { scene, camera } = init3D(dom, wallsVisibilityCalc);

    scene3DRef.current = scene;
    camera3DRef.current = camera;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const house = new THREE.Group();
    const scene = scene3DRef.current!;

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
        model.scale.y = door.height / size.y;
        model.scale.z = door.width / size.z;
        model.rotation.y = -Math.PI / 2;

        wall.add(model);
      });

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: item.depth,
      });
      const material = new THREE.MeshPhongMaterial({
        color: "white",
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
      floor.rotateX(Math.PI / 2);

      return floor;
    });

    house.add(...floors);

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
      ceiling.position.y = item.height;

      return ceiling;
    });

    house.add(...ceilings);

    scene.add(house);

    // const box3 = new THREE.Box3().expandByObject(house);
    // const center = box3.getCenter(new THREE.Vector3());
    // house.position.set(-center.x, 0, -center.z);
  }, [data]);

  useEffect(() => {
    const dom = document.getElementById("threejs-2d-container")!;
    const { scene } = init2D(dom);

    scene2DRef.current = scene;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const scene = scene2DRef.current!;
    const house = new THREE.Group();

    // 造墙
    const walls = data.walls.map((item, index) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, item.depth);
      shape.lineTo(item.width, item.depth);
      shape.lineTo(item.width, 0);
      shape.lineTo(0, 0);

      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({
        color: "white",
      });

      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(item.position.x, item.position.y, item.position.z);
      
      // if (item.rotationY) {
      //   wall.rotation.y = item.rotationY;
      // }

      wall.name = "wall" + index;
      wall.rotateX(-Math.PI / 2);
      // wall.rotateZ(Math.PI);
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
      floor.rotateX(Math.PI / 2);
      // floor.rotateZ(Math.PI);
      return floor;
    });

    house.add(...floors);

    scene.add(house);

    // const rad = THREE.MathUtils.degToRad(26);
    // house.rotateY(rad);

    // const box3 = new THREE.Box3().expandByObject(house);
    // const center = box3.getCenter(new THREE.Vector3());
    // house.position.set(-center.x, 0, -center.z);
  }, [data]);

  const [curMode, setCurMode] = useState<"3d" | "2d">("2d");

  return (
    <div className="main">
      <div
        id="threejs-3d-container"
        style={{ display: curMode === "3d" ? "block" : "none" }}
      ></div>
      <div
        id="threejs-2d-container"
        style={{ display: curMode === "2d" ? "block" : "none" }}
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
        >
          3D
        </Button>
      </div>
    </div>
  );
}

export default Main;
