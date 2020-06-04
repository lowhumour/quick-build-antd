import React, { useState } from 'react';
import { Form, Select, Input, DatePicker } from 'antd';
import moment from 'moment';
import { apply } from '@/utils/utils';
import { DateRelativeSetting } from './dateRelativeSetting';

const { RangePicker } = DatePicker;
const dateOperator = [{
    value: 'all',
    label: '所有年度',
},
{
    value: 'year',
    label: '年度',
    children: [
        {
            value: 'thisyear',
            label: '当前年度',
        },
        {
            value: 'year1',
            label: '指定年度',
        },
        {
            value: 'yearsection',
            label: '年度区间',
        },
        {
            value: 'relativeyearsection',
            label: '相对区间',
        },
    ],
},
{
    value: 'month',
    label: '月份',
    children: [
        {
            value: 'thismonth',
            label: '当前月份',
        },
        {
            value: 'month1',
            label: '指定月份',
        },
        {
            value: 'monthsection',
            label: '月份区间',
        },
        {
            value: 'relativemonthsection',
            label: '相对区间',
        },
    ],
},
];

const sectionFormat = {
    year: 'YYYY年',
    month: 'YYYY年MM月',
    quarter: 'YYYY年Q季度',
    week: 'YYYY年w周',
    date: 'YYYY-MM-DD',
    day: 'YYYY-MM-DD',
}
const rangeFormat = {
    year: 'YYYY年',
    month: 'YY年MM月',
    quarter: 'YY年Q季度',
    week: 'YY年w周',
    date: 'YY-MM-DD',
    day: 'YY-MM-DD',
}

const dataSectionOperator = [{
    value: 'all',
    label: '所有'
}, {
    value: 'year',
    label: '年度'
}, {
    value: 'month',
    label: '月份'
}, {
    value: 'quarter',
    label: '季度'
}, {
    value: 'week',
    label: '周　'
}, {
    value: 'day',
    label: '日期'
}]

const dateFieldOperator = [{
    value: 'this',
    label: '当前'
}, {
    value: 'select',
    label: '指定'
}, {
    value: 'section',
    label: '区间'
}, {
    value: 'relative',
    label: '相对',
}];

const dateFormat = 'YY-MM-DD';

export const getDateFilter = (filterField: any, initValues: object, form: any): any => {
    const [section, setSection] = useState(form.getFieldValue([filterField.fieldname, 'operator']) || 'all');
    const [type, setType] = useState('this');
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'all',
        operator1: 'this',
        value: undefined,
        searchfor: 'date',
        title: filterField.defaulttitle,
    };
    const sectionChanged = (value: string) => {
        // 如果type和字段中的operator1不同，那么修改
        const formType = form.getFieldValue([filterField.fieldname, 'operator1']);
        if (type !== formType)
            setType(formType);
        if (value == 'all') {
            // form.setFields([{
            //     name: [filterField.fieldname, 'value'],
            //     value: undefined,
            // }])
        } else if (formType == 'this') {
            form.setFields([{
                name: [filterField.fieldname, 'value'],
                value: moment(),
            }])
        }
        setSection(value);
    }
    const typeChanged = (value: string) => {
        const name = [filterField.fieldname, 'value'];
        if (value == 'this') {
            form.setFields([{
                name,
                value: moment(),
            }])
        } else if (value == 'select') {
            const dateValue = form.getFieldValue(name)
            form.setFields([{
                name,
                value: Array.isArray(dateValue) ? (dateValue.length ? dateValue[0] : undefined) : dateValue,
            }])
        } else if (value == 'section') {
            form.setFields([{
                name,
                value: [null, null],
            }])
        } else if (value == 'relative') {
            form.setFields([{
                name,
                value: null,
            }])
        }
        setType(value);
    }

    const getDateField = () => {
        if (section != 'all') {
            let picker = section;
            if (picker == 'day')
                picker = 'date';
            if (type == 'this') {
                return <DatePicker disabled picker={picker} style={{ flex: 1 }} format={sectionFormat[section]}
                ></DatePicker>
            } else if (type == 'select') {
                return <DatePicker picker={picker} style={{ flex: 1 }} format={sectionFormat[section]} />
            } else if (type == 'section') {
                return <RangePicker allowEmpty={[true, true]} picker={picker} style={{ flex: 1 }} format={rangeFormat[section]}
                ></RangePicker>
            } else if (type == 'relative')
                return <Input readOnly addonAfter={<DateRelativeSetting />} style={{ flex: 1 }}></Input>
        }
        return <></>
    }

    if ((form.getFieldValue([filterField.fieldname, 'operator']) || 'all') != section)
        setSection(form.getFieldValue([filterField.fieldname, 'operator']) || 'all');

    return <Form.Item label={filterField.defaulttitle} >
        <button onClick={() => {
            console.log(section, type);
            console.log(form.getFieldValue(filterField.fieldname))
        }} >aaa</button>
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select options={dataSectionOperator} showArrow={false} onChange={sectionChanged}
                    style={section == 'all' ? { flex: 1 } : {}}
                >
                </Select>
            </Form.Item>
            {section != 'all' ?
                <Form.Item
                    name={[filterField.fieldname, 'operator1']}
                    noStyle
                >
                    <Select options={dateFieldOperator} showArrow={false} onChange={typeChanged}>
                    </Select>
                </Form.Item> : null
            }
            <Form.Item
                name={[filterField.fieldname, 'value']}
                noStyle
            >
                {getDateField()}
                {/* <RangePicker picker='date' style={{ flex: 1 }} format={dateFormat} /> */}

            </Form.Item>
        </Input.Group>
    </Form.Item>
}


export const canUseThisDateFilter = (f: any): boolean => {
    if (f.operator === 'all' ||
        (f.operator1 === 'section' && f.value[0] == null && f.value[1] == null))
        return false;
    return !!f.value;
}

/**
 * 根据界面的值，将其转化成ajax的参数
 * @param filter 
 * 
 *      property: property,
        operator: 'all',
        operator1: 'this',
        value: undefined,
        searchfor: 'date',
        title: filterField.defaulttitle,
 * 
 */
export const arrageDataFilterToParam = (filter: object) => {
    const result: any = {};
    apply(result, filter);
    if (result.operator1 == 'this') {
        result.value = getDateFormatValue(result.value, result.operator);
        result.operator = 'this' + result.operator;
    } else if (result.operator1 == 'select') {
        // 选择年月季日周
        result.value = getDateFormatValue(result.value, result.operator);
        if (result.operator == 'month' || result.operator == 'quarter') {
            result.operator = 'year' + result.operator;
        }
    } else if (result.operator1 == 'section') {
        result.value = getDateFormatValue(result.value[0], result.operator) + '--' +
            getDateFormatValue(result.value[1], result.operator);
        result.operator = result.operator + 'section';
    }
    delete result.operator1;
    return result;
}


const getDateFormatValue = (date: any, type: string): string => {
    if (date)
        return moment(date).format(type == 'year' ? 'YYYY' : type == 'month' ?
            'YYYY-M' : type == 'quarter' ? 'YYYY-Q' : 'YYYY-MM-DD');
    else
        return '';
}
