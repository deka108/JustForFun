/**
 * Created by dekauliya on 12/11/15.
 */
var mazeHeight = 22;
var mazeWidth = 17;
var tileSize = 25;
var startPosX = 2;
var startPosY =19;
var endPosX = 14;
var endPosY = 2;
var NORTH = 1;
var EAST = 2;
var SOUTH = 3;
var WEST = 4;
var NOTHING = 6;
var TURN_LEFT = 37;
var MOVE_FORWARD = 38;
var TURN_RIGHT = 39;
var TURN_BACK = 40;
var robot = {
    xPos : startPosX,
    yPos : startPosY,
    face : NORTH
};
var cells = [];
function Cell(x, y){
    this.x = x;
    this.y = y;
    this.traversed= false;
    this.obstacle = false;
    this.color = null;
}
Cell.prototype.toString = function(){
    return "Cell is at [" + this.x + ", "+ this.y + "]";
}

var shortSensorRange = 2;
var longSensorRange = 5;

// Color Definition
var OBSTACLE = "#000000";
var TRAVERSED = "#d7d7d7";
var FASTEST_PATH = "#ff0000";
var GROUND = "#ffffff";
var ROBOT_BODY = "#00ff00";
var ROBOT_FACE = "#ffff00";
var END_ZONE = "#ff00ff";
var START_ZONE = "#00ffff";

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
canvas.addEventListener('click', handleClick);
window.addEventListener('keydown', move, false);

// The buttons
var exploreBtn = document.getElementById("explore_btn");
exploreBtn.addEventListener('click', explore);
var mapDescBtn = document.getElementById("map_desc_btn");
mapDescBtn.addEventListener('click', printMapDescriptor);
var fastestPathBtn = document.getElementById("fastest_path_btn");
fastestPathBtn.addEventListener('click', fastestPath);
var rstMapBtn = document.getElementById("reset_map_btn");
rstMapBtn.addEventListener('click', resetMap);
var updateStartPosBtn = document.getElementById("update_start_pos_btn");
updateStartPosBtn.addEventListener('click', updateStartPos);
var updateEndPosBtn = document.getElementById("update_end_pos_btn");
updateEndPosBtn.addEventListener('click', updateEndPos);
var saveMapBtn = document.getElementById("save_map_btn");
saveMapBtn.addEventListener('click', saveMap);

// Input/Output
var mapDescText = document.getElementById("map_desc_text");
var displayTextArea = document.getElementById("display_text");
var start_pos_x_input = document.getElementById("start_pos_x");
var start_pos_y_input = document.getElementById("start_pos_y");
var end_pos_x_input = document.getElementById("end_pos_x");
var end_pos_y_input = document.getElementById("end_pos_y");

function saveMap(){
    var str = generateMapDescriptor();
    var data = "";
    for (var r=0; r < mazeHeight; r++){
        for (var c=0; c<mazeWidth; c++) {
            if (r == 0 || c == 0 || r == mazeHeight-1 || c == mazeWidth-1){
                data = data.concat("1");
            }
            else{
                if (str.charAt(r * (mazeWidth - 2) + c) == "1") {
                    data = data.concat("1");
                } else {
                    data = data.concat("0");
                }
            }
        }
        data = data.concat("\n");
    }
    mapDescText.value = data;
}

function updateStartPos(){
    //drawGround(startPosX, startPosY);
    clearRobot();
    startPosX = parseInt(start_pos_x_input.value);
    startPosY = parseInt(start_pos_y_input.value);
    robot.xPos = startPosX;
    robot.yPos = startPosY;
    drawRobot();
    //drawStartZone(startPosX, startPosY);
}

function updateEndPos(){
    if (!isRobot(endPosX, endPosY))
        drawGround(endPosX, endPosY);
    endPosX = parseInt(end_pos_x_input.value);
    endPosY = parseInt(end_pos_y_input.value);
    drawEndZone(endPosX, endPosY);
}

