<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $subject = $_POST["subject"];
    $message = $_POST["text"];


    file_put_contents("form_data.txt", "Name: $name\nEmail: $email\nSubject: $subject\nMessage: $message\n", FILE_APPEND);

   
    mail("raiaditya2592@gmail.com", $subject, $message, "From: $email");
    
    

    
    header("Location: thank-you.html");
    exit();
}
?>
