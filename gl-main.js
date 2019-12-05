var gl = null,
	canvas = null,
	glProgram = null,
	fragmentShader = null,
	vertexShader = null;
    
var vertexPositionAttribute = null,
	xVecAttribute = null,
	xVecBuffer = null,
	trianglesVerticeBuffer = [],
	vertexColorAttribute = null,
	trianglesColorBuffer = null;
    
var mvMatrix = mat4.create(), /*Mode-View Matrix*/
	pMatrix = mat4.create();  /*Projection Matrix*/
    
var valuesLength = null;
var wfVertexBuffer = [];
var wfColorBuffer = [];

var socket = io.connect('http://' + ioip + ':4000');
var pArray = [];

var tX = -24, 
	tY = -0.33,
	tZ = 0; //translation matrix
var sX = 0.01,/*0.0035,*/
	sY = 0.04000,
	sZ = 1; //scaling matrix
var initY = 600.0,
	stepY = -500.0;
var ch_nr = 3;

var wsmValue = document.getElementById("wsmValue"); //raw payload from server

/* new Array(2560)--> .join('0')  --> .split('') --> map(parseFloat) */
/* [empty x 2560] --> ["000...0"] --> ["0","0",...,"0"] --> [0,0,...,0] */
var value = {};
for(var i=0;i<ch_nr;i++){
	value[i] = new Array(2560).join('0').split('').map(parseFloat); 
}

function initWebGL()
{
	socket.on('serverMessage',function(content){
		wsmValue.innerHTML = content.substring(0,20) + "...";
		pArray = content.split(','); // "1,5,2" --> ['1','5','2'] (ch1 value, ch2,...)
		for(var i=0;i<ch_nr;i++){
			value[i].shift();value[i].push(pArray[i]); //removes the first element. Pushes a new one.
		}
	});
	canvas = document.getElementById("wf-canvas");  
	try{
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");					
	}catch(e){}	
	if(gl){
		initShaders();
		setupBuffers();
		//Location of uniform variables in the GPU's memory (glProgram):
		glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
		glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
		(function animLoop(){
			setupWebGL();
			drawScene();
			requestAnimationFrame(animLoop, canvas);
		})();
	}else{ alert(  "Error: Your browser does not appear to support WebGL."); }
}
function initShaders()
{
	var fs_source = document.getElementById('shader-fs').innerHTML,
		vs_source = document.getElementById('shader-vs').innerHTML;	//get shader source
	vertexShader = makeShader(vs_source, gl.VERTEX_SHADER); //compile shader
	fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
	glProgram = gl.createProgram();
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);
	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		alert("Imposible inicializar shader.");
	}
	gl.useProgram(glProgram);
}
function makeShader(src, type)
{
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error al compilar del shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}

function setupWebGL() /*animLoop*/
{
	var rect = canvas.parentNode.getBoundingClientRect();
	canvas.width = rect.width; 
	canvas.height = rect.height; //get the container of canvas size
	gl.clearColor(0.0,0.0,0.0,1.0); //Specifies the color used when calling the clear method
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clears the color and depth buffers
	gl.enable(gl.DEPTH_TEST);//Activates depth comparisons and updates to the depth buffer
	gl.viewport(0, 0, canvas.width, canvas.height);//map NDCs to viewport coordinates

	mat4.identity(pMatrix); //projection matrix
	//mat4.frustum(oL,oR,oB,oT,oN,oF,pMatrix)
	//document.getElementById('pMatrixV').innerHTML = pMatrix;
	mat4.identity(mvMatrix); //model-view matrix
	mat4.translate(mvMatrix, [tX,tY,tZ]);
	mat4.scale(mvMatrix,[sX,sY,sZ]);

	vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");//from shader-vs
	vertexColorAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
	xVecAttribute = gl.getAttribLocation(glProgram,"aXVec");
	gl.enableVertexAttribArray(vertexPositionAttribute); //enable array data before sending an array to an attribute
	gl.enableVertexAttribArray(vertexColorAttribute);
	gl.enableVertexAttribArray(xVecAttribute);
	gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix); //set uniform matrix
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
}
function drawScene() /*animLoop*/
{
	for(var i=0;i<ch_nr;i++){
		gl.bindBuffer(gl.ARRAY_BUFFER, wfVertexBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value[i]), gl.DYNAMIC_DRAW);
	}

	mat4.translate(mvMatrix, [0.0,initY,0.0]); //1600.0: Initial distance from bottom
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
	gl.bindBuffer(gl.ARRAY_BUFFER, wfVertexBuffer[0]);//we assign the currently bound ARRAY_BUFFER target to this vertex attrib.
	gl.vertexAttribPointer(vertexPositionAttribute, wfVertexBuffer[0].itemSize, gl.FLOAT, false, 0, 0);//let the shader know
	gl.bindBuffer(gl.ARRAY_BUFFER, wfColorBuffer[0]);                                           //how to interpret our data
	gl.vertexAttribPointer(vertexColorAttribute, wfColorBuffer[0].itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, xVecBuffer);
	gl.vertexAttribPointer(xVecAttribute, xVecBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINE_STRIP,0,wfVertexBuffer[0].numItems);

	for(var i=1;i<ch_nr;i++){
	mat4.translate(mvMatrix, [0.0,stepY,0.0]); //accumulative separation between traces 
	gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
	gl.bindBuffer(gl.ARRAY_BUFFER, wfVertexBuffer[i]);
	gl.vertexAttribPointer(vertexPositionAttribute, wfVertexBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, wfColorBuffer[i]);
	gl.vertexAttribPointer(vertexColorAttribute, wfColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINE_STRIP,0,wfVertexBuffer[i].numItems);
	}
    
}

function setupBuffers()
{
	valuesLength = value[0].length;
	console.log('Muestras: '+valuesLength);

	//Vertex:
	for(var i=0;i<ch_nr;i++){
		wfVertexBuffer[i] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, wfVertexBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value[i]), gl.DYNAMIC_DRAW);
		wfVertexBuffer[i].itemSize = 1;
		wfVertexBuffer[i].numItems = valuesLength;
	}
    
    //Colors:
	for(var i=0;i<ch_nr;i++){
		wfColorBuffer[i] = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, wfColorBuffer[i]);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors[i]), gl.DYNAMIC_DRAW);
		wfColorBuffer[i].itemSize = 3;
		wfColorBuffer[i].numItems = valuesLength;
	}

	xVecBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,xVecBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vecx),gl.DYNAMIC_DRAW);
	xVecBuffer.itemSize = 1;
	xVecBuffer.numItems = valuesLength;
}
