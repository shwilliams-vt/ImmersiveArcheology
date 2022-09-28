<?php 

$dbServername = "localhost";
$dbUsername = "manager";
$dbPassword = "X6m&T@Evr,[s@,n";
$dbName = "archeology";
$dbTableName = "artifacts";

$uploadDir = "gltf/artifacts/";

$connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

if (!$connection) {
    $error_msg = "Could not connect to the database/invalid credentials.";
}
else if (!(isset($_POST['id']) && isset($_POST['site_id']) && isset($_POST['title']) && isset($_POST['description']) && isset($_POST['model_url']) && isset($_POST['date']) && isset($_POST['location']))) {
    $error_msg = "Some required fields are empty (1)";
}
else {

    $valid_id = is_numeric(htmlspecialchars($_POST['id']));
    $valid_site_id = is_numeric(htmlspecialchars($_POST['site_id']));
    $id = intval(htmlspecialchars($_POST['id']));
    $site_id = intval(htmlspecialchars($_POST['site_id']));
    $title = htmlspecialchars($_POST['title']); 
    $description = htmlspecialchars($_POST['description']);
    //$model_file = htmlspecialchars($_FILES['model_file']['tmp_name']); 
    // $target_file = $uploadDir . htmlspecialchars(basename($_FILES["model_file"]["name"]));
    $model_url = htmlspecialchars($_POST['model_url']); 
    $date_time = strtotime(htmlspecialchars($_POST['date']));
    $location =  htmlspecialchars($_POST['location']);
    
    if ($title == "" || $description == "" || $model_url == "" || $location == "") {
        $error_msg = "Some required fields are empty (2)";
    }
    else if (!$valid_id) {
        $error_msg = "ID is not numeric";
    }
    else if (!$valid_site_id) {
        $error_msg = "Site ID is not numeric";
    }
    else if (!$date_time) {
        $error_msg = "Invalid date";
    }
    else if (!in_array(strtolower(pathinfo($model_url,PATHINFO_EXTENSION)), array("gltf", "glb"))) {
        $error_msg = "Invalid file type. Accepted: GLTF, GLB";
    }

    else {

        // Change date time to date
        $date = date('Y-m-d', $date_time);

        // Check if the artifact exists by checking ID
        $qry = "SELECT * FROM {$dbTableName} WHERE id='{$id}'";
        $result = mysqli_query($connection, $qry);
        if (!$result) {
            $error_msg = "Query was rejected by the database (1)" . mysqli_error($connection);
        }
        else if (mysqli_num_rows($result) > 0) {
            $error_msg = "This artifact has already been uploaded";
        }
        else {

            // TODO uploading to the server?
            //if (move_uploaded_file($_FILES["model_file"]["tmp_name"], $target_file)) {
            
                $qry = "INSERT INTO `{$dbTableName}` (`id`, `site_id`, `title`, `description`, `model_url`, `date_excavated`, `location`) 
                    VALUES ('{$id}', '{$site_id}', '{$title}', '{$description}', '{$model_url}', '{$date}', '{$location}');";

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
    echo '<font color="green">Successfully uploaded artifact data.</font>'; 
} 
// check to see if the error message is set, if so display it 
else if (isset($error_msg)) 
    echo '<font color="red">Error uploading artifact data: '.$error_msg.'</font>'; 
else
    echo ''; // do nothing

mysqli_close($connection);

?>