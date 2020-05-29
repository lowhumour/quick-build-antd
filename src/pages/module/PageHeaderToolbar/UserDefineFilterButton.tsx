import React from 'react';
import { Tooltip } from 'antd';
import { FilterOutlined, FilterFilled } from '@ant-design/icons';
import { ModuleState } from '../data';


const UserDefineFilterButton = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: any }) => {
    const { moduleName } = moduleState;
    const changeVisible = () => {
        dispatch({
            type: 'modules/toggleUserFilter',
            payload: {
                moduleName,
            }
        })
    }
    return (
        !moduleState.currSetting.userFilterRegionVisible ?
            <Tooltip title="显示自定义筛选条件">
                <span style={{ cursor: 'pointer' }} onClick={changeVisible} >
                    <FilterOutlined style={{ paddingTop: '2px' }} /> 筛选</span>
            </Tooltip> :
            <Tooltip title="隐藏自定义筛选条件">
                <span style={{ color: 'blue', cursor: 'pointer' }} onClick={changeVisible} >
                    <FilterFilled style={{ paddingTop: '2px' }} /> 筛选</span>
            </Tooltip>
    )
}

export default UserDefineFilterButton;