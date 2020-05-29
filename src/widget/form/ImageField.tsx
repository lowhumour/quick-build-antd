import React from 'react';
import { notification, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './ImageField.less';


interface ImageFieldProps {
    value?: string;                         //图片的BASE64编码值
    onChange?: (value: string) => void;     //选择新的图片后的回调函数
    label?: string;                         //字段label
    disabled?: boolean;                     //只读
}

/**
 * 图像字段，可以和form中其他字段一样进行显示和提交的控件
 * @param param0 
 * value 值已经是受控的了，在onChange中改变后，会自动更新到image中
 */

const ImageField: React.FC<ImageFieldProps> = ({ value, onChange = (value: string) => { }, label, disabled }) => {
    const myRef: any = React.createRef();
    const fileChange = () => {
        if (window.FileReader) {
            var file = myRef.current.files[0];
            if (typeof file == 'object') {
                var filename = file.name;
                let allImgExt = ".jpg .jpeg .gif .bmp .png ";
                let fileExt = filename.substr(filename.lastIndexOf(".")).toLowerCase();
                if (allImgExt.indexOf(fileExt + " ") == -1) {
                    notification.error({
                        message: '选择图像文件',
                        description: `请选择后缀名为 ${allImgExt} 的图像文件！`,
                    });
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (event: any) {
                    onChange(window.btoa(event.target.result));
                }
                reader.readAsBinaryString(file);
            } else
                ;// 取消了选择的文件
        } else
            notification.warn({
                message: '选择图像文件',
                description: `当前浏览器不支持选择图像文件，请更换为chrome,firefox浏览器！`,
            });
    }

    return (
        <div className={styles.avatar}>
            {label ? <div>{label}</div> : null}
            <img width={128} height={128}
                src={value ? "data:image/jpeg;base64," + value :
                    "/api/resources/images/system/noimage.png"} alt="图像" />
            {!disabled &&
                <div><Button onClick={() => { myRef.current.click() }}><UploadOutlined />更换图像</Button></div>}
            <input ref={myRef} type="file"
                style={{ visibility: 'hidden', width: 0, height: 0 }}
                onChange={fileChange} />
        </div>
    );
};

export default ImageField;