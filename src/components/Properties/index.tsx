import { useState } from "react";
import { useHouseStore } from "../../store";

function Properties() {
  const [width, setWidth] = useState(0);
  const { curSelectedFurniture } = useHouseStore();
  return (
    <div className="properties" style={{ width: width }}>
      <pre>{JSON.stringify(curSelectedFurniture, null, 4)}</pre>
      <div
        className="drawer-bar"
        onClick={() => setWidth(width === 0 ? 240 : 0)}
      ></div>
    </div>
  );
}

export default Properties;
