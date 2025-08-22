import { Card, Segmented, Image, Popconfirm } from "antd";
import { useEffect, useRef, useState } from "react";
import { HomeOutlined, UngroupOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import data1 from "../../store/house1";
import data2 from "../../store/house2";
import { useHouseStore } from "../../store";
import { useDrag } from "react-dnd";

interface MenuItemProps {
  imgSrc: string;
  title: string;
  modelUrl: string;
  modelScale?: number;
}

function MenuItem(props: MenuItemProps) {
  const ref = useRef(null);

  const [, drag] = useDrag({
    type: "家具",
    item: {
      modelUrl: props.modelUrl,
      modelScale: props.modelScale,
    },
  });

  useEffect(() => {
    drag(ref);
  }, []);

  return (
    <Card
      hoverable
      style={{ width: 200, margin: 20, textAlign: "center" }}
      cover={<img src={props.imgSrc} width={200} ref={ref} />}
    >
      <Meta title={props.title} description="" />
    </Card>
  );
}

function Menu() {
  const [left, setLeft] = useState(0);

  const [key, setKey] = useState("户型");

  const { setData } = useHouseStore();

  return (
    <div className="menu" style={{ left: left }}>
      <Segmented
        value={key}
        onChange={setKey}
        block
        options={[
          {
            label: (
              <div>
                <HomeOutlined />
                <span style={{ padding: 10 }}>户型</span>
              </div>
            ),
            value: "户型",
          },
          {
            label: (
              <div>
                <UngroupOutlined />
                <span style={{ padding: 10 }}>家具</span>
              </div>
            ),
            value: "家具",
          },
        ]}
      />
      {key === "户型" ? (
        <div className="house-list">
          <Popconfirm
            title="提醒"
            description="切换户型将清空数据，是否继续？"
            onConfirm={() => {
              setData({
                walls: [],
                floors: [],
                ceilings: [],
                furnitures: [],
              });
              setTimeout(() => {
                setData(data1);
              }, 0);
            }}
            okText="是"
            cancelText="否"
          >
            <Card
              hoverable
              style={{ width: 200, margin: 20, textAlign: "center" }}
              cover={<Image src="./house1.png" width={200} />}
            >
              <Meta title="1室1厅0厨0卫" description="" />
            </Card>
          </Popconfirm>
          <Popconfirm
            title="提醒"
            description="切换户型将清空数据，是否继续？"
            onConfirm={() => {
              setData({
                walls: [],
                floors: [],
                ceilings: [],
                furnitures: [],
              });
              setTimeout(() => {
                setData(data2);
              }, 0);
            }}
            okText="是"
            cancelText="否"
          >
            <Card
              hoverable
              style={{ width: 200, margin: 20, textAlign: "center" }}
              cover={<Image src="./house2.png" width={200} />}
            >
              <Meta title="1室2厅0厨0卫" description="" />
            </Card>
          </Popconfirm>
        </div>
      ) : null}
      {key === "家具" ? (
        <div className="furniture-list">
          <MenuItem
            imgSrc="./bed.png"
            modelUrl="./bed.glb"
            title="床"
            modelScale={800}
          />
          <MenuItem
            imgSrc="./table.png"
            modelUrl="./dining-table.glb"
            title="餐桌"
          />
        </div>
      ) : null}
      <div
        className="drawer-bar"
        onClick={() => setLeft(left === 0 ? -300 : 0)}
      ></div>
    </div>
  );
}

export default Menu;
