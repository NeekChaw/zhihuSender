const { ObjectId } = require('bson')
const { exec } = require('child_process')
const path = require('path')
const constants = require('../constants')
const models = require('../models')

module.exports = {
  getTaskList: async (req, res) => {
    const tasks = await models.Task.find()
    await res.json({
      status: 'ok',
      data: tasks,
    })
  },
  getTask: async (req, res) => {
    const task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
    await res.json({
      status: 'ok',
      data: task,
    })
  },
  autoBatch: async (req, res) => {
    const articles = await models.Article.find().sort({ _id: -1 })
    for (const articleItem of articles) {
      console.log(`生成任务：${articleItem._id}`)
      const task = new models.Task({
        articleId: ObjectId(articleItem._id),
        platformId: ObjectId('600bd31dbca5313d48bcc518'),
        status: constants.status.NOT_STARTED,
        createTs: new Date(),
        updateTs: new Date(),
        checked: true,
        authType: 'cookie',
        // 配置信息
        category: '',
        ready: true,
        tag: '宠物',
        pubType: 'public',
        title: articleItem.title,
      })
      await task.save()
    }
    await res.json({
      status: 'ok',
    })
  },
  addTasks: async (req, res) => {
    for (const _task of req.body) {
      let task
      if (_task._id) {
        task = await models.Task.findOne({ _id: ObjectId(_task._id) })
        task.category = _task.category
        task.tag = _task.tag
        task.pubType = _task.pubType
        task.updateTs = new Date()
        task.checked = _task.checked
        task.authType = _task.authType
        task.title = _task.title
      } else {
        task = new models.Task({
          articleId: ObjectId(_task.articleId),
          platformId: ObjectId(_task.platformId),
          status: constants.status.NOT_STARTED,
          createTs: new Date(),
          updateTs: new Date(),
          checked: _task.checked,
          authType: _task.authType,

          // 配置信息
          category: _task.category,
          tag: _task.tag,
          pubType: _task.pubType,
          title: _task.title,
        })
      }
      task = await task.save()
    }
    await res.json({
      status: 'ok',
    })
  },
  addTask: async (req, res) => {
    let task = new models.Task({
      articleId: ObjectId(req.body.articleId),
      platformId: ObjectId(req.body.platformId),
      status: constants.status.NOT_STARTED,
      createTs: new Date(),
      updateTs: new Date(),

      // 配置信息
      category: req.body.category,
      tag: req.body.tag,
    })
    task = await task.save()
    await res.json({
      status: 'ok',
      data: task,
    })
  },
  editTask: async (req, res) => {
    let task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
    if (!task) {
      return res.json({
        status: 'ok',
        error: 'not found',
      }, 404)
    }
    task.category = req.body.category
    task.tag = req.body.tag
    task.updateTs = new Date()
    task = await task.save()
    res.json({
      status: 'ok',
      data: task,
    })
  },
  deleteTask: async (req, res) => {
    const task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
    if (!task) {
      return res.json({
        status: 'ok',
        error: 'not found',
      }, 404)
    }
    await models.Task.remove({ _id: ObjectId(req.params.id) })
    await res.json({
      status: 'ok',
      data: req.body,
    })
  },
  publishTask: async (req, res) => {
    const Task = await models.Task.findOne({ _id: ObjectId(req.params.id) })
    if (!Task) {
      return res.json({
        status: 'ok',
        error: 'not found',
      }, 404)
    }
    const platforms = req.body.platforms.split(',')
    let isError = false
    let errMsg = ''
    for (let i = 0; i < platforms.length; i++) {
      if (isError) break
      const platform = platforms[i]

      // 获取执行路径
      let execPath
      if (platform === 'juejin') {
        execPath = 'juejin/juejin_spider.js'
      } else if (platform === 'segmentfault') {
        execPath = 'segmentfault/segmentfault_spider.js'
      } else if (platform === 'jianshu') {
        execPath = 'jianshu/jianshu_spider.js'
      } else {
        continue
      }
      const filePath = path.join(__dirname, '..', '..', 'spiders', execPath)

      // 初始化平台
      if (!Task.platforms[platform]) {
        Task.platforms[platform] = {}
      }

      // 初始化执行结果
      if (Task.platforms[platform].url || Task.platforms[platform].status === 'processing') {
        // 如果结果已经存在或状态为正在处理，跳过
        console.log(`skipped ${platform}`)
        continue
      } else {
        Task.platforms[platform] = {
          status: 'processing',
          updateTs: new Date(),
        }
        await Task.updateOne(Task)
      }

      console.log(`node ${filePath} ${Task._id.toString()}`)
      await exec(`node ${filePath} ${Task._id.toString()}`, (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          isError = true
          errMsg = stderr
          Task.platforms[platform] = {
            status: 'error',
            updateTs: new Date(),
            error: errMsg,
          }
          Task.updateOne(Task)
        }
      })
    }

    if (isError) {
      await res.json({
        status: 'ok',
        error: errMsg,
      }, 500)
    } else {
      await res.json({
        status: 'ok',
        data: Task,
      })
    }
  },
}
