// global variables
let wish_list = new WishList();  // stores the classes that the user is interested in
let scheduler = new Scheduler();

$(document).ready( function () {
    // sets up everything
    tablesInit();
    calendarInit();
} );

/**
 * Retrieves available schedules from the database given the current wish list items
 * @param {boolean} is_async - if false, this function won't run in the background
 */
function updateSchedules(is_async) {
    if (typeof(is_async)==='undefined') is_async = true;  // default value for is_async

    // TODO: when schedule filters are implemented, update this line to get those filters
    let filters = {};
    let courses_info = {
        "wish_list": wish_list.getData(),
        "filters": filters
    };

    // Ajax gets the schedules data in the background (or not in the background if async is false)
    $.ajax({
        url: get_schedules_url,
        method: 'POST',
        data: {
            "courses_info": JSON.stringify(courses_info),
            "csrfmiddlewaretoken": csrf_token
        },
        dataType: 'json',
        async: is_async,
        success: function (data) {
            // TODO: move these into scheduler.js
            creditCounts = [];
            coursesInfo = data["coursesInfo"];

            let raw_schedules = data["schedules"];
            scheduler.parseRawSchedules(raw_schedules);
            updateCalendar();
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
function addToWishList(subject, course_id, title){
    wish_list.addCourse(subject, course_id, title);
    updateSchedules();
}

function removeFromWishList(subject, course_id, title){
    wish_list.removeCourse(subject, course_id, title);
    updateSchedules();
}
// End of wish list functions