<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="./css/main.css" rel="stylesheet" />
    <title>About</title>
    <style>
        p{
            margin-left:15px;
        }
        h3 {
            margin-left:5px;
        }
        h4 {
            margin-left:10px;
        }
        h2 {
            margin-top:50px;
        }
    </style>
</head>
<body>

    <?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php"); ?>

    <div style="margin: 30px;">

        <h2 id="acknowledgements">Acknowledgements</h2>
        <p>
            This project is for the CS 4624 Hypertext, Multimedia and Information Access Capstone.
        </p>
        <p>
            In collaboration with Dr. Todd Ogle of Virginia Tech, we, Sam Williams and Enmu Liu, began working on this Immersive Archeology project in the Fall of 2022 semester. The goal of this project is to provide users with an immersive experience in both a desktop setting and in the Oculus Quest.  
        </p>

        <h2 id="overview">Overview</h2>
        <p>
            With our Immersive Archeology viewer, users can click on a dig site at the bottom of the home page or <a href='/browse.php'>browse all</a> dig sites and artifacts. Users can be anybody - no login required!
        </p>

        <h3 id="artifacts">Artifacts</h3>
        <p>
            From the <a href='/browse.php'>browse all</a> page, users can observe properties of uploaded artifacts, such as their corresponding dig sites, date of excavation, and more information like their ID numbers. 
        </p><p>  
            In the web browser, the artifacts can be manipulated by clicking and dragging (rotating) and scrolling (zooming). Try it out!
        </p>
        <p>  
            Users can also leave comments on each artifact's page -- this is located at the bottom of the page. This is helpful for conversing with others to help understand each artifact better!
        </p>

        <h3 id="dig-sites">Dig sites</h3>
        <p>
            Similar to artifacts, the dig site pages contain much of the same information as artifacts, including the interactive viewer, metadata (though there are some slight differences, such as the excavation date range) and comment section. 
        </p><p>
            But perhaps most notably, there is a "Visit in XR" button that will transport users to an immersive experience in the web browser.
        </p>

        <h2 id="immersive-experience">Immersive Experience</h3>
        <p>
            The immersive experience can be enjoyed in both the desktop web browser and Oculus Quest. In the experience, users can navigate around the dig site and examine and interact with artifacts found there. Additionally, users can selectively filter artifacts by date if they wish.
        </p>
        <h3 id="immersive-experience-desktop">Desktop Web Browser</h3>
        <p>
            After clicking on the "Visit in XR" button on the corresponding dig site's <a href="#dig-sites">dig site page</a>, users will be taken to the interactive viewer page. Once the viewer is done loading users can begin to interact with the environment.
        </p>
        <h3>Controls</h3>
        <ul>
            <li>
                <h4>Movement</h4>
                <ul>
                    <li><b>W</b>: Forward</li>
                    <li><b>S</b>: Backward</li>
                    <li><b>A</b>: Left</li>
                    <li><b>D</b>: Right</li>
                    <li><b>Z</b>: Down</li>
                    <li><b>X</b>: Up</li>
                </ul>
            </li>
            <li>
                <h4>Rotation</h4>
                Click and drag with the left mouse button.
            </li>
            <li>
                <h4>Interaction</h4>
                <ul>
                    <li><b>Slider (Excavation Date Brush)</b>: Hover over and left click and drag the slider knob on the controls menu to brush (selectively filter) visible artifacts by their excavation dates. The left-most (default) setting is to view all artifacts, but moving the slider knob to the right will brush artifacts on particular dates in ascending order.</li>
                    <li><b>Artifacts</b>: Click on the 3D artifacts to be taken to their artifact pages (in a new tab).</li>
                </ul>
            </li>
        </ul>
        <h3 id="immersive-experience-oculus">Oculus Quest</h3>
        <p>
            Users can access this website from the Oculus Quest's native web browser. After they arrive to the immersive experience page and it has loaded, a button will appear at the bottom of the page underneath of the viewer. In the Oculus Quest Web Browser, users can click this button to access the unique XR Oculus Quest experience. 
        </p>
        <h3>Controls</h3>
        <ul>
            <li>
                <h4>Movement</h4>
                <ul>
                    <li><b>Left Joystick (Forward)</b>: Forward</li>
                    <li><b>Left Joystick (Backward)</b>: Backward</li>
                    <li><b>Left Joystick (Left)</b>: Left</li>
                    <li><b>Left Joystick (Right)</b>: Right</li>
                    <li><b>Right Joystick (Forward)</b>: Up</li>
                    <li><b>Right Joystick (Backward)</b>: Down</li>
                </ul>
            </li>
            <li>
                <h4>Rotation</h4>
                N/A
            </li>
            <li>
                <h4>Interaction</h4>
                <ul>
                    <li><b>Slider (Excavation Date Brush)</b>: Using your right hand, hover the right guide over the slider knob on the controls menu, press the select button on the right controller, and move it left and right to brush (selectively filter) visible artifacts by their excavation dates. The left-most (default) setting is to view all artifacts, but moving the slider knob to the right will brush artifacts on particular dates in ascending order.</li>
                    <li><b>Artifacts</b>: N/A</li>
                </ul>
            </li>
        </ul>
    </div>
</body>
</html>