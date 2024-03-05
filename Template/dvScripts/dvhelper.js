
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
        let totalScore = 0;
        let totalSleep = 0;
        let average_bed_time = 0;
        let length = 0;
        for (let note of pages) {
            let [score, time_] = this.calcSleepScore(note, false);
            if (score != null || score == 0) {
                let sleep = parseTime(note.sleep_time);
                average_bed_time += sleep.getHours() + sleep.getMinutes() / 60;
                totalScore += score;
                totalSleep += parseFloat(time_);
                length += 1;
            }
        }
        if (length == 0) {
            var average = 0;
            var average_hours = 0;
        }
        else {
            var average = totalScore / length;
            var average_hours = totalSleep / length;
            average_bed_time /= length;
        }
        if (render) {
            const average_bed_time_string = Math.floor(average_bed_time).toString().padStart(2, '0') + ":" + Math.floor((average_bed_time - Math.floor(average_bed_time)) * 60).toString().padStart(2, '0');
            const res = "💯得分：" + average.toFixed(2) + " / 1.00\n👏记录次数：" + length + "\n😎平均时间：" + average_hours.toFixed(2) + "h\n🛏️平均入睡时间：" + average_bed_time_string;
            dv.el('div', res, {cls: average >= 0.8 ? 'score-tier1' : average >= 0.5 ? 'score-tier2' : 'score-tier3'})
        }
        return average;
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