import { create } from "zustand";
import data from "./house2";

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
  name?: string;
  size?: number;
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

export interface Action {
  setData: (data: State["data"]) => void;
}

const useHouseStore = create<State & Action>((set, get) => {
  return {
    data: data,
    setData: (_data) =>
      set((state) => {
        return {
          ...state,
          data: _data,
        };
      }),
  };
});

export { useHouseStore };
