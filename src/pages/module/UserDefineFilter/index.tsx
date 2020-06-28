import React from 'react';
import { Card, Button, Space, Row, Col, Form, Input, Select, TreeSelect, Checkbox, Radio } from 'antd';
import { ModuleState, TextValue } from '../data';
import {
    getFilterScheme, getModuleInfo, getModuleComboDataSource,
    getModulTreeDataSource, convertModuleIdValuesToText, convertTreeModuleIdValuesToText
} from '../modules';
import { apply } from '@/utils/utils';
import { getDateFilter, canUseThisDateFilter, arrageDataFilterToParam } from './dateFilter';
import TagSelect from './TagSelect';
import { getDictionaryData, convertDictionaryValueToText } from '../dictionary/dictionarys';
import { getBooleanFilterOption, getBooleanInValueText } from '../grid/filterUtils';
import { fetchNavigateTreeDataSync } from '../service';
import styles from './index.less';

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


/**
 * 所有用户筛选方案的detailid的记录个数的存放
 */
const detailidNavigateCountCache = {};

/**
 * 取得一个筛选字段按照导航方式获取的数据，里面有记录数
 * @param moduleState 
 * @param filterField 
 */
const getFieldNavigateCountArray = (moduleState: ModuleState, filterField: any): any[] => {
    const { moduleName } = moduleState;
    const title = filterField.title || filterField.defaulttitle;
    const { fieldname, detailid } = filterField;

    if (!detailidNavigateCountCache[detailid])
        detailidNavigateCountCache[detailid] = fetchNavigateTreeDataSync({
            moduleName,
            title,
            navigateschemeid: fieldname,
            cascading: false,
            isContainNullRecord: false
        }).children[0].children.map((rec: any) => ({
            value: rec.fieldvalue === '_null_' ? 'null' : rec.fieldvalue,
            count: rec.count,
            text: rec.text,
        }))
    return detailidNavigateCountCache[detailid];
}

const addCountToText = (array: any[], moduleState: ModuleState, filterField: any) => {
    if (!(filterField.addCount === false))
        array.forEach((rec: TextValue) => {
            getFieldNavigateCountArray(moduleState, filterField).forEach((nrec: any) => {
                if (rec.value == nrec.value)
                    rec.text = <span>{rec.text}
                        <span className={styles.filterCount} >{'(' + nrec.count + ')'}</span>
                    </span>;
            })
        })
}


/**
 * 自定义筛选的附件属性：
 * allowEmpty : true // 允许为空值(默认为false)：boolean类型，manytoone, dictionary 都会加入 未定义值
 * addCount : false  // 不加入boolean,manytoone,dictionary 的记录数(默认为true)
 * comboThisField : true // 按照当前字段的值的字义来展示，按照navigate的模式来处理,和dictionary类似
 * tagSelect : true  // 使用tag方式选择筛选条件，boolean类型，manytoone, dictionary 有效
 *          tagSelect:可配置属性 
 *                  expandable:true|false, 
 *                  expand= !expandable || true|false 
 * checkbox : true  // 使用checkbox多选的方式来进行筛选条件，boolean ,manytoone,dictionary有效
 * radio : true  // 使用radio 单选的方式来进行筛选条件，boolean ,manytoone,dictionary有效
 * hideCheckAll : true   // tagSelect中不显示“选中所有”的按钮
 */

