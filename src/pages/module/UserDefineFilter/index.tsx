import React from 'react';
import { Card, Button, Space, Row, Col, Form, Input, Select } from 'antd';
import { ModuleState, TextValue } from '../data';
import { getFilterScheme, getModuleInfo } from '../modules';
import { apply } from '@/utils/utils';
import { getDateFilter, canUseThisDateFilter, arrageDataFilterToParam } from './dateFilter';


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
                                filterField.isDateField ? getDateFilter(filterField, initValues, form) :
                                    getStringFilter(filterField, initValues)
                        }
                    </Col>
                })
            }
        </Row>
    }
    const filterForm = getFilterForm(scheme);
    const onSearch = () => {
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
        form.setFieldsValue(initValues);
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
                    values[filter.property].operator1 = filter.operator1;
                    values[filter.property].text = filter.text;
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

export const numberFieldOperator:TextValue[] = [{
    value: 'eq',
    text: '='
}, {
    value: 'gt',
    text: '>'
}, {
    value: 'ge',
    text: '>='
}, {
    value: 'lt',
    text: '<'
}, {
    value: 'le',
    text: '<='
}, {
    value: 'ne',
    text: '<>'
}, {
    value: 'in',
    text: '列表'
}, {
    value: 'not in',
    text: '列表外'
}, {
    value: 'between',
    text: '区间'
}, {
    value: 'not between',
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
                        <Option value={idtext.value}>{idtext.text}</Option>)}
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

export const stringFieldOperator : TextValue[] = [{
    value: 'like',
    text: '包含'
}, {
    value: 'in',
    text: '列表'
}, {
    value: 'eq',
    text: '等于'
}, {
    value: 'startwith',
    text: '开始于'
}, {
    value: 'not like',
    text: '不包含'
}, {
    value: 'not in',
    text: '列表外'
}, {
    value: 'ne',
    text: '不等于'
}, {
    value: 'not startwith',
    text: '不开始'
}, {
    value: 'regexp',
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
                        <Option value={idtext.value}>{idtext.text}</Option>)}
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

/**
 * 把用户自定义条件，转化成ajax需要的参数
 * @param userfilter 
 */
export const changeUserFilterToParam = (userfilter: any, addText: boolean = false): any[] => {
    let result = [];
    if (userfilter && userfilter.length) {
        const filter = userfilter.filter((f: any) => {
            if (f.searchfor === 'date')
                return canUseThisDateFilter(f);
            return f.value
        });
        result = filter.map((f: any) => {
            return f.searchfor === 'date' ? arrageDataFilterToParam(f,addText) : f
        });
    }
    return result;
}

export const getUserFilterCount = (userfilter: any): number => {
    let result = 0;
    if (userfilter && userfilter.length) {
        const filter = userfilter.filter((f: any) => {
            if (f.searchfor === 'date')
                return canUseThisDateFilter(f);
            return f.value
        });
        result = filter.length;
    }
    return result;
}


export default UserDefineFilter;