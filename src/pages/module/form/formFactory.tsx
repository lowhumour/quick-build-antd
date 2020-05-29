import React, { useState } from 'react';
import {
  InputNumber, DatePicker, Popover,
  Input, Form, Checkbox, Select, Radio, Row, Col
} from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { ModuleModal, ModuleFieldType } from '../data';
import { getFieldDefine } from '../grid/fieldsFactory';
import ImageField from '@/widget/form/ImageField';
import { getDictionary } from '../dictionary/dictionarys';
import { TextValue } from '../data';
import { getModuleInfo, getModuleComboDataSource } from '../modules';
import Module from '..';
const FormItem = Form.Item;

/**
 * form 方案1，最简单的方案，单列排中间
 */

const col = {
  md: 12,
  xs: 24,
  sm: 24,
}
const _6_15_Layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};
const _6_18_Layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const _3_21_Layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

export const getOneColForm = ({ scheme, moduleInfo, currRecord, form, fieldsValidate, disabled }:
  { scheme: any, moduleInfo: ModuleModal, currRecord: any, form: any, fieldsValidate: any, disabled: boolean }) => {
  const formField: any[] = [];
  scheme.details.forEach((panel: any) => {
    if (panel.details && panel.details.length)
      panel.details.forEach((item: any) => {
        formField.push(...getFormField(item, moduleInfo, fieldsValidate, form, disabled, {}));
      })
  })
  return <Form {..._6_15_Layout} initialValues={currRecord} form={form} >
    {formField}
  </Form>
}

export const getTwoColForm = ({ scheme, moduleInfo, currRecord, form, fieldsValidate, disabled }:
  { scheme: any, moduleInfo: ModuleModal, currRecord: any, form: any, fieldsValidate: any, disabled: boolean }) => {
  const formField: any[] = [];
  scheme.details.forEach((panel: any) => {
    if (panel.details && panel.details.length)
      panel.details.forEach((item: any) => {
        let { colspan } = item;
        if (!colspan) colspan = 1;
        const f = getFormField(item, moduleInfo, fieldsValidate, form, disabled, (colspan == 2) ? { ..._3_21_Layout } : {});
        formField.push(<Col {...(colspan == 1 ? col : { span: 24 })} >
          {f}
        </Col>);
      })
  })
  return <Form {..._6_18_Layout} initialValues={currRecord} form={form} size='middle' >
    <Row gutter={20}>
      {formField}
    </Row>
  </Form>
}


const { Option } = Select;
const getDictionaryFieldInput = (fieldDefine: ModuleFieldType, { ...params }) => {
  let formField;
  const dictionary = getDictionary(fieldDefine.fDictionaryid || '');
  switch (dictionary.inputmethod) {
    case '10':
      formField = <Select {...params}>
        {dictionary.data.map((record: TextValue) =>
          <Option value={record.value || ''}>{record.text}</Option>
        )}
      </Select>
      break;
    case '20':
    case '30':
      formField = <Select showSearch  {...params}
        filterOption={(input, option: any) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        }
      >
        {dictionary.data.map((record: TextValue) =>
          <Option value={record.value || ''}>{record.text}</Option>
        )}
      </Select>
      break;

    case '40':
      formField = <Radio.Group {...params}>
        {dictionary.data.map((record: TextValue) =>
          <Radio value={record.value || ''}>{record.text}</Radio>
        )}
      </Radio.Group>
      break;
    default:
      break;
  }
  return formField;

}
// 10	只能下拉选择(local)
// 20	可录入关键字选择(local)
// 30	可录入编码和关键字选择(local)
// 40	可录入关键字选择(remote)
// 50	可录入编码和关键字选择(remote)
// 60	在树形结构中选择
// 70	根据选择路径在树结构中选择
// 90	在Grid列表中进行选择
// 95	在RadioGroup中进行选择

const ManyToOneSelectPopover = ({ fieldDefine, form }:
  { fieldDefine: ModuleFieldType, form: any }) => {
  const [visible, setVisible] = useState(false);
  return <Popover trigger="click" visible={visible}
    onVisibleChange={(visible) => setVisible(visible)}
    overlayStyle={{
      width: '90%',
      height: (document.body.clientHeight - 100) + 'px',
      overflow: 'scroll',
      border: '1px solid gray',
      backgroundColor: 'aliceblue'
    }}
    content={<Module manyToOneInfo={{
      form: form,
      setTextValue: (value: TextValue) => {
        form.setFieldsValue({
          [getFieldName(fieldDefine)]: value.value,
          [getFieldName(fieldDefine, true)]: value.text,
        });
        setVisible(false);
      }
    }} route='' gridType="selectfield"

      pModuleName={fieldDefine.fieldtype}></Module>}>
    <CommentOutlined></CommentOutlined>
  </Popover>
}



