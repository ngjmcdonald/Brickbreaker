//---------------------------------------game loop functions

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

//---------------------------------properties/variables
//variable to hold loop interval
var loopInterval;
//contstants for brick sizes and ball speed and the fps
var BRICK_WIDTH = 150;
var BRICK_HEIGHT = 40;
var NUM_OF_BRICKS = 49;
var ballVX = 4;
var ballVY = -8;
var TARGET_FPS = 60;

//init the canvas element
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//get the window width
var W = 1050; // windows width
var H = 600; // windows height


//set the canvas to the window h w
canvas.width = W;
canvas.height = H;


//fill the canvas black
ctx.fillRect(0,0,W,H);

//declare objects 
var bricks = [];
var brickColors = ["white",'grey'];
var keyColors = [122,120];
var mouse = {}; //mouse object
var score;
//booleans variables for game over, new levels 
var isGameOver = false;
var isAdvanceLevel = false;
var isWin = false;
var isGameStart = true;


//init paddle
var paddle = new Paddle(brickColors[0],ctx);
//init ball
var ball = new Ball(paddle.x + paddle.width/2,paddle.y-paddle.height-5,ballVX,ballVY,6,brickColors[0],ctx,canvas);
//init score keeper
var score = new Score(W - 100, 20,"white",ctx,canvas);
//init overlays
var newLevel = new Overlay(W/2,H/2,'level',ctx,canvas,score);
var gameOver = new Overlay(W/2,H/2,'gameover',ctx,canvas,score);
var start = new Overlay(W/2,H/2,'start',ctx,canvas,score);
//sound objects
var metalSound = new Audio("assets/sound/metal.wav");
var explodeSound = new Audio("assets/sound/explode.wav");
//cut the the duration of play
metalSound.duration = 0.05;
explodeSound.duration = 0.05;
// place all the bricks
placeBricks();
//set the timer variable to zero
var timer = 0;
//-------------------------------------------game loop
function render(){	
	//call the update and draw methods
	update();
	draw();
}
render();
// method to update all objects and variables
function update(){
	//check if the game has started
	if(!isGameStart){
		//check if there are still bricks left
		if(bricks.length <= 0){
			// if not advance to the next level
			isAdvanceLevel = true;

		}else{// else continue game

			//move the ball
			ball.x += ball.vx;
			ball.y += ball.vy;

			//TODO ----------------change all collision detection with ball to angle of reflection 

			// If the ball hits the bottom, run call the game over method
			if (ball.y-ball.r*2 + ball.r > H){
				killGame();
			//if the ball hits the top or the top/bottom of a brick reverse y direction	
			}else if((ball.y <= 0 + ball.r) || collisionYBricks()){	
				ball.vy = -ball.vy;
				if(ball.y <= 0 + ball.r){
					ball.y = 0 + ball.r;	
				}
				//play sounds of collision
				explodeSound.load();
				explodeSound.play();
				
			}
			//if ball strikes the vertical walls or the left/right of brick, 
			// invert the x-velocity vectory of ball
			if ((ball.x + ball.r >= W) || collisionXBricks()) { 
				ball.vx = -ball.vx;
				if(ball.x + ball.r >= W){
					ball.x = W - ball.r;
				}
				//play sounds of collision
				explodeSound.load();
				explodeSound.play();

			}else if((ball.x - ball.r <= 0) || collisionXBricks()){
				ball.vx = -ball.vx;
				if(ball.x + ball.r <= 0){
					ball.x = 0 + ball.r;
				}
				//play sounds of collision
				explodeSound.load();
				explodeSound.play();
			}

			//----------------paddle/brick collision detection
			if(boxCollides(ball,paddle)){
				//play sounds of collision
				metalSound.load();
				metalSound.play();
				
				//send ball in the direction of theleft and right edges of the paddle
				pRightEdge = paddle.x+paddle.width-(paddle.width*0.1);
				pLeftEdge = paddle.x+(paddle.width*0.1);

				//if the ball hits the left edge send it in the left direction
				if((ball.x+ ball.r > paddle.x)&&(ball.x-ball.r < pLeftEdge)){
					if(!(ball.vx < 0)){
						ball.vx = -ball.vx;	
					}
				}
				//if the ball hits the right edge send it in the right direction
				if((ball.x-ball.r < paddle.x+paddle.width)&&(ball.x > pRightEdge)){
					if(!(ball.vx > 0)){
						ball.vx = Math.abs(ball.vx);	

					}
				}

				//check if the ball is below the paddle
				if(!(ball.y+ball.r > paddle.y)){
					//if it isn't reverse the y direction and send it back up 
					ball.y = paddle.y-ball.r;
					ball.vy = -ball.vy;	
				}else{
					// if it isn't send the back in the opposite x direction and let it fall below the paddle
					if(ball.vx > 0){
						ball.vx = Math.abs(ball.vx);	
					}else{
						ball.vx = -ball.vx;
					}
				}

				// randomize the x speed
				rndSpeedX();				
			}
		}
	}
}
// call the game loop functions 
loopInterval = setInterval("requestAnimFrame(render)", 1000 / TARGET_FPS);

