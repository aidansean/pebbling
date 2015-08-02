var keep_square = true ;

var nRow = (parseInt(getParameterByName('nRow'))>0) ? parseInt(getParameterByName('nRow')) : 8 ;
var nCol = (parseInt(getParameterByName('nCol'))>0) ? parseInt(getParameterByName('nCol')) : 8 ;
var margin = 10 ;
var cw = 480 ; // Canvas height
var ch = 480 ; // Canvas width
var sw = (cw-2*margin)/nCol ; // Square width
var sh = (ch-2*margin)/nRow ; // Square height
if(keep_square){
  sw = Math.min(sw,sh) ;
  sh = sw ;
}
var weights = new Array() ;
function get_weights(){
  weights['clones'] = 0 ;
  weights['prison'] = 0 ;
  weights['available_greenland'] = 0 ;
  weights['clones_in_prison'   ] = 0 ;
  weights['clones_in_greenland'] = 0 ;
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nRow ; j++){
      var c = cells[i][j] ;
      var w = c.weight ;
      if(c.has_clone                       ) weights['clones'             ] += w ;
      if(c.type=='prison'                  ) weights['prison'             ] += w ;
      if(c.has_clone && c.type=='prison'   ) weights['clones_in_prison'   ] += w ;
      if(c.has_clone && c.type=='greenland') weights['clones_in_greenland'] += w ;
    }
  }
  weights['greenland'] = 4 - weights['prison'] ;
  Get('td_invariant_clone_weight'    ).innerHTML = weights['clones'             ] ;
  Get('td_total_greenland_weight'    ).innerHTML = weights['greenland'          ] ;
  Get('td_prison_weight'             ).innerHTML = weights['prison'             ] ;
  Get('td_clones_in_prison_weight'   ).innerHTML = weights['clones_in_prison'   ] ;
  Get('td_clones_in_greenland_weight').innerHTML = weights['clones_in_greenland'] ;
}

var palette_width  = 100 ;
var palette_height = 100 ;

// Give these global scope, because I'm lazy
var canvas_board   = null ;
var canvas_clone   = null ;
var canvas_prison  = null ;
var context_board  = null ;
var context_clone  = null ;
var context_prison = null ;
var context        = null ; // This is the active canvas
var mode = 'play' ;

var cells = null ;
var cell_prison    = null ;
var cell_greenland = null ;
var cell_void      = null ;

function get_color(name){
  if(name=='greenland'){
    return 'rgba(0,255,0,0.5)' ;
  }
  else if(name=='prison'){
    return (mode=='play') ? 'rgb(200,0,0)' : 'rgb(0,100,0)' ;
  }
  else if(name=='clone'){
    return (mode=='play') ? 'rgb(255,0,0)' : 'rgb(0,200,0)' ;
  }
  else if(name=='text_light'){
    return 'rgb(255,255,255)' ;
  }
  else if(name=='text_dark'){
    return 'rgb(0,0,0)' ;
  }
  else if(name=='border'){
    return 'rgb(0,0,0)' ;
  }
}

var show_greenland = false ;
var show_weights   = false ;

var prison_lineWidth = 3 ;
var barb_dx_factor = 0.1 ;
var barb_dy_factor = 0.1 ;
var clone_r_factor = 0.3 ;
var text_dy_factor = 0.1 ;
var text_height_factor = 0.4 ;

var paintbrush = null ;
var prison_cells = [ [0,0] , [0,1] , [1,0] ] ;
var clone_cells  = [ [0,0] , [0,1] , [1,0] ] ;

function parse_url(){
  var prison_cells_string = getParameterByName('p') ;
  if(prison_cells_string!=null){
    prison_cells = [] ;
    var prison_cells_parts = prison_cells_string.split(';') ;
    for(var i=0 ; i<prison_cells_parts.length ; i++){
      var prison_cell_coords = prison_cells_parts[i].split(',') ;
      var a = parseInt(prison_cell_coords[1]) ;
      var b = parseInt(prison_cell_coords[0]) ;
      prison_cells.push([a,b]) ;
    }
  }
  var clone_cells_string = getParameterByName('c') ;
  if(clone_cells_string!=null){
    clone_cells = [] ;
    var clone_cells_parts = clone_cells_string.split(';') ;
    for(var i=0 ; i<clone_cells_parts.length ; i++){
      var clone_cell_coords = clone_cells_parts[i].split(',') ;
      var a = parseInt(clone_cell_coords[1]) ;
      var b = parseInt(clone_cell_coords[0]) ;
      clone_cells.push([a,b]) ;
    }
  }
}
function getParameterByName(name){
  // Taken from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search) ;
  return match && decodeURIComponent(match[1].replace(/\+/g, ' ')) ;
}

