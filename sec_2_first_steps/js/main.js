import * as three from 'three';

// shaders
const vertexShader = `
    void main() {
        // try multiplying the position value passed into vec4 to change the scale of the object!
        // this shader MUST set the value of gl_Position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 u_color;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    void main() {
        // gl_FragColor is an rgba-format value
        // this shader MUST set the value of gl_FragColor
        vec3 color = vec3(u_mouse.x/u_resolution.x, 0.0, u_mouse.y/u_resolution.y);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new three.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new three.PlaneGeometry(2, 2);

const uniforms = {
    u_time: { value: 0.0 },
    u_mouse: { value: { x: 0.0, y: 0.0 } },
    u_resolution: { value: { x: 0.0, y: 0.0 } },
    u_color: { value: new three.Color(0xff0000) },
};
const material = new three.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
});
const plane = new three.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 1;

onWindowResize();
if ('ontouchstart' in window) {
    document.addEventListener('touchmove', move);
} else {
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', move);
}
animate();

function move(evt) {
    uniforms.u_mouse.value.x = evt.touches ? evt.touches[0].clientX : evt.clientX;
    uniforms.u_mouse.value.y = evt.touches ? evt.touches[0].clientY : evt.clientY;
}

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
    if (uniforms.u_resolution !== undefined) {
        uniforms.u_resolution.value.x = window.innerWidth;
        uniforms.u_resolution.value.y = window.innerHeight;
    }
}