function initMaze(){
    for (var i=0; i < mazeHeight; i++){
        cells[i] = [];
        for (var j = 0; j < mazeWidth; j++){
            var newCell = new Cell(j, i);
            if(i==0 || j==0 || i == mazeHeight -1 || j == mazeWidth -1){
                //drawObstacle(j, i);
                newCell.color = OBSTACLE;
            }
            else{
                //drawGround(j, i);
                newCell.color = GROUND;
            }
            cells[i][j]= newCell;
            drawCell(j, i);
            context.font = '16pt';
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = GROUND;
            if (i == 0) context.fillText(j, (j + 0.5) * tileSize, (i + 0.5) * tileSize);
            if (j == 0) context.fillText(i, (j+0.5)*tileSize, (i+0.5)*tileSize);

        }
    }
}

function resetMap(){
    initMaze();
    robot.xPos = startPosX;
    robot.yPos = startPosY;
    robot.face = NORTH;
    drawRobot();
    drawStartZone();
    drawEndZone();
}

function isWall(x, y){
    if (x == 0 || y == 0 || x == mazeWidth-1 || y == mazeHeight-1)
        return true;
}

function isRobot(x, y){
    if ( (x == robot.xPos-1 && y == robot.yPos-1)||
        (x == robot.xPos && y == robot.yPos-1) ||
        (x == robot.xPos +1 && y == robot.yPos-1) ||
        (x == robot.xPos -1 && y == robot.yPos) ||
        (x == robot.xPos && y == robot.yPos) ||
        (x == robot.xPos +1 && y == robot.yPos) ||
        (x == robot.xPos -1 && y == robot.yPos+1) ||
        (x == robot.xPos && y == robot.yPos + 1) ||
        (x == robot.xPos +1 && y == robot.yPos+1)
    )
        return true;

}

function isStartZone(x, y){
    if ( (x == startPosX-1 && y == startPosY-1)||
        (x == startPosX && y == startPosY-1) ||
        (x == startPosX +1 && y == startPosY-1) ||
        (x == startPosX -1 && y == startPosY) ||
        (x == startPosX && y == startPosY) ||
        (x == startPosX +1 && y == startPosY) ||
        (x == startPosX -1 && y == startPosY+1) ||
        (x == startPosX && y == startPosY + 1) ||
        (x == startPosX +1 && y == startPosY+1)
    )
        return true;
}

function isEndZone(x, y){
    if ( (x == endPosX-1 && y == endPosY-1)||
        (x == endPosX && y == endPosY-1) ||
        (x == endPosX +1 && y == endPosY-1) ||
        (x == endPosX -1 && y == endPosY) ||
        (x == endPosX && y == endPosY) ||
        (x == endPosX +1 && y == endPosY) ||
        (x == endPosX -1 && y == endPosY+1) ||
        (x == endPosX && y == endPosY + 1) ||
        (x == endPosX +1 && y == endPosY+1)
    )
        return true;
}

function handleClick(e){
    var x = Math.floor(e.offsetX/tileSize);
    var y = Math.floor(e.offsetY/tileSize);
    //var cell = context.getImageData(e.offsetX, e.offsetY, 1, 1).data;
    //var color = rgbToHex(cell[0], cell[1], cell[2]);

    if (!isWall(x, y) && !isRobot(x, y) && !isEndZone(x, y) && !isStartZone(x, y)){
        if (!isRobot(x, y)){
            if (cells[y][x].color == OBSTACLE){
                cells[y][x].color = GROUND;
            }else if (cells[y][x].color == GROUND){
                cells[y][x].color = OBSTACLE;
            }
            drawCell(x, y);
        }
    }
}

function isObstacle(x, y){
    if (isWall(x, y))
        return true;

    var cell = context.getImageData((x+0.5)*tileSize, (y+0.5)*tileSize, 1, 1).data;
    var color = rgbToHex(cell[0], cell[1], cell[2]);
    if (color == OBSTACLE)
        return true;

    return false;
}

function isFastestPath(x, y){
    var cell = context.getImageData((x+0.5)*tileSize, (y+0.5)*tileSize, 1, 1).data;
    var color = rgbToHex(cell[0], cell[1], cell[2]);

    if (color == FASTEST_PATH)
        return true;

    return false;
}

function isTraversedPath(x, y){
    var cell = context.getImageData((x+0.5)*tileSize, (y+0.5)*tileSize, 1, 1).data;
    var color = rgbToHex(cell[0], cell[1], cell[2]);

    if (color == TRAVERSED)
        return true;

    return false;
}


