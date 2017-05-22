function Brush(rune)
{
  Module.call(this,rune);
  
  this.parameters = [];
  this.settings  = {color:"#000000",size:2};
  this.pointers = [new Pointer(new Position("0,0"))];

  this.add_method(new Method("add_pointer",["Position","Color","Scale"]));

  this.add_pointer = function(cmd, preview = false)
  {
    if(preview){ return; }

    var pointer = new Pointer();
    pointer.offset = cmd.position() ? cmd.position() : new Position("0,0");
    pointer.color = cmd.color().hex ? cmd.color().hex : this.settings.color;
    pointer.scale = cmd.value().float ? cmd.value().float : 1;
    this.pointers.push(pointer);

    ronin.terminal.log(new Log(this,"Added pointer at: "+pointer.offset.render()));
    
    return 1, "ok";
  }

  this.size_up = function()
  {
    this.settings.size = parseInt(this.settings.size) + 1; 
  }

  this.size_down = function()
  {
    this.settings.size -= parseInt(this.settings.size) > 1 ? 1 : 0;
  }

  // Eraser

  this.erase = function()
  {
    if(!this.position_prev){this.position_prev = ronin.cursor.position; }
    
    var position = ronin.cursor.position;
    
    ronin.frame.context().beginPath();
    ronin.frame.context().globalCompositeOperation="destination-out";
    ronin.frame.context().moveTo(this.position_prev.x,this.position_prev.y);
    ronin.frame.context().lineTo(position.x,position.y);
    ronin.frame.context().lineCap="round";
    ronin.frame.context().lineWidth = this.settings.size * 3;
    ronin.frame.context().strokeStyle = new Color("#ff0000").rgba();
    ronin.frame.context().stroke();
    ronin.frame.context().closePath();
    
    this.position_prev = position;
  }
  
  // Mouse

  this.mouse_pointer = function(position)
  {
    return keyboard.shift_held == true ? ronin.cursor.draw_pointer_circle_eraser(position,this.settings.size * 3) : ronin.cursor.draw_pointer_circle(position,this.settings.size);
  }
  
  this.mouse_mode = function()
  {
    if(keyboard.shift_held == true){
      return "Eraser "+this.settings.size;
    }
    else{
      return "Brush <i style='color:"+this.settings["color"]+"'>&#9679;</i> "+this.settings.size;  
    }
  }
  
  this.mouse_down = function(position)
  {
    if(position.is_outside()){ return; }

    if(keyboard.shift_held == true){
      this.erase();
    }
    else{
      for (i = 0; i < ronin.brush.pointers.length; i++) {
        ronin.brush.pointers[i].start();
      }
    }
  }
  
  this.mouse_move = function(position,rect)
  {
    if(!this.mouse_held){ return; }
    
    if(keyboard.shift_held == true){
      this.erase();
    }
    else{
      for (i = 0; i < ronin.brush.pointers.length; i++) {
        ronin.brush.pointers[i].draw();
      }
    }
  }
  
  this.mouse_up = function(position,rect)
  {    
    for (i = 0; i < ronin.brush.pointers.length; i++) {
      ronin.brush.pointers[i].stop();
    }
    this.position_prev = null;
  }
}