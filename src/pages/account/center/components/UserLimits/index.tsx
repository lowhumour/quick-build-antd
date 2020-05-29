import React from 'react';
import { connect } from 'dva';
import { Table, Tag } from 'antd';
import './index.less';
import { userLimitsState, ModalState } from '@/models/accountCenter';

const checkedRender = (value: any) => value ? '●' : null;

const booleanFields = [{
    dataIndex: 'query_',
    text: '可浏览'
}, {
    dataIndex: 'new_',
    text: '可新增'
}, {
    dataIndex: 'newnavigate_',
    text: '新增向导'
}, {
    dataIndex: 'edit_',
    text: '可修改'
}, {
    dataIndex: 'delete_',
    text: '可删除'
}, {
    dataIndex: 'attachmentquery_',
    text: '浏览附件'
}, {
    dataIndex: 'attachmentadd_',
    text: '新增附件'
}, {
    dataIndex: 'attachmentedit_',
    text: '修改附件'
}, {
    dataIndex: 'attachmentdelete_',
    text: '删除附件'
}, {
    dataIndex: 'approvestart_',
    text: '启动流程'
}, {
    dataIndex: 'approvepause_',
    text: '暂停流程'
}, {
    dataIndex: 'approvecancel_',
    text: '取消流程'
}]

const titleColumns =
{
    title: '系统模块或分组',
    dataIndex: 'text',
    render: (value: any) => value,
}

const additionfunction = {
    title: '附加权限',
    dataIndex: 'additionfunction',
    render: (value: any) => {
        let array = null;
        if (Array.isArray(value)) {
            array = value;
        }
        if (typeof value === 'string') {
            array = value.split(',');
        }
        if (array) {
            return array.map((item: string) => <Tag key={item}>{item}</Tag>)
        }
        else return null;
    }
}

const UserLimits: React.FC = (props: any) => {
    const { dispatch, userLimitsLoading } = props;
    const userLimits: userLimitsState = props.userLimits;
    let columns: any = [
        titleColumns
    ];
    let { data, visibleColumn, expandedRowKeys } = userLimits;
    booleanFields.forEach(field => {
        if (visibleColumn[field.dataIndex])
            columns.push({
                title: field.text.split('').map((c) => <>{c}<br /></>),
                dataIndex: field.dataIndex,
                className: 'tdCenter',
                render: checkedRender,
            })
    })
    columns.push(additionfunction);
    columns.forEach((element: any) => {
        element.key = element.dataIndex;
    });
    return <Table
        columns={columns}
        dataSource={data}
        loading={userLimitsLoading}
        expandedRowKeys={expandedRowKeys}
        onExpand={(expanded, record: any) => {
            dispatch({
                type: 'accountCenter/userLimitsOnExpand',
                payload: {
                    expanded,
                    key: record.key,
                }
            })
        }}
        pagination={false}
        size='small'
        bordered
    />
}

export default connect(
    ({
        loading,
        accountCenter,
    }: {
        loading: { effects: { [key: string]: boolean } };
        accountCenter: ModalState;
    }) => ({
        currentUser: accountCenter.currentUser,
        userLimits: accountCenter.userLimits,
        userLimitsLoading: loading.effects['accountCenter/fetchUserLimits'],
    }),
)(UserLimits);