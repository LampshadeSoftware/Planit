/**
 * Represents a course.
 * Used to craft the course description when a user clicks on an item in the table or wish list item
 */
class DisplayedCourse {
    constructor(){
        this.subject = null;
        this.course_id = null;
        this.title = null;
        this.description = null;
        this.num_sections = null;
    }

    /**
     * Updates instance variables and gets the description and other info from the courses_info dict
     */
    change(subject, course_id, title){
        this.subject = subject;
        this.course_id = course_id;
        this.title = title;
        this.description = courses_info[this.subject + this.course_id]["description"];
        this.credits = courses_info[this.subject + this.course_id]["credits"];
        this.num_sections = courses_info[this.subject + this.course_id]["num_sections"];
        this.instructor = courses_info[this.subject + this.course_id]["instructor"];
        this.updateUI();
    }

    /**
     * Updates the UI of the displayed_course section in HTML
     */
    updateUI() {
        if (this.subject !== null) {
            let displayed_optional_holder = $("#displayed_optional_holder");
            $("#displayed_content").show();

            // all text-based stuff
            $("#displayed_title").html("[" + this.credits + "] " + this.subject + " " + this.course_id + " " + this.title);
            $("#num_sections").html(this.num_sections);
            $("#displayed_instructor").html(this.instructor);
            $("#displayed_description").html(this.description);

            // 'add course' and 'required' buttons
            let button_text = "Add Course";
            let checked = false;
            if (wish_list.contains(this.subject + this.course_id)){
                button_text = "Remove Course";

                displayed_optional_holder.show();
                checked = !wish_list.getItem(this.subject, this.course_id)["optional"];
                document.getElementById("displayed_optional_checkbox").onclick = () => {
                    wish_list.getItem(this.subject, this.course_id).setOptional(checked);
                    updateSchedules(true);
                };
            } else {
                displayed_optional_holder.hide();
            }
            $("#displayed_button").html(button_text);
            $("#displayed_optional_checkbox").prop('checked', checked);
        } else {
            $("#displayed_content").hide();
        }
    }

    /**
     * Adds itself to the wish list
     */
    addToWishList(){
        // this function is defined in main.js
        addCourseToWishList(this.subject, this.course_id, this.title)
    }
}

/**
 * Toggles the appearance of the add button in the table view
 * from a green plus to a red minus
 * @param subject
 * @param course_id
 */
function toggleAddButton(subject, course_id){
    let buttonId = '#addButton-' + subject + course_id;
    $(buttonId).toggleClass('fa-plus-circle fa-minus-circle');
    $(buttonId).toggleClass('red');
}
