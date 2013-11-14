var templates = {};
var catlistnames = ["catA","catB","cat1","cat2"];
var catfullnames = ["Category A","Category B","Category 1","Category 2"];
var arr = [];


$.fn.hookToInput = function(selector)
{
	if(typeof selector == "string")
	{
		selector = $(selector);
	}

	this.each(function(i)
	{
		var $this = $(this);
		var assocInput = $($.isFunction(selector)	? selector($this) 
													: selector.get(i));
		
		assocInput.keyup(function()
		{
			$this.html(assocInput.val() || "[Untitled]");
		});
	});
}

$.fn.toSerializedJSON = function()
{
	var $this	= $(this);
	var params	= $this.serialize().split("&");
	var json	= "{";
	
	for(var i = 0, l = params.length; i<l; i++)
	{
		var parts = params[i].split("=");
		json += "\"" + unescape(parts[0]) + "\":\"" + unescape(parts[1]) +  "\"\,";
	}
	
	json += json.substr(0,json.length-1) + "}";
	return json;
}

/*
 * 
 * Experimenter object preserves global state variables
 * 
 */
var Experimenter = {
	
	readyEventCount: 0

};

/*
 *
 * FileMgr object manages requesting/caching of resources
 *
 * Advantages:
 * - Avoids issues with changing filenames (in future)
 * - Streamlines retrieval of app files
 * - Caches static resources to avoid unnecessary requests
 *
 */
 
var FileMgr = {
	
	TEMPLATE_DIR:	"templates/",
	CORE_DIR:		"core/",
	
	TEMPLATE_FILE:	"templateForm.html",
	FILEMGR_FILE:	"fileManager.php",
	ACTIVE_FILE:	"active.txt",
	INPUT_FILE:		"input.txt",

	getFileMgrPath: function() { return this.CORE_DIR + this.FILEMGR_FILE; },
	getTemplateFormPath: function() { return this.CORE_DIR + this.TEMPLATE_FILE; },
	getActivePath: function() { return this.TEMPLATE_DIR + this.ACTIVE_FILE; },
	getInputPath: function(templateId) { return this.TEMPLATE_DIR + templateId + '/' + this.INPUT_FILE; },
	
	// Caches static resources
	cacheData:		[],
	defCache:		[],
	
	mustCache: function(filename)
	{
		for(var i = 0, l = this.defCache.length; i<l; i++) {
			if(this.defCache[i] == filename) {
				return true;
			}
		}
		return false;
	},
	
	// For internal use only to streamline
	// force-cache evaluations
	ajax: function(method, filename, callback)
	{
		callback = (typeof callback != "undefined")	? callback
													: function() {};
		
		if(this.mustCache(filename))
		{
			this.cache(method, filename, callback);
		}
		else
		{
			$[method](filename, callback);
		}
	},
	
	"get": function(filename, callback)	{ this.ajax("get", filename, callback); },
	getJSON: function(filename, callback) {	this.ajax("getJSON", filename, callback); },
	post: function(filename, data, callback) { $.post(filename, data, callback); },
	
	/*
	 * FileMgr.cache ::
	 * Automatically called internally by any request methods
	 * when static resource filename present in FileMgr.defCache
	 */
	
	cache: function(method, filename, callback)
	{
		callback = (typeof callback != "undefined")	? callback
													: function() {};

		if(FileMgr.cacheData[filename])
		{
			callback(FileMgr.cacheData[filename]);
		}
		else
		{
			$[method](filename, function(input)
			{
				FileMgr.cacheData[filename] = input;
				callback(input);
			});
		}		
	},
	
	/* setForceCache :: 
	 * Defines static resources that *must* be cached
	 *
	 * Accepts: filename string or Array of filenames
	 */
	setForceCache: function(fileArr)
	{
		if($.isArray(fileArr))
		{
			this.defCache = this.defCache.concat(fileArr);
		}
		else
		{
			this.defCache.push(fileArr);
		}
	}

};


// Begin application logic...

/*
 *
 * Initializing application flow: 
 *
 * 1. initExperimenter: loads "active.txt" to retrieve core data
 * 2. initTemplates: relays loaded core data to several auxilary functions to generate DOM/template object
 * 3. readyTemplates: callback fired once all template files have been downloaded and DOM/template object ready
 *
 */

