///////////////////////////////////////////////////////////////////////////
/////// State of the State - Onderwijs Main Code - Scatter plots //////////
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
///////////////////// Initiate global variables ///////////////////////////
///////////////////////////////////////////////////////////////////////////

var scatterMargin = {left: 50, top: 50, right: 20, bottom: 50},
	scatterWidth = Math.min($(".dataresource.scatterWO").width(),600) - scatterMargin.left - scatterMargin.right,
	scatterHeight = scatterWidth*2/3,
	scatterLegendMargin = {left: 0, top: 30, right: 0, bottom: 10},
	scatterLegendWidth = $(".dataresource.scatterLegend").width() - scatterLegendMargin.left - scatterLegendMargin.right,
	legendSectorHeight = 20,
	legendTitleSection = 40,
	scatterLegendHeight = 310;

//Create and SVG for each element
var svgScatterWO = d3.select(".dataresource.scatterWO").append("svg")
			.attr("width", (scatterWidth + scatterMargin.left + scatterMargin.right))
			.attr("height", (scatterHeight + scatterMargin.top + scatterMargin.bottom));

var svgScatterLegend = d3.select(".dataresource.scatterLegend").append("svg")
			.attr("width", (scatterLegendWidth + scatterLegendMargin.left + scatterLegendMargin.right))
			.attr("height", (scatterLegendHeight + scatterLegendMargin.top + scatterLegendMargin.bottom));			

//Create and g element for each SVG			
var scatterWO = svgScatterWO.append("g").attr("class", "chartWO")
		.attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
		
var scatterLegend = svgScatterLegend.append("g").attr("class", "legendWrapper")
				.attr("transform", "translate(" + (scatterLegendWidth/2 + scatterLegendMargin.left) + "," + (scatterLegendMargin.top) +")");

///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Draw plots ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var rScale = d3.scale.sqrt()
				.range([0, (mobileScreen ? 10 : 15)])
				.domain([0, 100]);

var sectorColor = d3.scale.ordinal()
					.range(["#EFB605", "#E47D06", "#DB0131", "#AF0158", "#7F378D", "#3465A8", "#0AA174", "#7EB852"])
					.domain(["Economie", "Gedrag en maatschappij", "Gezondheidszorg", "Natuur", "Onderwijs", "Recht", "Taal en cultuur", "Techniek"]);
	
	
// Create WO scatter plot
drawScatterWO(data = WOScatter, wrapper = scatterWO, width = scatterWidth, height = scatterHeight, 
			margin = scatterMargin, chartTitle="WO - Rijksuniversiteit Groningen", circleClass = "WO");				

//////////////////////////////////////////////////////
///////////////// Initialize Legend //////////////////
//////////////////////////////////////////////////////

//Draw the legend
createScatterLegend();

///////////////////////////////////////////////////////////////////////////
/////////////////// Scatterplot specific functions ////////////////////////
///////////////////////////////////////////////////////////////////////////

function createScatterLegend() {
	
	var legendRectSize = 15, //dimensions of the colored square
		legendMaxWidth = 125; //maximum size that the longest element will be - to center content
					
	//Create container for all rectangles and text 
	var sectorLegendWrapper = scatterLegend.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + 0 + "," + 0 +")");
	
	//Append title to Legend
	sectorLegendWrapper.append('text')                                     
		  .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
		  .attr("class", "legendTitle")
		  .style("text-anchor", "middle")	
		  .style("font-size", 13)
		  .text("Studie sector"); 
		  
	sectorLegendWrapper.append('text')                                     
		  .attr('transform', 'translate(' + 0 + ',' + 15 + ')')
		  .attr("class", "legendText")
		  .style("text-anchor", "middle")	
		  .style("font-size", 10)
		  .attr("x",0)
		  .attr("y", 0)
		  .attr("dy", "0.35em")
		  .text("Selecteer alle opleidingen binnen 1 sector door op een sector in de legenda te klikken")
		  .call(wrap, legendMaxWidth*1.5); 
		  
	//Create container per rect/text pair  
	var sectorLegend = sectorLegendWrapper.selectAll('.scatterLegendSquare')  	
			  .data(sectorColor.range())                              
			  .enter().append('g')   
			  .attr('class', 'scatterLegendSquare') 
			  .attr('width', scatterLegendWidth)
			  .attr('height', legendSectorHeight)
			  .attr("transform", function(d,i) { return "translate(" + 0 + "," + ((i+1) * legendSectorHeight + legendTitleSection) + ")"; })
			  .style("cursor", "pointer")
			  .on("mouseover", sectorSelect(0.02))
			  .on("mouseout", sectorSelect(0.5))
			  .on("click", sectorClick);
	 
	//Non visible white rectangle behind square and text for better UX
	sectorLegend.append('rect')                                     
		  .attr('width', legendMaxWidth) 
		  .attr('height', legendSectorHeight) 			  
		  .attr('transform', 'translate(' + (-legendMaxWidth/2) + ',' + 0 + ')') 		  
		  .style('fill', "white");
	//Append small squares to Legend
	sectorLegend.append('rect')                                     
		  .attr('width', legendRectSize) 
		  .attr('height', legendRectSize) 			  
		  .attr('transform', 'translate(' + (-legendMaxWidth/2) + ',' + 0 + ')') 		  
		  .style('fill', function(d) {return d;});                                 
	//Append text to Legend
	sectorLegend.append('text')                                     
		  .attr('transform', 'translate(' + (-legendMaxWidth/2 + 20) + ',' + (legendRectSize/2) + ')')
		  .attr("class", "legendText")
		  .style("text-anchor", "start")
		  .attr("dy", ".30em")
		  //.attr("fill", "#949494")
		  .style("font-size", 10)			  
		  .text(function(d,i) { return sectorColor.domain()[i]; });  

	//Create g element for bubble size legend
	var bubbleSizeLegend = scatterLegend.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + 50 + "," + (legendTitleSection + 8*legendSectorHeight + 60) +")");
	//Draw the bubble size legend
	bubbleLegend(bubbleSizeLegend, rScale, legendSizes = [10, 40, 100], legendName = "Aantal respondenten");		

	//Create a wrapper for the circle legend				
	var legendCircle = scatterLegend.append("g").attr("class", "legendWrapper")
					.attr("transform", "translate(" + -50 + "," + (legendTitleSection + 8*legendSectorHeight + 60) +")");
	
	legendCircle.append("text")
		.attr("class","legendTitle")
		.attr("transform", "translate(" + 0 + "," + -25 + ")")
		.attr("x", 0 + "px")
		.attr("y", 0 + "px")
		.attr("dy", "1em")
		.text("Elke cirkel is een opleiding")
		.call(wrap, 90);
	legendCircle.append("circle")
        .attr('r', rScale(100))
        .attr('class',"legendCircle")
        .attr('cx', 0)
        .attr('cy', (50-rScale(100)))
		
};//function createScatterLegend

