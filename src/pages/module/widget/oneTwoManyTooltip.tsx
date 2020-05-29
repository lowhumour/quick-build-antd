import React, { useState, useEffect } from 'react';
import { Table, Empty } from 'antd';
import { fetchChildModuleData } from '../service';
import { getModuleInfo, getFormSchemeFormType } from '../modules';
import { ModuleModal, ModuleFieldType } from '../data';
import { getFieldDefine } from '../grid/fieldsFactory';

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

const OneTowManyTooltip = ({ moduleName, parentid, childModuleName, fieldahead }:
    {
        moduleName: string, parentid: string, childModuleName: string, fieldahead: string
    }): any => {
    const [data, setData] = useState([]);
    const [loading , setLoading] = useState(true);
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
            setData(response.msg || []);
        })
    }, [])

    const cModuleInfo: ModuleModal = getModuleInfo(childModuleName);
    const scheme = getFormSchemeFormType(childModuleName, 'onetomanytooltip');

    const columns = scheme.details.map((formField: any) => {
        const fieldDefine: ModuleFieldType = getFieldDefine(formField.fieldid, cModuleInfo);
        return {
            title: fieldDefine.fieldtitle,
            dataIndex: fieldDefine.fieldname,
            key: fieldDefine.fieldname,
        }
    })

    return !data.length ?
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} ></Empty> :
        <Table loading={loading} dataSource={data} columns={columns} size="small" pagination={false} />;


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