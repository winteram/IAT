<!doctype html>
<html>
<head>
<title>IAT Experimenter Page</title>	
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link type="text/css" href="core/css/overcast/jquery-ui-1.8.18.custom.css" rel="stylesheet" />
<link type="text/css" href="core/css/experimenter.css" rel="stylesheet" />	
<script type="text/javascript" src="core/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="core/js/jquery-ui-1.8.18.custom.min.js"></script>
<script type="text/javascript" src="core/js/jquery-cookie.js"></script>
<script type="text/javascript" src="core/js/experimenter.js"></script>
<script type="text/javascript"> 
	initExperimenter();
</script>
</head>

<body>
	<div id="alert-window"></div>
	<div class="exp-header ui-widget-header">
		<div class="exp-header-active-label">Active:</div>
		<div class="exp-header-active">None</div>
	</div>
	<div class='selector-frame'>
		<div class='selector-label ui-corner-top ui-widget-content'>Templates</div>
		<div class='active-selector ui-corner-tr ui-corner-bottom ui-widget-content'>
			<div class="template-item ui-corner-tr" id="create-new" name="create-new" onClick="loadCreateForm()">
				<span class="template-item-label">[New Template]</span>
			</div>
		</div>
		<div class='selector-button-list'>
			<input type="button" id="set-active" name="set-active" value="Set Active">
			<!-- <input type="button" id="view-stats" name="view-stats"onclick="viewStats()" value="View Statistics" disabled="disabled"> -->
		</div>
	</div>
	<div id="exp-content">
	</div>
</body>