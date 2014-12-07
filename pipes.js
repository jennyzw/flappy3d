/* 
Tiffany Ang, Jenny Wang
11/19/14 
CS 307

contains methods to create a single pipe and build all pipe sets
All pipe sets: [pipeOffsetX-pipeEndRadius] to [pipeOffsetX-pipeEndRadius]+[pipeOffsetX*number of pipes]
			   114 to 634 on the x-axis

			  -250 to 250 on the y-axis

			  -[pipeEndRadius] to [pipeEndRadius]
			  -16 to 16 on the z-axis

V 2.0: 
- random pipe heights

*/

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
// function from MDN (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


var pipeBoxArray = new Array();
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
                                                specular: 0xCCCCCC,
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

    var pipeBox = new THREE.Box3();
	pipeBox.setFromObject(pipe);
	pipeBoxArray.push(pipeBox); // populates pipeBoxArray with bounding boxes
	// for each top/bottom pipe of pipe set

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
	topPipe.name = "topSeg";
	bottomPipe.name = "bottomSeg";

	topPipe.rotateX(Math.PI); // flips top pipe upside-down
	topPipe.position.set(0, sceneHeightHalf, 0);

	bottomPipe.position.set(0, -sceneHeightHalf, 0)

	pipeSet.add(topPipe);
	pipeSet.add(bottomPipe);

	return pipeSet;
}

/* returns all 4 pipe sets spaced by pipeOffsetX */
function buildAllPipes(numPipes) {
	// generate random pipe heights

	params.topPipeHeights = new Array(numPipes);
	for(var i = 0; i < numPipes; i++) {
		params.topPipeHeights[i] = getRandomInt(100, 240);
	}

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