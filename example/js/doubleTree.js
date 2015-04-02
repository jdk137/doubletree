/* 调用示例
  var doubleTree = new DoubleTree({
    containerId: "doubletreeContainer",
    linkChildren: '/metaTableRelation/queryChildTables?guid=',
    linkParent: '/metaTableRelation/queryParentTables?guid=',
    linkSelf: '/metaTableRelation/statistic?guid=',
    linkHover: 'json/q.json?guid=',
    guid: 'odps.ju_daily.brandsort_score_pay_week_matrix',
    callback: function () {
      $(".loading").hide();
    }
  });
*/
var DoubleTree = function (config) {
  var containerId = config.containerId;
  var linkChildren = config.linkChildren;
  var linkParent = config.linkParent;
  var linkSelf = config.linkSelf;
  var linkHover = config.linkHover;
  var guid = config.guid;
  var cb = config.callback || function () {};
  var getFloatContent = config.getFloatContent || function (d) {
    return d.name + '<br><br>' + d.owner;
  };

  $.ajax({url: linkSelf + guid, cache: false}).done(function(selfJson){
    $.ajax({url: linkParent + guid, cache: false}).done(function(parentJson) {
      $.ajax({url: linkChildren + guid, cache: false}).done(function(childrenJson) {

        var FloatTag = function () {
          var mouseToFloatTag = {x: 20, y: 20};
          var setContent = function () {};
          //var canMove = true; // if move when it's show. true, false;
          var loc;
          var node;
          var container;
          var timeOut;
          //set floatTag location, warning: the html content must be set before call this func,
          // because jqNode's width and height depend on it's content;
          var _changeLoc = function () {
              //m is mouse location, example: {x: 10, y: 20}
              var m = loc;
              var x = m.x;
              var y = m.y;
              var floatTagWidth = node.outerWidth ? node.outerWidth() : node.width();
              var floatTagHeight = node.outerHeight ? node.outerHeight() : node.height();

              if (floatTagWidth + x + 2 * mouseToFloatTag.x <=  $(container).width()) {
                  x += mouseToFloatTag.x;
              } else {
                  x = x - floatTagWidth - mouseToFloatTag.x;
              }
              if (y >= floatTagHeight + mouseToFloatTag.y) {
                  y = y - mouseToFloatTag.y - floatTagHeight;
              } else {
                  y += mouseToFloatTag.y;
              }
              node.css("left", x);
              node.css("top", y);
          };
          var _mousemove = function (e) {
              var offset = $(container).offset();
              if (!(e.pageX && e.pageY)) {return false;}
              var x = e.pageX - offset.left,
                  y = e.pageY - offset.top;

              setContent.call(this);

              loc = {'x': x, 'y': y};
          };

          var floatTag = function (cont) {
              container = $(cont);
              node = $("<div/>").css({
                  "border": "1px solid",
                  "border-color": $.browser.msie ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.8)",
                  "background-color": $.browser.msie ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.55)",
                  "color": "white",
                  "border-radius": "2px",
                  "padding": "5px 3px 5px 8px",
                  "font-size": "12px",
                  "box-shadow": "3px 3px 6px 0px rgba(0,0,0,0.58)",
                  "font-familiy": "宋体",
                  "z-index": 1000,
                  "line-height": "90%",
                  "text-align": "left",
                  "visibility": "hidden",
                  "position": "absolute"
              });
              container.append(node);
              container.on('mousemove', _mousemove);
              container.on('tap', _mousemove);
              node.creator = floatTag;
              return node;
          };

          floatTag.setContent = function (sc) {
              if (arguments.length === 0) {
                  return setContent;
              }
              setContent = sc;
              return floatTag;
          };

          floatTag.mouseToFloatTag = function (m) {
              if (arguments.length === 0) {
                  return mouseToFloatTag;
              }
              mouseToFloatTag = m;
              return floatTag;
          };

          floatTag.fade = function () {
            timeOut = setTimeout(function () {
              node.css({
                visibility: 'hidden'
              });
              /*
              node.animate({
                opacity: 0
              }, 200, function () {
                node.css({
                  opacity: 1,
                  visibility: 'hidden'
                });
              });
              */
            }, 400);
          };

          floatTag.hide = function () {
            node.css({
              visibility: 'hidden'
            });
          };

          floatTag.show = function () {
            clearTimeout(timeOut);
            node.css({
              visibility: 'visible'
            });
          };

          floatTag.refresh = function () {
            clearTimeout(timeOut);
            floatTag.changeLoc();
            node.css({
              visibility: 'visible'
            });
          };

          floatTag.changeLoc = _changeLoc;

          return floatTag;
        };

        //var containerId = 'chartBox-body';
        var container = $("#" + containerId);
        container.css('position', 'relative');

        var levelPadding = 180;
        var m = [60, 120, 30, 120],
            w = container.width() - m[1] - m[3],
            h = Math.max(300, container.height()) - m[0] - m[2],
            i = 0,
            duration = 500,
            root;

        //button and search Related;
        var rightGroup = {groupIndex: 0};
        var leftGroup = {groupIndex: 0};
        var groupNodeNumber = 10;
        var createControlGroup = function (orient) {
          var ControlGroup = function (orient) {
            var container, upButton, downButton, foreignObject, searchBox;
            var foreignObjectGroup = [];
            var buttonHeight = 20,
                buttonWidth = 50;

            if (orient === 'right') {
              container = vis;
            } else {
              container = vis2;
            }
            var getUp = function () {
              var recentExpandNode, group;
              if (orient === 'right') {
                recentExpandNode = recentExpandNodeRight;
                group = rightGroup;
              } else {
                recentExpandNode = recentExpandNodeLeft;
                group = leftGroup;
              }

              if (group.groupIndex > 0) {
                group.groupIndex--;
                //console.log(group.groupIndex);
                recentExpandNode.children = recentExpandNode._children.slice(group.groupIndex * groupNodeNumber, (group.groupIndex + 1) * groupNodeNumber);
                update(recentExpandNode);
              }
            };
            var getDown = function () {
              var recentExpandNode, group;
              if (orient === 'right') {
                recentExpandNode = recentExpandNodeRight;
                group = rightGroup;
              } else {
                recentExpandNode = recentExpandNodeLeft;
                group = leftGroup;
              }
              if ((group.groupIndex + 1) * groupNodeNumber < recentExpandNode._children.length) {
                group.groupIndex++;
                //console.log(group.groupIndex);
                recentExpandNode.children = recentExpandNode._children.slice(group.groupIndex * groupNodeNumber, (group.groupIndex + 1) * groupNodeNumber);
                update(recentExpandNode);
              }
            };
            var createForeignObject = function () {
              var foreignObject = container.append('foreignObject')
                  .attr("width", 250)
                  .attr("height", 40)
                  .attr("transform", "translate(0, -30)");
              searchBox = $('<input value="" class="typeahead" data-provide="typeahead" placeholder="search guid" type="text">');

              $('<div xmlns="http://www.w3.org/1999/xhtml"></div>')
                .append(searchBox)
                .appendTo($(foreignObject[0]));

              var $typeAhead = $(foreignObject[0]).find('.typeahead');
              var typeAhead = $typeAhead.typeahead({
                updater: function (r) {
                  if (r) {
                    var index, nodeData;
                    $typeAhead.data('nodesData').forEach(function (d, i) {
                      if (d.guid === r) {
                        nodeData = d;
                        index = i;
                      }
                    });
                    if (nodeData) {
                      if (nodeData.leaf) {
                        if (nodeData.orient === 'right') {
                          rightGroup.groupIndex = Math.floor(index / groupNodeNumber) + 1;
                        } else {
                          leftGroup.groupIndex = Math.floor(index / groupNodeNumber) + 1;
                        }
                        getUp();
                      } else {
                        click(nodeData);
                      }
                    }
                  }
                }
              });
              return foreignObject;
            };
            var refreshForeignObject = function () {
              var recentExpandNode = orient === 'right' ? recentExpandNodeRight : recentExpandNodeLeft;

              var depth = recentExpandNode.depth;
              var foreignObject;
              if (!foreignObjectGroup[depth]) { // create if not exist
                foreignObject = createForeignObject(recentExpandNode);
                if (orient === 'right') {
                  foreignObject.attr("transform", "translate("+ ((recentExpandNode.depth + 1) * levelPadding - buttonWidth / 2) + ', ' + (-buttonHeight * 2.5) + ')');
                } else {
                  foreignObject.attr("transform", "translate("+ (w - ((recentExpandNode.depth + 1) * levelPadding) - buttonHeight / 2) + ', ' + (-buttonHeight * 2.5) + ')');
                }
                foreignObjectGroup[depth] = foreignObject;
              }
              // set or refresh foreignObject source search list
              var $typeAhead = $(foreignObjectGroup[depth][0]).find('.typeahead');
              $typeAhead.data('typeahead').source = recentExpandNode._children.map(function (d) {
                return d.guid;
              });
              $typeAhead.data('nodesData', recentExpandNode._children);

              foreignObjectGroup.forEach(function (d, i) {
                if (i <= depth) {
                  d.attr('opacity', 1);
                } else {
                  d.attr('opacity', 0);
                }
              });
            };
            //foreignObject = createForeignObject();

            upButton = container.append('g')
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .attr("cursor", "pointer")
                .attr("transform", "translate(0, -20)");
            upButton.append('rect')
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .attr("fill", "steelblue");
            upButton.append('path')
                .attr("d", 'M20 15 L25 5 L30 15');
            downButton = container.append('g')
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .attr("cursor", "pointer")
                .attr("transform", "translate(0, " + (h + m[0]) + ")");
            downButton.append('rect')
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .attr("fill", "steelblue");
            downButton.append('path')
                .attr("d", 'M20 5 L25 15 L30 5');
            upButton.on("click", getUp);
            downButton.on("click", getDown);
            upButton.style("display", "none");
            downButton.style("display", "none");
            this.refreshPosition = function () {
              var recentExpandNode, group, groupIndex;
              if (orient === 'right') {
                recentExpandNode = recentExpandNodeRight;
                group = rightGroup;

                refreshForeignObject();
                //foreignObject.attr("transform", "translate("+ ((recentExpandNode.depth + 1) * levelPadding - buttonWidth / 2) + ', ' + (-buttonHeight * 2.5) + ')');
                upButton.attr("transform", "translate("+ ((recentExpandNode.depth + 1) * levelPadding - buttonWidth / 2) + ', ' + (-buttonHeight) + ')');
                downButton.attr("transform", "translate("+ ((recentExpandNode.depth + 1) * levelPadding - buttonWidth / 2) + ", " + h + ")");

              } else {
                recentExpandNode = recentExpandNodeLeft;
                group = leftGroup;

                refreshForeignObject();
                //foreignObject.attr("transform", "translate("+ (w - ((recentExpandNode.depth + 1) * levelPadding) - buttonHeight / 2) + ', ' + (-buttonHeight * 2.5) + ')');
                upButton.attr("transform", "translate("+ (w - ((recentExpandNode.depth + 1) * levelPadding) - buttonHeight / 2) + ', ' + (-buttonHeight) + ')');
                downButton.attr("transform", "translate("+ (w - ((recentExpandNode.depth + 1) * levelPadding) - buttonHeight / 2) + ", " + h + ")");

              }

              groupIndex = group.groupIndex;

              if (groupIndex === 0) {
                upButton.style("display", "none");
              } else {
                upButton.style("display", "block");
              }

              if ((groupIndex + 1) * groupNodeNumber >= recentExpandNode._children.length) {
                downButton.style("display", "none");
              } else {
                downButton.style("display", "block");
              }

            };
          };
          var controlGroup = new ControlGroup(orient);
          return controlGroup;
        };

        // layout
        var tree = d3.layout.tree()
            .size([h, w]);
        var projection = function (d) {
          return [d.y, d.x];
        };
        var projection2 = function (d) {
          return [w - d.y, d.x];
        };

        //zoom related
        var globalTrans = 0;
        var zoomTranslate = 0;
        var zoomScale = 1;
        var zoom = function () {
          zoomTranslate = d3.event.translate[0];
          zoomScale = d3.event.scale;
          svg.attr("transform", "translate(" + (zoomTranslate + globalTrans * zoomScale) + "," + 0 + ")scale(" + zoomScale + ",1)");
        };

        // global data
        var recentExpandNodeRight;
        var recentExpandNodeLeft;

        var childrenTree = {},
            parentTree = {};
        var initJson = function (json, orient) {
          json.sort(function (a, b) {
            //return b.directDestTableNum - a.directDestTableNum;
            if (b.startLevel > a.startLevel) {
              return 1;
            } else if (b.startLevel < a.startLevel) {
              return -1;
            } else {
              return b.directDestTableNum - a.directDestTableNum;
            }
          });
          json.forEach(function (d, i) {
            d.name = d.guid;
            d.size = 1;
            d.orient = orient;
            d.groupIndex = i;
            d.leaf = (orient === 'right' && d.directDestTableNum < 1) || (orient === 'left' && d.directSrcTableNum < 1);
          });
        };
        var initTree = function (tree, json, orient) {
          var key;
          var root = {};
          for (key in selfJson) {
            root[key] = selfJson[key];
          }
          root.name = guid;
          root.children = json;
          root.orient = orient;
          root.x0 = h / 2;
          root.y0 = 0;
          initJson(json, orient);

          function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
            }
          }

          root.children.forEach(collapse);

          root._children = root.children;
          root.children = root.children.slice(0, groupNodeNumber);

          // copy
          for (key in root) {
            tree[key] = root[key];
          }

          if (orient === 'left') {
            recentExpandNodeLeft = tree;
          } else {
            recentExpandNodeRight = tree;
          }
        };

        function getR(d) {
          var minR = 5;
          var maxR = 10;
          var max = 20;

          if (!d.parent) {
            d.radius = maxR;
            return maxR;
          }
          var t = Math.min(d.directDestTableNum / max, 1) * (maxR - minR) + minR;
          d.radius = t;
          return t;
        }

        function update(source) {
          var nodes;
          var orient = source.orient;
          if (orient === 'right') {
            // Compute the new tree layout.
            nodes = tree.nodes(childrenTree).reverse();
            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * levelPadding; });
            rightControlGroup.refreshPosition();
            drawSingle(source, nodes, vis, projection);
          } else {
            // Compute the new tree layout.
            nodes = tree.nodes(parentTree).reverse();
            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * levelPadding; });
            drawSingle(source, nodes, vis2, projection2);
            leftControlGroup.refreshPosition();
          }
        }

        function drawSingle (source, nodes, vis, projection) {
          var diagonal = d3.svg.diagonal()
            .projection(projection);
          var orient = source.orient;
          var recentExpandNode = orient === 'left' ? recentExpandNodeLeft : recentExpandNodeRight;
          // Update the nodes…
          var node = vis.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

          // Enter any new nodes at the parent's previous position.
          var nodeEnter = node.enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

          var circle = nodeEnter.append("circle")
              .attr("class", "circle")
              .attr("r", 1e-6)
              //.style("fill", function(d) {return !d.leaf ? "lightsteelblue" : "#fff";})
              //.style("cursor", function(d) { return !d.leaf ? "pointer" : "auto"; })
              .on("click", click);

          var word = nodeEnter.append("text")
              .attr("x", function(d) {
                if (!d.parent) {
                  return 0;
                }
                if (source.orient === 'right') {
                  return 12;
                } else {
                  return -12;
                }
              })
              .attr("dy", function (d) {
                return !d.parent ? "2em" : ".35em";
              })
              .attr("cursor", "auto")
              .attr("text-anchor", function(d) {
                if (!d.parent) {
                  return "middle";
                }
                if (source.orient === 'right') {
                  return "start";
                } else {
                  return "end";
                }
              })
              .text(function(d) {
                if (!d.parent && orient === "right") {
                  return "";
                } else {
                  var name = d.name.split('.')[2];
                  if (name.length > 40) {
                    return name.slice(0, 38) + "...";
                  } else {
                    return name;
                  }
                }
              });

          word.on("mouseover", function () {
            d3.select(this)
              .style("font-size", "15px")
              .style("font-weight", "bold");
          });
          word.on("mouseout", function () {
            d3.select(this)
              .style("font-size", "12px")
              .style("font-weight", "normal");
          });

          circle.on("mouseover", function () {
            var d = this.__data__;
            d3.select(this)
              .attr("r", d.radius + 4);
            var orient = d.orient;

            $.ajax({
              url: linkHover + "?ownerId=" + d.owner
            }).done(function (owner) {
              floatTag.html(getFloatContent(d));
              floatTag.creator.refresh();
              floatTag.data('guid', d.name);
            });

          });

          circle.on("mouseleave", function () {
            var d = this.__data__;
            d3.select(this)
              .attr("r", d.radius);
            floatTag.creator.fade();
          });

          // Transition nodes to their new position.
          var nodeUpdate = node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + projection(d) + ")"; });

          nodeUpdate.select("circle")
              .attr("r", getR)
              .style("fill", function(d) {
                if (!d.parent) {
                  return "#afa";
                }
                if (d.id === recentExpandNodeRight.id || d.id === recentExpandNodeLeft.id) {
                  return "pink";
                }
                return !d.leaf ? "lightsteelblue" : "#fff";
              }).style("cursor", function(d) {
                if (!d.parent) {
                  return "auto";
                }
                return !d.leaf ? "pointer" : "auto";
              });

          nodeUpdate.select("text")
              .style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          var nodeExit = node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + projection(d) + ")"; })
              .remove();

          nodeExit.select("circle")
              .attr("r", 1e-6);

          nodeExit.select("text")
              .style("fill-opacity", 1e-6);

          // Update the links…
          var link = vis.selectAll("path.link")
              .data(tree.links(nodes), function(d) { return d.target.id; });

          // Enter any new links at the parent's previous position.
          link.enter().insert("path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
              })
            .transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
              })
              .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
            var newLoc = projection(d);
            d.x0 = newLoc[0];
            d.y0 = newLoc[1];
          });

          /*
          vis.selectAll("text.info")
              .style("display", function(d) { return d.children ? "block" : "none"; });
          */
        }

        // click node, golbal trans, get and set new children data.
        function click(d) {

          if ((d.orient ===  'right' && d.directDestTableNum === 0) ||
              (d.orient ===  'left' && d.directSrcTableNum === 0) ||
              !d.parent) {
            return;
          }

          var refresh = function () {
              var recentExpandNode;
              var node;
              var orient = d.orient;
              var groupIndex;
              if (d.orient === 'right') {
                recentExpandNode = recentExpandNodeRight;
              } else {
                recentExpandNode = recentExpandNodeLeft;
              }
              if (recentExpandNode.id !== d.id) {
                recentExpandNode.children = null;
                node = recentExpandNode;
                while (node.parent) {
                  node.parent.children = null;
                  node = node.parent;
                }
                node = d;
                node.children = node._children.slice(0, 10);
                while (node.parent) {
                  node.parent.children = [node];
                  node = node.parent;
                }
                groupIndex = 0;

                //global trans
                if (d.orient === 'right') {
                  if (recentExpandNodeRight.depth < d.depth) {
                    globalTrans -= levelPadding;
                  }
                  recentExpandNodeRight = d;
                } else {
                  if (recentExpandNodeLeft.depth < d.depth) {
                    globalTrans += levelPadding;
                  }
                  recentExpandNodeLeft = d;
                }
                svg.transition()
                  .duration(300)
                  .attr("transform", "translate(" + (zoomTranslate + globalTrans * zoomScale) + "," + 0 + ")scale(" + zoomScale + ",1)");
              } else {
                d.children = null;
                if (d.orient === 'right') {
                  recentExpandNodeRight = d.parent;
                } else {
                  recentExpandNodeLeft = d.parent;
                }
                groupIndex = Math.floor(d.groupIndex / groupNodeNumber);
                d.parent.children = d.parent._children.slice(groupIndex * groupNodeNumber, (groupIndex + 1) * groupNodeNumber);
              }

              if (orient === 'right') {
                rightGroup.groupIndex = groupIndex;
              } else {
                leftGroup.groupIndex = groupIndex;
              }
              floatTag.css("visibility", "hidden");
              update(d);
          };

          setTimeout(function () {
            if (!d._children) {
              // get new data
              var orient = d.orient;
              var link = (orient === 'right' ? linkChildren : linkParent) + d.guid;
              $.ajax({url: link}).done(function (data) {
                initJson(data, orient);
                d._children = data;
                refresh();
              });
            } else {
              // data ready
              refresh();
            }
          }, 300); // not conflict with dbclick
        }

        //init;
        cb.call(this);

        var floatTag = FloatTag()(container);
        floatTag.creator.mouseToFloatTag({x: 20, y: 5});
        $(container).on("mouseleave", function () {
          floatTag.css('visibility', 'hidden');
        });

        floatTag.on("mouseleave", function () {
          //floatTag.css('visibility', 'hidden');
          //floatTag.creator.changeLoc();
          floatTag.creator.hide();
        });

        floatTag.on("mouseover", function () {
          //floatTag.css('visibility', 'hidden');
          floatTag.creator.show();
        });



        var svg = d3.select("#" + containerId).append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .attr("cursor", "move")
          .append("g")
            .call(d3.behavior.zoom().scaleExtent([0.1, 1]).on("zoom", zoom))
          .append("g");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("fill", "#fff")
            .attr("x", (w + m[1] + m[3]) * (-100)) // 左右各100屏幕宽，确保缩放时有元素能捕获到zoom事件
            .attr("width", (w + m[1] + m[3]) * 200)
            .attr("height", h + m[0] + m[2]);
        var vis = svg
          .append("g")
            .attr("transform", "translate(" + (m[3] + w / 2) + "," + m[0] + ")");
        var vis2 = svg
          .append("g")
            .attr("transform", "translate(" + (m[1] + m[3] - m[1] - w / 2) + "," + m[0] + ")");

        var leftControlGroup = createControlGroup('left');
        var rightControlGroup = createControlGroup('right');

        childrenJson = childrenJson || [];
        parentJson = parentJson || [];

        initTree(childrenTree, childrenJson, 'right');
        initTree(parentTree, parentJson, 'left');
        update(childrenTree);
        update(parentTree);

        // double click
        container[0].addEventListener('dblclick', function(e) {
          // do nothing if the target does not have the class drawnLine
          var d = e.target.__data__;
          if (typeof e.target.className === 'undefined' || typeof e.target.className.baseVal === 'undefined') {
            return ;
          }
          if (e.target.className.baseVal.indexOf("circle") > -1) {
            window.open('/metaTableRelation?guid=' + d.name, '_self');
          }
        });

      }); // end of ajax
    }); // end of ajax
  }); // end of ajax
};