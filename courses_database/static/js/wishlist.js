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

    addCourse(subject, course_id, title){
        this.wish_list[subject + course_id] = new WishListItem(subject, course_id, title);
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

    updateButtons(){
        if (Object.keys(this.wish_list).length === 0){
            $('#empty_wish_list').addClass('is-active');
            $('#wish_list').removeClass('is-active');
        } else {
            $("#wish_list").html("");  // clears all of the buttons
            for (let key in this.wish_list){
                if (this.wish_list.hasOwnProperty(key)) {
                    let color = "#BBBBBB";
                    let font_color = "#333333";
                    if (this.scheduler.courses_info[key]["color"]){
                        color = this.scheduler.courses_info[key]["color"];
                        font_color = "#ffffff";
                    }
                    this.wish_list[key].createButton(color, font_color);
                }
            }
            $('#empty_wish_list').removeClass('is-active');
            $('#wish_list').addClass('is-active');
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

class WishListItem{
    constructor(subject, course_id, title){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.optional = true;
    }

    createButton(color, text_color) {
        let button = document.createElement("button");
        let button_text = document.createTextNode(this.subject + this.course_id);
        button.appendChild(button_text);
        button.style.backgroundColor = color;
        button.style.color = text_color;
        button.classList.add("wish-list-item");
        button.onclick = () => {  };
        button.ondblclick = () => { removeFromWishList(this.subject, this.course_id, this.title)};
        document.getElementById("wish_list").appendChild(button);
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