<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="./css/main.css" rel="stylesheet" />
    <title>Immersive Archeology</title>
</head>
<body>
    <?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php");?>

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

    if (!(isset($_GET["id"]) && is_numeric(htmlspecialchars($_GET['id'])))) {
        $error_msg = "Could not find this artifact";
    }

    else {

        $dig_site_id = htmlspecialchars($_GET["id"]);

        // Step 1 download dig site
        $qry = "SELECT * FROM `dig_sites` WHERE id='{$dig_site_id}'";

        $result = mysqli_query($connection, $qry, MYSQLI_STORE_RESULT);

        // TODO Verification?
        if ($result) {

            if (mysqli_num_rows($result) == 1) {
                $success = true;

                $array = array();
                foreach ($result as $row) {
                    $array[] = $row;
                }

                echo "<div id='result_dig_site'>";
                echo json_encode($array);
                echo "</div>";
            }
            else {
                $error_msg = "Could not find this dig site";
            }
            
        }
        else {
            $error_msg = "Query was rejected by the database (1)";
        }

        // Part 2 download all artifacts
        $qry = "SELECT * FROM `artifacts` WHERE site_id='{$dig_site_id}'";

        $result = mysqli_query($connection, $qry, MYSQLI_STORE_RESULT);

        // TODO Verification?
        if ($result) {

            $success = true;

            $array = array();
            foreach ($result as $row) {
                $array[] = $row;
            }

            echo "<div id='result_artifacts'>";
            echo json_encode($array);
            echo "</div>";
            
        }
        else {
            $error_msg = "Query was rejected by the database (2)";
        }
    }

    // check to see if the error message is set, if so display it 
    if (isset($error_msg)) 
        echo '<div id="error"><h2 style="color:red">Error downloading artifact data: '.$error_msg.'</h2></div>'; 
    else
        echo ''; // do nothing

    mysqli_close($connection);

    ?>
</body>
</html>

<script type="module">
    import parseTable from "/js/tableparser.js";
    import { createDOMElem, createDOMElemWithText } from "/js/createdomelem.js";
    import DigSiteScene from "/js/xrworld/digsitescene.js";

    let result_dig_site = document.querySelector("#result_dig_site");
    let result_artifacts = document.querySelector("#result_artifacts");
    result_artifacts.style.height = "calc(100vh - 150px)"

    if (!result_dig_site || !result_artifacts) {


    }
    else {

        let digSite = parseTable(result_dig_site.innerText)[0];
        let artifacts = parseTable(result_artifacts.innerText);

        result_dig_site.innerHTML = "";
        result_artifacts.innerHTML = "";

        result_dig_site.appendChild(createDOMElemWithText("center", "<h3>XR View for: <a href='/dig_site.php?id='" + digSite[0] + ">" + digSite[1] + "</a></h2>"));
        result_dig_site.appendChild(new DigSiteScene(result_artifacts, {digSite:digSite, artifacts:artifacts}).parentElem);


    }
</script>