const env = {
  api_token: '',
  workspace_id: '',
  project: {
      "O2KR1": 0,
      "O2KR2": 0,
      "O2KR3": 0,
  }
}

const TogglTracker = {
  getProjectSeconds: async function(project, date, end_date=null) {
      /*
      获取指定日期的日报
      @param {string} project - 项目名称
      @param {string} date - 日期，为 YYYY-MM-DD 格式
      @return {object} - 返回指定日期的日报
      */
    if (end_date === null) {
        end_date = date;
    }
    const _data = {
      "start_date": date,
      "end_date": end_date
    }
    const response = await fetch(`https://api.track.toggl.com/reports/api/v3/workspace/${env.workspace_id}/projects/${env.project[project]}/summary`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(env.api_token + ':api_token')
        },
        body: JSON.stringify(_data)
    });
    if (!response.ok) {
        throw new Error('Failed to get project seconds: ' + response.status + ' ' + response.statusText);
    }
    return (await response.json()).seconds;
  },

  getProjectByHours: async function(project, date, end_date=null) {
    return ((await this.getProjectSeconds(project, date, end_date)) / 3600).toFixed(2);
  }
}

async function togglTracker(func = 'getProjectByHours', ...args) {
  try {
    return await TogglTracker[func](...args);
  }
  catch (e) {
    console.error(`Error calling togglTracker.${func}:`, e);
    return "0"
  }

}

module.exports = togglTracker;