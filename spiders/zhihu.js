const fs = require('fs')
const path = require('path')
const qiniu = require('qiniu')
const cheerio = require('cheerio');
const co = require('co');
const TurndownService = require('turndown')
const constants = require('../constants')
const BaseSpider = require('./base')

// ak和sk分别可以在七牛云个人中心查看
const accessKey = 'rmnhBKrD8VyBmcsocCFfYkrkuATy28-RmrS_0atQ'
const secretKey = 'pa4GIb9vS8BMxF6rkhGQNZa7reIj3d5np7zE0F1e'
// 鉴权对象mac
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
// zone为你所购买的对象存储空间的地区，如华南、华东等
config.zone = qiniu.zone.Zone_z2
// 资源管理的操作对象
const bucketManager = new qiniu.rs.BucketManager(mac, config);
// 封装成promise
async function uploadQiniu (url, bucket, key) {
  // 返回一个promise对象
  return new Promise((resolve, reject) => {
    bucketManager.fetch(url, bucket, key, (err, resBody, resInfo) => {
      if (err) {
        reject(err)
      } else if (resInfo.statusCode === 200) {
        resolve(resBody.key)
      } else {
        console.log(`错误状态码:${resInfo.statusCode}`)
      }
    })
  })
}

class ZhihuSpider extends BaseSpider {
  async afterGoToEditor() {
    console.log(`正在发布文章：${this.article.title}`)
    // 创建tmp临时文件夹
    const dirPath = path.resolve(path.join(__dirname, '..', 'tmp'))
    if (!fs.existsSync(dirPath)) {
      await fs.mkdirSync(dirPath)
    }

    // 内容
    let content = `${this.article.content}\n\n> 听说点赞的人儿，很招人喜欢~！`
    const $ = await cheerio.load(this.article.contentHtml, { ignoreWhitespace: true })
    const img = $('img')
    for (const index in img) {
      const resUrl = img.eq(index).attr('src');
      if (resUrl) {
        const bucket = 'catparty';
        const key = `${new Date().getTime().toString()}.png`;
        let newKey = ''
        console.log(`[${new Date()}] 正在转存外链图片：${resUrl}`)
        await uploadQiniu(resUrl, bucket, key)
          .then(res => {
            newKey = res
            console.log(`[${new Date()}] 外链图片转存成功：${res}`)
            // const imgUrl = `https://qiniu.meowparty.cn/${newKey}?imageView2/0/q/75|watermark/1/image/aHR0cHM6Ly9xaW5pdS5tZW93cGFydHkuY24vdjItN2M3MDU0Nzk3NzIyODRkOTZjOGM0NTFlOWVlOWFlODRfcWhkLmpwZw==/dissolve/100/gravity/SouthEast/dx/5/dy/5`
            // const imgUrl = `https://qiniu.meowparty.cn/${newKey}?imageView2/0/q/75|watermark/1/image/aHR0cHM6Ly9xaW5pdS5tZW93cGFydHkuY24vMDAwMDAucG5n/dissolve/100/gravity/SouthEast/dx/10/dy/10`
            const imgUrl = `https://qiniu.meowparty.cn/${newKey}?imageView2/0/q/75|watermark/1/image/aHR0cHM6Ly9xaW5pdS5tZW93cGFydHkuY24vMTExMS5wbmc=/dissolve/100/gravity/SouthEast/dx/5/dy/5`
            img.eq(index).attr('src', imgUrl)
          })
      }
    }
    const turndownService = new TurndownService()
    content = turndownService.turndown($.html())
    content = `${content}\n\n> 听说点赞的人儿，很招人喜欢~`


    // 写入临时markdown文件
    const mdPath = path.join(dirPath, `${this.article._id.toString()}.md`)
    await fs.writeFileSync(mdPath, content)

    // 点击更多
    await this.page.click('#Popover3-toggle')
    await this.page.waitFor(1000)

    // 点击导入文档
    await this.page.click('.Editable-toolbarMenuItem:nth-child(1)')
    await this.page.waitFor(1000)

    // 上传markdown文件
    const handle = await this.page.$('input[accept=".docx,.doc,.markdown,.mdown,.mkdn,.md"]')
    await handle.uploadFile(mdPath)
    await this.page.waitFor(5000)

    // 删除临时markdown文件
    await fs.unlinkSync(mdPath)
    console.log(`文章填充完成：${this.article.title}`)
  }

  async inputContent(article, editorSel) {
    // do nothing
  }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterInputEditor() {
    // 点击发布文章
    await this.page.evaluate(() => {
      const el = document.querySelector('.PublishPanel-triggerButton')
      el.click()
    })
    await this.page.waitFor(5000)

    // 选择标签
    // const tags = this.task.tag.split(',')
    // for (const tag of tags) {
    //   const elTagInput = await this.page.$('.PublishPanel-searchInput')
    //   await elTagInput.type(tag)
    //   await this.page.waitFor(5000)
    //   await this.page.evaluate(() => {
    //     document.querySelector('.PublishPanel-suggest > li:nth-child(1)').click()
    //   })
    // }

    // 点击下一步
    await this.page.evaluate(() => {
      const el = document.querySelector('.PublishPanel-stepOneButton > button')
      el.click()
    })


    await this.page.waitFor(5000)
    // 点击专栏
    await this.page.evaluate(() => {
      const el = document.querySelector('.PublishPanel-columnItem > .PublishPanel-label')
      if (el) {
        el.click()
      }
    })

    await this.page.waitFor(2000)
  }

  async publish() {
    // 发布文章
    try {
      await this.page.evaluate(() => {
        const el = document.querySelector('.PublishPanel-stepTwoButton')
        el.click()
      })
    } catch (e) {
      // do nothing
    }
    await this.page.waitFor(5000)

    // 后续处理
    await this.afterPublish()
  }

  async afterPublish() {
    this.task.url = this.page.url()
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
  }
}

module.exports = ZhihuSpider
