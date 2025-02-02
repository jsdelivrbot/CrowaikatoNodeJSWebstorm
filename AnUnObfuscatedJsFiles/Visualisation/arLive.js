///Section: Variables

//Variables - Impt Varibles(Scenes, Camera, WebGL Renderer, CSS3DRenderer, Array to hold functions)
var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
var scene2 = new THREE.Scene();
var renderer2 = new THREE.CSS3DRenderer();
var onRenderFcts = [];
var lastTimeMsec = null;

//Variables - Controls for Users
var gui = new dat.GUI({
    autoPlace: false
});
var guiDiv = document.createElement('div');

//Vairables - For Real-Time Data Retrieval
var socket = io();
socket.emit("arStartLive");
var machineArr = [];
var markerVals = [];
var destSph, srcSph;
var start = marker5;
var end = marker3;

//Variables - For AR Markers
var controls3, controls5;
var marker3 = new THREE.Group;
var marker5 = new THREE.Group;
var midpoint = new THREE.Vector3();
var portalUrl = '/jsonObjectsThreeJs/laptop.json';
// var portalUrl = 'https://rawgit.com/Xdecosee/ar-data-insertion/master/resources/plane-with-holes.json';
//Holds the animation(3D objs) that are displayed when markers are in camera view
var sphereZone = new THREE.Group;

//Variables - Crow Logo
var crowMap = new THREE.TextureLoader().load("https://cdn.jsdelivr.net/gh/Xdecosee/ar-data-insertion@master/resources/crow-logo.png");
var crowMaterial = new THREE.SpriteMaterial({
    map: crowMap,
    color: 0xffffff
});
var crowLogo = new THREE.Sprite(crowMaterial);

//Variables - Action Text
var textMesh, loader, textGeo;
var textUrl = 'https://rawgit.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json';
var textMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
});
var textDef = " ";
var textCont = new THREE.Group;

//Variables - Curve Path
var tangent = new THREE.Vector3();
var axis = new THREE.Vector3();
var up = new THREE.Vector3(0, 1, 0);

//Variables - MultiPaths
var pathVar = [];
var counter1 = 0;
var counter2 = 0;
var counter3 = 0;
var availPath = 0;
var thread1, thread2, thread3, pathMaxIndex, selectedPath;

//Variables - Default Sphere Material and Geometry
var defaultGeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
var defaultMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF
});

//Variables - Table Information for Two Markers
var blueText = "Blue Team";
var redText = "Red Team";
var elementsArr = [];
var visibleT = false;
var previousType = null;
var doubleEmptyRows = [];
var doubleVis = [];
var testOne, testTwo, doubleData, doubleMatch, grpOne, grpTwo, twoIndex, groupOne, groupTwo;
var firstMarker, secondMarker, index;
var midAdd = [];

//Variables - Table Information for One Marker
var singleElementsArr = [];
var textNodeArr = [];
var singleVis = [];
var singleEmptyRows = [];
var testThree, singleData, singleMatch, grpThree, oneIndex;

///Section: Set the position of User Controls
guiDiv.style.position = 'absolute';
guiDiv.style.zIndex = 10;
guiDiv.style.top = '0px';
document.body.appendChild(guiDiv);
guiDiv.appendChild(gui.domElement);

///Section: Get A list of Machines and their data From Server-side
$(function() {

    $.get('/page/machines', function(machines) {
        console.log(machines);
        for (var i = 0; i < machines.length; i++) {
            machineArr[i] = machines[i];
        }
    });

});

///Section: WEBGLRENDERER
renderer.setClearColor(new THREE.Color('lightgrey'), 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.left = '0px';
document.body.appendChild(renderer.domElement);
var winResize = new THREEx.WindowResize(renderer, camera)

///Section: Css3drenderer (For Tables)
renderer2.setSize(window.innerWidth, window.innerHeight);
renderer2.domElement.style.position = 'absolute';
renderer.domElement.style.left = '0px';
document.body.appendChild(renderer2.domElement);
var winResize = new THREEx.WindowResize(renderer2, camera)

///Section: Add Camera to Scene
scene.add(camera);

///Section: ARTOOLKITSOURCE
var arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam',
})

arToolkitSource.init(function onReady() {
    onResize()
})
window.addEventListener('resize', function() {
    onResize()

})

