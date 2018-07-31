class Modal {
    static present(subject, course_id, title) {
        // TODO: update all the card information
        $('#course_info_modal').addClass("is-active");
    }

    static close() {
        $('#course_info_modal').removeClass("is-active");
    }
}