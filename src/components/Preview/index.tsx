import { CloseCircleOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import { initPreviewScene } from "./init-preview";
import { useHouseStore } from "../../store";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
import { modelMap } from "../../App";
import { floorTexture, loadDoor, loadWindow } from "../Main";

const textureLoader = new THREE.TextureLoader();
function Preview() {
  const scene3DRef = useRef<THREE.Scene>(null);
  const camera3DRef = useRef<THREE.Camera>(null);
  // const controls3DRef = useRef<OrbitControls>(null);
  const { data } = useHouseStore();

  useEffect(() => {
    const previewContainer = document.getElementById("preview-container")!;
    const { scene, camera, controls } = initPreviewScene(previewContainer);

    scene3DRef.current = scene;
    camera3DRef.current = camera;
    // controls3DRef.current = controls;

    return () => {
      previewContainer.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const scene = scene3DRef.current!;

    const furnituresGroup = scene.getObjectByName("furnitures");

    furnituresGroup?.children.forEach((item) => {
      if (!data.furnitures.find((i) => i.id === item.name)) {
        item.parent?.remove(item);
      }
    });
  }, [data.furnitures.length]);

  useEffect(() => {
    const scene = scene3DRef.current;
    const house = scene?.getObjectByName("house");

    if (data.walls.length) {
      return;
    }

    house?.parent?.remove(house);

    house?.traverse((child) => {
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

    const houseObj = scene.getObjectByName("house")!;
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

    // 设置相机位置
    camera3DRef.current?.lookAt(center.x, 0, center.z);
    // controls3DRef.current?.target.set(center.x, 0, center.z);

    house.name = "house";
  }, [data]);

  const { showPreview, toggleShowPreview } = useHouseStore();

  return (
    <div id="preview" style={{ display: showPreview ? "block" : "none" }}>
      <div id="preview-container"></div>
      <div className="close-btn" onClick={() => toggleShowPreview()}>
        <CloseCircleOutlined />
      </div>
    </div>
  );
}

export default Preview;
