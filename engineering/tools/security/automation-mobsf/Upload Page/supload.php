<?php

// It depends from the server.
$target_dir = '/var/www/tutorial/upload/uploads/';

if(isset($_POST["submit"])){
    
    $tmp_name = $_FILES["sample"]["tmp_name"];
    $name = basename($_FILES["sample"]["name"]);
    if(move_uploaded_file($tmp_name, "$target_dir/$name")){
        $_SESSION['upload_message'] = "Uploaded Successfully";
    } else{
        $_SESSION['error_message'] = "Error While Uploading. Try Again!";
    }
} else{
    unset($_SESSION['upload_message']);
    unset($_SESSION['error_message']);
}
?>