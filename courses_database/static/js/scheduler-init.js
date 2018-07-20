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
    let coursesDataTable = $('#search_courses_table').DataTable({searching: true, dom: 'lrtp', "lengthChange": false});
}