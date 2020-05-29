import React from 'react';
import { connect } from 'dva';
import { Table, PageHeader, Tag, Button, Drawer, Tree, Tabs ,Badge} from 'antd';
import { ModalState } from '@/models/accountCenter';

const { TabPane } = Tabs;
const { DirectoryTree, TreeNode } = Tree;
const dateTimeRender = (value: string | null) => {
    if (value) {
        return value.substring(2, 16)
    }
    return ""
}

const fields = [{
    dataIndex: 'FUser.username',
    title: '登录用户'
}, {
    dataIndex: 'ipaddress',
    title: '登录地址'
},
{
    dataIndex: 'logindate',
    title: '登录时间',
    render: dateTimeRender,
}, {
    dataIndex: 'logoutdate',
    title: '登出时间',
    render: dateTimeRender,
}, {
    dataIndex: 'logouttype',
    title: '登出方式'
}, {
    dataIndex: 'udfloginminute',
    title: <span>登录时长<br />(分钟)</span>,
}
]


class UserLoginLog extends React.Component {

    state = {
        navigateVisible: false,
    }

    handleTableChange = (pagination:any, filters:any, sorter:any) => {
        const { dispatch, currentUser, } = this.props;
        const { current, pageSize } = pagination;
        console.log(pagination)
        dispatch({
            type: 'accountCenter/fetchUserLoginLogs',
            payload: {
                userid: currentUser.userid,
                limit: pageSize,
                page: current,
                start: (current - 1) * pageSize,
            }
        })
    }
    componentDidMount() {
        const { dispatch, currentUser, userLoginLog } = this.props;
        const { current, pageSize } = userLoginLog.pagination;
        dispatch({
            type: 'accountCenter/fetchUserLoginLogs',
            payload: {
                userid: currentUser.userid,
                limit: pageSize,
                page: current,
                start: (current - 1) * pageSize,
            }
        })
    }

    /**
     * 生成DirectoryTree的树形Node
     */
    generateNode = ((data: any) =>
        <TreeNode
            title={data.title}
            key={data.key}
            isLeaf={data.isLeaf}
            raw={data} >
            {data.children && data.children.length > 0 ? data.children.map(this.generateNode) : null}
        </TreeNode>
    )

    onNavigateSelected = (selectedKeys: any, e: any) => {
        const { dispatch } = this.props;
        const { node: { props: { raw } } } = e;
        // 对于所有的parent,都必须查一个是否有 addParentFilter,有的需要加入上级
        const navigates:any[] = [];
        const getFitlers = (node: any, addTo: boolean) => {
            if (addTo && node.moduleName) {
                navigates.push({
                    moduleName: node.moduleName,
                    fieldName: node.fieldName,
                    fieldtitle: node.fieldtitle,
                    operator: node.operator,
                    fieldvalue: node.fieldvalue,
                    text: node.text,
                    schemeDetailId: node.schemeDetailId
                })
            }
            // 递归加入需要的导航条件
            if (node.parent) {
                getFitlers(node.parent, node.addParentFilter)
            }
        }
        getFitlers(raw, true);
        dispatch({
            type: 'accountCenter/navigateChanged',
            payload: {
                navigates: raw.moduleName ? JSON.stringify(navigates) : [],
                curpage: 1,
                limit: 20,
                start: 0,
            }
        })
    }

    render() {
        const userLoginLog: any = this.props['userLoginLog'];
        const { userLoginLogLoading, dispatch } = this.props;
        const { data, pagination, } = userLoginLog;
        const { navigateVisible } = this.state;

        const { navigateData } = userLoginLog;
        // let key = 1;
        // let rebuildData = (item: any) => {
        //     item.title = item.text;
        //     if (item.count){
        //         item.title = <span>{item.text}<span style={{color:'blue'}}>({item.count})</span></span>
        //     }
        //     item.key = key++;
        //     if (item.children){
        //         item.children = item.children.map(rebuildData);
        //     }
        //     return item;
        // }
        // if (navigateData.children)
        //     navigateData = navigateData.children.map(rebuildData)


        return <>
            <PageHeader
                title="我的登录日志"
                subTitle="This is a subtitle"
                style={{ marginTop: '-20px', marginBottom: '16px' }}
                tags={[<Tag>acb</Tag>, <Tag>acb</Tag>]}
                footer={<><Button onClick={() => this.setState({
                    navigateVisible: true
                })}>导航</Button><Button onClick={() => {
                    dispatch({
                        type: 'accountCenter/exportToExcel',
                    })
                }}>下载</Button></>}
            />

            <Table
                rowKey='logid'
                columns={fields}
                dataSource={data}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => <> <span style={{marginRight: "10px"}}> <Badge dot></Badge></span>{`显示 ${range[0]}-${range[1]} 条，共 ${total} 条`}</>,
                    position: 'both',
                }}
                loading={userLoginLogLoading}
                onChange={this.handleTableChange}
                size='small'
            />

            <Drawer title="导航"
                visible={navigateVisible}
                //placement='left'
                width={320}
                closable={true}
                onClose={() => {
                    this.setState({
                        navigateVisible: false
                    })
                }}
            >
                <Tabs defaultActiveKey="1" style={{ marginTop: '-20px' }} >
                    <TabPane tab="年度月份" key="1">
                        {
                            navigateData && navigateData.length > 0 ?
                                <DirectoryTree
                                    defaultExpandAll
                                    expandAction='doubleClick'
                                    //treeData={navigateData}
                                    onSelect={this.onNavigateSelected}>
                                    {
                                        navigateData.map(this.generateNode)
                                    })}

                                </DirectoryTree> : null}
                    </TabPane>
                    <TabPane tab="系统用户" key="2">
                        Content of Tab Pane 2
                     </TabPane>
                </Tabs>
            </Drawer>

        </>
    }
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
        userLoginLog: accountCenter.userLoginLog,
        userLoginLogLoading: loading.effects['accountCenter/fetchUserLoginLogs'],
    }),
)(UserLoginLog)

