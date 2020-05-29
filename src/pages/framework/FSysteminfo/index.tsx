import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
    Card, Form, Button, Input, Select, Row, Col, Checkbox, InputNumber,
    Modal, notification, Spin, Popover
} from 'antd';
import { CopyrightOutlined, CloseCircleOutlined, CommentOutlined } from '@ant-design/icons';
import styles from './index.less';
import request from '@/utils/request';
import ImageField from '@/widget/form/ImageField';
import FooterToolbar from './components/FooterToolbar';
import FCompany from '../../systemsetting/FCompany';

const { Option } = Select;

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
const halfLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};
const twothreeLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

async function queryFSysteminfo(data: {
    limit: number, page: number, start: number, moduleName: string,
}) {
    return request('/api/platform/dataobject/fetchdata.do', {
        method: 'post',
        requestType: 'form',
        data,
    });
}

async function queryFCompanyComboData() {
    return request('/api/platform/dataobject/fetchcombodata.do', {
        params: {
            _dc: new Date().getTime(),
            moduleName: 'FCompany',
            mainlinkage: true,
            page: 1,
            start: 0,
            limit: 25,
        }
    })
}

const fieldLabels = {
    "FCompany.companyid": "公司名称",
    systemname: "系统名称",
    systemversion: "版本号",
}


type InternalNamePath = (string | number)[];

interface ErrorField {
    name: InternalNamePath;
    errors: string[];
}

const getErrorInfo = (errors: ErrorField[]) => {
    console.log(errors)
    const errorCount = errors.filter(item => item.errors.length > 0).length;
    if (!errors || errorCount === 0) {
        return null;
    }
    const scrollToField = (fieldKey: string) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
            labelNode.scrollIntoView(true);
        }
    };
    const errorList = errors.map(err => {
        if (!err || err.errors.length === 0) {
            return null;
        }
        const key = err.name[0] as string;
        return (
            <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
                <CloseCircleOutlined className={styles.errorIcon} />
                <div className={styles.errorMessage}>{err.errors[0]}</div>
                {<div className={styles.errorField}>{fieldLabels[key]}</div>}
            </li>
        );
    });
    return (
        <span className={styles.errorIcon}>
            <Popover
                title="表单校验信息"
                content={errorList}
                overlayClassName={styles.errorPopover}
                trigger="click"
                getPopupContainer={(trigger: HTMLElement) => {
                    if (trigger && trigger.parentNode) {
                        return trigger.parentNode as HTMLElement;
                    }
                    return trigger;
                }}
            >
                <CloseCircleOutlined />
            </Popover>
            {errorCount}
        </span>
    );
};


