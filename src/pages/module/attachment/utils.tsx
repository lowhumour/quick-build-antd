import React, { useState } from 'react';

import { AttachmentModal, ModuleModal } from "../data";
import { getFileExt, apply } from "@/utils/utils";
import {
    FileAddOutlined, UploadOutlined, CloudDownloadOutlined, OrderedListOutlined,
    DatabaseOutlined, TableOutlined, PaperClipOutlined, FileImageOutlined, FilePdfOutlined,
    SelectOutlined
} from '@ant-design/icons';
import { Button, message, Popover, Card, Space, Tooltip, Upload, Drawer } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Zmage, { IStaticSetParams } from 'react-zmage';
import { UploadListType } from 'antd/lib/upload/interface';
import { deleteModuleRecord } from '../service';
import { Dispatch } from 'redux';

const ImageMime = {
    'bmp': 'image/bmp',
    'gif': 'image/gif',
    'jpe': 'image/jpeg',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'jif': 'image/pipeg',
    'jfif': 'image/pipeg',
}
const getImageType = (fileext: string): string => {
    return ImageMime[fileext] ? ImageMime[fileext] : 'image/png';
}

/**
 * 有四种附件
 * 1.图片附件：          thumbnail.do，显示缩略图
 *                      preview.do,  预览原图
 * 2.可用PDF预览的文件。  不可预览缩略图
 *                      preview.do   预览PDF图
 *                      download.do  下载原文件
 * 3.可以在浏览器中打开的  不可预览缩略图   
 *                      preview.do   预览原文件
 *                      download.do  下载原文件
 * 4.不可预览的文件       download.do  下载原文件
 * 
 * @param value 
 * @param record 
 * @param _recno 
 * @param param3 
 * @param isLink       是否要 <a> 标签
 */

const url_ = '/api/platform/attachment';
let openInNewWindowGlobal = false;              // 打开PDF或者可直接预览的文件时是否在新的标签页中


