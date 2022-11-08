<?php header("Access-Control-Allow-Header: *") ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="/css/main.css" rel="stylesheet" />
    <link href="/css/view.css" rel="stylesheet" />
    <link href="/css/comments.css" rel="stylesheet" />
    <title>Immersive Archeology</title>
</head>
<body>

    <?php

    include($_SERVER['DOCUMENT_ROOT']."/includes/header.php");

    include($_SERVER['DOCUMENT_ROOT']."/inc/dbinfo.php");
    $dbTableName = "dig_sites";

    $connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

    if (!$connection) {
        $error_msg = "Could not connect to the database/invalid credentials.";
    }

    if (!(isset($_GET["id"]) && is_numeric(htmlspecialchars($_GET['id'])))) {
        $error_msg = "Could not find this dig_site";
    }

    else {
        $id = htmlspecialchars($_GET["id"]);

        $qry = "SELECT * FROM `{$dbTableName}` WHERE id='{$id}'";

        $result = mysqli_query($connection, $qry, MYSQLI_STORE_RESULT);

        // TODO Verification?
        if ($result) {

            if (mysqli_num_rows($result) == 1) {

                header("HTTP/1.1 201");
                $success = true;

                $array = array();
                foreach ($result as $row) {
                    $array[] = $row;
                }

                echo "<div id='result'>";
                echo json_encode($array);
                echo "</div>";
            }
            else {
                $error_msg = "Could not find this dig_site";
            }
            
        }
        else {
            $error_msg = "Query was rejected by the database";
        }
    }

    // check to see if the error message is set, if so display it 
    if (isset($error_msg)) 
        echo '<div id="error"><h2 style="color:red">Error downloading dig_site data: '.$error_msg.'</h2></div>'; 
    else
        echo ''; // do nothing

    mysqli_close($connection);



    ?>

</body>
</html>

<script type="module">
    import parseTable from "/js/tableparser.js";
    import { createDOMElem, createDOMElemWithText } from "/js/createdomelem.js";
    import ArtifactScene from "/js/xrworld/artifactscene.js"; 
    import CommentWidget from "/js/commentwidget.js";

    let res = document.querySelector("#result");
    if (!res) {


    }
    else {

        let result = parseTable(res.innerText)[0];

        res.innerHTML = "";

        res.appendChild(createDOMElemWithText("h2", "Dig_site Name: " + result[1]));
        res.appendChild(createDOMElemWithText("p", "Description: " + result[2]));
        let xrDiv = createDOMElem("div");
        xrDiv.style.width = "50vw";
        xrDiv.style.height = "50vh";
        xrDiv.style.border = "4px solid #aaa";
        xrDiv.style.overflow = "hidden";
        res.appendChild(new ArtifactScene(xrDiv, result[3]).parentElem);
        res.appendChild(createDOMElemWithText("p", "Date Begin: " + result[4]));
        res.appendChild(createDOMElemWithText("p", "Date End: " + result[5]));
        res.appendChild(createDOMElemWithText("p", "Dig_site ID: " + result[0]));

        // Add thing for XR
        let xr_btn = createDOMElemWithText("a", "Visit in XR");
        xr_btn.setAttribute("href", "/xr.php?id="+result[0]);
        res.appendChild(xr_btn);


        // Load comments
        let commentDiv = document.createElement("div");
        commentDiv.style.width = "80%";
        res.appendChild(commentDiv);

        // Add 'd' prefix for dig site
        let comments = new CommentWidget("d"+result[0]);
        commentDiv.appendChild(comments.domElem);

    }
</script>