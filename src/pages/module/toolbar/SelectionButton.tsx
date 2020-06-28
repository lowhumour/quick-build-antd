import React from 'react';
import { CheckSquareOutlined } from '@ant-design/icons';
import { Badge, Tooltip, Dropdown, Menu, Button } from 'antd';
import { ModuleState } from '../data';
import { Dispatch } from 'redux';

const spaceIcon = <CheckSquareOutlined style={{ visibility: 'hidden' }} />;

const SelectionButton = ({ moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: Dispatch }) => {

    const { length: count } = moduleState.selectedRowKeys;
    const handleMenuClick = (e: any) => {
        const { key } = e;
        dispatch({
            type: 'modules/resetSelectedRow',
            payload: {
                moduleName: moduleState.moduleName,
                type: key
            },
        })
    };
    const menu =
        <Menu onClick={handleMenuClick} key="selectButtonKey">
            <Menu.Item key='none' icon={spaceIcon}>取消所有选中记录</Menu.Item>
            <Menu.Divider />
            <Menu.Item key='otherpage' icon={spaceIcon}>取消非当前页的选中记录</Menu.Item>
        </Menu>
    if (count)
        return <Tooltip title={`已选中: ${count} 条记录`}>
            <Dropdown overlay={menu} trigger={['click']}>
                <Button size="small" type="link" style={{ padding: '0px' }}><CheckSquareOutlined />
                    <Badge count={count} offset={[-3, -3]} style={{ backgroundColor: '#108ee9' }} />
                </Button>
            </Dropdown>
        </Tooltip>
    else
        return <Tooltip title='未选中记录'>
            <Button size="small" type="text" style={{ padding: '0px' }}>
                <CheckSquareOutlined style={{ cursor: 'pointer' }} />
            </Button>
        </Tooltip>
}

export default SelectionButton;