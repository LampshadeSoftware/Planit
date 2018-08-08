/**
 * Manages all of the schedules and the currently displayed schedules
 * Parses raw data and converts it to a calendar-readable format
 */
class Scheduler {
    constructor(){
        this.empty_schedules = [[{}]];
        this.schedules = this.empty_schedules;
        this.schedule_index = 0;
        this.credit_counts = [];
        this.schedules_info = {};
    }

    /**
     * returns the schedule that the user is currently viewing (the one at schedule index)
     */
    getCurrentSchedule(){
        return this.schedules[this.schedule_index];
    }

    /**
     * Assigns the instance variables so that they reflect the most up to date schedules that came from the server
     * @param raw_schedules: the dictionary representation of a schedule that comes from the server
     * @param schedules_info: the dictionary that maps subject + course_id to another dictionary of course-specific information
     */
    parseRawSchedules(raw_schedules, schedules_info){
        // clears the last array of schedules and resets the schedule index
        this.reset();

        this.schedules = [];
        this.schedules_info = schedules_info;

        // parses the raw schedules dictionary into a FullCalendar-readable format
        for (let i in raw_schedules) {
            this.credit_counts.push(raw_schedules[i]["total_credits"]);
            let schedule = [];
            let sections = raw_schedules[i]["sections"];
            for (let j in sections) {
                let section = sections[j];

                let subject = section["subject"];
                let course_id = section["course_id"];
                let section_num = section["section_num"];
                let title = section["title"];
                let num_credits = section["num_credits"];
                for (let t in section["times"]) {
                    let time = section["times"][t];
                    let day = time["day"];
                    let start_hour = time["start_hour"];
                    let start_minute = time["start_minute"];
                    let end_hour = time["end_hour"];
                    let end_minute = time["end_minute"];
                    schedule.push({
                        "title": "[" + num_credits + "] " + title + " - " + subject + " " + course_id + " " + section_num,
                        "start": "2018-01-0" + day + 'T' + start_hour + ":" + start_minute,
                        "end": "2018-01-0" + day + 'T' + end_hour + ":" + end_minute,
                        "color": this.schedules_info[subject + course_id]["color"]
                    });
                }
            }
            this.schedules.push(schedule);
        }
        if (this.schedules.length === 0) {
            this.schedules = [[{}]];
        }
    }

    cycleLeft(){
        let num_schedules = this.numberOfSchedules();
        this.schedule_index -= 1;
        if (this.schedule_index < 0){
            if (num_schedules === 0){
                this.schedule_index = 0;
            } else {
                this.schedule_index = num_schedules-1;
            }
        }
    }

    cycleRight(){
        this.schedule_index += 1;
        if (this.schedule_index >= this.numberOfSchedules()){
            this.schedule_index = 0;
        }
    }

    numberOfSchedules(){
        if (this.schedules.length === 1){
            if (Object.keys(this.schedules[0][0]).length === 0){
                return 0;
            }
        }
        return this.schedules.length;
    }

    reset(){
        this.schedules = this.empty_schedules;
        this.schedule_index = 0;
    }
}