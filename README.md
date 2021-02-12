# 知乎自动发文章工具
### v1.0 介绍
- 感谢@Marvin Zhang的开源贡献
- 本项目源于运营同学的需求，减少重复编辑文章、发知乎文章
- 爬取文章，自动发布到知乎（爬虫程序暂未开源，数据需要自己采集，别担心，提供了测试数据）
- 定时发布文章，把重复劳动交给代码
- 适应多种爬虫（Scrapy...and so on），只需要保证保存的文章数据格式正确即可。
- 基于PCR，相关的api请参考https://www.npmjs.com/package/puppeteer-chromium-resolver

### v2.0 迭代将支持的功能：
-[x] 多知乎账号支持
-[ ] 多平台发布（多账号）
-[ ] 定时任务配置
-[x] 使用代理池发布（多账号同一个ip大量发文可能会被和谐）

## CONFIG SETUP
```js
// 1、edit [/config.js] file 
module.exports = {
  HOST: '0.0.0.0', // Your mongodb address
  PORT: 3000, // Your FONTENT PANEL port
  MONGO_HOST: 'localhost', // HOST
  MONGO_PORT: '27017', // MONGOD PORT
  MONGO_DB: 'zhihuDb', // MONGODB NAME
  MONGO_USERNAME: '', // USERNAME
  MONGO_PASSWORD: '', // PWD
  MONGO_AUTH_DB: 'admin', // AUTH
}
```
```shell
# 2、Run your spider, start crawling the data and save to mongodb
# collection 
title # article title
content # article content(pure content)
contentHtml # article content for richText and Markdown
# 如果你没有写好爬虫，别担心，我为大家准备了两条示例数据
# 在跑起项目后会自动生成2条示例文章，数据在根目录：data.js
```

## Mongodb Collections 概览
- 运行项目后, 会自动部署配置带”*“号的表

|Auto Deploy| Collections      |    Remarks |
|:------| :-------- | --------: |
|<font color="red">*</font>| articles  | 文章表，保存爬虫爬取的文章内容，支持插入图片 |
|<font color="red">*</font>| platforms  | 平台类型，预留字段 |
|<font color="red">*</font>| environments  | 基本的环境变量配置，例如：是否打开chromium的无头模式等 |
|--| cookies  | 保存当前登录的知乎账号cookie，目前只支持单个知乎账户保存， 2.0版本会重构表，同时对多账号登录状态保存，并支持切换账号发布内容 |
|--| tasks  | 执行的任务记录，每执行一次发布任务前，会从文章表中取出文章，加入到任务表 |

## 文章表
- 只需要保证爬虫清洗数据后的结果如下格式保存到mongodb即可
```js
    {
      title: '这是测试文章标题11111',
      "content": '这是测试纯文本内容、你需要自己运行自己的爬虫，然后把所的文章保存在mongodb的articles collections 中，定时任务会根据设置的时间执行发布任务...',
      "contentHtml": '<span>支持在文章中自动填充图片，可以直接使用爬虫获取的图片，也可以转存到自己的oss或者七牛云中。</span><h1>这是测试文本内容</h1><p>你需要自己运行自己的爬虫，</p><p>然后把所的文章保存在mongodb的articles collections 中</p><p>定时任务会根据设置的时间执行发布任务...</p>',
      "platformIds": [],
      "createTs": new Date(),
      "updateTs": new Date()
    }
```
## INSTALLATION
### Run with bash
```shell
git clone [this project git address]
cd zhihuSender
npm install
# You can run cnpm install if your network status is bad.
node server.js
```
### Run with PM2
```shell
git clone [this project git address]
cd zhihuSender
pm2 startOrRestart ecosystem.config.js
```
或者直接运行：
```shell
bash run.sh
```
### 如何保存知乎的登录账号信息？
基于Marvin Zhang的示例，直接向‘[your running host]:[your running port]/cookies’提交
post请求即可（例如：http://1270.0.1:3000/cookies），请求带上知乎登录的所有cooike信息即可。
```js
// web登录知乎后，执行:
document.cookie
// 获取知乎登录的账户cookie
```
示例：
```js
db.getCollection("cookies").insert({
    _id: ObjectId("87678687g698sdgf69s"),
    // 必填，cookie的值
    value: "UJHGHJKGyGJHKGkgJGJhJGKJHGkjGJKHGKuhGKJgkjhGKJHGjhkGkjhGKJHg5c=",
    // 必填，cookie的name名称
    name: "osd",
    // 必填，cookie的域
    domain: "www.zhihu.com", 
    hostOnly: true,
    httpOnly: false,
    path: "/",
    secure: false,
    session: true,__v: NumberInt("0")
});

```
