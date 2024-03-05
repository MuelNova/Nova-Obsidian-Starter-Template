## Nova-Obsidian-Starter-Template
![](docs/1.png)
### 插件
见 [community-plugins](.obsidian/community-plugins.json)

### 配置
#### 小米手环
在 [miBand.js](Template/scripts/miBand.js) 中设置，使用的是 [MiFitness-Uploader-XPosed](https://github.com/MuelNova/MiFitness-Uploader-XPosed)
```javascript
const env = {
  URL: ['http://10.21.xx.xx:xxxxx', 'http://localhost:xxxxx'],
}
```

#### togglTracker
在 [togglTracker.js](Template/scripts/togglTracker.js) 中设置，参数获取见 [toggl](https://engineering.toggl.com/docs/)
```javascript
const env = {
  api_token: '',
  workspace_id: '',
  project: {
      "O2KR1": 0,
      "O2KR2": 0,
      "O2KR3": 0,
  }
}
```