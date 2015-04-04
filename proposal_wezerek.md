# Project Proposal, Gus Wezerek
Note: My original project title was "Videogame Sales," but that data turned out to be gated after the first 30 rows for each week, which meant I had to pivot at the last minute. As for TFs, I'd love to have the advice of someone who has a lot of experience with working with maps and geo data. I've done a quick visual inspection of the shapefile that I'm using as the basis for the project, but I suspect I might need to clean it up.

#### Background and Motivation. Discuss your motivations and reasons for choosing this project, especially any background or research interests that may have influenced your decision.

A few years back I was looking getting into gardening. I didn’t know anything about what plants would grow well in Boston. One of the first resources I found was the USDA Plant Hardiness Zone map. Even then there were a number of maps that matched up zip codes with the regions, but the next step--finding which plants worked well in those regions--was left to the user. After searching around I realized there might be a niche for an app that combined those two tasks, but I put it on the backburner.

#### Project Objectives. Provide the primary questions you are trying to answer with your visualization. What would you like to learn and accomplish? List the benefits.

Turns out gardeners use more than just the Plant Hardiness Zone map to determine when and what to plant. The American Horticultural Society has a heat tolerance map that’s been adopted by some seed manufacturers and Sunset magazine has a “Sunset Zone” map that is well regarded for taking into account the microclimates of the American West. While I might not include views that show overlays for either of those latter two maps, as I couldn’t find any shapefiles, I could at the very least incorporate heat, frost and monthly temperature charts into a concerted garden planning view.

#### Data. From where and how are you collecting your data? If appropriate, provide a link to your data sources.

The shapefile for the 2012 Hardiness Zone map exists on GitHub (https://github.com/wboykinm/ophz/tree/master/ophz-c) as a branch of a different format of the same map. I don’t think many people know about it, and I haven’t seen it used in any visualizations or apps. As for the plant data, I’ve identified a number of sites that have hardiness zone data for plants. Each includes different additional dimensions, ranging from descriptions and photos to buy links (for the Monrovia database, for instance). All of them would require scraping, and I need to spend some time determining which dataset or combination of datasets best captures the planning data I’d want for home gardeners (and has the appropriate terms of use). I’m not too worried about temperature data if I want to include that information, as I know there are a number of datasets and APIs that offer monthly averages by location. Here are the plant datasets I mentioned:

* http://www.garden.org//plantfinder/
* http://www.learn2grow.com/plants
* http://www.almanac.com/plants
* http://hort.uconn.edu/list.php
* http://davesgarden.com/guides/pf
* http://www.monrovia.com/plant-catalog/
* http://permacultureplantdata.com (gated behind a free login)
* http://allthingsplants.com/plants/
* http://practicalplants.org/wiki/Practical_Plants

#### Data Processing. Do you expect to do substantial data cleanup? What quantities do you plan to derive from your data? How will data processing be implemented?

I expect to gather, at minimum, the following dimensions from my data:
* Plant name (common or scientific, not sure yet)
* USDA Hardiness Zone

Others that I would ideally like to gather:
* Heat zone
* Water requirements
* Sun requirements
* Shade requirements
* Soil pH
* Soil texture (i.e., loamy)
* Size (height)
* Size (coverage)
* Taxonomy (genus, family)
* Sunset zone
* Purchase link
* Photo
* Whether it’s edible
* Common classification (vegetable, herb, ornamental)

I have experience cleaning data in Python, so I’ll probably use that for most of my munging. I’ll either use Beautiful Soup or the Kimono tool introduced in section for my scraping. If I need to combine datasets, there will be substantial refining/reconciliation, so I’ll try to avoid that scenario.

#### Visualization. How will you display your data? Provide some general ideas that you have for the visualization design. Include sketches of your design.

I know U.S. maps are probably done to death in this class, but I haven’t ever made one using anything other than D3 so I’m looking forwarding to centering the app around a leaflet/mapbox map view. The Hardiness Zone map is already a visualization in and of itself, but I haven’t seen any really clean interactive implementations. I’d like to allow the user to toggle the zone overlay. Detail graphs of the selected zip code would probably include monthly temperature averages over time, first and last frost dates and potentially average days over 86 degrees (which is how the heat zones are calculated). I can think of other graphs that would be possible with the data, but they’d distract from my main goal of showing users plants that would work in their garden and showing them where those recommendations came from.

![Sketches](proposal_assets/sketches.jpg)

#### Must-Have Features. These are features without which you would consider your project to be a failure.

The minimum viable product here is a map that accepts a user’s zip code, tells them what zone they’re in and suggests plants that survive in those zones.

#### Optional Features. Those features which you consider would be nice to have, but not critical.

Optional features include :
* factoring heat data or microclimates into the recommendations
* providing frost dates for the zip code
* providing average monthly or weekly temperature ranges for each location
* using geolocation to ascertain the user’s location
* including a plant visualization feature (sepal length heh heh heh) where the user can compare dimensions independent of location/hardiness * zone
* purchase links for the plants
* photo previews of the plants
* brief onboarding explaining the strengths and weaknesses of the USDA Hardiness Zone map

#### Project Schedule. Make sure that you plan your work so that you can avoid a big rush right before the final project deadline, and delegate different modules and responsibilities among your team members. Write this in terms of weekly deadlines.

**April 10th**: Have all data collected and cleaned, verify that the shapefile’s geojson or topojson conversion can be overlayed on a leaflet map.

**April 17th**: Implement zip code correspondence with hardiness zones

**April 24th**: Have plant recommendations hooked up to hardiness zone output, implement weather detail graphs for zip codes

**May 1**: Polish the design, refactor code, implement sharing features and export options for the recommendations