function rgbToHex(r, g, b){
    var hex = "#";
    hex = hex + ( "000000" + ((r << 16) | (g << 8) | b).toString(16) ).slice(-6);
    return hex;
}

function drawCell(x, y){
    context.fillStyle = cells[y][x].color;
    context.fillRect(x *tileSize, y *tileSize, tileSize, tileSize);
    context.strokeStyle = OBSTACLE;
    context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

function drawObstacle(x, y){
    context.fillStyle = OBSTACLE;
    context.fillRect(x * tileSize, y* tileSize, tileSize, tileSize);
}

function drawGround(x, y){
    context.fillStyle = GROUND;
    context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    context.strokeStyle = OBSTACLE;
    //context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    context.stroke();
}

function drawRobot(){
    drawRobotBody();
    drawRobotFace();
}

function drawRobotBody(){
    context.fillStyle = ROBOT_BODY;
    context.fillRect((robot.xPos-1)*tileSize, (robot.yPos-1)*tileSize, 3*tileSize, 3*tileSize);
}

function clearRobot(){
    for (var i=0; i<mazeHeight; i++){
        for(var j=0; j<mazeWidth; j++){
            if(isRobot(j, i)){
                drawCell(j, i);
            }
        }
    }
}

function drawRobotFace(){
    context.fillStyle = ROBOT_FACE;
    switch(robot.face){
        case NORTH:
            context.fillRect(robot.xPos*tileSize, (robot.yPos-1)*tileSize, tileSize, tileSize);
            break;
        case EAST:
            context.fillRect((robot.xPos+1)*tileSize, robot.yPos*tileSize, tileSize, tileSize);
            break;
        case SOUTH:
            context.fillRect(robot.xPos*tileSize, (robot.yPos+1)*tileSize, tileSize, tileSize);
            break;
        case WEST:
            context.fillRect((robot.xPos-1)*tileSize, robot.yPos*tileSize, tileSize, tileSize);
            break;
    }
}

function drawTraversedPath(){
    context.fillStyle=TRAVERSED;
    context.fillRect((robot.xPos-1)*tileSize, (robot.yPos-1)*tileSize, 3*tileSize, 3*tileSize);
}

function drawFastestPath(x, y){
    context.fillStyle= FASTEST_PATH;
    context.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
    context.strokeStyle = OBSTACLE;
    context.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
}

function move(e){
    var code = e.keyCode;

    switch(code){
        case TURN_LEFT:
            turnDirection(TURN_LEFT);
            break;
        case MOVE_FORWARD:
            if(!senseFront()){
                moveForward();
            }
            else{
                console.log("Cannot move forward");
            }
            break;
        case TURN_RIGHT:
            turnDirection(TURN_RIGHT);
            break;
        case TURN_BACK:
            turnDirection(TURN_BACK);
            break;
        default: break;
    }
}

function moveForward(){
    //if (!isTraversedPath(robot.xPos, robot.yPos))
    //clearRobot();
    switch(robot.face){
        case NORTH:
            if (robot.yPos > 2){
                //drawTraversedPath();
                robot.yPos = robot.yPos - 1;
                drawRobot();
            }
            break;
        case EAST:
            if (robot.xPos < mazeWidth - 3){
                //drawTraversedPath();
                robot.xPos = robot.xPos + 1;
                drawRobot();
            }
            break;
        case SOUTH:
            if (robot.yPos < mazeHeight-3){
                //drawTraversedPath();
                robot.yPos = robot.yPos + 1;
                drawRobot();
            }
            break;
        case WEST:
            if(robot.xPos > 2){
                //drawTraversedPath();
                robot.xPos = robot.xPos - 1;
                drawRobot();
            }
            break;
    }
}

function turnDirection(turnDir){
    switch(robot.face){
        case NORTH:
            switch(turnDir){
                case TURN_LEFT:
                    robot.face =  WEST;
                    drawRobot();
                    break;
                case TURN_RIGHT:
                    robot.face =  EAST;
                    drawRobot();
                    break;
                case TURN_BACK:
                    turnDirection(TURN_LEFT);
                    turnDirection(TURN_LEFT);
                    drawRobot();
                    break;
            }
            break;
        case EAST:
            switch(turnDir){
                case TURN_LEFT:
                    robot.face =  NORTH;
                    drawRobot();
                    break;
                case TURN_RIGHT:
                    robot.face =  SOUTH;
                    drawRobot();
                    break;
                case TURN_BACK:
                    turnDirection(TURN_LEFT);
                    turnDirection(TURN_LEFT);
                    drawRobot();
                    break;
            }
            break;
        case SOUTH:
            switch(turnDir){
                case TURN_LEFT:
                    robot.face =  EAST;
                    drawRobot();
                    break;
                case TURN_RIGHT:
                    robot.face =  WEST;
                    drawRobot();
                    break;
                case TURN_BACK:
                    turnDirection(TURN_LEFT);
                    turnDirection(TURN_LEFT);
                    drawRobot();
                    break;
            }
            break;
        case WEST:
            switch(turnDir){
                case TURN_LEFT:
                    robot.face =  SOUTH;
                    drawRobot();
                    break;
                case TURN_RIGHT:
                    robot.face =  NORTH;
                    drawRobot();
                    break;
                case TURN_BACK:
                    turnDirection(TURN_LEFT);
                    turnDirection(TURN_LEFT);
                    drawRobot();
                    break;
            }
            break;
        default: break;
    }
}

function senseFront(){
    switch(robot.face){
        case NORTH:
            for(var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos-2)){
                    console.log("Sense obstacle in front");
                    return true;
                }
            }
            //console.log("No obstacle in front");
            break;
        case EAST:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+2, robot.yPos+i)){
                    console.log("Sense obstacle in front");
                    return true;
                }
            }
            break;
        case SOUTH:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos+2)){
                    console.log("Sense obstacle in front");
                    return true;
                }
            }
            break;
        case WEST:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos-2, robot.yPos+i)){
                    console.log("Sense obstacle in front");
                    return true;
                }
            }
            break;
        default: break;
    }
    return false;
}