function onResize() {
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

///Section: ARTOOLKITCONTEXT
var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'https://cdn.glitch.com/64df24d4-c4fc-476b-9208-9c076af8be32%2Fcamera_para.dat?1508448491282',
    detectionMode: 'mono_and_matrix',
    matrixCodeType: '3x3'
})
arToolkitContext.init(function onCompleted() {

    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
})
onRenderFcts.push(function() {
    if (arToolkitSource.ready === false) return
    arToolkitContext.update(arToolkitSource.domElement)
})

///Section: Create Divs, Tables, C33D objects Needed
var queueDiv = document.createElement('div');
var queueTable = document.createElement("TABLE");
var queueObj = new THREE.CSS3DObject(queueDiv);
var singleDiv = document.createElement('div');
var singleTable = document.createElement("TABLE");
var singleObj = new THREE.CSS3DObject(singleDiv);

///Section: Dat.GUI (User Controls)
/* User can choose if they want to see more information about an action.
If they check the checkbox, tables will be added into the AR scene to display more information about actions.
Note: Tables can be seen when markers within camera view */
var FizzyText = function() {
    this.Info = false;
    this.View = function(){
        window.open("https://github.com/Xdecosee/ar-project");
    }
    this.homepg = function () {

        var grabedurl = window.location;
        console.log("DATA");
        console.log(grabedurl);

        window.location.href = "/page/home";
        // window.open("https://github.com/Xdecosee/ar-project");


    }
};
var text = new FizzyText();
var controls = gui.add(text, 'Info').name('More Info').listen().onChange(function(newValue) {

    if (visibleT == false) {
        //Users Want to see more information
        visibleT = true;
    } else {

        //Users don't want to see more information
        visibleT = false;
    }

});
gui.add(text, 'View').name("View Source Code");
gui.add(text, 'homepg').name("Back to Home");

