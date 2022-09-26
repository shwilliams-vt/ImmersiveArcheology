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

    <div id="showcase"></div>
</body>
</html>

<script type="module">

    import submitGet from "./js/submitget.js";

    submitGet(
        "./download.php", 
        [], 
        (t)=>{document.querySelector("#showcase").innerHTML = t},
        (t)=>{document.querySelector("#showcase").innerHTML = t}
    );

</script>