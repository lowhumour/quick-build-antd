import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { Table, Tooltip, Space } from 'antd';
import { PaginationConfig } from 'antd/lib/pagination';
import { ReloadOutlined } from '@ant-design/icons';
import {
    Key, SorterResult, TableCurrentDataSource,
    TablePaginationConfig
} from 'antd/lib/table/interface';
import { isGridSorterChanged } from './sortUtils';
import { ModuleModal, ModuleState } from '../data';
import { getGridColumns } from './fieldsFactory';
import { isGridFilterChanged, getColumnFiltersInfo } from './filterUtils';
import SelectionButton from '../toolbar/SelectionButton';
import GridSchemeButton from './GridSchemeButton';
import { getGridScheme } from '../modules';
import SortInfoButton from './sortInfoButton';

const ModuleGrid = ({ moduleState, moduleInfo, dispatch, fetchLoading , gridType }:
    {
        moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: Dispatch<any>, fetchLoading: boolean,
        gridType : any
    }) => {

    const { modulename: moduleName } = moduleInfo;
    useEffect(() => {
        dispatch({
            type: 'modules/fetchData',
            payload: {
                moduleName,
            },
        });
    }, [moduleState.dataSourceLoadCount])    // 在moduleInfo.dataSourceLoadCount改变过后重新刷新数据
    console.log('grid renderer.......')

    const pageChanged = (page: number) => {
        // 这里筛选也调用了，要排除掉筛选的事件,筛选改变后，页码会改为1
        if (page !== moduleState.gridParams.curpage)
            dispatch({
                type: 'modules/pageChanged',
                payload: {
                    moduleName,
                    page,
                },
            });
    }

    const onPageSizeChange = (page_: number, size: number) => {
        dispatch({
            type: 'modules/pageSizeChanged',
            payload: {
                moduleName,
                limit: size,
            },
        });
    }

    const handleTableChange = (pagination: PaginationConfig, filters: Record<string, Key[] | null>,
        sorter: SorterResult<any> | SorterResult<any>[], extra: TableCurrentDataSource<any>) => {
        console.log('handleTableChange');
        // 由于三个事件共用一个函数，因此要判断一下是什么事件
        // 如果是column的筛选事件
        if (isGridFilterChanged(moduleState.filters.columnfilter, filters,
            getColumnFiltersInfo(moduleName)))
            dispatch({
                type: 'modules/filterChanged',
                payload: {
                    type: 'columnFilterChange',
                    moduleName,
                    columnfilter: filters,
                },
            });
        // 如果是排序事件
        if (isGridSorterChanged(moduleState.sorts, sorter))
            dispatch({
                type: 'modules/columnSortChanged',
                payload: {
                    moduleName,
                    columnsorter: sorter,
                },
            });
    };

    const handlerSelectedRowKeys = (selectedRowKeys: any[], ) => {
        dispatch({
            type: 'modules/selectedRowKeysChanged',
            payload: {
                moduleName,
                selectedRowKeys,
            }
        })
    }

    const { limit, curpage, total }:
        { limit: number, curpage: number, total: number } = moduleState.gridParams;

    const refreshButton = <Tooltip title="刷新当前页数据"><ReloadOutlined onClick={() => {
        dispatch({
            type: 'modules/fetchData',
            payload: {
                moduleName: moduleInfo.moduleid,
                forceUpdate: true,
            }
        })
    }}></ReloadOutlined>
    </Tooltip>

    const paginationProps: TablePaginationConfig = {
        size: 'small',
        hideOnSinglePage: false,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: limit,
        current: curpage,
        total,
        showTotal: (total, range) =>
            <Space >
                <GridSchemeButton moduleState={moduleState} dispatch={dispatch} />
                <SelectionButton moduleState={moduleState} dispatch={dispatch} />
                <SortInfoButton moduleState={moduleState} dispatch={dispatch} />
                {`显示${range[0]}-${range[1]},共${total}条`}
                {refreshButton}
            </Space>,
        onChange: pageChanged,
        onShowSizeChange: onPageSizeChange,
        position: ["topRight", "bottomRight"],
    };
    const gridScheme: any = getGridScheme(moduleState.currentGridschemeid, moduleInfo);
    const columns = getGridColumns({ gridScheme, moduleInfo, moduleState, dispatch });
    const params: any = {};
    if (gridScheme.width)
        params.scroll = { x: gridScheme.width };
    return <Table
        columns={columns}
        size={gridType=='selectfield' ? 'small' : 'normal'}
        loading={fetchLoading}
        bordered
        showSorterTooltip={false}
        dataSource={moduleState.dataSource}
        rowKey={moduleInfo.primarykey}
        rowSelection={{
            type : gridType == 'selectfield' ? 'radio' : 'checkbox',
            selectedRowKeys: moduleState.selectedRowKeys,
            onChange: handlerSelectedRowKeys,
        }}
        pagination={paginationProps}
        onChange={handleTableChange}
        {...params}
    />
}

export default ModuleGrid;