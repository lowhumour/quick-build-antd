import React, { CSSProperties } from 'react';
import { Popover, Switch } from 'antd';
import {
    FileTextOutlined, UnorderedListOutlined,
} from '@ant-design/icons'
//https://github.com/Caldis/react-zmage
import Zmage from 'react-zmage';

import Description, { DescriptionWithId } from '../descriptions';
import { ModuleModal, ModuleState } from '../data';
import { getModuleInfo, getFormSchemeFormType } from '../modules';
import OneTowManyTooltip from '../widget/oneTwoManyTooltip';

var numeral = require('numeral');
const imageStyle = { width: 64, height: 64 };

export const imageRender = (value: any) => {

    return value ? <Zmage zIndex={19260817} {...imageStyle}
        controller={{
            close: true,// 关闭按钮
            zoom: true,// 缩放按钮
            download: true,// 下载按钮
            rotate: true,// 旋转按钮
            flip: true, // 翻页按钮
            pagination: false, // 多页指示
        }} animate={{
            flip: 'fade',
        }}
        src={value ? "data:image/jpeg;base64," + value :
            "/api/resources/images/system/noimage.png"} /> : null
}

export const nameFieldRender = (value: any, record: object, recno_: number,
    { moduleInfo }: { moduleInfo: ModuleModal }) => {
    return <>
        <Popover trigger='click'
            content={<Description record={record} title={value}
                moduleInfo={moduleInfo} ></Description>}>
            <a href='#' ><FileTextOutlined /> </a>
        </Popover>
        <span><b> {value}</b></span></>
}

/**
 * manytoone  字段的显示，可以点击图标显示manytoone记录的信息
 * @param value 
 * @param record 
 * @param recno_ 
 * @param param3 
 */
export const manyToOneFieldRender = (value: any, record: Object, recno_: number,
    { moduleInfo, keyField }:
        { moduleInfo: ModuleModal, keyField: string }) => {
    return <>
        <Popover trigger='click'
            content={<DescriptionWithId id={record[keyField]} title={value}
                moduleInfo={moduleInfo}></DescriptionWithId>}>
            <FileTextOutlined />
        </Popover>
        <span style={{ color: '#11264f' }}> {value}</span></>
}

export const OneToManyFieldRender = (value: any, record: Object, recno_: number,
    { fieldtitle, childModuleName, fieldahead, moduleInfo }:
        { fieldtitle: string, childModuleName: string, fieldahead: string, moduleInfo: ModuleModal }) => {

    const formScheme = getFormSchemeFormType(childModuleName, 'onetomanytooltip');
    if (formScheme)
        return <Popover trigger='click'
            title={<span><span dangerouslySetInnerHTML={{ __html: record[moduleInfo.namefield] + ' 的 ' + fieldtitle }}></span>
                <span style={{ float: "right", marginLeft: "30px" }}><a>新页面中打开</a></span></span>}
            content={<>
                {/* {record[moduleInfo.primarykey]}
    --{childModuleName}<br /> -- {fieldahead}
                {formScheme.details.map((formField: any) => formField.orderno)} */}

                <OneTowManyTooltip moduleName={moduleInfo.modulename} fieldahead={fieldahead}
                    childModuleName={childModuleName} parentid={record[moduleInfo.primarykey]}
                    count={value ? value : 0}
                />

            </>}
        >
            <span> <a>{`${value} 条`}</a>
                <UnorderedListOutlined /> </span></Popover>;
    else return <span> <a>{`${value} 条`}</a></span>
}

export const integerRender = (value: number) => {
    if (!value) value = 0;
    return <span style={{ color: value >= 0 ? 'blue' : 'red' }}>{value}</span>
}

export const floatRender = (value: number) => {
    if (!value) value = 0;
    return <span style={{ color: value >= 0 ? 'blue' : 'red' }}>
        {numeral(value).format('0,0.00')}
    </span>;
}

export const monetaryRender = (value: number, record: Object, recno: number, moduleState: ModuleState) => {
    const { monetary } = moduleState;
    if (value) {
        if (monetary.monetaryUnit == 1) {
            return floatRender(value);
        } else {
            value = value / monetary.monetaryUnit;
            return <>{floatRender(value)}
                {moduleState.monetaryPosition === 'columntitle' ? '' : moduleState.monetary.monetaryColoredText}
            </>
        }
    } else
        return null; // 如果为0,则不显示
}

export const percentRender = (value: number) => {
    if (!value) value = 0;
    let width = (value <= 1 ? value : 1);
    width = (width >= 0 ? width : 0);
    return (
        <div style={{ width: '100px' }}>
            <div style={{ float: "left", border: '1px solid #C0C0C0', height: '22px', width: '100%' }}>
                <div style={{ float: "left", textAlign: 'center', verticalAlign: 'middle', width: '100%' }}>
                    {numeral(value).format('0.00%')}</div>
                <div style={{
                    background: '#B7D6E5',
                    width: `${width * 100}%`,
                    height: '100%'
                }}
                />
            </div>
        </div>)
}

const dateStyle: CSSProperties = { color: '#a40', whiteSpace: 'nowrap' }
export const dateRender = (value: string) =>
    <span style={dateStyle}>{value ? value.substr(0, 10) : null}</span>
// 日期时间大多数都是不显示秒，只显示到分钟
export const datetimeRender = (value: string, record: Object, recno: number, ) =>
    <span style={dateStyle}>{value ? value.substr(0, 16) : null}</span>
// <><span style={dateStyle}>{value ? value.substr(0, 11) : null}</span>
//     <div style={dateStyle}>{value ? value.substr(11, 5) : null}</div></>

export const booleanRenderer = (value: boolean) => <Switch size="small" checked={!!value} />

export const directionaryFieldRender = (value: any, record: Object, recno: number,
    { fieldname }: { fieldname: string }) => {
    return <> {record[fieldname + '_dictname']}</>
}