;(function() {
    ///Section: CSS3D - Create Tables
    /*When the webpage load, each Table will have three empty rows which will
    eventually be filled with the latest three insertions of data*/
    //Table When Two Markers are in view
    createDouble();
    //Table When Only One Marker is in view
    createSingle();

    /// Section : Creates Multiple Curve Paths
    initPathVar();

    ///Section: Trigger Socket.IO to start listening for incoming data(action) from server
    dataListener();

    ///Section: Add SphereZone to scene.
    /*SphereZone(A THREE.Group)contains 3D objects (CurvePath, Logo, Spheres, Action Text)
    that will be displayed when both markers are in camera view.*/
    scene.add(sphereZone);

    /// Section: Scaling CROW LOGO
    crowMap.minFilter = THREE.LinearFilter;
    crowLogo.scale.set(1, 0.40, 1);

    ///Section: Loads Default Action Text into SphereZone
    /* By default when there are no data received yet, a " " will be set in
    place of the action text area*/
    loader = new THREE.FontLoader().load(textUrl, function(font) {
        textGeo = new THREE.TextGeometry(textDef, {
            font: font,
            size: 2,
            height: 1,
        });

        textMesh = new THREE.Mesh(textGeo, textMat);
        sphereZone.add(textMesh);
    });

    /// Section: Generate Markers (Hardcoded)
    /*
    Add markers controls to scene for detecting physical markers.
    Assign relevant barcode values for application to identify the physical markers
    THREE.Group is like a container and its coordinates can help us to determine
    the position of the marker in the scene.
    We also assign a coloured box for each marker so users know which team the machine belongs to.
    */

    scene.add(marker3);
    controls3 = new THREEx.ArMarkerControls(arToolkitContext, marker3, {
        type: 'barcode',
        barcodeValue: 3
    })
    markerVals.push([controls3.parameters.barcodeValue, controls3.object3d]);
    bluePointer(marker3);

    scene.add(marker5);
    controls5 = new THREEx.ArMarkerControls(arToolkitContext, marker5, {
        type: 'barcode',
        barcodeValue: 5

    })
    markerVals.push([controls5.parameters.barcodeValue, controls5.object3d]);
    redPointer(marker5);


    //Section: DoubleVis & SingleVis
    /* singleVis and doubleVis are arrays created to keep incoming data and group them
    according to the markers that they belong to.*/
    for (var i = 0; i < markerVals.length; i++) {
        var doubleArr = [];
        var singleArr = [];

        firstMarker = markerVals[i][1];
        index = i + 1;

        for (var j = index; j < markerVals.length; j++) {
            secondMarker = markerVals[j][1];
            doubleArr.push(firstMarker, secondMarker);
            doubleVis.push(doubleArr);
        }
        singleArr.push(firstMarker);
        singleVis.push(singleArr);
    }


    ///Section: Display Animation When Markers Visible
    /*Allow the application display the relevant animation according
    to the number of physical markers within camera view*/
    onRenderFcts.push(function() {

        ///Section: Pop Data from Queues
        /*
          There are three curve paths for spheres to move from marker to another.
          Each curve path has their own queue (array) to receive data constantly.
          When two markers are in view, the queues will push the data out and display
          the data in the form of coloured sphere in the AR scene.

        */
        popFromQueue();

        // When Two Markers Visible
        if (marker3.visible === true && marker5.visible === true) {

            ///Section: Get Midpoint of the two markers
            midpoint.addVectors(marker3.position, marker5.position).multiplyScalar(1 / 2)
            midpoint.y += 1;

            ///Section: Set position of Crow Logo
            crowLogo.position.set(midpoint.x, midpoint.y, midpoint.z);
            crowLogo.position.y += 0.30;

            ///Section: Action Text positioning and scaling
            textMesh.geometry.center();
            textMesh.scale.set(0.05, 0.05, 0.05);
            textMesh.position.set(midpoint.x, midpoint.y, midpoint.z);

            ///Section: Make sphereZone visible
            sphereZone.add(crowLogo);
            sphereZone.visible = true;

            ///Section: CSS3D Table display when Two Markers visible
            if (visibleT == true) {

                //Load Machines' Ip and Hostname into Table
                groupOne = appendData(marker3);
                groupTwo = appendData(marker5);
                //Set position of table and visibility of Table to Visible
                twoPosVis();

                /*Load the last three insertions of data (related to the two
                markers in camera view)into the table. */
                for (var i = 0; i < doubleVis.length; i++) {

                    grpOne = doubleVis[i][0];
                    grpTwo = doubleVis[i][1];

                    if ((grpOne == groupOne && grpTwo == groupTwo) || (grpOne == groupTwo && grpTwo == groupOne)) {
                        doubleMatch = doubleVis[i];
                        for (var j = 2; j < doubleMatch.length; j++) {
                            twoIndex = j - 2;

                            doubleEmptyRows[twoIndex][0].nodeValue = doubleMatch[j][0];
                            doubleEmptyRows[twoIndex][1].nodeValue = doubleMatch[j][1];
                            doubleEmptyRows[twoIndex][2].nodeValue = doubleMatch[j][2];

                        }

                    }

                }

            } else {
                //Hide the table for two markers when user uncheck "More Info" option
                hideTable(queueDiv, queueObj);
            }
            //Hide the table for one marker
            hideTable(singleDiv, singleObj);

            //One Marker Visible
        } else if (marker3.visible === true) {

            oneMarkerVisible(marker3);

        } else if (marker5.visible === true) {

            oneMarkerVisible(marker5);

            //No Markers Visible
        } else {

            //Make SphereZone hidden
            sphereZone.visible = false;
            //Empty All 3 Queues
            emptyQueue();
            //Hide Both Tables
            hideTable(queueDiv, queueObj);
            hideTable(singleDiv, singleObj);

        }

    })

})()


