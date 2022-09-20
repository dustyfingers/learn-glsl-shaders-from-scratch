import * as three from 'three';

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new three.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new three.PlaneGeometry(2, 2);
const material = new three.ShaderMaterial();
const plane = new three.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
animate();

function animate() {
    // actually renders the scene
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize(event) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    let width, height;
    if (aspectRatio >= 1) {
        width = 1;
        height = (window.innerHeight / window.innerWidth) * width;
    } else {
        width = aspectRatio;
        height = 1;
    }
    camera.left = -width;
    camera.right = width;
    camera.top = height;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
