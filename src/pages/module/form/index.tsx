import React, { useState } from 'react';

import { Modal, Form, Button, message, Space, Tooltip, Drawer } from 'antd';
import moment from 'moment';
import {
    EditOutlined, PlusOutlined, SaveOutlined, CopyOutlined, CloseOutlined,
    PaperClipOutlined
} from '@ant-design/icons';
import { ModuleModal, ModuleFieldType } from '../data';
import { getOneColForm, getTwoColForm } from './formFactory';
import { saveOrUpdateRecord } from '../service';
import { Dispatch } from 'redux';
import { AttachemntRenderer } from '../attachment/utils';
import { getFieldDefine } from '../grid/fieldsFactory';

const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss';

const formOperMode = {
    'display': '显示',
    'insert': '新增',
    'edit': '修改',
    'approve': '审核'
}

const ModuleForm = ({ moduleInfo, dispatch, currRecord, visible, onCancel, formType = '' }:
    { moduleInfo: ModuleModal, dispatch: Dispatch, currRecord: any, visible: boolean, onCancel: any, formType: string }) => {

    //if (!visible) return null;
    console.log('module form ........')
    console.log(currRecord);
    const { modulename: moduleName } = moduleInfo;
    const scheme = moduleInfo.formschemes[0];
    const [form] = Form.useForm();
    // 在保存了新增的记录后，此值置为true
    const [afterInsertState, setAfterInsertState] = useState(false);
    // 从后台返回的错误信息
    const [fieldsValidate, setFieldsValidate] = useState({});
    const [disabled, setDisabled] = useState(false);
    const generateForm = ({ scheme }: { scheme: any }) => {
        let formInstance: any;
        if (scheme.cols == 1)
            formInstance = getOneColForm({ scheme, moduleInfo, currRecord: {}, form, fieldsValidate, disabled });
        else
            formInstance = getTwoColForm({ scheme, moduleInfo, currRecord: {}, form, fieldsValidate, disabled });

        //form.resetFields();
        if (!saveing)
            form.setFieldsValue(convertRecord(currRecord));

        return formInstance;
    }

    const isDateField = (fieldtype: string | null): boolean => {
        if (!fieldtype) return false;
        return 'date datetime timestamp '.indexOf(fieldtype.toLowerCase()) != -1;
    }
    const isPercent = (fieldtype: string | null): boolean => {
        if (!fieldtype) return false;
        return 'percent '.indexOf(fieldtype.toLowerCase()) != -1;
    }

    const convertRecord = (sourRecord: any) => {
        if (!sourRecord) return null;
        const record = { ...sourRecord };
        moduleInfo.fields.forEach((field: ModuleFieldType) => {
            if (isDateField(field.fieldtype)) {
                if (sourRecord[field.fieldname]) {
                    record[field.fieldname] = moment(sourRecord[field.fieldname], DATEFORMAT);
                }
            } else if (isPercent(field.fieldtype) && record[field.fieldname]) {
                // 百分比在编辑的时候要 * 100，编辑后除以100
                record[field.fieldname] = record[field.fieldname] * 100;
            }
        })
        console.log(sourRecord);
        console.log(record);
        return record;

    }

    /**
     * 比较二个对象的不同字段，返回dest与sour不同的字段
     */
    const changedObject = ({ desc, sour }: { desc: object, sour: object }) => {

        console.log('当前currRecord');
        console.log(sour);
        console.log('修改后的');
        console.log(desc);
        // 把相同的值去掉，不返回值
        for (var key in desc) {
            const field = getFieldDefine(key, moduleInfo);
            if (field && isDateField(field.fieldtype)) {
                if (!desc[key]) {            //原来是空，现在也是空
                    if (!sour[key]) {
                        delete desc[key];
                    }
                } else
                    if (desc[key].isSame(sour[key], DATEFORMAT))
                        delete desc[key];
            } else if (isPercent(field.fieldtype) && desc[key]) {
                // 百分比在编辑的时候要 * 100，编辑后除以100
                desc[key] = parseFloat((desc[key] / 100).toFixed(4));
                if (desc[key] === currRecord[key]) {
                    delete desc[key];
                }
            } else {
                if (desc[key] === currRecord[key]) {
                    delete desc[key];
                }
            }
        }
        console.log('修改过的字段');
        console.log(desc);
        return desc;
    }




    const onInsertCancel = () => {
        setTimeout(() => {
            setDisabled(false);
            setAfterInsertState(false);
            setFieldsValidate({});
            form.resetFields();
        }, 10);
        onCancel();
    }

    const getTitle = () => {

        console.log('gettitle');
        console.log(currRecord);
        const title = currRecord[moduleInfo.namefield];
        const getTitle = () => {
            return <Space>{formType === 'edit' ? <EditOutlined /> : formType === 'insert' ? <PlusOutlined /> : 'othertype'}
                <span style={{ fontWeight: 400, marginLeft: '4px' }}> {moduleInfo.objectname}</span>
                {title ? ' 『 ' + title + '』' : null}
            </Space>
        }
        const getAttachmentButton = () => {
            if (moduleInfo.moduleLimit.hasattachment && moduleInfo.userLimit.attachment?.query &&
                currRecord[moduleInfo.primarykey]
            ) {
                return <AttachemntRenderer value={currRecord?.attachmenttooltip} record={currRecord} _recno={0}
                    moduleInfo={moduleInfo} dispatch={dispatch} isLink={false} />
            } else return null;
        }
        return <span style={{ display: 'flex' }} >
            {getTitle()}
            <span style={{ flex: 1 }}></span>
            <Space>
                {getAttachmentButton()}
                <Tooltip title="关闭窗口"><CloseOutlined onClick={() => onInsertCancel()} /></Tooltip>
            </Space></span>;
    }

    const [saveing, setSaving] = useState(false);

    const getFooter = () => {
        const closeButton = <Button onClick={() => onInsertCancel()}><CloseOutlined />关闭</Button>;

        // 在新增保存后，如果有修改权限，则可对当前记录进行修改
        const editAfterInsertButton = <Button onClick={() => {
            setDisabled(false);
            dispatch({
                type: 'modules/toggleFormVisible',
                payload: {
                    moduleName,
                    visible: true,
                    formType: 'edit',
                }
            })
        }}><EditOutlined />修改</Button>;
        const startApproveAfterInsertButton = <Button>启动流程</Button>;
        const insertButton = <Button type="primary"
            onClick={() => {
                setDisabled(false);
                form.resetFields();
                form.setFieldsValue({});
                setAfterInsertState(false);
                dispatch({
                    type: 'modules/toggleFormVisible',
                    payload: {
                        moduleName,
                        visible: true,
                        currRecord: {}
                    }
                })
            }}><PlusOutlined />继续新增</Button>;
        const copyInsertButton = <Button type="default"
            onClick={() => {
                setDisabled(false);
                setAfterInsertState(false)
            }}><CopyOutlined />复制新增</Button>;
        const saveInsertButton = <Button type="primary" loading={saveing}
            onClick={() => { saveRecord(); }}><SaveOutlined />保存</Button>
        const saveEditButton = <Button type="primary" loading={saveing}
            onClick={() => { saveRecord(); }}><SaveOutlined />保存</Button>
        if (formType === 'insert') {
            if (afterInsertState) {
                return <>
                    <span style={{ float: "left" }}>
                        {editAfterInsertButton}
                        {startApproveAfterInsertButton}
                    </span>
                    {closeButton}
                    {copyInsertButton}
                    {insertButton}
                </>
            } else {
                return <>{closeButton}{saveInsertButton}</>
            }
        } else
            return <>{closeButton}{saveEditButton}</>
    }


    const generateCommitValues = (formValues: object) => {
        const values = { ...formValues };
        if (formType == 'edit') {
            changedObject({
                desc: values,
                sour: currRecord,
            })
            // 加入主键，主键这里不能修改，如果修改了主键另外处理
            values[moduleInfo.primarykey] = currRecord[moduleInfo.primarykey];
        }
        return values;
    }

    const saveRecord = () => {
        form.validateFields().then(values => {
            console.log(values);
            //setFieldsValidate({});
            setFieldsValidate({});
            setSaving(true);
            saveOrUpdateRecord({
                moduleName,
                opertype: formType,
                data: generateCommitValues(values),
            }).then((response: any) => {
                console.log(response);
                const { data: record } = response;
                if (response.success) {
                    if (formType == 'insert') {
                        setAfterInsertState(true);
                        setDisabled(true);
                    }
                    message.success(moduleInfo.objectname + `『${record[moduleInfo.namefield]}』保存成功！`);
                    if (formType == 'insert')
                        dispatch({
                            type: 'modules/insertRecord',
                            payload: {
                                moduleName,
                                record: response.data,
                                setCurrRecord: true,
                            }
                        })
                    else dispatch({
                        type: 'modules/updateRecord',
                        payload: {
                            moduleName,
                            record: response.data,
                            setCurrRecord: true,
                        }
                    })
                } else {
                    setFieldsValidate(response.data);
                    Modal.error({
                        title: '保存记录时发生错误',
                        content: JSON.stringify(response.data),
                        okText: '确 定',
                        onOk() {
                        },
                    });
                }
                setSaving(false);
            })

        }).catch(errorInfo => {
            console.log(errorInfo)
        });
    }
    const width = scheme.width + 'px';
    return <Modal
        title={getTitle()}
        visible={visible}
        //onCancel={onInsertCancel}
        width={width}
        closable={false}
        footer={getFooter()}
        bodyStyle={{ maxHeight: '600px', overflow: 'scroll' }}
    >
        {generateForm({ scheme })}
        {/* {JSON.stringify(currRecord)} */}
    </Modal>


}



export default ModuleForm;
