/* 
Tiffany Ang, Jenny Wang
12/07/14
CS 307

creates a 3D scene of flappy bird, with a bunny instead of a bird 
Current status (11/19): Single static frame of game
Current status (12/7): Working game

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
	cameraAdjustX2: 400,
	cameraAdjustY: 0,

	bunnyScale: 2,
    bunnyStartOffset: -300,
	pipeRadius: 25,
	pipeCylDetail: 20,
	topPipeHeights: [140, 160, 150, 80, 20, 10, 30, 50],
	pipeColor: new THREE.Color(0x339933), // light green
	pipeEndColor: new THREE.Color(0x246B24), // dark green
	pipeEndRadius: 26,
	pipeEndHeight: 7,
    pipeSpaceHeight: 150, // space between top and bottom pipes (vertical)
	pipeOffsetX: 300, // space between pipe sets (horizontal)
	numPipes: 5,

	ambLightColor: 0xffffff, // soft, light gray
	directionalLightColor: 0xffffff, // white
	lightIntensity: .3,
	directionalX: 0, 
	directionalY: 2,
	directionalZ: 4,

	deltaT: 0.0035,
	bunnyDeltaY: 2.3,
	bunnyDeltaZ: 2,
	bunnyJumpY: 40,
	bunnyTiltDown: TW.degrees2radians(-2),
	bunnyTiltUp: TW.degrees2radians(30),
	tiltDownMax: -Math.PI/8,
	tiltUpMax: 0,
	pipesDeltaX: 2,

	scorePosX: -300,
	endTextPosX: -500
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
	camera = new THREE.PerspectiveCamera( fovy, canvasWidth/canvasHeight, 1, sceneWidth*2);
	camera.position.copy(eye);
	camera.lookAt(at);
	scene.add(camera);
}

//adjust camera to display scene with bunny on far left and zoomed in view 
var eye = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 500);
var at = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 0);
myCamera(params.fovy, eye, at);
render();

function changeView(level) {
	 scene.remove(camera);
	 if(level == 1) {
	 	//set camera for level 1
	 	var eye = new THREE.Vector3(params.cameraAdjustX,
	 		params.cameraAdjustY, 500);
	 	var at = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 0);
	 	myCamera(params.fovy, eye, at);
	 } else if(level == 2) {
	 	//set camera for level 2
	 	var eye = new THREE.Vector3(params.cameraAdjustX-params.cameraAdjustX2,
	 		params.cameraAdjustY, 500);
	 	var at = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 0);
	 	myCamera(params.fovy, eye, at);
	 }
	 render();
 }

var bunny, pipes;
// bounding boxes around bunny and pipes
var bunnyBox; 
var pipeBoxArray = new Array();

var texture = THREE.ImageUtils.loadTexture( "images/cutecloud.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 4, 4 );

/* adds and positions background plane, a bunny, all pipe sets, and 
	lights to the scene */
