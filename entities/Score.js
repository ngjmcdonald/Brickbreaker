/*
	object to keep track of player score and display it
*/
function Score(posX,posY,myColor,ctx,canvas){
	//---- properties
	//score
	this.score = 0;
	//position
	this.x = posX;
	this.y = posY;
	//color
	this.c = myColor;

	//---- methods
	//method to draw in canvas
	this.draw = function(){
		ctx.fillStyle = "white";
		ctx.font = "20px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Score: "+ this.score, this.x, this.y);
	}
	// method to set and get the score
	this.updateScore = function(newScore){
		this.score += newScore;
	}
	this.getScore = function(){
		return this.score;
	}
}