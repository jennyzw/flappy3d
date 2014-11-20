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
	cameraAdjustX: 50,
	cameraAdjustY: 0,
	sceneHeight: 250,
	sceneDepth: 10,

    bunnyStartOffset: 0,
	pipeRadius: 15,
	pipeCylDetail: 20,
	topPipeHeights: [40, 60, 50, 80],
	pipeColor: new THREE.Color(0x66FF66), // light green
	pipeEndColor: new THREE.Color(0x47B247), // dark green
	pipeEndRadius: 16,
	pipeEndHeight: 3,
    pipeSpaceHeight: 90, // space between top and bottom pipes (vertical)
	pipeOffsetX: 130, // space between pipe sets (horizontal)

	ambLightColor: 0x808080, // soft, light gray
	directionalLightColor: 0xffffff, // white
	lightIntensity: .3,
	directionalX: 0, 
	directionalY: 2,
	directionalZ: 4 
};

var scene = new THREE.Scene();

// spaces between the pipes times number of pipes
var sceneWidth = params.topPipeHeights.length*params.pipeOffsetX;

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
	camera = new THREE.PerspectiveCamera( fovy, canvasWidth/canvasHeight, 1, 300);
	camera.position.copy(eye);
	camera.lookAt(at);
	scene.add(camera);
}

//adjust camera to display scene with bunny on far left and zoomed in view 
var eye = new THREE.Vector3(params.cameraAdjustX, params.cameraAdjustY, 250);
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

/* returns a single pipe object, made from cylinders */
function buildPipe(params, pipeHeight) { 
	var radius = params.pipeRadius;
    var cd  = params.pipeCylDetail;
    var height = pipeHeight;
    var endHeight = params.pipeEndHeight;

    var pipe = new THREE.Object3D();

    var pipeGeom = new THREE.CylinderGeometry(radius, radius, height, cd);
    var pipeMat = new THREE.MeshPhongMaterial( {color: params.pipeColor,
     											ambient: params.pipeColor,  
                                                specular: 0xFFFFFF,
                                                shininess: 5} );
    var pipeMesh = new THREE.Mesh( pipeGeom, pipeMat );

    pipeMesh.position.set(0, height/2, 0); 

    var pipeEndGeom = new THREE.CylinderGeometry(params.pipeEndRadius, params.pipeEndRadius, endHeight, cd);
    var pipeEndMat = new THREE.MeshPhongMaterial( {color: params.pipeEndColor,
     												ambient: params.pipeEndColor,  
                                                    specular: 0xFFFFFF,
                                                    shininess: 5} );
    var pipeEndMesh = new THREE.Mesh(pipeEndGeom, pipeEndMat);
	pipeEndMesh.position.set(0, height-1, 0); 

    pipe.add(pipeEndMesh)
    pipe.add(pipeMesh);
	return pipe;
}

/* calls buildPipe(params, pipeHeight)
	returns 1 pipe set containing 1 top pipe and 1 bottom pipe 
	takes in index of the pipe set currently building */
function buildPipeSet(params, pipeIndex) {
	var pipeSet = new THREE.Object3D();
	var sceneHeight = params.sceneHeight;
	var sceneHeightHalf = sceneHeight/2;

	var pipeSpaceHeight = params.pipeSpaceHeight;
	var topHeight = params.topPipeHeights[pipeIndex];
	var bottomHeight = sceneHeight - topHeight - pipeSpaceHeight;

	var topPipe = buildPipe(params, topHeight);
	var bottomPipe = buildPipe(params, bottomHeight);

	topPipe.rotateX(Math.PI); // flips top pipe upside-down
	topPipe.position.set(0, sceneHeightHalf, 0);

	bottomPipe.position.set(0, -sceneHeightHalf, 0)

	pipeSet.add(topPipe);
	pipeSet.add(bottomPipe);

	return pipeSet;
}

/* returns all 4 pipe sets spaced by pipeOffsetX */
function buildAllPipes(params) {
	pipeOffsetX = params.pipeOffsetX;
	buildPipeSet(params, 0);
	var pipeSets = [];
	for(pipeIndex in params.topPipeHeights) {
		var pipeSet = buildPipeSet(params, pipeIndex);
		pipeSet.position.x = ((++pipeIndex)*pipeOffsetX);
		pipeSets.push(pipeSet);
	}
	return pipeSets;
}

/* adds and positions background plane, a bunny, all pipe sets, and 
	lights to the scene */
function buildScene(params, scene) {
	var background = loadBackground(params);
	scene.add(background);

	var bunny = awangatangBunny();
        bunny.position.x = params.bunnyStartOffset;
	scene.add(bunny);

	var pipes = buildAllPipes(params);
	for(pipeIndex in params.topPipeHeights) {
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
