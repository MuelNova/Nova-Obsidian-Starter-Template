
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
}

function calculateTimeDifference(time1, time2, type) {
    const diff = time1.getTime() - time2.getTime();
    if (type === 'minutes') {
        return (diff / 60000).toFixed(2);
    }
    if (type === 'hours') {
        return (diff / 3600000).toFixed(2);
    }
    if (type === 'days') {
        return (diff / 86400000).toFixed(2);
    }
    return diff;
}

const dvHelper = {
    calcSleepHour: function (note, render = true) {
        const wakeUp = parseTime(note.sleep_to);
        const sleep = parseTime(note.sleep_time);
        const diff = calculateTimeDifference(wakeUp, sleep, 'hours');
        if (render) {
            dv.span("😴睡眠长度：" + diff + "h");
        }
        
        return diff;
    },

    calcSleepScore: function(note, render = true) {
        if (note.sleep_time == null || note.sleep_to == null) {
            return [null, null];
        }
        const wakeUp = parseTime(note.sleep_to);
        const sleep = parseTime(note.sleep_time);
        const diff = calculateTimeDifference(wakeUp, sleep, 'hours');
        // First check if sleep between 00:00 to 01:00
        let score = 0;
        if (((sleep.getHours() == 0 && sleep.getMinutes() <= 30) || (sleep.getHours() == 23 && sleep.getMinutes() >= 30)) && (wakeUp.getHours() == 7) || (wakeUp.getHours() == 8 && wakeUp.getMinutes() == 0)) {
            score = 1.00;
        }
        else if (sleep.getHours() == 0 && sleep.getHours() <= 1) {
            if (diff >= 7 && diff <= 8) {
                score = 0.80;
            }
            else {
                score = 0.60;
            }
        }
        else if (diff >= 7 && diff <= 8) {
            score = 0.40
        }
        else {
            score = 0.20
        }
        if (render) {
            const res = "💯得分：" + score.toFixed(2) + " / 1.00";
            dv.span(res);
        }
        return [score, diff];
    },


    calcMoodScore: function(note, render = true) {
        const mood = note.mood;

        
        let score = 0;
        if (mood == null) {
            if (render) {
                dv.span("💯得分：- / 1.00");
            }
            return null;
        }
        switch(mood.toLowerCase()) {
            case "happy":
                score = 1.00;
                break;
            case "peace":
                score = 0.75;
                break;
            case "anxious":
                score = 0.50;
                break;
            case "sad":
                score = 0.25;
        }
        if (render) {
            const res = "💯得分：" + score.toFixed(2) + " / 1.00";
            dv.span(res);
        }
        return score;
    },

    calcPagesSleepScore: function(pages, render = true) {
        let totalSleep = 0;
        let average_bed_time = 0;
        let average_wakeup_time = 0;
        let length = 0;
        let sleep_times = []; // 用于存储所有的睡眠时间
        let bed_times = []; // 用于存储所有的入睡时间
    
        for (let note of pages) {
            let [score, time_] = this.calcSleepScore(note, false);
            if (score != null || score == 0) {
                let sleep = parseTime(note.sleep_time);
                let wakeup = parseTime(note.sleep_to);
    
                average_bed_time += sleep.getHours() + sleep.getMinutes() / 60;
                average_wakeup_time += wakeup.getHours() + wakeup.getMinutes() / 60;
    
                totalSleep += parseFloat(time_);
                length += 1;
    
                // 保存睡眠时间和入睡时间
                sleep_times.push(parseFloat(time_));
                bed_times.push(sleep.getHours() * 60 + sleep.getMinutes());
            }
        }
    
        // 计算定时入睡率
        function findMaxNodesIn20Min(bed_times) {
            bed_times.sort((a, b) => a - b);
            let max_count = 0;
            let best_time = null;
    
            for (let t = bed_times[0]; t <= bed_times[bed_times.length - 1]; t++) {
                let count = bed_times.filter(time => Math.abs(time - t) <= 20).length;
                if (count > max_count) {
                    max_count = count;
                    best_time = t;
                }
            }
    
            let best_hours = Math.floor(best_time / 60);
            let best_minutes = best_time % 60;
            return {
                best_time_str: `${best_hours.toString().padStart(2, '0')}:${best_minutes.toString().padStart(2, '0')}`,
                max_count: max_count
            };
        }
    
        let { best_time_str, max_count } = findMaxNodesIn20Min(bed_times);
        let fixed_sleep_rate = length === 0 ? 0 : (max_count / length);
    
        // 计算总睡眠周期
        let total_cycles = totalSleep / 1.5;
    
        // 计算平均值
        if (length == 0) {
            var average_hours = 0;
        } else {
            var average_hours = totalSleep / length;
            average_bed_time /= length;
            average_wakeup_time /= length;
        }
    
        if (render) {
            const average_bed_time_string = Math.floor(average_bed_time).toString().padStart(2, '0') + ":" + Math.floor((average_bed_time - Math.floor(average_bed_time)) * 60).toString().padStart(2, '0');
            const average_wakeup_time_string = Math.floor(average_wakeup_time).toString().padStart(2, '0') + ":" + Math.floor((average_wakeup_time - Math.floor(average_wakeup_time)) * 60).toString().padStart(2, '0');
            const res = "👏记录次数：" + length + "\n😎平均时间：" +
                average_hours.toFixed(2) + "h\n🛏️平均入睡时间：" + average_bed_time_string +
                "\n🌞平均起床时间：" + average_wakeup_time_string +
                "\n🕒总睡眠周期：" + total_cycles.toFixed(2) +
                "\n⏰定时入睡率：" + (fixed_sleep_rate * 100).toFixed(2) + "%(" + best_time_str + ")";
            dv.el('div', res, { cls: fixed_sleep_rate >= 0.8 ? 'score-tier1' : fixed_sleep_rate >= 0.5 ? 'score-tier2' : 'score-tier3' });
        }
        return total_cycles;
    },

    calcPagesMoodScore: function(pages, render = true) {
        let totalScore = 0;
        let length = 0;
        for (let note of pages) {
            let score = this.calcMoodScore(note, false);
            if (score != null) {
                totalScore += score;
                length += 1;
            }
        }
        if (length == 0) {
            var average = 0;
        }
        else {
            var average = totalScore / length;
        }
        if (render) {
            const res = "💯得分：" + average.toFixed(2) + " / 1.00\n👏记录次数：" + length;
            dv.el('div', res, {cls: average >= 0.8 ? 'score-tier1' : average >= 0.5 ? 'score-tier2' : 'score-tier3'})
        }
        return average;
    },
}


function callDVHelper(...args) {
    args = args[0];
    dvHelper[args['func']](args['page'])
}

callDVHelper(input);