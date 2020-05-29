import React, { useState, useRef } from 'react';
import Highlighter from 'react-highlight-words';
import { Card, Tabs, Tree, Space, Tooltip, Input } from 'antd';
import {
    CloseOutlined, ShrinkOutlined, ArrowsAltOutlined, ReloadOutlined,
    NodeExpandOutlined, NodeCollapseOutlined, LinkOutlined, DisconnectOutlined,
    EllipsisOutlined, MoreOutlined
} from '@ant-design/icons'
import { BsLayoutSidebarInset, BsLayoutSidebarInsetReverse } from 'react-icons/bs';
import { ModuleModal, ModuleState } from '../data';
import { Dispatch } from 'dva';
import { fetchNavigateTreeData } from '../service';
import { ModuleNavigates, NavigateStateModal } from './data';

const { TabPane } = Tabs;
const { DirectoryTree, TreeNode } = Tree;
const { Search } = Input;

// 所有的模块的导航信息，每次只用到当前模块的数据，state初始化的时候会使用相应模块的数据
const moduleNavigates: ModuleNavigates = {};

// 将修改过的scheme更新进去，并且返回schemes,给state使用
const updateTo = (moduleName: string, updateScheme: NavigateStateModal): NavigateStateModal[] => {
    return moduleNavigates[moduleName] =
        moduleNavigates[moduleName].map((scheme: NavigateStateModal): NavigateStateModal =>
            scheme.navigateschemeid === updateScheme.navigateschemeid ? updateScheme : scheme)
}

// 所有导航当前选中的记录值，这个值没有放在state中，刷新时，每一个导航对属性defaultSelectedKeys进行初始化
const selectedKeys: object = {};
const setSelectedKeys = (navigateschemeid: string, keys: any) => {
    selectedKeys[navigateschemeid] = keys;
}
const getSelectedKeys = (navigateschemeid: string) => {
    return selectedKeys[navigateschemeid];
}

// 每个模块当前选中的活动Tab
const moduleActiveTab: object = {};
const setModuleActiveTab = (moduleName: string, tabName: string) => {
    moduleActiveTab[moduleName] = tabName;
}
const getModuleActiveTab = (moduleName: string, defaultKey: string) => {
    if (!moduleActiveTab[moduleName])
        moduleActiveTab[moduleName] = defaultKey;
    return moduleActiveTab[moduleName];
}

/**
 * 生成DirectoryTree的树形Node
 */
const generateNode = ((node: any, search: string = '') => {
    const getTitle = (node: any) =>
        // 如果有搜索的值，那么对搜索的结果加高亮显示
        <span>{search ? <Highlighter
            highlightStyle={{ color: 'red' }}
            searchWords={[search]}
            textToHighlight={node.text}
        /> : node.text}
            <span style={{ color: 'blue' }}>({node.count})</span>
        </span>;
    const getNode = (node: any, children: any) =>
        <TreeNode title={getTitle(node)} key={node.key} isLeaf={node.isLeaf} data={node} >
            {children}
        </TreeNode>
    if (search) {
        //如果有筛选的值，那么递归查找，满足条件的节点及父节点才会显示
        const find = node.title.indexOf(search) !== -1;
        if (node.isLeaf)
            return find ? getNode(node, null) : null;
        else {
            const children = node.children.map((node: any) => generateNode(node, search)).
                filter((node: any) => node);        // 将null过滤掉
            return find || children.length > 0 ? getNode(node, children) : null
        }
    } else {
        return getNode(node, node.children?.map((node: any) => generateNode(node, search)))
    }
})

// 存放该模块的导航的位置(left,right)和类型(card,drawer),在第一次进入的时候初始化
const navType: Record<string, any> = {};

