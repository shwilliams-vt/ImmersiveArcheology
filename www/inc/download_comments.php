<?php 

include($_SERVER['DOCUMENT_ROOT']."/inc/dbinfo.php");
$dbTableName = "comments";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}

if (!isset($_GET['thread_id'])) {
    $error_msg = "Invalid thread ID";
}
else { 

    $thread_id = htmlspecialchars($_GET['thread_id']);
    
    $qry = "SELECT * FROM `{$dbTableName}` WHERE `thread_id`='{$thread_id}' ORDER BY `date` DESC";

    $result = mysqli_query($connection, $qry, MYSQLI_STORE_RESULT);

    // TODO Verification?
    if ($result) {
        header("HTTP/1.1 201");
        $success = true;

        $array = array();

        while($row = mysqli_fetch_assoc($result)) {
            $array[] = $row;
        }

        echo json_encode($array);

    }
    else {
        $error_msg = "Query was rejected by the database: " . mysqli_error($connection);
    }

}

// check to see if the error message is set, if so display it 
if (isset($error_msg)) 
    echo '<font color="red">Error downloading comments: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>