function buildScene(params, scene) {
	var sphereBackground = new THREE.Mesh(
 		new THREE.SphereGeometry(sceneWidth, 50, 50),
  		new THREE.MeshBasicMaterial({
    		map: texture
  		})
	);
	sphereBackground.scale.x = -1;
	scene.add(sphereBackground);

	// scene.fog = new THREE.FogExp2( 0xD6EBFF, 0.0008 );

	bunny = awangatangBunny();
    bunny.position.x = params.bunnyStartOffset;
    // enlarge bunny
    bunny.scale.set(params.bunnyScale, params.bunnyScale, params.bunnyScale); 
    bunny.name = "rabbit";
	scene.add(bunny);
	bunnyBox = new THREE.Box3();
	bunnyBox.setFromObject(bunny);

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

var onLevel2 = false;

function resetAnimationState() {
    animationState = {
        bunnyPosY: 0, // fall from initial height
        bunnyPosZ: 0,
        pipePosX: params.pipeOffsetX,
        time: 0
    };
}
 
resetAnimationState();

// reset game to initial position at level 1
function firstState() {
	//set camera to level 1 pos
	onLevel2 = false;
	changeView(1);
    resetAnimationState();
    scene.remove(scene.getObjectByName("endTextMesh"));
    scene.remove(scene.getObjectByName("scoreText"));

	//remove pipes
	for(pipeIndex in pipes) {
		scene.remove(pipes[pipeIndex]);
	} 

	//rebuild all pipe sets
	pipes = buildAllPipes(params.numPipes);

	for(pipeIndex in pipes) {
		scene.add(pipes[pipeIndex]);
	} 
	// resets bunny's position and tilt
	bunny.rotation.z = 0;
    bunny.position.set(params.bunnyStartOffset,0,0);

    render();
}

// decreases bunny's y position
function setBunnyPosition(time) {
	var updatedPos = animationState.bunnyPosY - params.bunnyDeltaY;
	bunny.position.y = updatedPos;
	console.log("bunny moved");
	return updatedPos;
}

// decreases pipes' x position
function setPipesPosition(time) {
	var updatedPos = animationState.pipePosX - params.pipesDeltaX;
	for(pipeIndex in pipes) {
		pipes[pipeIndex].position.x = updatedPos + (pipeIndex)*params.pipeOffsetX;
	} 
	return updatedPos;
}

// changes game to level 2
function level2() {
	firstState();
	onLevel2 = true;

	//change camera view
	changeView(2);

	// rotate text
	var endTextMesh = scene.getObjectByName("endTextMesh");
	var scoreTextMesh = scene.getObjectByName("scoreText");

	//remove pipes
	for(pipeIndex in pipes) {
		scene.remove(pipes[pipeIndex]);
	} 

	//rebuild all pipe sets
	pipes = buildAllPipes(params.numPipes);

	var min = -100;
	var max = 100;

	//setting random z position for each pipeset in pipes
	for(pipeIndex in pipes) {
		var randomZ = getRandomInt(min,max);
		pipes[pipeIndex].position.z = randomZ;
		scene.add(pipes[pipeIndex]);
	} 
}

// returns number of pipes passed
function getScore() {
	var score = Math.ceil((animationState.pipePosX/params.pipeOffsetX))*-1;
	// prints 0 for any no pipes passed
    
    if(score<=0) {
		score = 0;
	}
	// creates text geometry of score
	var textGeom;
	var material = new THREE.MeshBasicMaterial({
        color: 0x000000
    });
	   textGeom = new THREE.TextGeometry(score, 
			{size: 50, height: 0, weight: "bold", font: 'audimat mono'});
	var textMesh = new THREE.Mesh(textGeom, material);
	textMesh.position.set(params.scorePosX, 100, params.pipeEndRadius*2); // in front of pipes
	textMesh.name = "scoreText";
	scene.remove(scene.getObjectByName("scoreText"));
	if(onLevel2) {
		textMesh.rotation.y = (-Math.PI/6);
	}
	scene.add(textMesh);

	return score;
}



// adds a text geometry of win status to the scene
function endText(win) {

	//remove pipes
	for(pipeIndex in pipes) {
		scene.remove(pipes[pipeIndex]);
	} 
	var textGeom;
	var material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
    });

	if(win) {
		textGeom = new THREE.TextGeometry('YOU WIN, press 2 for level 2', 
			{size: 20, height: 0, weight: "bold", 
			font: 'bitstream vera sans mono'});
	} else {
		textGeom = new THREE.TextGeometry('GAME OVER, press 2 to try level 2', 
			{size: 20, height: 0, weight: "bold", 
			font: 'bitstream vera sans mono'});
	}
	var textMesh = new THREE.Mesh(textGeom, material);
	textMesh.name = "endTextMesh"
	textMesh.position.set(params.endTextPosX, -20, params.pipeEndRadius); // in front of pipes
	if(onLevel2) {
		textMesh.rotation.y = (-Math.PI/6);
	}
	// var textPlane = new THREE.PlaneGeometry(400, 400, 40);
	// planeMat = new THREE.MeshBasicMaterial();
    
 //    planeMesh = new THREE.Mesh( textPlane, planeMat );
	// planeMesh.position.set(params.endTextPosX, -30, params.pipeEndRadius); // in front of pipes
	// // textPlane.add(textMesh);
	// scene.add(planeMesh);
	scene.add(textMesh);
	render();
}


