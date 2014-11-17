
/* good webapp animation example: http://nebez.github.io/floppybird/ */

var params = {
	birdRadius: 5,
	birdSphereDetail: 20,
	birdPositionY: 5,
	birdColor: new THREE.Color(0xFF7519),
	pipeRadius: 5,
	pipeCylDetail: 20,
	topPipeHeights: [20, 30, 50, 10],
	pipeColor: new THREE.Color(0x66FF66),
	pipeEndColor: new THREE.Color(0x47B247),
	pipeEndHeight: 3,
	sceneHeight: 100,
	sceneWidth: 70,
	sceneDepth: 10,
	pipeOffsetX: 40,
	ambLightColor: 0x808080,
	lightIntensity: .3,
	directionalX: 0, 
	directionalY: 2,
	directionalZ: 4 
};

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();

TW.mainInit(renderer,scene);

var sceneWidth = params.topPipeHeights.length*params.pipeOffsetX;
console.log(params.topPipeHeights.length);
TW.cameraSetup(renderer, scene,
	{minx: 0, maxx: sceneWidth,
	miny: -params.sceneHeight/2, maxy: params.sceneHeight/2,
	minz: -params.sceneDepth, maxz: params.sceneDepth});


/* builds bird  
	texture map some wings or photo later*/
function buildBird(params) {
	var birdGeom = new THREE.SphereGeometry(params.birdRadius, 
		params.birdSphereDetail, params.birdSphereDetail);
	var birdMat = new THREE.MeshPhongMaterial( {color: params.birdColor,
												ambient: params.birdColor,
												specular: 0xFFFFFF,
												shininess: 5} );
	var birdMesh = new THREE.Mesh(birdGeom, birdMat);
	return birdMesh;
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
		console.log(pipeSet);
		pipeSets.push(pipeSet);
		// pipeSets.push(buildPipeSet(params, pipeIndex));
	}
	return pipeSets;
}

/* build bird, all pipes, place on scene
	add lights to the scene */
function buildScene(params, scene) {
	var bird = buildBird(params);
	scene.add(bird);

	var pipes = buildAllPipes(params);
	console.log(pipes);
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
	TW.render();
}	

buildScene(params, scene);

