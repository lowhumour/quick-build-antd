import React from 'react';
import { Space } from 'antd';
import { ModuleModal, ModuleState } from '../data';
import NavigateButton from './NavigateButton';
import ViewSchemeButton from './ViewSchemeButton';
import UserDefineFilterButton from './UserDefineFilterButton';
import { getFilterScheme } from '../modules';

const PageHeaderToolbar = (({ moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any }) => {

    return <Space size="middle">

        {
            Object.keys(moduleInfo.viewschemes).length ? <ViewSchemeButton
                moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch}
            ></ViewSchemeButton> : null
        }

        {moduleInfo.navigateSchemes.length > 0 ?
            <NavigateButton moduleState={moduleState} dispatch={dispatch} /> : null}
        {getFilterScheme(moduleInfo) ?
            <UserDefineFilterButton moduleState={moduleState} dispatch={dispatch} /> : null}
        <span></span><span></span>
    </Space>

})

export default PageHeaderToolbar;
