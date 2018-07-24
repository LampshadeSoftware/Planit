/**
 * Manages the wish list (addition, deletion, saving to local storage)
 */

// TODO: Wish list should store a list of WishListItems
class WishList {
    constructor(){
        localStorage.clear();  // use this for testing to clear local storage of any messed up data
        this.wish_list = {};
        this.reloadData();
    }

    addCourse(subject, course_id, title){
        this.wish_list[subject + course_id] = new WishListCourse(subject, course_id, title);
    }

    removeCourse(subject, course_id){
        delete this.wish_list[subject + course_id];
    }

    reloadData(){
        let saved_wish_list = JSON.parse(localStorage.getItem("wish_list")) || {};
        for (let key in saved_wish_list) {
            if (saved_wish_list.hasOwnProperty(key)) {
                this.addCourse(this.wish_list[key]["subject"],
                    this.wish_list[key]["course_id"],
                    this.wish_list[key]["title"]);
            }
        }
    }

    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.asDict()));
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

class WishListCourse{
    constructor(subject, course_id, title){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.optional = true;
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