template = {};
sub = '';
clearform = true;

// replace this with the link to the google form
gframe = 'https://docs.google.com/forms/d/1alFGZ2_tkQTsGf5CXI7dyzQPTipsELUMQU6G1v-pdLE/viewform';

function randomString(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// Loads the input file and starts introduction
function initialize()
{	
	// get active template & load data into global variable
	$.getJSON("templates/active.txt", function(input) {
		document.title = input.active + " IAT";
		$.getJSON("templates/"+input.active+"/input.txt", function(data) { 
			template = data;
			$.get("core/instruct0.html", function(data) {
				$("#instructions").html(data);
				$("#subID").val(randomString(10));
			});
		});
	});
}

function loadInstructions(stage)
{
	switch(stage)
	{
		case 'one':
			sub = $("#subID").val();
			if(sub.search('/[^a-zA-Z0-9]/g')==-1)
			{
				$.get("core/instruct1.html", function(data) {
					$("#instructions").html(data);
					$(".IATname").html(template.name);
					if(	template.catA.itemtype == "img" || 
						template.catB.itemtype == "img" || 
						template.cat1.itemtype == "img" || 
						template.cat2.itemtype == "img")
					{
						$("#andpics").html(" and pictures ");
					}
				});
			}
			else
			{
				alert("Please enter a valid subject ID");
			}
			break;
		case 'two':
			$.get("core/instruct2.html", function(data) {
				$("#instructions").html(data);
				
				$("#clabel1").html(template.cat1.label);
		        $("#clabel2").html(template.cat2.label);
		        $("#clabelA").html(template.catA.label);
		        $("#clabelB").html(template.catB.label);
		        if (template.cat1.itemtype == "txt")
		            { $("#citems1").html(template.cat1.items.join(", ")); }
		        else if (template.cat1.itemtype == "img")
		            { $("#citems1").html("Images of "+template.cat1.label); }
		        if (template.cat2.itemtype == "txt")
		            { $("#citems2").html(template.cat2.items.join(", ")); }
		        else if (template.cat2.itemtype == "img")
		            { $("#citems2").html("Images of "+template.cat2.label); }
		        if (template.catA.itemtype == "txt")
		            { $("#citemsA").html(template.catA.items.join(", ")); }
		        else if (template.catA.itemtype == "img")
		            { $("#citemsA").html("Images of "+template.catA.label); }
		        if (template.catB.itemtype == "txt")
		            { $("#citemsB").html(template.catB.items.join(", ")); }
		        else if (template.catB.itemtype == "img")
		            { $("#citemsB").html("Images of "+template.catB.label); }
			});
			break;
		case 'IAT':
			$.get("core/IAT.html", function(data) {
				$('body').html(data);
				document.onkeypress = keyHandler; 
				startIAT();
			});
			break;
	}
}

// Initialize variables, build page & data object, display instructions
function startIAT()
{
	currentState = "instruction";
	session = 0;
	roundnum = 0;
	
	// default to show results to participant
	if (!('showResult' in template))
	{
	    template.showResult = "show";
	}
	
	// make the target or association words green
	if (Math.random() < 0.5)
	{
		openA = "<font color=green>";
		closeA = "</font>";
		open1 = "";
		close1 = "";
	}
	else
	{		
		open1 = "<font color=green>";
		close1 = "</font>";
		openA = "";
		closeA = "";
	}
	buildPage();
	roundArray = initRounds();
    instructionPage();
}

// Adds all images to page (initially hidden) so they are pre-loaded for IAT
function buildPage()
{
	if (template.catA.itemtype == "img")
	{
		for (i in template.catA.items)
		{
			var itemstr = '<img id="'+template.catA.datalabel+i+'" class="IATitem" src="templates/'+template.name+'/img/'+template.catA.items[i]+'">';
			$("#exp_instruct").after(itemstr);
		}
	}
	if (template.catB.itemtype == "img")
	{
		for (i in template.catB.items)
		{
			var itemstr = '<img id="'+template.catB.datalabel+i+'" class="IATitem" src="templates/'+template.name+'/img/'+template.catB.items[i]+'">';
			$("#exp_instruct").after(itemstr);
		}
	}
	if (template.cat1.itemtype == "img")
	{
		for (i in template.cat1.items)
		{
			var itemstr = '<img id="'+template.cat1.datalabel+i+'" class="IATitem" src="templates/'+template.name+'/img/'+template.cat1.items[i]+'">';
			$("#exp_instruct").after(itemstr);
		}
	}
	if (template.cat2.itemtype == "img")
	{
		for (i in template.cat2.items)
		{
			var itemstr = '<img id="'+template.cat2.datalabel+i+'" class="IATitem" src="templates/'+template.name+'/img/'+template.cat2.items[i]+'">';
			$("#exp_instruct").after(itemstr);
		}
	}
}

// Round object
function IATround()
{
	this.starttime = 0;
	this.endtime = 0;
	this.itemtype = "none";
	this.category = "none";
	this.catIndex = 0;
	this.correct = 0;
	this.errors = 0;
}

// Create array for each session & round, with pre-randomized ordering of images
function initRounds()
{
    var roundArray = [];
    // for each session
    for (var i=0; i<7; i++)
    {
        roundArray[i] = [];
        switch (i)
        {
            case 0:
            case 4:
                stype = "target";
                numrounds = 20;
                break;
            case 1:    
                stype = "association";
                numrounds = 20;
                break;
            case 2:
            case 3:
            case 5:
            case 6:
                stype = "both";
                numrounds = 40;
                break;
            
        }
		prevIndexA = -1; prevIndex1 = -1;
        for (var j = 0; j<numrounds; j++)
        {
            var round = new IATround();
            
            if (stype == "target")
            {
                round.category = (Math.random() < 0.5 ? template.catA.datalabel : template.catB.datalabel);
            }
            else if (stype == "association")
            {
                round.category = (Math.random() < 0.5 ? template.cat1.datalabel : template.cat2.datalabel);  
            }
            else if (stype == "both")
            {
				if (j % 2 == 0) { round.category = (Math.random() < 0.5 ? template.catA.datalabel : template.catB.datalabel); }
				else { round.category = (Math.random() < 0.5 ? template.cat1.datalabel : template.cat2.datalabel); }
            }
        	// pick a category
        	if (round.category == template.catA.datalabel) 
        	{ 
				round.itemtype = template.catA.itemtype;
				if (i < 4) { round.correct = 1; }
				else { round.correct = 2; }
				
				// pick an item different from the last
				do 
					{ round.catIndex = Math.floor(Math.random()*template.catA.items.length); }
	        	while (prevIndexA == round.catIndex)
	        	prevIndexA = round.catIndex;
        		
        	}
        	else if (round.category == template.catB.datalabel)
        	{ 
				round.itemtype = template.catB.itemtype;
				if (i < 4) { round.correct = 2; }
				else { round.correct = 1; }
				// pick an item different from the last
				do
	        	    { round.catIndex = Math.floor(Math.random()*template.catB.items.length); }
	        	while (prevIndexA == round.catIndex)
	        	prevIndexA = round.catIndex;
        	}
        	else if (round.category == template.cat1.datalabel)
        	{ 
				round.itemtype = template.cat1.itemtype;
        		round.correct = 1;
				// pick an item different from the last
				do
	        	    { round.catIndex = Math.floor(Math.random()*template.cat1.items.length); }
	        	while (prevIndex1 == round.catIndex)
	        	prevIndex1 = round.catIndex;
        	}
        	else if (round.category == template.cat2.datalabel)
        	{ 
				round.itemtype = template.cat2.itemtype;
        		round.correct = 2;
				// pick an item different from the last
				do
	        	    { round.catIndex = Math.floor(Math.random()*template.cat2.items.length); }
	        	while (prevIndex1 == round.catIndex)
	        	prevIndex1 = round.catIndex;
        	}	
        	
        	roundArray[i].push(round);
        }
    }
    
    return roundArray;
}

// insert instruction text based on stage in IAT
function instructionPage()
{	
	switch (session)
    {
		case 0:
			$('#left_cat').ready(function() { $('#left_cat').html(openA+template.catA.label+closeA); });
			$('#right_cat').ready(function() { $('#right_cat').html(openA+template.catB.label+closeA); });
			break;
        case 1:    
			$("#left_cat").html(open1+template.cat1.label+close1);
			$("#right_cat").html(open1+template.cat2.label+close1);
            break;
        case 2:
        case 3:
			$("#left_cat").html(openA+template.catA.label+closeA+'<br>or<br>'+open1+template.cat1.label+close1);
			$("#right_cat").html(openA+template.catB.label+closeA+'<br>or<br>'+open1+template.cat2.label+close1);
            break;
        case 4:
			$("#left_cat").html(openA+template.catB.label+closeA);
			$("#right_cat").html(openA+template.catA.label+closeA);
			break;
        case 5:
        case 6:
			$("#left_cat").html(openA+template.catB.label+closeA+'<br>or<br>'+open1+template.cat1.label+close1);
			$("#right_cat").html(openA+template.catA.label+closeA+'<br>or<br>'+open1+template.cat2.label+close1);
            break;
    }
	if (session == 7)
	{
		$("#left_cat").html("");
		$("#right_cat").html("");
		$("#exp_instruct").html("<img src='core/spinner.gif'>");
		WriteFile();
		//if('insertForm' in template)
		if(true)
		{
			resulttext = '<iframe src="'+gframe+'?embedded=true" width="500" height="500" frameborder="0" marginheight="0" marginwidth="0" onLoad="clearForm(true);">Loading...</iframe>';
			$("#experiment_frame").html(resulttext);
		}
		else 
		{
			if(template.showResult == "show")
			{
			    calculateIAT();
			}
			else
			{
			    resulttext = "<div style='text-align:center;padding:20px'>Thanks for participating!</div>";
			    $("#picture_frame").html(resulttext);
			}
		}
	}
	else
	{
		$.get("core/gInstruct"+(session+1)+".html", function(data) { $('#exp_instruct').html(data); });
	}
}

function clearForm(toggle)
{
	clearform = clearform ^ toggle;
	if(clearform)
	{
		$('#experiment_frame').html('<div id="header"></div><div id="picture_frame"></div>');
		if(template.showResult == "show")
		{
		    calculateIAT();
		}
		else
		{
		    resulttext = "<div style='text-align:center;padding:20px'>Thanks for participating!</div>";
		    $("#picture_frame").html(resulttext);
		}
	}
}

// Calculates estimate of effect size to present results to participant
function calculateIAT()
{
    // calculate mean log(RT) for first key trial
	compatible = 0;
	for (i=1; i<roundArray[3].length; i++)
	{
		score = roundArray[3][i].endtime - roundArray[3][i].starttime;
		if (score < 300) { score = 300; }
		if (score > 3000) { score = 3000; }
		compatible += Math.log(score);
	}
	compatible /= (roundArray[3].length - 1);
	
	// calculate mean log(RT) for second key trial
	incompatible = 0;
	for (i=1; i<roundArray[6].length; i++)
	{
		score = roundArray[6][i].endtime - roundArray[6][i].starttime;
		if (score < 300) { score = 300; }
		if (score > 3000) { score = 3000; }
		incompatible += Math.log(score);
	}
    incompatible /= (roundArray[6].length - 1);
    
    // calculate variance log(RT) for first key trial
    cvar = 0;
	for (i=1; i<roundArray[3].length; i++)
	{
		score = roundArray[3][i].endtime - roundArray[3][i].starttime;
		if (score < 300) { score = 300; }
		if (score > 3000) { score = 3000; }
	    cvar += Math.pow((Math.log(score) - compatible),2);
	}
	
	// calculate variance log(RT) for second key trial
	ivar = 0;
	for (i=1; i<roundArray[6].length; i++)
	{
		score = roundArray[6][i].endtime - roundArray[6][i].starttime;
		if (score < 300) { score = 300; }
		if (score > 3000) { score = 3000; }
	    ivar += Math.pow((Math.log(score) - incompatible),2);
	}
	
	// calculate t-value
	tvalue = (incompatible - compatible) / Math.sqrt(((cvar/39) + (ivar/39))/40);
    
    // determine effect size from t-value and create corresponding text
	if (Math.abs(tvalue) > 2.89) { severity = " <b>much more</b> than "; }
	else if (Math.abs(tvalue) > 2.64) { severity = " <b>more</b> than "; }	
	else if (Math.abs(tvalue) > 1.99) { severity = " <b>a little more</b> than "; }
	else if (Math.abs(tvalue) > 1.66) { severity = " <b>just slightly more</b> than "; }
	else { severity = ""; }
	
	// put together feedback based on direction & magnitude
	if (tvalue < 0 && severity != "")
    { 
        resulttext = "<div style='text-align:center;padding:20px'>You associate "+openA+template.catB.label+closeA+" with "+open1+template.cat1.label+close1;
        resulttext += " and "+openA+template.catA.label+closeA+" with "+open1+template.cat2.label+close1+severity;
        resulttext += "you associate "+openA+template.catA.label+closeA+" with "+open1+template.cat1.label+close1;
        resulttext += " and "+openA+template.catB.label+closeA+" with "+open1+template.cat2.label+close1+".</div>"; 
        // resulttext += "<div>incompatible: "+incompatible+" ("+(ivar/39)+"); compatible: "+compatible+" ("+(cvar/39)+"); tvalue: "+tvalue+"</div>";
    }
    else if (tvalue > 0 && severity != "")
    { 
        resulttext = "<div style='text-align:center;padding:20px'>You associate "+openA+template.catA.label+closeA+" with "+open1+template.cat1.label+close1;
        resulttext += " and "+openA+template.catB.label+closeA+" with "+open1+template.cat2.label+close1+severity;
        resulttext += "you associate "+openA+template.catB.label+closeA+" with "+open1+template.cat1.label+close1;
        resulttext += " and "+openA+template.catA.label+closeA+" with "+open1+template.cat2.label+close1+".</div>"; 
        // resulttext += "<div>incompatible: "+incompatible+" ("+(ivar/39)+"); compatible: "+compatible+" ("+(cvar/39)+"); tvalue: "+tvalue+"</div>";
    }
    else
    { 
        resulttext = "<div style='text-align:center;padding:20px'>You do not associate "+openA+template.catA.label+closeA;
        resulttext += " with "+open1+template.cat1.label+close1+" any more or less than you associate ";
        resulttext += openA+template.catB.label+closeA+" with "+open1+template.cat1.label+close1+".</div>"; 
        // resulttext += "<div>incompatible: "+incompatible+" ("+(ivar/39)+"); compatible: "+compatible+" ("+(cvar/39)+"); tvalue: "+tvalue+"</div>";
    }
	$("#picture_frame").html(resulttext);
}

// not currently used
function groupEvaluations()
{
	$('#demoglist').after(
		"Please rate how warm or cold you feel toward the following groups:\
		<br>\
		(0 = coldest feelings, 5 = neutral, 10 = warmest feelings)\
		<ol>\
		<li>\
		<p>"+template.catA.label+"</p>\
		<p>\
		<select id='catAwarm' name='catAwarm'> \
		<option value='unselected' selected='selected'></option>\
		<option value='0 coldest feelings'></option>\
		<option value='1'></option>\
		<option value='2'></option>\
		<option value='3'></option>\
		<option value='4'></option>\
		<option value='5 neutral'></option>\
		<option value='6'></option>\
		<option value='7'></option>\
		<option value='8'></option>\
		<option value='9'></option>\
		<option value='10 warmest feelings'></option>\
		</select>\
		</p> \
		</li>\
		<li>\
		<p>"+template.catB.label+"</p>\
		<p>\
		<select id='catBwarm' name='catBwarm'> \
		<option value='unselected' selected='selected'></option>\
		<option value='0 coldest feelings'></option>\
		<option value='1'></option>\
		<option value='2'></option>\
		<option value='3'></option>\
		<option value='4'></option>\
		<option value='5 neutral'></option>\
		<option value='6'></option>\
		<option value='7'></option>\
		<option value='8'></option>\
		<option value='9'></option>\
		<option value='10 warmest feelings'></option>\
		</select>\
		</p> \
		</li>\
		</ol>\
		");
}

function IsNumeric(input)
{
   return (input - 0) == input && input.length > 0;
}

// not currently used
function checkDemographics()
{
    gender = $("input[name=gender]:checked").val();
    age = $("#age option:selected").val();
    loc = $("#loc option:selected").val().replace(/[^A-Za-z0-9,]/g,' ');
    races = [];
	$("input[name=race]:checked").each(function() { races.push($(this).val()); });
    income = $("#income").val();
    education = $("#edu option:selected").val();
    
    // alert(income+"\n"+parseFloat(income)+"\n");
    // $.get('getLocation.php', 
    //         { 'q': loc},
    //         function(data) {
    //             alert(data);
    //         });
    
	// Do validation of input
    var error = false;
    var errmsg = "";
    
    if(gender==null)
    {
        error=true;
        errmsg += "<div class='error'>Please choose an option for gender</div>";
    }    
	if(age=="unselected")
    {
        error=true;
        errmsg += "<div class='error'>Please state the year you were born</div>";
    }
	if(loc.length == 0)
    {
        error=true;
        errmsg += "<div class='error'>Please indicate your current location</div>";
    }
    if(races==null)
    {
        error=true;
        errmsg += "<div class='error'>Please indicate your ethnicity</div>";
    }
    if(income==null || $.trim(income) != income.replace(/[^0-9$.,]/g,'') || !IsNumeric(income.replace(/[^0-9.]/g,'')))
    {
        error=true;
        errmsg += "<div class='error'>Please enter a valid number for income</div>";
    }
    if(education=="unselected")
    {
        error=true;
        errmsg += "<div class='error'>Please indicate your highest level of education</div>";
    }
	if(sub.length == 0)
    {
        error=true;
        errmsg += "<div class='error'>Please enter a valid identifier</div>";
    }
	// Output error message if input not valid
    if(error==false)
    {
		subject = sub;
        var demos = gender+'\t';
        demos += age+'\t';
        demos += loc+'\t';
        demos += races.join(',')+'\t';
        demos += income.replace(/[^0-9.]/g,'')+'\t';
        demos += education+'\n';
	    $.post("core/writeFile.php", { 'subject': subject, 'src': "survey", 'data': demos }, function() {location.href = 'instruct2.php?sub='+sub;});
    }
    else
    {
        $('#error-1').html(errmsg);
    }
}


// Converts the data for each session and round into a comma-delimited string
// and passes it to writeFile.php to be written by the server
function WriteFile()
{
	var subject = sub;
	subject = subject.length==0 ? "unknown" : subject;
	var str = "";
	for (i=0; i<roundArray.length; i++)
	{
		for (j=0;j<roundArray[i].length;j++)
		{
			str += i + "," + j + ",";
	        str += roundArray[i][j].category+",";
			str += roundArray[i][j].catIndex+",";
			str += roundArray[i][j].errors+",";
			str += (roundArray[i][j].endtime - roundArray[i][j].starttime)+"\n";
		}
	}
	
    $.post("core/fileManager.php", { 'op':'writeoutput', 'template':template.name, 
 			'subject': subject, 'data': str });	
	// notify user of success?
}

// This monitors for keyboard events
function keyHandler(kEvent)
{   
	// move from instructions to session on spacebar press
	var unicode;
	if (!kEvent) var kEvent = window.event;
	if (kEvent.keyCode) unicode = kEvent.keyCode;
	else if (kEvent.which) unicode = kEvent.which;
	if (currentState == "instruction" && unicode == 32)
    {
		currentState = "play";
		$('#exp_instruct').html('');
		displayItem();
    }
	// in session
	if (currentState == "play")
	{
		runSession(kEvent);
	}
}

// Get the stimulus for this session & round and display it
function displayItem()
{
	var tRound = roundArray[session][roundnum]; 
	tRound.starttime = new Date().getTime(); // the time the item was displayed
	if (tRound.itemtype == "img")
	{
		if (tRound.category == template.catA.datalabel)
			{ $("#"+template.catA.datalabel+tRound.catIndex).css("display","block"); }
		else if (tRound.category == template.catB.datalabel)
			{ $("#"+template.catB.datalabel+tRound.catIndex).css("display","block"); }
		else if (tRound.category == template.cat1.datalabel)
			{ $("#"+template.cat1.datalabel+tRound.catIndex).css("display","block"); }
		else if (tRound.category == template.cat2.datalabel)
			{ $("#"+template.cat2.datalabel+tRound.catIndex).css("display","block"); }
	}
	else if (tRound.itemtype == "txt")
	{
		if (tRound.category == template.catA.datalabel)
		{ 
			$("#word").html(openA+template.catA.items[tRound.catIndex]+closeA)
			$("#word").css("display","block"); 
		}
		else if (tRound.category == template.catB.datalabel)
		{ 
			$("#word").html(openA+template.catB.items[tRound.catIndex]+closeA)
			$("#word").css("display","block"); 
		}
		else if (tRound.category == template.cat1.datalabel)
		{ 
			$("#word").html(open1+template.cat1.items[tRound.catIndex]+close1)
			$("#word").css("display","block"); 
		}
		else if (tRound.category == template.cat2.datalabel)
		{ 
			$("#word").html(open1+template.cat2.items[tRound.catIndex]+close1)
			$("#word").css("display","block"); 
		}
	}
}

function runSession(kEvent)
{
	var rCorrect = roundArray[session][roundnum].correct;
	var unicode = kEvent.keyCode? kEvent.keyCode : kEvent.charCode;
	keyE = (unicode == 69 || unicode == 101 );
	keyI = (unicode == 73 || unicode == 105 );
	
	// if correct key (1 & E) or (2 & I)
	if ((rCorrect == 1 && keyE) || (rCorrect == 2 && keyI))
	{
		$("#wrong").css("display","none"); // remove X if it exists
		roundArray[session][roundnum].endtime = new Date().getTime(); // end time
		// if more rounds
		if (roundnum < roundArray[session].length-1)
		{
			roundnum++;
			$(".IATitem").css("display","none"); // hide all items
			displayItem(); // display chosen item
		}
		else
		{
    		$(".IATitem").css("display","none"); // hide all items
			currentState = "instruction"; // change state to instruction
			session++; // move to next session
			roundnum=0; // reset rounds to 0
		    instructionPage(); // show instruction page
		}
	}
	// incorrect key
	else if ((rCorrect == 1 && keyI) || (rCorrect == 2 && keyE))
	{
		$("#wrong").css("display","block"); // show X
		roundArray[session][roundnum].errors++; // note error
	}
}
