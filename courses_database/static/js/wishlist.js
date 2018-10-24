// Manages the wish list (addition, deletion, saving to local storage)
class WishList {
    constructor(scheduler){
        // localStorage.clear();  // use this for testing to clear local storage of any messed up data
        this.wish_list = {};
        this.reloadData();
        this.scheduler = scheduler;  // the instance variable of the schedules associated with this wish list
    }

    /**
     * @returns {WishListItem} given the key (subject + course_id)
     */
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
     * gets the saved wish list from local storage and populates the instance variable wish_list from that dictionary
     */
    reloadData(){
        let saved_wish_list = JSON.parse(localStorage.getItem("wish_list")) || {};
        for (let key in saved_wish_list) {
            if (saved_wish_list.hasOwnProperty(key)) {
                this.addCourse(saved_wish_list[key]["subject"],
                    saved_wish_list[key]["course_id"],
                    saved_wish_list[key]["title"],
                    saved_wish_list[key]["optional"]);

                toggleAddButton(saved_wish_list[key]["subject"], saved_wish_list[key]["course_id"]);
            }
        }
    }

    /**
     * saves the wish list to local storage as a JSON so that it can loaded again upon a page refresh
     */
    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.asDict()));
    }

    /**
     * Updates the wish list buttons section in HTML with the current courses in the wish list
     */
    updateButtons(){
         // Checks if the wish list is empty and then hides and shows the appropriate sections.
         // Adds wish list buttons if applicable
        if (Object.keys(this.wish_list).length === 0){
            $('#empty_wish_list').show();
            $('#wish_list').hide();
        } else {
            $("#wish_list").html("");  // clears all of the buttons from before
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

    /**
     * @returns a dictionary representation of the wish list
     */
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

    /**
     * @param key: subject + course_id
     * @returns {boolean}: true if the key is in the wish list, false otherwise
     */
    contains(key){
        return (key in this.wish_list);
    }
}

// TODO: Consider combining this with the DisplayedCourse class
// Represents a wish list item (which, for this web site, is always a course)
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

    /**
     * Creates a button for this course and adds it to the wish list section in HTML
     * @param color: the color of the button
     * @param text_color: the text color of the button
     * @param in_schedule {boolean}: whether of not this course is in the current schedule being displayed
     */
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
        button.ondblclick = () => { removeCourseFromWishList(this.subject, this.course_id, this.title)};
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