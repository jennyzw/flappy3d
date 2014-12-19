function makePlane() {
	var body = new THREE.Shape();
	body.moveTo(5,4); // start point of first curve (plane head)
	body.bezierCurveTo(-2,4, -2,0, 5,0);
	body.bezierCurveTo(7,0, 13,0, 13,4);
	// body.bezierCurveTo(13.5,5, 12.5,6, 12,4); // small curve end of body
	body.bezierCurveTo(12,2, 6,4, 5,4);

	var wing = new THREE.Shape();
	wing.moveTo(0,0);
	wing.bezierCurveTo(0,5, 5,5, 5,0);


	var options = {
		amount: 5,
		bevelThickness: 0,
		bevelSize: 0,
		bevelSegments: 3,
		bevelEnabled: false,
		curveSegments: 12,
		steps: 1
	};

	var bodyMat = new THREE.MeshPhongMaterial( {color: 0xE0E0E0 ,
	     											ambient: 0xE0E0E0 ,  
	                                                specular: 0xE0E0E0 ,
	                                                shininess: 5} );

	var wingMat = new THREE.MeshPhongMaterial( {color: 0xCC0000,
	     											ambient: 0xCC0000,  
	                                                specular: 0xCC0000,
	                                                shininess: 5} );

	var bodyMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(body, options), bodyMat);
	// bodyMesh.rotation.x = Math.PI;
	// bodyMesh.rotation.z = -Math.PI/8;
	bodyMesh.scale.set(16, 16, 4);

	function makeWingMesh(side) {
		var wingMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(wing, options), wingMat);
		wingMesh.scale.set(16, 20, 2);
		wingMesh.position.set(40, 20, 0);
		wingMesh.rotation.x = side*Math.PI/1.5;

		return wingMesh;
	}

	var wing1 = makeWingMesh(1);
	var wing2 = makeWingMesh(-1);
	wing1.position.set(40, 30, 20);

	function makeWindow() {
		var windowGeom = new THREE.SphereGeometry(9,20,20);
		var windowMat = new THREE.MeshPhongMaterial( {color: 0xA0A0A0,
	     											ambient: 0xA0A0A0,  
	                                                specular: 0xA0A0A0,
	                                                shininess: 5} );
		var windowMesh = new THREE.Mesh(windowGeom, windowMat);
		windowMesh.scale.y = 2;
		windowMesh.rotation.x = Math.PI/2;
		windowMesh.position.set(40, 45, 10);
		return windowMesh;
	}

	var windowSpace = 35;

	var window1 = makeWindow();

	var window2 = makeWindow();
	window2.position.x += windowSpace;

	var window3 = makeWindow();
	window3.position.x += windowSpace*2;


	var plane = new THREE.Object3D();
	plane.add(bodyMesh);
	plane.add(wing1);
	plane.add(wing2);
	plane.add(window1);
	plane.add(window2);
	plane.add(window3);
	plane.scale.set(.5,.5,.5);

	return plane;
}