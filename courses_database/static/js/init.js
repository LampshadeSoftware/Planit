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