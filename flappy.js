/* 
Tiffany Ang, Jenny Wang
11/19/14 
CS 307

creates a 3D scene of flappy bird, with a bunny instead of a bird 
Current status: Single static frame of game

Dimensions of objects
Whole scene: -520 to 520 on the x-axis, -250 to 250 on the y-axis
Bunny: -[bodyRadius*bodyScale+tailRadius] to [bodyRadius*bodyScale+headRadius]
		-16 to 20 on the x-axis

		-[bodyRadius+appRadius] to [bodyRadius+headRadius+appRadius*appScale]
		-12 to 26 on the y-axis

		-[bodyRadius] to [bodyRadius]
		-10 to 10 on the z-axis
All pipe sets: [pipeOffsetX-pipeEndRadius] to [pipeOffsetX-pipeEndRadius]+[pipeOffsetX*number of pipes]
			   114 to 634 on the x-axis

			  -250 to 250 on the y-axis

			  -[pipeEndRadius] to [pipeEndRadius]
			  -16 to 16 on the z-axis

*/

var params = {
	fovy: 50,
	cameraAdjustX: -200,
	cameraAdjustY: 0,
	sceneHeight: 500,
	sceneDepth: 10,

    bunnyStartOffset: -300,
	pipeRadius: 25,
	pipeCylDetail: 20,
	topPipeHeights: [140, 160, 150, 80, 20, 10, 30, 50],
	pipeColor: new THREE.Color(0x66FF66), // light green
	pipeEndColor: new THREE.Color(0x47B247), // dark green
	pipeEndRadius: 26,
	pipeEndHeight: 3,
    pipeSpaceHeight: 120, // space between top and bottom pipes (vertical)
	pipeOffsetX: 300, // space between pipe sets (horizontal)
	numPipes: 5,

	ambLightColor: 0x808080, // soft, light gray
	directionalLightColor: 0xffffff, // white
	lightIntensity: .3,
	directionalX: 0, 
	directionalY: 2,
	directionalZ: 4,

	deltaT: 0.0035,
	bunnyDeltaY: 2,
	bunnyJumpY: 40,
	pipesDeltaX: 1
};

var scene = new THREE.Scene();

// spaces between the pipes times number of pipes
var sceneWidth = params.numPipes*params.pipeOffsetX;

var renderer = new THREE.WebGLRenderer();
function render() {
    renderer.render(scene, camera);
}

TW.mainInit(renderer,scene);

var canvas = TW.lastClickTarget;

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

// creates a custom camera
function myCamera(fovy, eye, at) {
	var canvas = TW.lastClickTarget;
	camera = new THREE.PerspectiveCamera( fovy, canvasWidth/canvasHeight, 1, 600);
	camera.position.copy(eye);
	camera.lookAt(at);
	scene.add(camera);
}

//adjust camera to display scene with bunny on far left and zoomed in view 
var eye = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 500);
var at = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 0);
myCamera(params.fovy, eye, at);
render();

// returns a plane with a background image texture-mapped onto it
function loadBackground(params) {
    var planeGeom = new THREE.PlaneGeometry(sceneWidth*2+params.pipeRadius*2, params.sceneHeight*2+params.pipeRadius*2);
    var imageLoaded = false;
    var backgroundTexture = new THREE.ImageUtils.loadTexture( "/images/background-orig.jpg",
                                                         THREE.UVMapping,
                                                         // onload event handler
                                                         function () {
                                                             console.log("image is loaded.");
                                                             imageLoaded = true;
                                                             render();
                                                         });
    var backgroundMat = new THREE.MeshBasicMaterial(
        {color: THREE.ColorKeywords.white,
         map: backgroundTexture});
    
    var backgroundMesh = new THREE.Mesh( planeGeom, backgroundMat );
    backgroundMesh.position.x = 0;
    backgroundMesh.position.z = -params.pipeRadius*2;
    console.log(backgroundMesh);
    return backgroundMesh;
}

