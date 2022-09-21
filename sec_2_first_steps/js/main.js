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
    uniform float u_time;
    void main() {
        // gl_FragColor is an rgba-format value
        // this shader MUST set the value of gl_FragColor

        // change color based on position of mouse
        // vec3 color = vec3(u_mouse.x/u_resolution.x, 0.0, u_mouse.y/u_resolution.y);

        // make color change over time
        // as time value passed in increases, we need to map that value between -1 and 1
        // thats why we are using sin and cos here
        // every number passed into sin will output a corresponding y value on the unit circle
        // every number passed into cos will output a corresponding y value on the unit circle
        // and on and on for the unit circle definition of the trig functions
        // vec3 color = vec3((sin(u_time) + 1.0)/2.0, (atan(u_time) + 1.0)/2.0, (cos(u_time) + 1.0)/2.0);

        // gradient from top to bottom - mix between colors over the space of the canvas
        vec2 uv = gl_FragCoord.xy/u_resolution;
        vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), uv.y);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const scene = new three.Scene();
const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new three.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new three.Clock();
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
    uniforms.u_time.value = clock.getElapsedTime();
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
