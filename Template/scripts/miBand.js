function getHourByMinutes(time) {
    return (time / 60).toFixed(2);
}
function getMinutesBySeconds(time) {
    return getHourByMinutes(time);
}
function distanceToReadable(distance) {
    if (distance < 1000) return distance + "m"
    return (distance / 1000).toFixed(2) + "km"

}

const env = {
  URL: ['http://10.21.xx.xx:xxxxx', 'http://localhost:xxxxx'],
}

const miBandHandler = {
    

    getDailyReport: async function(type = 'STEP', date = null, until = null) {
        for (let i = 0; i < env.URL.length; i++) {
          const url = env.URL[i] + '/getDailyReport?type=' + type + (date? '&date=' + date : '') + (until? '&until=' + until : '');
          console.log('Trying URL:', url);
          try {
            var response = await fetch(url);
          } catch (e) {
            console.warn('Failed to get daily report from url', url);
            continue
          }
          if (!response.ok) {
              throw new Error('Failed to get daily report: ' + response.status + ' ' + response.statusText);
          }
          const data = await response.json();
          if (data.status == 0) {
              return data.data
          } else {
              console.error('Failed to get daily report:', data);
              return "None"
          }
        }
        throw new Error('Failed to get daily report: No available URL');
    },

    getSteps: async function(date = null, until = null) {
      try {
        data = await this.getDailyReport('STEP', date, until);
        if(until == null) {
          data = data[0]
        }
        let res = "(steps:: " + data.steps + ")\n - 🏃‍♂️距离：" + distanceToReadable(data.distance)
        return res
      } catch (e) {
        console.error('Error getting steps:', e);
        return e
      }
    },

    getSleep: async function(date = null, until = null) {
      try {
        data = await this.getDailyReport('SLEEP', date, until);
        if(until == null) {
          data = data[0]
        }
        const sleepDatas = data.sleepSegments.sort((a, b) => b.sleepDuration - a.sleepDuration)
        const sleepData = sleepDatas[0]
        sleep_time = new Date(sleepData.bedTime*1000)
        sleep_to = new Date(sleepData.wakeupTime*1000)

        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Shanghai',
            hour12: false
          });
        console.log(data);
        console.log(sleep_time, formatter.format(sleep_time));
        let formattedSleepTime = formatter.format(sleep_time);
        if (formattedSleepTime.startsWith("24:")) {
            formattedSleepTime = "00:" + formattedSleepTime.substring(3);
        }

        let res = `(sleep_time:: ${formattedSleepTime}) ~ (sleep_to:: ${formatter.format(sleep_to)}) —— ${getHourByMinutes(sleepData.sleepDuration)} h` + (sleep_time.getHours() < 1 ? "🟢" : (sleep_time.getHours() < 2 ? "🟡" : "🔴"))
        res += `\n⏰睡眠长度：(sleepDuration:: ${getHourByMinutes(data.totalDuration)}) h ` + (data.totalDuration < 420 ? "🔴" : (data.totalDuration < 480 ? "🟡" : "🟢"))
        if (sleepDatas.length > 1) {
            sleepDatas.slice(1).forEach((sleepData, index) => {
              res += `\n - 😪打盹${index + 1}：${formatter.format(new Date(sleepData.bedTime*1000))} ~ ${formatter.format(new Date(sleepData.wakeupTime*1000))} —— ${getHourByMinutes(sleepData.sleepDuration)} h`
            });
        }
        const remPercent = (data.remDuration / data.totalDuration * 100).toFixed(0)
        res += `\n - 🌑REM：(remDuration:: ${getHourByMinutes(data.remDuration)}) h ` + `\\[${remPercent}%]` + (remPercent <= 30 && remPercent >= 10 ? "🟢" : "🔴")
        const deepPercent = (data.deepDuration / data.totalDuration * 100).toFixed(0)
        res += `\n - 🌜深睡：(deepSleep:: ${getHourByMinutes(data.deepDuration)}) h ` + `\\[${deepPercent}%]` + (deepPercent <= 40 && remPercent >= 20 ? "🟢" : "🔴")
        const lightPercent = (data.lightDuration / data.totalDuration * 100).toFixed(0)
        res += `\n - 🌛浅睡：(lightSleep:: ${getHourByMinutes(data.lightDuration)}) h ` + `\\[${lightPercent}%]` + (lightPercent <= 60 && lightPercent >= 20 ? "🟢" : "🔴")
        res += `\n - 🌙清醒：(awakeDuration:: ${getHourByMinutes(data.awakeDuration)}) h`
        
        return res
      } catch (e) {
        console.error('Error getting sleep:', e);
        return e
      }
    },

    getSleepGraph: async function(date = null) {
        data = await this.getDailyReport('SLEEP', date);
        const combinedSleepItems = data.sleepSegments.reduce((accumulator, currentSegment) => {
            return accumulator.concat(currentSegment.sleepItems);
          }, []);
        if (combinedSleepItems.length == 0) return ""
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Shanghai',
            hour12: false
          });
        const startSleepTime = combinedSleepItems[0].startTime;
        combinedSleepItems.map((item) => {
            item.endTime = getMinutesBySeconds(item.startTime - startSleepTime)
            item.startTime = formatter.format(new Date(item.startTime * 1000));
        });
        const times = combinedSleepItems.map(item => item.startTime);
        const sleepStates = combinedSleepItems.map(item => item.sleepState);
        const endTime = combinedSleepItems.map(item => item.endTime);
        const durations = endTime.slice(1).map((time, index) => time - endTime[index]);
        const timesDuration = times.slice(1).map((time, index) => `${times[index]} ~ ${time}`)
        return "const times = [\"" + timesDuration.join('", "') + "\"]\nconst sleepStates = [" + sleepStates + "]\nconst sleepDurations = [" + durations + "]";
        /* DEPRECATED
```dataviewjs

<% tp.user.miBand("getSleepGraph") %>

const stateMapping = {
  0: '',
  1: '清醒',
  2: '深睡',
  3: '潜睡',
  4: 'REM',
};
const chartData = {
  type: 'bar',
  data: {
	labels: times, // 横轴时间
	datasets: [{
	  label: '睡眠状态', // 数据集标签
	  data: sleepStates, // 纵轴 sleepState 名称
	  backgroundColor: '#00000000',
	  borderColor: '#36A2EB',
	  borderWidth: 1,
	  tension: 1,
	  legend: false
	}],
  },
  options: {
	scales: {
	  x: {
		stacked: true
	  },
	  y: {
		ticks: {
		  callback: function(value) {
			return stateMapping[value] || ''; // 显示映射后的名称
		  },
		stepSize: 1,
		beginAtZero: false,
        min: 1,
        max: 4,
		},
	  },
	},
  },
}
window.renderChart(chartData, this.container);
```
*/
    }
}

async function miBandCaller(func = 'getSteps', ...args) {
  try {
    return await miBandHandler[func](...args);
  }
  catch (e) {
    console.error(`Error calling miBandHandler.${func}:`, e);
    return "None"
  }

}
module.exports = miBandCaller;