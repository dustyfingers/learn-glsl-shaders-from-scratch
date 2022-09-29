import * as three from 'three';

// shaders
const vertexShader = `
    // this shader MUST set the value of gl_Position

    // in three.js the uv value is passed into the vertex shader behind the scenes
    // but what about if we need the uv in the fragment shader?
    // we use a varying!
    varying vec2 v_uv;
    varying vec3 v_position;

    void main() {
        // assign uv passed into vertx shader to the varying we want to pass to the fragment shader
        v_uv = uv;
        v_position = position;

        // try multiplying the position value passed into vec4 to change the scale of the object!
        // this is essentially an 'identity' transformation as-is
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    // uniforms are values passed in by javascript
    uniform vec3 u_color;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform float u_time;

    // varyings are values passed from the vertex shader to the fragment shader
    varying vec2 v_uv;
    varying vec3 v_position;

    // create a 2-d rotation matrix
    mat2 get_rotation_matrix(float theta) {
        float s = sin(theta);
        float c = cos(theta);
        return mat2(c, -s, s, c);
    }

    // create a 2-d scale matrix
    mat2 get_scale_matrix(float scale) {
        return mat2(scale, 0, 0, scale);
    }
    
    // drawing a rectangle
    float rect(vec2 pt, vec2 size, vec2 center) {
        vec2 p = pt - center;
        vec2 halfsize = size * 0.5;

        float horiz = step(-halfsize.x, p.x) - step(halfsize.x, p.x);
        float vert = step(-halfsize.y, p.y) - step(halfsize.y, p.y);
        return horiz * vert;
    }
    
    // drawing a rectangle - used for rotating a shape around a point other than the shape's center
    float modified_rect(vec2 pt, vec2 anchor, vec2 size, vec2 center) {
        vec2 p = pt - center;
        vec2 halfsize = size * 0.5;

        float horiz = step(-halfsize.x - anchor.x, p.x) - step(halfsize.x - anchor.x, p.x);
        float vert = step(-halfsize.y - anchor.y, p.y) - step(halfsize.y - anchor.y, p.y);
        return horiz * vert;
    }

    // draw a circle
    float circle(vec2 pt, vec2 center, float radius) {
        vec2 p = pt - center;
        return 1.0 - step(radius, length(p));
    }

    void main() {
        // gl_FragColor is an rgba-format value
        // this shader MUST set the value of gl_FragColor

        // change color based on position of mouse
        // vec3 color = vec3(u_mouse.x/u_resolution.x, 0.0, u_mouse.y/u_resolution.y);

        // make color change over time
        // as time value passed in increases, we need to map that value between -1 and 1
        // thats why we are using sin and cos here
        // every number passed into sin will output a corresponding y value on the unit circle
        // every number passed into cos will output a corresponding x value on the unit circle
        // and on and on for the unit circle definition of the trig functions
        // vec3 color = vec3((sin(u_time) + 1.0)/2.0, (atan(u_time) + 1.0)/2.0, (cos(u_time) + 1.0)/2.0);

        // gradient from top to bottom - mix between colors over the space of the canvas
        // vec2 uv = gl_FragCoord.xy/u_resolution;
        // vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), uv.y);
        
        // color gradient using varying
        // vec3 color = vec3(v_uv.x, v_uv.y, 0.0);
        // gl_FragColor = vec4(color, 1.0);

        // using the clamp method
        // vec3 color = vec3(0.0);
        // color.r = clamp(v_position.x, 0.0, 1.0);
        // color.g = clamp(v_position.y, 0.0, 1.0);
        // gl_FragColor = vec4(color, 1.0);

        // using the step and smoothstep methods - create a hard edge around colors
        // vec3 color = vec3(0.0);
        // color.r = step(0.0, v_position.x);
        // color.g = step(0.0, v_position.y);
        // gl_FragColor = vec4(color, 1.0);

        // vec3 color = vec3(0.0);
        // color.r = smoothstep(0.0, 0.1, v_position.x);
        // color.g = smoothstep(0.0, 0.1, v_position.y);
        // gl_FragColor = vec4(color, 1.0);

        // drawing a circle
        // float in_circle = 1.0 - step(0.5, length(v_position.xy));
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_circle;
        // gl_FragColor = vec4(color, 1.0);

        // drawing a rectangle - notice the rect method defined above the main method
        // float in_rect = rect(v_position.xy, vec2(1.0), vec2(0.0));
        // if in_rect is 1 - this value evaluates to a yellow
        // if in_rect is 0 - this vector gets multiplied by zero, thus every component is zero
        // the color is black
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_rect;
        // gl_FragColor = vec4(color, 1.0);

        // moving a shape over time
        // float radius = 0.5;
        // to make spin faster or slower, scale u_time
        // float time = u_time * 2.0;
        // vec2 center = vec2(cos(time) * radius, sin(time) * radius);
        // float in_rect = rect(v_position.xy, vec2(0.5), center);
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_rect;
        // gl_FragColor = vec4(color, 1.0);

        // rotating a shape over time - notice the get_rotation_matrix method defined above the main method
        // vec2 center = vec2(0.0);
        // mat2 mat = get_rotation_matrix(u_time);
        // vec2 pt = mat * v_position.xy;
        // float in_rect = rect(pt, vec2(0.5), center);
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_rect;
        // gl_FragColor = vec4(color, 1.0);

        // rotating and scaling a shape over time from a point other than its center - notice the modified_rect method
        // vec2 center = vec2(0.0);
        // mat2 mat_r = get_rotation_matrix(u_time);
        // mat2 mat_s = get_scale_matrix((sin(u_time) + 1.0)/3.0 + 0.5);
        // vec2 pt = (mat_s * mat_r * (v_position.xy - center)) + center;
        // vec2 anchor = vec2(0.15, -0.15);
        // float in_rect = modified_rect(pt, anchor, vec2(0.3), center);
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_rect;
        // gl_FragColor = vec4(color, 1.0);

        // tiling a square
        // float tile_count = 20.0;
        // vec2 center = vec2(0.5);
        // mat2 mat_r = get_rotation_matrix(u_time);
        // // the fract() method takes a float vale and slices off the whole number part
        // // eg fract(5.7) ==> 0.7
        // vec2 p = fract(v_uv * tile_count);
        // vec2 pt = (mat_r * (p - center)) + center;
        // float in_rect = rect(pt, vec2(0.5), center);
        // vec3 color = vec3(1.0, 1.0, 0.0) * in_rect;
        // gl_FragColor = vec4(color, 1.0);

        
        // drawing a circle
        vec3 color = vec3(1.0, 0.0, 0.0) * circle(v_position.xy, vec2(0.5), 0.3);
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
