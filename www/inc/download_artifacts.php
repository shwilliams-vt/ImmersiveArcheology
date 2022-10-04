<?php 

$dbServername = "localhost";
$dbUsername = "manager";
$dbPassword = "X6m&T@Evr,[s@,n";
$dbName = "archeology";
$dbTableName = "artifacts";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}

// if (!(isset($_POST['name']) && isset($_POST['email']) && isset($_POST['comment']))) {

//     $isset_name = isset($_POST['name']) ? "true" : "false";
//     $isset_email = isset($_POST['email']) ? "true" : "false";
//     $isset_comment = isset($_POST['comment']) ? "true" : "false";

//     $error_msg = "Some fields are not set: name isset: '{$isset_name}', email isset: '{$isset_email}', comment isset: '{$isset_comment}'";
// }
// else { 
    
    $qry = "SELECT * FROM `{$dbTableName}` ORDER BY id ASC";

    $result = mysqli_query($connection, $qry, MYSQLI_STORE_RESULT);

    // TODO Verification?
    if ($result) {
        header("HTTP/1.1 201");
        $success = true;
        
        foreach ($result as $row) {
            echo "<";
            foreach ($row as $field) {
                echo $field . ",";
            }
        }
    }
    else {
        $error_msg = "Query was rejected by the database";
    }

// }

// check to see if the error message is set, if so display it 
if (isset($error_msg)) 
    echo '<font color="red">Error downloading artifact data: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>