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
    $("#article_table").DataTable({
        responsive: true
    });
    $("#notification_table").DataTable({
        responsive: true
    });

    //Buttons
    //Notifications
    if($('#notification_field').length != 0) {
        validate_notifications();
        $('#notification_field').change(validate_notifications);
    }
    //Admin panel
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
    //Article
    if($('#article_title').length != 0) {
        validate_article();
        $('#article_title').change(validate_article);
    }
    if($('#article_text').length != 0) {
        validate_article();
        $('#article_text').change(validate_article);
    }

    //Formless post
    $(document).ready(function() {
        $(function() {
            $("#delete").on("click",function(e) {
                e.preventDefault(); // cancel the link itself
                $.post(this.href,function(data) {
                    $("#someContainer").html(data);
                });
            });
        });
    });
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
function validate_article(){
    if ($('#article_title').val().length > 0 && $('#article_text').val().length > 0) {
        $("button[type=submit]").prop("disabled", false);
    }
    else {
        $("button[type=submit]").prop("disabled", true);
    }
}