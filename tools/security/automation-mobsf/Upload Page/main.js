$(document).ready(function(){
    $('#file-upload').change(function (){
        var selectedfile = $('#file-upload')[0].files[0].name;
        if ( selectedfile.length > 28 ){
            selectedfile = selectedfile.substr(0, 28)
            selectedfile = selectedfile.concat("...")
        }
        $('form p').text(selectedfile);
    });
});