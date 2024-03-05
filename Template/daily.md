<%*
    // 因为我总是会在当天 12 点之后记录，因此我添加了这条判断
    const now = moment();
    if (now.hours() < 4) {
        const new_name = now.subtract(1, 'days').format("YYYY-MM-DD");
        console.log(new_name);
        if (!await tp.file.exists(tp.file.folder(true) + "/" + new_name + ".md")) {
            tp.file.rename(new_name);
		    tp.file.title = new_name;
        }
    }
-%>
## Info

| Date                                                                                                                                                                                                                                                                                                                          | Weather                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| <% `[[${moment(tp.file.title).format('YYYY')}]], [[${moment(tp.file.title).format('YYYY-MM')} \\\| ${moment(tp.file.title).format('MMMM')}]], [[${moment(tp.file.title).format('YYYY')}-W${moment(tp.file.title).format('WW')} \\\| Week ${moment(tp.file.title).format('WW')}]], ${moment(tp.file.title).format('dddd')}` %> | <% tp.user.getWeather() %> |

## Notes
## Daily Tracker
😴睡眠时间：<% tp.user.miBand('getSleep') %>
😎心情: (mood:: <% await tp.system.suggester(["开心😄", "平和😇", "焦虑😫", "伤心😩", "绝望😭"], ["Happy", "Peace", "Anxious", "Sad", "Desperate"], false, "你的心情是？") %>)
👟步数: <% tp.user.miBand("getSteps") %>

## OKR Tracker
### O1 KR1: Yofukashi no nemuri
```dataviewjs
await dv.view("obsidian/Template/dvScripts/dvhelper", {func: 'calcSleepScore', page: dv.current()});
```
📓备注：
<details>
<summary>得分细则</summary>
<p>- 00:00(+-30)~7:30(+-30): 1.0</p>
<p>- 7~8h sleep and between 00:00~01:00: 0.8</p>
<p>- More/Less sleep and proper time: 0.6</p>
<p>- Enough sleep and improper time: 0.4</p>
<p>- Neither: 0.2</p>
</details>

### O1 KR2: Strike at god's first glance
💯得分：(o1kr2_score::<% await tp.system.suggester(["直接起床😄", "小酣一次😇", "小酣三次以内😫", "再睡超过 30 分钟😭", "不得不起😴"], ["1.00", "0.80", "0.60", "0.40", "0.20"], false, "起床效率如何呢？")%>)/ 1.00

### O1 KR3: Experience tranquility
☑️完成：(o1kr3_success:: <% await tp.system.suggester(["冥想了🧘", "没有冥想😩"], ["1", "0"], false, "你是否冥想了？") %>)
📓备注：

### O1 KR4: Onegai muscle
☑️完成：(o1kr4_success:: <% await tp.system.suggester(["锻炼了💪", "没有锻炼😩"], ["1", "0"], false, "你是否锻炼了？") %>)
🍜额外米饭数：(o1kr4_count::<% await tp.system.prompt("今天额外吃了几碗饭？", "0") %>)
📓备注：

### O1 KR5: I live in my own
```dataviewjs
await dv.view("obsidian/Template/dvScripts/dvhelper", {func: 'calcMoodScore', page: dv.current()});
```
📓备注：
<details>
<summary>得分细则</summary>
<p>- Happy: 1.0</p>
<p>- Peace: 0.75</p>
<p>- Anxious: 0.5</p>
<p>- Sad: 0.25</p>
<p>- Desperate: 0.00</p>
</details>


### O2 KR1: PWN my life by learning
📚学习时间：(o2kr1_time::<% await tp.user.togglTracker("getProjectByHours", "O2KR1", tp.file.title) %>)h
📓备注：

### O2 KR2:  I feel my mind a library
📚学习时间：(o2kr2_time::<% await tp.user.togglTracker("getProjectByHours", "O2KR2", tp.file.title) %>)h
📓备注：

### O2 KR3:  I know what he's talking
📚学习时间：(o2kr3_time::<% await tp.user.togglTracker("getProjectByHours", "O2KR3", tp.file.title) %>)h
📓备注：


### O3 KR1: Algo is all
☑️完成数量：(o1kr3_count::<% await tp.system.prompt("今天做了几道算法题？", "0") %>)
📓备注：

## Toggl Tracker
```toggl
LIST
FROM <% moment(tp.file.title).format("YYYY-MM-DD") %> TO <% moment(tp.file.title).format("YYYY-MM-DD") %>
```
```toggl
SUMMARY
FROM <% moment(tp.file.title).format("YYYY-MM-DD") %> TO <% moment(tp.file.title).format("YYYY-MM-DD") %>
```
