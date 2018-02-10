/*
  @Author: Noel Wilson
  @company: Rehab

  After Effects script to automate Rendering animixer animals,
  generation of animals and rendering of image sequence
*/

// ------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------

var errorStr = '';
var rootDir = 'D:/';

String.prototype.trim = function(str) {
  return this.replace(/^\s+|\s+$/gm, '');
}

String.prototype.endsWith = function(str) {
  return this.substring(this.length - str.length, this.length) === str;
};

String.prototype.startsWith = function(str) {
  return this.substring(0, str.length) === str;
};

Array.prototype.insert = function(item, index) {
  this.splice(index, 0, item);
};

function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

function permutator(list, maxLen, permutationsFile) {
  // Copy initial values as arrays
  if (permutationsFile) {
    var permFile = new File(permutationsFile);
    var existingData;
    try {
      permFile.open("r");
      existingData = JSON.parse(permFile.read());
      permFile.close();
    } catch (err) {}

    if (existingData) {
      $.writeln('Using existing permuation data');
      return existingData;
    }
  }

  var perm = [];

  for (var i = 0; i < list.length; i++) {
    perm.push([i]);
  }
  // Our permutation generator
  var generate = function(perm, maxLen, currLen) {
    // Reached desired length
    if (currLen === maxLen) {
      return perm;
    }
    // For each existing permutation
    for (var i = 0, len = perm.length; i < len; i++) {
      var currPerm = perm.shift();
      // Create new permutation
      for (var k = 0; k < list.length; k++) {
        if (currPerm.indexOf(k) == -1) {
          perm.push(currPerm.concat(k));
        }
      }
    }
    // Recurse
    return generate(perm, maxLen, currLen + 1);
  };
  // Start with size 1 because of initial values
  var retArray = generate(perm, maxLen, 1);

  // Render originals
  for (var i = 0; i < list.length; i++) {
    retArray.insert([
      i, i, i
    ], 0);
  }

  return retArray;
};

// ------------------------------------------------------------------
// After Effects project asset getters
// ------------------------------------------------------------------

function getComps(compareString) {
  var comps = [];
  for (var i = 1; i <= app.project.numItems; i++) {
    if (app.project.item(i)instanceof CompItem && app.project.item(i).name.endsWith(compareString)) {
      comps.push(app.project.item(i));
    }
  }
  return comps;
};

function getFolder(compareString) {
  var comps = [];
  for (var i = 1; i <= app.project.numItems; i++) {
    if (app.project.item(i)instanceof FolderItem && app.project.item(i).name.endsWith(compareString)) {
      comps.push(app.project.item(i));
    }
  }
  return comps;
};

function getLayers(comp, compareString, operation) {
  operation = operation || 'endsWith'
  var layers = [];
  for (var i = 1; i <= comp.layers.length; i++) {
    var name = comp.layers[i].name.trim();
    if (eval('name.' + operation + '(compareString)')) {
      layers.push(comp.layers[i]);
    }
  }
  if (layers.length === 0) {
    errorStr += 'Layer not found: ' + compareString + '\n';
  }

  return layers;
};

// ------------------------------------------------------------------
// After Effects render functions
// ------------------------------------------------------------------

function renderClear(app, comps) {
  app.project.renderQueue.render();
  while (app.project.renderQueue.numItems > 0) {
    app.project.renderQueue.item(app.project.renderQueue.numItems).remove();
  }
  while (comps.length > 0) {
    var comp = comps.shift();
    comp.remove();
  }
}

function getMarkerWidth(markers) {
  return markers[1].transform.position.value[0] - markers[0].transform.position.value[0];
}

/**
 * Place the legs of the new animal between the body legs markers
 */
function placeLegs(bodyMarkers, legsMarkers, legLayer) {
  // Find center of markers
  var centerx = (bodyMarkers[0].transform.position.value[0] + bodyMarkers[1].transform.position.value[0]) / 2;
  var centery = (bodyMarkers[1].transform.position.value[1] + bodyMarkers[1].transform.position.value[1]) / 2;
  var bodyWidth = Math.abs(getMarkerWidth(bodyMarkers));
  var legsWidth = Math.abs(getMarkerWidth(legsMarkers));
  var scale = bodyWidth / legsWidth;

  // Move legs anchor to center
  legLayer.transform.position.setValueAtTime(0, [centerx, centery]);

  // Make legs width match markers width
  if (legLayer.name.endsWith('_noscale') === false) {
    legLayer.transform.scale.setValueAtTime(0, [
      scale * 100,
      100
    ]);
  }
}

/**
 * Place the body of the new animal lower if head is tall
 */
function placeBodyTallHead(headLayer, bodyLayer) {
  // Find center of body
  var center = bodyLayer.transform.position.value;

  // Make body if head is tall
  if (headLayer.name.endsWith('_tall') === true) {
    bodyLayer.transform.position.setValueAtTime(0, [
      center[0], center[1] + 150
    ]);
  }
}