///Section: Move coloured spheres on their individual paths
/* Each sphere represent an action inserted recently. Function displays
coloured spheres when the two markers relating to the action are visible*/
function threadsLoad() {

    thread1 = setInterval(function() {

        moveSphere1(pathVar[0][0], pathVar[0][1]);
    }, 10);

    thread2 = setInterval(function() {
        moveSphere2(pathVar[1][0], pathVar[1][1]);
    }, 10);

    thread3 = setInterval(function() {

        moveSphere3(pathVar[2][0], pathVar[2][1]);
    }, 10);

}
//Path 1
function moveSphere1(path, sphere) {

    if (sphere.visible == true) {

        if (counter1 <= 1) {

            sphere.position.copy(path.getPointAt(counter1));

            tangent = path.getTangentAt(counter1).normalize();

            axis.crossVectors(up, tangent).normalize();

            var radians = Math.acos(up.dot(tangent));

            sphere.quaternion.setFromAxisAngle(axis, radians);

            counter1 += 0.005
        } else {
            counter1 = 0;
            sphere.visible = false;
            loader = new THREE.FontLoader().load(textUrl, function(font) {
                loadText(textDef, textMat, font);
            });

        }

    }

}
//Path 2
function moveSphere2(path, sphere) {

    if (sphere.visible == true) {

        if (counter2 <= 1) {

            sphere.position.copy(path.getPointAt(counter2));

            tangent = path.getTangentAt(counter2).normalize();

            axis.crossVectors(up, tangent).normalize();

            var radians = Math.acos(up.dot(tangent));

            sphere.quaternion.setFromAxisAngle(axis, radians);

            counter2 += 0.005

        } else {
            counter2 = 0;
            sphere.visible = false;
            loader = new THREE.FontLoader().load(textUrl, function(font) {
                loadText(textDef, textMat, font);
            });

        }

    }

}
//Path 3
function moveSphere3(path, sphere) {

    if (sphere.visible == true) {

        if (counter3 <= 1) {

            sphere.position.copy(path.getPointAt(counter3));

            tangent = path.getTangentAt(counter3).normalize();

            axis.crossVectors(up, tangent).normalize();

            var radians = Math.acos(up.dot(tangent));

            sphere.quaternion.setFromAxisAngle(axis, radians);

            counter3 += 0.005
        } else {
            counter3 = 0;
            sphere.visible = false;
            loader = new THREE.FontLoader().load(textUrl, function(font) {
                loadText(textDef, textMat, font);
            });

        }

    }

}


///Section: Create Tables to be displayed when either two or one markers in camera view
//Table For One Visible Marker
function createSingle() {

    singleDiv.appendChild(singleTable);
    singleDiv.style.width = '150px';
    singleDiv.style.height = '150px';
    singleDiv.style.visibility = "hidden";
    singleObj.scale.set(0.01, 0.01, 0.01);
    scene2.add(singleObj);

    //Append Empty Row so that machine ip & hostname can be displayed when marker visible
    singleIpName(singleTable);

    var rowHeaders = document.createElement("TR");
    singleTable.appendChild(rowHeaders);

    var directionHead = document.createElement("TH");
    var directionText = document.createTextNode("Direction");
    directionHead.appendChild(directionText);
    rowHeaders.appendChild(directionHead);
    setColour(directionHead, null);

    var ipHead = document.createElement("TH");
    var ipText = document.createTextNode("IP");
    ipHead.appendChild(ipText);
    rowHeaders.appendChild(ipHead);
    setColour(ipHead, null);

    var actionHead = document.createElement("TH");
    var actionText = document.createTextNode("Action");
    actionHead.appendChild(actionText);
    rowHeaders.appendChild(actionHead);
    setColour(actionHead, null);

    var dateHead = document.createElement("TH");
    var dateText = document.createTextNode("Time");
    dateHead.appendChild(dateText);
    rowHeaders.appendChild(dateHead);
    setColour(dateHead, null);

    //Append Empty Rows so that the latest 3 data insertions can be displayed
    threeRows(singleTable);

}
function singleIpName(table) {

    var emptyRow, emptyCell, emptyNode;
    emptyRow = document.createElement("TR");
    table.appendChild(emptyRow);

    for (var j = 0; j < 3; j++) {

        emptyCell = document.createElement("TD");
        emptyRow.appendChild(emptyCell);
        singleElementsArr.push(emptyCell);
        emptyNode = document.createTextNode(" ");
        emptyCell.appendChild(emptyNode);
        textNodeArr.push(emptyNode);

    }

}
//Table For Two Visible Markers
function createDouble() {

    queueDiv.style.width = '150px';
    queueDiv.style.height = '150px';
    queueDiv.style.visibility = "hidden";
    queueDiv.appendChild(queueTable);
    queueObj.scale.set(0.01, 0.01, 0.01);
    scene2.add(queueObj);
    //Append Empty Rows so that machines ip & hostname can be displayed when 2 markers visible
    doubleIpName(blueText);
    doubleIpName(redText);
    var queueRow = document.createElement("TR");
    queueTable.appendChild(queueRow);
    var actionHead = document.createElement("TH");
    var actionText = document.createTextNode("Action");
    actionHead.appendChild(actionText);
    var dateHead = document.createElement("TH");
    var dateText = document.createTextNode("Time");
    dateHead.appendChild(dateText);
    var sourceHead = document.createElement("TH");
    var sourceText = document.createTextNode("Source");
    sourceHead.appendChild(sourceText);
    queueRow.appendChild(actionHead);
    queueRow.appendChild(dateHead);
    queueRow.appendChild(sourceHead);
    setColour(actionHead, null);
    setColour(dateHead, null);
    setColour(sourceHead, null);
    //Append Empty Rows so that the latest 3 data insertions can be displayed
    threeRows(queueTable);

}
function doubleIpName(text) {

    var teamRow = document.createElement("TR");
    var teamHead = document.createElement("TH");
    var teamText, displayedText;
    teamText = document.createTextNode(text);
    displayedText = text;

    queueTable.appendChild(teamRow);
    teamHead.appendChild(teamText);
    teamRow.appendChild(teamHead);

    var ipHead = document.createElement("TD");
    teamRow.appendChild(ipHead);
    var hostHead = document.createElement("TD");
    teamRow.appendChild(hostHead);
    setColour(teamHead, displayedText);
    setColour(ipHead, displayedText);
    setColour(hostHead, displayedText);
    var ipText = document.createTextNode(" ");
    var hostText = document.createTextNode(" ");
    ipHead.appendChild(ipText);
    hostHead.appendChild(hostText);

    elementsArr.push([ipText, hostText, text]);

}
function threeRows(table) {
    var noOfCells, emptyCon;

    if (table == queueTable) {
        noOfCells = 3;
        emptyCon = doubleEmptyRows;
    } else if (table == singleTable) {
        noOfCells = 4;
        emptyCon = singleEmptyRows;
    }
    for (var i = 0; i < 3; i++) {
        var itemRow = document.createElement("TR");
        var rowArr = [];

        for (var j = 0; j < noOfCells; j++) {
            var cell = document.createElement("TD");
            itemRow.appendChild(cell);
            var node = document.createTextNode(" ");
            cell.appendChild(node);
            setColour(cell, null);
            rowArr.push(node);

        }
        table.appendChild(itemRow);
        emptyCon.push(rowArr);

    }
}
// Style Elements
function setColour(element, team) {

    element.style.borderCollapse = "collapse";
    element.style.textAlign = "center";
    element.style.color = "white";

    if (team == blueText) {

        element.style.border = "2px solid white";
        element.style.background = "#000099";

    } else if (team == redText) {

        element.style.border = "2px solid white";
        element.style.background = "#B20000";

    } else {
        element.style.border = "2px solid white";
        element.style.background = "black";

    }

}


