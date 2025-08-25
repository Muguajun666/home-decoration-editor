import { useEffect, useState } from "react";
import { useHouseStore } from "../../store";
import { Form, Input, InputNumber, Slider } from "antd";

function Properties() {
  const [width, setWidth] = useState(240);
  const { data, curSelectedFurniture, updateFurniture } = useHouseStore();

  const [form] = Form.useForm();

  useEffect(() => {
    if (curSelectedFurniture) {
      form.setFieldsValue(curSelectedFurniture);
    }
  }, [curSelectedFurniture, data]);

  const handleValuesChange = () => {
    const values = form.getFieldsValue();
    updateFurniture(values.id, "position", values.position);
    updateFurniture(values.id, "rotation", values.rotation);
  };

  return (
    <div className="properties" style={{ width: width }}>
      {curSelectedFurniture ? (
        <div>
          <Form
            form={form}
            initialValues={curSelectedFurniture}
            style={{ margin: "20px 10px" }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onValuesChange={handleValuesChange}
          >
            <Form.Item label="ID" name="id">
              <Input disabled />
            </Form.Item>
            <Form.Item label="位置 x" name={["position", "x"]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="位置 y" name={["position", "y"]}>
              <InputNumber style={{ width: "100%" }} disabled />
            </Form.Item>
            <Form.Item label="位置 z" name={["position", "z"]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="旋转 x" name={["rotation", "x"]}>
              <Slider min={-Math.PI * 2} max={Math.PI * 2} disabled />
            </Form.Item>
            <Form.Item label="旋转 y" name={["rotation", "y"]}>
              <Slider min={-Math.PI * 2} max={Math.PI * 2} />
            </Form.Item>
            <Form.Item label="旋转 z" name={["rotation", "z"]}>
              <Slider min={-Math.PI * 2} max={Math.PI * 2} disabled />
            </Form.Item>
          </Form>
        </div>
      ) : null}
      <div
        className="drawer-bar"
        onClick={() => setWidth(width === 0 ? 240 : 0)}
      ></div>
    </div>
  );
}

export default Properties;
