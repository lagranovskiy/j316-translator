(function($){
    $(function(){

        $('.button-collapse').sideNav();

    }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function() {
    $('input#input_text, textarea#textarea1').characterCounter();
    $('select').material_select();
});