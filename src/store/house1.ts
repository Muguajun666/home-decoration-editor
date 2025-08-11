import type { State } from ".";

const data: State["data"] = {
  walls: [
    {
      position: { x: 0, y: 0, z: 0 },
      width: 5000,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: 0, y: 0, z: 7000 },
      width: 5000,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: 0, y: 0, z: 0 },
      width: 7200,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [
        {
          leftBottomPosition: {
            left: 2867,
            bottom: 900,
          },
          width: 2100,
          height: 1620,
        },
      ],
    },
    {
      position: { x: 5000, y: 0, z: 0 },
      width: 7200,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
      doors: [
        {
          leftBottomPosition: {
            left: 6084,
            bottom: 0,
          },
          width: 856,
          height: 2152,
        },
      ],
    },
  ],
  floors: [
    {
      points: [
        { x: 0, z: 0 },
        { x: 0, z: 7000 },
        { x: 5000, z: 7000 },
        { x: 5000, z: 0 },
        { x: 0, z: 0 },
      ],
    },
  ],
  ceilings: [
    {
      points: [
        { x: 0, z: 0 },
        { x: 0, z: 7000 },
        { x: 5000, z: 7000 },
        { x: 5000, z: 0 },
        { x: 0, z: 0 },
      ],
      height: 3000,
    },
  ],
};

export default data;
