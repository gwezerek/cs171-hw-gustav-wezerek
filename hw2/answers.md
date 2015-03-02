Question 0.1. What is the meaning of the horizontal and vertical position of the nodes? Give examples of datasets particularly well suited to organize data this way.
The horizontal and vertical position don't encode anything on their own. Rather, the position of the nodes to each other on the 2D plane visualizes the relatedness of the data. You could use a force-directed graph to visualize, say, the co-occurence of characters in _Les Misérables_ or the co-occurence of countries' exports.

Question 0.2. Which other channels (visual variables), beside color, size and position, could have been used? Name five.
You could use:
* Shape
* Luminance
* Saturation
* Angle
* Motion

Question 0.3. Are all the previously mentioned visual variables independent (e.g. if you change one, will it impact others?)? Give examples of graphical properties that are dependent (if any) and independent (if any) from each others.
Color is independent, though there could be perceptual differences based on proximity to other colors. While hue, saturation and depth are individual channels, changing one can drastically change the perception of the others (i.e., a completely desaturated set of nodes that was hued categorically). If the marks are non-overlapping, size and position could be dependent, as larger marks would displace the other nodes and distort their position. Most channel pairs are independent. Changing a mark's length won't alter its saturation, for instance.

Question 1.1. Discuss the pros and cons of the two types of rankings (either by relative or absolute position between nodes).
Ordinal rankings can be useful when the user is comparing marks that are encoded by an unfamiliar, transformed dimension (say, a quality of life index) where the actual value doesn't have any context outside of itself. It's also useful when the ranking has some sort of importance, such as in team rankings for playoff spots. Also, if a few outliers would distort the data and you don't have to worry about the audience not knowing about the magnitude of those outliers, relative rankings can be a quick way to get everything on the same plot. Absolute positioning makes more sense when emphasizing the untransformed magnitude of the values is paramount (say, showing just how many more people China has than most other countries).

Question 1.2. Which data type (quantitative, ordinal, ..) is best displayed with scatterplots? Which one is not? Give examples.

Question 2.1. What are the pros and cons of using a D3 layout? For example, why would we use the D3 pie layout when we could use a simple circle for layouting?

Question 3.1. Which other strategies can you think of to reduce the visual complexity? One example is edge bundling which we introduce in the following section. Enumerate up to three other strategies.
