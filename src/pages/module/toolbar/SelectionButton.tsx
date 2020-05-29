import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Badge, Tooltip, Dropdown, Menu } from 'antd';
import { ModuleState } from '../data';
import { Dispatch } from 'redux';

const spaceIcon = <CheckCircleOutlined style={{ visibility: 'hidden' }} />;

const SelectionButton = ({ moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: Dispatch }) => {

    const { length: count } = moduleState.selectedRowKeys;
    const handleMenuClick = (e: any) => {
        const { key } = e;
        dispatch({
            type: 'modules/resetSelectedRow',
            payload: {
                moduleName: moduleState.moduleName,
                type : key
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
                <span style={{ cursor: 'pointer' }}><CheckCircleOutlined />
                    <Badge count={count} style={{ backgroundColor: '#108ee9', marginLeft: '2px' }} />
                </span>
            </Dropdown>
        </Tooltip>
    else
        return <Tooltip title='未选中记录'>
            <CheckCircleOutlined style={{ cursor: 'pointer' }} />
        </Tooltip>
}

export default SelectionButton;