const server1 = 'server1';
const server2 = 'server2';
const server3 = 'server3';

module.exports = {
    apps: [
        // 应用1
        {
            name: 'zhihuSender Server', // 进程中的应用名称
            script: '/home/zhihuSender/server.js', // 要启动的脚本路径
            cwd: '/home/zhihuSender', // 当前工作目录
            args: [], // 传递给脚本的参数
            interpreter: 'node', // 解释器的绝对路径
            node_args: [], // 传递给解释器的参数
            output: `/home/zhihuSender/logs/${server1}-out.log`, // 正常输出目录
            error: `/home/zhihuSender/logs/${server1}-error.log`, // 异常输出目录
            log: `/home/zhihuSender/logs/${server1}.log`, // 所有输出
            pid_file: `/home/zhihuSender/pids/${server1}.pid`, // pm2写入已启动进程的pid的文件路径
            log_date_format: 'YYYY-MM-DD HH:mm:ss', // 指定日志文件的时间格式
            // 指定要注入的环境变量
            env: {
                NODE_ENV: 'production',
            },
            env_dev: {
                NODE_ENV: 'development',
            },
            autorestart: true, // 进程中断自动重启
            // watch: true, // 是否监听文件变化
            watch_delay: 1000,
            watch: ['src', 'routes', 'spiders', 'models', 'config'],
            max_memory_restart: '1G', // 如果超出内存量，重新启动应用
            // restart_delay: 10 * 1000, // 在重启崩溃应用前，需要等待毫秒
            // 是否监听文件变动然后重启
            ignore_watch: [
                // 不用监听的文件
                'node_modules',
                'logs',
                'www',
                'framework',
                'public',
                'tmp',
            ],
            min_uptime: '120s', // 应用启动的最小正常运行时间，即改时间后才能再次重启 ， 默认毫秒
            max_restarts: 30, // 应用异常退出重启的最大次数
            // 开启集群模式
            // instances: 1, // 应用启动实例个数，仅在cluster模式有效 默认为fork；或者 max
            exec_mode: 'fork_mode', // 应用启动模式，支持fork和cluster模式
        },
    ],
    //
    deploy: {
        production: {
            user: 'root',
            host: ['git.mxclass.com'],
            ref: 'origin/master',
            repo: 'http://git.mxclass.com/root/zhihuSender.git',
            path: '/catparty/',
            'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js --env production',
            ssh_options: 'StrictHostKeyChecking=no',
            env: {
                NODE_ENV: 'production',
            },
        },
    },
};