function senseLeft(){
    switch(robot.face){
        case NORTH:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos-2, robot.yPos+i)){
                    console.log("Sense obstacle on left");
                    return true;
                }
            }
            break;
        case EAST:
            for(var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos-2)){
                    console.log("Sense obstacle on the left");
                    return true;
                }
            }
            break;
        case SOUTH:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+2, robot.yPos+i)){
                    console.log("Sense obstacle on left");
                    return true;
                }
            }
            break;
        case WEST:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos+2)){
                    console.log("Sense obstacle on left");
                    return true;
                }
            }
            break;
        default: break;
    }
    return false;
}

function senseRight(){
    switch(robot.face){
        case NORTH:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+2, robot.yPos+i)){
                    console.log("Sense obstacle on the Right");
                    return true;
                }
            }
            break;
        case EAST:
            for(var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos+2)){
                    console.log("Sense obstacle on the Right");
                    return true;
                }
            }
            break;
        case SOUTH:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos-2, robot.yPos+i)){
                    console.log("Sense obstacle on the Right");
                    return true;
                }
            }
            break;
        case WEST:
            for (var i=-1; i<=1; i++){
                if(isObstacle(robot.xPos+i, robot.yPos-2)){
                    console.log("Sense obstacle on the Right");
                    return true;
                }
            }
            break;
        default: break;
    }
}
function drawStartZone(){
    context.fillStyle= START_ZONE;
    if (!isRobot(startPosX, startPosY))
        context.fillRect(startPosX*tileSize, startPosY*tileSize, tileSize, tileSize);
}

function drawEndZone(){
    context.fillStyle= END_ZONE;
    if (!isRobot(endPosX, endPosY))
        context.fillRect(endPosX*tileSize, endPosY*tileSize, tileSize, tileSize);
}
function printRobot(){
    console.log("RobotPosition: " + robot.xPos + ", " + robot.yPos + ". Robot face " + getDirection(robot.face));
}

function getDirection(dir){
    switch(dir){
        case NORTH:
            return "North";
        case EAST:
            return "East";
        case SOUTH:
            return "South";
        case WEST:
            return "West";
        default:
            return "None";
    }
}

function getRobotAction(act){
    switch(act){
        case MOVE_FORWARD:
            return "MoveF";
        case TURN_LEFT:
            return "TurnL";
        case TURN_RIGHT:
            return "TurnR";
        case TURN_BACK:
            return "TurnB";
        default: return "None";
    }
}

