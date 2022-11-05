// ==UserScript==
// @name         DOM Tree Visualizer
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Generate a visual tree of the DOM tree of the current webpage using D3
// @author       Chris Waddell
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

/* To use it, type DOMTreeVisualize(parent) into the console.
 * parent is the element of the branch you want to view
 */

(function () {
    'use strict';
    //console.log("DOMTreeVisualize - Tampermonkey")

    // insert d3 library
    // create popup with overlay and close button which is where '
    // the tree is inserted'
    async function initialize() {


        function importScript(url) {
            return new Promise((resolve, reject) => {
                let s = document.createElement("script");
                s.onload = () => {
                    resolve();
                };
                s.onerror = (e) => {
                    reject(e);
                };
                s.src = url;
                document.head.append(s);
            });
        }

        //let d3scriptload = importScript("http://d3js.org/d3.v3.js")
        //let d3scriptload = importScript("https://cdnjs.cloudflare.com/ajax/libs/d3/7.6.1/d3.min.js")
        let d3scriptload = importScript("https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.0/d3.min.js")
        await d3scriptload

        const elBody = document.querySelector("body")

        const elDivOuter = document.createElement("div")
        elDivOuter.classList.add("popup")
        elDivOuter.style = "overflow: auto;position: absolute;width: 100vw;height: 100vh;left: 0;top: 0;z-index: 100000;background-color: #f5f5f5;visibility: hidden;"

        const elDivOverlay = document.createElement("div")
        elDivOverlay.style = "width: auto;height: 100%;"
        elDivOverlay.classList.add("popup__content")
        elDivOuter.appendChild(elDivOverlay)


        const elDivClose = document.createElement("div")
        elDivClose.style =
            "position: absolute;height: 30px;width: 30px;solid: 30px;top: 30px;right: 30px;border-radius: 50%;background-color: #cccccc;margin-left: 100px;"

        const elSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        elSVG.setAttribute("viewBox", "0 0 24 24")
        elSVG.setAttribute("width", "30")
        elSVG.setAttribute("height", "30")

        const elSVGPath = document.createElementNS("http://www.w3.org/2000/svg", "path")

        elSVGPath.setAttribute("d",
            "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        )
        elSVG.append(elSVGPath)


        elDivClose.append(elSVG)
        elDivOverlay.append(elDivClose)

        elDivOuter.append(elDivOverlay)

        elBody.append(elDivOuter)


        elDivClose.addEventListener("click", function () {
            document.querySelector(".popup").style.visibility = "hidden"

            const tree = document.querySelector(".popup__content > svg")
            if (tree) tree.remove()
        })
    }

    initialize()

    async function DOMTreeVisualize(parent = "html") {
        let baseElements = ["HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "TITLE", "META"];


        function loadTree() {
            console.log("loadTree")

            const elParent = document.querySelector(parent)

            if (!elParent) {
                console.log("No element found")
                return
            }

            document.querySelector(".popup").style.visibility = "visible"

            let data = nodeAttributes(elParent)


            // ************** Generate the tree diagram *****************
            var margin = {
                    top: 20,
                    right: 120,
                    bottom: 20,
                    left: 120
                },
                width = 2000,
                height = 2000

            var i = 0,
                duration = 750,
                root;

            var tree = d3.layout.tree()
                .size([height, width]);

            var diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

            var svg = d3.select(".popup__content").append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            root = data;
            root.x0 = height / 2;
            root.y0 = 0;
            update(root);


            d3.select(self.frameElement).style("height", "500px");



            function update(source) {

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    d.y = d.depth * 80;
                });

                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++i);
                    })

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function (d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .style("cursor", "pointer")
                    .on("click", click);

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

                nodeEnter.append("text")
                    .attr("x", function (d) {
                        return d.children || d._children ? 20 : 13;
                    })
                    .attr("dy", function (d) {
                        return d.children || d._children ? "-.8em" : ".35em";
                    })
                    .attr("text-anchor", function (d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .text(function (d) {
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6)
                    .style("font", "10px sans-serif");

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", 6)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";

                    })
                    .style("fill", function (d) {
                        if (baseElements.includes(d.type))
                            return "#4444ff";
                        if (d.type === "elem") return "green";
                    });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = svg.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target.id;
                    });


                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {
                            x: source.x0,
                            y: source.y0
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .style("stroke-width", "1.5px")
                    .style("stroke", "#ccc")
                    .style("fill", "none");


                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = {
                            x: source.x,
                            y: source.y
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }


            function nodeChildren(node) {
                let result = []

                let children = node.children
                result = Array.prototype.map.call(children, nodeAttributes)

                return result
            }

            function nodeAttributes(node) {
                return {
                    type: node.nodeName,
                    name: node.nodeName + " " + ((node.id) ? "#" + node.id + node.className : node
                        .className),
                    children: nodeChildren(node)
                }
            }
        }

        loadTree()
    }

    //return { DOMTreeVisualize }
    window.DOMTreeVisualize = DOMTreeVisualize

})();