//---------------------------------------------------------EVENT LISTENERS
//mouse movement for the mouse position
canvas.addEventListener("mousemove",trackPosition, true);
// keys pressed to change color of ball and detect enter when game is over
document.addEventListener("keypress",changeColor, true);
// click event to start the game
document.addEventListener("click",function(){isGameStart = false; }, true);

//---------------------------------------collision detection methods

//method to check for collision with bricks on the y axis
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
		 	//within the x axis as well
            if (ball.x + ball.vx + ball.r >= bricks[i].x && 
                ball.x + ball.vx - ball.r<= bricks[i].x + bricks[i].width){
            	// collision detected
            	// check if colors match
            	if(ball.c == bricks[i].c){
            		//check if the brick type has advanced
	            	if((bricks[i].type == "hard")){
	            		// if so increase the number of hits it takes to destroy it
	            		if(bricks[i].hitCount > 1){
	            			//remove the brick and update the score
	            			bricks.splice(i,1);
	            			score.updateScore(10);
	            		}
	            		if(bricks[i] != null)bricks[i].hitCount++;

	            	}else{
	            		//remove the brick and update the score
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
			//within the y axis as well
		    if ((ball.y + ball.vy -ball.r<= bricks[i].y + bricks[i].height) &&
		        (ball.y + ball.vy + ball.r >= bricks[i].y)){
		    	// collision detected
            	// check if colors match
		    	if(ball.c == bricks[i].c){
		    		//check if the brick type has advanced
			    	if((bricks[i].type == "hard")){
			    		// if so increase the number of hits it takes to destroy it
	            		if(bricks[i].hitCount > 1){
	            			//remove the brick and update the score
	            			bricks.splice(i,1);
	            			score.updateScore(10);
	            		}
	            		if(bricks[i] != null)bricks[i].hitCount++;

	            	}else{
	            		//remove the brick and update the score
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
// method for bounding box collision detection, used for paddle/ ball
function boxCollides(b,p){
	 return (b.x-b.r <= p.x + p.width && //1left is to the left 2right
        p.x-b.r <= b.x + b.r && //2left is to the left of 1 right
    	b.y-b.r <= p.y + p.height && // 1top is to the top of 2bottom
        p.y-b.r <= b.y + b.r)
}

//-------------------------------------------------------------PRIVATE METHODS

// calculate the number of columns based on  
//the width of the screen and return the result

function calcNumOfCols(screenW){
	var num = W;
	var isMaxReached = false;
	// num is set to the width of the screen, and a while loop is set to reduce from the width 
	// until the width of all bricks will fit evenely
	while(!isMaxReached){
		if(num % BRICK_WIDTH == 0){
			isMaxReached = true;
		}else{
			num--;
		}
	}
	return num;
}

// method to place all bricks in an array
function placeBricks(){
	// randomize the color choice
	var bColor = Math.floor(Math.random()*2);
	// init the width variable
	var myWidth;
	if(W < 1050){
		myWidth = 1050;
	}else{
		myWidth = W;
	}
	// set the left side padding
	var leftPadding = (W - 1050)/ 2;
	// init the row hieght
	var row = 40;
	var column = leftPadding;
			//to test with less bricks
	// for (var i = 0; i < 1; i++) { 
	// loop through the number of bricks
	for (var i = 0; i < NUM_OF_BRICKS; i++) {
		// crate a new brick with a random color choice from the array
		var bColor = Math.floor(Math.random()*2);
		var myColor = brickColors[bColor];
		var brick = new Brick(column,row,myColor,ctx,canvas);
		// add it to the brick array
		bricks.push(brick);
		//calculate the next brick's position 
		// *** it is a similar prcedure to how a sprite sheet is animated with the drawImage()
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
// draw method for all entitities in the stage, this is called in the game loop above
function draw(){
	// paint the canvas
	paintCanvas();
	// draw the paddle
	paddle.draw();
	// draw all bricks
	for(var i =0; i < bricks.length; i++){
		bricks[i].draw();
	}
	// draw the ball and score objects
	ball.draw();
	score.draw();

	// if the game is over draw the game over overlay
	if(isGameOver){
		gameOver.draw();
	}
	
	// if the level is advacing draw the level overlay
	if(isAdvanceLevel){
		timer += 0.001;
		newLevel.draw();
		if((timer > 0.05)){
			nextLevel();
			timer = 0;
			isAdvanceLevel = false;
		}
	}
	// start screen overlay
	if(isGameStart){
		start.draw();
	}

}

//----------------------------------------------EVENT HANDLERS
// hnadler for mouse movement
function trackPosition(e){
	if(!isGameStart){ // check if game is in start screen
		var distanceR;
		var distanceL;
		//put the paddle back in the middle each new level
		if(!isAdvanceLevel)paddle.x = mouse.x -paddle.width/2;	
		//get the left and right side distance
		distanceR = W - (paddle.x +paddle.width);
		distanceL = paddle.x;
		reducePaddleX = 20;
		// reduce the bounds of the sides by a little to  correct potential problem of ball getting stuck on the sides 
		// prevent the paddle from going out of bounds
		if(distanceR <= -reducePaddleX){
			paddle.x = W - paddle.width+reducePaddleX;
		}else if(distanceL <= -reducePaddleX){
			paddle.x = -reducePaddleX;
		}
		// get the left side canvas offset from centering it
		var canvasOffset = $("#canvas").offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        // set the mouse object x and y to the cursor, taking away the offset
		mouse.x = parseInt(e.clientX - offsetX);
        mouse.y = parseInt(e.clientY - offsetY);
	}
}
// function to stop the game completely
function killGame(){
	isGameOver = true;
	clearInterval(loopInterval);
}
// function to advance to the next level
function nextLevel(){
	// update the level
	newLevel.updateLevel();
	// if the level are not higher than three, reduce the size of the paddle by 20 percent
	if(!(newLevel.myLevel > 3))paddle.width = paddle.width * 0.8;
	// reset the paddle and ball position
	paddle.x = W/2 - paddle.width/2;
	ball.x = paddle.x + paddle.width/2;
	ball.y = paddle.y-paddle.height-10;
	ball.vy = Math.abs(ball.vy) * -1;
	//replace all the bricks
	placeBricks();
}

// funciton to restart the game upon game over
function restart(){
	// reset game start boolean
	isGameStart = true;
	// recreate game loop 
	loopInterval = setInterval("requestAnimFrame(render)", 1000 / TARGET_FPS);
	// reset level and ball/ paddle positions
	newLevel.myLevel = 1;
	paddle.x = W/2 - paddle.width/2;
	ball.x = paddle.x + paddle.width/2;
	ball.y = paddle.y-paddle.height-10;
	ball.vy = Math.abs(ball.vy) * -1;
	// reset score and paddle size
	score.score = 0;
	paddle.width = 150;
	// set game over to false
	isGameOver = false;
}
// function to change color and also detect for enter key pressed
function changeColor(e){
	//check for space bar pressed
	if(e.keyCode == 32){
		//toggle the colors
		if(paddle.c == brickColors[0]){
			paddle.c = brickColors[1];	
			ball.c = brickColors[1];
		}else{
			ball.c = brickColors[0];
			paddle.c = brickColors[0];	
		}
		
		
	}else if(e.keyCode == 13 && isGameOver){
		// if enter is pressed and the game is over reatart the game
		restart();
	}
}

// functions to randomize slightly the ball's speed
function rndSpeedX(){

	var maxX = ballVX+1;
	var minX = ballVX-1;
	// check if the ball is already traveling in the positive or negative direction and randomize accordingly
	if(ball.vx < 0){
		ball.vx = (minX + (Math.random() * ((maxX - minX) + 1))) * -1;
	}else{
		ball.vx = minX + (Math.random() * ((maxX - minX) + 1));
	}

}
// same as above but for y
function rndSpeedY(){

	var maxY = ballVY+1;
	var minY = ballVY-1;

	if(ball.vy < 0){
		ball.vy = minY + (Math.random() * ((maxY - minY) + 1));
	}else{
		ball.vy = (minY + (Math.random() * ((maxY - minY) + 1)))*-1;
		
	}
}