// 一个模块的导航区域
const Navigate = ({ moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: Dispatch }) => {
    console.log('navigate renderer......')
    const { modulename: moduleName } = moduleInfo;

    // 第一次加载，需要把所有的导航信息生成放在本模块的变量里
    if (!moduleNavigates[moduleName]) {
        moduleNavigates[moduleName] =
            moduleInfo.navigateSchemes.map((scheme): NavigateStateModal => ({
                navigateschemeid: scheme.navigateschemeid,              // 导航方案id
                title: scheme.tf_text,                                  // 导航的名称
                loading: 'needload',                                    // 需要请求数据
                allowNullRecordButton: scheme.tf_allowNullRecordButton, // 是否允许在包含无记录导航之间切换
                isContainNullRecord: scheme.tf_isContainNullRecord,     // 是否包含无记录导航值，当allowNullRecordButton为true时，可以切换
                cascading: scheme.tf_cascading,                         // 是否层级，为false则定义的各级都平级展示，当allLevel大于1时可以切换
                allLevel: scheme.tf_allLevel,                           // 导航定义的层数
                expandedKeys: [],
                canExpandedKeys: [],
                nodeCount: 0,
            }))
    }
    // 当前模块的所有方案的state
    const [schemes, setSchemes] = useState(moduleNavigates[moduleName]);

    const onNavigateSelected = (selectedKeys: any, e: any, navigateschemeid: string) => {
        const { node: { data } } = e;
        // 对于所有的parent,都必须查一个是否有 addParentFilter,有的需要加入上级
        setSelectedKeys(navigateschemeid, selectedKeys);
        const navigates: any[] = [];
        const getFitlers = (node: any, addTo: boolean) => {
            if (addTo && node.moduleName) {
                navigates.push({
                    moduleName: node.moduleName,
                    fieldahead: node.fieldahead,
                    fieldName: node.fieldName,
                    aggregate: node.aggregate,
                    fieldtitle: node.fieldtitle,
                    operator: node.operator,
                    fieldvalue: node.fieldvalue,
                    text: node.text,
                    isCodeLevel: node.isCodeLevel,
                    numberGroupId: node.numberGroupId,
                    schemeDetailId: node.schemeDetailId,
                })
            }
            // 递归加入需要的导航条件
            if (node.parent) {
                getFitlers(node.parent, node.addParentFilter)
            }
        }
        getFitlers(data, true);
        dispatch({
            type: 'modules/filterChanged',
            payload: {
                type : 'navigateSelectChange',
                moduleName,
                navigates,
            }
        })
    }

    const { position, type } = moduleState.currSetting.navigate;
    if (!navType[moduleName]) {
        navType[moduleName] = {};
        navType[moduleName].isCard = type === 'card';
        navType[moduleName].isRight = position === 'right';
    }
    // 改变navigate的属性
    const toggleNavigate = (toggle: string) => {
        if (toggle == 'type')
            navType[moduleName].isCard = !navType[moduleName].isCard;
        if (toggle == 'position')
            navType[moduleName].isRight = !navType[moduleName].isRight;
        dispatch({
            type: 'modules/toggleNavigate',
            payload: {
                moduleName,
                toggle,
            }
        })
    }
    // 刷新当前模块所有的导航数据
    const refreshAllNavigate = () =>
        schemes.forEach((scheme: NavigateStateModal) => { buildNavigateData(scheme) })

    const toggleCascading = (scheme: NavigateStateModal) => {
        scheme.cascading = !scheme.cascading;
        buildNavigateData(scheme)
    }

    const toggleContainNullRecord = (scheme: NavigateStateModal) => {
        scheme.isContainNullRecord = !scheme.isContainNullRecord;
        buildNavigateData(scheme)
    }

    // 生成一个导航树的所有node
    const getTree = (scheme: NavigateStateModal) =>
        <DirectoryTree blockNode
            expandAction='doubleClick'
            onSelect={(selectedKeys, e) =>
                onNavigateSelected(selectedKeys, e, scheme.navigateschemeid)}
            onExpand={(expandedKeys: any, e) =>
                // ,如果导航数据很大，那么此处会比较慢，以后有待优化，最好不要更新state,会刷新此控件,记录多比较耗时
                setSchemes(updateTo(moduleName, { ...scheme, expandedKeys: expandedKeys }))}
            defaultSelectedKeys={getSelectedKeys(scheme.navigateschemeid)}
            expandedKeys={scheme.expandedKeys}
        >
            {scheme.dataSource?.map((node) => generateNode(node, scheme?.search))}
        </DirectoryTree>;

    const cardTool = useRef(null);  // 未使用
    const drawer = useRef(null);    // 未使用
    // 生成导航最上方的附加按钮
    const getExtra = () => <Space>
        {navType[moduleName].isRight ?
            <BsLayoutSidebarInset className="anticon" onClick={() => toggleNavigate('position')} /> :
            <BsLayoutSidebarInsetReverse className="anticon" onClick={() => toggleNavigate('position')} />}
        {navType[moduleName].isCard ?
            <ArrowsAltOutlined ref={cardTool} onClick={() => toggleNavigate('type')} /> :
            <ShrinkOutlined ref={drawer} onClick={() => toggleNavigate('type')} />}
        <Tooltip title="刷新所有导航数据" ><ReloadOutlined onClick={refreshAllNavigate} /></Tooltip>
        <CloseOutlined onClick={() => toggleNavigate('visible')} /> </Space>

    const buildNavigateData = (scheme: NavigateStateModal) => {
        const { title, navigateschemeid, cascading, isContainNullRecord } = scheme;
        if (scheme.loading === 'loading') {
            // console.log(moduleName, navigateschemeid, '导航数据正在加载');
            return;
        }
        setSchemes(updateTo(moduleName, { ...scheme, loading: 'loading', dataSource: [] }));
        fetchNavigateTreeData({ moduleName, title, navigateschemeid, cascading, isContainNullRecord }).then((data) => {
            let expandedKeys: any[] = [];
            let canExpandedKeys: any[] = [];
            let key = 1000;
            let rebuildData = (item: any) => {
                item.title = item.text;
                item.isLeaf = item.leaf;
                item.key = '' + key++;
                if (item.expanded)
                    expandedKeys.push(item.key);
                if (item.children) {
                    canExpandedKeys.push(item.key);
                    item.children.forEach((child: any) => child.parent = item);
                    item.children = item.children.map(rebuildData);
                }
                return item;
            }
            if (data.children && data.children.length > 0)
                data.children[0].expanded = true; //root展开
            const dataSource = data.children.map(rebuildData);
            setSchemes(updateTo(moduleName,
                { ...scheme, expandedKeys, canExpandedKeys, dataSource, loading: 'loaded', nodeCount: key - 1000 }));
        })
    }

    const getTool = (scheme: NavigateStateModal) =>
        //如果是单层导航，并且节点少于15个，并且没有显示无记录导航的按钮，那就整个不显示
        scheme.allLevel === 1 && scheme.nodeCount < 15 && !scheme.allowNullRecordButton ? null :
            <Input.Group size="small" style={{ display: 'flex', paddingBottom: 3 }}>
                <Space >
                    <Tooltip title="全部展开"><NodeExpandOutlined style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setSchemes(updateTo(moduleName, { ...scheme, expandedKeys: [...scheme.canExpandedKeys] }))
                        }}
                    /></Tooltip>
                    <Tooltip title="全部折叠"><NodeCollapseOutlined style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setSchemes(updateTo(moduleName, { ...scheme, expandedKeys: [] }))
                        }} /></Tooltip>
                    {
                        scheme.allLevel > 1 ?
                            (scheme.cascading ?
                                <Tooltip title="并列显示各导航"><DisconnectOutlined style={{ cursor: 'pointer' }}
                                    onClick={() => toggleCascading(scheme)}
                                /></Tooltip> :
                                <Tooltip title="层叠显示各导航"><LinkOutlined style={{ cursor: 'pointer' }}
                                    onClick={() => toggleCascading(scheme)}
                                /></Tooltip>) :
                            null
                    }
                    {
                        scheme.allowNullRecordButton && (scheme.isContainNullRecord ?
                            <Tooltip title="隐藏无记录的导航项目"><MoreOutlined style={{ cursor: 'pointer' }}
                                onClick={() => toggleContainNullRecord(scheme)}
                            /></Tooltip> :
                            <Tooltip title="显示无记录的导航项目"><EllipsisOutlined style={{ cursor: 'pointer' }}
                                onClick={() => toggleContainNullRecord(scheme)}
                            /></Tooltip>)
                    }
                    <span />
                </Space>
                <Search size="middle" placeholder="输入搜索文本" style={{ flex: 1 }}
                    defaultValue={scheme.search} allowClear
                    onSearch={value => setSchemes(updateTo(moduleName, { ...scheme, search: value }))}>
                </Search>
            </Input.Group>

    if (schemes.length > 1)
        return (
            <Card title="导航" bordered={false} extra={getExtra()} size="small">
                <Tabs defaultActiveKey={getModuleActiveTab(moduleName, schemes[0].navigateschemeid)}
                    onChange={(key) => setModuleActiveTab(moduleName, key)}
                    style={{ marginTop: '-10px' }}  >
                    {schemes.map((scheme: NavigateStateModal) => {
                        const { navigateschemeid, title } = scheme;
                        return <TabPane tab={title} key={navigateschemeid}>
                            {scheme.loading === 'loaded' ?
                                <> {getTool(scheme)}{getTree(scheme)}</> :
                                <Card loading bordered={false}>
                                    <>{buildNavigateData(scheme)}</>
                                </Card >}
                        </TabPane>
                    })}
                </Tabs>
            </Card >)
    else {
        const scheme = schemes[0];
        if (scheme.loading === 'loaded')
            return <Card bordered={false} title={<>{scheme.title} 导航</>} extra={getExtra()} size="small">
                <> {getTool(scheme)}{getTree(scheme)}</>
            </Card >
        else {
            buildNavigateData(scheme);
            return <Card loading bordered={false}
                title={<>{scheme.title} 导航</>} extra={getExtra()} size="small">
            </Card >
        }
    }
}

export default Navigate;