function folderExists(folderPath) {
  var folder = new Folder(folderPath);
  return folder.exists;
}

function fileExists(filePath) {
  var folder = new File(filePath);
  return folder.exists;
}

function renderComposition(renderComp, folderPath, filepath) {
  var renderItem = app.project.renderQueue.items.add(renderComp);
  var output = renderItem.outputModule(1);

  Folder(folderPath).create();
  output.file = new File(filepath);

  output.applyTemplate('TIFF Sequence with Alpha');

  return renderItem
}

/**
 * Move currently displayed Render layers to correct places then render this comp
 */
function renderAnimalComp(headComp, bodyComp, legsComp, outputPath) {
  // Create render comp for animal
  var head = headComp.name.replace('_walk', '');
  var body = bodyComp.name.replace('_walk', '');
  var tail = bodyComp.name.replace('_tail', '');
  var legs = legsComp.name.replace('_walk', '');
  var compName = head + '_' + body + '_' + legs + '_render';
  var existing = getComps(compName)[0];
  var foldersPath = outputPath || rootDir + 'Animixes';
  var folderPath = foldersPath + '/' + compName;
  var filepath = folderPath + '/' + compName;
  var AEFolderName = 'Animixes';

  if (existing) {
    existing.remove();
  }

  var renderFolder = getFolder(AEFolderName)[0];
  if (renderFolder === undefined) {
    renderFolder = app.project.items.addFolder(AEFolderName);
  }
  var renderComp = app.project.items.addComp(compName, 3200, 1800, 1, 0.7, 25);
  renderComp.parentFolder = renderFolder;

  // Get BG layer
  var bgLayer = getLayers(bodyComp, 'bg', 'startsWith')[0];

  // Get All layers we need to generate new comp
  var headLayer = getLayers(headComp, head + '_head', 'startsWith')[0];
  var bodyLayer = getLayers(bodyComp, body + '_body', 'startsWith')[0];
  var tailLayer = getLayers(bodyComp, body + '_tail', 'startsWith')[0];
  var legsLayer = getLayers(legsComp, legs + '_legs', 'startsWith')[0];
  var bodyLegsMarkers = getLayers(bodyComp, 'x_' + body + '_legs', 'startsWith');
  var legsMarkers = getLayers(legsComp, 'x_' + legs + '_legs', 'startsWith');
  var headMarker = getLayers(bodyComp, 'x_' + body + '_head', 'startsWith')[0];
  var tailMarker = getLayers(bodyComp, 'x_' + body + '_tail', 'startsWith')[0];
  var markerPos;

  // Copy layers to render comp
  bgLayer.copyToComp(renderComp);
  headLayer.copyToComp(renderComp);
  legsLayer.copyToComp(renderComp);
  tailLayer.copyToComp(renderComp);
  bodyLayer.copyToComp(renderComp);

  // Get render layers
  var renderBGLayer = getLayers(renderComp, 'bg', 'startsWith')[0];
  var renderHeadLayer = getLayers(renderComp, head + '_head', 'startsWith')[0];
  var renderBodyLayer = getLayers(renderComp, body + '_body', 'startsWith')[0];
  var renderLegsLayer = getLayers(renderComp, legs + '_legs', 'startsWith')[0];
  var renderTailLayer = getLayers(renderComp, body + '_tail', 'startsWith')[0];
  renderHeadLayer.locked = false;
  renderHeadLayer.visibile = true;
  renderBodyLayer.locked = false;
  renderBodyLayer.visibile = true;
  renderLegsLayer.locked = false;
  renderLegsLayer.visibile = true;
  renderTailLayer.locked = false;
  renderTailLayer.visibile = true;
  renderBGLayer.locked = false;
  renderBGLayer.visibile = true;

  // Move head to body
  markerPos = headMarker.transform.position.value;
  renderHeadLayer.transform.position.setValueAtTime(0, [
    markerPos[0], markerPos[1]
  ]);

  // Move tail to body
  markerPos = tailMarker.transform.position.value;
  renderTailLayer.transform.position.setValueAtTime(0, [
    markerPos[0], markerPos[1]
  ]);

  // Move legs to body
  placeLegs(bodyLegsMarkers, legsMarkers, renderLegsLayer);

  // Parent head and tail to body
  renderHeadLayer.parent = renderBodyLayer;
  renderTailLayer.parent = renderBodyLayer;
  renderLegsLayer.parent = renderBodyLayer;

  // Move tall heads
  placeBodyTallHead(renderHeadLayer, renderBodyLayer);

  // Scale comp
  scaleComp(renderComp, 0.25);

  // render
  var renderItem = renderComposition(renderComp, folderPath, filepath);

  return [renderComp, renderItem];
}

