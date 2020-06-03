import React, { useState } from 'react';
import { Form, Select, Cascader, Input, DatePicker, } from 'antd';

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
    month: 'YY年MM月',
    quarter: 'YY年Q季度',
    week: 'YY年w周',
    date: 'YY-MM-DD',
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
    value: 'date',
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
    value: 'relativesection',
    label: '相对',
}];

const dateFormat = 'YY-MM-DD';

export const getDateFilter = (filterField: any, initValues: object, form: any): any => {
    const [section, setSection] = useState('all');
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
        setSection(value);
    }
    const typeChanged = (value: string) => {
        form.setFields([{
            name: [filterField.fieldname, 'value'],
            value: undefined,
        }])
        setType(value);
    }
    const getDateField = () => {
        const format = undefined;
        if (type == 'select') {
            return <DatePicker picker={section} style={{ flex: 1 }}  format={sectionFormat[section]}
                 ></DatePicker>
        } else if (type == 'section') {
            return <RangePicker picker={section} style={{ flex: 1 }}  format={sectionFormat[section]}
                 ></RangePicker>
        }
        return <>hello</>
    }


    return <Form.Item label={filterField.defaulttitle} >
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select options={dataSectionOperator} showArrow={false} onChange={sectionChanged}>
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

