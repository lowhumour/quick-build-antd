import React from 'react';
import { Space } from 'antd';
import { ModuleModal, ModuleState } from '../data';
import NavigateButton from './NavigateButton';
import ViewSchemeButton from './ViewSchemeButton';
import UserDefineFilterButton from './UserDefineFilterButton';

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
        <UserDefineFilterButton moduleState={moduleState} dispatch={dispatch}></UserDefineFilterButton>
        <span></span><span></span>
    </Space>

})

export default PageHeaderToolbar;
