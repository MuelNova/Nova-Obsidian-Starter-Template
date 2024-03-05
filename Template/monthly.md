```dataviewjs
window.pages = dv.pages().where(p => p.file.name.match(new RegExp(`${dv.current().file.name}-\\d{2}`))).sort(p => p.file.name);
```
## Jornal List
```dataviewjs
dv.paragraph(window.pages.file.link.join(', '))
```

## Summary




## OKR Tracker
### O1 KR1: Yofukashi no nemuri
```dataviewjs
await dv.view("obsidian/Template/dvScripts/dvhelper", {func: 'calcPagesSleepScore', page: window.pages});
```
```dataviewjs
function parseTime(timeString) {
    let date = moment(timeString, 'HH:mm')
    if (date.hour() > 20) {
	    date = date.subtract(1, 'day')
    }
    return date
}

function calculateTimeDifference(time1, time2, type) {
    return time1.diff(time2, type, true)
}

const times = [];
const sleepTimes = [];

for (let page of window.pages) {
	if (page['sleep_to'] && page['sleep_time']) {
		times.push(calculateTimeDifference(parseTime(page['sleep_to']), parseTime(page['sleep_time']), 'hours'));
		sleepTimes.push(parseTime(page['sleep_time']).valueOf())
	}
	else {
		times.push(0);
		sleepTimes.push(parseTime("21:00"))
	}
}

const chartData = {
    type: 'line',
    data: {
	    labels: window.pages.file.name.array(),
        datasets: [{
            label: 'Sleep Time',
            data: times,
            pointBackgroundColor: '#6c40d6',
            borderColor: '#6c40d65c',
            tension: 0.4,
            spanGaps: true,
            yAxisID: 'y1'
        },
        {
            label: 'Bed Time',
            data: sleepTimes,
            pointBackgroundColor: '#2ce0d6',
            borderColor: '#2ce0d65c',
            tension: 0.4,
            spanGaps: true,
            yAxisID: 'y2'
        }],
    },
    options: {
        scales: {
            y1: {
                type: 'linear',
                min: 2,
                max: 13
            },
            y2: {
		    reverse: true,
		    position: 'right',
	        ticks: {
	          beginAtZero: false,
	          callback: value => {
	            let date = moment(value)
	            return date.format("HH:mm")
	          }
	        }
	      }
        },
      plugins: {
	     tooltip: {
		  callbacks: {
			label: function(tooltipItem, data) {
			  if (tooltipItem.datasetIndex == 0) {
			    return tooltipItem.raw.toFixed(2) + 'h'
			  }
			  let date = moment(tooltipItem.raw)
			  return date.format("HH:mm")
			}
		  }
	     }
	   }
    }
}

window.renderChart(chartData, this.container);
```



### O1 KR2: Strike at god's first glance
```dataviewjs
let count = 0
let sum = 0
for (let page of window.pages) {
	if (page['o1kr2_score']) {
	    count++;
	    sum += page['o1kr2_score'];
	}
}
const average = count == 0 ? 0 : sum / count
const res = "💯得分：" + average.toFixed(2) + " / 1.00\n👏记录次数：" + count;
dv.el('div', res, {cls: average >= 0.8 ? 'score-tier1' : average >= 0.5 ? 'score-tier2' : 'score-tier3'})

```

### O1 KR3: Experience tranquility
```dataviewjs
let count = 0;
for (let page of window.pages) {
	if (page['o1kr3_success']) {
	    count++;
	}
}
const score = count >= 22 ? 1 : count * 0.045
const res = "💯得分：" + score.toFixed(2) + " / 1.00\n👏记录次数：" + count;
dv.el('div', res, {cls: score >= 0.8 ? 'score-tier1' : score >= 0.5 ? 'score-tier2' : 'score-tier3'})
```

### O1 KR4: Onegai muscle
```dataviewjs
let count = 0;
let riceCount = 0;
for (let page of window.pages) {
	if (page['o1kr4_success']) {
	    count++;
	}
	if (page['o1kr4_count']) {
	    riceCount += page['o1kr4_count'];
	}
}
let score = count >= 22 ? 0.8 : (count - 1) * 0.045
if (score < 0) {
	score = 0
}
score += riceCount >= 88 ? 0.2 : riceCount * 0.0023
const res = "💯得分：" + score.toFixed(2) + " / 1.00\n👏记录次数：" + count + "\n🍚额外米饭：" + riceCount;
dv.el('div', res, {cls: score >= 0.8 ? 'score-tier1' : score >= 0.5 ? 'score-tier2' : 'score-tier3'})
```

### O1 KR5: I live in my own
```dataviewjs
await dv.view("obsidian/Template/dvScripts/dvhelper", {func: 'calcPagesMoodScore', page: window.pages});


const mood = [0, 0, 0, 0, 0];
const calendarData = {
	colors: {
		default: ["#9966ff", "#4bc0c0", "#ffce56", "#36a2eb", "#ff6384"]
	},
	entries: []
}

for (let page of window.pages) {
	if (page['mood']) {
		let date = page.file.name
		let intensity = 10
	    switch(page['mood'].toLowerCase()) {
            case "happy":
                mood[0] = mood[0] + 1
                intensity = 100
                break;
            case "peace":
                mood[1] = mood[1] + 1
                intensity = 80
                break;
            case "anxious":
                mood[2] = mood[2] + 1
                intensity = 60
                break;
            case "sad":
                mood[3] = mood[3] + 1
                intensity = 40
                break;
            default:
	            mood[4] = mood[4] + 1
	            intensity = 20
        }
        calendarData.entries.push({
	        date: date,
	        intensity: intensity
        })
	}
}

const chartData = {
    type: 'pie',
    data: {
	    labels: ["Happy", "Peace", "Anxious", "Sad", "Desperate"],
        datasets: [{
            label: 'Mood Count',
            data: mood,
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',  // 开心
                'rgba(54, 162, 235, 0.7)',   // 平静
                'rgba(255, 206, 86, 0.7)',   // 焦虑
                'rgba(75, 192, 192, 0.7)',   // 伤心
                'rgba(153, 102, 255, 0.7)'   // 绝望
            ]
        }],
    },
}

window.renderChart(chartData, this.container);
renderHeatmapCalendar(this.container, calendarData);
```

