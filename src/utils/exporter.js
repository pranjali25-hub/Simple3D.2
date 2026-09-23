export function captureCanvas(gl) {
  if (!gl) {
    console.error("WebGL context not provided for capture");
    return;
  }
  
  try {
    // Extract canvas drawing buffer as a PNG image URL
    const dataUrl = gl.domElement.toDataURL('image/png');
    
    // Create an anchor element to force download
    const link = document.createElement('a');
    link.download = `Simple3D_Render_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to capture canvas render:", error);
  }
}
