import React, { useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import { BarsOutlined } from '@ant-design/icons';
import { fetchChildModuleData } from '../service';
import { getModuleInfo, getFormSchemeFormType } from '../modules';
import { ModuleModal, ModuleFieldType } from '../data';
import { getFieldDefine } from '../grid/fieldsFactory';
import styles from '../grid/columnFactory.less';
/**
 *  post formdata
 *  /api/platform/dataobject/fetchchilddata.do
 *  objectid: FDictionary
    parentid: 8a53b78262ea6e6d0162ea6e8b9c009b
    childModuleName: FDictionarydetail
    fieldahead: FDictionarydetail.with.FDictionary
    limit: 20
    page: 1
    start: 0
 * 
 * @param param0 
 * 
 */

const RECNO = '__recno__';

const OneTowManyTooltip = ({ moduleName, parentid, childModuleName, fieldahead, count }:
    {
        moduleName: string, parentid: string, childModuleName: string, fieldahead: string, count: number
    }): any => {
    const array = []
    for (let i = 0; i < Math.min(count, 20); i++)
        array.push({ __recno__: i + 1 });
    const [data, setData] = useState(array);
    console.log(data);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchChildModuleData({
            objectid: moduleName,
            parentid,
            childModuleName,
            fieldahead,
            limit: 20,
            page: 1,
            start: 0,
        }).then((response: any) => {
            setLoading(false);
            let __recno__ = 1;
            response.msg.forEach((record: any) => {
                record[RECNO] = __recno__++;
            })
            setData(response.msg || []);
        })
    }, [])

    const cModuleInfo: ModuleModal = getModuleInfo(childModuleName);
    const scheme = getFormSchemeFormType(childModuleName, 'onetomanytooltip');

    let columns: any[] = scheme.details.map((formField: any) => {
        const fieldDefine: ModuleFieldType = getFieldDefine(formField.fieldid, cModuleInfo);
        return {
            title: <span style={{ wordBreak: 'keep-all' }}>{fieldDefine.fieldtitle}</span>,
            dataIndex: fieldDefine.isManyToOne || fieldDefine.isOneToOne ?
                fieldDefine.manyToOneInfo.nameField :
                fieldDefine.fieldname,
            key: fieldDefine.fieldname,
            render: (value: any, record: Object, recno_: number) => {
                return <span style={{ wordBreak: 'keep-all' }}>{value}</span>
            }
        }
    })
    columns = [{
        title: <Tooltip title="记录顺序号"><BarsOutlined /></Tooltip>,
        dataIndex: RECNO,
        key: RECNO,
        className: styles.numberalignright,
    }].concat(columns);

    return <> <Table loading={loading} dataSource={data} columns={columns} size="small" pagination={false} />
        {
            count > 20 ? <div style={{padding : '5px'}}>等共 {count} 条记录</div> : null
        }</>



    return <table cellPadding="1" style={{ border: "1" }} className="ant-table.ant-table-bordered">
        {data.map((record: any) => {
            return <tr style={{ padding: '5px' }} className="ant-table-row">
                <td style={{ padding: '5px' }} className="ant-table-cell">{record.title}</td>
                <td style={{ padding: '5px' }}>{record.orderno}</td>
                <td style={{ padding: '5px' }}>{record.vcode}</td>
                <td style={{ padding: '5px' }}>{record['FDictionary.title']}</td>
            </tr>
        })}
    </table>;

}


export default OneTowManyTooltip;