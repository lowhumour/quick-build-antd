
// import { nameFieldRender, booleanrender, directionaryFieldRender } from './columnRender';
import React, { Key, useState } from 'react';
import { Tooltip, Button, Input, Popover, Select, Divider, message, Modal, Space, Radio } from 'antd';
import {
  PaperClipOutlined, CarryOutOutlined, BarsOutlined, SearchOutlined, InfoCircleOutlined,
  EditOutlined, QuestionCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import { ModuleModal, ModuleFieldType, ColumnFilterInfoType, ModuleState, TextValue, } from '../data';
import styles from './columnFactory.less';
import { getSortOrder } from './sortUtils';
import { getFieldDefine } from './fieldsFactory';
import {
  nameFieldRender, booleanRenderer, dateRender, datetimeRender,
  directionaryFieldRender, manyToOneFieldRender, imageRender, OneToManyFieldRender,
  integerRender, floatRender, percentRender, monetaryRender
} from './columnRender';
import {
  getColumnFilterValue, getBooleanFilter, getStringColumnFilterValue,
  getNumberColumnFilterValue, getColumnFilterInfo, NumberSelectOption
} from './filterUtils';
import { apply, applyIf, applyOtherSetting } from '@/utils/utils';
import { Dispatch } from 'redux';
import { getDictionaryData } from '../dictionary/dictionarys';
import { getModuleInfo, getModuleComboDataSource } from '../modules';
import { deleteModuleRecord } from '../service';
import { attachemntRenderer } from '../attachment/utils';
import { getMonetarysValueText } from './monetary';

// import { getSortOrder } from './sortUtils';
// import { getColumnFilterValue, getBooleanFilter } from './filterUtils';
// import { DictionaryDefine } from '@/models/dictionary';

const moduleExportGridColumnDefine: Record<Key, object> = {};

export const getCurrentExportGridColumnDefine = (moduleName: string) => {
  return moduleExportGridColumnDefine[moduleName];
}

const getExportGridColumns = (items: any[]) => {
  const regexp = new RegExp('<[^>]*>', 'gm');// 把所有的超文本标记全部删掉
  const result: any[] = [];
  items.forEach((item: any) => {
    var t = item.originText || item.menuText || item.text;
    var column: any = {
      text: t ? t.replace(regexp, '') : '',
      gridFieldId: item.gridFieldId
    };
    if (item.hidden) column.hidden = true;
    // 如果ActionColumn需要导出，则设置isExport:true
    if (!item.children || (item.dataIndex && item.isExport)) {
      column.dataIndex = item.dataIndex;
      if (item.manytooneNameName) column.dataIndex = item.manytooneNameName;
      if (item.fDictionary) column.dataIndex += '_dictname';
      column.ismonetary = item.fieldDefine && item.fieldDefine.ismonetary;
      column.unittext = item.fieldDefine && item.fieldDefine.unittext;
      if (item.isOneToMany) column.unittext = '条';
    } else {
      column.items = getExportGridColumns(item.children);
      if (column.items.length == 0) delete column.items;
    }
    if (((column.dataIndex || column.items) && !item.hidden) && column.dataIndex !== "__recno__")
      result.push(column);
  })
  return result;
}


export const getColumns = ({ moduleInfo, moduleState, gridScheme, dispatch }:
  {
    moduleInfo: ModuleModal, moduleState: ModuleState, gridScheme: any, dispatch: Dispatch<any>;
  }) => {
  let columns = getLockedLeftColumns(moduleInfo, moduleState, dispatch);
  let result = columns.concat(getGroupAndFieldColumns({ moduleState, moduleInfo, columns: gridScheme.columns, dispatch }));

  // 记录的显示，修改，删除以及附加按钮是不是在记录上
  // if (grid.getViewModel().isRecordAction() && grid.getViewModel().get('toolbar.buttonInRecordPosition') != 'left') {
  //   var actionColumn = getActionColumn(module, grid);
  //   if (actionColumn) result.push(actionColumn);
  // }
  // console.log('grid column result .....')
  // console.log(result);

  moduleExportGridColumnDefine[moduleInfo.modulename] = getExportGridColumns(result);
  result = result.concat(getActionColumns({ moduleInfo, moduleState, dispatch }))
  return result;
}

const getGroupAndFieldColumns = ({ moduleInfo, moduleState, columns, dispatch }:
  { moduleInfo: ModuleModal, moduleState: ModuleState, columns: [], dispatch: Dispatch<any> }) => {
  const result = new Array();
  for (var i in columns) {
    const column: any = columns[i];
    if ((column.columns && column.columns.length) || !column.fieldid) { // 没有fieldid就当作合并表头
      if (!column.title) column.title = '';
      let group: any = {
        gridFieldId: column.columnid,
        title: <span dangerouslySetInnerHTML={{ __html: column.title.replace(new RegExp('--', 'gm'), '<br/>') }}></span>,
        hidden: column.hidden,
        menuText: column.title.replace(new RegExp('--', 'gm'), ''),
        children: getGroupAndFieldColumns({ moduleState, moduleInfo, columns: column.columns, dispatch })
      }
      if (column.locked) group.fixed = 'left';
      applyOtherSetting(group, column.othersetting);
      result.push(group);
    } else {
      if (column.fieldahead) { // 附加字段
        if (column.aggregate) {
          let field = addChildAdditionField(column, dispatch);
          if (field) {
            const gc: any = getColumn({ moduleState, gridField: column, fieldDefine: field, moduleInfo, dispatch });
            if (gc) result.push(gc);
          }
        } else {
          // 父模块中的字段
          const field = addParentAdditionField(column);
          if (field) {
            const gc = getColumn({ gridField: column, fieldDefine: field, moduleInfo, moduleState, dispatch });
            if (gc) result.push(gc);
          }
        }
      } else {
        let field = getFieldDefine(column.fieldid, moduleInfo);
        if (!field) {
          console.log(JSON.stringify(column) + '未找到字段的定义，可能是分组下的字段全被删光了');
          continue;
        }
        if (field.ishidden || field.isdisable || field.userdisable) continue; // 隐藏字段和禁用的字段都不放在grid中
        let gc = getColumn({ gridField: column, fieldDefine: field, moduleInfo, moduleState, dispatch });
        if (gc) result.push(gc);
      }
    }
  }
  return result;
}

// additionFieldname:"count.UCity.numbervalue.with.UProvince"
// additionObjectname:"UCity"
// aggregate:"count"
// columnid:"402828e5588237fd01588245f20c0009"
// defaulttitle:"市(省份)--numbervalue--计数"
// fieldahead:"UCity.with.UProvince"
// fieldid:"40288ffd581e94f701581e95091d003c"
// orderno:10
const addChildAdditionField = (columnfield: any, dispatch: Dispatch<any>) => {
  let pmoduleName = columnfield.additionObjectname
  var additionModuleInfo = getModuleInfo(pmoduleName);
  var additionField = getFieldDefine(columnfield.fieldid, additionModuleInfo);
  var field: any = {
    fieldname: columnfield.additionFieldname,
    fieldtitle: columnfield.defaulttitle,
    fieldid: columnfield.fieldid,
    aggregate: columnfield.aggregate
  }
  applyIf(field, additionField);
  if (field.aggregate == 'count') {
    field.fieldtype = 'Integer';
    field.ismonetary = false;
  }
  // if (!me.getFieldDefineWithName(field.fieldname)) {
  //   me.fDataobject.fDataobjectfields.push(field);
  //   var modelFields = app.view.platform.module.model.GridModelFactory.getField(field);
  //   for (var i in modelFields) {
  //     modelFields[i].persist = false;
  //     me.model.addFields([modelFields[i]])
  //   }
  // }
  return field;
}
const addParentAdditionField = (columnfield: any) => {
  const additionModuleInfo = getModuleInfo(columnfield.additionObjectname);
  let additionField = getFieldDefine(columnfield.fieldid, additionModuleInfo);
  if (!additionField)
    return null;
  let field: any = {
    fieldname: columnfield.additionFieldname,
    fieldtitle: columnfield.defaulttitle,
    fieldid: columnfield.fieldid
  };
  if (additionField.isManyToOne) field.manyToOneInfo = {};
  applyIf(field, additionField);
  // 父模块字段都置为不可更改
  field.allownew = false;
  field.allowedit = false;
  if (additionField.isManyToOne) {
    applyIf(field.manyToOneInfo, additionField.manyToOneInfo);
    field.manyToOneInfo.keyField = field.fieldname + '.' + field.manyToOneInfo.keyOrginalField.fieldname;
    field.manyToOneInfo.nameField = field.fieldname + '.' + field.manyToOneInfo.nameOrginalField.fieldname;
  }
  return field;
}



/**
 * 根据groupField,fieldDefine的定义，生成一个column的定义
 */
const getColumn = ({ gridField, fieldDefine, moduleInfo, moduleState, dispatch }:
  {
    gridField: any, fieldDefine: ModuleFieldType, moduleInfo: ModuleModal,
    moduleState: ModuleState, dispatch: Dispatch
  }) => {
  // 要分成三种情况来行成列了。基本字段,manytoone，onetomany字段，
  const field: any = {
    maxWidth: gridField.maxwidth || 600,
    fieldDefine: fieldDefine,
    gridField: gridField,
    gridFieldId: gridField.columnid, // 加上这个属性，用于在列改变了宽度过后，传到后台
    sorter: true,
    menuText: getMenuText(fieldDefine, gridField),
    dataIndex: fieldDefine.fieldname,
    key: fieldDefine.fieldname,
    hidden: gridField.hidden,
    groupable: !!fieldDefine.allowgroup,
    showDetailTip: gridField.showdetailtip,
  }
  if (gridField.locked) field.fixed = 'left';
  let columnFilterInfo: ColumnFilterInfoType = getColumnFilterInfo(moduleInfo.modulename, field.dataIndex);
  apply(columnFilterInfo, { title: field.menuText, type: 'string' });
  setFieldxtype(field, fieldDefine.fieldtype.toLowerCase(), moduleState, columnFilterInfo, dispatch);
  if (fieldDefine.fDictionaryid) {
    field.groupable = true;
    field.render = (value: any, record: object, recno: number) =>
      directionaryFieldRender(value, record, recno, { fieldname: fieldDefine.fieldname });
    field.filters = getDictionaryData(fieldDefine.fDictionaryid);
    field.filteredValue = getColumnFilterValue(moduleState.filters.columnfilter, fieldDefine.fieldname);
    columnFilterInfo.comboValue = field.filters;
    columnFilterInfo.type = 'dictionary';

  }
  if (fieldDefine.tooltiptpl) {
    field.tooltiptpl = fieldDefine.tooltiptpl; // 显示在字段值上的tooltip的tpl值
    //field.tooltipXTemplate = new Ext.XTemplate(fieldDefine.tooltiptpl);
  }
  if (moduleInfo.namefield == fieldDefine.fieldname) {
    field.render = (value: any, record: object, recno: number) =>
      nameFieldRender(value, record, recno, { moduleInfo });
  }
  if (field.dataIndex == 'iconcls') {
    //field.render = Ext.util.Format.iconClsrender;
  }
  // 如果是可以改变显示单位的数值，可以选择万，千，百万，亿
  if (fieldDefine.ismonetary) {
    // if (field.xtype == 'aggregatecolumn') {
    //   field.render = Ext.util.Format.gridMonetaryAggregaterender;
    // } else {
    //   field.render = Ext.util.Format.gridMonetaryrender;
    // }
    // field.monetary = grid.getMonetary();
    // field.monetaryPosition = grid.getMonetaryPosition();
  }
  if (fieldDefine.allowsummary) {
    // field.summaryType = 'sum';
    // field.summaryrender = field.render;
    // // 如果是百分比的求和,并且设置了分子和分母，那么就加入加权平均 2018.07.29
    // if (fieldDefine.divisor && fieldDefine.denominator) {
    //   field.summaryType = function (records, values) {
    //     var divisor = 0,
    //       denominator = 0;
    //     for (var i in records) {
    //       var record = records[i];
    //       divisor += record.get(fieldDefine.divisor);
    //       denominator += record.get(fieldDefine.denominator);
    //     }
    //     if (denominator) return divisor / denominator;
    //     else return 0;
    //   }
    //   field.summaryrender = Ext.util.Format.percentrender;
    // }
    // if (fieldDefine.fieldtype.toLowerCase() == 'percent') {
    //   field.summaryrender = Ext.util.Format.percentrender;
    // }
  }
  // 小数位数
  if (fieldDefine.digitslen) {
    field.decimalPrecision = fieldDefine.digitslen;
    let ds = '';
    for (var i = 0; i < fieldDefine.digitslen; i++)
      ds += '0';
    field.numberFormat = '0,000.' + ds;
  }
  if (gridField.columnwidth > 0) {
    field.width = field.columnwidth = gridField.columnwidth;
  }
  if (gridField.minwidth > 0) {
    field.minWidth = gridField.minwidth;
  }
  if (gridField.flex) {
    field.flex = gridField.flex;
    delete field.maxWidth;
  }
  if (fieldDefine.isManyToOne || fieldDefine.isOneToOne) {
    const fn = fieldDefine.manyToOneInfo.nameField;
    field.dataIndex = fn;
    field.key = fieldDefine.manyToOneInfo.keyField;
    field.manytooneIdName = fieldDefine.manyToOneInfo.keyField,
      field.manytooneNameName = fieldDefine.manyToOneInfo.nameField,
      columnFilterInfo = getColumnFilterInfo(moduleInfo.modulename, field.key);
    apply(columnFilterInfo, {
      title: field.menuText,
      type: 'string'
    });

    field.sorter = true;
    field.sortOrder = getSortOrder(moduleState.sorts, fn);
    const pModuleInfo = getModuleInfo(fieldDefine.fieldtype);
    field.render = (value: any, record: object, recno: number) =>
      manyToOneFieldRender(value, record, recno,
        { moduleInfo: pModuleInfo, keyField: field.key });
    if (pModuleInfo.selectedmode == '10' || pModuleInfo.selectedmode == '95') {
      // // 如果pmodule的被选择方式是只能下拉选择，那么就可以单个选择，否则都是和textfield一样
      field.filters = getModuleComboDataSource(fieldDefine.fieldtype);
      field.filteredValue = getColumnFilterValue(moduleState.filters.columnfilter, field.key);

      columnFilterInfo.type = 'combobox';
      columnFilterInfo.comboValue = field.filters;
    }

  }
  if (fieldDefine.isOneToMany) {
    // field.xtype = 'onetomanycolumn';
    field.isOneToMany = true;
    let ft = fieldDefine.fieldtype;
    ft = ft.substring(ft.indexOf('<') + 1, ft.indexOf('>'));
    field.childModuleName = ft;
    field.fieldahead = fieldDefine.fieldahead;
    field.align = 'right';
    columnFilterInfo.type = 'number';
    field.filteredValue = getNumberColumnFilterValue(moduleState.filters.columnfilter, field.key);
    apply(field, getNumberColumnSearchProps(field.dataIndex, field.fieldDefine, moduleState, dispatch))
    field.render = (value: any, record: Object, recno_: number) =>
      OneToManyFieldRender(value, record, recno_,
        { fieldtitle: field.menuText, childModuleName: field.childModuleName, fieldahead: field.fieldahead, moduleInfo });


  }
  if (fieldDefine.isManyToMany) {
    field.xtype = 'manytomanycolumn';
    field.dataIndex = field.dataIndex + '_detail';
    field.sorter = false;
    delete field.render;
    delete field.filter;
  }
  // if (module.fDataobject.rowediting && fieldDefine.allowedit && module.fDataobject.hasedit
  //   && module.fDataobject.baseFunctions['edit'] && module.fDataobject.primarykey != fieldDefine.fieldname) {
  //   me.getEditor(module, fieldDefine, field);
  // }
  applyOtherSetting(field, fieldDefine.gridcolumnset);
  applyOtherSetting(field, gridField.othersetting);
  buildTextAndUnit(field, moduleState);
  if (field.render === null) delete field.render;
  // 如果在某种 gridType中不显示该列,可以设置成  disableGridType:'onetomanygrid',disableGridType:['a','b']
  if (field.disableGridType) {
    // var gt: any = field.disableGridType;
    // if (typeof gt === 'string' && gt == grid.modulePanel.gridType) {
    //   return null;
    // } else if (Array.isArray(gt)) {
    //   for (var j in gt) {
    //     if (gt[j] == grid.modulePanel.gridType) return null;
    //   }
    // }
  }
  if (field.sorter)
    field.sortOrder = getSortOrder(moduleState.sorts, field.key);

  field.text = field.title;
  field.title = <span dangerouslySetInnerHTML={{ __html: field.title }}></span>;

  if (!field.filters && fieldDefine.fieldtype.toLowerCase() == 'string') {
    apply(field, getStringColumnSearchProps(field.dataIndex, fieldDefine))
    field.filteredValue = getStringColumnFilterValue(moduleState.filters.columnfilter, field.key);
    columnFilterInfo.type = 'string';
  }

  return field;
}

const buildTextAndUnit = (me: any, moduleState: ModuleState) => {
  let
    unittext = me.fieldDefine.unittext,
    result = me.gridField.title || me.fieldDefine.fieldtitle;
  result = result.replace(new RegExp('--', 'gm'), '<br/>');// title中间有--表示换行
  me.originText = result;
  result = result.replace('小计', '<span style="color : green;">小计</span>');
  if (me.fieldDefine.ismonetary && moduleState.monetaryPosition === 'columntitle') {// 可能选择金额单位千,
    // 万,百万, 亿
    const { monetary } = moduleState;
    const monetaryunittext = monetary.unittext === '个' ? '' : monetary.unittext;
    if (unittext || monetaryunittext) result += '<br/><span style="color:green;">(' + monetaryunittext
      + (unittext ? unittext : '') + ')</span>';
  } else {
    if (unittext) result += '<br/><span style="color:green;">(' + unittext + ')</span>';
  }

  me.title = '<div style="text-align:center;">' + result + '</div>';
}


export const getLockedLeftColumns = (moduleInfo: ModuleModal, moduleState: ModuleState, dispatch: Dispatch<any>) => {
  let columns = [];
  if (true) {
    columns.push({
      title: <Tooltip title="记录顺序号"><BarsOutlined /></Tooltip>,
      className: styles.numberalignright,
      dataIndex: '__recno__',
      key: '__recno__',
      width: 60,
      fixed: 'left',
    })
  }
  // 是否有附件，有附件则加入附件按钮
  if (moduleInfo.moduleLimit.hasattachment && moduleInfo.userLimit.attachment?.query)
    columns.push({
      title: <Tooltip title="附件"><PaperClipOutlined /></Tooltip>,
      sorter: true,
      sortOrder: getSortOrder(moduleState.sorts, 'attachmentcount'),
      width: 66,
      dataIndex: 'attachmenttooltip',
      key: 'attachmentcount',
      align: 'center',
      fixed: 'left',
      render: (value: any, record: Object, recno_: number) =>
        attachemntRenderer(value, record, recno_,
          { moduleInfo, dispatch }),
    });
  // 是否模块具有审批功能
  if (moduleInfo.moduleLimit.hasapprove) {
    // 四合一的审核按钮
    columns.push({
      title: <Tooltip title="审批流程"><CarryOutOutlined /></Tooltip>,
      dataIndex: 'approvecolumn',
      width: 50,
      key: 'approvecolumn',
      fixed: 'left',
    });
  }
  return columns;
}

const setFieldxtype = (field: any, fieldtype: string, moduleState: ModuleState,
  columnFilterInfo: ColumnFilterInfoType, dispatch: Dispatch) => {
  if (field.fieldDefine.aggregate) {
    apply(field, {
      render1: OneToManyFieldRender,
      align: 'right'
    })
    //field.xtype = 'aggregatecolumn'
  } else switch (fieldtype) {
    case 'image':
      apply(field, {
        render: imageRender,
        xtype: 'imagecolumn',
        align: 'center',
        width: 100,
        sorter: false
      })
      break;
    case 'date':
      apply(field, {
        xtype: 'datecolumn',
        align: 'center',
        width: 90,
        render: dateRender,
      })
      break;
    case 'datetime':
    case 'timestamp':
      apply(field, {
        xtype: 'datecolumn',
        align: 'center',
        width: 130,
        render: datetimeRender,
      })
      break;
    case 'boolean':
      field.render = booleanRenderer;
      field.filters = getBooleanFilter(field.fieldDefine.isrequired);
      field.filteredValue = getColumnFilterValue(moduleState.filters.columnfilter, field.key);
      columnFilterInfo.type = 'combobox';
      columnFilterInfo.comboValue = field.filters;
      break;
    case 'integer':
      apply(field, {
        align: 'right',
        xtype: 'numbercolumn',
        tdCls: 'intcolor',
        format: '#',
        render: integerRender,
        //filter: 'number'
      })
      columnFilterInfo.type = 'number';
      field.filteredValue = getNumberColumnFilterValue(moduleState.filters.columnfilter, field.key);
      apply(field, getNumberColumnSearchProps(field.dataIndex, field.fieldDefine, moduleState, dispatch))
      break;
    case 'money':
    case 'double':
    case 'float':
      columnFilterInfo.type = 'number';
      field.filteredValue = getNumberColumnFilterValue(moduleState.filters.columnfilter, field.key);
      apply(field, getNumberColumnSearchProps(field.dataIndex, field.fieldDefine, moduleState, dispatch))
      apply(field, {
        align: 'right',
        xtype: 'numbercolumn',
        width: 130,
        render: floatRender,
        filter: 'number'
      })
      if (field.fieldDefine.ismonetary) {
        field.render = (value: number, record: object, _recno: number) =>
          monetaryRender(value, record, _recno, moduleState)
      }
      break;
    case 'percent':
      apply(field, {
        render: percentRender,
        align: 'center',
        xtype: 'widgetcolumn',
        filter: 'number',
        width: 110,
      })
      break;
    case 'blob':
      field.sorter = false;
    case 'string':
      //field.renderer = Ext.util.Format.defaultRenderer
      break;
    default:
    //field.renderer = Ext.util.Format.defaultRenderer
  }
}

const getMenuText = (fieldDefine: any, gridField: any) => {
  let result = gridField.title || fieldDefine.fieldtitle;
  if (fieldDefine.unittext) result += '(' + fieldDefine.unittext + ')';
  return result.replace(new RegExp('--', 'gm'), '');
}

let searchInput: any = null;
const getStringColumnSearchProps = (dataIndex: any, fieldDefine: any) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:
    { setSelectedKeys: any, selectedKeys: any, confirm: any, clearFilters: any }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={`搜索 ${fieldDefine.fieldtitle}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Button disabled={!selectedKeys[0]} type="link" onClick={() => clearFilters()} size="small">
            重置
        </Button>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ marginLeft: 8, }}
          >
            确定
      </Button>
        </div>
      </div>
    ),
  filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  onFilterDropdownVisibleChange: (visible: boolean) => {
    if (visible) {
      setTimeout(() => searchInput.select());
    }
  },
})


const { Option } = Select;

const getNumberColumnSearchProps = (dataIndex: any, fieldDefine: ModuleFieldType,
  moduleState: ModuleState, dispatch: Dispatch) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:
      { setSelectedKeys: any, selectedKeys: any, confirm: any, clearFilters: any }) => (
        <>
          <div style={{ padding: 8 }}>
            <span>
              <Input.Group compact>
                <Select
                  value={selectedKeys[0] ? selectedKeys[0] : '='}
                  onChange={e => setSelectedKeys([e, selectedKeys[1]])}
                  style={{ width: 90 }}>
                  {NumberSelectOption.map((item) => <Option key={item.value} value={item.value}>{item.text}</Option>)}
                </Select>
                <Input
                  ref={node => {
                    searchInput = node;
                  }}
                  placeholder={`搜索 ${fieldDefine.fieldtitle}`}
                  value={selectedKeys[1]}
                  //前面一个是符号，后面一个是值，如果数组只有一个，那么就表示未选择值
                  onChange={e => setSelectedKeys(e.target.value ? [selectedKeys[0], e.target.value] : [selectedKeys[0]])}
                  onPressEnter={() => confirm()}
                  style={{ width: 188, marginBottom: 8, marginRight: 6 }}
                />
                <Popover trigger="click" title="数值字段筛选说明"
                  content={
                    <div><b>列表</b>可以多值，以逗号分隔：<br />例如：100,200,300 表示等于以上三值的数据；
                    <br /><b>列表外</b>可以多值，以逗号分隔：<br />例如：100,200,300 表示不等于以上三值的数据；
                    <br /><b>区间</b>以二个数值用逗号分隔：<br />例如：100,1000 表示 >=100 并且 &lt;=1000；
                    <br /><b>区间外</b>以二个数值用逗号分隔：<br />例如：100,1000 表示>100 或者 &lt;1000；
                </div>
                  }><InfoCircleOutlined style={{ color: 'blue', margin: 8 }} /></Popover>
              </Input.Group>
            </span>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Button disabled={!selectedKeys[1]} type="link" onClick={() => clearFilters()} size="small">
                重置
        </Button>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ marginLeft: 8, }}
              >
                确定
      </Button>
            </div>
          </div>
          {fieldDefine.ismonetary ?
            <span>
              <Divider style={{ margin: '3px 0px' }} />
              <div style={{ padding: '10px' }}>
                数值单位：
            <Radio.Group value={moduleState.monetary.type} onChange={(e: any) => {
                  dispatch({
                    type: 'modules/monetaryChanged',
                    payload: {
                      moduleName: moduleState.moduleName,
                      monetaryType: e.target.value,
                    }
                  })
                }}>
                  {getMonetarysValueText().map((rec: TextValue) =>
                    <Radio.Button value={rec.value}>{rec.text}</Radio.Button>)
                  }
                </Radio.Group></div>
              <div style={{ padding: '10px' }}>
                显示位置：
            <Radio.Group value={moduleState.monetaryPosition} onChange={(e: any) => {
                  dispatch({
                    type: 'modules/monetaryChanged',
                    payload: {
                      moduleName: moduleState.moduleName,
                      position: e.target.value,
                    }
                  })
                }}>
                  <Radio.Button value='behindnumber'>显示在数值后</Radio.Button>
                  <Radio.Button value='columntitle'>显示在列头上</Radio.Button>
                </Radio.Group></div>
            </span> : null
          }
        </>
      ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
  })

/**
 * 用于生成列表最后action列，用来对当前记录进行的操作
 * 已加入的修改、删除
 * @param {模块定义} moduleInfo 
 */
const getActionColumns = ({ moduleInfo, moduleState, dispatch }:
  { moduleInfo: ModuleModal, moduleState: ModuleState, dispatch: any }): any[] => [
    {
      title: '操作',
      align: 'center',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_value: any, record: object, _recno: number) =>
        columnActionRender(_value, record, _recno, { moduleInfo, moduleState, dispatch }),
    },
  ];

/**
 * 根据模块设置来生成放在Grid最后的操作列，修改、删除
 * @param {*} _value 
 * @param {*} record 
 * @param {*} _recno 
 * @param {*} moduleInfo 
 * @param {*} dispatch 
 * @param {*} grid 
 */
export const columnActionRender = (_value: any, record: object, _recno: number,
  { moduleState, moduleInfo, dispatch }:
    { moduleState: ModuleState, moduleInfo: ModuleModal, dispatch: any }) => {
  const { modulename: moduleName } = moduleInfo;
  const recordTitle = <span>{moduleInfo.objectname}『 <b> {record[moduleInfo.namefield]}</b>』</span>;
  const { delete: canDelete, edit: canEdit } = moduleInfo.userLimit;
  return (
    <span>
      {canEdit ? <a href="#"><EditOutlined onClick={() => {
        dispatch({
          type: 'modules/toggleFormVisible',
          payload: {
            moduleName,
            visible: true,
            formType: 'edit',
            currRecord: record,
          }
        })
      }} /></a> : null}
      {canDelete ? <Divider type="vertical" /> : null}
      {canDelete ? getDeleteAction({ recordTitle, moduleState, moduleInfo, dispatch, record }) : null}
    </span>);
};

const getDeleteAction = ({ recordTitle, moduleState, moduleInfo, dispatch, record }:
  { recordTitle: any, moduleInfo: ModuleModal, moduleState: ModuleState, dispatch: any, record: any }) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const icon = < QuestionCircleOutlined style={{ color: 'red' }} />;
  const title =
    <div style={{ margin: 10 }}>{icon}
      <span style={{ paddingBottom: '15px' }} > 确定要删除{recordTitle}吗?</span>
    </div>;
  const handleVisibleChange = (visible: boolean) => setVisible(visible);
  const deleteRecord = () => {
    const { modulename: moduleName, primarykey } = moduleInfo;
    const stateInfo = (state: string) => <span>{recordTitle} {state}</span>;
    setLoading(true);
    deleteModuleRecord({
      moduleName,
      recordId: record[primarykey]
    }).then((result: any) => {
      setLoading(false);
      setVisible(false);
      if (result.resultCode === 0) {
        message.success(stateInfo('已成功删除！'));
        // 如果当前记录已经被选中，那么就取消,因此用下面的dispath取消选中和刷新数据
        const selectedRowKeys = moduleState.selectedRowKeys.filter((key: string) =>
          key != record[primarykey]);
        dispatch({
          type: 'modules/selectedRowKeysChanged',
          payload: {
            moduleName,
            forceUpdate: true,
            selectedRowKeys
          }
        })
        return true;
      }
      Modal.warning({
        okText: '知道了',
        title: stateInfo('删除失败'),
        content: <span dangerouslySetInnerHTML={{ __html: result.message }}></span>,
      });
      return null;
    }).finally(() => {
    }); // 清除正在删除的提示信息
  };
  return (
    <Popover visible={visible} trigger="click" placement="topRight" onVisibleChange={handleVisibleChange}
      content={<>
        {title}
        <div style={{ display: 'flex', margin: 8, marginTop: 20 }}>
          <span style={{ flex: 1 }}></span>
          <Space>
            <Button size="small" onClick={() => setVisible(false)}>取消</Button>
            <Button size="small" type="primary" loading={loading} onClick={() => deleteRecord()}>
              <span><DeleteOutlined /> 删 除</span >
            </Button>
          </Space>
        </div></>}>
      <a><DeleteOutlined /></a>
    </Popover>
  )
}