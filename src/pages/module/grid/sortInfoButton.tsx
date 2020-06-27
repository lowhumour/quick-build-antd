import React from 'react';
import { Dropdown, Menu, Button } from 'antd';
import { Dispatch } from 'redux';
import { SortAscendingOutlined, DownOutlined } from '@ant-design/icons';
import { ModuleState, ModuleModal } from '../data';
import { getModuleInfo, getSortSchemes } from '../modules';


const menu = (
    <Menu>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                1st menu item
        </a>
        </Menu.Item>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                2nd menu item
        </a>
        </Menu.Item>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                3rd menu item
        </a>
        </Menu.Item>
        <Menu.Item danger>a danger item</Menu.Item>
    </Menu>
);

const SortInfoButton = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: Dispatch }) => {
    const { moduleName } = moduleState;
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);
    const schemes: any[] = getSortSchemes(moduleInfo);
    //if (schemes.length < 2) return <span style={{ visibility: 'hidden', width: '0px' }}>1</span>;
    return <Dropdown overlay={menu}>
        <Button size="small" type="text"><SortAscendingOutlined /><DownOutlined /></Button>
    </Dropdown>


}

export default SortInfoButton;