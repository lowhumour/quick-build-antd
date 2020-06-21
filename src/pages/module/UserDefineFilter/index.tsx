import React from 'react';
import { Card, Button, Space, Row, Col, Form, Input, Select } from 'antd';
import { ModuleState, TextValue } from '../data';
import { getFilterScheme, getModuleInfo } from '../modules';
import { apply } from '@/utils/utils';
import { getDateFilter, canUseThisDateFilter, arrageDataFilterToParam } from './dateFilter';
import TagSelect from './TagSelect';
import { getDictionaryData } from '../dictionary/dictionarys';

const _6_18_Layout = {
    labelCol: {
        xs: { span: 6 },
        md: { span: 6 },
        xl: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 18 },
        md: { span: 18 },
        xl: { span: 18 },
    },
};

/** 二列合并的，使用以下 */
const colTwoSpan = {
    labelCol: {
        xs: { span: 6 },
        md: { span: 3 },
        xl: { span: 3 },
    },
    wrapperCol: {
        xs: { span: 18 },
        md: { span: 21 },
        xl: { span: 21 },
    },
}

const colThreeSpan = {
    labelCol: {
        xs: { span: 6 },
        md: { span: 3 },
        xl: { span: 2 },
    },
    wrapperCol: {
        xs: { span: 18 },
        md: { span: 21 },
        xl: { span: 22 },
    },
}

const _3_21_Layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};

const UserDefineFilter = ({ moduleState, dispatch, clearUserDefineFunc }:
    { moduleState: ModuleState, dispatch: any, clearUserDefineFunc: any }) => {
    const initValues = {
        category: {
            value: undefined,
            operator: 'in'
        }
    };
    const { moduleName } = moduleState;
    const moduleInfo = getModuleInfo(moduleName);
    const scheme = getFilterScheme(moduleInfo);
    const [form] = Form.useForm();
    const getFilterForm = (scheme: any) => {
        return <Row gutter={0}>
            {
                scheme.details[0].details.map((filterField: any) => {
                    const labelWarrapCol = {};
                    const colspan = filterField.colspan || 1;
                    if (colspan == 2)
                        apply(labelWarrapCol, colTwoSpan)
                    else if (colspan == 3)
                        apply(labelWarrapCol, colThreeSpan)
                    return <Col xs={24} md={12 * Math.min(colspan, 2)} xl={8 * colspan}>
                        {filterField.fDictionaryid ? getDictionaryFilter(filterField, initValues, form, labelWarrapCol) :
                            filterField.isNumberField ? getNumberFilter(filterField, initValues, form, labelWarrapCol) :
                                filterField.isDateField ? getDateFilter(filterField, initValues, form, labelWarrapCol) :
                                    getStringFilter(filterField, initValues, form, labelWarrapCol)
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
        console.log(formValues);
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
    clearUserDefineFunc.func = onReset;     // 将清除函数返回到上一级，供清除用户自定义条件时使用
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
            <Form {..._6_18_Layout} form={form} initialValues={getStateInitValues()}>
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

const getDictionaryFilter = (filterField: any, initValues: object, form: any, labelWarrapCol: any): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'in',
        value: undefined,
        title: filterField.defaulttitle,
    };
    const dictData: TextValue[] = getDictionaryData(filterField.fDictionaryid);

    return filterField.tagSelect ?
        <Form.Item label={filterField.defaulttitle}   {...labelWarrapCol} >
            <Input.Group compact style={{ display: 'flex' }}>
                <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                    <TagSelect expandable={false} expand={true} >
                        {dictData.map((rec: TextValue) => <TagSelect.Option value={rec.value}>{rec.text}</TagSelect.Option>)}
                    </TagSelect>
                </Form.Item>
                <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                    <Input type="hidden" />
                </Form.Item>
            </Input.Group>
        </Form.Item> : <Form.Item label={filterField.defaulttitle} {...labelWarrapCol} >
            <Input.Group compact style={{ display: 'flex' }}>
                <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                    <Select mode="multiple" style={{ flex: 1 }} allowClear>
                        {dictData.map((rec: TextValue) => <Option value={rec.value || ''}>{rec.text}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                    <Input type="hidden" />
                </Form.Item>
            </Input.Group>
        </Form.Item>



}

export const numberFieldOperator: TextValue[] = [{
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
const getNumberFilter = (filterField: any, initValues: object, form: any, labelWarrapCol: any): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'eq',
        value: undefined,
        type: 'number',
        title: filterField.defaulttitle,
    };
    return <Form.Item label={filterField.defaulttitle}  {...labelWarrapCol}>
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

export const stringFieldOperator: TextValue[] = [{
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
const getStringFilter = (filterField: any, initValues: object, form: any, labelWarrapCol: any): any => {
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'like',
        value: undefined,
        type: 'string',
        title: filterField.defaulttitle,

    };
    return <Form.Item label={filterField.defaulttitle}  {...labelWarrapCol}>
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
            return isEmptyOrEmptyArray(f.value)
        });
        result = filter.map((f: any) => {
            return f.searchfor === 'date' ? arrageDataFilterToParam(f, addText) : f
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
            return isEmptyOrEmptyArray(f.value)
        });
        result = filter.length;
    }
    return result;
}

/**
 * 判断一个值是否为空，如果是数组，判断数组是否为空
 * @param value 
 */
const isEmptyOrEmptyArray = (value: any) => {
    if (Array.isArray(value))
        return value.length;
    else
        return value;
}

export default UserDefineFilter;