///////////////////////////////////////////////////////////////////////////
///////////////////// Click functions for legend //////////////////////////
///////////////////////////////////////////////////////////////////////////

//Reset the click event when the user clicks anywhere but the legend
d3.select(".scatterOnderwijs").on("click", resetClick);

//Function to show only the circles for the clicked sector in the legend
function sectorClick(d,i) {
	
	event.stopPropagation();

	//deactivate the mouse over and mouse out events
	d3.selectAll(".scatterLegendSquare")
		.on("mouseover", null)
		.on("mouseout", null);
		
	//Chosen study sector
	var chosen = sectorColor.domain()[i];
		
	/////////////////// WO ///////////////////	
	//Only show the circles of the chosen sector
	scatterWO.selectAll("circle")
		.style("opacity", 0.5)
		.style("visibility", function(d) {
			if (d.Studie_sector != chosen) return "hidden";
			else return "visible";
		});
	
	//Make sure the pop-ups are only shown for the clicked on sector
	scatterWO.selectAll(".voronoi.WO")
		.on("mouseover", function(d,i) {
			if(d.Studie_sector != chosen) return null;
			else return showScatterTooltip.call(this, d, i);
		})
		.on("mouseout",  function(d,i) {
			if(d.Studie_sector != chosen) return null;
			else return removeScatterTooltip.call(this, d, i);
		});
	
}//sectorClick

//Show all the cirkels again when clicked outside legend
function resetClick() {	

	//Activate the mouse over and mouse out events of the legend
	d3.selectAll(".scatterLegendSquare")
		.on("mouseover", sectorSelect(0.02))
		.on("mouseout", sectorSelect(0.5));

	/////////////////// WO ///////////////////	
	//Show all circles
	scatterWO.selectAll("circle")
		.style("opacity", 0.5)
		.style("visibility", "visible");

	//Activate all pop-over events
	scatterWO.selectAll(".voronoi.MBO")
		.on("mouseover", showScatterTooltip)
		.on("mouseout",  function (d,i) { removeScatterTooltip.call(this, d, i); });

}//resetClick

///////////////////////////////////////////////////////////////////////////
/////////////////// Hover functions of the circles ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Hide the tooltip when the mouse moves away
function removeScatterTooltip (d, i) {

	var element = d3.selectAll(".circle.WO."+d.StudieClass);
		
	//Fade out the bubble again
	element.style("opacity", 0.5);
	
	//Hide tooltip
	$('.popover').each(function() {
		$(this).remove();
	}); 
  
	//Fade out guide lines, then remove them
	d3.selectAll(".guide")
		.transition().duration(200)
		.style("opacity",  0)
		.remove()
}//function removeScatterTooltip

//Show the tooltip on the hovered over slice
function showScatterTooltip (d, i) {
		
	var element = d3.selectAll(".circle.WO."+d.StudieClass),
		cont = '.dataresource.scatterWO',
		chartSVG = scatterWO;
	
	//Define and show the tooltip
	$(element).popover({
		placement: 'auto top',
		container: cont,
		trigger: 'manual',
		html : true,
		content: function() { 
			return "<p style='font-size: 11px; text-align: center;'>" + d.Studienaam + "</p>"; }
	});
	$(element).popover('show');

	//Make chosen circle more visible
	element.style("opacity", 1);
	
	//Append lines to bubbles that will be used to show the precise data points
	//vertical line
	chartSVG.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", element.attr("cx"))
			.attr("x2", element.attr("cx"))
			.attr("y1", +element.attr("cy"))
			.attr("y2", (scatterHeight))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(400)
			.style("opacity", 0.5);
	//horizontal line
	chartSVG.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", +element.attr("cx"))
			.attr("x2", 0)
			.attr("y1", element.attr("cy"))
			.attr("y2", element.attr("cy"))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(400)
			.style("opacity", 0.5);
					
}//function showScatterTooltip
	
//Decrease opacity of non selected study sectors when hovering in Legend	
function sectorSelect(opacity) {
	return function(d, i) {
		var chosen = sectorColor.domain()[i];
			
		scatterWO.selectAll("circle")
			.filter(function(d) { return d.Studie_sector != chosen; })
			.transition()
			.style("opacity", opacity);
	  };
}//function sectorSelect

