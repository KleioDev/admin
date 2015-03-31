/**
 * Created by Pocolip on 3/31/15.
 */
$(document).ready(function() {
    //Data tables
    $("#feedback_table").DataTable({
        responsive: true
    });
    $("#object_table").DataTable({
        responsive: true
    });
    $("#administrator_table").DataTable({
        responsive: true
    });
    //Buttons
    if($('#notification_field').length != 0) {
        validate_notifications();
        $('#notification_field').change(validate_notifications);
    }
    if($('#admin_first').length != 0) {
        validate_edit_admin();
        $('#admin_first').change(validate_edit_admin);

    }

    if($('#admin_last').length != 0) {
        validate_edit_admin();
        $('#admin_last').change(validate_edit_admin);

    }
    if($('#admin_email').length != 0) {
        validate_edit_admin();
        $('#admin_email').change(validate_edit_admin);

    }
});

function validate_notifications(){
    if ($('#notification_field').val().length > 0) {
        $("button[type=submit]").prop("disabled", false);
    }
    else {
        $("button[type=submit]").prop("disabled", true);
    }
}

function validate_edit_admin(){
    if ($('#admin_first').val().length > 0 || $('#admin_last').val().length > 0 || $('#admin_email').val().length > 0) {
        $("button[type=submit]").prop("disabled", false);
    }
    else {
        $("button[type=submit]").prop("disabled", true);
    }
}