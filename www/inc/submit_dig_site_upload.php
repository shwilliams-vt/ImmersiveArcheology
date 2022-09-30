<?php 

$dbServername = "localhost";
$dbUsername = "manager";
$dbPassword = "X6m&T@Evr,[s@,n";
$dbName = "archeology";
$dbTableName = "dig_sites";

$uploadDir = "gltf/artifacts/";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}
else if (!(isset($_POST['id']) && isset($_POST['title']) && isset($_POST['description']) && isset($_POST['model_url']) && isset($_POST['date_started']) && isset($_POST['date_started']))) {
    $error_msg = "Some required fields are empty (1)";
}
else {

    $valid_id = is_numeric(htmlspecialchars($_POST['id']));
    $id = intval(htmlspecialchars($_POST['id']));
    $title = htmlspecialchars($_POST['title']); 
    $description = htmlspecialchars($_POST['description']);
    $model_url = htmlspecialchars($_POST['model_url']); 
    $date_started = strtotime(htmlspecialchars($_POST['date_started']));
    $date_ended =  strtotime(htmlspecialchars($_POST['date_ended']));
    
    if ($title == "" || $description == "" || $model_url == "") {
        $error_msg = "Some required fields are empty (2)";
    }
    else if (!$valid_id) {
        $error_msg = "ID is not numeric";
    }
    else if (!$date_started || !$date_ended) {
        $error_msg = "Invalid date";
    }
    else if (!in_array(strtolower(pathinfo($model_url,PATHINFO_EXTENSION)), array("gltf", "glb"))) {
        $error_msg = "Invalid file type. Accepted: GLTF, GLB";
    }

    else {

        // Change date time to date
        $date_started_ = date('Y-m-d', $date_started);
        $date_ended_ = date('Y-m-d', $date_ended);

        // Check if the artifact exists by checking ID
        $qry = "SELECT * FROM {$dbTableName} WHERE id='{$id}'";
        $result = mysqli_query($connection, $qry);
        if (!$result) {
            $error_msg = "Query was rejected by the database (1)" . mysqli_error($connection);
        }
        else if (mysqli_num_rows($result) > 0) {
            $error_msg = "This dig site has already been uploaded";
        }
        else {

            // TODO uploading to the server?
            //if (move_uploaded_file($_FILES["model_file"]["tmp_name"], $target_file)) {
            
                $qry = "INSERT INTO `{$dbTableName}` (`id`, `title`, `description`, `model_url`, `date_begin`, `date_end`) 
                    VALUES ('{$id}', '{$title}', '{$description}', '{$model_url}', '{$date_started_}', '{$date_ended_}');";

                $result = mysqli_query($connection, $qry);

                // TODO Verification?
                if ($result) {
                    header("HTTP/1.1 201");
                    $success = true;
                }
                else {
                    $error_msg = "Query was rejected by the database (2)" . mysqli_error($connection);
                }
            // }
            // else {
            //     $error_msg = "Could not upload file. Try again";
            // }
        }
    }
}

if (isset($success) && $success == true){ 
    echo '<font color="green">Successfully uploaded dig site data.</font>'; 
} 
// check to see if the error message is set, if so display it 
else if (isset($error_msg)) 
    echo '<font color="red">Error uploading dig site data: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>