const FSysteminfo = (props: any) => {
    const [form] = Form.useForm();
    const [error, setError] = useState<ErrorField[]>([]);
    const [saveAttachmentInFileSystem, setSaveAttachmentInFileSystem] = useState(false);
    const [fCompanys, setFCompanys] = useState([]);
    const [systeminfo, setSysteminfo] = useState({ systemname: null });
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        queryFCompanyComboData().then(data => setFCompanys(data));
        queryFSysteminfo({
            limit: 20, page: 1, start: 0, moduleName: 'FSysteminfo',
        }).then((data) => {
            if (data && data.data) {
                setSysteminfo(data.data[0]);
                form.setFieldsValue(data.data[0]);
                setSaveAttachmentInFileSystem(data.data[0].saveinfilesystem);
            }
        })
    }, [])

    useEffect(() => {
        form.validateFields(['rootpath']);
    }, [saveAttachmentInFileSystem]);

    const getSystemSetting = () =>
        <Card className={styles.cardpre} title="系统信息设置" >
            <Row gutter={20}>
                <Col xs={24} sm={18}>
                    <span style={{ whiteSpace: 'nowrap', display: 'flex' }} >
                        <Form.Item style={{ width: '100%' }}

                            // labelCol=   {{ flex: '200px'} }
                            // wrapperCol= {{ flex: 'auto' }}

                            label="公司名称"
                            name="FCompany.companyid"
                            rules={[
                                { required: true, message: '请选择公司' },
                                // { max: 5, message: '业务系统名称最长50个字符' }  //在Input中加了maxLength后这里可以不用了
                            ]}
                        >
                            <Select style={{ width: '100%' }}>
                                {fCompanys.map((item: any, index, arr) =>
                                    <Option key={item.value} value={item.value}>{item.text}</Option>)}
                            </Select>
                        </Form.Item>
                        <Popover content={<FCompany inPopover />}
                            trigger="click"><Button
                                style={{ paddingLeft: '8px', paddingRight: '8px', marginLeft: '-1px' }}><CommentOutlined /></Button></Popover>
                    </span>

                    <Form.Item
                        label="系统名称"
                        name="systemname"
                        rules={[
                            { required: true, message: '请输入业务系统名称' },
                            // { max: 5, message: '业务系统名称最长50个字符' }  //在Input中加了maxLength后这里可以不用了
                        ]}
                    >
                        <Input maxLength={50} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item {...twothreeLayout}
                                label="版本号"
                                name="systemversion"
                                rules={[]}
                            >
                                <Input maxLength={50} />
                            </Form.Item></Col>
                        <Col span={12}>
                            <Form.Item {...twothreeLayout} label="版权所有" name="copyrightowner" rules={[]} >
                                <Input maxLength={50} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label={<><CopyrightOutlined /> 版权信息</>} name="copyrightinfo" rules={[]} >
                        <Input maxLength={50} />
                    </Form.Item>
                    <Form.Item label="附加信息" name="systemaddition" rules={[]} >
                        <Input maxLength={200} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={6} >
                    <Form.Item name="iconfile" label="系统图标" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} >
                        <ImageField />
                    </Form.Item>
                </Col>
            </Row>
        </Card>


    const getAttachmentSetting = () =>
        <Card className={styles.cardpre} title="附件选项设置">
            <Row gutter={2} {...colAttachPrpos}>
                <Col {...colAttachPrpos}>
                    <Form.Item label="附件保存在文件中"
                        name="saveinfilesystem"
                        valuePropName="checked"
                        {...halfLayout}>
                        <Checkbox
                            checked={saveAttachmentInFileSystem}
                            onChange={e => { setSaveAttachmentInFileSystem(e.target.checked) }}>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={16}>
                    <Form.Item label="附件保存根路径" name="rootpath"
                        labelCol={{
                            xs: 6,
                        }}
                        wrapperCol={{
                            xs: 18,
                        }}
                        rules={[
                            {
                                required: saveAttachmentInFileSystem,
                                message: '请输入附件保存根路径',
                            },
                        ]} >
                        <Input maxLength={200} />
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="附件目录生成方式" name="pathmode" {...halfLayout}>
                        <Input maxLength={20} />
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="文件最大值" {...halfLayout} style={{ whiteSpace: "nowrap" }}>
                        <Form.Item name="filemaxsize" noStyle>
                            <InputNumber min={0} max={1000} />
                        </Form.Item>
                        <span> MB</span>
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="生成预览图片" name="createpreviewimage" valuePropName="checked" {...halfLayout}>
                        <Checkbox></Checkbox>
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="生成预览PDF" name="createpreviewpdf" valuePropName="checked" {...halfLayout}>
                        <Checkbox></Checkbox>
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="预览图片宽" {...halfLayout} style={{ whiteSpace: "nowrap" }}>
                        <Form.Item name="imagewidth" noStyle>
                            <InputNumber min={0} max={256} />
                        </Form.Item><span> px</span>
                    </Form.Item>
                </Col>
                <Col {...colAttachPrpos}>
                    <Form.Item label="预览图片高" {...halfLayout} style={{ whiteSpace: "nowrap" }}>
                        <Form.Item name="imageheight" noStyle >
                            <InputNumber min={0} max={256} />
                        </Form.Item><span> px</span>
                    </Form.Item>
                </Col>
            </Row>

        </Card>


    const pretty_format = function (obj: any, indent: any) {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj === 'string') return '"' + obj + '"';
        if (typeof obj !== 'object') return String(obj);

        if (indent == undefined) indent = '';

        var result = '{\n';
        for (var key in obj) {
            result += indent + ' ' + key + ' = ';
            result += pretty_format(obj[key], indent + ' ') + '\n';
        }
        return result + indent + '}';
    }

    const onFinish = (values: any) => {
        console.log('Success:', values);
        console.log("systeminfo", systeminfo);
        setError([]);
        // 提交的时候，只加入修改过的字段和主键
        const postData = {
            systeminfoid: systeminfo['systeminfoid'],
        }
        let changeCount = 0;
        for (var key in values) {
            if (systeminfo[key] != values[key]) {
                postData[key] = values[key]
                changeCount++;
            }
        }
        if (changeCount === 0) {
            notification.warn({
                message: '不需要保存',
                description: '因为没有字段的值被改变，所以不需要保存。',
            });
            return;
        }
        setSubmitting(true);
        request('/api/platform/dataobject/saveorupdate.do', {
            params: {
                _dc: new Date().getTime(),
                objectname: 'FSysteminfo',
                opertype: 'edit',
            },
            data: postData,
            method: 'POST',
        }).then((data) => {
            setSubmitting(false);
            if (data.success) {
                setSysteminfo(data.data);
                form.setFieldsValue(data);
                notification.success({
                    message: '记录保存成功',
                    description: pretty_format(postData, ''),
                });
            } else {
                const errors = [{
                    name: ['sessiontimeoutminute'],
                    errors: ['nuk 中国ll'],
                }]

                form.setFields(errors)
                setError(errors);



                Modal.error({
                    title: '保存记录时发生错误',
                    content: data.message,
                    okText: '确 定',
                    onOk() {
                    },
                });
            }
        });
    };


    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        setError(errorInfo.errorFields);
    };


    return <PageHeaderWrapper content="包括系统信息、登录选项、附件选项和其他参数的设置。">
        <Spin spinning={!systeminfo.systemname || submitting} delay={0} size="large" >
            <Form form={form} layout="horizontal" onFinish={onFinish} onFinishFailed={onFinishFailed} size="middle"
                {...layout}
            >
                {getSystemSetting()}
                {getLoginSetting()}
                {getAttachmentSetting()}
                {getOtherSetting()}
                <FooterToolbar>
                    {getErrorInfo(error)}
                    <Button type="primary" onClick={() => form?.submit()} loading={submitting}>
                        提交
                     </Button>
                </FooterToolbar>
            </Form>
        </Spin>
    </PageHeaderWrapper>

}
//</Spin><div style={{textAlign:'center',width:'100%',margin : '30px'}}><Spin size="large" /></div>

