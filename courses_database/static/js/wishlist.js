/**
 * Manages the wish list (addition, deletion, saving to local storage)
 */

// TODO: Wish list should store a list of WishListItems
class WishList {
    constructor(scheduler){
        // localStorage.clear();  // use this for testing to clear local storage of any messed up data
        this.wish_list = {};
        this.reloadData();
        this.scheduler = scheduler;  // the instance variable of the schedules associated with this wish list
    }

    addCourse(subject, course_id, title){
        if (!((subject + course_id) in this.wish_list)) {
            this.wish_list[subject + course_id] = new WishListItem(subject, course_id, title);
        }
    }

    removeCourse(subject, course_id){
        delete this.wish_list[subject + course_id];
    }

    /**
     * gets the wish list from local storage and creates new objects from that dictionary
     */
    reloadData(){
        let saved_wish_list = JSON.parse(localStorage.getItem("wish_list")) || {};
        for (let key in saved_wish_list) {
            if (saved_wish_list.hasOwnProperty(key)) {
                this.addCourse(saved_wish_list[key]["subject"],
                    saved_wish_list[key]["course_id"],
                    saved_wish_list[key]["title"]);
            }
        }
    }

    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.asDict()));
    }

    // TODO: move this into scheduler.js
    updateButtons(){
        console.log(scheduler.courses_info);
        let html = "";
        for (let key in this.wish_list){
            if (this.wish_list.hasOwnProperty(key)) {
                let color = "#ffffff";
                if (key in this.scheduler.courses_info){
                    color = this.scheduler.courses_info[key]["color"]
                }
                html += this.wish_list[key].createButton(color);
            }
        }
        $("#wish_list").html(html);
    }

    asDict(){
        let savable_wish_list = {};
        for (let key in this.wish_list) {
            // check if the property/key is defined in the object itself, not in parent
            if (this.wish_list.hasOwnProperty(key)) {
                savable_wish_list[key] = this.wish_list[key].asDict();
            }
        }
        return savable_wish_list;
    }
}

class WishListItem{
    constructor(subject, course_id, title){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.optional = true;
    }

    createButton(color) {
        return `<button class="wish_list_item" style="background-color: ${color}">${this.subject + this.course_id}</button>`
    }

    asDict() {
        return {
            "subject": this.subject,
            "course_id": this.course_id,
            "title": this.title,
            "optional": true
        };
    }
}