///Section: Create MultiPaths(Curves) for Spheres to choose and move from one marker to another
function initPathVar() {

    var el1 = createPathEl(1.9);
    var el2 = createPathEl(1.3);
    var el3 = createPathEl(0.6);

    pathVar.push(el1);
    pathVar.push(el2);
    pathVar.push(el3);

    pathMaxIndex = pathVar.length - 1;

}
/*Purpose of val is value to increase the midpoints' y-value (between two markers) later on
so that the three paths has different height in their midpoints*/
function createPathEl(val) {

    var el = [];
    var path;
    /* Each path has its own sphere. This Sets the default sphere colour and
    visibility of sphere to false. When there is new data, the sphere will be
    coloured and the visibility will be true.
    */
    var newSphere = new THREE.Mesh(defaultGeo, defaultMat);
    sphereZone.add(newSphere);
    newSphere.visible = false;
    var queue = [];
    newSphere.scale.set(0.8, 0.8, 0.8);
    el = [path, newSphere, queue, val];

    return el;

}


///Section: Listen for Incoming Data(Actions) through Socket.IO
function dataListener() {
    ///Section: Socket.io stuff
    socket.on('action', function(sphere) {
        console.log("Socket Client==============");
        console.log(sphere);

        /*Do not display repeating data(i.e new data inserted must not be
        same as the previous data inserted)*/
        if (sphere.actionType != previousType) {

            //Source and Dest Ip addresses of Action
            srcSph = sphere.src;
            destSph = sphere.dest;


            /*Barcode Values of the markers that represent the
            machines(source & dest) involved in the action*/
            var srcVal = getVal(srcSph);

            console.log(srcVal);
            var destVal = getVal(destSph);
            //Get the team of machine that is source of the action
            var srcTeam = getTeamVal(srcSph);
            //Get the markers' THREE.Group based on their barcode values
            var begin = getGrp(srcVal);
            var finish = getGrp(destVal);
            var teamValue, element, queue;
            /*If team value is 1, the machine's team is Red.
            If team value is 0, the machine's team is Blue*/
            if (srcTeam == 0) {
                teamValue = blueText;
            } else {
                teamValue = redText;
            }

            /*Get the naming of the action based on the action's integer value.
            Generate an array to hold the action's information as well as the colour
            ( 3D material & geometry) assigned to the action. The colour will be pushed out later
            on to be displayed on the sphere. The action's naming will be displayed
            below the logo and other relevant information are displayed in the tables.*/

            element = queueElement(sphere.actionType, begin, finish);

            /*Save Action information into doubleVis so that it can be displayed in the
            table when the both markers relevant to the action are visible*/
            for (var i = 0; i < doubleVis.length; i++) {
                testOne = doubleVis[i][0];
                testTwo = doubleVis[i][1];
                if ((testOne == begin && testTwo == finish) || (testOne == finish && testTwo == begin)) {

                    doubleData = genArrTwo(element[2], sphere.dateTime, teamValue);

                    if (doubleVis[i].length == 5) {
                        doubleVis[i].splice(2, 1);
                    }

                    doubleVis[i].push(doubleData);

                }
            }

            /*Save Action information into singleVis so that it can be displayed in the
            table when any of the markers relevant to the action is visible*/
            singleEmptyPush(begin, sphere.dateTime, element[2], destSph, "Outbound");
            singleEmptyPush(finish, sphere.dateTime, element[2], srcSph, "Inbound");

            //Push Action information into any queue when both markers are visible
            if (begin.visible === true && finish.visible === true) {

                /* Select a queue for the action to be inserted into. The queue is a waiting
                area for the actions before they are 'popped' out of the queue for display when two markers are
                in camera view. Queues are essential as if there is rapid large amounts of data inserted into DB
                together at once, the application wont be able to display all actions in form of coloured spheres
                immediately. Hence, the display of spheres is actually slightly delayed from the actual time
                the action was inserted into the datbase.*/
                queue = selectQueue();
                queue.push(element);

            }

            previousType = sphere.actionType;
        }
    });

}
//Assign naming based on action's integer value
function queueElement(type, begin, finish) {
    var newgeo;
    var newmat;
    var newText;
    var newData = [];

    if (type == 1) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
        });

        newText = "Normal";

    } else if (type == 2) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
        });
        newText = "Reconnaissance";

    } else if (type == 3) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xFFA500,
        });

        newText = "SQL Injection";
    } else if (type == 4) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xFF69B4,
        });
        newText = "Semantic URL Attack";

    } else if (type == 5) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x800080,

        });
        newText = "Command Injection";

    } else if (type == 6) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,

        });

        newText = "Remote Code Execution";

    } else if (type == 7) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xA52A2A,

        });

        newText = "URL Manipulation";

    } else if (type == 8) {
        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x000080,

        });

        newText = "Privilege Escalation";

    } else if (type == 9) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xff0000,

        });

        newText = "Directory Traversal Attack";

    } else if (type == 10) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x006400,

        });

        newText = "defense1";

    } else if (type == 11) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0x808080,

        });

        newText = "defense2";

    } else if (type == 12) {

        newgeo = new THREE.SphereGeometry(0.1, 0.64, 0.64);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xFFB6C1,

        });

        newText = "defense3";

    } else {
        newgeo = new THREE.SphereGeometry(0, 0, 0);
        newmat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,

        });

        newText = "Error";

    }

    //Generate Array to hold the action's information and assigned colour
    newData.push(newgeo);
    newData.push(newmat);
    newData.push(newText);
    newData.push(begin);
    newData.push(finish);
    return newData;

}
//Save Action Information into singleVis
function singleEmptyPush(group, dateTime, action, ip, direction) {

    for (var i = 0; i < singleVis.length; i++) {
        testThree = singleVis[i][0];

        if (testThree == group) {
            singleData = genArrOne(direction, ip, action, dateTime);

            if (singleVis[i].length == 4) {
                singleVis[i].splice(1, 1);
            }

            singleVis[i].push(singleData);
        }

    }

}
/*Array to Hold the Action information and be displayed out later on the table
when any of the markers related to the action is visible*/
function genArrOne(direction, ip, action, time) {
    var data = [];
    data.push(direction);
    data.push(ip);
    data.push(action);
    data.push(time);

    return data;
}
/*Array to Hold the Action information and be displayed out later on the table
when both markers related to the action are visible*/
function genArrTwo(newText, dateTime, source) {

    var data = [];
    data.push(newText);
    data.push(dateTime);
    data.push(source);
    return data;

}
// Select a path for the sphere to move on
function selectQueue() {

    if (availPath > pathMaxIndex) {

        availPath = 0;

    }

    selectedPath = availPath;
    availPath++;
    return pathVar[selectedPath][2];

}


