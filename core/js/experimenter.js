var templates = {};
var catlistnames = ["catA","catB","cat1","cat2"];
var catfullnames = ["Category A","Category B","Category 1","Category 2"];

function initExperimenter()
{	
	// Populate template selector with created templates
	$.getJSON("templates/active.txt",showTemplates);
	
	// Loads the input file into the function "loadActiveStats"
	$.getJSON("templates/active.txt",loadActiveStats);
	
	$(function() { $( "input[type=button]" ).button();});
	$("#alert-window").hide();
}

function showTemplates(input)
{
	$('.user-template').remove();
	for (var template in input.available)
	{
		if(input.available[template] != "Empty")
		{
			$(".active-selector").append("<div id='" + input.available[template] + 
				"' class='template-item user-template template-button'><span class=\"delete-item ui-icon ui-icon-close\" onclick='verifyDelete(\"" + 
				input.available[template] + "\")'></span><span class='template-item-label'>" + input.available[template] + "</span></div>");
		}		
			
		$.getJSON("templates/"+input.available[template]+"/input.txt", function(data){ templates[data["name"]] = data; });
	}
	$(".template-item").click(selectTemplate);
}


function verifyDelete(templateId) 
{
	if($(".exp-header-active").html() == templateId)
	{
		$( "#alert-window" ).html(templateId+" is currently active.  Please make another template active before deleting this template.");
	    $( "#alert-window" ).dialog({
			title: "<h3>Template Currently Active</h3>",
	        modal: true,
	        buttons: {
	            Ok: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });
	}
	else
	{
		$( "#alert-window" ).html("<div style='color:red'> Are you sure you want to delete template '"+templateId+"'?  This will delete all associated files, including existing data!!</div>");
	    $( "#alert-window" ).dialog({
			title: "<h3>Confirm Delete</h3>",
	        modal: true,
	        buttons: {
	            Delete: function() {
					$.post("core/fileManager.php", {"op":"deleteTemplate", "template":templateId}, function(data) {
						if (data.slice(0,5) == "Error")
						{
							alert(data);
						}
						else
						{
							$("#exp-content").empty();
							$.getJSON("templates/active.txt",showTemplates);
						}
					});
	                $( this ).dialog( "close" );
	            },
	            Cancel: function() {
	                $( this ).dialog( "close" );
	            }
	        }
	    });
	}
}

function selectTemplate()
{
	// change selected template
	$(".template-selected").removeClass("template-selected");
	$(this).addClass("template-selected");
	
	// don't enable stats if creating new
	if($(this).attr("id") != "create-new")
	{
		$("#set-active").button("option","disabled", false);
	}
	
	// Put form html into exp-content frame
	$.get("core/templateForm.html", function(data) { 
		
		if($(".template-selected").attr("id") == "create-new")
		{
			var templateId = "Empty";
		}
		else
		{
			var templateId = $(".template-selected").attr("id");
		}
		$('#exp-content').html(data); 
		$("#template-name").val(templateId);
		$( "#category-selector" ).tabs();
		
		// Enable buttons to select between 2-cat and 1-cat IAT
		$( "#IAT-type" ).buttonset();
		// set initial value from template
		if(templates[templateId].IATtype == "two")
		{
			$("#IAT-standard").attr("checked",true);
			$("#IAT-type").buttonset('refresh');
		}
		else
		{
			$("#IAT-single").attr("checked",true);
			$("#IAT-type").buttonset('refresh');
		}
		// Change on click
		$( "#IAT-type :radio" ).click(function(e) {
			$( "#IAT-type :radio" ).attr("checked",false);
			$(this).attr("checked",true);
		});
		// Hide IAT type until IAT is ready for it
		$( "#IAT-type").hide();
		
		// Enable buttons for showing results at end or not
		$( "#show-results" ).buttonset();
		if(templates[templateId].showResult == "show")
		{
			$("#show").attr("checked",true);
			$("#show-results").buttonset('refresh');
		}
		else
		{
			$("#noshow").attr("checked",true);
			$("#show-results").buttonset('refresh');
		}
		// Change on click
		$( "#show-results :radio" ).click(function(e) {
			$( "#show-results :radio" ).attr("checked",false);
			$(this).attr("checked",true);
		});
		
		for(var j=1; j<5; j++)
		{
			// create references
			tabname = "tabs" + j;
			catname = catlistnames[j-1];
			
			// Set up Category Tab
			$( "#"+tabname+"-toi-selector" ).buttonset();
			
			// Change from img to text on click
			$( "#"+tabname+"-toi-selector :radio" ).click(function(e) {
				idx = parseInt($(this).attr("id").slice(-5,-4));
				tabname = "tabs" + idx;
				catname = catlistnames[idx-1];
				$( "#"+tabname+"-toi-selector :radio" ).attr("checked",false);
				
				if($(this).attr("id").slice(-3) == "txt")
				{
					$(this).attr("checked",true);
					$(".img-item-"+catname).hide();
				}
				else
				{
					$(this).attr("checked",true);
					$(".img-item-"+catname).show();
					updateImages(idx);
				}
				$('#'+tabname+'-toi-selector').buttonset('refresh')
			});
			
			// add category label name
			$("#"+tabname+"-catlabel-input").val(templates[templateId][catname].label);
			
			// add data label name
			$("#"+tabname+"-datalabel-input").val(templates[templateId][catname].datalabel);
			
			// Show options for each tab
			for (var i=0; i<templates[templateId][catname].items.length; i++) {
				itemstring = "<div class='catitem'>";
					// delete button
					itemstring += "<span class=\"delete-item ui-icon ui-icon-close\" onclick='deleteItem(\"" + catname + i + "\")'></span>";
					// preview	
					if(templates[templateId][catname].itemtype == "txt")
					{
						itemstring += "<img src='core/no-image.jpg' class='cat-item-img img-item-"+catname+"' id='" + catname + i + "-img'>";
					}
					else
					{
						itemstring += "<img src='templates/"+templateId+"/img/"+templates[templateId][catname].items[i];
						itemstring += "' class='cat-item-img img-item-"+catname+"' id='" + catname + i + "-img'>";
					}
					// input for filename
					itemstring += "<input type='text' id='" + catname + i + "-txt' name='" + catname + i + "-txt' value='" 
					itemstring += templates[templateId][catname].items[i] + "'>";
				itemstring += "</div>";
				$("#"+tabname+"-catitems").append(itemstring);
			}
			itemstring = "<input type='hidden' id='max-"+catname+"' name='max-"+catname+"' value="+i+">";
			$("#"+tabname+"-catitems").append(itemstring);
			
			itemstring = "<div class='catitem add-item-wrapper'><img id='add-item-button' src='core/add-item.png' onclick='addItem("+j+")'/></div>";
			$("#"+tabname+"-catitems").append(itemstring);
			
			// update images button
			itemstring = "<input type='button' class='img-item-"+catname+"' id='upload-imgs' value='Update Images' onclick='updateImages("+j+");'>";
			$("#"+tabname+"-catitems").append(itemstring);
			
			// decide if showing or not
			if(templates[templateId][catname].itemtype == "txt")
			{
				// Set text / image selection
				$("#"+tabname+"-txt").attr('checked', "checked");
				$("#"+tabname+"-toi-selector").buttonset('refresh');
				$(".img-item-"+catname).hide();
			}
			else
			{
				// Set text / image selection
				$("#"+tabname+"-img").attr('checked', "checked");
				$("#"+tabname+"-toi-selector").buttonset('refresh');
				$(".img-item-"+catname).show();
			}
			
			$(function() { $( "input[type=button]" ).button();});
		}
	});	
}

function addItem(catnum)
{
	if($(".template-selected").attr("id") == "create-new")
	{
		var templateId = "Empty";
	}
	else
	{
		var templateId = $(".template-selected").attr("id");
	}
	tabname = "tabs" + catnum;
	catname = catlistnames[catnum-1];
	var lastitem = $("#max-"+catname).prev();
	var lasttext = lastitem.children("input:text").attr("id");
	var idx = parseInt(lasttext.slice(-5,-4)) + 1;
	
	itemstring = "<div class='catitem'>";
		// delete button
		itemstring += "<span class=\"delete-item ui-icon ui-icon-close\" onclick='deleteItem(\"" + catname + idx + "\")'></span>";
		// preview
		itemstring += "<img src='core/no-image.jpg' class='cat-item-img img-item-"+catname+"' id='" + catname + idx + "-img'>";	
		// input for filename
		itemstring += "<input type='text' id='" + catname + idx + "-txt' name='" + catname + idx + "-txt' + value='Input Filename'>";
	itemstring += "</div>";
	$("#max-"+catname).before(itemstring);
	// check currently selected option
	if($("#"+tabname+"-toi-selector :radio:checked").attr("id") == tabname+"-txt")
	{
		$(".img-item-"+catname).hide()
	}
	// update maximum number of items
	$("#max-"+catname).val(idx);
}

function updateImages(catidx)
{
	if($(".template-selected").attr("id") == "create-new")
	{
		var templateId = "Empty";
	}
	else
	{
		var templateId = $(".template-selected").attr("id");
	}
	tabname = "tabs" + catidx;
	catname = catlistnames[catidx-1];
	
	// clear errors
	$("#"+tabname + "-catitems  > div.catitem").removeClass("erroritem");
	
	// get file sources from input fields
	catitemtxts = $("#"+tabname + "-catitems > div.catitem > input:text");
	imgsources = []
	for (var imgidx=0; imgidx<catitemtxts.length; imgidx++)
	{	
		imgsources.push($(catitemtxts[imgidx]).val());
	}
	
	// verify files exist
	$.post("core/fileManager.php", { "op": "exists", "template": templateId, "files": imgsources }, function(data) {		
		catitemimgs = $("#"+tabname + "-catitems > div.catitem > img");
		filesrcs = data.split(",");
		if (filesrcs.length == catitemimgs.length - 1)
		{
			// put image sources in files
			for (var imgidx=0; imgidx<filesrcs.length; imgidx++)
			{	
				$(catitemimgs[imgidx]).attr("src", filesrcs[imgidx]);
				if(filesrcs[imgidx] == "core/no-image.jpg")
				{
					$(catitemimgs[imgidx]).parent().addClass("erroritem");
				}
			}
			return true;
		}
		else
		{
			alert("Error checking if files exist");
			console.log(data);
			return false;
		}
	});

}

function deleteItem(idx)
{
	var catitem = $("#"+idx+"-txt").parent();
	catitem.remove();
}

function setActive()
{
	var templateId = $(".template-selected").attr("id");
	
	$.post("core/fileManager.php", 
		{ "op": "setActive", "template": templateId }, 
		function(data) {
			if(data == "success")
			{
				$(".exp-header-active").html($(".template-selected").attr("id"));
				$( "#alert-window" ).html("The template '"+$(".template-selected").attr("id")+"' is now active.");
		        $( "#alert-window" ).dialog({
					title: "<h3>Active Template Updated</h3>",
		            modal: true,
		            buttons: {
		                Ok: function() {
		                    $( this ).dialog( "close" );
		                }
		            }
		        });
			}
			else if(data.slice(0,5) == "Error")
			{
				alert(data);
			}
	});
	
}

function validateTemplate()
{
	if($(".template-selected").attr("id") == "create-new")
	{
		var templateId = "Empty";
	}
	else
	{
		var templateId = $(".template-selected").attr("id");
	}
	var oldName = templates[templateId].name;
	var formString = $("form").serialize();
	// console.log(formString);

	$.post("core/fileManager.php", 
		{ "op": "saveTemplate", "template": templateId, "oldname": oldName, "form": formString}, 
		function(data) {		
			if (data == "success")
			{					
				// update templates object with new data (so oldname is fixed on next run)
				var templateName = $("#template-name").val();
				$.getJSON("templates/active.txt",showTemplates);
				if($(".template-selected").attr("id") == "create-new")
				{
					$(".template-selected").removeClass("template-selected");
					$("#exp-content").empty();
				}
				else
				{
					$(".template-selected").attr("id",templateName);
				}
				
				//update images
				for(var j=1; j<5; j++)
				{
					tabname = "tabs" + j;				
					// clear errors
					$("#"+tabname + "-catitems  > div.catitem").removeClass("erroritem");
					
					if ($("#tabs"+j+"-toi-selector :radio:checked").attr("id") == "tabs"+j+"-img")
					{
						// update images
						catitemimgs = $("#"+tabname + "-catitems > div.catitem > img");
						catitemtxts = $("#"+tabname + "-catitems > div.catitem > input:text");
						for (var imgidx=0; imgidx<catitemtxts.length; imgidx++)
						{	
							$(catitemimgs[imgidx]).attr("src", "templates/"+$("#template-name").val()+"/img/"+$(catitemtxts[imgidx]).val());
	
						}
					}
				}
				// notify successfully saved
				$("#alert-window").html("The template '"+templateName+"' has been successfully saved.");
				$(function() {
			        $( "#alert-window" ).dialog({
						title: "<h3>Template saved</h3>",
			            modal: true,
			            buttons: {
			                Ok: function() {
			                    $( this ).dialog( "close" );
			                }
			            }
			        });
			    });
			}
			else if (data.slice(0,5) == "Error")
			{
				alert(data);
			}
			else
			{
				res = eval('('+data+')');
				$("#alert-window").html("<ul>"+res['errors']+"</ul>");
				for(var j=1; j<5; j++)
				{
					tabname = "tabs" + j;
					if ($("#tabs"+j+"-toi-selector :radio:checked").attr("id") == "tabs"+j+"-img")
					{
						// update images
						catitemimgs = $("#"+tabname + "-catitems > div.catitem > img");
						filesrcs = res['images'][tabname].split(",");
						numitems = filesrcs.length;
						// put image sources in files
						for (var imgidx=0; imgidx<numitems; imgidx++)
						{	
							var image_src = filesrcs.shift();
							$(catitemimgs[imgidx]).attr("src", image_src);
							if(image_src == "core/no-image.jpg")
							{
								$(catitemimgs[imgidx]).parent().addClass("erroritem");
							}
						}
					}
				}
				$(function() {
			        $( "#alert-window" ).dialog({
						title: "<h3>Problems with template</h3>",
			            modal: true,
			            buttons: {
			                Ok: function() {
			                    $( this ).dialog( "close" );
			                }
			            }
			        });
			    });
			}
	});
	
}

function loadCreateForm() {
	// $(".template-selected").removeClass("template-selected");
	$("#set-active").button("option","disabled",true);
	// $("#view-stats").attr("disabled","disabled");
	
	// selectTemplate();
	
	// Make edits to group name live
	// $("#group-name-field").ready(function() {
	// 	$("#group-name-field").keyup(changeGroupName);
	// });
}

function loadActiveStats(input)
{
	$(".exp-header-active").html(input.active);
	
	// Get completed output	
	// $.getJSON("core/fileManager.php",
	// {"op":"getstats","root":input.root,"output":input.output},
	// buildStatsPage);
}

function viewStats() {
	// Get selected template
	
	// Verify data for template exists
	
	// Build stats page
}


function buildStatsPage(input)
{
	
	// Number completed
	
	// Bar chart
	
	// Aggregate & Save button
	
	// Change active IAT
}
