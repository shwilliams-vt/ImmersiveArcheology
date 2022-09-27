<?php 

$dbServername = "localhost";
$dbUsername = "manager";
$dbPassword = "X6m&T@Evr,[s@,n";
$dbName = "archeology";
$dbTableName = "test_table";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}
else if (!(isset($_POST['name']) && isset($_POST['email']) && isset($_POST['comment']))) {

    $isset_name = isset($_POST['name']) ? "true" : "false";
    $isset_email = isset($_POST['email']) ? "true" : "false";
    $isset_comment = isset($_POST['comment']) ? "true" : "false";

    $error_msg = "Some fields are not set: name isset: '{$isset_name}', email isset: '{$isset_email}', comment isset: '{$isset_comment}'";
}
else {

    $id = NULL;
    $name = htmlspecialchars($_POST['name']); 
    $email = htmlspecialchars($_POST['email']); 
    $comment = htmlspecialchars($_POST['comment']); 
    
    if ($name == "" || $email == "" || $comment == "") {
        $error_msg = "Some required fields are empty";
    }

    else {
    
        $qry = "INSERT INTO `{$dbTableName}` (`id`, `name`, `email`, `comment`) 
            VALUES (NULL, '{$name}', '{$email}', '{$comment}');";


        $result = mysqli_query($connection, $qry);

        // TODO Verification?
        if ($result) {
            header("HTTP/1.1 201");
            $success = true;
        }
        else {
            $error_msg = "Query was rejected by the database";
        }
    }
}

if (isset($success) && $success == true){ 
    echo '<font color="green">Successfully uploaded artifact data.</font>'; 
} 
// check to see if the error message is set, if so display it 
else if (isset($error_msg)) 
    echo '<font color="red">Error uploading artifact data: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>