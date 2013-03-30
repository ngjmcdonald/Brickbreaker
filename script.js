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
		Ball is going inside side walls because paddle can
*/
var loopInterval;
var BRICK_WIDTH = 150;
var BRICK_HEIGHT = 40;

//init the canvas element
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//get the window width
var W = 1050; // windows width
var H = 600; // windows height


//set the canvas to the window h w
canvas.width = W;
canvas.height = H;


var targetFps = 60;


//fill the canvas black
ctx.fillRect(0,0,W,H);

//declare objects 
var bricks = [];
var brickColors = ["white",'grey'];
var keyColors = [122,120];
var mouse = {}; //mouse object
var score;

var isGameOver = false;
var isAdvanceLevel = false;
var isWin = false;
var isGameStart = true;


//init paddle
var paddle = new Paddle(brickColors[0]);
//init ball
ballVX = 4;
ballVY = -8;
var ball = new Ball(paddle.x + paddle.width/2,paddle.y-paddle.height-5,ballVX,ballVY,6,brickColors[0]);

var score = new Score(W - 100, 20,"white");

//init overlay
var newLevel = new Overlay(W/2,H/2,'level','');
var gameOver = new Overlay(W/2,H/2,'gameover');
var start = new Overlay(W/2,H/2,'start');

var metalSound = new Audio("metal.wav");
var explodeSound = new Audio("explode.wav");
metalSound.duration = 0.05;
explodeSound.duration = 0.05;

placeBricks();
var timer = 0;
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
	if(!isGameStart){
		if(bricks.length <= 0){
			isAdvanceLevel = true;
		}else{
			ball.x += ball.vx;
			ball.y += ball.vy;


			// If the ball hits the bottom, run gameOver()
			if (ball.y-ball.r*2 + ball.r > H){
				killGame();
			//if the ball hits the top or the top/bottom of a brick reverse y direction	
			}else if((ball.y <= 0 + ball.r) || collisionYBricks()){	
				ball.vy = -ball.vy;
				if(ball.y <= 0 + ball.r){
					ball.y = 0 + ball.r;	
				}
				explodeSound.load();
				explodeSound.play();
				
			}
			//if ball strikes the vertical walls or the left/right of brick, invert the x-velocity vectory of ball
			if ((ball.x + ball.r >= W) || collisionXBricks()) { 
				ball.vx = -ball.vx;
				if(ball.x + ball.r >= W){
					ball.x = W - ball.r;
				}
				explodeSound.load();
				explodeSound.play();

			}else if((ball.x - ball.r <= 0) || collisionXBricks()){
				ball.vx = -ball.vx;
				if(ball.x + ball.r <= 0){
					ball.x = 0 + ball.r;
				}
				explodeSound.load();
				explodeSound.play();
			}

			//paddle/brick collision detection
			if(boxCollides(ball,paddle)){
			// if(paddleCollides(ball,paddle)){
				metalSound.load();
				metalSound.play();
				
				//send ball in the direction of theleft and right edges of the paddle
				pRightEdge = paddle.x+paddle.width-(paddle.width*0.1);
				pLeftEdge = paddle.x+(paddle.width*0.1);

				if((ball.x > paddle.x)&&(ball.x-ball.r < pLeftEdge)){
					if(!(ball.vx < 0)){
						ball.vx = -ball.vx;	
					}
				}
				if((ball.x < paddle.x+paddle.width)&&(ball.x > pRightEdge)){
					if(!(ball.vx > 0)){
						//ball.vx = -ball.vx;	
						ball.vx = Math.abs(ball.vx);	
					}
				}

				if(!(ball.y+ball.r > paddle.y)){
					ball.y = paddle.y-ball.r;
					ball.vy = -ball.vy;	
					console.log("above");
				}else{
					console.log("below");
					if(ball.vx > 0){
						ball.vx = Math.abs(ball.vx);	
					}else{
						ball.vx = -ball.vx;
					}
				}
				rndSpeedX();				
			}
		}
	}
}
loopInterval = setInterval("requestAnimFrame(render)", 1000 / targetFps);

//---------------------------------------------------------eventsLisenters
canvas.addEventListener("mousemove",trackPosition, true);
window.addEventListener("resize",changeWindowSize, true);
document.addEventListener("keypress",changeColor, true);
document.addEventListener("click",function(){isGameStart = false; console.log("asd");}, true);

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
            	console.log(ball.c);
            	if(ball.c == bricks[i].c){
	            	if((bricks[i].type == "hard")){
	            		if(bricks[i].hitCount > 1){

	            			bricks.splice(i,1);
	            			score.updateScore(10);
	            		}
	            		if(bricks[i] != null)bricks[i].hitCount++;

	            	}else{
	            		bricks.splice(i,1);	
	            		score.updateScore(10);
	            	}
            	}
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
		    	if(ball.c == bricks[i].c){
			    	if((bricks[i].type == "hard")){

	            		if(bricks[i].hitCount > 2){
	            			bricks.splice(i,1);
	            			score.updateScore(10);
	            		}
	            		bricks[i].hitCount++;

	            	}else{
	            		bricks.splice(i,1);	
	            		score.updateScore(10);
	            	}
            	}
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
 		}else if(b.y+b.r < p.height && p.y == 0) {
        	return true;
    	}else {
    		return false;	
    	}
	}
}

function boxCollides(b,p){
	 return (b.x-b.r <= p.x + p.width && //1left is to the left 2right
        p.x-b.r <= b.x + b.r && //2left is to the left of 1 right
    	b.y-b.r <= p.y + p.height && // 1top is to the top of 2bottom
        p.y-b.r <= b.y + b.r)
}
//------------------------------objects

