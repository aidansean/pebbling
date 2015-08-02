<?php
include_once($_SERVER['FILE_PREFIX']."/project_list/project_object.php") ;
$github_uri   = "https://github.com/aidansean/pebbling" ;
$blogpost_uri = "http://aidansean.com/projects/?tag=pebbling" ;
$project = new project_object("pebbling", "Pebbling a Chessboard", "https://github.com/aidansean/pebbling", "http://aidansean.com/projects/?tag=pebbling", "pebbling/images/project.jpg", "pebbling/images/project_bw.jpg", "One of the channels I follow on YouTube is called Numberphile, and they give plenty of good ideas for mathematical games.  In this game the user has to move pieces around a chessboard in order to liberate \"clones\" from a prison. On Numberphile, they suggested playing this game using an actual chessboard, but I decided that a better way to do it would be to write my own game.  So here it is.", "Games,Maths", "canvas,CSS,HTML,JavaScript") ;
?>