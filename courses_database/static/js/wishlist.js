/**
 * Manages the wish list (addition, deletion, saving to local storage)
 */
class WishList {
    constructor(scheduler){
        // localStorage.clear();  // use this for testing to clear local storage of any messed up data
        this.wish_list = {};
        this.reloadData();
        this.scheduler = scheduler;  // the instance variable of the schedules associated with this wish list
    }

    getItem(subject, course_id) {

        return this.wish_list[subject + course_id];
    }

    addCourse(subject, course_id, title, optional) {
        this.wish_list[subject + course_id] = new WishListItem(subject, course_id, title, optional);
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
                    saved_wish_list[key]["title"],
                    saved_wish_list[key]["optional"]);
            }
        }
    }

    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.asDict()));
    }

    updateButtons(){
        if (Object.keys(this.wish_list).length === 0){
            $('#empty_wish_list').show();
            $('#wish_list').hide();
        } else {
            $("#wish_list").html("");  // clears all of the buttons
            for (let key in this.wish_list){
                if (this.wish_list.hasOwnProperty(key)) {
                    let color = "#BBBBBB";
                    let font_color = "#333333";
                    if (this.scheduler.schedules_info[key]["color"]){
                        color = this.scheduler.schedules_info[key]["color"];
                        font_color = "#ffffff";
                    }
                    this.wish_list[key].createButton(color, font_color);
                }
            }
            $('#empty_wish_list').hide();
            $('#wish_list').show();
            tippy('.wish_list_item', {theme: 'light'});  //  adds tooltips to all of the wish list items
        }
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

    contains(key){
        return (key in this.wish_list);
    }
}

/**
 * Represents a wish list item which is always a course
 */
class WishListItem{
    constructor(subject, course_id, title, optional){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.optional = optional;  // false if the course MUST be in the schedule, true if it doesn't matter
    }

    setOptional(val){
        this.optional = val;
    }

    createButton(color, text_color, in_schedule) {
        let button = document.createElement("button");
        let button_text = document.createTextNode(this.subject + this.course_id);
        let button_required = document.createElement("i");
        if (!this.optional) {
            button_required.className = "fa fa-lock";
            button_required.style.paddingRight = "3px";
        }
        button.appendChild(button_required);
        button.appendChild(button_text);
        button.title = this.title;
        button.style.backgroundColor = color;
        button.style.color = text_color;
        button.classList.add("wish_list_item");
        if (in_schedule) { button.classList.add("in_schedule"); }
        button.onclick = () => { displayed_course.change(this.subject, this.course_id, this.title) };
        button.ondblclick = () => { globalRemoveFromWishList(this.subject, this.course_id, this.title)};
        document.getElementById("wish_list").appendChild(button);
    }

    asDict() {
        return {
            "subject": this.subject,
            "course_id": this.course_id,
            "title": this.title,
            "optional": this.optional
        };
    }
}