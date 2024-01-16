<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data to prevent potential security issues
    $name = htmlspecialchars($_POST["name"]);
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars($_POST["subject"]);
    $message = htmlspecialchars($_POST["text"]);

    // Validate email address
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Handle invalid email address (you might want to redirect back to the form with an error message)
        echo "Invalid email address";
        exit();
    }

    // Append form data to a file in the "data" directory (consider using a more secure method or a database)
    $filePath = "data/form_data.txt";
    file_put_contents($filePath, "Name: $name\nEmail: $email\nSubject: $subject\nMessage: $message\n", FILE_APPEND);

    // Send email
    $to = "raiaditya2592@gmail.com";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        // Email sent successfully
        header("Location: thank-you.html");
        exit();
    } else {
        // Handle email sending failure (you might want to redirect back to the form with an error message)
        echo "Failed to send email";
        exit();
    }
}
?>