const colPrpos = {
    xs: 12,
    sm: 12,
    md: 8,
}

const getLoginSetting = () =>
    <Card className={styles.cardpre} title="登录选项设置">
        <Row gutter={2}>
            <Col {...colPrpos}>
                <Form.Item label="允许保存密码" name="allowsavepassword" valuePropName="checked" {...halfLayout}>
                    <Checkbox></Checkbox>
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="必须修改初始密码" name="needreplaceinitialpassword" valuePropName="checked" {...halfLayout}>
                    <Checkbox></Checkbox>
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="输错后需要验证码" name="needidentifingcode" valuePropName="checked" {...halfLayout}>
                    <Checkbox></Checkbox>
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="始终需要验证码" name="alwaysneedidentifingcode" valuePropName="checked" {...halfLayout}>
                    <Checkbox></Checkbox>
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="可重复登录" name="allowloginagain" valuePropName="checked" {...halfLayout} >
                    <Checkbox></Checkbox>
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="保存密码天数" name="savepassworddays" {...halfLayout}
                    rules={[{
                        validator: (rule, value = 0, callback) => {
                            try {
                                if (value > 10) {
                                    callback('计量单位不可超过10个字符');
                                }
                                callback();
                            } catch (err) {
                                callback(err);
                            }
                        }
                    }]}
                >
                    <InputNumber min={0} max={30} />
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="最大登录用户数" name="maxusers" {...halfLayout} >
                    <InputNumber min={0} max={1000} />
                </Form.Item>
            </Col>
            <Col {...colPrpos}>
                <Form.Item label="超时时间" {...halfLayout} style={{ whiteSpace: "nowrap" }} >
                    <Form.Item name="sessiontimeoutminute" noStyle>
                        <InputNumber min={0} />
                    </Form.Item>
                    <span> 分钟</span>
                </Form.Item>
            </Col>
        </Row>
        <Row>
            <Col span={24}>
                <Form.Item label="忘记密码提示" name="forgetpassword"
                    labelCol={{
                        sm: 6,
                        md: 4,
                    }}
                    wrapperCol={{
                        sm: 18,
                        md: 20,
                    }}>
                    <Input maxLength={200} />
                </Form.Item>
            </Col>
        </Row>
    </Card>

const colAttachPrpos = {
    xs: 12,
    sm: 12,
    md: 8,
}

const { TextArea } = Input;

const getOtherSetting = () =>
    <Card className={styles.cardpre} title="其他设置">
        <Form.Item label="附加属性" name="properites" labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}>
            <TextArea autoSize maxLength={2000} />
        </Form.Item>
        <Form.Item label="备注" name="remark" labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}>
            <TextArea autoSize maxLength={200} />
        </Form.Item>
    </Card>

export default FSysteminfo;





