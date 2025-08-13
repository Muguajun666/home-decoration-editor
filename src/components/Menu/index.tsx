import { Card, Segmented, Image, Popconfirm } from "antd";
import { useState } from "react";
import { HomeOutlined, UngroupOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import data1 from "../../store/house1";
import data2 from "../../store/house2";
import { useHouseStore } from "../../store";

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
              setData(data1);
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
              setData(data2);
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
      {key === "家具" ? <div>222</div> : null}
      <div
        className="drawer-bar"
        onClick={() => setLeft(left === 0 ? -300 : 0)}
      ></div>
    </div>
  );
}

export default Menu;
