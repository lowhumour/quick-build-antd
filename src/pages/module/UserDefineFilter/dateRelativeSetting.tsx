import React, { useState } from 'react';
import { Popover, Button, Form, InputNumber, Checkbox, Row, Col, Space } from 'antd';


export const DateRelativeSetting = () => {

    const [visible, setVisible] = useState(false);

    return <Popover content={getSetForm()} title='设置相对区间' visible={visible} trigger='click'
        onVisibleChange={(visible) => setVisible(visible)}>
        <span>设置</span>
    </Popover>


}

const getSetForm = () => {

    return <Form style={{ padding: 8 }}>
        <Row gutter={16}>
            <Col>
                <Form.Item >
                    <Checkbox />
                </Form.Item>
            </Col>
            <Col>
                <Form.Item label='相对起始值'>
                    <InputNumber />
                </Form.Item></Col>
        </Row>
        <Row gutter={16}>
            <Col>
                <Form.Item >
                    <Checkbox />
                </Form.Item>
            </Col><Col>
                <Form.Item label='相对终止值'>
                    <InputNumber />
                </Form.Item>
            </Col>
        </Row>
        <span style={{ display: 'flex' }} >
            <span style={{ flex: 1 }}></span>
            <Space>
                <Button >
                    清除
            </Button>
                <Button type="primary">
                    确定
            </Button>
            </Space>
        </span>
        <div style={{ color: 'green', marginTop: '10px' }} >
            说明：0表示当前年度，-1表示前一年，<br />　　　1表示后1年,依次类推。<br />
            例如：相对起始年-3，终止年2，表示当<br />　　　前年度前3年到后2年加上本年一共6年。<br />
            　　　可以只选择起始值或者终止值。

        </div>
    </Form>


}