function explore(){
    drawEndZone();
    //leftHandExplore(goalPosX, goalPosY);
    var timer = setInterval(function(){
        if (((robot.xPos == endPosX)&&(robot.yPos == endPosY))){
            clearInterval(timer);
            exploreToStart();
        }
        leftHandExplore();
    },50);
}

function exploreToStart(){
    drawStartZone();
    var timer = setInterval(function() {
        if (((robot.xPos == startPosX)&&(robot.yPos == startPosY))){
            clearInterval(timer);
            prepareFastestPath();
        }else{
            leftHandExplore();
        }
    }, 50);
}

function prepareFastestPath(){
    alert("Exploration finished :D!");

    switch(robot.face){
        case EAST:
            turnDirection(TURN_LEFT);
            break;
        case SOUTH:
            turnDirection(TURN_BACK);
            break;
        case WEST:
            turnDirection(TURN_RIGHT);
            break;
        default: break;
    }
    alert(" Ready for fastest path!");
}

function leftHandExplore() {
    if (senseLeft()){
        if (!senseFront()){
            drawTraversedPath();
            moveForward();
        }else if(!senseRight()){
            turnDirection(TURN_RIGHT);
        }else{
            turnDirection(TURN_BACK);
        }
    }else{
        turnDirection(TURN_LEFT);
        drawTraversedPath();
        moveForward();
    }
}


function fastestPath(){
    var path = aStar();

    clearFastestPath();
    for(var i=0; i< path.length; i++){
        drawFastestPath(path[i].x, path[i].y);
    }
    drawRobot();

    var c=0;

    var timer = setInterval(function(){
        if (c == path.length -1){
            clearInterval(timer);
            alert("Fastest path finished!");
        }
        animateFastestPath(path[c]);
        c += 1;
    },100);
}


function animateFastestPath(node){
    if (node.act == MOVE_FORWARD) {
        moveForward();
    } else if (node.act == TURN_LEFT) {
        turnDirection(TURN_LEFT);
        moveForward();
    } else if (node.act == TURN_RIGHT) {
        turnDirection(TURN_RIGHT);
        moveForward();
    } else if (node.act == TURN_BACK) {
        turnDirection(TURN_BACK);
        moveForward();
    }
}

function clearFastestPath(){
    for (var i=0; i < mazeHeight; i++){
        for (var j = 0; j < mazeWidth; j++){
            if(isFastestPath(j, i)){
                drawGround(j, i);
            }
        }
    }
}

// START A STAR
function aStar(){
    var visitable = convertBinaryToBoolean(generateMapDescriptor());
    var graphNodes = generateNodes(visitable);
    var startNode = graphNodes[robot.yPos-1][robot.xPos - 1];
    var endNode = graphNodes[endPosY-1][endPosX-1];

    startNode.dir = robot.face;
    startNode.gn = 0;
    startNode.fn = startNode.gn + calculateHn(startNode, endNode);

    var openList = [];
    openList.push(startNode);

    while(openList.length > 0){
        var currentNode = openList[0];
        if(currentNode == endNode){
            var path = reconstructPath(endNode);
             printPath(path);
            displayText(generateFnString(graphNodes) + "\nDirection\n" + generateDirection(graphNodes) + "\nActions:\n" + generateAction(graphNodes));
            return path;
        }
        openList.shift();
        currentNode.evaluated = true;

        var neighbours = findNeighbours(currentNode, graphNodes);
        for (var i=0; i < neighbours.length; i++){
            if (neighbours[i].evaluated){
                continue;
            }
            var temp_gn = currentNode.gn + 1;

            var turns = findNumberOfTurns(currentNode, neighbours[i]);
            temp_gn = temp_gn + 0.5 * turns;

            if (openList.indexOf(neighbours[i]) == -1){
                openList.push(neighbours[i]);
                openList.sort(compareFn);
            } else if (temp_gn >= neighbours[i].gn){
                continue;
            }

            updateDirection(currentNode, neighbours[i]);

            neighbours[i].parent = currentNode;
            neighbours[i].gn = temp_gn;
            neighbours[i].fn = neighbours[i].gn + calculateHn(neighbours[i], endNode);
        }

    }
    return -1;
}

