import { useState } from "react";

function Properties() {
  const [width, setWidth] = useState(0);

  return (
    <div className="properties" style={{ width: width }}>
      <div
        className="drawer-bar"
        onClick={() => setWidth(width === 0 ? 240 : 0)}
      ></div>
    </div>
  );
}

export default Properties;