function initExperimenter()
{	
	// Update :: consolidated multiple AJAX callbacks into
	// one function to avoid multiple requests of same resource
	FileMgr.getJSON(FileMgr.getActivePath(),initTemplates);
	

	// Preload template form data
	FileMgr.setForceCache([FileMgr.getTemplateFormPath()]);
	FileMgr.get(FileMgr.getTemplateFormPath());
	
	// Apply jQuery UI theming
	$(function()
	{
		$("input[type=button]").button();
		$("#set-active").click(setActive);
	});
	
	
}

function initTemplates(input)
{
	showTemplates(input);
	loadActiveStats(input);
}

/* 
 * readyTemplates :: callback fired after all templates have been painted to the DOM
 * and "templates" object is fully populated
 * @param input :: JSON object from "active.txt"
 *
 * Note :: this function fires *every* time the DOM is repainted and templates are reloaded
 * Experimenter.readyEventCount accounts for # of times event has been fired
 */
function readyTemplates(input)
{
	// Procedure executed only on initial call to readyTemplates
	if(Experimenter.readyEventCount == 0)
	{
		// Automatically load active template (if any) or #create-new 
		if(input.active != "Empty") {
			$(".template-item[data-templateid='" + input.active + "']").trigger("click");
		}
		else
		{
			$("#create-new").trigger("click");
		}
		
		// Attach event to save icon
		$(".template-item").on("click",".save-item",function()
		{
			saveTemplate(repaintTemplates,showSaveError);
		});
		
		// Attach event to delete icon
		$(".selector-frame").on("click",".delete-item",function(e) {
			e.stopPropagation();
			verifyDelete($(this).parent().data("templateid"));
		});
		
		// Attach unload event handler that stores unsaved template data changes
		// to prompt user with on return visit
		$(window).bind("beforeunload",storeUnsavedChanges)
		
		// Check for unsaved data from previous visit
		showUnsavedChangesFromPrevious();
	}

	Experimenter.readyEventCount++;
}

function storeUnsavedChanges()
{
	var hasUnsavedTemplate = $(".template-unsaved").length > 0;

	/* If current template has unsaved changes, prompt user to
	 * save before closing.
	 *
	 * Store unsaved data in cookies to prompt user with on
	 * return to experimenter
	 */
	if(hasUnsavedTemplate)
	{
		var templateId = $(".template-selected").data("templateid");
		$.cookie("unsaved_templateid",templateId);
		$.cookie("unsaved_data",$("#template-form").toSerializedJSON());
		
		return "Note: You have unsaved changes to " + templateId + ".";
	}
}

function showUnsavedChangesFromPrevious()
{
	var templateId		= $.cookie("unsaved_templateid");
	var templateData	= $.cookie("unsaved_data"); 
	if(templateId && templateData)
	{
		/*$("#alert-window").html("Do you want to recover unsaved changes to " + templateId + "?");
		$("#alert-window").dialog({
			title: "<h3>Unsaved Changes:" + templateId + "</h3>",
			modal: true,
			buttons: {
				Yes: function()
				{
					$(this).dialog("close");
				},
				No: function()
				{
					$(this).dialog("close");
				}
			}
		});*/
		
		clearUnsavedChangesFromPrevious();
	}
}

function clearUnsavedChangesFromPrevious()
{
	// Clear unsaved changes from previous visit
	$.removeCookie("unsaved_templateid");
	$.removeCookie("unsaved_data");
}

function clearUnsavedTemplate()
{	
	var unsavedTemplate = $(".template-unsaved");
	
	unsavedTemplate.find(".save-item").remove();
	unsavedTemplate.data("ischanged", false)
	.removeClass("template-unsaved");
}

function renderTemplateViewerItem(templateId)
{
	// Update :: added data-templateid attribute to avoid
	// errors resulting from selecting .template-item elements
	// with illegal characters in ID attribute
	
	$(".active-selector").append("<div id='" + templateId + 
		"' data-templateid='" + templateId + 
		"' data-ischanged='false' class='template-item user-template template-button'><span class=\"delete-item ui-icon ui-icon-trash\" title=\"Delete\"></span><span class='template-item-label'>" + templateId + "</span></div>");
}

