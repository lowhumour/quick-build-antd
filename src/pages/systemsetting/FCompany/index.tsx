import React, { useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ModalState } from './model';
import { Descriptions, Card, Row, Col, Statistic, Badge, Form, Input, Checkbox, InputNumber, DatePicker, Spin, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import moment from 'moment';

const Item = Descriptions.Item;

const FCompany = (props: any) => {
    console.log(props);
    const { dispatch, current, inPopover = false, loading, submitting } = props;
    const size = inPopover ? 'small' : 'default';
    useEffect(() => {
        dispatch({
            type: 'fCompany/fetch'
        })
    }, [])
    useEffect(() => {
        form.setFieldsValue({ ...current, startdate: moment(current['startdate'], 'YYYY-MM-DD HH:mm:ss') });
    }, [current])
    const getContext = () => {
        const homepage = current['servicehomepage'];
        const email = current['serviceemail'];
        return <><Row gutter={16} >
            <Col md={6} sm={12} xs={12}>
                <Card style={{ marginBottom: '16px' }}>
                    <Statistic title="组织机构" suffix='个'
                        value={current['count.FOrganization.orgid.with.FCompany']} />
                </Card>
            </Col>
            <Col md={6} sm={12} xs={12}>
                <Card style={{ marginBottom: '16px' }}>
                    <Statistic title="公司人员" prefix={<UserOutlined />} suffix='个'
                        value={current['count.FPersonnel.personnelid.with.FOrganization.FCompany']} />
                </Card>
            </Col>
            <Col md={6} sm={12} xs={12}>
                <Card style={{ marginBottom: '16px' }}>
                    <Statistic title="系统用户" suffix='个'
                        value={current['count.FUser.userid.with.FPersonnel.FOrganization.FCompany']} />
                </Card>
            </Col>
            <Col md={6} sm={12} xs={12}>
                <Card style={{ marginBottom: '16px' }}>
                    <Statistic title="用户角色" suffix='个'
                        value={current['count.FRole.roleid.with.FCompany']} />
                </Card>
            </Col>
        </Row>
            <Descriptions bordered column={{ md: 2, sm: 1, xs: 1 }} size={size}>
                <Item label="公司名称">{current['companyname']}</Item>
                <Item label="公司全称">{current['companylongname']}</Item>
                <Item label="公司地址">{current['address']}</Item>
                <Item label="联系人" >{current['linkmen']}</Item>
                <Item label="联系电话">{current['telnumber']}</Item>
                <Item label="邮政编码">{current['postcode']}</Item>
                <Item label="开始使用日期">{current['startdate']}</Item>

                <Item label="是否有效">{current['isvalid'] ? <Badge status="processing" text="已生效" /> : '未生效'}</Item>
                <Item label="分级ID">{current['levelid']}</Item>
                <Item label="顺序号">{current['orderno']}</Item>
                <Item label="备注" span={2}>{current['remark']}</Item>

                <Item label="服务单位">{current['servicedepartment']}</Item>
                <Item label="服务人员">{current['servicemen']}</Item>
                <Item label="服务电话">{current['servicetelnumber']}</Item>
                <Item label="服务人员QQ">{current['serviceqq']}</Item>
                <Item label="服务人员邮件">{email ?
                    <a href={"mailto:" + email +
                        "?subject=test&subject=主题&body=内容"}>{email}</a>
                    : null}</Item>
                <Item label="服务主页">{homepage ? <a href={homepage} target="_blank">{homepage}</a> : null}</Item>

            </Descriptions></>
    }

    const twothreeLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    const col = {
        md: 12,
        xs: 24,
        sm: 24,
    }
    const [form] = Form.useForm();

    const onFinish = (data: any) => {
        console.log(data);
        const { startdate: sdate } = data;
        console.log(sdate ? sdate.format('YYYY-MM-DD HH:mm:ss') : null)
    }

    const getForm = () => {


        return <Form form={form} {...twothreeLayout} onFinish={onFinish} >
            <Row gutter={16} >
                <Col {...col}>
                    <Form.Item label="公司名称" name="companyname"
                        rules={[{ required: true, message: '请输入公司名称' },]}>
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="公司全称" name="companylongname">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="公司地址" name="address">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="联系人" name="linkmen">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="联系电话" name="telnumber">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="邮政编码" name="postcode">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="开始使用日期" name="startdate">
                        <DatePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="是否有效" name="isvalid" valuePropName="checked">
                        <Checkbox></Checkbox>
                    </Form.Item>
                </Col>

                <Col {...col}>
                    <Form.Item label="分级ID" name="levelid">
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="顺序号" name="orderno">
                        <InputNumber min={0} />
                    </Form.Item>
                </Col>
                <Col sm={24} xs={24} md={24}>
                    <Form.Item label="备注" name="remark"
                        labelCol={{ sm: 6, xs: 6, md: 3 }}
                        wrapperCol={{ sm: 18, xs: 18, md: 21 }}
                    >
                        <Input.TextArea autoSize maxLength={2000} />
                    </Form.Item>
                </Col>


                <Col {...col}>
                    <Form.Item label="服务单位" name="servicedepartment">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="服务人员" name="servicemen">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="服务电话" name="servicetelnumber">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="服务人员QQ" name="serviceqq">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="服务人员邮件" name="serviceemail">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
                <Col {...col}>
                    <Form.Item label="服务主页" name="servicehomepage">
                        <Input maxLength={50} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item><Button type="primary"
                onClick={() => { form.submit() }}
                loading={submitting}>提 交</Button>
            </Form.Item>
        </Form >

    }

    return inPopover ?
        getContext() :
        <PageHeaderWrapper>
            <Card>{getContext()}</Card>
            <Spin spinning={loading}>
                <Card style={{ marginTop: '18px' }}>{getForm()}</Card>
            </Spin>
        </PageHeaderWrapper >
}

export default connect(({ loading, fCompany }:
    { loading: { effects: { [key: string]: boolean } }, fCompany: ModalState }) => ({
        submitting: loading.effects['fCompany/submit'],
        loading: loading.effects['fCompany/fetch'],
        current: fCompany ? fCompany.current : {},
    }))(FCompany);



