import React from 'react';
import { Tooltip } from 'antd';
import { BsCursor, BsCursorFill } from 'react-icons/bs';
import { ModuleState } from "../data";


const NavigateButton = ({ moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: any }) => {
    const { moduleName } = moduleState;
    const changeVisible = () => {
        dispatch({
            type: 'modules/toggleNavigate',
            payload: {
                moduleName,
                toggle: 'visible',
            }
        })
    }
    return (
        !moduleState.currSetting.navigate.visible ?
            <Tooltip title="显示导航">
                <span style={{ cursor: 'pointer' }} onClick={changeVisible} >
                    <BsCursor style={{ paddingTop: '2px' }} /> 导航</span>
            </Tooltip> :
            <Tooltip title="隐藏导航">
                <span style={{ color: 'blue', cursor: 'pointer' }} onClick={changeVisible} >
                    <BsCursorFill style={{ paddingTop: '2px' }} /> 导航</span>
            </Tooltip>
    )
}

export default NavigateButton;