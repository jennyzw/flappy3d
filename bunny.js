var bunnyParams = {
	bodyRadius: 5,
	bodyScale: 1.2,
	headRadius: 4,
	sphereDetail: 20,
	appRadius: 1,
	appScale: 4,
	tailRadius: 2,
	furColor: new THREE.Color(0xCCCCCC),
	texture: new THREE.ImageUtils.loadTexture( "/images/fur.jpg",
                                                     THREE.UVMapping,
                                                     // onload event handler
                                                     function () {
                                                         console.log("image is loaded.");
                                                         imageLoaded = true;
                                                         render();
                                                     })
	

};

var bunnyMat = new THREE.MeshPhongMaterial( {color: bunnyParams.furColor,
											ambient: bunnyParams.furColor,
											specular: 0xFFFFFF,
											shininess: 5,
											map: bunnyParams.texture} );
/* builds bunny  
	texture map some wings or photo later*/
function buildBunny() {
	var bunny = new THREE.Object3D();
	var body = buildBody();
	bunny.add(body);

	var head = buildHead();
	head.position.set(bunnyParams.bodyScale*bunnyParams.bodyRadius, 
					  bunnyParams.bodyRadius, 
					  0);
	bunny.add(head);

	var feet = buildFeetSet();
	feet.position.set(0,-bunnyParams.bodyRadius,0);
	bunny.add(feet);

	var tail = buildTail();
	tail.position.set(-bunnyParams.bodyRadius*bunnyParams.bodyScale,bunnyParams.bodyRadius-2,0);
	bunny.add(tail);

	return bunny;
}

/*builds body, a 3D ellipse */
function buildBody() {
	var bunnyGeom = new THREE.SphereGeometry(bunnyParams.bodyRadius, 
		bunnyParams.sphereDetail, bunnyParams.sphereDetail);

	var bunnyMesh = new THREE.Mesh(bunnyGeom, bunnyMat);

	bunnyMesh.scale.x = bunnyParams.bodyScale;
	return bunnyMesh;
}

/*builds head, a sphere
  including head and ear set */
function buildHead() {
	var head = new THREE.Object3D();
	var headGeom = new THREE.SphereGeometry(bunnyParams.headRadius,
		bunnyParams.sphereDetail, bunnyParams.sphereDetail);
    var headMesh = new THREE.Mesh(headGeom, bunnyMat);
    head.add(headMesh);

    var ears = buildEarSet();
	ears.position.set(0, bunnyParams.headRadius, 0);
	head.add(ears);
    return head;
}

/*builds a flattened 3D ellipse to be used as ears and feet */
function buildAppendage() {
	var appGeom = new THREE.SphereGeometry(bunnyParams.appRadius, 
		bunnyParams.sphereDetail, bunnyParams.sphereDetail);

	var appMesh = new THREE.Mesh(appGeom, bunnyMat);

	appMesh.scale.y = bunnyParams.appScale;
	return appMesh;
}

/* rotates the ears to the proper orientation (long-side up on y-axis) */
function buildEarSet() {
	var ears = new THREE.Object3D();
	var earLeft = buildAppendage();
	var earRight = buildAppendage();
	earLeft.position.x = -bunnyParams.headRadius/4;
	earRight.position.x = bunnyParams.headRadius/4;
	ears.add(earLeft);
	ears.add(earRight);
	return ears;
}

/* rotates the feet to the proper orientation (long-side horizontally on x-axis) */
function buildFeetSet() {
	var feet = new THREE.Object3D();
	var footLeft = buildAppendage();
	var footRight = buildAppendage();
	footLeft.rotation.z = Math.PI/2;
	footRight.rotation.z = Math.PI/2;
	footLeft.position.x = -(bunnyParams.bodyRadius*bunnyParams.bodyScale)/2;
	footRight.position.x = (bunnyParams.bodyRadius*bunnyParams.bodyScale)/2;
	feet.add(footLeft);
	feet.add(footRight);
	return feet;
}

/* small cute sphere tail fur */
function buildTail() {
	var tail = new THREE.Object3D();
	var tailGeom = new THREE.SphereGeometry(bunnyParams.tailRadius,
		bunnyParams.sphereDetail, bunnyParams.sphereDetail);
    var tailMesh = new THREE.Mesh(tailGeom, bunnyMat);
    tail.add(tailMesh);

    return tail;
}