var jumping = false;
 
function updateState() {
    // changes the time and everything in the state that depends on it
    animationState.time += params.deltaT;
    var time = animationState.time;
    // stops bunny from falling when it is jumping
    // tilts bunny down when falling, up when jumping
    if(!jumping) {
    	var bunnyPosY = setBunnyPosition(time);
    	if(bunny.rotation.z > params.tiltDownMax) {
    		bunny.rotation.z += params.bunnyTiltDown;
    	}
    }
    else {
    	var bunnyPosY = animationState.bunnyPosY+ params.bunnyJumpY;
    	bunny.position.y = bunnyPosY;
    	if(bunny.rotation.z < params.tiltUpMax) {
    		bunny.rotation.z += params.bunnyTiltUp;
    	}
    	console.log(bunny.rotation.z);
    	jumping = false;
    }
    var pipePosX = setPipesPosition(time);
    animationState.bunnyPosY = bunnyPosY;
    animationState.pipePosX = pipePosX;

    // moves bunny's box along with bunny
    bunnyBox.setFromObject(bunny);

    // moves pipes' bounding boxes along w/ pipes
    for(var i = 0; i < pipes.length; i++) {
    	var currentPipeSet = pipes[i];
    	var topSeg = pipes[i].getObjectByName( "topSeg" );
    	var bottomSeg = pipes[i].getObjectByName( "bottomSeg" );
    	pipeBoxArray[i*2].setFromObject(topSeg);
    	pipeBoxArray[(i*2)+1].setFromObject(bottomSeg);
    }

    var score = getScore();

    // if bunny hits pipe, end game, print "game over" text
    for(var i = 0; i < pipeBoxArray.length; i++) {
    if (bunnyBox.isIntersectionBox(pipeBoxArray[i])) {
    	console.log("bunny/pipe intersect");
		//bunny fading goes here
    	endText(false);
    	window.cancelAnimationFrame(requestAnimationFrame());
    	}
    }

    // if bunny hits floor/ceiling, end game, print "game over" text
    if(bunnyBox.min.y <= (-sceneWidth) || bunnyBox.min.y >= (sceneWidth)) {
    	console.log("floor/ceiling die");
    	//bunny fading goes here
    	endText(false);
    	window.cancelAnimationFrame(requestAnimationFrame());
    }

    // win, print "you win" text and end game
    if(score == params.numPipes) {
    	// when win, remove pipes from scene
    	for(pipeIndex in pipes) {
			scene.remove(pipes[pipeIndex]);
		} 
    	endText(true);
    	window.cancelAnimationFrame(requestAnimationFrame());
    }
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

// when space bar is pressed, bunny jumping is set to true
function oneJump() {
	jumping = true;
}

// when 'a' key is pressed, bunny moves left/negative on the z-axis
function zMoveLeft() {
	if(bunny.position.z + params.bunnyDeltaZ > -100) {
		console.log("initial z: " + bunny.position.z);
		bunny.position.z -= params.bunnyDeltaZ;
		console.log("after move: " + bunny.position.z);
		render();
	}
}

// when 'd' key is pressed, bunny moves right/positive on the z-axis
function zMoveRight() {
	if(bunny.position.z + params.bunnyDeltaZ < 100) {
		console.log("initial z: " + bunny.position.z);
		bunny.position.z += params.bunnyDeltaZ;
		console.log("after move: " + bunny.position.z);
		render();
	}
}

TW.setKeyboardCallback("0",firstState,"reset animation");
TW.setKeyboardCallback("1",oneStep,"advance by one step");
TW.setKeyboardCallback("g",animate,"go:  start animation");
TW.setKeyboardCallback("s",stopAnimation,"stop animation");
TW.setKeyboardCallback(" ",oneJump,"bunny jump");
// TW.setKeyboardCallback("v",changeView,"change camera");
TW.setKeyboardCallback("2",level2,"change to level 2");
TW.setKeyboardCallback("a",zMoveLeft,"move bunny left/negative on z axis");
TW.setKeyboardCallback("d",zMoveRight,"move bunny right/positive on z axis");