### O2 KR1: PWN my life by learning
```dataviewjs
let count = 0;
const times = [];
for (let page of window.pages) {
	if (page['o2kr1_time']) {
	    count += page['o2kr1_time']
	}
	times.push(page['o2kr1_time'] ? page['o2kr1_time'] : 0);
}
const score = count >= 62 ? 1.00 : count / 62
const res = "💯得分：" + score.toFixed(2) + " / 1.00\n⏱️总时长：" + count + "h";
dv.el('div', res, {cls: score >= 0.8 ? 'score-tier1' : score >= 0.5 ? 'score-tier2' : 'score-tier3'})


const chartData = {
    type: 'bar',
    data: {
	    labels: window.pages.file.name.array(),
        datasets: [{
            label: 'PWN Time',
            data: times,
            backgroundColor: '#FF63845c',
            borderColor: '#FF6384',
            borderWidth: 2,
        }],
    },
}

window.renderChart(chartData, this.container);
```



### O2 KR2:  I feel my mind a library
```dataviewjs
let count = 0;
const times = [];
for (let page of window.pages) {
	if (page['o2kr2_time']) {
	    count += page['o2kr2_time']
	}
	times.push(page['o2kr2_time'] ? page['o2kr2_time'] : 0);
}
const score = count >= 31 ? 1.00 : count / 31
const res = "💯得分：" + score.toFixed(2) + " / 1.00\n⏱️总时长：" + count + "h";
dv.el('div', res, {cls: score >= 0.8 ? 'score-tier1' : score >= 0.5 ? 'score-tier2' : 'score-tier3'})

const chartData = {
    type: 'bar',
    data: {
	    labels: window.pages.file.name.array(),
        datasets: [{
            label: 'Learning Time',
            data: times,
            backgroundColor: '#36A2EB5c',
            borderColor: '#36A2EB',
            borderWidth: 2,
        }],
    },
}

window.renderChart(chartData, this.container);
```

### O2 KR3:  I know what he's talking
```dataviewjs
let count = 0;
const times = [];
for (let page of window.pages) {
	if (page['o2kr3_time']) {
	    count += page['o2kr3_time']
	}
	times.push(page['o2kr3_time'] ? page['o2kr3_time'] : 0);
}
const score = count >= 31 ? 1.00 : count / 31
const res = "💯得分：" + score.toFixed(2) + " / 1.00\n⏱️总时长：" + count + "h";
dv.el('div', res, {cls: score >= 0.8 ? 'score-tier1' : score >= 0.5 ? 'score-tier2' : 'score-tier3'})

const chartData = {
    type: 'bar',
    data: {
	    labels: window.pages.file.name.array(),
        datasets: [{
            label: 'Language Time',
            data: times,
            backgroundColor: '#FFCE565c',
            borderColor: '#FFCE56',
            borderWidth: 2,
        }],
    },
}

window.renderChart(chartData, this.container);
```

## Toggl Tracker
```toggl
LIST
FROM Invalid date TO Invalid date
GROUP BY PROJECT
SORT DESC
```
```toggl
SUMMARY
FROM Invalid date TO Invalid date
```
## Time Statistics
```dataviewjs
const pwn_time = [];
const learn_time = [];
const language_time = [];
let pwn = 0
let learn = 0
let language = 0
for (let page of window.pages) {
	pwn_time.push(page['o2kr1_time'] ? page['o2kr1_time'] : 0);
	pwn += page['o2kr1_time'] ? page['o2kr1_time'] : 0
	learn_time.push(page['o2kr2_time'] ? page['o2kr2_time'] : 0);
	learn += page['o2kr2_time'] ? page['o2kr2_time'] : 0
	language_time.push(page['o2kr3_time'] ? page['o2kr3_time'] : 0);
	language += page['o2kr3_time'] ? page['o2kr3_time'] : 0
}

const chartData = {
    type: 'line',
    data: {
        labels: window.pages.file.name.array(),
        datasets: [{
            label: 'PWN Time',
            data: pwn_time,
            pointBackgroundColor: '#FF6384', // 红色
            borderColor: '#FF6384',
            tension: 0.4,
            spanGaps: true,
        },{
            label: 'Learning Time',
            data: learn_time,
            pointBackgroundColor: '#36A2EB', // 蓝色
            borderColor: '#36A2EB',
            tension: 0.4,
            spanGaps: true,
        },{
            label: 'Language Time',
            data: language_time,
            pointBackgroundColor: '#FFCE56', // 黄色
            borderColor: '#FFCE56',
            tension: 0.4,
            spanGaps: true,
        }],
    }
}

const pieChartData = {
    type: 'pie',
    data: {
        labels: ["PWN Time", "Learning Time", "Language Time"],
        datasets: [{
            label: 'Time Distribution',
            data: [pwn, learn, language],
            backgroundColor: [
                '#FF6384b0', // 红色
                '#36A2EBb0', // 蓝色
                '#FFCE56b0', // 黄色
            ]
        }]
    }
}
window.renderChart(chartData, this.container);
window.renderChart(pieChartData, this.container);
```
