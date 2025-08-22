import { create, StateCreator } from "zustand";
import data from "./house2";
import { Vector3 } from "three";
import { persist } from "zustand/middleware";
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

interface Furniture {
  id: string;
  modelUrl: string;
  modelScale?: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface State {
  data: {
    walls: Wall[];
    floors: Floor[];
    ceilings: Ceiling[];
    furnitures: Furniture[];
  };
  showPreview: boolean;
  curSelectedFurniture: Furniture | null;
}

export interface Action {
  setData: (data: State["data"]) => void;
  updateFurniture: (
    id: string,
    type: "position" | "rotation",
    info: Vector3
  ) => void;
  addFurniture: (furniture: Furniture) => void;
  removeFurniture: (id: string) => void;
  toggleShowPreview: () => void;
  setCurSelectedFurniture: (id: string) => void;
}

const stateCreator: StateCreator<State & Action> = (set, get) => {
  return {
    data: data,
    showPreview: false,
    curSelectedFurniture: null,
    setCurSelectedFurniture: (id) => {
      set((state) => {
        const found = state.data.furnitures.filter((item) => item.id === id);
        return {
          ...state,
          curSelectedFurniture: found.length ? found[0] : null,
        };
      });
    },
    setData: (_data) =>
      set((state) => {
        return {
          ...state,
          data: _data,
        };
      }),
    updateFurniture: (id, type, info) => {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: state.data.furnitures.map((item) => {
              if (item.id === id) {
                if (type === "position") {
                  item.position.x = info.x;
                  item.position.y = info.y;
                  item.position.z = info.z;
                } else {
                  item.rotation.x = info.x;
                  item.rotation.y = info.y;
                  item.rotation.z = info.z;
                }
              }
              return item;
            }),
          },
        };
      });
    },
    addFurniture: (furniture) => {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: [...state.data.furnitures, furniture],
          },
        };
      });
    },
    toggleShowPreview: () => {
      set((state) => {
        return {
          ...state,
          showPreview: !state.showPreview,
        };
      });
    },
    removeFurniture: (id) => {
      set((state) => {
        return {
          ...state,
          data: {
            ...state.data,
            furnitures: state.data.furnitures.filter((item) => item.id !== id),
          },
        };
      });
    },
  };
};

const useHouseStore = create<State & Action>()(
  persist(stateCreator, { name: "house" })
);

export { useHouseStore };