///Section: Assign Boxes to be displayed on markers based the team of each machine
function bluePointer(group) {

    var blueLight = new THREE.DirectionalLight(0x444444);
    blueLight.position.set(0, 0, 1).normalize();
    scene.add(blueLight);

    var loader = new THREE.ObjectLoader().load(portalUrl,

        function(obj) {

            var newcolor = new THREE.MeshPhongMaterial({
                color: 0x3C3CFF,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                depthWrite: false
            });

            function paint(o3d) {
                var children = o3d.children,
                    geometry = o3d.geometry;
                for (var i = 0, il = children.length; i < il; i++) {
                    paint(children[i]);
                }
                if (geometry) o3d.material = newcolor;

            }

            paint(obj);
            group.add(obj);
            obj.scale.set(0.8, 0.8, 0.8);
            obj.position.z=2.8;

            blueLight.target = obj;

        },
    );

};
function redPointer(group) {

    var redLight = new THREE.DirectionalLight(0x444444);
    redLight.position.set(0, 0, 1).normalize();
    scene.add(redLight);

    var loader = new THREE.ObjectLoader().load(portalUrl,

        function(obj) {

            var newcolor = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                depthWrite: false
            });

            function paint(o3d) {
                var children = o3d.children,
                    geometry = o3d.geometry;
                for (var i = 0, il = children.length; i < il; i++) {
                    paint(children[i]);
                }
                if (geometry) o3d.material = newcolor;

            }

            paint(obj);
            group.add(obj);
            obj.scale.set(0.8, 0.8, 0.8);
            obj.position.z=2.8;

            redLight.target = obj;

        },
    );

}