function findNumberOfTurns(curNode, nextNode){
    if(nextNode.y == curNode.y-1){
        switch(curNode.dir){
            case NORTH:
                return 0;
            case EAST:
                return 1;
            case SOUTH:
                return 2;
            case WEST:
                return 1;
        }
    }
    if(nextNode.x == curNode.x+1){
        switch(curNode.dir){
            case NORTH:
                return 1;
            case EAST:
                return 0;
            case SOUTH:
                return 1;
            case WEST:
                return 2;
        }
    }
    if(nextNode.y == curNode.y+1){
        switch(curNode.dir){
            case NORTH:
                return 2;
            case EAST:
                return 1;
            case SOUTH:
                return 0;
            case WEST:
                return 1;
        }
    }
    if(nextNode.x == curNode.x-1){
        switch(curNode.dir){
            case NORTH:
                return 1;
            case EAST:
                return 2;
            case SOUTH:
                return 1;
            case WEST:
                return 0;
        }
    }

    return 0;
}

function updateAction(curNode, nextNode){
    if(curNode.dir == nextNode.dir){
        curNode.act = MOVE_FORWARD;
    }
    else{
        switch(curNode.dir){
            case NORTH:
                switch(nextNode.dir){
                    case EAST: curNode.act  = TURN_RIGHT; break;
                    case SOUTH: curNode.act  = TURN_BACK; break;
                    case WEST: curNode.act = TURN_LEFT; break;
                    default: break;
                }
                break;
            case EAST:
                switch(nextNode.dir){
                    case NORTH:  curNode.act = TURN_LEFT;  break;
                    case SOUTH: curNode.act  = TURN_RIGHT; break;
                    case WEST: curNode.act  = TURN_BACK; break;
                    default: break;
                }
                break;
            case SOUTH:
                switch(nextNode.dir){
                    case NORTH: curNode.act  = TURN_BACK; break;
                    case EAST:   curNode.act  = TURN_LEFT; break;
                    case WEST: curNode.act  = TURN_RIGHT; break;
                    default: break;
                }
                break;
            case WEST:
                switch(nextNode.dir){
                    case NORTH: curNode.act  = TURN_RIGHT; break;
                    case EAST: curNode.act  = TURN_BACK; break;
                    case SOUTH:  curNode.act  = TURN_LEFT;  break;
                    default: break;
                }
                break;
            default: break;
        }
    }
}

function updateDirection(curNode, nextNode){
    if(nextNode.y == curNode.y-1){
        nextNode.dir = NORTH;
    }
    else if( nextNode.x == curNode.x+1){
        nextNode.dir = EAST;
    }
    else if(nextNode.y == curNode.y+1){
        nextNode.dir = SOUTH;
    }
    else if( nextNode.x == curNode.x-1){
        nextNode.dir = WEST;
    }
}

function printPath(path){
    for (var i=0; i < path.length; i++){
        console.log("i = " + i + ": " + path[i]);
    }
}

function reconstructPath(cur){
    cur.x += 1;
    cur.y += 1;
    cur.fn = -4;
    path = [cur];
    while(cur.parent != null){
        cur = cur.parent;
        cur.x = cur.x + 1;
        cur.y = cur.y + 1;
        cur.fn = -4;
        path.unshift(cur);
    }
    for (var i=0; i<path.length-1; i++){
        updateAction(path[i], path[i+1]);
    }

    return path;
}

function compareFn(a, b){
    if(a.fn > b.fn)
        return 1;
    else if (a.fn < b.fn)
        return -1;
    return 0;
}
function generateDirection(arr){
    var str = "";

    for(var r = 0; r < mazeHeight-2; r++){
        for (var c=0; c< mazeWidth-2; c++){
            str += getDirection(arr[r][c].dir);
            str +=" ";
        }
        str+="\n";
    }
    return str;
}

function generateAction(arr){
    var str = "";

    for(var r = 0; r < mazeHeight-2; r++){
        for (var c=0; c< mazeWidth-2; c++){
            str += getRobotAction(arr[r][c].act);
            str +=" ";
        }
        str+="\n";
    }
    return str;
}