function test(){
	this.draw = function(time){
		ctx.fillStyle = "white";
		ctx.font = "20px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("VX "+ time, 100,50);
	};
}

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
	this.direction = "";
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
	this.type ="normal";
	this.hitCount = 0;
	if(newLevel.myLevel > 2){
		if(Math.floor(Math.random()*20) <= 5){
			this.type = 'hard';
		}
	}
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
		ctx.fillText("Score: "+ this.score, this.x, this.y);
	}
	this.updateScore = function(newScore){
		this.score += newScore;
	}
	this.getScore = function(){
		return this.score;
	}
}

function Overlay(myX,myY,type){
	this.myLevel = 2;
	if(type == "level"){
		this.title = "Next Level";
		this.description = '';
	}else if (type=="win"){
		this.title = "You Win!";
		this.description = "Press enter to play again";
	}else if(type == "gameover"){
		this.title = "GAME OVER";
		this.description = "Press enter to try again";
	}else if(type=='start'){
		this.title = "Brick Breaker"; 
		this.description = "Click to start.";
	}

	this.x = myX;
	this.y = myY;

	if(type == 'level'){
		this.description = "Level " + this.myLevel;
	}

	this.updateLevel =function(lev){

		this.myLevel++;
		if(type == 'level'){
			this.description = "Level " + this.myLevel;
		}
	};

	this.draw = function(){
		ctx.beginPath();
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fill();

		ctx.fillStyle = "white";
		ctx.font = "40px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		if(type == "start"){
			ctx.font = "60px Arial, sans-serif";
			ctx.fillText(this.title, this.x, this.y);
			ctx.font = "20px Arial, sans-serif";
			ctx.fillText(this.description, this.x, this.y+50);	
		}else{
			ctx.fillText(this.title, this.x, this.y);
			ctx.fillText(this.description, this.x, this.y+50);	
		}
		
		ctx.fillStyle = "green";
		if((type=='gameover')||(type=='win'))ctx.fillText("Your Score: " + score.getScore(), this.x, this.y+100);
		
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
	var row = 40;
	var column = leftPadding;
	// for (var i = 0; i < 1; i++) {
	for (var i = 0; i < 49; i++) {
		var bColor = Math.floor(Math.random()*2);
		var myColor = brickColors[bColor];
		var brick = new Brick(column,row,myColor);
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
		gameOver.draw();
	}
	
	if(isAdvanceLevel){
		timer += 0.001;
		console.log(timer);
		newLevel.draw();
		if((timer > 0.05)){
			nextLevel();
			timer = 0;
			isAdvanceLevel = false;
		}
	}
	if(isGameStart){
		start.draw();
	}

}

//------------------------------event handlers
function trackPosition(e){
	if(!isGameStart){
		var distanceR;
		var distanceL;

		if(!isAdvanceLevel)paddle.x = mouse.x -paddle.width/2;	
		distanceR = W - (paddle.x +paddle.width) ;
		distanceL = paddle.x;
		reducePaddleX = 20;
		// reduce the bounds of the sides by a little to  correct potential problem of ball getting stuck on the sides 
		if(distanceR <= -reducePaddleX){
			paddle.x = W - paddle.width+reducePaddleX;
		}else if(distanceL <= -reducePaddleX){
			paddle.x = -reducePaddleX;
		}

		mouse.x = e.pageX;
		mouse.y = e.pageY;
	}
}

function killGame(){
	isGameOver = true;
	clearInterval(loopInterval);
}

function nextLevel(){
	newLevel.updateLevel();
	if(!newLevel.myLevel > 5)paddle.width = paddle.width * 0.9;
	paddle.x = W/2 - paddle.width/2;
	ball.x = paddle.x + paddle.width/2;
	ball.y = paddle.y-paddle.height-10;
	ball.vy = Math.abs(ball.vy) * -1;
	placeBricks();
}

function restart(){
	isGameStart = true;
	loopInterval = setInterval("requestAnimFrame(render)", 1000 / targetFps);
	newLevel.myLevel = 1;
	paddle.x = W/2 - paddle.width/2;
	ball.x = paddle.x + paddle.width/2;
	ball.y = paddle.y-paddle.height-10;
	ball.vy = Math.abs(ball.vy) * -1;
	score.score = 0;
	paddle.width = 150;
	isGameOver = false;
}

function changeColor(e){
	console.log(e.keyCode);
	if(e.keyCode == 32){
		if(paddle.c == brickColors[0]){
			paddle.c = brickColors[1];	
			ball.c = brickColors[1];
		}else{
			ball.c = brickColors[0];
			paddle.c = brickColors[0];	
		}
		
		
	}else if(e.keyCode == 13 && isGameOver){
		restart();
	}
}


function changeWindowSize(e){
	H = window.innerHeight;
	W = window.innerWidth;
}

function rndSpeedX(){

	var maxX = ballVX+1;
	var minX = ballVX-1;

	if(ball.vx < 0){
		console.log(ball.vx+"b");
		ball.vx = (minX + (Math.random() * ((maxX - minX) + 1))) * -1;
		console.log(ball.vx+"a");
	}else{
		ball.vx = minX + (Math.random() * ((maxX - minX) + 1));
	}

}

function rndSpeedY(){

	var maxY = ballVY+1;
	var minY = ballVY-1;
	console.log(ballVY);

	if(ball.vy < 0){
		ball.vy = minY + (Math.random() * ((maxY - minY) + 1));
	}else{
		ball.vy = (minY + (Math.random() * ((maxY - minY) + 1)))*-1;
		
	}
}
