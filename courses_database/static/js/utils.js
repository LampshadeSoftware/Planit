/**
 * Represents a course.
 * Used to craft the course description when a user clicks on an item in the table or wish list item
 */
class Course {
    constructor(){
        this.subject = null;
        this.course_id = null;
        this.title = null;
        this.description = null;
    }

    change(subject, course_id, title){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.description = courses_info[this.subject + this.course_id]["description"];
        this.credits = courses_info[this.subject + this.course_id]["credits"];
        this.crn = courses_info[this.subject + this.course_id]["crn"];
        this.instructor = courses_info[this.subject + this.course_id]["instructor"];
        this.updateUI();
    }

    updateUI() {
        if (this.subject !== null) {
            $("#displayed_content").show();
            $("#displayed_title").html("[" + this.credits + "] " + this.subject + " " + this.course_id + " " + this.title);
            $("#displayed_crn").html(this.crn);
            $("#displayed_instructor").html(this.instructor);
            $("#displayed_description").html(this.description);
            let button_text = "Add Course";
            if (wish_list.contains(this.subject + this.course_id)){
                button_text = "Remove Course"
            }
            $("#displayed_button").html(button_text)
        } else {
            $("#displayed_content").hide();
        }
    }

    addToWishList(){
        addToWishList(this.subject, this.course_id, this.title)
    }




}