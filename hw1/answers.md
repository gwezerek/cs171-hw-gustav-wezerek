# HW1 Answers

## 1.1 Looking at the page containing the table, what are the differences between the DOM as shown by the DOM inspector and the HTML source code? Why would you use the DOM inspector? When is the HTML source useful?
Chrome's document inspector adds full-featured syntactical highlighting to the DOM, collapse/expand capabilities for nested elements and visual highlighting of the selected element, among many other things. It reflects the rendered state of the DOM, including any dynamically generated elements (in this case, the rendered table). So if you want to inspect what the user will see, use the inspector. The source code, on the other hand, shows the markup pre-render--if you want to know why and event handler isn't bdining, for instance, checking to see if it's there on page load via the plain markup can be a good first debugging step.

## 1.2 Below we have partially reproduced the first lines from the table's dataset. What piece of software generates this table? Where are the original data stored?
The table is generated via D3 (or JavaScript, or the browser's rendering engine if you're looking for a macro answer). The data comes from the countries_2012.json file.

## 2.1 Would you filter other columns from the table the same way? E.g. would you use checkboxes or any other HTML widget?
Checkbox filtering makes sense for attributes that are limited in number. Generally, that means that they're categorical. Years would be another possible candidate for checkboxes if we had a range, it weren't too large (say, 2008-2012), and we didn't want to implement brushing on a slider. Radio buttons would be inappropriate here, as they generally indicate on/offs or Booleans and exist independently of one another (or are mutually exclusive within a set).

## 3.1 Could you aggregate the table using other columns? If you think yes, explain which ones and how you would group values. Which HTML widgets would be appropriate?
You could, but the bins would have to be meaningful. For instance, you could aggregate by year if you wanted to compare global indicators such as population, gdp or life expectancy over time.

Sidenote: "Widgets" seems like a weird word to use for these questions. Might I suggest "inputs" or "form elements"?

## 4.1 What does the new attribute years hold?
Years holds each country's GDP, life expectancy, population and top 10 trade partners with their respective value of exports for each year from 1995 through 2012.

## 5.1 What are the pros and cons of using HTML vs. SVG? Give some examples in the context of creating visualizations.
### HTML pros:
- Native text-wrapping
- More performant than SVG when dealing with thousands of nodes
- More styleable properties and better CSS animation support
- Supported by legacy browsers
- Simpler interaction with JS when it comes to checking for classes, custom data attributes, etc.

### SVG pros:
- Support for all sorts of shapes and paths
- If exported, editable in programs such as Illustrator or Inkscape
- Fun filters like blur
- Lingua franca of viz libraries such as D3

## 7.1 Give an example of a situation where visualization is appropriate, following the arguments discussed in lecture and in the textbook (the example cannot be the same as mentioned in either lecture or textbook).
Visualization is great for communication and exploration, depending on whether your input is a question or an answer (roughly). Say you wanted to compare the average high and low temperatures in Boston for each month. A time-series chart could quickly show the overall curve and range comparisons by month that would be very difficult to capture in words.

## 7.2 Which limitations of static charts can you solve using interactivity?
You can allow users to drill down into higher resolutions of a dataset, or dynamically combine or filter attributes. With interactivity you can add a narrative layer over time to your charts, prevent human errors that might result from hand-drawn charts and be more efficient when templating small multiples or other reusable chart components.

## 7.3 What are the limitations of visualization?
Visualization might be overkill or inefficient when you need to answer a question with a single, simple answer that can be better expressed in words. Additionally, data visualization might not be the best solution when the user has a very limited amount of time to make a decision, such as in high-frequency stock trading.

## 7.4 Why are data semantics important for data?
You need metadata to give meaning to the values. An array of ['Basil', 7, 'S', 'Pear'] means nothing without semantics. You might be able to guess that 'S' refers to size, but even then: the size of what?

## 7.5 Which relationships are defined for two attributes of (a) quantitative, (b) categorical, or (c) ordinal scale?
a. Equality, comparative, arithmetic (===, !==, <, >, <=, =>, +, -, /, *)
b. Equality (===, !==)
c. Equality, comparative (===, !==, <, >, <=, =>)

## 7.6 Which visual variables are associative (i.e., allow grouping)?
Position, size, value, color, orientation, grain, texture, motion, shape (kind of), pattern (kind of)

## 7.7 Which visual variables are quantitative (i.e., allow to judge a quantitative difference between two data points)?
Position, size (kind of), motion (kind of, but perception is so subjective that some would argue no)
