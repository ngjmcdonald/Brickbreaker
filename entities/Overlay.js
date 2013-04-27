/*
	object to provide an overlay depending on the type requested
	used to display the upcoming level, winning the game, game over and the start screen
*/
function Overlay(myX,myY,type,ctx,canvas,score){
	// default the inititail level to two for when it is first requested upon entering the second level
	this.myLevel = 2;
	//check the type requested and set the title and descripption props accordingly
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
	// position properties
	this.x = myX;
	this.y = myY;
	// set the level if type level
	if(type == 'level'){
		this.description = "Level " + this.myLevel;
	}
	// method to update the level property
	this.updateLevel =function(lev){

		this.myLevel++;
		if(type == 'level'){
			this.description = "Level " + this.myLevel;
		}
	};
	// method to draw entity on the stage
	this.draw = function(){
		ctx.beginPath();
		ctx.rect(0,0,canvas.width,canvas.height);
		// change the opacity to make it more transparent
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fill();
		// text
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
		// if it is game over display score in green
		ctx.fillStyle = "green";
		if((type=='gameover')||(type=='win'))ctx.fillText("Your Score: " + score.getScore(), this.x, this.y+100);
		
	}
}