import React, { useEffect, useState, CSSProperties } from 'react';
import { Descriptions, Card, Popover, Alert } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';

// https://github.com/Caldis/react-zmage
import Zmage from 'react-zmage';

import { ModuleModal, ModuleFieldType } from '../data';
import { fetchObjectRecord } from '../service';

import { getFieldDefine } from '../grid/fieldsFactory';
import { apply } from '@/utils/utils';
import { getModuleInfo } from '../modules';

var numeral = require('numeral');
const yes = <span style={{ color: '#333333' }}><CheckOutlined /></span>;
const no = <span style={{ color: '#993333' }}><CloseOutlined /></span>;
const getBooleanText = (value: boolean) => {
    if (value === null || value === undefined) return null;
    return value ? yes : no;
}

export const DescriptionWithId = ({ moduleInfo, id, title }:
    { moduleInfo: ModuleModal, id: string, title: string }) => {
    const [record, setRecord] = useState({ __loading__: true });
    useEffect(() => {
        setTimeout(() => {
            fetchObjectRecord({ objectname: moduleInfo.modulename, id }).then((response: any) => {
                setRecord(response.data);
            })
        }, 200)
    }, [])
    return Description({ moduleInfo, record, title });
}

const Description = ({ moduleInfo, record, title }:
    { moduleInfo: ModuleModal, record: any, title: string }) => {

    return <Card title={moduleInfo.objectname + "：" + title} bodyStyle={{ padding: 0, margin: -1 }}>
        {generateForm({ moduleInfo, record })}
    </Card>
}

const generatePanel = ({ panel, moduleInfo, record }:
    { panel: any, moduleInfo: ModuleModal, record: object }) => {
    return panel.details && panel.details.length ?
        <Descriptions style={{ paddingTop: 0, paddingLeft: -10, paddingRight: -10 }}
            bordered={true} column={panel.cols == 1 ? { lg: 1, md: 1, sm: 1, xs: 1 } :
                { lg: panel.cols, md: 2, sm: 1, xs: 1 }}
            size="small" >
            {
                panel.details.map((item: any) =>
                    generateItem({ item, moduleInfo, record })
                )
            }
        </Descriptions> : null
}

const generateForm = ({ moduleInfo, record }:
    { moduleInfo: ModuleModal, record: object }) => {
    const scheme = moduleInfo.formschemes[0];
    return <>
        {scheme.details.map((panel: any) => {
            return <>
                <div style={{ padding: '1px' }}><Alert showIcon={false}
                    message={panel.title} type="success" banner />
                </div>
                {generatePanel({ panel, moduleInfo, record })}
            </>
        })}
    </>
}

const numberStyle: React.CSSProperties = { color: 'blue', textAlign: 'right', display: 'block', minWidth: '80px' };

const getDateValue = (value: any, field: ModuleFieldType) => {
    return <span style={{ color: '#a40' }}>{value ? value.substr(0, 10) : null}</span>
}

const getDatetimeValue = (value: any, field: ModuleFieldType) => {
    return <span style={{ color: '#a40' }}>{value ? value.substr(0, 16) : null}</span>
}

const getIntegerValue = (value: number, field: ModuleFieldType) => {
    return <span style={numberStyle}>{value} {field.unittext}</span>
}

const getDoubleValue = (value: number, field: ModuleFieldType) => {
    return <span style={numberStyle}>{numeral(value).format('0,0.00')} {field.unittext}</span>
}

const getPercentValue = (value: number, field: ModuleFieldType) => {
    return <span style={numberStyle}>{numeral(value * 100).format('0,0.00')} %</span>
}

const getOneTwoManyValue = (value: number, field: ModuleFieldType) => {
    return <span style={numberStyle}>{value} 条</span>
}


const imageStyle = { width: 64, height: 64 };

const getImageItem = (value: string, field: any) => value ? <Zmage zIndex={19260817} {...imageStyle}
    controller={{
        close: true,// 关闭按钮
        zoom: true,// 缩放按钮
        download: true,// 下载按钮
        rotate: true,// 旋转按钮
        flip: true, // 翻页按钮
        pagination: true, // 多页指示
    }} animate={{
        flip: 'fade',
    }}
    src={value ? "data:image/jpeg;base64," + value :
        "/api/resources/images/system/noimage.png"} alt={field.fieldtitle} /> : null


const generateItem = ({ item, moduleInfo, record }:
    { item: any, moduleInfo: ModuleModal, record: object }) => {
    console.log(item);
    let field: ModuleFieldType = getFieldDefine(item.fieldid, moduleInfo) || {};
    const styles: CSSProperties = { whiteSpace: "pre-line", minWidth: '40px' }
    if (!field.fieldname) {
        apply(field, {
            fieldname: item.additionFieldname,
            fieldtitle: item.title || item.defaulttitle,
            fieldtype: item.aggregate == 'count' ? 'Integer' : 'string',
            unittext: item.aggregate == 'count' ? '条' : undefined,
        })
    }
    if (field.ishidden) return null;
    let value: any = record[field.fieldname];
    if (field.fDictionaryid)
        value = record[field.fieldname + '_dictname'];
    else if (field.fieldname == moduleInfo.namefield)
        value = <b>{value}</b>;
    else if (field.isManyToOne) {
        value = record[field.manyToOneInfo.nameField];
        const id = record[field.manyToOneInfo.keyField];
        return <Descriptions.Item label={field.fieldtitle} span={item.colspan}>
            {value ?
                <Popover trigger='click'
                    content={<DescriptionWithId id={id} title={value} moduleInfo={getModuleInfo(field.fieldtype)} />}>
                    <a href='#' ><FileTextOutlined /> </a>
                </Popover> : null
            }
            {value}
        </Descriptions.Item>
    } else if (field.isOneToMany) {
        value = getOneTwoManyValue(value, field);
    } else
        switch (field.fieldtype.toLowerCase()) {
            case 'money':
            case 'double':
            case 'float':
                //styles.textAlign = 'right';
                value = getDoubleValue(value, field);
                break;
            case 'integer':
                value = getIntegerValue(value, field);
                //styles.textAlign = 'right';
                break;
            case 'percent':
                value = getPercentValue(value, field);
                //styles.textAlign = 'right';
                break;
            case 'date':
                value = getDateValue(value, field);
                break;
            case 'datetime':
            case 'timestamp':
                value = getDatetimeValue(value, field);
                break;
            case 'image':
                value = getImageItem(value, field);
                break;
            case 'boolean':
                value = getBooleanText(value);
            default:
                break;
        }
    return <Descriptions.Item label={field.fieldtitle} span={item.colspan} style={styles}>
        {value}
        {/* {field.unittext ? field.unittext : null} */}
    </Descriptions.Item>

}

export default Description;