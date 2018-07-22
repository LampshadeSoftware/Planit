class Scheduler {
    constructor(){
        this.schedules = [[{}]];
        this.schedule_index = 0;
    }

    /**
     * returns the schedule that the user is currently viewing (the one at schedule index)
     */
    getCurrentSchedule(){
        return this.schedules[this.schedule_index];
    }

    parseRawSchedules(raw_schedules){
        // clears the last array of schedules and resets index
        this.reset();

        this.schedules = [];
        // parses the raw schedules dictionary into a FullCalendar-readable format
        for (let i in raw_schedules) {
            creditCounts.push(raw_schedules[i]["total_credits"]);
            let schedule = [];
            let sections = raw_schedules[i]["sections"];
            for (let j in sections) {
                let section = sections[j];

                let subject = section["subject"];
                let courseId = section["course_id"];
                let sectionNum = section["section_num"];
                let title = section["title"];
                let numCredits = section["num_credits"];
                for (let t in section["times"]) {
                    let time = section["times"][t];
                    let day = time["day"];
                    let startHour = time["start_hour"];
                    let startMinute = time["start_minute"];
                    let endHour = time["end_hour"];
                    let endMinute = time["end_minute"];
                    schedule.push({
                        "title": "[" + numCredits + "] " + subject + " " + courseId + " " + sectionNum + " - " + title,
                        "start": "2018-01-0" + day + 'T' + startHour + ":" + startMinute,
                        "end": "2018-01-0" + day + 'T' + endHour + ":" + endMinute,
                        "color": coursesInfo[subject + courseId]["color"]
                    });
                }
            }
            this.schedules.push(schedule);
        }
    }

    cycleLeft(){
        num_schedules = this.numberOfSchedules();
        this.schedule_index -= 1;
        if (this.schedule_idex < 0){
            if (num_schedules === 0){
                this.schedule_index = 0;
            } else {
                this.schedule_index = num_schedules-1;
            }
        }
    }

    cycleRight(){
        scheduleIndex += 1;
        if (scheduleIndex >= numSchedules){
            scheduleIndex = 0;
        }
    }

    numberOfSchedules(){
        return this.schedules.length;
    }

    reset(){
        this.schedules = [[{}]];
        this.schedule_index = 0;
    }
}