import { Progress } from "antd";
import "./App.scss";
import Header from "./components/Header";
import Main, { getGLTFLoader } from "./components/Main";
import Menu from "./components/Menu";
import Properties from "./components/Properties";
import { useEffect, useState } from "react";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import Preview from "./components/Preview";

const gltfLoader = getGLTFLoader();
export const modelMap: Record<string, Promise<GLTF>> = {};

function App() {
  const [modelLoaded, setModelLoaded] = useState(false);

  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const percentArr = [0, 0, 0, 0];
    ["./bed.glb", "./dining-table.glb", "./window.glb", "./door.glb"].forEach(
      (modelUrl, index) => {
        modelMap[modelUrl] = gltfLoader.loadAsync(modelUrl, (e) => {
          const per = e.loaded / e.total;
          percentArr[index] = per;

          let total = 0;
          percentArr.forEach((p) => {
            total += p;
          });

          setPercent(Math.floor((total / 4) * 100));
        });
      }
    );
  }, []);

  useEffect(() => {
    Promise.all(Object.values(modelMap)).then(() => {
      setModelLoaded(true);
    });
  }, []);

  return (
    <div>
      {modelLoaded ? (
        <div className="wrap">
          <Header />
          <div className="editor">
            <Menu />
            <Main />
            <Properties />
          </div>
          <Preview />
        </div>
      ) : (
        <div id="loading">
          <p>Loading...</p>
          <Progress
            percent={percent}
            style={{ width: 500 }}
            percentPosition={{ align: "start", type: "inner" }}
            size={[500, 30]}
            strokeColor="#B7EB8F"
          />
        </div>
      )}
    </div>
  );
}

export default App;