function scaleComp(comp, scaleFactor) {
  var activeComp = comp;

  // Create a null 3D layer.
  var null3DLayer = activeComp.layers.addNull();
  null3DLayer.threeDLayer = true;

  // Set its position to (0,0,0).
  null3DLayer.position.setValue([0, 0, 0]);

  // Set null3DLayer as parent of all layers that don't have parents.
  makeParentLayerOfAllUnparented(activeComp, null3DLayer);

  // Set new comp width and height.
  activeComp.width = Math.floor(activeComp.width * scaleFactor);
  activeComp.height = Math.floor(activeComp.height * scaleFactor);

  // Then for all cameras, scale the Zoom parameter proportionately.
  scaleAllCameraZooms(activeComp, scaleFactor);

  // Set the scale of the super parent null3DLayer proportionately.
  var superParentScale = null3DLayer.scale.value;
  superParentScale[0] = superParentScale[0] * scaleFactor;
  superParentScale[1] = superParentScale[1] * scaleFactor;
  superParentScale[2] = superParentScale[2] * scaleFactor;
  null3DLayer.scale.setValue(superParentScale);

  // Delete the super parent null3DLayer with dejumping enabled.
  null3DLayer.remove();
}

//
// Sets newParent as the parent of all layers in theComp that don't have parents.
// This includes 2D/3D lights, camera, av, text, etc.
//
function makeParentLayerOfAllUnparented(theComp, newParent) {
  for (var i = 1; i <= theComp.numLayers; i++) {
    var curLayer = theComp.layer(i);
    var wasLocked = curLayer.locked;
    curLayer.locked = false;
    if (curLayer != newParent && curLayer.parent == null) {
      curLayer.parent = newParent;
    }
    curLayer.locked = wasLocked
  }
}

//
// Scales the zoom factor of every camera by the given scale_factor.
// Handles both single values and multiple keyframe values.
function scaleAllCameraZooms(theComp, scaleBy) {
  for (var i = 1; i <= theComp.numLayers; i++) {
    var curLayer = theComp.layer(i);
    if (curLayer.matchName == "ADBE Camera Layer") {
      var curZoom = curLayer.zoom;
      if (curZoom.numKeys == 0) {
        curZoom.setValue(curZoom.value * scaleBy);
      } else {
        for (var j = 1; j <= curZoom.numKeys; j++) {
          curZoom.setValueAtKey(j, curZoom.keyValue(j) * scaleBy);
        }
      }
    }
  }
}

/**
 * Render Animals in AE, will load a project file if given and then look
 * for comps to build animals with then render, will quit after completion.
 *
 * @param  {string} projectPath      Optional will load project before rendering
 * @param  {list} permutationsFile Optional list of list of indexs of animals to load
                                     for use by external process to batch render animals
 */
function renderAnimals(projectPath, permutationsFile, outputPath) {
  //app.beginUndoGroup('XXX');

  if (projectPath) {
    var project = new File(projectPath);
    app.open(project);
  }

  // Clear cache
  $.writeln('Clearing cache.');
  app.purge(PurgeTarget.ALL_CACHES);

  // Get all walk comps
  var walkComps = getComps('_walk');
  errorStr = '';
  var batchSize = 25;
  var batch = 0;
  var comps = [];

  // Generate all possible combinations for target comp or load from file
  var permutations = permutator(walkComps, 3, permutationsFile);

  // While there are walk comps to process
  while (permutations.length > 0) {
    try {
      var walk_cmp_1 = walkComps[permutations[0][0]];
      var walk_cmp_2 = walkComps[permutations[0][1]];
      var walk_cmp_3 = walkComps[permutations[0][2]];
      var renderCompItem = renderAnimalComp(walk_cmp_1, walk_cmp_2, walk_cmp_3, outputPath);
      if (renderCompItem) {
        $.writeln('Composed animal: ' + walk_cmp_1.name + walk_cmp_2.name + walk_cmp_3.name);
        comps.push(renderCompItem[0]);
        batch++;
      } else {
        $.writeln('Skipping animal: ' + walk_cmp_1.name + walk_cmp_2.name + walk_cmp_3.name);
      }

    } catch (err) {
      errorStr += 'Error missing element / badly named element, skipping animal.\n';
      errorStr += 'Error: ' + err + '\n';
      $.writeln(errorStr);
    }

    if (batch >= batchSize) {
      renderClear(app, comps);
      batch = 0;
      comps = [];
      // Clear cache
      $.writeln('Clearing cache.');
      app.purge(PurgeTarget.ALL_CACHES);
    }

    // remove target permutation from list of permutations
    permutations.shift();
  }

  renderClear(app, comps);

  // Show errors
  if (errorStr) {
    errorStr = 'Error Report:\n' + errorStr;
    $.writeln(errorStr);
    alert(errorStr);
  }

  $.writeln('Render animals complete');

  //app.endUndoGroup();
  app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
  app.quit();
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

renderAnimals(undefined, 'C:\\Users\\rehabstudio\\Projects\\animixer\\generateGif\\ae_project\\permutations.json', undefined);
