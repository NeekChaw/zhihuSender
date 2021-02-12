cd ./zhihuSender
git pull
cnpm install
pm2 startOrRestart ecosystem.config.js
nginx -s reload
echo '=====================    更新爬虫服务器完成     ======================'

