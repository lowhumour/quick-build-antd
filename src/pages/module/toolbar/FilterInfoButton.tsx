import React from 'react';
import { List, Badge, Tooltip, Descriptions, Popover, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { ColumnFilter, ModuleState, UserFilter } from "../data";
import styles from './toolbar.less';
import {
    getGridColumnFiltersDescription,
    getColumnFiltersInfo,
    getOperateTitle,
    getAllFilterCount
} from '../grid/filterUtils';
import { changeUserFilterToParam } from '../UserDefineFilter';

const { Item } = Descriptions;

const FilterInfoButton = ({ moduleState: moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: any }) => {
    const { moduleName } = moduleState;
    const allColumnFilter = getGridColumnFiltersDescription(moduleState.filters.columnfilter || [],
        getColumnFiltersInfo(moduleName), '<br/>');
    const columnFilterMenu = (
        <List style={{ border: '1px solid #f0f0f0', }} size="small">
            <List.Item key="info"
                actions={[<a onClick={() => {
                    dispatch({
                        type: 'modules/filterChanged',
                        payload: {
                            moduleName,
                            type: 'clearAllColumnFilter'
                        }
                    })
                }} key="removeAll">全部取消</a>]}
            >
                <b>表头筛选条件</b>
            </List.Item>
            {allColumnFilter.map((item: ColumnFilter, index: number) => {
                return <List.Item >
                    <Descriptions bordered={false} column={5} size="small" style={{ width: 420 }}>
                        <Item style={{ width: 25, paddingBottom: 0 }} key="no.">
                            {index + 1}.</Item>
                        <Item style={{ width: 100, paddingBottom: 0 }} key="property">{item.property}</Item>
                        <Item style={{ width: 60, paddingBottom: 0 }} key="operator">
                            <span>{getOperateTitle(item.operator)}</span></Item>
                        <Item style={{ width: 205, paddingBottom: 0 }} key="value">
                            <span dangerouslySetInnerHTML={{ __html: item.value }}></span>
                        </Item>
                        <Item style={{ width: 40, paddingBottom: 0 }} key="action">
                            <a onClick={() => {
                                dispatch({
                                    type: 'modules/filterChanged',
                                    payload: {
                                        type: 'clearColumnFilter',
                                        moduleName,
                                        dataIndex: item.dataIndex,
                                    }
                                })
                            }} key="remove">取消</a></Item>
                    </Descriptions>
                </List.Item>
            })}
        </List>
    )

    const navigateFilterMenu = (
        <List style={{ border: '1px solid #f0f0f0', }} size="small">
            <List.Item key="info"
                actions={[<a onClick={() => {
                    dispatch({
                        type: 'modules/filterChanged',
                        payload: {
                            type: 'clearNavigateFilter',
                            moduleName,
                            index: -1,
                        }
                    })
                }} key="removeAll">全部取消</a>]}
            >
                <b>导航条件列表</b>
            </List.Item>
            {moduleState.filters.navigate?.map((item: any, index: number) => {
                return <List.Item >
                    <Descriptions bordered={false} column={5} size="small" style={{ width: 420 }}>
                        <Item style={{ width: 25, paddingBottom: 0 }} key="no.">
                            {index + 1}.</Item>
                        <Item style={{ width: 100, paddingBottom: 0 }} key="property">{item.fieldtitle}</Item>
                        <Item style={{ width: 60, paddingBottom: 0 }} key="operator">
                            <span>{getOperateTitle(item.operator)}</span></Item>
                        <Item style={{ width: 205, paddingBottom: 0 }} key="value">
                            <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                        </Item>
                        <Item style={{ width: 40, paddingBottom: 0 }} key="action">
                            <a onClick={() => {
                                dispatch({
                                    type: 'modules/filterChanged',
                                    payload: {
                                        type: 'clearNavigateFilter',
                                        moduleName,
                                        index: index,
                                    }
                                })
                            }} key="remove">取消</a></Item>
                    </Descriptions>
                </List.Item>
            })}
        </List>
    )
    const viewSchemeMenu = <List style={{ border: '1px solid #f0f0f0', }} size="small">
        <List.Item key="info"
            actions={[<a onClick={() => {
                dispatch({
                    type: 'modules/filterChanged',
                    payload: {
                        type: 'viewSchemeChange',
                        moduleName,
                        viewSchemeChanged: {},
                    }
                })
            }} key="removeAll">取消</a>]}
        >
            <b>视图方案：{moduleState.filters.viewscheme.title}</b>
        </List.Item></List>

    const userFilter = changeUserFilterToParam(moduleState.filters.userfilter, true);
    const userFilterMenu = <List style={{ border: '1px solid #f0f0f0', }} size="small">
        <List.Item key="info"
            actions={[<a onClick={() => {
                dispatch({
                    type: 'modules/filterChanged',
                    payload: {
                        type: 'clearUserFilter',
                        moduleName,
                    }
                })
            }} key="removeAll">全部取消</a>]}
        >
            <b>自定义条件列表</b>
        </List.Item>



        {userFilter.map((item: UserFilter, index: number) => {
            return <List.Item >
                <Descriptions bordered={false} column={5} size="small" style={{ width: 420 }}>
                    <Item style={{ width: 25, paddingBottom: 0 }} key="no.">
                        {index + 1}.</Item>
                    <Item style={{ width: 100, paddingBottom: 0 }} key="title">{item.title}</Item>
                    <Item style={{ width: 60, paddingBottom: 0 }} key="operator">
                        <span>{getOperateTitle(item.operator)}</span></Item>
                    <Item style={{ width: 205, paddingBottom: 0 }} key="value">
                        <span dangerouslySetInnerHTML={{ __html: item.value }}></span>
                    </Item>
                    <Item style={{ width: 40, paddingBottom: 0 }} key="action">
                        <a onClick={() => {
                            dispatch({
                                type: 'modules/filterChanged',
                                payload: {
                                    type: 'clearColumnFilter',
                                    moduleName,
                                    dataIndex: item.property,
                                }
                            })
                        }} key="remove">取消</a></Item>
                </Descriptions>
            </List.Item>
        })}




    </List>


    const getAllMenu = () => <Space direction="vertical">
        {(moduleState.filters.viewscheme.viewschemeid ? viewSchemeMenu : null)}
        {(moduleState.filters.navigate && moduleState.filters.navigate.length > 0 ? navigateFilterMenu : null)}
        {(allColumnFilter.length > 0) ? columnFilterMenu : null}
        {(userFilter.length > 0) ? userFilterMenu : null}
    </Space>

    const allFilter: number = getAllFilterCount(moduleState)
    return allFilter > 0 ?
        <Tooltip title={"筛选条件: " + allFilter + "个"}>
            <Popover content={getAllMenu()} trigger={['click']} placement="bottom">
                <Badge count={allFilter} dot={false} offset={[-10, 0]}
                    style={{ backgroundColor: '#108ee9' }}>
                    <FilterOutlined className={styles.iconToolbar} style={{ paddingRight: 20 }}></FilterOutlined>
                </Badge>
            </Popover>
        </Tooltip> :
        <Tooltip title={"无筛选条件"}>
            <FilterOutlined className={styles.iconToolbar}></FilterOutlined>
        </Tooltip>
}
export default FilterInfoButton;