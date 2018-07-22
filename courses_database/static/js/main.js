// global variables
var wish_list = new WishList();  // stores the classes that the user is interested in
var scheduler = new Scheduler();

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
    var courses_info = {
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

function updateCalendar() {
    let calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', scheduler.getCurrentSchedule());
    calendar.fullCalendar('rerenderEvents');
}

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
