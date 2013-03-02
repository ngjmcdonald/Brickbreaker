window.requestAnimFrame = (function(){ 
	return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame ||
			function(callback){ 
				window.setTimeout(callback, 1000 / 60); 
			}; 
})();

window.cancelRequestAnimFrame = ( function() { 
	return window.cancelAnimationFrame || 
		window.webkitCancelRequestAnimationFrame || 
		window.mozCancelRequestAnimationFrame || 
		window.oCancelRequestAnimationFrame || 
		window.msCancelRequestAnimationFrame || 
		clearTimeout 
})();


/*
	TODO collision detection
			make ball travel in the left or right direction when it hits the left and right edges of paddle
		increase ball speed as play progresse


*/
//init the canvas element
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//get the window width
// var W = window.innerWidth; // windows width
// var H = window.innerHeight; // windows height


var W = 1000; // windows width
var H = 600; // windows height

//set the canvas to the window h w
canvas.width = W;
canvas.height = H;



//fill the canvas black
ctx.fillRect(0,0,W,H);

//declare objects 
var bricks = [];
var brickColors = ["red","yellow","green","blue","purple"];
var keyColors = [122,120,99,118,98];
var mouse = {}; //mouse object


//init ball
var ball = new Ball(50,50,4,8,10,brickColors[0]);
var paddle = new Paddle(brickColors[0]);

mouse.x = W/2 + paddle.width/2;


placeBricks();


//-----------------------render loop
function render(){	
	init = requestAnimFrame(render);
	update();
	draw();
}
render();

//-----------------------game loop
function update(){
	//move the ball
		ball.x += ball.vx;
		ball.y += ball.vy;

		// If the ball hits the top/bottom, // walls, run gameOver()
		if (ball.y + ball.r > H){
			ball.vy = -ball.vy;
			ball.y = H - ball.r; 
		}else if(ball.y < 0 + ball.r){
			ball.vy = -ball.vy;
			ball.y = ball.r;
		}
		//if ball strikes the vertical walls, invert the x-velocity vectory of ball
		if (ball.x + ball.r > W) { 
			ball.vx = -ball.vx;
			ball.x = W - ball.r;
		}else if(ball.x - ball.r < 0){
			ball.vx = -ball.vx;
			ball.x = ball.r;
		}
	}

//---------------------------------------------------------events
canvas.addEventListener("mousemove",trackPosition, true);
window.addEventListener("resize",changeWindowSize, true);
document.addEventListener("keypress",changeColor, true); 

// --------------------------------------------------------functions/classes



function Ball(myX,myY,myVx,myVy,mySize,myColor){
	this.x = myX;
	this.y = myY;
	this.r = mySize;
	this.c = myColor;
	this.vx = myVx;
	this.vy = myVy;
	this.draw = function(){
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x,this.y,this.r,0,Math.PI*2,false);
		ctx.fill();
	};
}
//create the paddle
function Paddle(myColor){
	this.height = 20;
	this.width = 150;
	this.x = W/2 - this.width/2;
	this.y = H - this.height;
	this.c = myColor;
	this.draw = function(){
		ctx.fillStyle = this.c;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

function Brick(posX,posY,myColor){
	this.height=40;
	this.width = 150;
	this.x = posX;
	this.y = posY;
	this.c = myColor;
	this.draw =function(){
		ctx.beginPath();
		ctx.rect(this.x,this.y,this.width,this.height);
		ctx.fillStyle = this.c;
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'black';
		ctx.stroke();
	}
}

function changeColor(e){
	if(e.keyCode == keyColors[0]){
		paddle.c = brickColors[0];
		ball.c = brickColors[0];
	}else if(e.keyCode == keyColors[1]){
		paddle.c = brickColors[1];
		ball.c = brickColors[1];
	}else if(e.keyCode == keyColors[2]){
		paddle.c = brickColors[2];
		ball.c = brickColors[2];
	}else if(e.keyCode == keyColors[3]){
		paddle.c = brickColors[3];
		ball.c = brickColors[3];
	}else if(e.keyCode == keyColors[4]){
		paddle.c = brickColors[4];
		ball.c = brickColors[4];
	}
}

function placeBricks(){
	var bColor = Math.floor(Math.random()*6);
	var row = 0;
	var column = 45;
	for (var i = 0; i < 54; i++) {
		var bColor = Math.floor(Math.random()*6);
		var brick = new Brick(column,row,brickColors[bColor]);
		bricks.push(brick);
		if(column > W-brick.width*2){
			column = 45;
			row+=brick.height;
		}else{
			column+=brick.width;	
		}
	}
	
}

//function to paint the canvas
function paintCanvas(){
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,W,H);
}

function draw(){
	paintCanvas();
	ball.draw();
	paddle.draw();
	for(var i =0; i < bricks.length; i++){
		bricks[i].draw();
	}
}

function trackPosition(e){
	mouse.x = e.pageX;
	mouse.y = e.pageY;
	// console.log(paddle.x + ": " + mouse.x)
}

function gameOver(){
	ctx.fillStyle = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Game Over", W/2, H/2 + 25);
	cancelRequestAnimFrame(init);
}


function changeWindowSize(e){
	H = window.innerHeight;
	W = window.innerWidth;
}

