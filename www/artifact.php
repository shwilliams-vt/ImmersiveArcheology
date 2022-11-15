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
    $dbTableName = "artifacts";

    $connection = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

    if (!$connection) {
        $error_msg = "Could not connect to the database/invalid credentials.";
    }

    if (!(isset($_GET["id"]) && is_numeric(htmlspecialchars($_GET['id'])))) {
        $error_msg = "Could not find this artifact";
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

                echo "<div id='result' style='display:none'>";
                echo json_encode($array);
                echo "</div>";
            }
            else {
                $error_msg = "Could not find this artifact";
            }
            
        }
        else {
            $error_msg = "Query was rejected by the database";
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
    import ArtifactScene from "/js/xrworld/artifactscene.js";
    import CommentWidget from "/js/commentwidget.js";

    let res = document.querySelector("#result");
    if (!res) {


    }
    else {

        // Show as is hidden initially
        res.style.display = "flex";
        let result = parseTable(res.innerText)[0];

        res.innerHTML = "";

        res.appendChild(createDOMElemWithText("h2", "Artifact Name: " + result[2]));
        res.appendChild(createDOMElemWithText("p", "Description: " + result[3]));
        let xrDiv = createDOMElem("div");
        xrDiv.style.width = "50vw";
        xrDiv.style.height = "50vh";
        xrDiv.style.border = "4px solid #aaa";
        xrDiv.style.overflow = "hidden";
        res.appendChild(new ArtifactScene(xrDiv, result[4]).parentElem);

        // Info block
        let info = createDOMElemWithText("div", "");
        info.classList.add("infoblock");
        info.appendChild(createDOMElemWithText("p", "Date excavated: " + result[5]));
        info.appendChild(createDOMElemWithText("p", "Artifact ID: " + result[0]));
        info.appendChild(createDOMElemWithText("p", "Site ID: " + result[1]));
        res.appendChild(info);

        // Load comments
        let commentDiv = document.createElement("div");
        commentDiv.style.width = "80%";
        res.appendChild(commentDiv);

        // Add 'a' prefix for artifact
        let comments = new CommentWidget("a"+result[0]);
        commentDiv.appendChild(comments.domElem);

    }
</script>