export const AttachemntRenderer = ({ value = [], record, _recno,
    moduleInfo, dispatch, isLink = true }: {
        moduleInfo: ModuleModal, dispatch: Dispatch<any>, value: any, record: any, _recno: any, isLink: boolean
    }) => {

    console.log('attachment renderer......', value?.length, record)
    if (!record) return null;
    let holding = false;                // 是否正在预览图片或在当前页显示pdf了，如果是则不关闭Popover
    const count = value.length;
    const { primarykey, namefield, modulename: moduleName } = moduleInfo;
    const { attachment = {} } = moduleInfo.userLimit;
    const [attachmentChanged, setAttachmentChanged] = useState(false);
    const [openInNewWindow, setOpenInNewWindow] = useState(openInNewWindowGlobal);
    const [listType, setListType] = useState(count <= 5 ? 'picture' : 'text');
    const [visible, setVisible] = useState(false);
    const [showpdf, setShowpdf] = useState(false);
    const [pdfurl, setPdfurl] = useState('');
    const [pdftitle, setPdfTitle] = useState('');
    let currFileList: any[] = [];       // 记录下实时的Attachment中的文件，用于图片预览时可以显示所有的图片
    let text: any = null;               // 如果没有附件,则在column中不显示
    if (count)                          // 如果有值的话，就显示附件个数
        text = (count >= 10 ? '' : '0') + `${count}`;
    else if (attachment.add)            // 如果有附件的上传权限，那么就显示一个可以上传的标记
        text = <Tooltip title="点击上传附件"><FileAddOutlined /></Tooltip>;
    const getFile = (item: AttachmentModal) => ({
        uid: item.id,
        status: 'done',
        name: `${item.title}　`,
        filename: item.filename,
        fileext: item.fileext ? item.fileext : '',
        type: item.thumbnail ? getImageType(item.filename) : 'notimagefile',
        pdfpreview: item.pdfpreview,
        previewmode: item.previewmode,
        // 只有图片是直接的url,其他类型的在点击后才生成url
        url: item.thumbnail ? url_ + `/thumbnail.do?attachmentid=${item.id}` :
            (item.previewmode == 'direct' ||
                item.fileext?.toLowerCase() == 'pdf' || item.pdfpreview ? `${item.id}` : null),
    })
    // 所有的文件按类型+文件名排序
    const defaultFileList = value.map(getFile).
        sort((f1: any, f2: any) => f1['fileext'] > f2['fileext'] ? 1 : (f1['fileext'] == f2['fileext'] ?
            (f1.filename > f2.filename ? 1 : -1) : -1));
    currFileList = defaultFileList;
    // 如果有上传权限，生成上传按钮
    const uploadButton = attachment.add ? <Button size="small"><UploadOutlined />上传附件</Button> : null;
    const uploadProps: any = {
        defaultFileList,
        withCredentials: true,
        // 上传附件的地址
        action: url_ + `/upload.do?objectid=${moduleName}&idvalue=${record[primarykey]}&atype=99&ftype=99`,
        multiple: true,
        listType: listType,                      // 'text', 'picture','picture-card',
        onRemove: (file: any) => {
            // 如果文件是刚上传的并且上传失败，那么删除的时候不用确认
            if (file.response && !file.response.success)
                return true;
            const filetext = `附件『${file.name.trim()}』`;
            const msg = `确定要删除${filetext}吗？`;
            if (confirm(msg) === true) {
                return deleteModuleRecord({
                    moduleName: 'FDataobjectattachment',
                    recordId: file.uid,
                }).then((result: any) => {
                    if (result.resultCode === 0) {
                        setAttachmentChanged(true);
                        message.success(`${record[namefield]}的${filetext}已成功删除！`);
                        return true;
                    }
                    message.error(
                        <span dangerouslySetInnerHTML={{
                            __html: `${record[namefield]}的${filetext}删除失败！<br /><br />${result.message}`
                        }}></span>
                    );
                    return false;
                });
            }
            return false;
        },
        onChange: (param: any) => {
            console.log(param)
            const { file, file: { status, response } } = param;
            const errorMsg = response ? <span>附件文件上传失败：{response.msg}</span> : '';
            currFileList = param.fileList;
            if (status === 'error') {
                message.error(errorMsg);
                file.error.statusText = response.msg;
            } else if (status === 'done') {
                // 文件上传成功，判断后台的success是否成功了。
                if (!response.success) {
                    message.error(errorMsg);
                    file.error.statusText = response.msg;
                } else {
                    // 更新当前记录的 附件 信息
                    setAttachmentChanged(true);
                    const uid = file.uid;
                    param.fileList.forEach((f: any) => {
                        if (f.uid === uid) {
                            response.msg.fileext = getFileExt(response.msg.filename);
                            apply(f, getFile(response.msg));
                        }
                    })
                    console.log(currFileList);
                }
            } else if (status === 'removed') {
                ;
            }
        },
        showUploadList: {
            showRemoveIcon: !!attachment.delete,
            showDownloadIcon: true,
            showPreviewIcon: true,
        }
    }
    const onDownload = (file: UploadFile<any>) => {
        window.location.href = url_ + `/download.do?attachmentid=${file.uid}`
    }
    const onDownloadAll = () => {
        window.location.href = url_ + `/downloadall.do?moduleName=${moduleName}&idkey=${record[primarykey]}`
    }
    const onPreview = (file: UploadFile<any>) => {
        if (file['previewmode'] == 'image') {
            // 所有的图片
            // console.log('on Preview image');
            // console.log(currFileList);
            const images: IStaticSetParams[] =
                currFileList.filter((file: any) => file.previewmode == 'image').
                    map((file: any): IStaticSetParams => {
                        return {
                            src: url_ + `/preview.do?attachmentid=${file.uid}`, alt: file.filename
                        }
                    })
            let defaultPage = currFileList.filter((file: any) => file.previewmode == 'image').
                findIndex(afile => afile.uid == file.uid);
            if (defaultPage == -1) { // 最近上传的一个没有加入到currFileList中
                images.push({ src: url_ + `/preview.do?attachmentid=${file.uid}`, alt: file['filename'] });
                defaultPage = images.length;
            }
            Zmage.browsing({
                //src: url_ + `/preview.do?attachmentid=${file.uid}`,
                set: images,
                defaultPage,
                zIndex: 19260817,
                hideOnScroll: false,
                onBrowsing: (browsing: boolean) => holding = browsing,
                controller: {
                    close: true,// 关闭按钮
                    zoom: true,// 缩放按钮
                    download: false,// 下载按钮
                    rotate: true,// 旋转按钮
                    flip: true, // 翻页按钮
                    pagination: true, // 多页指示
                }, animate: { flip: 'swipe', }
            })
        } else if (file['previewmode'] == 'direct' ||
            file['fileext'].toLowerCase() == 'pdf' || file['pdfpreview']) {
            const title = `${record[namefield]}的附件『${file.name.trim()}』`;
            if (openInNewWindow) {
                onOpenInNewWindow(url_ + `/preview.do?attachmentid=${file.uid}`,
                    title, file['previewmode']);
            } else {
                setPdfTitle(title);
                setPdfurl(url_ + `/preview.do?attachmentid=${file.uid}`);
                setShowpdf(true);
            }
        } else
            message.warn('此附件文件不能在浏览器中预览，你可下载后再进行操作！')
    }

    const iconRender = (file: UploadFile, listType?: UploadListType) => {
        const n = file['fileext'];
        if (listType === 'text') return file['previewmode'] == 'image' ? <FileImageOutlined /> :
            n == 'pdf' ? <FilePdfOutlined /> : <PaperClipOutlined />
        if (n == 'doc' || n == 'docx' || n == 'html' || n == 'mov' || n == 'mp3' || n == 'mp4'
            || n == 'pdf' || n == 'ppt' || n == 'pptx'
            || n == 'psd' || n == 'rar' || n == 'wav' || n == 'xls' || n == 'xlsx' || n == 'zip')
            return <img src={`/attachment/${n}.png`} />
        else
            return <Tooltip title={file.name}><><img src={`/attachment/otherfile.png`} /> </></Tooltip>
    }

    const getListTypeStyle = (t: string) => {
        return listType === t ? {
            backgroundColor: "#ccc", padding: 3
        } : {}
    }
    const getOpenInNewWindowStyle = () => openInNewWindow ?
        { backgroundColor: "#ccc", padding: 3 } : { padding: 3 }

    if (value.length == 0 && !attachment.add) return null;
    return (<>
        <Popover placement="rightTop" trigger="click" visible={visible}
            onVisibleChange={(visible: boolean) => {
                // 如果附件有过变动了，在退出的时候刷新
                setVisible(holding || visible);    // 如果在图片或pdf预览，则不关闭
                //console.log('visible changed', visible, attachmentChanged)
                //!(holding || visible) &&  // 如果要在退出时才刷新记录，则加上此句，在预览时刷新，就不用加
                if (attachmentChanged) {
                    setAttachmentChanged(false);
                    dispatch({
                        type: 'modules/refreshRecord',
                        payload: {
                            moduleName,
                            recordId: record[primarykey],
                        },
                    })
                }
            }}
            content={
                <Card size="small" title={record[namefield] + '的附件'}
                    extra={<Space>
                        <span></span>
                        <Tooltip title="将所有附件文件压缩成.zip文件后下载">
                            <CloudDownloadOutlined onClick={onDownloadAll} />
                        </Tooltip>
                        <span />
                        <OrderedListOutlined style={getListTypeStyle('text')}
                            onClick={() => setListType('text')} />
                        <DatabaseOutlined style={getListTypeStyle('picture')}
                            onClick={() => setListType('picture')} />
                        <TableOutlined style={getListTypeStyle('picture-card')}
                            onClick={() => setListType('picture-card')} />
                        <span></span>
                        <Tooltip title={(openInNewWindow ? '在新标签页' : '在当前页') + '中预览PDF类文件'}>
                            <SelectOutlined rotate={90} style={getOpenInNewWindowStyle()}
                                onClick={() => {
                                    openInNewWindowGlobal = !openInNewWindowGlobal;
                                    setOpenInNewWindow(openInNewWindowGlobal);
                                }} />
                        </Tooltip>
                    </Space>} >
                    <Upload {...uploadProps} onPreview={onPreview} onDownload={onDownload} iconRender={iconRender}>
                        {uploadButton}
                    </Upload>
                </Card>
            }
        >
            {isLink ? <a>{value.length == 0 ? '' : <PaperClipOutlined />}{text}</a> :
               <span style={{cursor:'pointer'}}> { value.length == 0 ? '' : <PaperClipOutlined /> }{text}</span>
            }

        </Popover>
        <Drawer
            title={<span style={{ display: 'flex' }}>
                <span style={{ flex: 1 }}>{pdftitle}</span>
                <span style={{ marginRight: '32px' }} className="ant-drawer-close">
                    <Tooltip title="在新标签页中打开PDF文件">
                        <SelectOutlined rotate={90} onClick={() => {
                            onOpenInNewWindow(pdfurl, pdftitle, 'pdf');
                            setShowpdf(false);
                        }} />
                    </Tooltip>
                </span>
            </span>}
            placement="right"
            closable={true}
            visible={showpdf}
            width="100%"
            bodyStyle={{ padding: 0, margin: 0 }}
            style={{ zIndex: 1000000 }}
            onClose={() => setShowpdf(false)}
            afterVisibleChange={(visible: boolean) => holding = visible}
        >
            <iframe style={isSafari ? { height: (document.body.clientHeight - 32 - 22) + 'px' } : {}}
                src={pdfurl} width="100%" height="100%" marginWidth={0} />
        </Drawer>
    </>
    );
}
export const attachemntRenderer = (value: AttachmentModal[] = [], record: object, _recno: number,
    { moduleInfo, dispatch }: {
        moduleInfo: ModuleModal, dispatch: Dispatch<any>
    }) => {
    return <AttachemntRenderer value={value} record={record} _recno={_recno}
        moduleInfo={moduleInfo} dispatch={dispatch} isLink={true}/>
};