///Section: Pull action information out of the three queues
/* Takes the first element of the queue and display the information in the form of
coloured sphere*/
function popFromQueue() {
    var firstItem, queue, sphere, startVector, endVector;
    var midVector = new THREE.Vector3();

    for (var i = 0; i < pathVar.length; i++) {
        //constantly check for new action data in the three queues
        if (pathVar[i][2].length > 0) {

            queue = pathVar[i][2];
            firstItem = queue[0];
            sphere = pathVar[i][1];
            path = pathVar[i][0];
            val = pathVar[i][3];

            /*Sets the midpoint of the curve based on the middle point between both markers.
            All three curves will have different height as 'val' is added onto
            the y-value of the midpoint*/
            midVector.addVectors(firstItem[3].position, firstItem[4].position).multiplyScalar(1 / 2);
            midVector.y += val;

            if (sphere.visible == false) {

                //Sets the colour to the sphere
                sphere.geometry = firstItem[0];
                sphere.material = firstItem[1];

                if (firstItem[3].visible === true && firstItem[4].visible === true) {

                    pathVar[i][0] = new THREE.QuadraticBezierCurve3(
                        firstItem[3].position,
                        midVector,
                        firstItem[4].position
                    );

                    sphere.visible = true;

                    loader = new THREE.FontLoader().load(textUrl, function(font) {
                        loadText(firstItem[2], firstItem[1], font);
                    });

                    queue.shift();
                }

            }

        }

    }

}


///Section: Display information into table when two markers visible
function appendData(group) {

    var barcode = getValue(group);
    var ip = getIp(barcode);
    var host = getHost(barcode);
    var team = getTeam(barcode);

    for (var i = 0; i < elementsArr.length; i++) {

        if (team == 0 && elementsArr[i][2] == blueText || team == 1 && elementsArr[i][2] == redText) {

            elementsArr[i][0].nodeValue = ip;
            elementsArr[i][1].nodeValue = host;

        }

    }

    return group;

}
function twoPosVis() {

    queueDiv.style.visibility = "visible";
    queueObj.position.set(midpoint.x, midpoint.y, midpoint.z);
    queueObj.position.z += -5;

}


