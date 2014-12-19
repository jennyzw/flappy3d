/* Author: Tiffany Ang, Jenny Wang
 * Date: 12/18/14
 * CS 307
 *
 * Creates a 3D airplane object (that is slightly transparent) using Bezier curves
 * makePlane() returns the Object3D, contains methods to create the body and
 * wing shapes
 *
 */ 

// returns an airplane Object3D
function makePlane() {
	var body = new THREE.Shape();
	body.moveTo(5,4); // start point of first curve (plane head)
	body.bezierCurveTo(-2,4, -2,0, 5,0);
	body.bezierCurveTo(7,0, 13,0, 13,4);
	body.bezierCurveTo(12,2, 6,4, 5,4);

	var wing = new THREE.Shape();
	wing.moveTo(0,0);
	wing.bezierCurveTo(0,5, 5,5, 5,0);

	var bodyMat = new THREE.MeshPhongMaterial( {color: 0xC0C0C0, // light grey
	     											ambient: 0xC0C0C0,  
	                                                specular: 0xC0C0C0,
	                                                shininess: 5,
	                                                transparent: true,
	                                                opacity: 0.8} );

	var wingMat = new THREE.MeshPhongMaterial( {color: 0xCC0000, // red
	     											ambient: 0xCC0000,  
	                                                specular: 0xCC0000,
	                                                shininess: 5,
	                                             	transparent: true,
	                                                opacity: 0.8} );

	var options = {
		amount: 5,
		bevelThickness: 1,
		bevelSize: 0,
		bevelSegments: 3,
		bevelEnabled: true,
		curveSegments: 12,
		steps: 1
	};

	var bodyMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(body, options), bodyMat);
	bodyMesh.scale.set(16, 16, 4); // enlarges airplane body

	// helper function to create wing meshes
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

	// helper function to create a window mesh
	function makeWindow() {
		var windowGeom = new THREE.SphereGeometry(9,20,20);
		var windowMat = new THREE.MeshPhongMaterial( {color: 0xA0A0A0, // grey
	     											ambient: 0xA0A0A0,  
	                                                specular: 0xA0A0A0,
	                                                shininess: 5,
	                                             	transparent: true,
	                                                opacity: 0.7} );
		var windowMesh = new THREE.Mesh(windowGeom, windowMat);
		windowMesh.scale.y = 2;
		windowMesh.rotation.x = Math.PI/2;
		windowMesh.position.set(40, 45, 10);
		return windowMesh;
	}

	var windowSpace = 35; // space between the windows

	// makes three sets of windows (appearing on both sides of plane)
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