function remake_cells(){
  sw = (cw-2*margin)/nCol ; // Square width
  sh = (ch-2*margin)/nRow ; // Square height
  if(keep_square){
    sw = Math.min(sw,sh) ;
    sh = sw ;
  }
  cells = new Array() ;
  for(var i=0 ; i<nRow ; i++){
    cells.push(new Array()) ;
    for(var j=0 ; j<nCol ; j++){
      var c = new cell_object(i,j) ;
      if(i+j<2 && false){
        c.type = 'prison' ;
        c.has_clone = true ;
      }
      cells[i].push(c) ;
    }
  }
  if(prison_cells){
    for(var i=0 ; i<prison_cells.length ; i++){
      cells[prison_cells[i][0]][prison_cells[i][1]].type = 'prison' ;
    }
  }
  if(prison_cells){
    for(var i=0 ; i<clone_cells.length ; i++){
      cells[clone_cells[i][0]][clone_cells[i][1]].has_clone = true ;
    }
  }
  get_weights() ;
}

function toggle_show_greenland(){
  show_greenland = !show_greenland ;
  Get('input_toggle_greenland').value = (show_greenland) ? 'Hide greenland' : 'Show greenland' ;
  draw_grid() ;
}
function toggle_show_weights(){
  show_weights = !show_weights ;
  Get('input_toggle_weights').value = (show_weights) ? 'Hide weights' : 'Show weights' ;
  draw_grid() ;
}

function start(){
  // Get the canvae and contexts
  canvas_board   = Get('canvas_board' ) ;
  canvas_clone   = Get('canvas_clone' ) ;
  canvas_prison  = Get('canvas_prison') ;
  context_board  = canvas_board.getContext('2d') ;
  context_clone  = canvas_clone.getContext('2d') ;
  context_prison = canvas_prison.getContext('2d') ;
  
  // Set styles
  var contexts = [ context_board , context_clone , context_prison ] ;
  for(var i=0 ; i<contexts.length ; i++){
    contexts[i].lineCap = 'round' ;
    contexts[i].textAlign = 'center' ;
  }
  
  // Add event listeners
  canvas_board .addEventListener('mousedown',board_mousedown) ;
  canvas_clone .addEventListener('mousedown',change_paintbrush_clone ) ;
  canvas_prison.addEventListener('mousedown',change_paintbrush_prison) ;
  
  Get('input_toggle_greenland').addEventListener('click',toggle_show_greenland) ;
  Get('input_toggle_weights'  ).addEventListener('click',toggle_show_weights  ) ;
  Get('input_newGrid'         ).addEventListener('click',create_new_grid      ) ;
  Get('input_editMode'        ).addEventListener('click',change_edit_mode     ) ;
  Get('input_playMode'        ).addEventListener('click',change_play_mode     ) ;
  
  // Create some special cells for the edges of board
  cell_prison    = new cell_object(-1,-1) ; cell_prison.type     = 'prison'    ;
  cell_greenland = new cell_object(-1,-1) ; cell_greenland.type  = 'greenland' ;
  cell_void      = new cell_object(-1,-1) ; cell_void.type       = 'void'      ;
  
  // And for the palettes
  cell_palette_clone  = new cell_object(0,1) ; cell_palette_clone.has_clone = true     ;
  cell_palette_prison = new cell_object(0,1) ; cell_palette_prison.type     = 'prison' ;
  cell_palette_clone.sw = palette_width -2*margin ; cell_palette_prison.sw = palette_width -2*margin ;
  cell_palette_clone.sh = palette_height-2*margin ; cell_palette_prison.sh = palette_height-2*margin ;
  cell_palette_clone.x  = margin                  ; cell_palette_prison.x  = margin                  ;
  cell_palette_clone.y  = margin                  ; cell_palette_prison.y  = margin                  ;
  cell_palette_clone.palette = true               ; cell_palette_prison.palette = true               ;
  
  // Get settings from url, if they exist
  context = context_board ;
  parse_url() ;
  remake_cells() ;
  draw_grid() ;
  
  context = context_clone  ;  cell_palette_clone.draw_all() ;
  context = context_prison ; cell_palette_prison.draw_all() ;
  context = context_board ;
}
function change_edit_mode(){
  mode = 'edit' ;
  paintbrush = 'clone' ;
  canvas_clone .className =   'active_palette' ;
  canvas_prison.className = 'inactive_palette' ;
  draw_grid() ;
}
function change_play_mode(){
  mode = 'play' ;
  canvas_clone .className = 'inactive_palette' ;
  canvas_prison.className = 'inactive_palette' ;
  draw_grid() ;
}
function change_paintbrush_clone(){
  if(mode!='edit') return ;
  paintbrush = 'clone' ;
  canvas_clone .className =   'active_palette' ;
  canvas_prison.className = 'inactive_palette' ;
}
function change_paintbrush_prison(){
  if(mode!='edit') return ;
  paintbrush = 'prison' ;
  canvas_clone .className = 'inactive_palette' ;
  canvas_prison.className =   'active_palette' ;
}

