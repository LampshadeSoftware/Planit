// This file contains general functions used for the whole website

// global variables
let scheduler = new Scheduler();
let wish_list = new WishList(scheduler);  // stores the classes that the user is interested in
let displayed_course = new DisplayedCourse();  // the course that was most recently clicked

/**
 * Called when the web page is first loaded
 */
$(document).ready( function () {
    // sets up everything
    tableInit();
    calendarInit();
    tabsInit();
    filtersInit();
    tooltipInit();

    updateSchedules(false);
    $(".loading_screen").hide();  // removes the loading screen from the view
} );

/**
 * Retrieves available schedules from the database given the current wish list items.
 * Called on page load and any time a filter or the wish list is updated
 * @param {boolean} is_async: if false, this function won't run in the background
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

    // gets the schedules data in the background (or not in the background if async is false)
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
            let schedules_info = data["schedules_info"];  // contains info about the courses that applies to all schedules
            let raw_schedules = data["schedules"];
            scheduler.parseRawSchedules(raw_schedules, schedules_info);
            updateCalendar();
            displayed_course.updateUI();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus + ". Error" + errorThrown);
        }
    });
}

// START OF CALENDAR FUNCTIONS
/**
 * Updates the visuals of the calendar
 * Called from updateSchedules after we've gotten the most up-to-date schedules from the server
 * or when the user clicks the right/left buttons on top of the calendar
 */
function updateCalendar() {


    // updates the schedule index number string
    if (scheduler.numberOfSchedules() === 0){
        //document.getElementById("schedule_index").innerHTML = "0/0";
        $('#schedule_arrows').css("visibility", "hidden");
        $('#calendar').hide();
        $('#empty_calendar').show();
        $('#empty_calendar_text').show();
    } else {
        $('#schedule_arrows').css("visibility", "visible");
        $('#calendar').show();
        $('#empty_calendar').hide();
        document.getElementById("schedule_index").innerHTML = (scheduler.schedule_index + 1).toString() + "/"
            + scheduler.numberOfSchedules().toString();
    }

    let calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', scheduler.getCurrentSchedule());
    calendar.fullCalendar('rerenderEvents');

    // Updates the wish list button visuals
    wish_list.updateButtons();
}

/**
 * Called when the user clicks the right button on the top of the calendar.
 * Updates the calendar to show the next schedule
 */
function cycleRight(){
    scheduler.cycleRight();
    updateCalendar();
}

/**
 * Called when the user clicks the left button on the top of the calendar.
 * Updates the calendar to show the previous schedule
 */
function cycleLeft(){
    scheduler.cycleLeft();
    updateCalendar();
}
// END OF CALENDAR FUNCTIONS

// START OF WISH LIST FUNCTIONS
/**
 * Adds the specified course to the wish list
 * Contains some additional logic that depends on the value of 'force'
 * @param {boolean} force: if false, it will remove that class from the wish list if it's already in the wish list
 */
function addCourseToWishList(subject, course_id, title, force){
    if (force) {  // used when we always want to add the class (even if it's already in our wish list)
        wish_list.addCourse(subject, course_id, title, true);
    } else {
        if (!wish_list.contains(subject + course_id)) {
            wish_list.addCourse(subject, course_id, title, true);
        } else {
            removeCourseFromWishList(subject, course_id, title);
            return;
        }
    }
    toggleAddButton(subject, course_id);
    updateSchedules();
}

/**
 * Removes the specified course from the wish list
 */
function removeCourseFromWishList(subject, course_id, title){
    wish_list.removeCourse(subject, course_id, title);
    toggleAddButton(subject, course_id);
    updateSchedules();
}
// END OF WISH LIST FUNCTIONS