///Section: Display information into table when one Marker visible
function oneMarkerVisible(group) {

    if (visibleT == true) {
        //Set position of table and visibility of Table to Visible
        onePosVis(group);
        //Fill Table with Machine's Ip address & Hostname
        fillElements(group);
        //Append Lastest three insertions of data(in relation to the marker in camera view) into the table
        singleEmptyPop(group);

    } else {
        //Hide the table for one marker when user uncheck "More Info" option
        hideTable(singleDiv, singleObj);
    }

    //Make SphereZone hidden
    sphereZone.visible = false;
    //Empty All Three Queues
    emptyQueue();
    //Hide the table for two markers
    hideTable(queueDiv, queueObj);

}
function fillElements(marker) {

    var text;
    var barcode = getValue(marker);
    var team = getTeam(barcode);

    if (team == 0) {
        text = blueText;

    } else if (team == 1) {
        text = redText;
    }

    for (var i = 0; i < singleElementsArr.length; i++) {

        setColour(singleElementsArr[i], text);
    }

    textNodeArr[0].nodeValue = text;
    textNodeArr[1].nodeValue = getIp(barcode);
    textNodeArr[2].nodeValue = getHost(barcode);

}
function singleEmptyPop(group) {

    for (var i = 0; i < singleVis.length; i++) {

        grpThree = singleVis[i][0];

        if (grpThree == group) {

            singleMatch = singleVis[i];
            for (var j = 1; j < singleMatch.length; j++) {
                oneIndex = j - 1;

                singleEmptyRows[oneIndex][0].nodeValue = singleMatch[j][0];
                singleEmptyRows[oneIndex][1].nodeValue = singleMatch[j][1];
                singleEmptyRows[oneIndex][2].nodeValue = singleMatch[j][2];
                singleEmptyRows[oneIndex][3].nodeValue = singleMatch[j][3];

            }

        }

    }
}
function onePosVis(marker) {

    singleDiv.style.visibility = "visible";
    singleObj.position.set(marker.position.x, marker.position.y, marker.position.z);
    singleObj.position.z += -5;
    singleObj.position.y += 1.3;

}


///Section: Other Repeatedly used Functions
//Hide Tables
function hideTable(div, obj) {

    div.style.visibility = "hidden";
    obj.position.set(0, 0, 0);

}
//Empty All Three Queues
function emptyQueue() {

    for (var i = 0; i < pathVar.length; i++) {

        pathVar[i][2] = [];

    }

}
//Load Action Naming
function loadText(text, mat, font) {
    textGeo = new THREE.TextGeometry(text, {
        font: font,
        size: 2,
        height: 1,
    });
    textMesh.geometry = textGeo;
    textMesh.material = mat;
}


///Section: 'Getters'
//Get the barcode value assigned to the machine based on its ip address
function getVal(ip) {

    for (var i = 0; i < machineArr.length; i++) {
        if (ip == machineArr[i].ip) {
            return machineArr[i].value;
        }
    }

}
//Get data on which team does the machine belongs to (Red/Blue) based on its ip address
function getTeamVal(ip) {

    for (var i = 0; i < machineArr.length; i++) {
        if (ip == machineArr[i].ip) {
            return machineArr[i].team;
        }
    }

}
// Get the THREE.Group that is assigned to a marker based on its barcode value
function getGrp(val) {

    for (var i = 0; i < markerVals.length; i++) {

        if (val == markerVals[i][0]) {
            return markerVals[i][1];

        }

    }

}
// Get Machine's barcode value based on the THREE.Group assigned
function getValue(grp) {

    for (var i = 0; i < markerVals.length; i++) {

        if (grp == markerVals[i][1]) {
            return markerVals[i][0];

        }

    }

}
// Get Machine's ip address based on the barcode assigned to it
function getIp(barcode) {

    for (var i = 0; i < machineArr.length; i++) {

        if (barcode == machineArr[i].value) {

            return machineArr[i].ip;
        }

    }
}
// Get Machine's Hostname based on the barcode assigned to it
function getHost(barcode) {
    for (var i = 0; i < machineArr.length; i++) {

        if (barcode == machineArr[i].value) {

            return machineArr[i].hostname;
        }

    }
}
// Get Machine's team (Red/Blue) based on the barcode assigned to it
function getTeam(barcode) {
    for (var i = 0; i < machineArr.length; i++) {

        if (barcode == machineArr[i].value) {

            return machineArr[i].team;
        }

    }
}


/// Section: Push function to Render the scene
onRenderFcts.push(function() {
    renderer.render(scene, camera);

})


///Section: Continuously render and Run the functinos in onRenderFct
requestAnimationFrame(function animate(nowMsec) {
    renderer2.render(scene2, camera);
    requestAnimationFrame(animate);
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
    onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    })

})