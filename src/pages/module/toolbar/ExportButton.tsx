import React from 'react';

import { Dropdown, Button, Menu, Checkbox } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { BsDownload} from 'react-icons/bs';
import { ModuleModal, ModuleState } from '../data';
import { downloadGridExcel } from '../service';
import { getCurrentExportGridColumnDefine } from '../grid/columnFactory';
import { apply } from '@/utils/utils';
import { getAllFilterAjaxParam, getAllFilterAjaxText } from '../grid/filterUtils';

const { SubMenu } = Menu;

const GRIDEXCELEXPORT = "gridmodeexcelexport";

const getGridExcelExportItems = (moduleInfo: ModuleModal) => {
    const { formschemes } = moduleInfo;
    return formschemes.filter((scheme) => scheme.formtype === GRIDEXCELEXPORT).map((scheme) =>
        <Menu.Item key={GRIDEXCELEXPORT + "||" + scheme.formschemeid + "||" + scheme.schemename}
            title={scheme.schemename}>
            <FileExcelOutlined />{scheme.schemename}
        </Menu.Item>)

}


const ExportButton = ({ moduleInfo , moduleState }: { moduleInfo: ModuleModal , moduleState : ModuleState }) => {

    const handleMenuClick = (e: any) => {
        console.log(e)
        const { key }: { key: string } = e;
        const { modulename: moduleName } = moduleInfo;
        const params: any = {
            moduleName,
            columns: JSON.stringify(getCurrentExportGridColumnDefine(moduleName)),
            page: 1,
            start: 0,
            limit: 1000000,
            conditions: JSON.stringify([]),

            onlyselected: false,
            colorless: false,
            usemonetary: false,
            monetaryUnit: 10000,
            monetaryText: '万',
            sumless: false,
            unitalone: false,
            pagesize: 'pageautofit',
            autofitwidth: true,
            scale: 100,
        }
        apply(params , getAllFilterAjaxParam(moduleState));
        params.conditions = JSON.stringify(getAllFilterAjaxText(moduleState));

        if (key.startsWith(GRIDEXCELEXPORT)) {
            const parts = key.split('||');
            params.formschemeid = parts[1];
            params.formschemetitle = parts[2];
        }
        downloadGridExcel(params)
    };

    const menu = <Menu onClick={handleMenuClick} key="exportButton">
        <Menu.Item key="toExcel"><FileExcelOutlined />列表导出至Excel文档</Menu.Item>
        <Menu.Item key="2"><FileExcelOutlined />当前页记录导出至Excel文档</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="toPdf"><FilePdfOutlined />列表导出至pdf文档</Menu.Item>
        <Menu.Item key="4"><FilePdfOutlined />当前页记录导出至pdf文档</Menu.Item>
        <Menu.Divider />
        {
            getGridExcelExportItems(moduleInfo)
        }
        <SubMenu key="sub3" title="列表导出设置">
            <Menu.Item key="7" ><Checkbox></Checkbox>Option 7</Menu.Item>
            <Menu.Item key="8"><Checkbox></Checkbox>Option 8</Menu.Item>
        </SubMenu>
    </Menu>;


    return <Dropdown overlay={menu}>
        <Button>
            导出 <BsDownload className="anticon" />
        </Button>
    </Dropdown>

}

export default ExportButton;