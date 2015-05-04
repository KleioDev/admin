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
    $("#exhibition_table").DataTable({
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
    jQuery('#edit_admin').validate({
        rules : {
            password : {
                minlength : 6
            },
            repeat : {
                minlength : 6,
                equalTo : "#password"
            }
        }});
    jQuery('#change').validate({
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
    $('#edit_submit').click(function(){
        console.log($('#edit_admin').valid());
    });
    $('#change_submit').click(function(){
        console.log($('#change').valid());
    });

    $("[type=checkbox]").click(function() {
        //Monday
        if(document.getElementById('mon_closed').checked){
            document.getElementById('mon_op').disabled = true;
            document.getElementById('mon_cl').disabled = true;
        }
        else{
            document.getElementById('mon_op').disabled = false;
            document.getElementById('mon_cl').disabled = false;

        }
        //Tuesday
        if(document.getElementById('tue_closed').checked){
            document.getElementById('tue_op').disabled = true;
            document.getElementById('tue_cl').disabled = true;

        }
        else{
            document.getElementById('tue_op').disabled = false;
            document.getElementById('tue_cl').disabled = false;

        }
        //Wednesday
        if(document.getElementById('wed_closed').checked){
            document.getElementById('wed_op').disabled = true;
            document.getElementById('wed_cl').disabled = true;

        }
        else{
            document.getElementById('wed_op').disabled = false;
            document.getElementById('wdd_cl').disabled = false;

        }
        //Thursday
        if(document.getElementById('thu_closed').checked){
            document.getElementById('thu_op').disabled = true;
            document.getElementById('thu_cl').disabled = true;

        }
        else{
            document.getElementById('thu_op').disabled = false;
            document.getElementById('thu_cl').disabled = false;

        }
        //Friday
        if(document.getElementById('fri_closed').checked){
            document.getElementById('fri_op').disabled = true;
            document.getElementById('fri_cl').disabled = true;

        }
        else{
            document.getElementById('fri_op').disabled = false;
            document.getElementById('fri_cl').disabled = false;

        }
        //Saturday
        if(document.getElementById('sat_closed').checked){
            document.getElementById('sat_op').disabled = true;
            document.getElementById('sat_cl').disabled = true;

        }
        else{
            document.getElementById('sat_op').disabled = false;
            document.getElementById('sat_cl').disabled = false;

        }
        //Sunday
        if(document.getElementById('sun_closed').checked){
            document.getElementById('sun_op').disabled = true;
            document.getElementById('sun_cl').disabled = true;

        }
        else{
            document.getElementById('sun_op').disabled = false;
            document.getElementById('sun_cl').disabled = false;

        }

    });



});
