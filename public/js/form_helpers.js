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
    //Admin panel
    //if($('#password').length != 0) {
    //    validate();
    //    $('#password').change(validate);
    //}
    //if($('#repeat').length != 0) {
    //    validate();
    //    $('#repeat').change(validate);
    //}
    jQuery('#new_admin').validate({
        rules : {
            password : {
                minlength : 6
            },
            repeat : {
                minlength : 6,
                equalTo : "#password"
            }
        }});
    $('#admin_submit').click(function(){
        console.log($('#new_admin').valid());
    });
    //if($('#admin_last').length != 0) {
    //    validate_edit_admin();
    //    $('#admin_last').change(validate_edit_admin);
    //}
    //if($('#admin_email').length != 0) {
    //    validate_edit_admin();
    //    $('#admin_email').change(validate_edit_admin);
    //}
    //Article
    //if($('#article_title').length != 0) {
    //    validate_article();
    //    $('#article_title').change(validate_article);
    //}
    //if($('#article_text').length != 0) {
    //    validate_article();
    //    $('#article_text').change(validate_article);
    //}


});
//
//function validate(){
//    if ($("#password") == $("#repeat")) {
//        $("button[type=submit]").prop("disabled", false);
//    }
//    else {
//        $("button[type=submit]").prop("disabled", true);
//    }
//}