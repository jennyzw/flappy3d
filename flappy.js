/* creates a 3D scene of flappy bird, with a bunny instead of a bird */
/* good webapp animation example: http://nebez.github.io/floppybunny/ */

var params = {
	// bunnyRadius: 5,
	// bunnySphereDetail: 20,
	// bunnyPositionY: 5,
	// bunnyColor: new THREE.Color(0xFF7519),
	pipeRadius: 5,
	pipeCylDetail: 20,
	topPipeHeights: [40, 60, 50, 80],
	pipeColor: new THREE.Color(0x66FF66),
	pipeEndColor: new THREE.Color(0x47B247),
	pipeEndHeight: 3,
	sceneHeight: 180,
	sceneWidth: 70,
	sceneDepth: 10,
	pipeOffsetX: 70,
	ambLightColor: 0x808080,
	lightIntensity: .3,
	directionalX: 0, 
	directionalY: 2,
	directionalZ: 4 
};

var scene = new THREE.Scene();

var sceneWidth = params.topPipeHeights.length*params.pipeOffsetX;

var renderer = new THREE.WebGLRenderer();
function render() {
    renderer.render(scene, camera);
}

TW.mainInit(renderer,scene);

var canvas = TW.lastClickTarget;

var canvasWidth = canvas.width;
var canvasHeight = canvas.height;


function myCamera(fovy,eye, at) {
	var canvas = TW.lastClickTarget;
	//camera = new THREE.PerspectiveCamera( fovy, 800/500, 1, 300);
	camera = new THREE.PerspectiveCamera( fovy, canvasWidth/canvasHeight, 1, 300);
	camera.position.copy(eye);
	camera.lookAt(at);
	scene.add(camera);
}

//adjust camera to display scene with bunny on far left and zoomed in view of pipes
var fovy = 90;
var cameraAdjustX = 70;
var cameraAdjustY = 10;
// var eyeZ = Math.tan(fovy/2) * (params.sceneHeight);
 var eye = new THREE.Vector3(cameraAdjustX,cameraAdjustY,70);
 var at = new THREE.Vector3(cameraAdjustX,cameraAdjustY,0);
 myCamera(fovy,eye, at);

render();

// TW.cameraSetup(renderer, scene,
// 	{minx: 0, maxx: sceneWidth,
// 	miny: -params.sceneHeight/2, maxy: params.sceneHeight/2,
// 	minz: -params.sceneDepth, maxz: params.sceneDepth});


function loadBackground(params) {
    var planeGeom = new THREE.PlaneGeometry(sceneWidth, params.sceneHeight);
    // var planeGeom = new THREE.PlaneGeometry(1000, 1000);
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
    backgroundMesh.position.x = sceneWidth/2;
    backgroundMesh.position.z = -params.sceneDepth/4;
    console.log(backgroundMesh);
    return backgroundMesh;
}

/* build one single pipe */
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

    var pipeEndGeom = new THREE.CylinderGeometry(radius+1, radius+1, endHeight, cd);
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

/* build 1 pipe set containing 1 top pipe and 1 bottom pipe 
	pipeIndex changes to a different height in the array each call */
function buildPipeSet(params, pipeIndex) {
	var pipeSet = new THREE.Object3D();
	var sceneHeight = params.sceneHeight;
	var sceneHeightHalf = sceneHeight/2;

	var pipeSpaceHeight = 30; //random # gen priority 2
	var topHeight = params.topPipeHeights[pipeIndex];
	var bottomHeight = sceneHeight - topHeight - pipeSpaceHeight;

	var topPipe = buildPipe(params, topHeight);
	var bottomPipe = buildPipe(params, bottomHeight);

	topPipe.rotateX(Math.PI);
	topPipe.position.set(0, sceneHeightHalf, 0);

	bottomPipe.position.set(0, -sceneHeightHalf, 0)

	pipeSet.add(topPipe);
	pipeSet.add(bottomPipe);

	return pipeSet;
}

/* build all pipe sets, place all pipe sets */
function buildAllPipes(params) {
	pipeOffsetX = params.pipeOffsetX;
	buildPipeSet(params, 0);
	var pipeSets = [];
	for(pipeIndex in params.topPipeHeights) {
		var pipeSet = buildPipeSet(params, pipeIndex);
		pipeSet.position.x = ((++pipeIndex)*pipeOffsetX);
		// console.log(pipeSet);
		pipeSets.push(pipeSet);
		// pipeSets.push(buildPipeSet(params, pipeIndex));
	}
	return pipeSets;
}

/* build bunny, all pipes, place on scene
	add lights to the scene */
function buildScene(params, scene) {
	var background = loadBackground(params);
	scene.add(background);

	var bunny = buildBunny();
	scene.add(bunny);

	var pipes = buildAllPipes(params);
	// console.log(pipes);
	for(pipeIndex in params.topPipeHeights) {
		scene.add(pipes[pipeIndex]);
	} 

	var ambLight = new THREE.AmbientLight(params.ambLightColor); // soft white light 
	scene.add(ambLight);

	var directionalLight = new THREE.DirectionalLight( 0xffffff, params.lightIntensity );
    directionalLight.name = "directional";
    directionalLight.position.set( params.directionalX, 
                                   params.directionalY, 
                                   params.directionalZ ); 
    scene.add(directionalLight);
	render();
}	

buildScene(params, scene);

