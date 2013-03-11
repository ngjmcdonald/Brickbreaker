window.requestAnimFrame = (function(){ 
	return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame ||
			function(callback){ 
				callback(); 
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
	TODO
		increase ball speed as play progress
*/
var loopInterval;
var BRICK_WIDTH = 150;
var BRICK_HEIGHT = 40;

//init the canvas element
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//get the window width
var W = window.innerWidth; // windows width
var H = window.innerHeight; // windows height


//set the canvas to the window h w
canvas.width = W;
canvas.height = H;


var targetFps = 60;


//fill the canvas black
ctx.fillRect(0,0,W,H);

//declare objects 
var bricks = [];
var brickColors = ["red","yellow","green","blue","purple"];
var keyColors = [122,120,99,118,98];
var mouse = {}; //mouse object
var score;

var isGameOver = false;

//init paddle
var paddle = new Paddle(brickColors[0]);
//init ball
var ball = new Ball(paddle.x + paddle.width/2,paddle.y-paddle.height-5,4,8,6,brickColors[0]);

var score = new Score(W - 100, 20,"white");

placeBricks();
//-----------------------render loop
function render(){	
	// init = requestAnimFrame(render);
	update();
	draw();
}
render();

//-----------------------game loop
function update(){
	//move the ball
		//console.log(ball.vx);
		// ball.vx+=0.0001;
		// ball.vy+=0.0001;
		ball.x += ball.vx;
		ball.y += ball.vy;


		// If the ball hits the bottom, run gameOver()
		if (ball.y-ball.r*2 + ball.r > H){
			// ball.vy = -ball.vy;
			// ball.y = H - ball.r; 
			gameOver();
		//if the ball hits the top or the top/bottom of a brick reverse y direction	
		}else if((ball.y < 0 + ball.r) || collisionYBricks()){	

			ball.vy = -ball.vy;
		}
		//if ball strikes the vertical walls or the left/right of brick, invert the x-velocity vectory of ball
		if ((ball.x + ball.r > W) || collisionXBricks()) { 
			ball.vx = -ball.vx;
		}else if((ball.x - ball.r < 0) || collisionXBricks()){
			ball.vx = -ball.vx;
		}

		
		//paddle/brick collision detection
		if(paddleCollides(ball,paddle)){
			rndSpeedY();
			//send ball in the direction of theleft and right edges of the paddle
			pRightEdge = paddle.x+paddle.width-30;
			pLeftEdge = paddle.x+30;
			if((ball.x+ball.r > paddle.x)&&(ball.x-ball.r < pLeftEdge)){
				rndSpeedX();
				if(!(ball.vx < 0)){
					ball.vx = -ball.vx;	
				}
			}
			if((ball.x < paddle.x+paddle.width)&&(ball.x > pRightEdge)){
				rndSpeedX();
				if(!(ball.vx > 0)){
					ball.vx = -ball.vx;	
				}
			}
			ball.vy = -ball.vy;
		}
}
loopInterval = setInterval("requestAnimFrame(render)", 1000 / targetFps);

//---------------------------------------------------------events
canvas.addEventListener("mousemove",trackPosition, true);
window.addEventListener("resize",changeWindowSize, true);
document.addEventListener("keypress",changeColor, true); 

// --------------------------------------------------------functions/classes

//------------------------------collision detection

function collisionYBricks(){
	for(var i =0; i < bricks.length; i++){
		 if (
            // touching from below
            ((ball.y + ball.vy - ball.r <= bricks[i].y + bricks[i].height) && 
            (ball.y - ball.r >= bricks[i].y + bricks[i].height))
            ||
            //  touching from above
            ((ball.y + ball.vy + ball.r >= bricks[i].y) &&
            (ball.y + ball.r <= bricks[i].y ))){
            if (ball.x + ball.vx + ball.r >= bricks[i].x && 
                ball.x + ball.vx - ball.r<= bricks[i].x + bricks[i].width){
            	bricks.splice(i,1);
            	score.updateScore(10);
            	return true;
            }
    	}
	}
	return false;
}

function collisionXBricks(){
	for(var i =0; i < bricks.length; i++){
		if (
		    //touching from left
		    ((ball.x + ball.vx + ball.r >= bricks[i].x) &&
		    (ball.x + ball.r <= bricks[i].x))
		    ||
		    // touching from right
		    ((ball.x + ball.vx - ball.r<= bricks[i].x + bricks[i].width)&&
		    (ball.x - ball.r >= bricks[i].x + bricks[i].width))
		    ){      
		    if ((ball.y + ball.vy -ball.r<= bricks[i].y + bricks[i].height) &&
		        (ball.y + ball.vy + ball.r >= bricks[i].y)){                                                   
		    	bricks.splice(i,1);
		    	score.updateScore(10);	
		        return true;
		    }
		}
	}
	return false;
}


 function paddleCollides(b, p) { 
 	if(b.x + ball.r >= p.x && b.x - ball.r <=p.x + p.width) { 
 		if(b.y >= (p.y - p.height) && p.y > 0){ 
 			return true; 
 		}else if(b.y <= p.height && p.y == 0) {
        	return true;
    	}else {
    		return false;	
    	}
	}
}
//------------------------------objects
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
	this.height = 10;
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

function Score(posX,posY,myColor){
	this.score = 0;
	this.x = posX;
	this.y = posY;
	this.c = myColor;
	this.draw = function(){
		ctx.fillStyle = "white";
		ctx.font = "20px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Score: "+ this.score, this.x, this.y + 25);
	}
	this.updateScore = function(newScore){
		this.score += newScore;
	}
}
//------------------------------functions

function calcNumOfCols(screenW){
	var num = W;
	var isMaxReached = false;
	while(!isMaxReached){
		if(num % BRICK_WIDTH == 0){
			isMaxReached = true;
		}else{
			num--;
		}
	}
	return num;
}


function placeBricks(){
	var bColor = Math.floor(Math.random()*5);
	var myWidth;
	if(W < 1050){
		myWidth = 1050;
	}else{
		myWidth = W;
	}

	var leftPadding = (W - 1050)/ 2;
	var row = 80;
	var column = leftPadding;
	for (var i = 0; i < 56; i++) {
		var bColor = Math.floor(Math.random()*5);
		var brick = new Brick(column,row,brickColors[bColor]);
		bricks.push(brick);
		

		if(column > (1000+leftPadding)-brick.width){
			column =leftPadding;
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
	paddle.draw();
	for(var i =0; i < bricks.length; i++){
		bricks[i].draw();
	}
	ball.draw();
	score.draw();
	if(isGameOver){
		drawGameOver();
	}
	
}

function drawGameOver(){
	ctx.fillStyle = "white";
	ctx.font = "160px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("GAME OVER", W/2, H/2 + 25);
}

//------------------------------event handlers
function trackPosition(e){
	var distanceR;
	var distanceL;


	paddle.x = mouse.x -paddle.width/2;	
	distanceR = W - (paddle.x +paddle.width) ;
	distanceL = paddle.x;

	if(distanceR <= 0){
		paddle.x = W -paddle.width;
	}else if(distanceL <= 0){
		paddle.x = 0;
	}

	mouse.x = e.pageX;
	mouse.y = e.pageY;
}

function gameOver(){
	isGameOver = true;
	clearInterval(loopInterval);
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

function changeWindowSize(e){
	H = window.innerHeight;
	W = window.innerWidth;
}

function rndSpeedX(){
	if(ball.vx < 0){
		ball.vx = -Math.random()*(4-3+1)+3;
	}else{
		ball.vx = Math.random()*(4-3+1)+3;
	}
}
function rndSpeedY(){
	if(ball.vy < 0){
		ball.vy = -Math.random()*(9-7+1)+7;
	}else{
		ball.vy = Math.random()*(9-7+1)+7;
	}
}