const getManyToOneFieldInput = (fieldDefine: ModuleFieldType, mode: string, form: any, { ...params }) => {
  let formField: any;
  const manytooneData = getModuleComboDataSource(fieldDefine.fieldtype).map((record: TextValue) =>
    <Option value={record.value || ''}>{record.text}</Option>
  )
  switch (mode) {
    case '10':
      formField = <Select {...params}>
        {manytooneData}
      </Select>
      break;
    case '20':
    case '30':
      formField = <Select showSearch {...params}
        filterOption={(input, option: any) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }} >
        {manytooneData}
      </Select>
      break;
    case '90':
      formField =
        <Input readOnly {...params} addonAfter={
          <ManyToOneSelectPopover fieldDefine={fieldDefine} form={form} />
        } >
          {/* {manytooneData} */}
        </Input>
    default:
      break;
  }


  return formField;

}



const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = "YYYY-MM-DD HH:mm:ss"
const getFieldInput = (fieldDefine: ModuleFieldType, form: any, { ...params }) => {


  if (fieldDefine.fDictionaryid) {
    return getDictionaryFieldInput(fieldDefine, { ...params })
  }
  if (fieldDefine.fieldrelation) {
    if (fieldDefine.isManyToMany) {

    } else if (fieldDefine.isOneToMany) {

    } else {
      // manytoone or onetoone
      const cobject = getModuleInfo(fieldDefine.fieldtype);
      var mode = cobject.selectedmode;
      //if (mode != '90') {
      return getManyToOneFieldInput(fieldDefine, mode, form, { ...params })
      // Ext.apply(field, {
      //   xtype: objectfield.manyToOneInfo.parentKey || objectfield.manyToOneInfo.codeLevel ? 'manytoonetreepicker' : 'manytoonecombobox',
      //   name: objectfield.manyToOneInfo.keyField,
      //   fieldDefine: objectfield,
      //   fieldtype: objectfield.fieldtype,
      //   displayparentbutton: form.getViewModel().get('form.displayParentButton') == 'on'
      //  })
      if (mode == '95') {
        // field.xtype = 'manytooneradiogroup';
        // field.columns = 2;
        // }
        //} else {
        // 有很多，必须筛选选择
      }
    }
  }

  const { fieldtype } = fieldDefine;
  let formField;
  switch (fieldtype.toLowerCase()) {
    case 'integer':
      formField = <InputNumber style={{ width: '150px' }} {...params} />
      break;
    case 'double':
      formField = (
        <InputNumber
          precision={2}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '150px' }}
          {...params}
        />)
      break;
    case 'float':
      formField = <InputNumber style={{ width: '150px' }} {...params} />
      break;
    case 'percent':
      formField = (
        <InputNumber
          precision={2}
          step={0.01}
          formatter={value => value ? `${value}%` : ''}
          parser={value => value ? value.replace('%', '') : ''}
          style={{ width: '150px' }}
          {...params}
        />)
      break;
    case 'date':
      formField = <DatePicker format={dateFormat} {...params} />
      break;
    case 'datetime':
    case 'timestamp':
      formField = <DatePicker showTime format={dateTimeFormat} {...params} />
      break;
    case 'boolean':
      formField = <Checkbox {...params} ></Checkbox>
      break;
    case 'image':
      formField = <ImageField {...params} />
      break;
    case 'string':
      if (fieldDefine.fieldlen > 0 && fieldDefine.fieldlen <= 100)
        formField = <Input maxLength={fieldDefine.fieldlen} {...params}
          style={{ maxWidth: (fieldDefine.fieldlen * 16 + 24) + 'px' }} />
      else if (fieldDefine.fieldlen == 0)
        formField = <Input.TextArea autoSize {...params} />
      else
        formField = <Input.TextArea maxLength={fieldDefine.fieldlen}
          autoSize={{ maxRows: 10 }} {...params} />
      break;
    default:
      formField = <Input {...params} style={{ maxWidth: '300px' }} autoFocus />
  }
  return formField
}

