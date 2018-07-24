/**
 * sets up the calendar
 */
function calendarInit(){
    $('#calendar').fullCalendar({
        defaultDate: moment('2018-01-01'),
        weekends: false,
        defaultView: 'agendaWeek',
        columnHeaderFormat: 'dddd',
        minTime: "08:00:00",
        maxTime: "23:59:00",
        height: "auto",
        eventColor: '#29B89B',
        header:false,

        contentHeight: 600,
        allDaySlot: false,

        events: [{}]
    });
}

/**
 * sets up the table that holds all of the courses and allows the user to search for courses
 */
function tablesInit(){
    let coursesDataTable = $('#course_search_table').DataTable({searching: true, dom: 'lrtp', "lengthChange": false});

    // sets up all the course search filters
    $('#subject_input').on( 'keyup', function () {
        filterCourseTable(this, 0);
    });
    $('#course_num_input').on( 'keyup', function () {
        filterCourseTable(this, 1);
    });
    $('#title_input').on( 'keyup', function () {
        filterCourseTable(this, 2);
    });

    function filterCourseTable(element, column) {
        coursesDataTable
            .columns( column )
            .search( element.value )
            .draw();
    }
}

/**
 * sets up the tabs that allow the user to switch between searching for courses and course filtering
 */
function tabsInit(){
    $('#tabs li').on( 'click', function () {
        let tab = $(this).data('tab');  // gets the tab that the user clicked

        $('#tabs li').removeClass('is-active');  // makes all tabs inactive
        $(this).addClass('is-active');  // makes the clicked tab active

        // makes all tab contents inactive
        $('#search_tab').removeClass('is-active');
        $('#filter_tab').removeClass('is-active');

        // makes clicked tab content active
        $("#" + tab + "_tab").addClass('is-active');
    });
}

/**
 * sets up the filters used to narrow down schedules
 */
function filtersInit(){
    // Timer Filter
    let time_slider = document.getElementById('time_slider');
    noUiSlider.create(time_slider, {
        connect: true,
        behaviour: 'tap',
        start: [480, 1020],
        step: 30,
        range: {
            'min': 480,
            'max': 1320
        }
    });

    let start_time = document.getElementById('start_time');
    let end_time = document.getElementById('end_time');

    start_time.addEventListener('change', function(){
        time_slider.noUiSlider.set([this.value, null]);
    });
    end_time.addEventListener('change', function(){
        time_slider.noUiSlider.set([null, this.value]);
    });

    time_slider.noUiSlider.on('update', function( values, handle ) {

        let value = values[handle];

        if ( handle ) { // right handle
            end_time.value = Math.round(value);
        } else {  // left handle
            start_time.value = Math.round(value);
        }
    });
    time_slider.noUiSlider.on('change', function() {
        updateSchedules();
    });


    // Credits Filter
    let credit_slider = document.getElementById('credit_slider');
    noUiSlider.create(credit_slider, {
        connect: true,
        behavior: 'tap',
        start: [12, 18],
        step: 1,
        range: {
            'min': 1,
            'max': 20
        }
    });

    let min_credits = document.getElementById('min_credits');
    let max_credits = document.getElementById('max_credits');

    min_credits.addEventListener('change', function() {
        credit_slider.noUiSlider.set([this.value, null]);
    });
    max_credits.addEventListener('change', function() {
        credit_slider.noUiSlider.set([null, this.value]);
    });

    credit_slider.noUiSlider.on('update', function (values, handle ) {
        let value = values[handle];

        if ( handle ) {
            max_credits.value = Math.round(value);
        } else {
            min_credits.value = Math.round(value);
        }
        //updateSchedules();
    });
    credit_slider.noUiSlider.on('change', function() {
        updateSchedules();
    });

    // Days Off Filter
    $('#days_off').multipleSelect({
        onClick: function(view) {
            updateSchedules();
        },
        onCheckAll: function() {
            updateSchedules();
        },
        onUncheckAll: function() {
            updateSchedules();
        }
    });

    // Attributes Filter
    $('#attributes').multipleSelect({
        filter: true,
        onClick: function(view) {
            updateSchedules();
        },
        onCheckAll: function() {
            updateSchedules();
        },
        onUncheckAll: function() {
            updateSchedules();
        }
    });
}