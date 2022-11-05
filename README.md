# DOM-tree-visualizer

This is a script you can put into Tampermonkey or Greasemonkey to get a tree view of a DOM tree. It uses D3 (version 3.4) to generate the tree.

![DOM Tree Visualizer](https://github.com/chrisjwaddell/DOM-tree-visualizer/blob/main/dom-tree.jpg)


It inserts a popup block and inserts the generated DOM tree visualization. You can close this popup to go back to the website.
![DOM Tree Visualizer Popup](https://github.com/chrisjwaddell/DOM-tree-visualizer/blob/main/dom-tree-2.jpg)

You can close branches and expand branches by clicking on the node.

## How to use
Put dom-tree-visualizer.js into Tampermonkey or Greasemonkey. In the console type in:
```
DOMTreeVisualize("footer")
```
To show the DOM tree branch of *footer*.
