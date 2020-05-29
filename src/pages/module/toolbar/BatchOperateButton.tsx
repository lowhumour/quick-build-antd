import React, { useState } from 'react';
import { Dropdown, Menu, Button, Modal, notification } from 'antd';
import { DeleteOutlined, ExportOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ModuleState, ModuleModal } from '../data';
import { Dispatch } from 'redux';
import { getModuleInfo, canDelete } from '../modules';
import { deleteModuleRecords } from '../service';



const BatchOperateButton = ({ moduleState, dispatch }:
    { moduleState: ModuleState, dispatch: Dispatch }) => {
    const { moduleName } = moduleState;
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);


    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const titles: string[] = moduleState.selectedRowKeys.map((key: string): any =>
        moduleState.selectedTextValue.find((rec) => rec.value == key)?.text
    )
    const text = '<ol style="list-style-type:decimal;"><li>' + titles.join('</li><li>') + '</li></ol>';
    const deleteTitle = <><QuestionCircleOutlined
        style={{ color: '#faad14', fontSize: '18px', marginRight: '6px' }} />
        {`确定要删除${moduleInfo.objectname}当前选中的 ${moduleState.selectedRowKeys.length} 条记录吗?`}</>

    const onConfireDelete = () => {
        setConfirmLoading(true);
        // params : {
        //   moduleName : grid.moduleInfo.fDataobject.objectname,
        //   ids : grid.getSelectionIds().join(","),
        //   titles : grid.getSelectionTitleTpl().join("~~")
        // },
        deleteModuleRecords({
            moduleName,
            ids: moduleState.selectedRowKeys.join(','),
            titles: titles.join('~~'),
        }).then((response: any) => {
            // private Integer resultCode;
            // private List<String> okMessageList;
            // private List<String> errorMessageList;
            // private List<String> okIds;
            // private List<String> errorIds;
            if (response.resultCode == 0 || response.okMessageList.length > 0) {
                const okText = '<ol style="list-style-type:decimal;"><li>' +
                    response.okMessageList.join('</li><li>') + '</li></ol>';
                notification.success({
                    message: `${moduleInfo.objectname}以下 ${response.okMessageList.length} 条记录已被删除`,
                    description: <span dangerouslySetInnerHTML={{ __html: okText }} />,
                })
                // 从选中的记录中删除已经被删除的
                const selectedRowKeys = moduleState.selectedRowKeys.filter((key: string) =>
                    response.okIds.find((id: string) => id == key) === undefined)
                dispatch({
                    type: 'modules/selectedRowKeysChanged',
                    payload: {
                        moduleName,
                        forceUpdate: true,
                        selectedRowKeys,
                    }
                })
            }
            if (response.errorMessageList.length > 0) {
                const errorText = '<ol style="list-style-type:decimal;"><li>' +
                    response.errorMessageList.join('</li><li>') + '</li></ol>';
                Modal.warning({
                    width: 550,
                    okText: '知道了',
                    title: `${moduleInfo.objectname}以下 ${response.errorMessageList.length} 条记录删除失败`,
                    content: <span dangerouslySetInnerHTML={{ __html: errorText }} />,
                });
            }
        }).finally(() => {
            setConfirmLoading(false);
            setDeleteModalVisible(false);
        })
    }


    const menu = <Menu>
        {canDelete(moduleInfo) ?
            <Menu.Item key="deleteSelectRecords" icon={<DeleteOutlined />}
                onClick={() => setDeleteModalVisible(true)}
            >删除选中记录</Menu.Item> : null}
        <Menu.Divider />
        <Menu.Item key="exportSelectRecord" icon={<ExportOutlined />}>导出选中记录</Menu.Item>
    </Menu>


    return <>
        <Dropdown overlay={menu} >
            <Button>批量操作</Button>
        </Dropdown>

        <Modal title={deleteTitle}
            visible={deleteModalVisible}
            okText={<><DeleteOutlined /> 删 除</>}
            okType='primary'
            onOk={onConfireDelete}
            onCancel={() => setDeleteModalVisible(false)}
            confirmLoading={confirmLoading}
        >
            <span dangerouslySetInnerHTML={{ __html: text }} />
        </Modal>
    </>


}

export default BatchOperateButton;