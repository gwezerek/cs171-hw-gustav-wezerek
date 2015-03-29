# Answers for Questions

### Q3a
**Question:** Name the HTML element (type and class) that represents the interactive area.

-
It's an SVG rect element with a class of .background.

### Q3b
**Question:** Name the HTML element (type and class) that is used for representing the brushed selection.

-
It's and SVG rect element with a class of .extent.

### Q3c
**Question:** What do the other DOM elements of brush represent?

-
There's a wrapping g element with a class of .brush that contains all the elements. There are two more g elements that contain rects of their own. These rects are actionable target areas for the horizontal resize affordances of the extent area.

