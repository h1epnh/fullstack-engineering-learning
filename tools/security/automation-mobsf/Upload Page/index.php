<?php

session_start();
include "supload.php";

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automation-MobSF</title>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>

    <footer id="sticky-footer" class="py-1 bg-dark text-light">
        <div class="container text-center">
            <h2>Automation-MobSF</h2>
        </div>
    </footer>
    
    <div class="alert alert-light p-1 text-primary" role="alert">
        <?php
            if ( isset($_SESSION['upload_message']) ){
                $uploaded = $_SESSION['upload_message'];
                $upload_msg = $uploaded . ". The " . $name . " will get analyzed shortly!";
                echo "$upload_msg";
            } elseif( isset($_SESSION['error_message']) ){
                $error = $_SESSION['error_message'];
                echo "$error";
            }
        ?>
    </div>

    <form action="" method="POST" enctype="multipart/form-data">
            <input type="file" name="sample" id="file-upload">
            <h4>Upload & Analyze Sample</h4>
            <p>Drag your file here or click in this area.</p>
            <button type="submit" name="submit" id="upload-btn">UPLOAD</button>
    </form>

    <div style="position: relative">
        <p id="info"> BACHELOR THESIS - ZACHARIAS GEORGOPOULOS - UNIVERSITY OF PATRAS</p>
    </div>

    <script src="./main.js"></script>
</body>
</html>