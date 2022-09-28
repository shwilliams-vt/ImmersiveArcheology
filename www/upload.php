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
    <?php include("./header.php");?>

    <div id="form-container">
        <form id="form_id" style="width:500px" onsubmit="return false;" enctype="multipart/form-data">

            <h2 style="text-align:center">Upload Information</h2>
            <br/>

            <group>
                <label>Artifact ID*:</label><fill></fill><input type="text" name="id"><br>
            </group>
            <group>
                <label>Site ID*:</label><fill></fill><input type="text" name="site_id"><br>
            </group>
            <group>
                <label>Title*:</label><fill></fill><input type="text" name="title"><br>
            </group>
            <group>
                <label>Description*:</label><fill></fill><textarea name="description"></textarea><br>
            </group>
            <!--<group>
                <label>Artifact GLTF*:</label><fill></fill><input type="file" name="model_file"><br>
            </group>-->
            <group>
            <label>Artifact Model URL*:</label><fill></fill><input type="text" name="model_url"><br>
            </group>
            <group>
                <label>Date Excavated*:</label><fill></fill><input type="date" name="date"><br>
            </group>
            <group>
                <label>Coordinates*:</label><fill></fill><input type="text" name="location"><br>
            </group>

            <br/>
            <input type="submit"/>

            <p id="message"></p>
        </form>
    </div>
</body>
</html>

<script type="module">

    import submitFormPost from "./js/submitpost.js"

    function log(text) {
        document.querySelector("#message").innerHTML = text;
    }

    let form = document.querySelector("#form_id");
    form.addEventListener("submit", function() {

        // Show loading
        log("Loading...");

        // Sumbit post request
        submitFormPost(
            "./submitartifactupload.php", 
            form, 
            (response)=>log(response), 
            (response)=>log(response)
        );
        return false;
    });
</script>