const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

export const getAttachmentData = (str: string): AttachmentModal[] => {
    const attachment: AttachmentModal[] = [];
    str.split('|||').forEach((r: string) => {
        const part = r.split('|');
        attachment.push({
            id: part[0],
            title: part[1],
            filename: part[2],
            fileext: getFileExt(part[2]),
            thumbnail: part[3] === '1',
            pdfpreview: part[4] === '1',
            previewmode: part[5],
        })
    });
    return attachment;
}

export const onOpenInNewWindow = (url: string, title: string, previewmode: string) => {
    var basePath = window.location.origin;
    const url_ = basePath + url;
    var htmlMarkup = ['<!DOCTYPE html>', '<html>', '<head>',
        '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />', '<title>' + title + '</title>',
        '<style type="text/css">html,body{height:100%;margin:0;text-align:center;}',
        'iframe{display: block;background: #fff;border:none;width:100%;height:100%;}',
        'img {width:auto;height:auto;max-width:100%;max-height:100%;}', '</style>', '</head>', '<body>',
        previewmode == 'image' ? '<img src="' + url_ + '"/>' : '<iframe src="' + url_ + '" ></iframe>',
        '</body>', '</html>'];
    var html = htmlMarkup.join(' ');
    var win: any = window.open('');
    win.document.open();
    win.document.write(html);
    win.document.close();

}