import React from 'react';
import { Card, Button, Space, Row, Col, Form, Input, Select } from 'antd';
import { ModuleModal, ModuleState } from '../data';
import { getFilterScheme, getModuleInfo } from '../modules';
import { apply } from '@/utils/utils';
import { getDateFilter } from './dateFilter';


const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const UserDefineFilter = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: any }) => {
    const initValues = {};
    const { moduleName } = moduleState;
    const moduleInfo = getModuleInfo(moduleName);
    const scheme = getFilterScheme(moduleInfo);
    const [form] = Form.useForm();
    const getFilterForm = (scheme: any) => {
        return <Row gutter={6}>
            {
                scheme.details[0].details.map((filterField: any) => {
                    return <Col span={8}>
                        {
                            filterField.isNumberField ? getNumberFilter(filterField, initValues) :
                                filterField.isDateField ? getDateFilter(filterField, initValues , form) :
                                    getStringFilter(filterField, initValues)
                        }
                    </Col>
                })
            }
        </Row>
    }
    const filterForm = getFilterForm(scheme);
    const onSearch = () => {
        console.log(form.getFieldsValue());
        console.log(initValues);
        const filter: object = JSON.parse(JSON.stringify(initValues));
        const formValues: object = form.getFieldsValue();
        const userfilter = [];
        for (var key in formValues) {
            if (!filter[key]) filter[key] = {};
            apply(filter[key], formValues[key]);
            userfilter.push(filter[key]);
        }

        dispatch({
            type: 'modules/filterChanged',
            payload: {
                moduleName,
                type: 'userDefineFilter',
                userfilter,
            }
        })
    }
    const onReset = () => {
        form.setFieldsValue(initValues);// . resetFields();
        const userfilter = [];
        const filter: object = JSON.parse(JSON.stringify(initValues));
        for (var key in filter) {
            userfilter.push(filter[key]);
        }
        dispatch({
            type: 'modules/filterChanged',
            payload: {
                moduleName,
                type: 'userDefineFilter',
                userfilter,
            }
        })
    }

    const getStateInitValues = (): object => {
        const { filters } = moduleState;
        const { userfilter } = filters;
        const values: object = JSON.parse(JSON.stringify(initValues));
        console.log(userfilter)

        if (userfilter)
            userfilter.map((filter: any) => {
                if (values[filter.property]) {
                    values[filter.property].operator = filter.operator;
                    values[filter.property].value = filter.value;
                }
            })
        console.log(values);
        return values;
    }

    if (scheme)
        return <Card style={{ marginBottom: 16, padding: 16 }} >
            <Form {...layout} form={form} initialValues={getStateInitValues()}>
                {filterForm}
            </Form>
            <span style={{ display: 'flex' }}>
                <span style={{ flex: 1 }}></span>
                <Space>
                    <Button type="primary" onClick={onSearch}>查询</Button>
                    <Button onClick={onReset}>重置</Button>
                </Space>
            </span>
        </Card>
    else return null;

}


const { Option } = Select;

const numberFieldOperator = [{
    id: 'eq',
    text: '='
}, {
    id: 'gt',
    text: '>'
}, {
    id: 'ge',
    text: '>='
}, {
    id: 'lt',
    text: '<'
}, {
    id: 'le',
    text: '<='
}, {
    id: 'ne',
    text: '<>'
}, {
    id: 'in',
    text: '列表'
}, {
    id: 'not in',
    text: '列表外'
}, {
    id: 'between',
    text: '区间'
}, {
    id: 'not between',
    text: '区间外'
}];
const getNumberFilter = (filterField: any, initValues: object): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'eq',
        value: undefined,
        type: 'number',
        title: filterField.defaulttitle,
    };
    return <Form.Item label={filterField.defaulttitle} >
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select style={{ width: 70 }}>
                    {numberFieldOperator.map((idtext: any) =>
                        <Option value={idtext.id}>{idtext.text}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item
                name={[filterField.fieldname, 'value']}
                noStyle
            >
                <Input style={{ flex: 1 }} placeholder="请输入" allowClear />
            </Form.Item>
        </Input.Group>
    </Form.Item>
}

const getDateFilter1 = (filterField: any, initValues: object): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'eq',
        value: undefined,
        type: 'date',
        title: filterField.defaulttitle,
    };
    return <Form.Item label={filterField.defaulttitle} name={[filterField.fieldname, 'operator']}>
        <Input />
    </Form.Item>
}

const stringFieldOperator = [{
    id: 'like',
    text: '包含'
}, {
    id: 'in',
    text: '列表'
}, {
    id: 'eq',
    text: '等于'
}, {
    id: 'startwith',
    text: '开始于'
}, {
    id: 'not like',
    text: '不包含'
}, {
    id: 'not in',
    text: '列表外'
}, {
    id: 'ne',
    text: '不等于'
}, {
    id: 'not startwith',
    text: '不开始'
}, {
    id: 'regexp',
    text: '正则'
}];
const getStringFilter = (filterField: any, initValues: object): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'like',
        value: undefined,
        type: 'string',
        title: filterField.defaulttitle,

    };
    return <Form.Item label={filterField.defaulttitle} >
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select style={{ width: 70 }}>
                    {stringFieldOperator.map((idtext: any) =>
                        <Option value={idtext.id}>{idtext.text}</Option>)}
                </Select>
            </Form.Item>
            <Form.Item
                name={[filterField.fieldname, 'value']}
                noStyle
            >
                <Input style={{ flex: 1 }} placeholder="请输入" allowClear />
            </Form.Item>
        </Input.Group>
    </Form.Item>
}


export default UserDefineFilter;