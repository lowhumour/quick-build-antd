import React, { useState } from 'react';
import { Form, Select, Input, DatePicker } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import { apply } from '@/utils/utils';
import { DateRelativeSetting } from './dateRelativeSetting';
import { TextValue } from '../data';

const { RangePicker } = DatePicker;

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
//     value: 'week',
//     label: '周　'
// }, {
    value: 'day',
    label: '日期'
}]

const getTitleWord = (section: string, first: boolean = false) => {
    const recs = dataSectionOperator.filter((record) => record.value == section);
    if (recs.length)
        return first ? recs[0].label.substr(0, 1) : recs[0].label;
    return '';
}

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

export const getDateFilter = (filterField: any, initValues: object, form: any): any => {
    const [section, setSection] = useState(form.getFieldValue([filterField.fieldname, 'operator']) || 'all');
    const [type, setType] = useState(form.getFieldValue([filterField.fieldname, 'operator1']) || 'this');
    const [clearSuffix, setClearSuffix] = useState(false);
    const [relativeSetVisible, setRelativeSetVisible] = useState(false);
    const formType = form.getFieldValue([filterField.fieldname, 'operator1']);
    if (formType && type !== formType)
        setType(formType);
    if (form.getFieldValue([filterField.fieldname, 'operator1']) == 'relative') {
        if (form.getFieldValue([filterField.fieldname, 'value'])) {
            if (!clearSuffix)
                setClearSuffix(true);
        } else
            if (clearSuffix)
                setClearSuffix(false);
    } else if (clearSuffix)
        setClearSuffix(false);
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'all',
        operator1: 'this',
        value: undefined,
        text: undefined,
        searchfor: 'date',
        title: filterField.defaulttitle,
    };
    const sectionChanged = (value: string) => {
        //debugger;
        // 如果type和字段中的operator1不同，那么修改
        const name = [filterField.fieldname, 'value'];
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
                name,
                value: moment(),
            }])
        } else if (formType == 'relative') {
            form.setFields([{
                name,
                value: null,
            }])
            form.setFields([{
                name: [filterField.fieldname, 'text'],
                value: null,
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
            form.setFields([{
                name: [filterField.fieldname, 'text'],
                value: null,
            }])
        }

        console.log(form.getFieldsValue());

        setType(value);
    }

    const onDateRelativeSetting = (textValue: TextValue) => {
        form.setFields([{
            name: [filterField.fieldname, 'value'],
            value: textValue.value,
        }])
        form.setFields([{
            name: [filterField.fieldname, 'text'],
            value: textValue.text,
        }])
        setClearSuffix(!!textValue.value);
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
                return <Input readOnly 
                    // addonBefore={
                    //     <DateRelativeSetting
                    //         onChange={onDateRelativeSetting}
                    //         sectionText={getTitleWord(section, true)}
                    //         relativeSetVisible={relativeSetVisible}
                    //         setRelativeSetVisible={setRelativeSetVisible}
                    //     />
                    // } 
                    style={{ flex: 1 }}
                    suffix={clearSuffix ? <CloseCircleFilled className='ant-input-clear-icon' onClick={() => {
                        onDateRelativeSetting({ value: undefined, text: undefined });
                    }} /> : null}
                    onMouseDown={() => {
                        if (!relativeSetVisible)
                            setRelativeSetVisible(true)
                    }}
                ></Input>
        }
        return <></>
    }

    if ((form.getFieldValue([filterField.fieldname, 'operator']) || 'all') != section)
        setSection(form.getFieldValue([filterField.fieldname, 'operator']) || 'all');

    return <Form.Item label={filterField.defaulttitle} >
        {/* <button onClick={() => {
            console.log(section, type);
            console.log(form.getFieldValue(filterField.fieldname))
        }} >aaa</button> */}
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
            <Form.Item noStyle
                name={[filterField.fieldname, type == 'relative' ? 'text' : 'value']} >
                {getDateField()}
            </Form.Item>
            {type == 'relative' ?
                <Form.Item name={[filterField.fieldname, 'value']} noStyle >
                    <Input type="hidden" />
                </Form.Item> : null
            }
            {type == 'relative' ?
                <DateRelativeSetting
                    onChange={onDateRelativeSetting}
                    sectionText={getTitleWord(section, true)}
                    relativeSetVisible={relativeSetVisible}
                    setRelativeSetVisible={setRelativeSetVisible}
                /> : null
            }
        </Input.Group>
    </Form.Item>
}


export const canUseThisDateFilter = (f: any): boolean => {
    console.log('aaaa')
    console.log(f)
    if (f.operator === 'all')
        return false;
    if (f.operator1 === 'section' && f.value[0] == null && f.value[1] == null)
        return false;
    return !!f.value;
}

/**
 * 根据界面的值，将其转化成ajax的参数
 * @param filter 
 * @param addText ,将operator,text 格式化成显示的文字，如  年度 2012年
 * 
 *      property: property,
        operator: 'all',
        operator1: 'this',
        value: undefined,
        searchfor: 'date',
        title: filterField.defaulttitle,
 * 
 */
export const arrageDataFilterToParam = (filter: object, addText: boolean = false) => {
    const result: any = {};
    apply(result, filter);
    if (result.operator1 == 'this') {
        result.value = getDateFormatValue(result.value, result.operator, addText);
        if (addText)
            result.operator = '当前' + getTitleWord(result.operator);
        else
            result.operator = 'this' + result.operator;
    } else if (result.operator1 == 'select') {
        // 选择年月季日周
        result.value = getDateFormatValue(result.value, result.operator, addText);
        if (addText)
            result.operator = getTitleWord(result.operator);
        else
            if (result.operator == 'month' || result.operator == 'quarter') {
                result.operator = 'year' + result.operator;
            }
    } else if (result.operator1 == 'section') {
        result.value = getDateFormatValue(result.value[0], result.operator, addText) + '--' +
            getDateFormatValue(result.value[1], result.operator, addText);
        if (addText)
            result.operator = getTitleWord(result.operator) + '区间';
        else
            result.operator = result.operator + 'section';
    } else if (result.operator1 == 'relative') {
        if (addText) {
            result.value = result.text;
            result.operator = getTitleWord(result.operator) + '相对区间';
        }
        else
            result.operator = 'relative' + result.operator + 'section';
    }
    delete result.operator1;
    return result;
}


const getDateFormatValue = (date: any, type: string, addText: boolean = false): string => {
    if (addText) {
        if (date)
            return moment(date).format(sectionFormat[type]);
        else
            return '';
    } else {
        if (date)
            return moment(date).format(type == 'year' ? 'YYYY' : type == 'month' ?
                'YYYY-M' : type == 'quarter' ? 'YYYY-Q' : type == 'week' ? 'YYYY-w' : 'YYYY-MM-DD');
        else
            return '';
    }
}
