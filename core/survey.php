<?php 
require_once("IATname.inc"); 
require_once('locations.php');
?>
<html>
<head>
<title><?php echo $IATname; ?> IAT Survey</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css"> @import "core/css/iat.css";</style>	
<script type="text/javascript" src="core/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="core/js/IAT.js"></script>
</head>

<body>
    
<div id="surveylist">
	<form id="demographics">
		Please answer some questions about yourself:
        <ol id="demoglist">
            <li><p>Gender</p>
                <p> 
                    <input id="gender_male" name="gender" type="radio" value="Male"/>
                    <label for="gender_male">Male</label>
                <br>     
                    <input id="gender_female" name="gender" type="radio" value="Female"/>
                    <label for="gender_female">Female</label>
                <br>     
                    <input id="gender_none" name="gender" type="radio" value="none"/>
                    <label for="gender_none">Decline to answer</label>
                </p>
            </li>            
            <li><p><label for="age">Year of Birth</label></p>
                <span> 
                    <select id="age" name="age">
                        <option value="unselected" selected="selected"></option>
						<?php for ($i=99;$i>0;$i--) echo "<option value=".(112-$i).">" . (1900 + $i) . "</option>"; ?>
	 				</select>
                </span> 
            </li>         
            <li>
				<label for="loc">Current Location:&nbsp;</label>
    		    <select id="loc" name="loc">';
    				<?php foreach($Countries as $abbr => $country) echo "<option value='" . $abbr . "'>" . $country . "</option>"; ?>	    
    	    	</select>
            </li>         
            <li>
                <p>Ethnicity</p>
                <p>      
                    <input id="race_white" name="race" type="checkbox" value="White"/> 
                    <label for="race_white">White</label>
                <br>      
                    <input id="race_black" name="race" type="checkbox" value="Black"/> 
                    <label for="race_black">Black, African-American, or Negro</label>
                <br>    
                    <input id="race_latino" name="race" type="checkbox" value="Latino"/> 
                    <label for="race_latino">Hispanic or Latino</label>
                <br>
                    <input id="race_indian" name="race" type="checkbox" value="Indian"/> 
                    <label for="race_indian">Asian Indian</label>
                <br> 
                    <input id="race_asian" name="race" type="checkbox" value="Asian"/> 
                    <label for="race_asian">Other Asian</label>
                <br>
                    <input id="race_hawaii" name="race" type="checkbox" value="Hawaiian"/> 
                    <label for="race_hawaii">Hawaiian, Pacific Islander</label>
                <br> 
                    <input id="race_amind" name="race" type="checkbox" value="AmInd"/> 
                    <label for="race_amind">American Indian or Alaskan Native</label>
                <br> 
                    <input id="race_other" name="race" type="checkbox" value="Other"/> 
                    <label for="race_other">Other</label>
                </p>
            </li>         
            <li>
                <p> 
                    <label for="income">Annual Income (in US dollars; click <a href="http://finance.yahoo.com/currency-converter/?u#from=INR;to=USD;amt=1" target="_blank">here</a> for currency conversion)</label>        
                </p> 
                <p>
                    <input id="income" name="income" type="text"/> 
                </p> 
            </li>         
            <li>
                <p> 
                    <label for="edu">Highest education level attained</label>        
                </p> 
                <p>
                    <select id="edu" name="edu"> 
                        <option value="unselected" selected="selected"></option>
                        <option value="none">No schooling completed, or less than 1 year</option>
                        <option value="elem">Nursery, kindergarten, and elementary (grades 1-8)</option>
                        <option value="high">High school (grades 9-12, no degree)</option>
                        <option value="hs">High school graduate (or equivalent)</option>
                        <option value="college">Some college (1-4 years, no degree)</option>
                        <option value="as">Associate's degree (including occupational or academic degrees)</option>
                        <option value="bs">Bachelor's degree (BA, BS, AB, etc)</option>
                        <option value="ms">Master's degree (MA, MS, MENG, MSW, etc)</option>
                        <option value="md">Professional school degree (MD, DDC, JD, etc)</option>
                        <option value="phd">Doctorate degree (PhD, EdD, etc)</option>
                    </select>
                </p> 
            </li>
        </ol>
		<div id="error-1"></div>
		<div id="participant">
			<p>Enter your name, a pseudonym, or continue with the random identifier provided.</p>
			<p><input type="text" id="sub" name="sub" value="<?php echo base_convert(mt_rand(0x19A100, 0x39AA3FF), 10, 36); ?>"></p>
		</div>
        <input type="button" value="Submit Demographics" onclick="checkDemographics()"/>
    </form>
    
       
</div>
</body>