function generateFnString(arr){
    var str = "";

    for(var r = 0; r < mazeHeight-2; r++){
        for (var c=0; c< mazeWidth-2; c++){
            str += arr[r][c].fn;
            str +=" ";
        }
        str+="\n";
    }
    return str;
}

function generateNodes(arr){
    var nodes = [];
    for(var r = 0; r < mazeHeight-2; r++){
        nodes[r] = [];
        for (var c=0; c< mazeWidth-2; c++){
            var node = new Node(c, r);

            if (!arr[r][c]){
                node.fn = -1;
                node.gn = -1;
            }else if (r == 0 || c == 0 || r == mazeHeight-3 || c == mazeWidth-3){
                node.fn = -2;
                node.gn = -2;
            }else if (!arr[r-1][c] || !arr[r][c-1] || !arr[r+1][c] || !arr[r][c+1] || !arr[r-1][c-1] || !arr[r+1][c+1] || !arr[r-1][c+1] || !arr[r+1][c-1]){
                node.fn = -3;
                node.gn = -3;
            }
            else{
                node.fn = 500;
                node.gn = 500;
            }

            nodes[r][c] = node;
        }
    }
    return nodes;
}

function findNeighbours(node, nodes) {
    var x = node.x;
    var y = node.y;

    var N = y-1;
    var E = x + 1;
    var S = y+1;
    var W = x-1;

    var neighbours = [];

    if (nodes[N][x].fn > -1){
        neighbours.push(nodes[N][x]);
        //console.log("North neighbour of node " + node + " is: " + nodes[N][x]);
    }
    if (nodes[y][E].fn > -1){
        neighbours.push(nodes[y][E]);
        //console.log("East neighbour of node " + node + " is: " + nodes[y][E]);
    }
    if (nodes[S][x].fn > -1){
        neighbours.push(nodes[S][x]);
        //console.log("South neighbour of node " + node + " is: " + nodes[S][x]);
    }
    if(nodes[y][W].fn > -1){
        neighbours.push(nodes[y][W]);
        //console.log("West neighbour of node " + node + " is: " + nodes[y][W]);
    }

    return neighbours;
}

function Node(x, y){
    this.x = x;
    this.y = y;
    this.fn = 0;
    this.gn = 0;
    this.dir = NOTHING;
    this.act = NOTHING;
    this.parent = null;
    this.evaluated = false;
}

Node.prototype.toString = function(){
    return "[" + this.x + "," + this.y + "]" + ", dir: " + getDirection(this.dir);
}

function generateIndex(x, y){
    return y*(mazeWidth-2) + x;
}

function calculateHn(point, goal){
    return Math.abs(point.x-goal.x) + Math.abs(point.y - goal.y);
}

// END OF A STAR

function convertBooleanToBinary(arr){
    var str = "";

    for(var r=0; r < mazeHeight-2; r++){
        for(var c = 0; c < mazeWidth-2; c++){
            if (arr[r][c]){
                str.concat("0");
            }
            else{
                str.concat("1");
            }
        }
        str.concat("\n");
    }

    return str;
}

function convertBinaryToBoolean(str){
    var arr = [];

    for(var r=0; r < mazeHeight-2; r++){
        arr[r] = [];
        for(var c = 0; c < mazeWidth-2; c++){
            arr[r][c] = str.charAt(r * (mazeWidth - 2) + c) != "1";
        }
    }
    return arr;
}

function generateMapDescriptor(){
    var str = "";

    for(var row = 1; row < mazeHeight-1; row++){
        for(var col=1; col < mazeWidth-1; col++){
            if(isObstacle(col, row)){
                str = str.concat("1");
            }else{
                str = str.concat("0");
            }
        }
    }
    return str;
}

function printMapDescriptor(){
    var str = "11";
    str = str.concat(generateMapDescriptor());
    str = str.concat("11");

    var hexStr = convertBinaryToHex(str);
    mapDescText.value = hexStr;
}

function displayText(text){
    displayTextArea.value = text;
}

function convertBinaryToHex(str){
    var output = "";
    for (var i=0; i<str.length;i+=4){
        var fourChar = str.substr(i, 4);
        var hex = parseInt(fourChar, 2).toString(16).toUpperCase();
        output += hex;
    }
    return output;
}

resetMap();