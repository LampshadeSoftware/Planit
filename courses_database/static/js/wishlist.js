class WishList {
    constructor(){
        localStorage.clear();  // use this for testing to clear local storage of any messed up data
        this.wish_list = {};
        this.reloadData();
    }

    addCourse(subject, course_id, title){
        this.wish_list[subject + course_id] = {
            "subject": subject,
            "course_id": course_id,
            "title": title,
            "optional": true
        };
    }

    removeCourse(subject, course_id){
        delete this.wish_list[subject + course_id];
    }

    reloadData(){
        this.wish_list = JSON.parse(localStorage.getItem("wish_list")) || {};
    }

    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.wish_list));
    }

    /**
     * returns the dictionary that we use to store the wish list items
     */
    getData(){
        return this.wish_list;
    }
}