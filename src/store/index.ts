import { create } from "zustand";
import data from "./house1";

interface Wall {
  position: {
    x: number;
    y: number;
    z: number;
  };
  width: number;
  height: number;
  depth: number;
  color?: string;
  rotationY?: number;
  // 法线
  normal: {
    x: number;
    y: number;
    z: number;
  };
  windows?: Array<{
    leftBottomPosition: {
      left: number;
      bottom: number;
    };
    width: number;
    height: number;
  }>;
  doors?: Array<{
    leftBottomPosition: {
      left: number;
      bottom: number;
    };
    width: number;
    height: number;
  }>;
}

interface Floor {
  points: Array<{
    x: number;
    z: number;
  }>;
  textureUrl?: string;
}

interface Ceiling {
  points: Array<{
    x: number;
    z: number;
  }>;
  height: number;
}

export interface State {
  data: {
    walls: Wall[];
    floors: Floor[];
    ceilings: Ceiling[];
  };
}

const useHouseStore = create<State>((set, get) => {
  return {
    data: data,
  };
});

export { useHouseStore };