const getFieldName = (field: ModuleFieldType, isNameField: boolean | undefined = undefined) => {
  if (field.isManyToOne)
    return isNameField ? field.manyToOneInfo.nameField : field.manyToOneInfo.keyField;
  else
    return field.fieldname;
}

const getFormField = (formFieldDefine: ModuleFieldType, moduleInfo: ModuleModal, fieldsValidate: any,
  form: any, disabled: boolean, params: object): any => {
 // console.log(formFieldDefine);
  const fieldDefine: ModuleFieldType = getFieldDefine(formFieldDefine.fieldid, moduleInfo);
  if (fieldDefine == null) {
    return <div>{JSON.stringify(formFieldDefine)}</div>
  }
  const { fieldtitle, fieldname } = fieldDefine;
  const inputAttr = {
    placeholder: "请输入",
    addonAfter: fieldDefine.unittext,
  }
  const formItemProp: any = {};
  let { fieldtype } = fieldDefine;
  fieldtype = fieldtype.toLowerCase();
  if (fieldtype == 'boolean')
    formItemProp.valuePropName = 'checked';

  const getValidateStatus = () => {
    if (fieldsValidate[fieldDefine.fieldname])
      return "error";
    else
      return undefined;
  }
  const getValidateHelp = () => {
    if (fieldsValidate[fieldDefine.fieldname])
      return fieldsValidate[fieldDefine.fieldname];
    else
      return undefined;
  }
  // if (fieldDefine.isManyToOne) {
  //   return <span style={{ whiteSpace: 'nowrap', display: 'flex' }} >
  //     <FormItem label={fieldtitle} style={{ flex: 1, marginRight: '0px' }} {...params}
  //       name={getFieldName(fieldDefine)}
  //       validateStatus={getValidateStatus()}
  //       help={getValidateHelp()}
  //       {...formItemProp}
  //       rules={[{ required: fieldDefine.isrequired, message: '请输入' + fieldDefine.fieldtitle }]}
  //     >
  //       {getFieldInput(fieldDefine, { inputAttr, disabled })}
  //     </FormItem>
  //     <Popover trigger="click"
  //       overlayStyle={{
  //         width: '900px', height: '600px', overflow: 'scroll',
  //         border: '1px solid gray', backgroundColor: 'aliceblue'
  //       }}
  //       content={<Module route='' gridType="selectfield" pModuleName={fieldDefine.fieldtype}></Module>}>

  //       <Button style={{ paddingLeft: '8px', paddingRight: '8px', marginLeft: '0px' }}>
  //         <CommentOutlined></CommentOutlined>
  //       </Button>
  //     </Popover>
  //   </span>
  // }
  if (fieldDefine.isManyToOne) {
    const cobject = getModuleInfo(fieldDefine.fieldtype);
    var mode = cobject.selectedmode;
    if (mode == '90')
      return [<FormItem noStyle name={getFieldName(fieldDefine)}><Input type='hidden' /></FormItem>,
      <FormItem label={fieldtitle} {...params}
        name={getFieldName(fieldDefine, true)}
        validateStatus={getValidateStatus()}
        help={getValidateHelp()}
        {...formItemProp}
        rules={[{ required: fieldDefine.isrequired, message: '请输入' + fieldDefine.fieldtitle }]}
      >
        {getFieldInput(fieldDefine, form, { inputAttr, disabled })}
      </FormItem>]
  }

  if (fieldDefine.unittext)
    return [<FormItem label={fieldtitle}     >
      <FormItem noStyle {...params}
        name={getFieldName(fieldDefine)}
        validateStatus={getValidateStatus()}
        help={getValidateHelp()}
        {...formItemProp}
        rules={[{ required: fieldDefine.isrequired, message: '请输入' + fieldDefine.fieldtitle }]}
      >
        {getFieldInput(fieldDefine, form, { inputAttr, disabled })}
      </FormItem><span style={{ paddingLeft: '5px' }}>{fieldDefine.unittext}</span>
    </FormItem>]
  else
    return [<FormItem label={fieldtitle} {...params}
      name={getFieldName(fieldDefine)}
      validateStatus={getValidateStatus()}
      help={getValidateHelp()}
      {...formItemProp}
      rules={[{ required: fieldDefine.isrequired, message: '请输入' + fieldDefine.fieldtitle }]}
    >
      {getFieldInput(fieldDefine, form, { inputAttr, disabled })}
    </FormItem>]

}

