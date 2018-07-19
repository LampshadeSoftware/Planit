class WishList {
    constructor(){
        this.wishList = {};
        this.reloadData();
    }

    addClass(subject, courseId, title){
        this.wishList[subject + courseId] = {
            "subject": subject,
            "courseId": courseId,
            "title": title,
            "optional": true
        };
    }

    removeClass(subject, courseId){
        delete this.wishList[subject + courseId];
    }

    reloadData(){
        this.wishList = JSON.parse(localStorage.getItem("wishList")) || {};
    }

    saveData(){
        localStorage.setItem("wishList", JSON.stringify(this.wishList));
    }
}