import React from 'react';
import { Button, Space, Tooltip, message, } from 'antd';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import { ModuleModal, ModuleState, TextValue } from "../data";
import FilterInfoButton from './FilterInfoButton';
import styles from './toolbar.less';
import ExportButton from './ExportButton';
import BatchOperateButton from './BatchOperateButton';

const ModuleToolbar = ({ moduleState, moduleInfo, dispatch, manyToOneInfo }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any, manyToOneInfo: any }) => {
    console.log('toolbar renderer.......')
    return <span>
        <Space size="small">
            <Button type="primary" onClick={() => {
                dispatch({
                    type: 'modules/toggleFormVisible',
                    payload: {
                        moduleName: moduleState.moduleName,
                        formType: 'insert',
                        currRecord: {},
                    }
                })
            }}><PlusOutlined /> 新建 </Button>
            <Link to="/module/FDictionarygroup/new">new</Link>
            <ExportButton moduleInfo={moduleInfo}></ExportButton>
            <Tooltip title="设置"><SettingOutlined className={styles.iconToolbar}></SettingOutlined></Tooltip>
            <FilterInfoButton moduleState={moduleState} dispatch={dispatch} ></FilterInfoButton>
            {moduleState.selectedRowKeys.length ?
                <BatchOperateButton moduleState={moduleState} dispatch={dispatch} /> : null}
            {/* <SelectionButton moduleState={moduleState} /> */}
            {manyToOneInfo ? <Button onClick={() => {
                if (moduleState.selectedRowKeys.length == 0) {
                    message.warning(`请先选择一条${moduleInfo.objectname}记录，再执行此操作！`);
                    return;
                }
                const selectValue = moduleState.selectedRowKeys[0];
                manyToOneInfo.setTextValue(moduleState.selectedTextValue.find((rec: TextValue) => rec.value == selectValue));
            }
            }>选中返回</Button> : null}
        </Space>
    </span >
}

export default ModuleToolbar;