function showTemplates(input)
{
	// Save currently selected template (if any)
	var currTemplateId = $("#template-name").val();
	
	// Removes previously created DOM for templates
	// before updating with new content
	$(".user-template").remove();
	
	var numTemplates		= input.available.length;
	var numTemplatesLoaded	= 0;
	
	// Generate DOM elements for each template in 
	// .selector-frame and populate templates object
	for (var template in input.available)
	{
		if(input.available[template] != "Empty")
		{
			renderTemplateViewerItem(input.available[template]);
		}		
		
		// Retrieve current template configuration from external resource
		FileMgr.getJSON(FileMgr.getInputPath(input.available[template]), function(data)
		{
			templates[data["name"]] = data;			 
			
			numTemplatesLoaded++;
			if(numTemplatesLoaded == numTemplates)
			{
				readyTemplates(input);
			}
		});
	}
	
	// Re-attach .template-selected class to current template
	var currTemplateObj = $(".template-item[data-templateid='" + currTemplateId + "']"); 
	if(currTemplateObj.length > 0)
	{
		currTemplateObj.addClass("template-selected");
	}
	
	// Attach event handler for changing templates
	$(".template-item").unbind("click").click(selectTemplate);
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
					FileMgr.post(FileMgr.getFileMgrPath(), {"op":"deleteTemplate", "template":templateId}, function(data) {
						if (data.slice(0,5) == "Error")
						{
							alert(data);
						}
						else
						{
							$("#exp-content").empty();
							FileMgr.getJSON(FileMgr.getActivePath(),showTemplates);
						}
					});
	                $(this).dialog("close");
	            },
	            Cancel: function() {
	                $(this).dialog("close");
	            }
	        }
	    });
	}
}

function selectTemplate(e)
{
	var $this = $(this);

	// Prevent reloading of current template so
	// altered data not overwritted
	if(!$this.hasClass("template-selected")) {	
		// Prompt user to save changes to active template
		// before changing to selected template
		var currTemplateObj = $(".template-selected");
		var currTemplate = currTemplateObj.text();
		
		// If new, unsaved template, adjust its title
		if(currTemplateObj.attr("id") == "create-new")
		{
			currTemplate = ($("#template-name").val() != "Empty")	? $("#template-name").val()
																	: "Untitled";
		}
		
		if(currTemplateObj.hasClass("template-unsaved"))
		{	
			$("#alert-window").html("Do you want to save changes to \"<b>" + currTemplate +"</b>\"?")
			.dialog({
				title: "<h3>Unsaved Changes</h3>",
				modal: true,
				close: clearUnsavedTemplate,
				buttons: {
					Save: function()
					{
						saveTemplate(function(data)
						{
							repaintTemplates(data);
							changeTemplate({
								templateObj: $this,
								isReloadActive: true
							});
							$("#alert-window").dialog("close"); // Note the closure :: $(this) != $("#alert-window") 
						},showSaveError);
					},
					Discard: function()
					{
						currTemplateObj.find(".template-item-label").html(currTemplateObj.data("templateid")); // Restore original template name
						changeTemplate({
							templateObj: $this,
							isReloadActive: false
						});
						$(this).dialog("close");
					}
				}
			});
		}
		else
		{
			changeTemplate({
				templateObj: $this,
				isReloadActive: false
			});
		}	
	}
}

function changeTemplate(options)
{
	// isReloadActive indicates whether template inputs should
	// be redownloaded with updates
	isReloadActive = options.isReloadActive || false;
	var $this = options.templateObj;
	
	// Change selected template
	$(".template-selected").removeClass("template-selected");
	$this.addClass("template-selected");
	
	if($this.attr("id") != "create-new")
	{
		$("#set-active").button("option","disabled", false);
	}
	
	// Put form html into exp-content frame
	FileMgr.get(FileMgr.getTemplateFormPath(), function(data) { 

		renderTemplateForm(data);
		attachTemplateFormEventHandlers();
		
		if(isReloadActive)
		{
			// Update templates object with new data (so oldname is fixed on next run)
			FileMgr.getJSON(FileMgr.getActivePath(),showTemplates);
		}
		
	});
}

function renderTemplateForm(data)
{
	var templateId;
	if($(".template-selected").attr("id") == "create-new")
	{
		templateId = "Empty";
	}
	else
	{
		templateId = $(".template-selected").attr("id");
	}
	
	$("#exp-content").html(data); 
	$("#template-name").val(templateId);
	$("#category-selector").tabs();
	
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
	
	// Enable buttons for saving to file or database
// 	$( "#save-results" ).buttonset();
// 	if(templates[templateId].saveResult == "file")
// 	{
// 		$("#file").attr("checked",true);
// 		$("#save-results").buttonset('refresh');
// 	}
// 	else
// 	{
// 		$("#database").attr("checked",true);
// 		$("#save-results").buttonset('refresh');
// 	}
// 	// Change on click
// 	$( "#save-results :radio" ).click(function(e) {
// 		$( "#save-results :radio" ).attr("checked",false);
// 		$(this).attr("checked",true);
// 	});
	
	var categoryTabs = $("#category-list a");
	for(var j=1; j<5; j++)
	{
		// create references
		tabname = "tabs" + j;
		catname = catlistnames[j-1];
		arr.push(catlistnames[j-1]);
		
		// Update category tab with name
		$(categoryTabs.get(j - 1)).html(templates[templateId][catname].label);
		
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
		
	}
	
	if($(".template-selected").attr("id") == "create-new")
	{
		$("#template-name").val("").focus();
	}
}

