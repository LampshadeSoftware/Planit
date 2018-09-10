// For the calendar that displays all of the schedules
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

// For the table that holds all of the courses and allows the user to search for courses
function tableInit(){
    let course_data_table = $('#course_search_table').DataTable({
        deferRender:    true,  // only creates nodes for items as needed
        scrollY:        200,  // the height of the scroll view
        scrollCollapse: true,  // dynamically scale the height if there are too few items
        scroller:       true,  // only renders elements that are in view

        // Commented out below is the code for if we decide to populate the table using ajax
        /*"ajax": {
            "processing": true,
            "url": get_sections_url,
            "dataSrc": ""
        },*/

        "columns": [
            {
                "orderable":      false,
                "data":           "button"
            },
            { "data": "subject" },
            { "data": "course_id" },
            { "data": "title" },
        ],
        "order": [[1, 'asc']],
        "dom": 'lrt'
    });

    /**
     * Adds callbacks to all of the course search filters (the numbers are the columns)
     * Called whenever the user types a letter
     */
    $('#subject_input').on( 'keyup', function () {
        filterCourseTable(this, 1);
    });
    $('#course_num_input').on( 'keyup', function () {
        filterCourseTable(this, 2);
    });
    $('#title_input').on( 'keyup', function () {
        filterCourseTable(this, 3);
    });

    // Filters the table by looking for an element in the specified column
    function filterCourseTable(element, column) {
        course_data_table
            .columns( column )
            .search( element.value )
            .draw();
    }

    let search_table_body = $('#course_search_table tbody');
    // Double click: adds the clicked course to the wish list
    search_table_body.on('dblclick', 'tr', function () {
        let data = course_data_table.row( this ).data();
        addCourseToWishList(data["subject"], data["course_id"], data["title"], false);
    } );
    // Single click: displays the course information in the 'displayed_course' section
    search_table_body.on('click', 'tr', function () {
        let data = course_data_table.row( this ).data();
        displayed_course.change(data["subject"], data["course_id"], data["title"]);
    } );
}

// For the tabs that allow the user to switch between course search and filtering
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

// For the filters used to narrow down schedules
function filtersInit(){
    // Time Filter
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

    let start_time_handle = document.getElementById('start_time');
    let end_time_handle = document.getElementById('end_time');

    start_time_handle.addEventListener('change', function(){
        time_slider.noUiSlider.set([this.value, null]);
    }, {passive: true});
    end_time_handle.addEventListener('change', function(){
        time_slider.noUiSlider.set([null, this.value]);
    }, {passive: true});

    time_slider.noUiSlider.on('update', function( values, handle ) {
        let value = values[handle];

        if ( handle ) { // right handle
            end_time_handle.value = Math.round(value);
        } else {  // left handle
            start_time_handle.value = Math.round(value);
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
        start: [3, 18],
        step: 1,
        range: {
            'min': 1,
            'max': 20
        }
    });

    let min_credits_handle = document.getElementById('min_credits');
    let max_credits_handle = document.getElementById('max_credits');

    min_credits_handle.addEventListener('change', function() {
        credit_slider.noUiSlider.set([this.value, null]);
    }, {passive: true});
    max_credits_handle.addEventListener('change', function() {
        credit_slider.noUiSlider.set([null, this.value]);
    }, {passive: true});

    credit_slider.noUiSlider.on('update', function (values, handle ) {
        let value = values[handle];

        if ( handle ) {
            max_credits_handle.value = Math.round(value);
        } else {
            min_credits_handle.value = Math.round(value);
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

// For the tooltips that display when the user hovers over an element
function tooltipInit(){
    tippy('#displayed_lock_icon');
}