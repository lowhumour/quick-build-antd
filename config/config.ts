// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {
    //dark: true, // 开启暗色主题
    //compact: true, // 开启紧凑主题
  },
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/welcome',
            },
            {
              path: '/welcome',
              name: 'welcome',
              icon: 'smile',
              component: './Welcome',
            },
            {
              path: '/admin',
              name: 'admin',
              icon: 'crown',
              component: './Admin',
              authority: ['admin'],
              routes: [
                {
                  path: '/admin/sub-page',
                  name: 'sub-page',
                  icon: 'smile',
                  component: './Welcome',
                  authority: ['admin'],
                },
              ],
            },
            {
              name: 'list.table-list',
              icon: 'table',
              path: '/list',
              component: './ListTableList',
            },
            {
              name: 'business',
              icon: 'read',
              path: '/business',
              routes: [{
                name: 'JfokMaster',
                path: '/business/JfokMaster',
                component: './module', 

              },]
            },
            {
              name: '系统设置',
              icon: 'setting',
              path: '/systemsetting',
              routes: [{
                name: '公司企业',
                path: '/systemsetting/fcompany',
                component: './systemsetting/FCompany'
              }, {
                name: '组织机构',
                path: '/systemsetting/forganization',
                component: './systemsetting/FOrganization'
              }]
            },
            {
              name: 'account',
              icon: 'user',
              path: '/account',
              routes: [
                {
                  name: 'center',
                  path: '/account/center',
                  component: './account/center',
                },
                {
                  name: 'settings',
                  path: '/account/settings',
                  component: './account/settings',
                },
              ],
            },

            {
              name: 'dictionary',
              icon: 'read',
              path: '/module',
              routes: [{
                name: 'FDictionarygroup',
                path: '/module/FDictionarygroup',
                component: './module', 

              },
              {
                name: 'FDictionary',
                path: '/module/FDictionary',
                component: './module', 
              }, {
                name: 'FDictionarydetail',
                path: '/module/FDictionarydetail',
                component: './module'
              }, {
                name: 'FDataobject',
                path: '/module/FDataobject',
                component: './module'
              }, {
                name: 'FDataobjectfield',
                path: '/module/FDataobjectfield',
                component: './module'
              }, {
                name: 'FCompany',
                path: '/module/FCompany',
                component: './module'
              }, {
                name: 'FSysteminfo',
                path: '/module/FSysteminfo',
                component: './module'
              },]
            },


            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
