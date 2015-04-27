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



});
