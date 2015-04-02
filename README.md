# doubletree
double tree data visualization based on d3.js

requires:
===

d3.js, jquery.js, bootstrap.js

features:
===

1. multi children or parent nodes

2. zoom and drag to show multi level

3. search nodes in children or parent nodes

![image1](https://raw.githubusercontent.com/jdk137/doubletree/master/image1.png)


![image2](https://raw.githubusercontent.com/jdk137/doubletree/master/image2.png)


Usage:
===

```js
  var doubleTree = new DoubleTree({
    containerId: "doubletreeContainer",
    linkChildren: 'json/queryChildTables.json?guid=',
    linkParent: 'json/queryParentTables.json?guid=',
    linkSelf: 'json/table.json?guid=',
    linkHover: 'json/q.json?guid=',
    guid: 'odps.ju_daily.brandsort_score_pay_week_matrix',
    callback: function () {
      console.log('ok');
    }
  });
```
