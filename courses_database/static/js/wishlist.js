class WishList {
    constructor(){
        this.wish_list = {};
        this.reloadData();
    }

    addClass(subject, course_id, title){
        this.wish_list[subject + course_id] = {
            "subject": subject,
            "course_id": course_id,
            "title": title,
            "optional": true
        };
    }

    removeClass(subject, course_id){
        delete this.wish_list[subject + course_id];
    }

    reloadData(){
        this.wish_list = JSON.parse(localStorage.getItem("wish_list")) || {};
    }

    saveData(){
        localStorage.setItem("wish_list", JSON.stringify(this.wish_list));
    }
}