function attachTemplateFormEventHandlers()
{
	$("input[type=button]").button();
	
	// Listen for changes to template to update templates object
	$("#template-form input").unbind("change").on("change",updateTemplateState);
	
	// Event handler for save icon in template viewer
	$("#save-template").unbind("click").click(function() {
		saveTemplate(repaintTemplates,showSaveError)
	});
	
	// Event hook to update category tab labels with category
	$("#category-list a").hookToInput(".catlabel-input");
	
	// Event hook to update template viewer labels when template name changes
	$(".template-selected .template-item-label").hookToInput(function(x) {
		return "#template-name";
	});
}

function repaintTemplates()
{
	var templateName = $("#template-name").val();
	

	if($(".template-selected").attr("id") == "create-new")
	{
		$(".template-selected").removeClass("template-selected");
		$("#exp-content").empty();
	}
	else
	{
		$(".template-selected").attr("id",templateName)
		.data("templateid",templateName);
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
	// Notify successfully saved
	/*$("#alert-window").html("The template '"+templateName+"' has been successfully saved.");
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
    });*/
}

function showSaveError(data)
{console.log(data);
	/*res = eval('('+data+')');
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
    });*/
}

function updateTemplateState(e)
{
	var currTemplateObj = $(".template-selected");
	
	if(!currTemplateObj.hasClass("template-unsaved"))
	{
		// Subtle hint: CSS (.template-unsaved .template-item-label:after) appends "*" to template name
		currTemplateObj.data("ischanged", true)
		.addClass("template-unsaved");
		
		// Subtle hint: add save icon to template viewer item
		var baseHtml = currTemplateObj.html();
		currTemplateObj.html(baseHtml + "<span class=\"ui-icon ui-icon-disk save-item\" title=\"Save\"></span>");
	}
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
	FileMgr.post(FileMgr.getFileMgrPath(), { "op": "exists", "template": templateId, "files": imgsources }, function(data) {		
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
	
	FileMgr.post(FileMgr.getFileMgrPath(), 
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

function saveTemplate(successCallback, errorCallback)
{
	var templateId, oldName;
	if($(".template-selected").attr("id") == "create-new")
	{
		templateId = $("#template-name").val();
		oldName = "Empty";
	}
	else
	{
		templateId = $("#template-name").val();
		oldName = templates[$(".template-selected").data("templateid")].name;
	}
	var formString = $("form").serialize();

	FileMgr.post(FileMgr.getFileMgrPath(), 
		{ "op": "saveTemplate", "template": templateId, "oldname": oldName, "form": formString}, 
		function(saveData) {	
			returnedData = JSON.parse(saveData);
			if (returnedData.name == templateId)
			{
				templates[templateId] = returnedData;
				// Remove save icon from unsaved template viewer item
				clearUnsavedTemplate();
				
				clearUnsavedChangesFromPrevious();
				
				$(".template-selected")
				.data("templateid",templateId)
				.attr("id",templateId);
				
				console.log(templates[templateId]);
				
				// Update template object with saved data
// 				FileMgr.getJSON(FileMgr.getInputPath(templateId), function(templateData)
// 				{
// 					templates[templateId] = templateData;
// // 					console.log(templateId);
// // 					console.log(templateData);
// 					successCallback(saveData);
// 				});
			}
			else if (saveData.slice(0,5) == "Error")
			{
				alert(saveData); // Should call errorCallback as well? (Probably)
			}
			else
			{
				errorCallback(saveData);
			}
	});


	var showresult;
	showresult=templates[templateId].showResult;
	FileMgr.post(FileMgr.getFileMgrPath(), 
	{ "op": "checkdb", "template": templateId, "form": formString, "showresult": showresult }, 
	function(checkdb) {
	if(checkdb == "success")
			{
				FileMgr.post(FileMgr.getFileMgrPath(), 
				{ "op": "writeinput", "template": templateId, "form": formString, "showresult": showresult });
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