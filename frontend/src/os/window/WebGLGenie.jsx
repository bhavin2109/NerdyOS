import { useEffect, useRef } from "react";

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;   // UV coordinate: x in [0, 1], y in [0, 1]
  varying vec2 v_texCoord;

  uniform float u_progress;
  uniform vec4 u_winRect;      // wx, wy, ww, wh (screen coordinates)
  uniform vec4 u_dockRect;     // dx, dy, dw, dh (screen coordinates)
  uniform vec2 u_viewport;     // width, height of screen

  void main() {
    v_texCoord = a_position;

    float x = a_position.x;
    float y = a_position.y;

    float wx = u_winRect.x;
    float wy = u_winRect.y;
    float ww = u_winRect.z;
    float wh = u_winRect.w;

    float dx = u_dockRect.x;
    float dy = u_dockRect.y;
    float dw = u_dockRect.z;
    float dh = u_dockRect.w;

    // Squeeze factor: bottom of the window warps faster and earlier
    float squeeze = pow(u_progress, 1.2 + (1.0 - y) * 2.2);

    // Trajectory horizontal center: interpolation between window and dock center
    float winCenterX = wx + ww / 2.0;
    float dockCenterX = dx + dw / 2.0;
    float centerX = mix(winCenterX, dockCenterX, squeeze);

    // Width of window at height y
    float widthAtY = mix(ww, dw, squeeze);

    // Horizontal screen coordinate
    float screenX = centerX + (x - 0.5) * widthAtY;

    // Vertical screen coordinate: top of window lags behind (pow > 1), bottom moves linearly
    float t_top = pow(u_progress, 2.2);
    float t_bottom = u_progress;
    float t_y = mix(t_top, t_bottom, y);
    float screenY = mix(wy + y * wh, dy + y * dh, t_y);

    // Convert screen coordinates to Normalized Device Coordinates (NDC)
    float ndcX = (screenX / u_viewport.x) * 2.0 - 1.0;
    float ndcY = 1.0 - (screenY / u_viewport.y) * 2.0;

    gl_Position = vec4(ndcX, ndcY, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  uniform float u_progress;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    // Smoothly fade out the opacity to 0 as progress approaches 1
    color.a *= (1.0 - u_progress * 0.4);
    gl_FragColor = color;
  }
`;

const WebGLGenie = ({
  snapshot,
  rect,
  target,
  direction, // 'minimize' or 'maximize'
  onComplete,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas resolution for high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error("WebGL not supported, falling back.");
      onComplete?.();
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);

    // Helper to compile shader
    const compileShader = (src, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compileShader(VERTEX_SHADER_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(FRAGMENT_SHADER_SRC, gl.FRAGMENT_SHADER);
    if (!vs || !fs) {
      onComplete?.();
      return;
    }

    // Link program
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      onComplete?.();
      return;
    }
    gl.useProgram(program);

    // Create 30x30 grid mesh
    const cols = 30;
    const rows = 30;
    const vertices = [];
    for (let r = 0; r <= rows; r++) {
      const y = r / rows;
      for (let c = 0; c <= cols; c++) {
        const x = c / cols;
        vertices.push(x, y);
      }
    }

    const indices = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i0 = r * (cols + 1) + c;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (cols + 1) + c;
        const i3 = i2 + 1;
        // Two triangles per cell
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    // Position VBO
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    // Index Buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Load Snapshot Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);

    // Uniform locations
    const u_progress = gl.getUniformLocation(program, "u_progress");
    const u_winRect = gl.getUniformLocation(program, "u_winRect");
    const u_dockRect = gl.getUniformLocation(program, "u_dockRect");
    const u_viewport = gl.getUniformLocation(program, "u_viewport");

    // Set stable uniforms
    gl.uniform4f(u_winRect, rect.x, rect.y, rect.width, rect.height);
    gl.uniform4f(u_dockRect, target.x, target.y, target.width, target.height);
    gl.uniform2f(u_viewport, window.innerWidth, window.innerHeight);

    // Enable Alpha Blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation variables
    const duration = 400; // ms
    const startTime = performance.now();
    let animationFrameId;

    // Cubic ease-out-in curve to make it snap naturally
    const easeInOutCubic = (x) => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    const loop = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Interpolate progress: minimize (0 -> 1), maximize (1 -> 0)
      const easeProgress = easeInOutCubic(progress);
      const actualProgress = direction === "minimize" ? easeProgress : 1.0 - easeProgress;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u_progress, actualProgress);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        // Complete animation
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [snapshot, rect, target, direction, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 99999 }}
    />
  );
};

export default WebGLGenie;
