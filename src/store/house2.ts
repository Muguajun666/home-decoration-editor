import type { State } from ".";

const data: State["data"] = {
  walls: [
    {
      position: { x: 0, y: 0, z: 0 },
      width: 2800,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: 0, y: 0, z: 0 },
      width: 5000,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
    },
    {
      position: { x: -5000, y: 0, z: 5000 },
      width: 5000,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: -5000, y: 0, z: 5000 },
      width: 1880,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
    },
    {
      position: { x: -5200, y: 0, z: 6880 },
      width: 3000,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: -2000, y: 0, z: 6880 },
      width: 1580,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
    },
    {
      position: { x: -2200, y: 0, z: 8260 },
      width: 2880,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: 880, y: 0, z: 7080 },
      width: 1380,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
    },
    {
      position: { x: 880, y: 0, z: 7080 },
      width: 2000,
      height: 3000,
      depth: 200,
      windows: [],
    },
    {
      position: { x: 2880, y: 0, z: 0 },
      width: 7180,
      height: 3000,
      depth: 200,
      rotationY: -Math.PI / 2,
      windows: [],
    },
  ],
  floors: [
    {
      points: [
        { x: -2000, z: 5200 },
        { x: -5000, z: 5200 },
        { x: -5000, z: 7000 },
        { x: -2000, z: 7000 },
        { x: -2000, z: 5200 },
      ],
    },
    {
      points: [
        { x: 0, z: 0 },
        { x: 2880, z: 0 },
        { x: 2880, z: 7180 },
        { x: 880, z: 7180 },
        { x: 880, z: 8380 },
        { x: -2000, z: 8380 },
        { x: -2000, z: 6880 },
        { x: -2000, z: 5000 },
        { x: -2000, z: 5000 },
        { x: 0, z: 5000 },
        { x: 0, z: 0 },
      ],
      textureUrl: "./floor-texture2.png",
    },
  ],
  ceilings: [],
};

export default data;
