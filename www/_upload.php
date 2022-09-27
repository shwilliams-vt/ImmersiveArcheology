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
        <form id="form_id" style="width:500px" onsubmit="return false;">

            <h2 style="text-align:center">Upload Information</h2>
            <br/>

            <group>
                <label>Name*:</label><fill></fill><input type="text" name="name"><br>
            </group>
            <group>
                <label>E-mail*:</label><fill></fill><input type="text" name="email"><br>
            </group>
            <group>
                <label>Comment*:</label><fill></fill><input type="text" name="comment"><br>
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
            "./_submitupload.php", 
            form, 
            (response)=>log(response), 
            (response)=>log(response)
        );
        return false;
    });
</script>