function create_new_grid(){
  nRow = Math.max(1,parseInt(Get('input_nRow').value)) ;
  nCol = Math.max(1,parseInt(Get('input_nCol').value)) ;
  remake_cells() ;
  draw_grid() ;
}

function draw_grid(){
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,cw,ch) ;
  // There's probably a more efficient way to do this...
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_box() ;
    }
  }
  context.strokeStyle = 'rgb(0,0,0)' ;
  context.strokeRect(margin-0.5,margin-0.5,cw-2*margin,ch-2*margin) ;
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_clone() ;
    }
  }
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_prison() ;
    }
  }
  for(var i=0 ; i<nRow ; i++){
    for(var j=0 ; j<nCol ; j++){
      cells[i][j].draw_weight() ;
    }
  }
}

function cell_object(a,b){
  this.a = a ; // row    (a y-like variable)
  this.b = b ; // column (a x-like variable)
  this.type = 'greenland' ;
  this.inverse_weight = Math.floor(Math.pow(2,a+b)) ; // Make writing fractions simpler
  this.weight = 1.0/this.inverse_weight ;
  this.has_clone = false ;
  this.colour = ((this.a+this.b)%2==0) ? 'rgb(0,0,0)' : 'rgb(255,255,255)' ;
  this.sw = sw ;
  this.sh = sh ;
  this.x  = margin + this.b*this.sw ;
  this.y  = margin + (nRow-1-this.a)*this.sh ;
  this.palette = false ;
  this.paint = function(){
    if(paintbrush=='clone'){
      this.has_clone = !this.has_clone ;
    }
    else if(paintbrush=='prison'){
      if(this.type=='prison'){ this.type = 'greenland' ; }
      else if(this.type=='greenland'){ this.type = 'prison' ; }
    }
    draw_grid() ;
  }
  this.draw_all = function(){
    this.draw_box() ;
    this.draw_clone() ;
    this.draw_prison() ;
    this.draw_weight() ;
    this.draw_border() ;
  }
  this.draw_box = function(){
    context.fillStyle = this.colour ;
    context.fillRect(this.x,this.y,this.sw,this.sh) ;
    if(this.type=='greenland' && show_greenland){
      context.fillStyle = get_color('greenland') ;
      context.fillRect(this.x,this.y,this.sw,this.sh) ;
    }
  }
  this.draw_border = function(){
    context.strokeStyle = get_color('border') ;
    context.lineWidth = 1 ;
    context.strokeRect(this.x-0.5,this.y-0.5,this.sw,this.sh) ;
  }
  this.draw_clone = function(){
    if(this.has_clone==false) return ;
    context.beginPath() ;
    context.fillStyle = get_color('clone') ;
    var cx = this.x+0.5*this.sw ;
    var cy = this.y+0.5*this.sh ;
    context.arc(cx,cy,clone_r_factor*Math.min(this.sw,this.sh),0,2*Math.PI,true) ;
    context.fill() ;
  }
  this.draw_prison = function(){
    if(this.type!='prison') return ;
    context.beginPath() ;
    context.strokeStyle = get_color('prison') ;
    context.lineWidth   = prison_lineWidth ;
    if(this.neighbour_N().type!='prison' || this.palette==true){
      context.moveTo(this.x   ,this.y   ) ;
      context.lineTo(this.x+this.sw,this.y   ) ;
      context.stroke() ;
      this.draw_barb(this.x+0.5*this.sw,this.y+0.0*this.sh) ;
    }
    if(this.neighbour_E().type!='prison' || this.palette==true){
      context.moveTo(this.x+this.sw,this.y   ) ;
      context.lineTo(this.x+this.sw,this.y+this.sh) ;
      context.stroke() ;
      this.draw_barb(this.x+1.0*this.sw,this.y+0.5*this.sh) ;
    }
    if(this.neighbour_S().type!='prison' || this.palette==true){
      context.moveTo(this.x+this.sw,this.y+this.sh) ;
      context.lineTo(this.x   ,this.y+this.sh) ;
      context.stroke() ;
      this.draw_barb(this.x+0.5*this.sw,this.y+1.0*this.sh) ;
    }
    if(this.neighbour_W().type!='prison' || this.palette==true){
      context.moveTo(this.x   ,this.y+this.sh) ;
      context.lineTo(this.x   ,this.y   ) ;
      context.stroke() ;
      this.draw_barb(this.x+0.0*this.sw,this.y+0.5*this.sh) ;
    }
    context.stroke() ;
  }
  this.draw_barb = function(x,y){
    context.beginPath() ;
    context.strokeStyle = get_color('prison') ;
    context.lineWidth   = prison_lineWidth ;
    context.moveTo(x-barb_dx_factor*sw,y-barb_dy_factor*sh) ;
    context.lineTo(x+barb_dx_factor*sw,y+barb_dy_factor*sh) ;
    context.moveTo(x-barb_dx_factor*sw,y+barb_dy_factor*sh) ;
    context.lineTo(x+barb_dx_factor*sw,y-barb_dy_factor*sh) ;
    context.stroke() ;  
  }
  this.draw_weight = function(){
    if(show_weights==false) return ;
    context.font = Math.floor(this.sh*text_height_factor)+' Arial' ;
    context.fillStyle = ( (this.a+this.b)%2==0 || this.has_clone==true) ? get_color('text_light') : get_color('text_dark') ; 
    context.fillText('1', this.x+0.5*this.sw,this.y+(0.5-text_dy_factor)*this.sh) ;
    var line = '_' ;
    for(var i=0 ; i<Math.log(this.inverse_weight)/Math.log(10) ; i++){ line = line + '_' ; }
    context.fillText(line               , this.x+0.5*this.sw,this.y+(0.5-0.8*text_dy_factor)*this.sh) ;
    context.fillText(this.inverse_weight, this.x+0.5*this.sw,this.y+(0.5+    text_dy_factor)*this.sh) ;
  }
  this.neighbour_N = function(){
    if(this.a==nRow-1) return cell_void ;
    return cells[this.a+1][this.b] ;
  }
  this.neighbour_S = function(){
    if(this.a==0) return cell_void ;
    return cells[this.a-1][this.b] ;
  }
  this.neighbour_E = function(){
    if(this.b==nCol-1) return cell_void ;
    return cells[this.a][this.b+1] ;
  }
  this.neighbour_W = function(){
    if(this.b==0) return cell_void ;
    return cells[this.a][this.b-1] ;
  }
  this.can_clone = function(){
    var cN = this.neighbour_N() ;
    var cE = this.neighbour_E() ;
    if(cN.type=='void' || cE.type=='void') return false ; // Don't go out of the board
    return (cN.has_clone==false && cE.has_clone==false) ; // Check to see if target cells are empty
  }
  this.make_clone = function(){
    if(this.has_clone==false) return ;
    if(this.can_clone()==false){
      return ;
    }
    this.has_clone = false ;
    this.neighbour_N().has_clone = true ;
    this.neighbour_E().has_clone = true ;
    draw_grid() ;
  }
}

function XY_from_mouse(evt){
  var X = evt.pageX - evt.target.offsetLeft ;
  var Y = evt.pageY - evt.target.offsetTop  ;
  return [X,Y] ;
}
function board_mousedown(evt){
  // Is it a right click?
  var rightclick ;
  if(!evt) var evt = window.event ;
  if(evt.which) rightclick = (evt.which==3) ;
  else if(evt.button) rightclick = (evt.button==2) ;

  var XY = XY_from_mouse(evt) ;
  var nRowCapture = (keep_square) ? Math.max(nRow,nCol) : nRow ;
  var nColCapture = (keep_square) ? Math.max(nRow,nCol) : nCol ;
  var a = nRow-1-Math.floor(nRowCapture*(XY[1]-margin)/(ch-2*margin)) ;
  var b =        Math.floor(nColCapture*(XY[0]-margin)/(cw-2*margin)) ;
  if(a>=0 && a<nRow){
    if(b>=0 && b<nCol){
      if(rightclick){
      }
      else{
        if(mode=='play'){
          cells[a][b].make_clone() ;
        }
        else if(mode=='edit'){
          cells[a][b].paint() ;
        }
      }
    }
    get_weights() ;
  }
}
function Get(id){ return document.getElementById(id) ; }
