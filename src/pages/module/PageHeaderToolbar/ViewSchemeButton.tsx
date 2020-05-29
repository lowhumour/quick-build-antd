import React from 'react';
import { Menu, Dropdown } from 'antd';
import { ApiOutlined, CheckOutlined } from '@ant-design/icons';
import { ModuleModal, ViewSchemeType, TextValue, ModuleState } from "../data";

const getViewSchemes = (schemes: any): TextValue[] => {
    const result: TextValue[] = new Array();
    schemes.system?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    schemes.owner?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    schemes.othershare?.forEach((scheme: ViewSchemeType) =>
        result.push({ text: scheme.title, value: scheme.viewschemeid }))
    return result;
}

const spaceIcon = <ApiOutlined style={{ visibility: 'hidden' }} />;
const selectIcon = <CheckOutlined />

const ViewSchemeButton = ({ moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any }) => {
    const { modulename: moduleName, viewschemes } = moduleInfo;
    const { filters } = moduleState;
    const { viewscheme: currScheme }: { viewscheme: any } = filters;
    const handleMenuClick = (e: any) => {
        const { key }: { key: string } = e;
        dispatch({
            type: 'modules/filterChanged',
            payload: {
                type : 'viewSchemeChange',
                moduleName,
                viewscheme: key === 'cancelviewscheme' ? {} :
                    {
                        viewschemeid: key,
                        title: getViewSchemes(viewschemes).
                            find((scheme: TextValue) => scheme.value === key)?.text
                    },
            }
        })
    }

    const menu =
        <Menu onClick={handleMenuClick} key="navigateScheme">
            {currScheme.title ? <Menu.Item key='cancelviewscheme' icon={spaceIcon}>取消视图方案</Menu.Item> : null}
            {currScheme.title ? <Menu.Divider /> : null}
            {getViewSchemes(viewschemes).map((scheme) =>
                <Menu.Item key={scheme.value}
                    icon={currScheme.viewschemeid == scheme.value ? selectIcon : spaceIcon}>{scheme.text}
                </Menu.Item>)}
        </Menu>
    return <Dropdown overlay={menu}>
        <span style={{ cursor: 'pointer', color: currScheme.title ? 'blue' : '' }}>
            <ApiOutlined /> 视图方案 {currScheme.title ? '：' + currScheme.title : null}</span>
    </Dropdown>
}

export default ViewSchemeButton;