import React, { useEffect } from 'react';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Spin, Card, Skeleton, Row, Col, Drawer } from 'antd';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import ModuleGrid from './grid';
import { ModuleModal, ModuleState } from './data';
import ModuleToolbar from './toolbar';
import Navigate from './navigate';
import PageHeaderToolbar from './PageHeaderToolbar';
import UserDefineFilter from './UserDefineFilter';
import { getModuleInfo } from './modules';
import ModuleForm from './form';

interface ModuleProps {
    dispatch: Dispatch<any>;
    moduleInfoLoading: boolean;
    fetchLoading: boolean;
    route: any;
    pModuleName: string;
    //当前grid的类型，normal,normalwithparentfilter,onetomanygrid,selectfield,datamining,dataminingdetail
    gridType: 'normal' | 'normalwithparentfilter' | 'onetomanygrid' | 'selectfield' | 'datamining' | 'dataminingdetail' | undefined;
    manyToOneInfo: any,
    modules: [];
}

const navigates: any = {};
const getNavigate = ({ moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any }) => {
    if (!navigates[moduleInfo.modulename])
        navigates[moduleInfo.modulename] =
            <Navigate moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch} />;
    return navigates[moduleInfo.modulename];
}

const Module: React.FC<ModuleProps> = ({ gridType, pModuleName, manyToOneInfo, route, dispatch, modules, moduleInfoLoading, fetchLoading }) => {

    const moduleid = pModuleName || route.name;
    const moduleName = moduleid;
    const moduleState: ModuleState = modules[moduleName];

    console.log('main module renderer.......')
    useEffect(() => {
        // 如果模块的定义信息还没有加载，则先去加载
        if (!moduleState)
            dispatch({
                type: 'modules/fetchModuleInfo',
                payload: {
                    moduleid: moduleid,
                }
            })
    }, [])

    if (!moduleState)
        return <PageHeaderWrapper>
            <Spin size="large">
                <Card style={{ textAlign: 'center' }}>
                    <Skeleton paragraph={{ rows: 6 }} />
                </Card>
            </Spin>
        </PageHeaderWrapper>

    const moduleInfo: ModuleModal = getModuleInfo(moduleid);
    const { type, position } = moduleState.currSetting.navigate;
    const hasCardNavigate = moduleInfo.navigateSchemes.length && type === 'card';
    const navVisible = moduleState.currSetting.navigate.visible;
    const gridArea =
        <>{moduleState.currSetting.userFilterRegionVisible ?
            <UserDefineFilter moduleInfo={moduleInfo} dispatch={dispatch} /> : null}
            <Card style={{ marginBottom: '20px' }}>
                <ModuleToolbar moduleInfo={moduleInfo} moduleState={moduleState} manyToOneInfo={manyToOneInfo}
                    dispatch={dispatch} ></ModuleToolbar>
                <ModuleGrid moduleInfo={moduleInfo} moduleState={moduleState} gridType={gridType}
                    dispatch={dispatch} fetchLoading={fetchLoading}></ModuleGrid>
            </Card></>
    const naviArea = getNavigate({ moduleState, moduleInfo, dispatch })
    // <Navigate moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch} />;
    let twoArea;
    if (hasCardNavigate && navVisible) {
        twoArea =
            <Row gutter={16}>
                {position == "left" ? <Col lg={6} md={24}>
                    {naviArea}
                </Col> : null}
                <Col lg={18} md={24}>
                    {gridArea}
                </Col>
                {position == "right" ? <Col lg={6} md={24}>
                    {naviArea}
                </Col> : null}
            </Row>
    }

    const toggleNavigateVisible = () => {
        dispatch({
            type: 'modules/toggleNavigate',
            payload: {
                moduleName,
                toggle: 'visible',
            }
        })
    }

    const moduleForm = <ModuleForm moduleInfo={moduleInfo} formType={moduleState.currSetting.formType}
        visible={moduleState.currSetting.formVisible}
        dispatch={dispatch}
        currRecord={moduleState.currSetting.currRecord}
        onCancel={() => {
            dispatch({
                type: 'modules/toggleFormVisible',
                payload: {
                    moduleName
                }
            })
        }}
    />

    const drawerNavigate = type == "drawer" ?
        <Drawer bodyStyle={{ padding: '12px' }}
            placement={position}
            closable={false}
            visible={navVisible}
            width={380}
            onClose={toggleNavigateVisible}
        >{naviArea}</Drawer> : null

    const pageHeaderToolbar = <PageHeaderToolbar moduleState={moduleState} moduleInfo={moduleInfo} dispatch={dispatch} />

    const moduleDescription = moduleInfo.description ?
        <span dangerouslySetInnerHTML={{ __html: moduleInfo.description || '' }}></span> : null;
    const spanid: string = new Date().getTime() + '';

    if (gridType == 'selectfield')
        setTimeout(() => {
            let pnode: any = document.getElementById(spanid);
            if (!pnode) return;
            while (pnode) {
                if (pnode.className === 'ant-pro-grid-content')
                    break;
                pnode = pnode.parentNode;
            }
            let breadcrumbChild = pnode.childNodes[0].childNodes[0];
            breadcrumbChild.style.visibility = 'hidden';
            breadcrumbChild.style.height = '0px';
        }, 0);

    return (
        <PageHeaderWrapper style1={{ backgroundColor: 'aliceblue' }}
            title={(gridType == 'selectfield' ? '选择 ' : '') + moduleInfo.objectname}
            extra={
               <span> <ModuleToolbar moduleInfo={moduleInfo} moduleState={moduleState} manyToOneInfo={manyToOneInfo}
                dispatch={dispatch} ></ModuleToolbar>
                {pageHeaderToolbar} </span>}
            content={moduleDescription}
            extraContent={<span id={spanid}> </span>}>
            <GridContent>
                {hasCardNavigate && navVisible ? twoArea : gridArea}
            </GridContent>
            {drawerNavigate}
            {moduleForm}
        </PageHeaderWrapper >)
}


export default connect(({ modules, loading }:
    {
        modules: any,
        loading: { effects: { [key: string]: boolean } }
    }) => ({
        modules,
        moduleInfoLoading: loading.effects['modules/fetchModuleInfo'],
        fetchLoading: loading.effects['modules/fetchData'] ||
            loading.effects['modules/filterChanged']
    }))(Module);
