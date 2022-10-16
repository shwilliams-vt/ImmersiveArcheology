<?php 

$dbServername = "localhost";
$dbUsername = "manager";
$dbPassword = "X6m&T@Evr,[s@,n";
$dbName = "archeology";
$dbTableName = "comments";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}
else if (!(isset($_POST['thread_id']) && isset($_POST['name']) && isset($_POST['email']) && isset($_POST['comment']))) {
    $error_msg = "Some required fields are empty (1)";
}
else {

    $thread_id = htmlspecialchars($_POST['thread_id']); 
    $name = htmlspecialchars($_POST['name']); 
    $email = htmlspecialchars($_POST['email']);
    $comment =  htmlspecialchars($_POST['comment']);
    
    if ($name == "" || $email == "" || $comment == "") {
        $error_msg = "Some required fields are empty (2)";
    }
    else {

        // Change date time to date
        $date = date('Y-m-d H:i:s');
        
        $qry = "INSERT INTO `{$dbTableName}` (`id`, `thread_id`, `name`, `email`, `comment`, `date`) 
            VALUES (NULL, '{$thread_id}', '{$name}', '{$email}', '{$comment}', '{$date}');";

        $result = mysqli_query($connection, $qry);

        // TODO Verification?
        if ($result) {
            header("HTTP/1.1 201");
            $success = true;
        }
        else {
            $error_msg = "Query was rejected by the database" . mysqli_error($connection);
        }
        
    }
}

if (isset($success) && $success == true){ 
    echo '<font color="green">Success.</font>'; 
} 
// check to see if the error message is set, if so display it 
else if (isset($error_msg)) 
    echo '<font color="red">Error: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>