var bunny, pipes;
/* adds and positions background plane, a bunny, all pipe sets, and 
	lights to the scene */
function buildScene(params, scene) {
	var background = loadBackground(params);
	scene.add(background);

	bunny = awangatangBunny();
    bunny.position.x = params.bunnyStartOffset;
    bunny.scale.set(2, 2, 2); // enlarge bunny
	scene.add(bunny);

	pipes = buildAllPipes(params.numPipes);
	for(pipeIndex in pipes) {
		scene.add(pipes[pipeIndex]);
	} 

	var ambLight = new THREE.AmbientLight(params.ambLightColor);
	scene.add(ambLight);

	var directionalLight = new THREE.DirectionalLight(params.directionalLightColor,
													  params.lightIntensity);
    directionalLight.position.set( params.directionalX, 
                                   params.directionalY, 
                                   params.directionalZ ); 
    scene.add(directionalLight);
	render();
}	

buildScene(params, scene);


// State variables of the animation
var animationState;
 
function resetAnimationState() {
    animationState = {
        bunnyPosY: 0, // fall from initial height
        pipePosX: params.pipeOffsetX,
        time: 0
    };
}
 
resetAnimationState();
 
function firstState() {
    resetAnimationState();
    setBunnyPosition(0);
    setPipesPosition(0);
    render();
}

function setBunnyPosition(time) {
	// console.log(bunny.position.y);
	var updatedPos = animationState.bunnyPosY - params.bunnyDeltaY;
	bunny.position.y = updatedPos;
	// console.log(bunny.position.y);
	console.log("bunny moved");
	return updatedPos;
}

function setPipesPosition(time) {
	var updatedPos = animationState.pipePosX - params.pipesDeltaX;
	for(pipeIndex in pipes) {
		console.log(pipes[pipeIndex].position.x);
		pipes[pipeIndex].position.x = updatedPos + (pipeIndex)*params.pipeOffsetX;
		console.log(pipes[pipeIndex].position.x);
	} 
	return updatedPos;
}

var jumping = false;
 
function updateState() {
    // changes the time and everything in the state that depends on it
    animationState.time += params.deltaT;
    var time = animationState.time;
    if( !jumping) {
    	var bunnyPosY = setBunnyPosition(time);
    }
    else {
    	var bunnyPosY = animationState.bunnyPosY+ params.bunnyJumpY;
    	bunny.position.y = bunnyPosY;
    	jumping = false;
    }
    var pipePosX = setPipesPosition(time);
    console.log("time is now "+time+" and bunny is at height "+bunnyPosY +"and pipes are at position" + pipePosX);
    animationState.bunnyPosY = bunnyPosY;
    animationState.pipePosX = pipePosX;
}
                
function oneStep() {
    updateState();
    render();
}
    
 
var animationId = null;   // so we can cancel the animation if we want
 
function animate(timestamp) {
    oneStep();
    animationId = requestAnimationFrame(animate);
}
 
function stopAnimation() {
    if( animationId != null ) {
        cancelAnimationFrame(animationId);
    }
}

function oneJump() {
	jumping = true;
	// animationState.bunnyPosY+= params.bunnyJumpY;
	// params.bunnyPosY = animationState.bunnyPosY;
	// updateState();
	// render();
}

 
TW.setKeyboardCallback("0",firstState,"reset animation");
TW.setKeyboardCallback("1",oneStep,"advance by one step");
TW.setKeyboardCallback("g",animate,"go:  start animation");
TW.setKeyboardCallback("s",stopAnimation,"stop animation");
TW.setKeyboardCallback(" ",oneJump,"bunny jump");
 
// var gui = new dat.GUI();
// gui.add(guiParams,"ballRadius",0.1,3).onChange(function(){makeScene();TW.render();});
// gui.add(guiParams,"deltaT",0.001,0.999).step(0.001);
// gui.add(guiParams,"ballBouncePeriod",1,30).step(1);



