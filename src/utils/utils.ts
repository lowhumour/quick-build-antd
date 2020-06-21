import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({ routes, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};



/**
* 简单的加密函数
*/
export const encryptString = (str: string): string => {
  if (!str) return '';
  let c = String.fromCharCode(str.charCodeAt(0) + str.length);
  for (let i = 1; i < str.length; i++) {
    c += String.fromCharCode(str.charCodeAt(i) + str.charCodeAt(i - 1));
  }
  return encodeURIComponent(c);
}

/**
* 简单的解密函数
*/
export const decryptString = (str: string): string => {
  if (!str) return '';
  str = decodeURIComponent(str);
  let c: string = String.fromCharCode(str.charCodeAt(0) - str.length);
  for (let i = 1; i < str.length; i++) {
    c += String.fromCharCode(str.charCodeAt(i) - c.charCodeAt(i - 1));
  }
  return c;
}


/**
 * 通过form post 下载文件
 */
export const download = (url: string, params: Object) => {//导出表格
  var form = document.createElement('form')
  document.body.appendChild(form)
  for (var obj in params) {
    if (params.hasOwnProperty(obj)) {
      var input = document.createElement('input')
      input.type = 'hidden'
      input.name = obj;
      input.value = params[obj]
      form.appendChild(input)
    }
  }
  form.method = "POST" //请求方式
  form.action = url;
  form.submit()
  document.body.removeChild(form)
}

export const apply = (dest: object, updated: object) => {
  for (var i in updated) {
    dest[i] = updated[i];
  }
}

export const applyIf = (dest: object, updated: object) => {
  for (var i in updated) {
    if (typeof dest[i] === 'undefined')
      dest[i] = updated[i];
  }
}

export const getFileExt = (filename: string): string => {
  if (!filename)
    return '';
  else {
    const temp = filename.split('').reverse().join('');
    return temp.substring(0, temp.search(/\./)).split('').reverse().join('').toLowerCase();
  }
}


export const applyAllOtherSetting = (object: any) => {
    if (Array.isArray(object)) {
      object.forEach((o: any) => applyAllOtherSetting(o));
    } else if (Object.prototype.toString.call(object) === '[object Object]') {
      for (var i in object) {
        if (i === 'othersetting') {
          applyOtherSetting(object, object[i]);
          //delete object[i];
          //console.log(object)
        } else {
          applyAllOtherSetting(object[i]);
        }
      }
    }
}


export const applyOtherSetting = (object: object, othersetting: string) => {
  if (othersetting) {
    //console.log('11111111111111111111111111111111----------');
    //console.log(object,othersetting);
    let ostr = {},
      s = '{' + othersetting + '}';
    try {
      ostr = eval("(" + s + ')');
    } catch (e) {
      alert("JSON解析错误：" + s);
    }
    if (ostr) {
      for (var i in ostr) {
        object[i] = ostr[i];
      }
    }
  }
}