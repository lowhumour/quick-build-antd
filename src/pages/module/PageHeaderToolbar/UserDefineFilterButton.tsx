import React from 'react';
import { Tooltip, Button } from 'antd';
import { FilterOutlined, FilterFilled } from '@ant-design/icons';
import { ModuleState } from '../data';

const UserDefineFilterButton = ({ moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: any }) => {
    const { moduleName } = moduleState;
    const visible = moduleState.currSetting.userFilterRegionVisible;
    const changeVisible = () => {
        dispatch({
            type: 'modules/toggleUserFilter',
            payload: {
                moduleName,
            }
        })
    }
    return <Tooltip title={visible ? "隐藏自定义筛选条件" : "显示自定义筛选条件"}>
        <Button type={visible ? "link" : "text"} size="small" onClick={changeVisible} style={{padding : '0px'}}>
            {visible ? <FilterFilled /> : <FilterOutlined />} 筛选</Button>
    </Tooltip>
}

export default UserDefineFilterButton;

//<Switch checkedChildren={<><FilterFilled /> 显示</>} unCheckedChildren={<><FilterOutlined /> 关闭</>} defaultChecked />
