import { useState } from "react";

function Menu() {
  const [left, setLeft] = useState(-300);

  return (
    <div className="menu" style={{ left: left }}>
      <div
        className="drawer-bar"
        onClick={() => setLeft(left === 0 ? -300 : 0)}
      ></div>
    </div>
  );
}

export default Menu;
