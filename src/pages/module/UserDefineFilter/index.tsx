import React from 'react';
import { Card, Button, Space } from 'antd';
import { ModuleModal } from '../data';


const UserDefineFilter = ({ moduleInfo, dispatch }: { moduleInfo: ModuleModal, dispatch: any }) => {

    return <Card style={{ marginBottom: 16 }} >
        <span style={{ display: 'flex' }}>
            <span style={{ flex: 1 }}></span>
            <Space>
                <Button type="primary">查询</Button>
                <Button>重置</Button>
            </Space>
        </span>
    </Card>

}

export default UserDefineFilter;