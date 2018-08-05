/**
 * General functions for the whole website
 */

// global variables
let scheduler = new Scheduler();
let wish_list = new WishList(scheduler);  // stores the classes that the user is interested in
let displayed_course = new Course();  // the course that was most recently clicked

$(document).ready( function () {
    // sets up everything
    tableInit();
    calendarInit();
    tabsInit();
    filtersInit();

    updateSchedules(false);
    document.getElementById("course_search_table").style.display = "";  // calendar now displays
} );

/**
 * Retrieves available schedules from the database given the current wish list items
 * @param {boolean} is_async - if false, this function won't run in the background
 */
function updateSchedules(is_async) {
    if (typeof(is_async)==='undefined') is_async = true;  // default value for is_async

    let filters = $('#wish_list_filters').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
    filters["days_off"] = String($("#days_off").multipleSelect("getSelects"));
    filters["attr"] = String($("#attributes").multipleSelect("getSelects"));
    let schedule_restrictions = {
        "wish_list": wish_list.asDict(),
        "filters": filters
    };

    // Ajax gets the schedules data in the background (or not in the background if async is false)
    $.ajax({
        url: get_schedules_url,
        method: 'POST',
        data: {
            "schedule_restrictions": JSON.stringify(schedule_restrictions),
            "csrfmiddlewaretoken": csrf_token
        },
        dataType: 'json',
        async: is_async,
        success: function (data) {
            let schedules_info = data["schedules_info"];  // contains info about the courses, applies to all schedules
            let raw_schedules = data["schedules"];
            scheduler.parseRawSchedules(raw_schedules, schedules_info);
            updateCalendar();
            displayed_course.updateUI();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {  // something went wrong
            alert("Status: " + textStatus + ". Error" + errorThrown);
        }
    });
}

// Start of calendar functions
function updateCalendar() {
    let calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', scheduler.getCurrentSchedule());
    calendar.fullCalendar('rerenderEvents');

    // updates the schedule index title
    if (scheduler.numberOfSchedules() === 0){
        document.getElementById("schedule_index").innerHTML = "0/0";
    } else {
        document.getElementById("schedule_index").innerHTML = (scheduler.schedule_index + 1).toString() + "/"
            + scheduler.numberOfSchedules().toString();
    }

    // updates the wish list button visuals
    wish_list.updateButtons();
}

function cycleLeft(){
    scheduler.cycleLeft();
    updateCalendar();
}

function cycleRight(){
    scheduler.cycleRight();
    updateCalendar();
}
// End of calendar functions

// Start of wish list functions
function addToWishList(subject, course_id, title, force){
    if (force) {  // used when we always want to add the class (even if it's already in our wish list)
        wish_list.addCourse(subject, course_id, title, true);
    } else {
        if (!wish_list.contains(subject + course_id)) {
            wish_list.addCourse(subject, course_id, title, true);
        } else {
            removeFromWishList(subject, course_id, title);
            return;
        }
    }
    updateSchedules();
}

function removeFromWishList(subject, course_id, title){
    wish_list.removeCourse(subject, course_id, title);
    updateSchedules();
}
// End of wish list functions
