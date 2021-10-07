const inquirer = require('inquirer')
const ora = require('ora')

const path = require('path')

const fs = require('fs');
const shell = require('shelljs')

/**
 * 添加加载动画
 * @param {Function} fn 
 * @param {String} message 
 * @param  {...any} args 
 * @returns 执行方法返回结果
 */
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
  } 
}

class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;

    // 项目列表，用于后面获取gitlab项目id
    this.repoList = [];

  }

  /**
   * 获取模板目录，以供用户选择，返回当前选中模板名称
   * @returns 用户名称
   */
  async getTemplates() {
    // 1）从本地template目录获取模板列表
    const result = fs.readdirSync(path.resolve(__dirname, '../template'));
    this.repoList = result;
    if (!this.repoList) return;

    // 2）用户选择自己新下载的模板名称
    const { template } = await inquirer.prompt({
      name: 'template',
      type: 'list',
      choices: this.repoList,
      message: 'Please choose a template to create project'
    })

    // 3）return 用户选择的名称
    return template;
  }

  /**
   * 复制模板到目标目录
   * @param {*} sourceDir 原模板路径
   * @param {*} targetDir 目标目录
   */
  async downloadTemplate(sourceDir, targetDir) {
    shell.cp('-R', sourceDir, targetDir)
  }

  /**
   * 下载模板
   * @param {String} repo 
   */
  async download(repo){
    await wrapLoading(
      this.downloadTemplate, // 远程下载方法
      'waiting download template', // 加载提示信息
      path.resolve(__dirname, `../template/${repo}`), // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }

  /**
   * 核心创建逻辑
   */
  async create(){

    // 1）获取模板名称
    const template = await this.getTemplates()
    
    // 3）下载模板到模板目录
    await this.download(template)

  }
}

module.exports = Generator;