const OPERATEWIDTH = 90;

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
        const cols = scheme.details[0].cols || 3;
        return <Row gutter={0}>
            {
                scheme.details[0].details.map((filterField: any) => {
                    const labelWarrapCol = {};
                    const colspan = Math.min(filterField.colspan || 1, cols);
                    if (cols == 1) {
                        apply(labelWarrapCol, {
                            labelCol: { span: 4 },
                            wrapperCol: { span: 18 }
                        })
                    } else if (colspan == 2)
                        apply(labelWarrapCol, colTwoSpan)
                    else if (colspan == 3)
                        apply(labelWarrapCol, colThreeSpan)
                    const params = {
                        moduleState, filterField, initValues, form, labelWarrapCol
                    }
                    return <Col xs={24}
                        md={cols == 1 ? 24 : 12 * Math.min(colspan, 2)}
                        xl={cols == 1 ? 24 : (24 / cols) * Math.min(colspan, cols)}>
                        {filterField.comboThisField ? getComboThisFieldFilter(params) :
                            filterField.fDictionaryid ? getDictionaryFilter(params) :
                                filterField.isNumberField ? getNumberFilter(filterField, initValues, form, labelWarrapCol) :
                                    filterField.isDateField ? getDateFilter(filterField, initValues, form, labelWarrapCol) :
                                        filterField.isBooleanField ? getBooleanFilter(params) :
                                            filterField.xtype == 'usermanytoonetreefilter' ?
                                                getManyToOneTreeFilter(filterField, initValues, form, labelWarrapCol) :
                                                filterField.manyToOneInfo ? getManyToOneFilter(params) :
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
                    <Button onClick={() => {
                        console.log(form.getFieldsValue());
                    }
                    }>条件</Button>

                </Space>
            </span>
        </Card>
    else return null;

}


const { Option } = Select;


const getSelectCommonFilter = (filterField: any, dictData: any, labelWarrapCol: any) => {
    /* 在othersetting 中设置 tagSelect : true, 即为tag选择方式，否则为combobox方式  */
    const title = filterField.title || filterField.defaulttitle;
    return filterField.tagSelect ?
        <Form.Item label={title}   {...labelWarrapCol} >
            <Input.Group compact style={{ display: 'flex' }}>
                <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                    <TagSelect hideCheckAll={!!filterField.hideCheckAll} expandable={filterField.expandable}
                        expand={!filterField.expandable || filterField.expand} >
                        {dictData.map((rec: TextValue) => <TagSelect.Option value={rec.value}>{rec.text}</TagSelect.Option>)}
                    </TagSelect>
                </Form.Item>
                <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                    <Input type="hidden" />
                </Form.Item>
            </Input.Group>
        </Form.Item> : filterField.checkbox ?
            <Form.Item label={title} {...labelWarrapCol} >
                <Input.Group compact style={{ display: 'flex' }}>
                    <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                        <Checkbox.Group style={{ flex: 1 }} options={dictData.map((r: any) => ({ value: r.value, label: r.text }))} />
                    </Form.Item>
                    <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                        <Input type="hidden" />
                    </Form.Item>
                </Input.Group>
            </Form.Item> : filterField.radio ?
                <Form.Item label={title} {...labelWarrapCol} >
                    <Input.Group compact style={{ display: 'flex' }}>
                        <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                            <Radio.Group style={{ flex: 1 }} options={dictData.map((r: any) => ({ value: r.value, label: r.text }))} />
                        </Form.Item>
                        <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                            <Input type="hidden" />
                        </Form.Item>
                    </Input.Group>
                </Form.Item> : <Form.Item label={title} {...labelWarrapCol} >
                    <Input.Group compact style={{ display: 'flex' }}>
                        <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                            <Select mode="multiple" style={{ flex: 1 }} allowClear optionFilterProp="label">
                                {dictData.map((rec: any) =>
                                    <Option value={rec.value} label={rec.label}>{rec.text}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                            <Input type="hidden" />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>
}

/**
 * 一个字段，根据其所有的值来进行筛选
 * @param param0 
 */
const getComboThisFieldFilter = ({ moduleState, filterField, initValues, form, labelWarrapCol }:
    { moduleState: ModuleState, filterField: any, initValues: object, form: any, labelWarrapCol: any }): any => {
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'in',
        value: undefined,
        title,
        //comboThisFieldId: filterField.fieldid,
    };

    const dictData: TextValue[] = getFieldNavigateCountArray(moduleState, filterField).map((rec) => ({
        value: rec.value,
        count: rec.count,
        label: rec.text,
        text: <span>{rec.text}
            <span className={styles.filterCount} >{'(' + rec.count + ')'}</span>
        </span>,
    }));
    // if (filterField.allowEmpty)
    //     dictData.splice(0, 0, { value: 'null', text: '未定义' })
    if (filterField.isBooleanField) {
        dictData.forEach((rec: any) => {
            if (rec.label == '1') rec.label = '是';
            if (rec.label == '0') rec.label = '否';
            rec.text = <span>{rec.label}
                <span className={styles.filterCount} >{'(' + rec.count + ')'}</span>
            </span>;
        })
    }
    return getSelectCommonFilter(filterField, dictData, labelWarrapCol);
}


const getDictionaryFilter = ({ moduleState, filterField, initValues, form, labelWarrapCol }:
    { moduleState: ModuleState, filterField: any, initValues: object, form: any, labelWarrapCol: any }): any => {
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'in',
        value: undefined,
        title,
        fDictionaryid: filterField.fDictionaryid,
    };
    const dictData: TextValue[] = getDictionaryData(filterField.fDictionaryid).map((rec: any) => ({ ...rec, label: rec.text }));
    if (filterField.allowEmpty)
        dictData.splice(0, 0, { value: 'null', text: '未定义', label: '未定义' })
    addCountToText(dictData, moduleState, filterField);
    return getSelectCommonFilter(filterField, dictData, labelWarrapCol);
}

const getManyToOneFilter = ({ moduleState, filterField, initValues, form, labelWarrapCol }:
    { moduleState: ModuleState, filterField: any, initValues: object, form: any, labelWarrapCol: any }): any => {
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'in',
        value: undefined,
        title,
        manyToOneObject: filterField.manyToOneInfo.objectname,
    };
    const dictData: TextValue[] =
        getModuleComboDataSource(filterField.manyToOneInfo.objectname).map((rec: any) => ({ ...rec, label: rec.text }));
    if (filterField.allowEmpty)
        dictData.splice(0, 0, { value: 'null', text: '未定义', label: '未定义' })
    addCountToText(dictData, moduleState, filterField);
    return getSelectCommonFilter(filterField, dictData, labelWarrapCol);

}


const { SHOW_PARENT } = TreeSelect;
const getManyToOneTreeFilter = (filterField: any, initValues: object, form: any, labelWarrapCol: any): any => {
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'startwith',
        value: undefined,
        title,
        manyToOneTreeObject: filterField.manyToOneInfo.objectname,
    };
    const dictData: TextValue[] = getModulTreeDataSource(filterField.manyToOneInfo.objectname);
    /* 在othersetting 中设置 tagSelect : true, 即为tag选择方式，否则为combobox方式  */
    const arrageTreeNode = (array: any): TextValue[] => {
        return array.map((rec: TextValue) => ({
            value: rec.value || '',
            label: rec.text,
            key: rec.value,
            children: rec.children && rec.children.length > 0 ? arrageTreeNode(rec.children) : null
        }));
    };

    const options = arrageTreeNode(dictData);
    return <Form.Item label={title} {...labelWarrapCol} >
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item name={[filterField.fieldname, 'value']} noStyle>
                <TreeSelect style={{ flex: 1 }} allowClear showCheckedStrategy={SHOW_PARENT}
                    treeData={options} optionFilterProp="label" treeCheckable={true} treeDefaultExpandAll={true}>
                </TreeSelect>
            </Form.Item>
            <Form.Item name={[filterField.fieldname, 'operator']} noStyle >
                <Input type="hidden" />
            </Form.Item>
        </Input.Group>
    </Form.Item>
}

const getBooleanFilter = ({ moduleState, filterField, initValues, form, labelWarrapCol }:
    { moduleState: ModuleState, filterField: any, initValues: object, form: any, labelWarrapCol: any }): any => {
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'in',
        value: undefined,
        title,
        type: 'boolean',
    };
    const dictData: TextValue[] = [...getBooleanFilterOption(!filterField.allowEmpty)];
    addCountToText(dictData, moduleState, filterField);
    return getSelectCommonFilter(filterField, dictData, labelWarrapCol);
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
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'eq',
        value: undefined,
        type: 'number',
        title,
    };
    return <Form.Item label={title}  {...labelWarrapCol}>
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select style={{ width: OPERATEWIDTH }}>
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
    const title = filterField.title || filterField.defaulttitle;
    initValues[filterField.fieldname] = {
        property: filterField.fieldname,
        operator: 'like',
        value: undefined,
        type: 'string',
        title,
    };
    return <Form.Item label={title}  {...labelWarrapCol}>
        <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
                name={[filterField.fieldname, 'operator']}
                noStyle
            >
                <Select style={{ width: OPERATEWIDTH }}>
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
 * @param addText
 * @param separater in 的所有数据的连接符',' 或者 <br />
 */
export const changeUserFilterToParam = (userfilter: any, addText: boolean = false,
    separater: string = ''): any[] => {
    let result = [];
    if (userfilter && userfilter.length) {
        const filters = userfilter.filter((f: any) => {
            if (f.searchfor === 'date')
                return canUseThisDateFilter(f);
            return isEmptyOrEmptyArray(f.value)
        });
        result = filters.map((filter: any) => {
            const f = { ...filter };
            if (f.searchfor === 'date')
                return arrageDataFilterToParam(f, addText);
            if (addText) {
                if (f.fDictionaryid)
                    f.value = convertDictionaryValueToText(f.fDictionaryid, f.value, separater);
                else if (f.type == 'boolean')
                    f.value = getBooleanInValueText(f.value);
                else if (f.manyToOneTreeObject)
                    f.value = convertTreeModuleIdValuesToText(f.manyToOneTreeObject, f.value, separater);
                else if (f.manyToOneObject)
                    f.value = convertModuleIdValuesToText(f.manyToOneObject, f.value, separater);
            }
            return f;
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