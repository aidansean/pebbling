<?php
$title = 'Pebbling a Chessboard' ;
$tagline = 'Thanks to Numberphile!' ;
$stylesheets = array('style.css') ;
$js_scripts  = array('functions.js') ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
<div class="right">
  <div class="blurb">
    <div class="tab">
        <div class="tabCell">
          <canvas id="canvas_board" width="480" height="480"></canvas>
        </div>
        <div class="tabCell">
          <h3>View options:</h3>
          <input type="submit" id="input_toggle_greenland" value="Show greenland" />
          <input type="submit" id="input_toggle_weights"   value="Show weights" />
          <h3>Weights:</h3>
          <table>
            <tbody>
              <tr>
                <th>Clones:</th>
                <td id="td_invariant_clone_weight"></td>
              </tr>
              <tr>
                <th>Prison:</th>
                <td id="td_prison_weight"></td>
              </tr>
              <tr>
                <th>Total greenland:</th>
                <td id="td_total_greenland_weight"></td>
              </tr>
              <tr>
                <th>Clones in prison:</th>
                <td id="td_clones_in_prison_weight"></td>
              </tr>
              <tr>
                <th>Clones in greenland:</th>
                <td id="td_clones_in_greenland_weight"></td>
              </tr>
            </tbody>
          </table>
          <h3>Make a new grid:</h3>
           <table>
            <tbody>
              <tr>
                <th>Rows:</th>
                <td><input id="input_nRow" class="input_number" type="text" value="8"/></td>
              </tr>
              <tr>
                <th>Columns:</th>
                <td><input id="input_nCol" class="input_number" type="text" value="8"/></td>
              </tr>
              <tr>
                <th></th>
                <td><input id="input_newGrid" type="submit" value="Create grid"/></td>
              </tr>
            </tbody>
          </table>
          <input id="input_editMode" type="submit" value="Edit mode"/>
          <input id="input_playMode" type="submit" value="Play mode"/><br />
          <canvas id="canvas_clone"  class="inactive_palette" width="100" height="100"></canvas>
          <canvas id="canvas_prison" class="inactive_palette" width="100" height="100"></canvas>
          <img src="/images/pebbling.png" style="display:none"/>
        </div>
    </div>
  </div>
</div>

<?php foot() ; ?>
